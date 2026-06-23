import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function RegisterPelanggan() {
  const navigate = useNavigate();
  const [noteText, setNoteText] = useState("");
  const [activeStep, setActiveStep] = useState("profile");
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

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/pelanggan/dashboard");
  };

  return (
    <div className="bg-background text-on-surface min-h-screen selection:bg-secondary/30 selection:text-secondary font-sans select-none custom-scrollbar">
      {/* Top Navigation Bar (Shared Component Logic) */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-surface/80 backdrop-blur-xl border-b border-surface-variant/20 shadow-sm h-20 flex justify-between items-center px-margin-mobile md:px-margin-desktop">
        <div className="flex items-center gap-2">
          <span className="font-headline-md text-headline-md font-bold text-secondary">
            TukangAja
          </span>
        </div>
        <div className="flex items-center gap-sm">
          <button onClick={() => navigate("/bantuan")} className="p-2 text-on-surface-variant hover:text-secondary transition-colors duration-200 active:scale-95 cursor-pointer">
            <span className="material-symbols-outlined">help</span>
          </button>
          <button onClick={() => navigate("/notifikasi")} className="p-2 text-on-surface-variant hover:text-secondary transition-colors duration-200 active:scale-95 cursor-pointer relative">
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
              <span className="font-label-md text-label-md">Alamat & Lokasi</span>
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
              <span className="font-label-md text-label-md">Catatan Tambahan</span>
            </div>
          </nav>
        </aside>

        {/* Content Canvas */}
        <div className="flex-1 md:pl-64 flex flex-col w-full min-w-0">
          <main className="px-margin-mobile md:px-margin-desktop py-lg max-w-5xl mx-auto w-full">
            {/* Mobile Stepper Indicator */}
            <div className="md:hidden flex items-center justify-between mb-8 bg-surface-container rounded-xl p-4 border border-surface-variant/20">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${activeStep === "profile" ? "bg-secondary w-6" : "bg-on-surface-variant/30"} transition-all duration-300`}></div>
                <div className={`w-2 h-2 rounded-full ${activeStep === "address" ? "bg-secondary w-6" : "bg-on-surface-variant/30"} transition-all duration-300`}></div>
                <div className={`w-2 h-2 rounded-full ${activeStep === "notes" ? "bg-secondary w-6" : "bg-on-surface-variant/30"} transition-all duration-300`}></div>
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
                Lengkapi informasi berikut untuk memudahkan para tukang profesional kami
                mengenali Anda dan memberikan layanan terbaik.
              </p>
            </div>

            {/* Registration Form Area */}
            <form className="space-y-xl" onSubmit={handleSubmit}>
              {/* Section 1: Profil & Data Diri */}
              <section id="profile" className="scroll-mt-24 bg-surface-container rounded-xl p-md md:p-lg border border-surface-variant/20 shadow-lg space-y-gutter">
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
                  <div className="relative group cursor-pointer">
                    <div className="w-32 h-32 rounded-full border-4 border-surface-container-highest bg-surface-variant overflow-hidden flex items-center justify-center transition-all group-hover:border-secondary">
                      <img
                        className="w-full h-full object-cover"
                        alt="Profile Avatar"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3w7XxEdVxu6osAJ-BpwUvaF3Fu372z07yy2uEuD4Uo75uPr-tQkDt_K0IVvUSH_QfzkulP65j1Mqr14b9BKlSoIvjkiEPSTO1ij3FPKYEeCOrawwfiNXPfORxK2recIG-fF-d3de-LgVEuvl--mWx9Fc-07KZZiLAUi5DIED6NDMdR-aXGvSVlZv-MRFexssxva3OPlRexqaiMMRuHhRvfEXnv0SNrIf-NxTMDpZIX59SfTaRiuZataIrS8AsQXrt6pHKiKhLBgW6"
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
                      Gunakan foto asli agar tukang merasa lebih aman. Max 5MB (JPG/PNG).
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
                      />
                    </div>
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
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2: Alamat & Lokasi */}
              <section id="address" className="scroll-mt-24 bg-surface-container rounded-xl p-md md:p-lg border border-surface-variant/20 shadow-lg space-y-gutter">
                <div className="flex items-center gap-3 mb-base border-b border-surface-variant/10 pb-4">
                  <span className="material-symbols-outlined text-secondary">
                    location_on
                  </span>
                  <h3 className="font-headline-md text-headline-md text-on-surface font-bold text-lg">
                    Alamat & Lokasi
                  </h3>
                </div>

                {/* Full Address with Search Icon */}
                <div className="space-y-base focus-within:scale-[1.01] transition-transform duration-200">
                  <label className="font-label-md text-label-md text-on-surface-variant ml-1">
                    Alamat Lengkap
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">
                      location_on
                    </span>
                    <input
                      className="w-full bg-surface-container-high border border-outline-variant rounded-xl py-4 pl-12 pr-12 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/40 transition-all focus:ring-0 focus:border-secondary outline-none"
                      placeholder="Cari alamat atau seret pin di peta"
                      type="text"
                    />
                    <button
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:scale-110 transition-transform cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined">map</span>
                    </button>
                  </div>
                </div>

                {/* Interactive Map UI Placeholder */}
                <div className="space-y-base">
                  <div className="relative w-full h-64 bg-surface-container-highest rounded-xl overflow-hidden border border-outline-variant group">
                    {/* Mock Map Background */}
                    <div
                      className="absolute inset-0 opacity-40 bg-cover bg-center"
                      style={{
                        backgroundImage:
                          "url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/106.8272,-6.1751,12,0/800x400?access_token=pk.eyJ1IjoiZGVzaWduZXIiLCJhIjoiY2t4eHh4eHh4eHh4eHh4eHh4eHh4In0')",
                      }}
                    ></div>
                    {/* Center Pin */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-10">
                      <span className="material-symbols-outlined text-secondary text-4xl drop-shadow-lg animate-bounce">
                        location_on
                      </span>
                    </div>
                    {/* Map Controls Overlay */}
                    <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                      <button
                        className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center shadow-lg border border-outline-variant hover:bg-surface-variant cursor-pointer text-on-surface"
                        type="button"
                      >
                        <span className="material-symbols-outlined">add</span>
                      </button>
                      <button
                        className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center shadow-lg border border-outline-variant hover:bg-surface-variant cursor-pointer text-on-surface"
                        type="button"
                      >
                        <span className="material-symbols-outlined">remove</span>
                      </button>
                    </div>
                    <div className="absolute top-4 left-4">
                      <div className="bg-surface-container/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-outline-variant flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
                        <span className="text-label-sm text-on-surface">
                          Lokasi Presisi Aktif
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-label-sm text-on-surface-variant/60 ml-1">
                    Geser peta untuk menyesuaikan titik koordinat hunian Anda.
                  </p>
                </div>
              </section>

              {/* Section 3: Catatan Tambahan */}
              <section id="notes" className="scroll-mt-24 bg-surface-container rounded-xl p-md md:p-lg border border-surface-variant/20 shadow-lg space-y-gutter">
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
