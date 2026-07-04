import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [activeTab, setActiveTab] = useState("layanan");
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    const sections = ["layanan", "cara-kerja", "testimoni"];
    const observerCallback = (entries) => {
      if (isScrollingRef.current) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveTab(entry.target.id);
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: "-30% 0px -50% 0px",
      threshold: 0.1,
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

  const scrollToSection = (id, tabName) => {
    isScrollingRef.current = true;
    setActiveTab(tabName);
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

  return (
    <div className="bg-background min-h-screen text-on-surface flex flex-col justify-between">
      {/* NAVBAR */}
      <nav
        id="navbar"
        className="w-full bg-surface/80 px-6 md:px-12 py-5 flex justify-between items-center border-b border-surface-variant/20 sticky top-0 z-50 backdrop-blur-md"
      >
        <div className="flex items-center gap-16">
          <h1 className="text-2xl font-extrabold tracking-tight text-secondary select-none">
            TukangAja
          </h1>

          <ul className="hidden md:flex gap-8 text-sm font-medium">
            <li
              onClick={() => scrollToSection("layanan", "layanan")}
              className={`cursor-pointer pb-1.5 transition-all font-semibold select-none ${
                activeTab === "layanan"
                  ? "text-secondary border-b-2 border-secondary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Layanan
            </li>
            <li
              onClick={() => scrollToSection("cara-kerja", "cara-kerja")}
              className={`cursor-pointer pb-1.5 transition-all font-semibold select-none ${
                activeTab === "cara-kerja"
                  ? "text-secondary border-b-2 border-secondary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Cara Kerja
            </li>
            <li
              onClick={() => scrollToSection("testimoni", "testimoni")}
              className={`cursor-pointer pb-1.5 transition-all font-semibold select-none ${
                activeTab === "testimoni"
                  ? "text-secondary border-b-2 border-secondary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Testimoni
            </li>
          </ul>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login">
            <button className="bg-surface-container-high border border-outline-variant text-on-surface px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer hover:bg-secondary hover:text-black">
              Masuk akun
            </button>
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main id="layanan" className="grow flex flex-col justify-center">
        <section
          id="hero"
          className="max-w-7xl w-full mx-auto px-6 md:px-12 py-16 md:py-24"
        >
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 text-secondary bg-secondary/10 border border-secondary/25 px-4 py-2 rounded-full text-xs font-semibold tracking-wide">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
              Platform Jasa Tukang Untuk Kebutuhan Mahasiswa
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-5xl font-extrabold mt-6 leading-tight tracking-tight text-on-surface">
              Temukan Tukang Terdekat <br />
              dalam <span className="text-secondary">Hitungan Menit</span>
            </h1>

            <p className="mt-6 text-on-surface-variant leading-relaxed text-sm md:text-base max-w-xl mx-auto">
              Solusi handal untuk segala perbaikan rumah Anda. Dari instalasi
              listrik hingga pindahan rumah, tukang profesional kami siap
              membantu Anda kapan saja.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link
                to="/register-pelanggan"
                className="bg-black hover:bg-secondary hover:text-black rounded-2xl px-6 py-3 border border-gray-500 font-semibold"
              >
                Daftar sebagai pelanggan
              </Link>
              <Link
                to="/register-tukang"
                className="bg-black hover:bg-secondary hover:text-black rounded-2xl px-6 py-3 border border-gray-500 font-semibold"
              >
                Daftar Sebagai Tukang
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* STATS SECTION */}
      <section
        id="stats"
        className="w-full bg-surface-container py-8 border-t border-surface-variant/20"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-wrap justify-around items-center gap-8 md:gap-4">
          <div className="text-center min-w-30">
            <span className="block text-3xl font-extrabold text-on-surface tracking-tight">
              12.5k+
            </span>
            <span className="text-xs text-on-surface-variant mt-1.5 block font-semibold tracking-wide">
              Tukang Aktif
            </span>
          </div>
          <div className="text-center min-w-30">
            <span className="block text-3xl font-extrabold text-on-surface tracking-tight">
              48k+
            </span>
            <span className="text-xs text-on-surface-variant mt-1.5 block font-semibold tracking-wide">
              Pekerjaan Selesai
            </span>
          </div>

          <div className="text-center min-w-30">
            <span className="block text-3xl font-extrabold text-on-surface tracking-tight">
              4.9/5
            </span>
            <span className="text-xs text-on-surface-variant mt-1.5 block font-semibold tracking-wide">
              Rating Rata-rata
            </span>
          </div>
          <div className="text-center min-w-30">
            <span className="block text-3xl font-extrabold text-on-surface tracking-tight">
              30m
            </span>
            <span className="text-xs text-on-surface-variant mt-1.5 block font-semibold tracking-wide">
              Respon Tercepat
            </span>
          </div>
        </div>
      </section>

      {/* CARA KERJA SECTION */}
      <section
        id="cara-kerja"
        className="max-w-7xl w-full mx-auto px-6 md:px-12 py-20 md:py-28 border-t border-surface-variant/20 scroll-mt-20"
      >
        <div className="flex flex-col items-center text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight">
            Cara Kerja TukangAja
          </h2>
          <p className="text-on-surface-variant mt-3 text-sm md:text-base max-w-lg">
            Dapatkan bantuan hanya dalam 4 langkah mudah
          </p>
        </div>

        <div className="relative">
          {/* Horizontal Connection Line */}
          <div className="absolute top-12 left-1/10 right-1/10 h-0.5 bg-surface-variant/20 hidden md:block -z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full bg-surface-container-high border border-surface-variant/20 flex items-center justify-center group-hover:border-secondary/40 transition-all duration-300">
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center font-bold text-lg text-on-secondary shadow-lg shadow-secondary/10 group-hover:scale-105 transition-all duration-300">
                  1
                </div>
              </div>
              <h3 className="text-on-surface text-lg font-bold mt-5 tracking-tight">
                Posting Kendala
              </h3>
              <p className="text-xs text-on-surface-variant mt-3 leading-relaxed max-w-[220px] font-medium">
                Jelaskan kerusakan, sertakan foto, dan tentukan lokasi Anda.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full bg-surface-container-high border border-surface-variant/20 flex items-center justify-center group-hover:border-secondary/40 transition-all duration-300">
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center font-bold text-lg text-on-secondary shadow-lg shadow-secondary/10 group-hover:scale-105 transition-all duration-300">
                  2
                </div>
              </div>
              <h3 className="text-on-surface text-lg font-bold mt-5 tracking-tight">
                Notifikasi
              </h3>
              <p className="text-xs text-on-surface-variant mt-3 leading-relaxed max-w-[220px] font-medium">
                Tukang terverifikasi di sekitar Anda akan segera mendapat
                notifikasi.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full bg-surface-container-high border border-surface-variant/20 flex items-center justify-center group-hover:border-secondary/40 transition-all duration-300">
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center font-bold text-lg text-on-secondary shadow-lg shadow-secondary/10 group-hover:scale-105 transition-all duration-300">
                  3
                </div>
              </div>
              <h3 className="text-on-surface text-lg font-bold mt-5 tracking-tight">
                Pengerjaan
              </h3>
              <p className="text-xs text-on-surface-variant mt-3 leading-relaxed max-w-[220px] font-medium">
                Tukang datang dan menyelesaikan masalah Anda dengan profesional.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full bg-surface-container-high border border-surface-variant/20 flex items-center justify-center group-hover:border-secondary/40 transition-all duration-300">
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center font-bold text-lg text-on-secondary shadow-lg shadow-secondary/10 group-hover:scale-105 transition-all duration-300">
                  4
                </div>
              </div>
              <h3 className="text-on-surface text-lg font-bold mt-5 tracking-tight">
                Rating & Bayar
              </h3>
              <p className="text-xs text-on-surface-variant mt-3 leading-relaxed max-w-[220px] font-medium">
                Lakukan pembayaran aman lewat aplikasi dan berikan ulasan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONI SECTION */}
      <section
        id="testimoni"
        className="max-w-7xl w-full mx-auto px-6 md:px-12 py-20 md:py-28 border-t border-surface-variant/20 scroll-mt-20"
      >
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight">
              Apa Kata Mereka?
            </h2>
            <p className="text-on-surface-variant mt-3 text-sm md:text-base">
              Kepercayaan pelanggan adalah kebanggaan kami
            </p>
          </div>
          <div className="flex gap-3">
            <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:border-secondary transition-all cursor-pointer">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:border-secondary transition-all cursor-pointer">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Testimonial 1 */}
          <div className="bg-surface-container-high border border-surface-variant/20 p-7 rounded-3xl flex flex-col justify-between hover:border-secondary/30 transition-all duration-300">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary font-bold">
                  SA
                </div>
                <div>
                  <h4 className="text-on-surface font-bold text-sm">
                    Siti Aminah
                  </h4>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-3.5 h-3.5 fill-secondary"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-on-surface-variant text-xs md:text-sm leading-relaxed font-medium">
                "Sangat terbantu! Pipa wastafel bocor jam 9 malam, langsung
                dapat tukang. Datangnya cepat, kerjanya
                rapi banget."
              </p>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-surface-container-high border border-surface-variant/20 p-7 rounded-3xl flex flex-col justify-between hover:border-secondary/30 transition-all duration-300 relative overflow-hidden">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary font-bold">
                  BS
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-on-surface font-bold text-sm">
                      Budi Santoso
                    </h4>
                    <span className="w-2 h-2 bg-pink-500 rounded-full inline-block animate-pulse"></span>
                  </div>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-3.5 h-3.5 fill-secondary"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-on-surface-variant text-xs md:text-sm leading-relaxed font-medium">
                "Platform paling transparan. Saya bisa lihat rating tukangnya
                dulu sebelum hire. Pengerjaan atap bocor di rumah saya selesai
                tepat waktu dan bergaransi."
              </p>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-surface-container-high border border-surface-variant/20 p-7 rounded-3xl flex flex-col justify-between hover:border-secondary/30 transition-all duration-300">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary font-bold">
                  AW
                </div>
                <div>
                  <h4 className="text-on-surface font-bold text-sm">
                    Andi Wijaya
                  </h4>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-3.5 h-3.5 fill-secondary"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-on-surface-variant text-xs md:text-sm leading-relaxed font-medium">
                "Baru pindah rumah dan bingung pasang furnitur. TukangAja bantu
                carikan tukang kayu yang handal. Harganya kompetitif dan
                aplikasinya user-friendly."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA JOIN PARTNER */}
      <section className="max-w-7xl w-full mx-auto px-6 md:px-12 py-12">
        <div className="bg-gradient-to-br from-surface-container-high to-background border border-surface-variant/20 rounded-3xl p-8 md:p-12 lg:p-14 flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden relative">
          <div className="absolute right-0 top-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl -z-0"></div>

          <div className="flex-1 text-left z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface leading-tight">
              Ingin Menambah Penghasilan?
            </h2>
            <p className="text-on-surface-variant mt-4 max-w-xl text-sm md:text-base leading-relaxed font-medium">
              Bergabunglah dengan 12.000+ tukang mandiri kami. Dapatkan akses ke
              ribuan pesanan setiap harinya dan atur waktu kerja Anda sendiri.
            </p>

            <ul className="mt-8 space-y-4">
              <li className="flex items-center gap-3.5 text-sm md:text-base text-on-surface/90 font-semibold">
                <span className="w-5 h-5 rounded-full bg-secondary/15 border border-secondary/30 flex items-center justify-center text-secondary text-xs font-extrabold shrink-0">
                  ✓
                </span>
                Pembayaran Cepat & Transparan
              </li>
              <li className="flex items-center gap-3.5 text-sm md:text-base text-on-surface/90 font-semibold">
                <span className="w-5 h-5 rounded-full bg-secondary/15 border border-secondary/30 flex items-center justify-center text-secondary text-xs font-extrabold shrink-0">
                  ✓
                </span>
                Jaminan Asuransi Kecelakaan Kerja
              </li>
              <li className="flex items-center gap-3.5 text-sm md:text-base text-on-surface/90 font-semibold">
                <span className="w-5 h-5 rounded-full bg-secondary/15 border border-secondary/30 flex items-center justify-center text-secondary text-xs font-extrabold shrink-0">
                  ✓
                </span>
                Fleksibilitas Waktu Kerja
              </li>
            </ul>
            <Link to="/register-tukang">
              <button className="bg-secondary text-on-secondary px-7 py-3.5 rounded-2xl font-bold mt-10 shadow-lg shadow-secondary/10 hover:opacity-90 active:scale-95 transition-all cursor-pointer">
                Daftar Jadi Tukang Mandiri
              </button>
            </Link>
          </div>

          <div className="w-full lg:w-auto flex justify-center z-10 shrink-0">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-secondary/20 to-transparent rounded-3xl blur opacity-75"></div>
              <img
                src="/mitra_tukang.png"
                alt="Tukang Mandiri"
                className="w-full max-w-[340px] md:max-w-[400px] h-[320px] md:h-[360px] object-cover rounded-3xl border border-surface-variant/30 shadow-2xl relative"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-surface-container-lowest border-t border-surface-variant/20 pt-16 pb-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
            <div className="lg:col-span-2 flex flex-col items-start">
              <h3 className="text-2xl font-extrabold text-secondary tracking-tight transition-colors cursor-pointer select-none">
                TukangAja
              </h3>
              <p className="text-on-surface-variant mt-4 max-w-sm text-sm leading-relaxed font-medium">
                Solusi Handal Perbaikan Rumah Anda. Menghubungkan Anda dengan
                ribuan tukang profesional terverifikasi.
              </p>
              <div className="flex gap-3 mt-6">
                {["globe", "instagram", "twitter"].map((icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-secondary transition-all"
                  >
                    {icon === "globe" && (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10M12 2a15.3 15.3 0 00-4 10 15.3 15.3 0 004 10M2 12h20" />
                      </svg>
                    )}
                    {icon === "instagram" && (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <rect
                          x="2"
                          y="2"
                          width="20"
                          height="20"
                          rx="5"
                          ry="5"
                        />
                        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01" />
                      </svg>
                    )}
                    {icon === "twitter" && (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                      </svg>
                    )}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-on-surface font-bold text-xs uppercase tracking-wider mb-5">
                Perusahaan
              </h4>
              <ul className="space-y-3.5">
                {["Tentang Kami", "Karir", "Blog", "Kontak"].map((item, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="text-on-surface-variant hover:text-on-surface text-sm transition-colors font-medium"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-on-surface font-bold text-xs uppercase tracking-wider mb-5">
                Layanan
              </h4>
              <ul className="space-y-3.5">
                {[
                  "Kategori Layanan",
                  "Komunitas Tukang",
                  "Emergency 24/7",
                  "Asuransi Perbaikan",
                ].map((item, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="text-on-surface-variant hover:text-on-surface text-sm transition-colors font-medium"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-on-surface font-bold text-xs uppercase tracking-wider mb-5">
                Bantuan
              </h4>
              <ul className="space-y-3.5">
                {[
                  "Pusat Bantuan",
                  "Kebijakan Privasi",
                  "Syarat & Ketentuan",
                  "FAQ",
                ].map((item, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="text-on-surface-variant hover:text-on-surface text-sm transition-colors font-medium"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="h-px bg-surface-variant/20 my-10"></div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs text-on-surface-variant/60 font-medium">
              © 2024 TukangAja. Profesional, Cepat, dan Terpercaya.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
