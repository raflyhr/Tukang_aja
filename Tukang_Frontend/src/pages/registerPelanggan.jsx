import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import LeafletMapPicker from "../components/LeafletMapPicker";
import axios from "axios";

function RegisterPelanggan() {
  const navigate = useNavigate();
  const [locationData, setLocationData] = useState({
    address: "",
    latitude: "",
    longitude: "",
  });
  const [noteText, setNoteText] = useState("");
  const [activeStep, setActiveStep] = useState("profile");
  
  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Profile photo state
  const fileInputRef = useRef(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState("https://lh3.googleusercontent.com/aida-public/AB6AXuC3w7XxEdVxu6osAJ-BpwUvaF3Fu372z07yy2uEuD4Uo75uPr-tQkDt_K0IVvUSH_QfzkulP65j1Mqr14b9BKlSoIvjkiEPSTO1ij3FPKYEeCOrawwfiNXPfORxK2recIG-fF-d3de-LgVEuvl--mWx9Fc-07KZZiLAUi5DIED6NDMdR-aXGvSVlZv-MRFexssxva3OPlRexqaiMMRuHhRvfEXnv0SNrIf-NxTMDpZIX59SfTaRiuZataIrS8AsQXrt6pHKiKhLBgW6");


  // Toast states
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState(""); // "success" | "error"
  const [showToast, setShowToast] = useState(false);

  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const sections = ["profile", "address", "notes"];
    const observerCallback = (entries) => {
      if (isScrollingRef.current) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveStep(entry.target.id);
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -45% 0px",
      threshold: 0.15,
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const scrollToSection = (id) => {
    isScrollingRef.current = true;
    setActiveStep(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 850);
  };

  const steps = ["profile", "address", "notes"];

  const handleNext = () => {
    const currentIndex = steps.indexOf(activeStep);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      scrollToSection(nextStep);
    } else {
      navigate("/pelanggan/dashboard");
    }
  };

  const handleBack = () => {
    const currentIndex = steps.indexOf(activeStep);
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1];
      scrollToSection(prevStep);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Nama lengkap wajib diisi";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = "Alamat email wajib diisi";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Format email tidak valid";
    }

    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
    if (!phone) {
      newErrors.phone = "Nomor WhatsApp wajib diisi";
    } else if (!phoneRegex.test(phone)) {
      newErrors.phone = "Format nomor WhatsApp tidak valid (misal: 0812...)";
    }

    if (!password) {
      newErrors.password = "Kata sandi wajib diisi";
    } else if (password.length < 8) {
      newErrors.password = "Kata sandi minimal 8 karakter";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi kata sandi wajib diisi";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi kata sandi tidak cocok";
    }

    if (!locationData.address || !locationData.latitude || !locationData.longitude) {
      newErrors.address = "Alamat dan titik lokasi di peta wajib diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    setToastType("error");
    setToastMessage("Tolong lengkapi persyaratan terlebih dahulu.");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
    scrollToSection("profile");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("name", fullName);
    formData.append("no_hp", phone);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("password_confirmation", confirmPassword);
    formData.append("alamat", locationData.address);
    formData.append("latitude", locationData.latitude);
    formData.append("longitude", locationData.longitude);
    if (noteText) formData.append("catatan", noteText);
    if (profilePhoto) formData.append("foto_profil", profilePhoto);

    const response = await axios.post(
      "http://127.0.0.1:8000/api/auth/user/register",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    localStorage.setItem(
      "pelanggan_token",
      response.data.access_token
    );

    setToastType("success");
    setToastMessage(response.data.message);
    setShowToast(true);

    setTimeout(() => {
      navigate("/login");
    }, 2000);

  } catch (error) {
    setToastType("error");

    if (error.response) {
      setToastMessage(error.response.data.message);
    } else {
      setToastMessage("Tidak dapat terhubung ke server.");
    }

    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  }
};

  return (
    <div className="bg-background text-on-surface min-h-screen selection:bg-secondary/30 selection:text-secondary font-sans select-none custom-scrollbar relative">
      {/* Toast Notification Bar */}
      {showToast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3.5 rounded-2xl shadow-2xl transition-all duration-300 ${
          toastType === "success" 
            ? "bg-secondary text-on-secondary" 
            : "bg-red-500/10 border border-red-500/30 text-red-400 backdrop-blur-md"
        }`}>
          <span className="material-symbols-outlined">
            {toastType === "success" ? "check_circle" : "error"}
          </span>
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}
      {/* Top Navigation Bar (Shared Component Logic) */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-surface/80 backdrop-blur-xl border-b border-surface-variant/20 shadow-sm h-20 flex justify-between items-center px-margin-mobile md:px-margin-desktop">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-3 py-1.5 text-on-surface-variant hover:text-secondary hover:bg-surface-variant/50 transition-all rounded-lg text-sm font-semibold active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            <span className="hidden sm:inline">Kembali ke Beranda</span>
          </button>
          <span className="h-6 w-px bg-surface-variant/30 hidden sm:block"></span>
          <span
            onClick={() => navigate("/")}
            className="font-headline-md text-headline-md font-bold text-secondary cursor-pointer hover:opacity-90 transition-opacity"
          >
            TukangAja
          </span>
        </div>
        <div className="flex items-center gap-sm">
          <button
            onClick={() => navigate("/bantuan")}
            className="p-2 text-on-surface-variant hover:text-secondary transition-colors duration-200 active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined">help</span>
          </button>
          <button
            onClick={() => navigate("/notifikasi")}
            className="p-2 text-on-surface-variant hover:text-secondary transition-colors duration-200 active:scale-95 cursor-pointer relative"
          >
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full"></span>
          </button>
        </div>
      </header>

      <main className="min-h-screen pt-20 pb-32 flex flex-col md:flex-row">
        {/* Side Navigation (Stepper / SideNavBar Logic) */}
        <aside className="h-screen w-64 hidden md:flex flex-col fixed left-0 top-0 pt-24 pb-8 px-4 bg-surface-container dark:bg-surface-container border-r border-surface-variant/25">
          <div className="mb-8 px-4">
            <h2 className="font-headline-md text-headline-md font-bold text-secondary">
              Registrasi
            </h2>
            <p className="font-label-md text-label-md text-on-surface-variant">
              Lengkapi profil Anda
            </p>
          </div>
          <nav className="flex flex-col gap-2">
            {/* Step 1: Profil & Data Diri */}
            <div
              onClick={() => scrollToSection("profile")}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg active:opacity-80 transition-all cursor-pointer ${
                activeStep === "profile"
                  ? "text-secondary font-bold bg-surface-container-highest"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50"
              }`}
            >
              <span className="material-symbols-outlined">person</span>
              <span className="font-label-md text-label-md">Data Diri</span>
            </div>

            {/* Step 2: Alamat & Lokasi */}
            <div
              onClick={() => scrollToSection("address")}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg active:opacity-80 transition-all cursor-pointer ${
                activeStep === "address"
                  ? "text-secondary font-bold bg-surface-container-highest"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50"
              }`}
            >
              <span className="material-symbols-outlined">location_on</span>
              <span className="font-label-md text-label-md">
                Alamat & Lokasi
              </span>
            </div>

            {/* Step 3: Catatan Tambahan */}
            <div
              onClick={() => scrollToSection("notes")}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg active:opacity-80 transition-all cursor-pointer ${
                activeStep === "notes"
                  ? "text-secondary font-bold bg-surface-container-highest"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50"
              }`}
            >
              <span className="material-symbols-outlined">description</span>
              <span className="font-label-md text-label-md">
                Catatan Tambahan
              </span>
            </div>
          </nav>
        </aside>

        {/* Content Canvas */}
        <div className="flex-1 md:pl-64 flex flex-col w-full min-w-0">
          <main className="px-margin-mobile md:px-margin-desktop py-lg max-w-5xl mx-auto w-full">
            {/* Mobile Stepper Indicator */}
            <div className="md:hidden flex items-center justify-between mb-8 bg-surface-container rounded-xl p-4 border border-surface-variant/20">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${activeStep === "profile" ? "bg-secondary w-6" : "bg-on-surface-variant/30"} transition-all duration-300`}
                ></div>
                <div
                  className={`w-2 h-2 rounded-full ${activeStep === "address" ? "bg-secondary w-6" : "bg-on-surface-variant/30"} transition-all duration-300`}
                ></div>
                <div
                  className={`w-2 h-2 rounded-full ${activeStep === "notes" ? "bg-secondary w-6" : "bg-on-surface-variant/30"} transition-all duration-300`}
                ></div>
              </div>
              <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">
                {activeStep === "profile" && "Langkah 1: Data Diri"}
                {activeStep === "address" && "Langkah 2: Alamat & Lokasi"}
                {activeStep === "notes" && "Langkah 3: Catatan Tambahan"}
              </span>
            </div>

            <div className="mb-lg">
              <h1 className="font-headline-xl-mobile md:font-headline-xl text-headline-xl-mobile md:text-headline-xl text-on-background mb-base">
                Detail Profil Pelanggan
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                Lengkapi informasi berikut untuk memudahkan para tukang
                profesional kami mengenali Anda dan memberikan layanan terbaik.
              </p>
            </div>

            {/* Registration Form Area */}
            <form className="space-y-xl" onSubmit={handleSubmit}>
              {/* Section 1: Profil & Data Diri */}
              <section
                id="profile"
                className="scroll-mt-24 bg-surface-container rounded-xl p-md md:p-lg border border-surface-variant/20 shadow-lg space-y-gutter"
              >
                <div className="flex items-center gap-3 mb-base border-b border-surface-variant/10 pb-4">
                  <span className="material-symbols-outlined text-secondary">
                    person
                  </span>
                  <h3 className="font-headline-md text-headline-md text-on-surface font-bold text-lg">
                    Informasi Pribadi
                  </h3>
                </div>

                {/* Profile Picture Upload (High-end Card) */}
                <div className="bg-surface-container-high rounded-xl p-md flex flex-col md:flex-row items-center gap-md border border-surface-variant/15 shadow-sm">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/jpeg, image/png, image/jpg"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            alert("Ukuran foto maksimal 2MB untuk menghindari error server.");
                            return;
                          }
                          setProfilePhoto(file);
                          setPreviewPhoto(URL.createObjectURL(file));
                        }
                      }}
                    />
                    <div className="w-32 h-32 rounded-full border-4 border-surface-container-highest bg-surface-variant overflow-hidden flex items-center justify-center transition-all group-hover:border-secondary">
                      <img
                        className="w-full h-full object-cover"
                        alt="Profile Avatar"
                        src={previewPhoto}
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-white">
                          photo_camera
                        </span>
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-secondary text-on-secondary p-1.5 rounded-full shadow-lg">
                      <span className="material-symbols-outlined text-sm">
                        add_a_photo
                      </span>
                    </div>
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-xs font-semibold">
                      Foto Profil
                    </h3>
                    <p className="font-label-md text-label-md text-on-surface-variant text-sm">
                      Gunakan foto asli agar tukang merasa lebih aman. Max 5MB
                      (JPG/PNG).
                    </p>
                  </div>
                </div>

                {/* Input Fields Group */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                  {/* Full Name */}
                  <div className="space-y-base focus-within:scale-[1.01] transition-transform duration-200">
                    <label className="font-label-md text-label-md text-on-surface-variant ml-1">
                      Nama Lengkap
                    </label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">
                        person
                      </span>
                      <input
                        className="w-full bg-surface-container-high border border-outline-variant rounded-xl py-4 pl-12 pr-4 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/40 transition-all focus:ring-0 focus:border-secondary outline-none"
                        placeholder="Masukkan nama sesuai KTP"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    {errors.fullName && (
                      <span className="text-xs text-red-500 px-1 mt-0.5 block">
                        {errors.fullName}
                      </span>
                    )}
                  </div>

                  {/* WhatsApp Number */}
                  <div className="space-y-base focus-within:scale-[1.01] transition-transform duration-200">
                    <label className="font-label-md text-label-md text-on-surface-variant ml-1">
                      Nomor WhatsApp
                    </label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">
                        call
                      </span>
                      <input
                        className="w-full bg-surface-container-high border border-outline-variant rounded-xl py-4 pl-12 pr-4 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/40 transition-all focus:ring-0 focus:border-secondary outline-none"
                        placeholder="0812-xxxx-xxxx"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    {errors.phone && (
                      <span className="text-xs text-red-500 px-1 mt-0.5 block">
                        {errors.phone}
                      </span>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-base focus-within:scale-[1.01] transition-transform duration-200">
                    <label className="font-label-md text-label-md text-on-surface-variant ml-1">
                      Alamat Email
                    </label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">
                        mail
                      </span>
                      <input
                        className="w-full bg-surface-container-high border border-outline-variant rounded-xl py-4 pl-12 pr-4 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/40 transition-all focus:ring-0 focus:border-secondary outline-none"
                        placeholder="contoh@email.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    {errors.email && (
                      <span className="text-xs text-red-500 px-1 mt-0.5 block">
                        {errors.email}
                      </span>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-base focus-within:scale-[1.01] transition-transform duration-200">
                    <label className="font-label-md text-label-md text-on-surface-variant ml-1">
                      Kata Sandi (Password)
                    </label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">
                        lock
                      </span>
                      <input
                        className="w-full bg-surface-container-high border border-outline-variant rounded-xl py-4 pl-12 pr-12 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/40 transition-all focus:ring-0 focus:border-secondary outline-none"
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer bg-transparent border-none"
                      >
                        <span className="material-symbols-outlined text-lg">
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                    {errors.password && (
                      <span className="text-xs text-red-500 px-1 mt-0.5 block">
                        {errors.password}
                      </span>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-base focus-within:scale-[1.01] transition-transform duration-200">
                    <label className="font-label-md text-label-md text-on-surface-variant ml-1">
                      Konfirmasi Kata Sandi
                    </label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">
                        lock
                      </span>
                      <input
                        className="w-full bg-surface-container-high border border-outline-variant rounded-xl py-4 pl-12 pr-12 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/40 transition-all focus:ring-0 focus:border-secondary outline-none"
                        placeholder="••••••••"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer bg-transparent border-none"
                      >
                        <span className="material-symbols-outlined text-lg">
                          {showConfirmPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <span className="text-xs text-red-500 px-1 mt-0.5 block">
                        {errors.confirmPassword}
                      </span>
                    )}
                  </div>
                </div>
              </section>

              {/* Section 2: Alamat & Lokasi */}
              <section
                id="address"
                className="scroll-mt-24 bg-surface-container rounded-xl p-md md:p-lg border border-surface-variant/20 shadow-lg space-y-gutter"
              >
                <div className="flex items-center gap-3 mb-base border-b border-surface-variant/10 pb-4">
                  <span className="material-symbols-outlined text-secondary">
                    location_on
                  </span>
                  <h3 className="font-headline-md text-headline-md text-on-surface font-bold text-lg">
                    Alamat & Lokasi
                  </h3>
                </div>

                <div className="space-y-base focus-within:scale-[1.01] transition-transform duration-200">
                  <label className="font-label-md text-label-md text-on-surface-variant ml-1">
                    Alamat Domisili
                  </label>
                  <LeafletMapPicker
                    onLocationChange={(location) => {
                      setLocationData(location);
                      console.log("Customer Location Change:", location);
                    }}
                  />
                  <div className="mt-3 rounded-lg bg-surface-container-high p-3 border border-outline-variant font-sans">
                    <p className="text-sm">
                      <strong>Alamat:</strong>
                      <br />
                      {locationData.address || "-"}
                    </p>

                    <p className="text-sm mt-2">
                      <strong>Latitude:</strong>{" "}
                      {locationData.latitude || "-"}
                    </p>

                    <p className="text-sm">
                      <strong>Longitude:</strong>{" "}
                      {locationData.longitude || "-"}
                    </p>
                  </div>
                  {errors.address && (
                    <span className="text-xs text-red-500 px-1 mt-1 block font-semibold">
                      {errors.address}
                    </span>
                  )}
                </div>
              </section>

              {/* Section 3: Catatan Tambahan */}
              <section
                id="notes"
                className="scroll-mt-24 bg-surface-container rounded-xl p-md md:p-lg border border-surface-variant/20 shadow-lg space-y-gutter"
              >
                <div className="flex items-center gap-3 mb-base border-b border-surface-variant/10 pb-4">
                  <span className="material-symbols-outlined text-secondary">
                    description
                  </span>
                  <h3 className="font-headline-md text-headline-md text-on-surface font-bold text-lg">
                    Catatan Tambahan
                  </h3>
                </div>

                <div className="space-y-base focus-within:scale-[1.01] transition-transform duration-200">
                  <label className="font-label-md text-label-md text-on-surface-variant ml-1">
                    Catatan Tambahan (Lantai/No. Rumah)
                  </label>
                  <textarea
                    className="w-full bg-surface-container-high border border-outline-variant rounded-xl p-4 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/40 transition-all focus:ring-0 focus:border-secondary resize-none outline-none"
                    placeholder="Contoh: Lantai 3, Apartemen Gading, atau patokan warna pagar..."
                    rows={2}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                  ></textarea>
                  <div className="flex justify-between mt-1 px-1">
                    <span className="text-label-sm text-on-surface-variant/60"></span>
                    <span
                      className={`text-label-sm ${
                        noteText.length > 200
                          ? "text-error font-bold"
                          : "text-on-surface-variant/50"
                      }`}
                    >
                      {noteText.length} / 200 karakter
                    </span>
                  </div>
                </div>
              </section>

              {/* Desktop Action Buttons */}
              <div className="hidden md:flex items-center justify-between pt-md">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-3 font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors active:scale-95 cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">
                    arrow_back
                  </span>
                  Kembali
                </button>
                <div className="flex gap-4">
                  <button
                    className="px-8 py-3 font-label-md text-label-md border border-outline-variant rounded-xl text-on-surface-variant hover:bg-surface-variant transition-all active:scale-95 cursor-pointer"
                    type="button"
                  >
                    Simpan Draft
                  </button>
                  <button
                    className="px-10 py-3 font-label-md text-label-md bg-secondary text-on-secondary rounded-xl font-bold shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                    type="submit"
                  >
                    Lanjut ke Verifikasi
                  </button>
                </div>
              </div>

              {/* Sudah punya akun? Masuk */}
              <div className="text-center mt-8 pb-4">
                <p className="text-sm text-on-surface-variant font-medium flex items-center justify-center gap-1.5">
                  Sudah punya akun?
                  <Link
                    className="text-secondary font-bold hover:underline transition-all text-sm"
                    to="/login"
                  >
                    Masuk
                  </Link>
                </p>
              </div>
            </form>
          </main>
        </div>
      </main>

      {/* Bottom Navigation Bar (Shared Component - Mobile Only) */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center p-4 bg-surface-container-highest/90 dark:bg-surface-container-highest/90 backdrop-blur-lg shadow-lg md:hidden z-50 rounded-t-xl border-t border-surface-variant/20">
        <button
          onClick={handleBack}
          className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:bg-surface-variant active:scale-90 transition-all duration-150 rounded-lg cursor-pointer"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="font-label-sm text-label-sm">Kembali</span>
        </button>
        <button className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:bg-surface-variant active:scale-90 transition-all duration-150 rounded-lg cursor-pointer">
          <span className="material-symbols-outlined">save</span>
          <span className="font-label-sm text-label-sm">Simpan Draft</span>
        </button>
        <button
          onClick={handleNext}
          className="flex flex-col items-center justify-center bg-secondary text-on-secondary rounded-xl px-6 py-2 active:scale-90 transition-all duration-150 shadow-md cursor-pointer"
        >
          <span className="material-symbols-outlined">arrow_forward</span>
          <span className="font-label-sm text-label-sm font-bold">Lanjut</span>
        </button>
      </nav>

      {/* Background Decorative Element (Subtle Glassmorphism Glow) */}
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
    </div>
  );
}

export default RegisterPelanggan;
