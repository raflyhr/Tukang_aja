import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LeafletMapPicker from "../components/LeafletMapPicker";
import ImageCropModal from "../components/ImageCropModal";

const AVAILABLE_SKILLS = [
  "Anti Bocor",
  "Instalasi Pipa",
  "Instalasi Listrik Rumah",
  "Pasang AC Baru",
  "Pembersihan Karpet",
  "Pengecatan Dekoratif",
  "Restorasi Kayu",
  "Las Konstruksi",
  "Pasang Keramik Dinding",
  "Perawatan Taman",
  "Perbaikan Pompa Air",
  "Pemasangan Baja Ringan",
  "Lainnya"
];

function RegisterTukang() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState("profile");
  
  // Toast notification state
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState(""); // "success" | "error"
  const [showToast, setShowToast] = useState(false);
  
  // Personal Info State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile Photo State
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState("");
  const [profilePhotoDetails, setProfilePhotoDetails] = useState({ name: "", size: "" });
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState("");
  const [tempProfileFile, setTempProfileFile] = useState(null);

  // Address
  const [locationData, setLocationData] = useState({
    address: "",
    latitude: "",
    longitude: "",
  });

  // Keahlian State
  const [mainCategory, setMainCategory] = useState("Pilih kategori");
  const [additionalSkills, setAdditionalSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState("");
  const [yearsExp, setYearsExp] = useState("");
  const [jobDesc, setJobDesc] = useState("");

  // Documents State
  const [ktpFile, setKtpFile] = useState(null);
  const [ktpPreview, setKtpPreview] = useState("");
  const [ktpDetails, setKtpDetails] = useState({ name: "", size: "" });

  const [portfolioFile, setPortfolioFile] = useState(null);
  const [portfolioPreview, setPortfolioPreview] = useState("");
  const [portfolioDetails, setPortfolioDetails] = useState({ name: "", size: "" });

  // Work Radius State
  const [workRadius, setWorkRadius] = useState("5 km");

  // Consent State
  const [consentCorrect, setConsentCorrect] = useState(false);
  const [consentTerms, setConsentTerms] = useState(false);

  // Submission & Validation States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const profileInputRef = useRef(null);
  const ktpInputRef = useRef(null);
  const portfolioInputRef = useRef(null);

  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  // File Upload Handlers
  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedExtensions = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedExtensions.includes(file.type)) {
      setErrors(prev => ({ ...prev, profilePhoto: "Format file harus JPG, JPEG, atau PNG" }));
      return;
    }

    setErrors(prev => ({ ...prev, profilePhoto: null }));
    setTempProfileFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setCropImageSrc(reader.result);
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmProfileCrop = ({ file, dataUrl }) => {
    setProfilePhoto(file);
    setProfilePhotoPreview(dataUrl);
    setProfilePhotoDetails({
      name: tempProfileFile ? tempProfileFile.name : "profile.jpg",
      size: (file.size / 1024 / 1024).toFixed(2) + " MB"
    });
    setIsCropModalOpen(false);
  };

  const handleKtpFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setErrors(prev => ({ ...prev, ktpFile: "Format KTP wajib PDF" }));
      return;
    }
    setErrors(prev => ({ ...prev, ktpFile: null }));

    setKtpFile(file);
    setKtpDetails({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + " KB"
    });
    setKtpPreview("");
  };

  const handlePortfolioFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setErrors(prev => ({ ...prev, portfolioFile: "Format CV/Portofolio wajib PDF" }));
      return;
    }
    setErrors(prev => ({ ...prev, portfolioFile: null }));

    setPortfolioFile(file);
    setPortfolioDetails({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + " KB"
    });
    setPortfolioPreview("");
  };

  const handleToggleSkill = (skill) => {
    if (additionalSkills.includes(skill)) {
      setAdditionalSkills(additionalSkills.filter(s => s !== skill));
    } else {
      setAdditionalSkills([...additionalSkills, skill]);
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
      newErrors.phone = "Nomor telepon wajib diisi";
    } else if (!phoneRegex.test(phone)) {
      newErrors.phone = "Format nomor telepon Indonesia tidak valid (misal: +62812... atau 0812...)";
    }

    if (!password) {
      newErrors.password = "Kata sandi wajib diisi";
    } else if (password.length < 8) {
      newErrors.password = "Kata sandi minimal 8 karakter";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi kata sandi wajib diisi";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Kata sandi dan konfirmasi kata sandi tidak cocok";
    }

    if (mainCategory === "Pilih kategori") {
      newErrors.mainCategory = "Kategori utama wajib dipilih";
    }

    if (additionalSkills.length === 0) {
      newErrors.additionalSkills = "Pilih minimal 1 keahlian tambahan";
    }

    if (additionalSkills.includes("Lainnya") && !customSkill.trim()) {
      newErrors.customSkill = "Harap sebutkan keahlian lainnya yang Anda miliki";
    }

    if (yearsExp === "") {
      newErrors.yearsExp = "Tahun pengalaman wajib diisi";
    } else if (Number(yearsExp) < 0) {
      newErrors.yearsExp = "Tahun pengalaman tidak boleh kurang dari 0";
    }

    if (!jobDesc.trim()) {
      newErrors.jobDesc = "Deskripsi pekerjaan wajib diisi";
    }

    if (!profilePhoto) {
      newErrors.profilePhoto = "Foto profil wajib diunggah";
    }

    if (!ktpFile) {
      newErrors.ktpFile = "Foto KTP wajib diunggah";
    }

    if (!portfolioFile) {
      newErrors.portfolioFile = "CV/Portofolio wajib diunggah";
    }

    if (!locationData.address || !locationData.latitude || !locationData.longitude) {
      newErrors.address = "Alamat dan titik lokasi di peta wajib diisi";
    }

    if (!consentCorrect) {
      newErrors.consentCorrect = "Anda harus menyetujui pernyataan kebenaran data";
    }
    if (!consentTerms) {
      newErrors.consentTerms = "Anda harus menyetujui Syarat & Ketentuan";
    }

    setErrors(newErrors);
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateForm();
    if (!validation.isValid) {
      setToastType("error");
      setToastMessage("Tolong lengkapi persyaratan terlebih dahulu.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      
      // Scroll to Section 1
      scrollToSection("profile");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("name", fullName);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("password_confirmation", confirmPassword);
      formData.append("no_hp", phone);
      formData.append("alamat", locationData.address || "");
      formData.append("latitude", locationData.latitude || "");
      formData.append("longitude", locationData.longitude || "");
      formData.append("keahlian", mainCategory);
      const finalSkills = additionalSkills.map(skill => 
        skill === "Lainnya" ? (customSkill.trim() || "Lainnya") : skill
      );
      formData.append("keahlian_tambahan", finalSkills.join(", "));
      formData.append("tahun_pengalaman", yearsExp);
      formData.append("deskripsi_pengalaman", jobDesc);
      
      if (profilePhoto) formData.append("foto_profil", profilePhoto);
      if (ktpFile) formData.append("foto_ktp", ktpFile);
      if (portfolioFile) formData.append("cv_portofolio", portfolioFile);

      const response = await axios.post("http://localhost:8000/api/auth/tukang/register", formData, {
        headers: {
          "Accept": "application/json",
          "Content-Type": "multipart/form-data"
        }
      });

      console.log("Success:", response.data);
      setToastType("success");
      setToastMessage("Registrasi Tukang Berhasil! Silakan masuk (login).");
      setShowToast(true);
      setIsSubmitting(false);
      
      setTimeout(() => {
        setShowToast(false);
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Registration Error:", error);
      setIsSubmitting(false);
      setToastType("error");
      if (error.response && error.response.data && error.response.data.errors) {
        setToastMessage("Gagal registrasi: Cek kembali data Anda.");
      } else {
        setToastMessage("Terjadi kesalahan saat menghubungi server.");
      }
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const sections = ["profile", "services", "experience", "documents", "verification"];
    const observerCallback = (entries) => {
      if (isScrollingRef.current) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id === "experience") {
            setActiveStep("services");
          } else {
            setActiveStep(id);
          }
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
    let tabName = id;
    if (id === "experience") {
      tabName = "services";
    }
    setActiveStep(tabName);
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

  const steps = ["profile", "services", "documents", "verification"];

  const handleNext = () => {
    const currentIndex = steps.indexOf(activeStep);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      scrollToSection(nextStep);
    }
  };

  const handleBack = () => {
    const currentIndex = steps.indexOf(activeStep);
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1];
      scrollToSection(prevStep);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col font-sans select-none custom-scrollbar relative">
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

      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-surface/80 backdrop-blur-xl border-b border-surface-variant/20 shadow-sm h-20 flex justify-between items-center px-margin-mobile md:px-margin-desktop">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-3 py-1.5 text-on-surface-variant hover:text-secondary hover:bg-surface-variant/50 transition-all rounded-lg text-sm font-semibold active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">
              arrow_back
            </span>
            <span className="hidden sm:inline">Kembali ke Beranda</span>
          </button>
          <span className="h-6 w-px bg-surface-variant/30 hidden sm:block"></span>
          <span
            onClick={() => navigate("/")}
            className="font-headline-md text-headline-md font-bold text-secondary dark:text-secondary cursor-pointer hover:opacity-90 transition-opacity"
          >
            TukangAja
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span
            onClick={() => navigate("/bantuan")}
            className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-secondary transition-colors"
            data-icon="help"
          >
            help
          </span>
          <span
            onClick={() => navigate("/notifikasi")}
            className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-secondary transition-colors relative"
            data-icon="notifications"
          >
            notifications
            <span className="absolute top-0 right-0 w-2 h-2 bg-secondary rounded-full"></span>
          </span>
        </div>
      </header>

      <div className="flex pt-20 min-h-screen">
        {/* SideNavBar / Stepper */}
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
            {/* Profile Step */}
            <div
              onClick={() => scrollToSection("profile")}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg active:opacity-80 transition-all cursor-pointer ${
                activeStep === "profile"
                  ? "text-secondary font-bold bg-surface-container-highest"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50"
              }`}
            >
              <span className="material-symbols-outlined" data-icon="person">
                person
              </span>
              <span className="font-label-md text-label-md">Profil</span>
            </div>

            {/* Services Step */}
            <div
              onClick={() => scrollToSection("services")}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg active:opacity-80 transition-all cursor-pointer ${
                activeStep === "services"
                  ? "text-secondary font-bold bg-surface-container-highest"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50"
              }`}
            >
              <span
                className="material-symbols-outlined"
                data-icon="construction"
              >
                construction
              </span>
              <span className="font-label-md text-label-md">Layanan</span>
            </div>

            {/* Documents & Verification Step */}
            <div
              onClick={() => scrollToSection("documents")}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg active:opacity-80 transition-all cursor-pointer ${
                activeStep === "documents" || activeStep === "verification"
                  ? "text-secondary font-bold bg-surface-container-highest"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50"
              }`}
            >
              <span
                className="material-symbols-outlined"
                data-icon="description"
              >
                description
              </span>
              <span className="font-label-md text-label-md">
                Dokumen & Verifikasi
              </span>
            </div>
          </nav>
        </aside>

        {/* Main Content Canvas Wrapper */}
        <div className="flex-1 md:pl-64 flex flex-col w-full min-w-0">
          <main className="px-margin-mobile md:px-margin-desktop py-lg max-w-5xl mx-auto w-full">
            <div className="mb-xl">
              <h1 className="font-headline-xl text-headline-xl text-on-surface mb-2 font-bold text-2xl">
                Registrasi Tukang Profesional
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Bergabunglah dengan jaringan tukang elit kami. Masukkan data
                Anda dengan benar untuk melewati proses verifikasi.
              </p>
            </div>

            <form className="space-y-xl" onSubmit={handleSubmit}>
              {/* Section 1: Personal Info */}
              <section
                id="profile"
                className="scroll-mt-24 bg-surface-container rounded-xl p-md md:p-lg border border-surface-variant/20 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-gutter">
                  <span
                    className="material-symbols-outlined text-secondary"
                    data-icon="person"
                  >
                    person
                  </span>
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    Informasi Pribadi
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
                  {/* Photo Upload */}
                  <div
                    onClick={() => profileInputRef.current.click()}
                    className="md:col-span-4 flex flex-col items-center justify-center border-2 border-dashed border-outline-variant rounded-xl p-md bg-surface-container-low hover:border-secondary transition-colors cursor-pointer group"
                  >
                    <input
                      ref={profileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleProfilePhotoChange}
                      className="hidden"
                    />
                    <div className="w-32 h-32 rounded-full bg-surface-variant flex items-center justify-center mb-sm overflow-hidden border-4 border-surface-container-high relative">
                      {profilePhotoPreview ? (
                        <img
                          src={profilePhotoPreview}
                          alt="Preview Foto Profil"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span
                          className="material-symbols-outlined text-4xl text-on-surface-variant group-hover:text-secondary"
                          data-icon="add_a_photo"
                        >
                          add_a_photo
                        </span>
                      )}
                    </div>
                    {profilePhotoDetails.name ? (
                      <div className="text-center">
                        <p className="font-label-md text-xs text-on-surface font-semibold truncate max-w-[180px]">
                          {profilePhotoDetails.name}
                        </p>
                        <p className="text-[10px] text-on-surface-variant">
                          {profilePhotoDetails.size}
                        </p>
                        <span className="mt-1 inline-block text-xs font-bold text-secondary hover:underline">
                          Ganti Foto
                        </span>
                      </div>
                    ) : (
                      <span className="font-label-md text-label-md text-on-surface-variant text-center">
                        Unggah Foto Profil
                        <span className="block text-[10px] opacity-70 mt-0.5">
                          Format: JPG, JPEG, PNG
                        </span>
                      </span>
                    )}
                    {errors.profilePhoto && (
                      <span className="text-xs text-red-500 mt-1 text-center font-semibold">
                        {errors.profilePhoto}
                      </span>
                    )}
                  </div>
                  {/* Inputs */}
                  <div className="md:col-span-8 space-y-gutter">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                      <div className="flex flex-col gap-xs focus-within:scale-[1.01] transition-transform duration-200">
                        <label className="font-label-md text-label-md text-on-surface-variant px-1">
                          Nama Lengkap
                        </label>
                        <input
                          className="bg-surface-container-high border border-outline-variant text-on-surface rounded-lg px-md py-sm font-body-md text-body-md transition-all focus:border-secondary focus:ring-1 focus:ring-secondary/50 outline-none"
                          placeholder="misal Budi Santoso"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                        {errors.fullName && (
                          <span className="text-xs text-red-500 px-1 mt-0.5">
                            {errors.fullName}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-xs focus-within:scale-[1.01] transition-transform duration-200">
                        <label className="font-label-md text-label-md text-on-surface-variant px-1">
                          Alamat Email
                        </label>
                        <input
                          className="bg-surface-container-high border border-outline-variant text-on-surface rounded-lg px-md py-sm font-body-md text-body-md transition-all focus:border-secondary focus:ring-1 focus:ring-secondary/50 outline-none"
                          placeholder="budi@email.com"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        {errors.email && (
                          <span className="text-xs text-red-500 px-1 mt-0.5">
                            {errors.email}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-xs focus-within:scale-[1.01] transition-transform duration-200">
                        <label className="font-label-md text-label-md text-on-surface-variant px-1">
                          Nomor Telepon
                        </label>
                        <input
                          className="bg-surface-container-high border border-outline-variant text-on-surface rounded-lg px-md py-sm font-body-md text-body-md transition-all focus:border-secondary focus:ring-1 focus:ring-secondary/50 outline-none"
                          placeholder="+62 812..."
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                        {errors.phone && (
                          <span className="text-xs text-red-500 px-1 mt-0.5">
                            {errors.phone}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-xs focus-within:scale-[1.01] transition-transform duration-200">
                        <label className="font-label-md text-label-md text-on-surface-variant px-1">
                          Kata Sandi (Password)
                        </label>
                        <div className="relative">
                          <input
                            className="w-full bg-surface-container-high border border-outline-variant text-on-surface rounded-lg px-md pr-10 py-sm font-body-md text-body-md transition-all focus:border-secondary focus:ring-1 focus:ring-secondary/50 outline-none"
                            placeholder="••••••••"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer bg-transparent border-none flex items-center justify-center"
                          >
                            <span className="material-symbols-outlined text-lg">
                              {showPassword ? "visibility_off" : "visibility"}
                            </span>
                          </button>
                        </div>
                        {errors.password && (
                          <span className="text-xs text-red-500 px-1 mt-0.5">
                            {errors.password}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-xs focus-within:scale-[1.01] transition-transform duration-200">
                        <label className="font-label-md text-label-md text-on-surface-variant px-1">
                          Konfirmasi Kata Sandi
                        </label>
                        <div className="relative">
                          <input
                            className="w-full bg-surface-container-high border border-outline-variant text-on-surface rounded-lg px-md pr-10 py-sm font-body-md text-body-md transition-all focus:border-secondary focus:ring-1 focus:ring-secondary/50 outline-none"
                            placeholder="••••••••"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer bg-transparent border-none flex items-center justify-center"
                          >
                            <span className="material-symbols-outlined text-lg">
                              {showConfirmPassword
                                ? "visibility_off"
                                : "visibility"}
                            </span>
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <span className="text-xs text-red-500 px-1 mt-0.5">
                            {errors.confirmPassword}
                          </span>
                        )}
                      </div>
                      <div className="md:col-span-2 flex flex-col gap-xs focus-within:scale-[1.01] transition-transform duration-200">
                        <label className="font-label-md text-label-md text-on-surface-variant px-1">
                          Alamat Domisili
                        </label>
                        <div className="relative">
                          <LeafletMapPicker 
                            onLocationChange={(data) => {
                              setLocationData({
                                address: data.address,
                                latitude: data.latitude,
                                longitude: data.longitude
                              });
                              setErrors(prev => ({ ...prev, address: null }));
                            }}
                          />
                          <div className="mt-3 rounded-lg bg-surface-container-high p-3 border border-outline-variant">
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
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2: Expertise */}
              <section
                id="services"
                className="scroll-mt-24 bg-surface-container rounded-xl p-md md:p-lg border border-surface-variant/20 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-gutter">
                  <span
                    className="material-symbols-outlined text-secondary"
                    data-icon="construction"
                  >
                    construction
                  </span>
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    Keahlian Layanan
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                  <div className="flex flex-col gap-xs focus-within:scale-[1.01] transition-transform duration-200">
                    <label className="font-label-md text-label-md text-on-surface-variant px-1">
                      Kategori Keahlian Utama
                    </label>
                    <select
                      value={mainCategory}
                      onChange={(e) => setMainCategory(e.target.value)}
                      className="bg-surface-container-high border border-outline-variant text-on-surface rounded-lg px-md py-sm font-body-md text-body-md appearance-none cursor-pointer outline-none focus:border-secondary"
                    >
                      <option>Pilih kategori</option>
                      <option>Plumbing (Pipa & Kran)</option>
                      <option>Electrical (Kelistrikan)</option>
                      <option>Masonry (Tukang Bangunan)</option>
                      <option>AC Specialist (Pendingin)</option>
                      <option>Painting (Pengecatan)</option>
                      <option>Carpentry (Kayu)</option>
                      <option>Atap Rumah</option>
                      <option>Keramik</option>
                      <option>Pengelasan (Las)</option>
                      <option>Cleaning Service</option>
                      <option>Taman</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-xs focus-within:scale-[1.01] transition-transform duration-200">
                    <label className="font-label-md text-label-md text-on-surface-variant px-1">
                      Radius Jangkauan Kerja
                    </label>
                    <select
                      value={workRadius}
                      onChange={(e) => setWorkRadius(e.target.value)}
                      className="bg-surface-container-high border border-outline-variant text-on-surface rounded-lg px-md py-sm font-body-md text-body-md appearance-none cursor-pointer outline-none focus:border-secondary"
                    >
                      <option value="5 km">5 km</option>
                      <option value="10 km">10 km</option>
                      <option value="15 km">15 km</option>
                      <option value="20 km">20 km</option>
                      <option value="25 km">25 km</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-xs md:col-span-2 mt-2">
                    <label className="font-label-md text-label-md text-on-surface-variant px-1 mb-1">
                      Keahlian Tambahan (Pilih beberapa)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_SKILLS.map((skill) => {
                        const isSelected = additionalSkills.includes(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => handleToggleSkill(skill)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? "bg-secondary text-on-secondary border-secondary shadow-md scale-95"
                                : "bg-surface-container-high text-on-surface-variant border-outline-variant hover:border-secondary hover:bg-surface-variant/20"
                            }`}
                          >
                            {isSelected && (
                              <span className="material-symbols-outlined text-xs">
                                check
                              </span>
                            )}
                            {skill}
                          </button>
                        );
                      })}
                    </div>

                    {additionalSkills.includes("Lainnya") && (
                      <div className="mt-4 flex flex-col gap-xs focus-within:scale-[1.01] transition-transform duration-200 w-full">
                        <label className="font-label-md text-label-md text-on-surface-variant px-1">
                          Sebutkan Keahlian Lainnya
                        </label>
                        <input
                          type="text"
                          className="bg-surface-container-high border border-outline-variant text-on-surface rounded-lg px-md py-sm font-body-md text-body-md transition-all focus:border-secondary focus:ring-1 focus:ring-secondary/50 outline-none"
                          placeholder="Masukkan keahlian lainnya..."
                          value={customSkill}
                          onChange={(e) => setCustomSkill(e.target.value)}
                        />
                        {errors.customSkill && (
                          <span className="text-xs text-red-500 px-1 mt-0.5 block">
                            {errors.customSkill}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Section 3: Experience */}
              <section
                id="experience"
                className="scroll-mt-24 bg-surface-container rounded-xl p-md md:p-lg border border-surface-variant/20 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-gutter">
                  <span
                    className="material-symbols-outlined text-secondary"
                    data-icon="history"
                  >
                    history
                  </span>
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    Pengalaman Kerja
                  </h3>
                </div>
                <div className="space-y-gutter">
                  <div className="flex flex-col gap-xs max-w-x focus-within:scale-[1.01] transition-transform duration-200">
                    <label className="font-label-md text-label-md text-on-surface-variant px-1">
                      Tahun Pengalaman
                    </label>
                    <input
                      className="bg-surface-container-high border border-outline-variant text-on-surface rounded-lg px-md py-sm font-body-md text-body-md transition-all focus:border-secondary focus:ring-1 focus:ring-secondary/50 outline-none"
                      min="0"
                      placeholder="0"
                      type="number"
                      value={yearsExp}
                      onChange={(e) => setYearsExp(e.target.value)}
                    />
                    {errors.yearsExp && (
                      <span className="text-xs text-red-500 px-1 mt-0.5">
                        {errors.yearsExp}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-xs focus-within:scale-[1.01] transition-transform duration-200">
                    <div className="flex justify-between items-center px-1">
                      <label className="font-label-md text-label-md text-on-surface-variant">
                        Deskripsi Pekerjaan Sebelumnya
                      </label>
                      <span className="text-xs text-on-surface-variant/75">
                        {jobDesc.length}/500 karakter
                      </span>
                    </div>
                    <textarea
                      className="bg-surface-container-high border border-outline-variant text-on-surface rounded-lg px-md py-sm font-body-md text-body-md transition-all resize-none outline-none focus:border-secondary"
                      placeholder="Jelaskan secara singkat proyek atau keahlian utama Anda..."
                      rows={4}
                      value={jobDesc}
                      maxLength={500}
                      onChange={(e) => setJobDesc(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </section>

              {/* Section 4: Documents */}
              <section
                id="documents"
                className="scroll-mt-24 bg-surface-container rounded-xl p-md md:p-lg border border-surface-variant/20 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-gutter">
                  <span
                    className="material-symbols-outlined text-secondary"
                    data-icon="description"
                  >
                    description
                  </span>
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    Dokumen Legal
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                  {/* KTP Upload */}
                  <div className="p-md bg-surface-container-low border border-outline-variant rounded-xl flex flex-col items-center text-center gap-sm">
                    <input
                      ref={ktpInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={handleKtpFileChange}
                      className="hidden"
                    />
                    {ktpPreview ? (
                      <div className="w-24 h-16 rounded overflow-hidden border border-outline-variant bg-surface-variant flex items-center justify-center">
                        <img
                          src={ktpPreview}
                          alt="Preview KTP"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <span
                        className="material-symbols-outlined text-secondary text-4xl"
                        data-icon="badge"
                      >
                        badge
                      </span>
                    )}
                    <div>
                      <h4 className="font-label-md text-label-md text-on-surface font-bold">
                        Kartu Tanda Penduduk (KTP)
                      </h4>
                      {ktpDetails.name ? (
                        <div className="mt-1">
                          <p className="text-xs text-on-surface font-semibold truncate max-w-[200px]">
                            {ktpDetails.name}
                          </p>
                          <p className="text-[10px] text-on-surface-variant">
                            {ktpDetails.size}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-on-surface-variant">
                          Unggah file KTP dalam format PDF (Max 5MB)
                        </p>
                      )}
                    </div>
                    <button
                      className="mt-2 px-md py-2 bg-surface-container-high text-on-surface font-label-md rounded-lg border border-outline-variant hover:bg-surface-variant hover:border-secondary transition-all cursor-pointer"
                      type="button"
                      onClick={() => ktpInputRef.current.click()}
                    >
                      {ktpDetails.name ? "Ganti File" : "Pilih File"}
                    </button>
                  </div>
                  {/* Certification Upload */}
                  <div className="p-md bg-surface-container-low border border-outline-variant rounded-xl flex flex-col items-center text-center gap-sm">
                    <input
                      ref={portfolioInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={handlePortfolioFileChange}
                      className="hidden"
                    />
                    {portfolioPreview ? (
                      <div className="w-24 h-16 rounded overflow-hidden border border-outline-variant bg-surface-variant flex items-center justify-center">
                        <img
                          src={portfolioPreview}
                          alt="Preview Portofolio"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <span
                        className="material-symbols-outlined text-secondary text-4xl"
                        data-icon="workspace_premium"
                      >
                        workspace_premium
                      </span>
                    )}
                    <div>
                      <h4 className="font-label-md text-label-md text-on-surface font-bold">
                        CV atau Portofolio
                      </h4>
                      {portfolioDetails.name ? (
                        <div className="mt-1">
                          <p className="text-xs text-on-surface font-semibold truncate max-w-[200px]">
                            {portfolioDetails.name}
                          </p>
                          <p className="text-[10px] text-on-surface-variant">
                            {portfolioDetails.size}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-on-surface-variant">
                          Unggah CV/Portofolio format PDF (Max 5MB)
                        </p>
                      )}
                    </div>
                    <button
                      className="mt-2 px-md py-2 bg-surface-container-high text-on-surface font-label-md rounded-lg border border-outline-variant hover:bg-surface-variant hover:border-secondary transition-all cursor-pointer"
                      type="button"
                      onClick={() => portfolioInputRef.current.click()}
                    >
                      {portfolioDetails.name ? "Ganti File" : "Pilih File"}
                    </button>
                  </div>
                </div>
              </section>

              {/* Consent Checkboxes */}
              <section className="bg-surface-container rounded-xl p-md md:p-lg border border-surface-variant/20 shadow-lg space-y-md">
                <div className="flex items-center gap-3">
                  <span
                    className="material-symbols-outlined text-secondary"
                    data-icon="fact_check"
                  >
                    fact_check
                  </span>
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    Persetujuan
                  </h3>
                </div>
                <div className="space-y-sm">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentCorrect}
                      onChange={(e) => setConsentCorrect(e.target.checked)}
                      className="mt-1 w-4 h-4 text-secondary bg-surface-container-high border-outline-variant rounded focus:ring-secondary/50 focus:ring-1"
                    />
                    <span className="font-body-md text-body-md text-on-surface">
                      Saya menyatakan data yang saya isi benar.
                    </span>
                  </label>
                  {errors.consentCorrect && (
                    <p className="text-xs text-red-500 pl-7">
                      {errors.consentCorrect}
                    </p>
                  )}

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentTerms}
                      onChange={(e) => setConsentTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 text-secondary bg-surface-container-high border-outline-variant rounded focus:ring-secondary/50 focus:ring-1"
                    />
                    <span className="font-body-md text-body-md text-on-surface">
                      Saya menyetujui Syarat & Ketentuan.
                    </span>
                  </label>
                  {errors.consentTerms && (
                    <p className="text-xs text-red-500 pl-7">
                      {errors.consentTerms}
                    </p>
                  )}
                </div>
              </section>

              {/* Final Action */}
              <section
                id="verification"
                className="scroll-mt-24 flex flex-col md:flex-row items-center justify-between gap-gutter pt-lg pb-16"
              >
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span
                    className="material-symbols-outlined text-primary"
                    data-icon="info"
                  >
                    info
                  </span>
                  <span className="font-label-sm text-label-sm">
                    Proses verifikasi biasanya memerlukan waktu 2-3 hari kerja.
                  </span>
                </div>
                <button
                  className="w-full md:w-auto bg-secondary text-on-secondary font-headline-md px-xl py-md rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg cursor-pointer font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-on-secondary"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Mengirim...
                    </>
                  ) : (
                    "Kirim untuk Verifikasi"
                  )}
                </button>
              </section>
            </form>
          </main>
        </div>
      </div>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center p-4 bg-surface-container-highest/90 dark:bg-surface-container-highest/90 backdrop-blur-lg shadow-lg md:hidden z-50 rounded-t-xl border-t border-surface-variant/20">
        <button
          onClick={handleBack}
          className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:bg-surface-variant transition-all active:scale-90 rounded-lg cursor-pointer"
        >
          <span className="material-symbols-outlined" data-icon="arrow_back">
            arrow_back
          </span>
          <span className="font-label-sm text-label-sm">Kembali</span>
        </button>
        <button className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:bg-surface-variant transition-all active:scale-90 rounded-lg cursor-pointer">
          <span className="material-symbols-outlined" data-icon="save">
            save
          </span>
          <span className="font-label-sm text-label-sm">Simpan Draft</span>
        </button>
        <button
          onClick={handleNext}
          className="flex flex-col items-center justify-center bg-secondary text-on-secondary rounded-xl px-4 py-2 transition-all active:scale-90 cursor-pointer"
        >
          <span className="material-symbols-outlined" data-icon="arrow_forward">
            arrow_forward
          </span>
          <span className="font-label-sm text-label-sm font-bold">Lanjut</span>
        </button>
      </nav>

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[10%] right-[5%] w-96 h-96 bg-secondary/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[20%] left-[5%] w-64 h-64 bg-primary/5 blur-[100px] rounded-full"></div>
      </div>

      <ImageCropModal
        isOpen={isCropModalOpen}
        imageSrc={cropImageSrc}
        onClose={() => setIsCropModalOpen(false)}
        onConfirm={handleConfirmProfileCrop}
      />
    </div>
  );
}

export default RegisterTukang;
