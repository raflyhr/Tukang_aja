import { useState, useEffect, useRef } from "react";

function RegisterTukang() {
  const [activeStep, setActiveStep] = useState("profile");
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

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
    <div className="bg-surface text-on-surface min-h-screen flex flex-col font-sans select-none custom-scrollbar">
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-surface/80 backdrop-blur-xl border-b border-surface-variant/20 shadow-sm h-20 flex justify-between items-center px-margin-mobile md:px-margin-desktop">
        <div className="font-headline-md text-headline-md font-bold text-secondary dark:text-secondary">
          TukangAja
        </div>
        <div className="flex items-center gap-6">
          <span
            className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-secondary transition-colors"
            data-icon="help"
          >
            help
          </span>
          <span
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
              <span className="material-symbols-outlined" data-icon="construction">
                construction
              </span>
              <span className="font-label-md text-label-md">Layanan</span>
            </div>

            {/* Documents Step */}
            <div
              onClick={() => scrollToSection("documents")}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg active:opacity-80 transition-all cursor-pointer ${
                activeStep === "documents"
                  ? "text-secondary font-bold bg-surface-container-highest"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50"
              }`}
            >
              <span className="material-symbols-outlined" data-icon="description">
                description
              </span>
              <span className="font-label-md text-label-md">Dokumen</span>
            </div>

            {/* Verification Step */}
            <div
              onClick={() => scrollToSection("verification")}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg active:opacity-80 transition-all cursor-pointer ${
                activeStep === "verification"
                  ? "text-secondary font-bold bg-surface-container-highest"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50"
              }`}
            >
              <span className="material-symbols-outlined" data-icon="verified_user">
                verified_user
              </span>
              <span className="font-label-md text-label-md">Verifikasi</span>
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
              Bergabunglah dengan jaringan tukang elit kami. Masukkan data Anda dengan benar untuk melewati proses verifikasi.
            </p>
          </div>

          <form className="space-y-xl" onSubmit={(e) => e.preventDefault()}>
            {/* Section 1: Personal Info */}
            <section id="profile" className="scroll-mt-24 bg-surface-container rounded-xl p-md md:p-lg border border-surface-variant/20 shadow-lg">
              <div className="flex items-center gap-3 mb-gutter">
                <span className="material-symbols-outlined text-secondary" data-icon="person">
                  person
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  Informasi Pribadi
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
                {/* Photo Upload */}
                <div className="md:col-span-4 flex flex-col items-center justify-center border-2 border-dashed border-outline-variant rounded-xl p-md bg-surface-container-low hover:border-secondary transition-colors cursor-pointer group">
                  <div className="w-32 h-32 rounded-full bg-surface-variant flex items-center justify-center mb-sm overflow-hidden border-4 border-surface-container-high">
                    <span
                      className="material-symbols-outlined text-4xl text-on-surface-variant group-hover:text-secondary"
                      data-icon="add_a_photo"
                    >
                      add_a_photo
                    </span>
                  </div>
                  <span className="font-label-md text-label-md text-on-surface-variant">
                    Unggah Foto Profil
                  </span>
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
                      />
                    </div>
                    <div className="flex flex-col gap-xs focus-within:scale-[1.01] transition-transform duration-200">
                      <label className="font-label-md text-label-md text-on-surface-variant px-1">
                        Alamat Email
                      </label>
                      <input
                        className="bg-surface-container-high border border-outline-variant text-on-surface rounded-lg px-md py-sm font-body-md text-body-md transition-all focus:border-secondary focus:ring-1 focus:ring-secondary/50 outline-none"
                        placeholder="budi@email.com"
                        type="email"
                      />
                    </div>
                    <div className="flex flex-col gap-xs focus-within:scale-[1.01] transition-transform duration-200">
                      <label className="font-label-md text-label-md text-on-surface-variant px-1">
                        Nomor Telepon
                      </label>
                      <input
                        className="bg-surface-container-high border border-outline-variant text-on-surface rounded-lg px-md py-sm font-body-md text-body-md transition-all focus:border-secondary focus:ring-1 focus:ring-secondary/50 outline-none"
                        placeholder="+62 812..."
                        type="tel"
                      />
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-xs focus-within:scale-[1.01] transition-transform duration-200">
                      <label className="font-label-md text-label-md text-on-surface-variant px-1">
                        Alamat Domisili
                      </label>
                      <div className="relative">
                        <input
                          className="w-full bg-surface-container-high border border-outline-variant text-on-surface rounded-lg pl-10 pr-md py-sm font-body-md text-body-md transition-all focus:border-secondary focus:ring-1 focus:ring-secondary/50 outline-none"
                          placeholder="Cari alamat atau geser pin di peta..."
                          type="text"
                        />
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-body-lg">
                          search
                        </span>
                      </div>
                      <div className="mt-sm w-full h-64 bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden relative">
                        <div className="absolute inset-0 bg-surface-variant/20 flex items-center justify-center">
                          <div className="flex flex-col items-center gap-2">
                            <span className="material-symbols-outlined text-secondary text-4xl animate-bounce">
                              location_on
                            </span>
                            <span className="text-xs text-on-surface-variant">
                              Geser pin untuk lokasi presisi
                            </span>
                          </div>
                        </div>
                        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                          <button
                            className="p-2 bg-surface-container-highest rounded-lg border border-outline-variant text-on-surface hover:bg-surface-variant transition-all shadow-lg cursor-pointer"
                            type="button"
                          >
                            <span className="material-symbols-outlined">
                              my_location
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Expertise */}
            <section id="services" className="scroll-mt-24 bg-surface-container rounded-xl p-md md:p-lg border border-surface-variant/20 shadow-lg">
              <div className="flex items-center gap-3 mb-gutter">
                <span className="material-symbols-outlined text-secondary" data-icon="construction">
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
                  <select className="bg-surface-container-high border border-outline-variant text-on-surface rounded-lg px-md py-sm font-body-md text-body-md appearance-none cursor-pointer outline-none focus:border-secondary">
                    <option>Pilih kategori</option>
                    <option>Plumbing (Pipa & Kran)</option>
                    <option>Electrical (Kelistrikan)</option>
                    <option>Masonry (Tukang Bangunan)</option>
                    <option>Carpentry (Kayu)</option>
                    <option>AC Specialist (Pendingin)</option>
                    <option>Painting (Pengecatan)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-xs focus-within:scale-[1.01] transition-transform duration-200">
                  <label className="font-label-md text-label-md text-on-surface-variant px-1">
                    Keahlian Tambahan (Opsional)
                  </label>
                  <input
                    className="bg-surface-container-high border border-outline-variant text-on-surface rounded-lg px-md py-sm font-body-md text-body-md transition-all focus:border-secondary focus:ring-1 focus:ring-secondary/50 outline-none"
                    placeholder="misal Anti Air, Pengelasan"
                    type="text"
                  />
                </div>
              </div>
            </section>

            {/* Section 3: Experience */}
            <section id="experience" className="scroll-mt-24 bg-surface-container rounded-xl p-md md:p-lg border border-surface-variant/20 shadow-lg">
              <div className="flex items-center gap-3 mb-gutter">
                <span className="material-symbols-outlined text-secondary" data-icon="history">
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
                  />
                </div>
                <div className="flex flex-col gap-xs focus-within:scale-[1.01] transition-transform duration-200">
                  <label className="font-label-md text-label-md text-on-surface-variant px-1">
                    Deskripsi Pekerjaan Sebelumnya
                  </label>
                  <textarea
                    className="bg-surface-container-high border border-outline-variant text-on-surface rounded-lg px-md py-sm font-body-md text-body-md transition-all resize-none outline-none focus:border-secondary"
                    placeholder="Jelaskan secara singkat proyek atau keahlian utama Anda..."
                    rows={4}
                  ></textarea>
                </div>
              </div>
            </section>

            {/* Section 4: Documents */}
            <section id="documents" className="scroll-mt-24 bg-surface-container rounded-xl p-md md:p-lg border border-surface-variant/20 shadow-lg">
              <div className="flex items-center gap-3 mb-gutter">
                <span className="material-symbols-outlined text-secondary" data-icon="description">
                  description
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  Dokumen Legal
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                {/* KTP Upload */}
                <div className="p-md bg-surface-container-low border border-outline-variant rounded-xl flex flex-col items-center text-center gap-sm">
                  <span className="material-symbols-outlined text-secondary text-4xl" data-icon="badge">
                    badge
                  </span>
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface font-bold">
                      Kartu Tanda Penduduk (KTP)
                    </h4>
                    <p className="text-xs text-on-surface-variant">
                      Scan atau foto KTP berkualitas tinggi
                    </p>
                  </div>
                  <button
                    className="mt-2 px-md py-2 bg-surface-container-high text-on-surface font-label-md rounded-lg border border-outline-variant hover:bg-surface-variant hover:border-secondary transition-all cursor-pointer"
                    type="button"
                  >
                    Pilih File
                  </button>
                </div>
                {/* Certification Upload */}
                <div className="p-md bg-surface-container-low border border-outline-variant rounded-xl flex flex-col items-center text-center gap-sm">
                  <span
                    className="material-symbols-outlined text-secondary text-4xl"
                    data-icon="workspace_premium"
                  >
                    workspace_premium
                  </span>
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface font-bold">
                      Sertifikasi Profesional
                    </h4>
                    <p className="text-xs text-on-surface-variant">
                      BNSP atau sertifikat teknis yang relevan
                    </p>
                  </div>
                  <button
                    className="mt-2 px-md py-2 bg-surface-container-high text-on-surface font-label-md rounded-lg border border-outline-variant hover:bg-surface-variant hover:border-secondary transition-all cursor-pointer"
                    type="button"
                  >
                    Pilih File
                  </button>
                </div>
              </div>
            </section>

            {/* Final Action */}
            <section id="verification" className="scroll-mt-24 flex flex-col md:flex-row items-center justify-between gap-gutter pt-lg pb-16">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-primary" data-icon="info">
                  info
                </span>
                <span className="font-label-sm text-label-sm">
                  Proses verifikasi biasanya memerlukan waktu 2-3 hari kerja.
                </span>
              </div>
              <button
                className="w-full md:w-auto bg-secondary text-on-secondary font-headline-md px-xl py-md rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg cursor-pointer font-semibold"
                type="submit"
              >
                Kirim untuk Verifikasi
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
    </div>
  );
}

export default RegisterTukang;
