import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import LogoutModal from "../../components/LogoutModal";

function ProfilTukang() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("pelanggan_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const userObj = parsed.user || parsed;
        setUser(userObj);
      } catch (error) {
        console.error("Gagal parse data user:", error);
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profil");

  const specialistName = location.state?.specialistName || "Budi Santoso";

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/pelanggan/dashboard" },
    { id: "pesanan", label: "Pesanan Saya", icon: "receipt_long", path: "/pelanggan/pesanan" },
    { id: "chat", label: "Chat", icon: "chat", path: "/pelanggan/chat" },
    { id: "pembayaran", label: "Pembayaran", icon: "payments", path: "/pelanggan/pembayaran" },
    { id: "profil", label: "Profil", icon: "person", path: "/pelanggan/profil" },
  ];

  // Mock database of specialist data (matching dashboard and pesanan data)
  const specialists = [
    {
      id: "t0",
      name: "Budi Santoso",
      specialty: "pipa",
      specialtyText: "Spesialis Pipa & Pompa Air",
      distance: "1.5 km",
      rating: 4.9,
      completedJobs: 142,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB6yWPnddSoXxHicpYNBtHEB9FXwtpuTluaIkKfA2eKT4jdvEjy8C7RCg9K1NnouBaRsuUFpfOL_FUKN1Irzlwnw-7qoBxPKbIbJzM8LHYLbfBqF8s-Mks4p6Q-WMrNp6Zda5KPxHzwVy6DNRaSZ8v_qnF9NJPLHu6CcE6Z_ARUIJl-QCp6UCA1st-XSPbyVy_K3GpPJ8UCvhln7dm55FhSFi-VgaIFVFtaKKcZE55BMCu6TAxbvYpHGgdlo3HGEpWzGkdhRNk4Wl9e",
      status: "Tersedia",
      bio: "Berpengalaman lebih dari 7 tahun dalam menangani kebocoran saluran pipa air, instalasi keran, perbaikan wastafel, dan maintenance pompa air rumahan.",
      priceFormatted: "Rp 120.000/jam",
      experience: 7,
      portfolio: [
        { label: "Pipa Wastafel Bocor", desc: "Instalasi ulang pembuangan", before: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=300&auto=format&fit=crop", after: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=300&auto=format&fit=crop" },
        { label: "Pompa Air Shimizu", desc: "Perbaikan dinamo & pressure", before: "https://images.unsplash.com/photo-1542060748-10c28b629f6f?q=80&w=300&auto=format&fit=crop", after: "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?q=80&w=300&auto=format&fit=crop" }
      ],
      reviews: [
        { name: "Hendra Wijaya", rating: 5, comment: "Datang tepat waktu dan langsung tahu permasalahannya. Pipa wastafel mampet beres dalam 30 menit.", date: "3 hari lalu", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=80&auto=format&fit=crop" },
        { name: "Siti Rahma", rating: 5, comment: "Kerjanya rapi, tidak jorok. Air keran lancar jaya sekarang.", date: "1 minggu lalu", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=80&auto=format&fit=crop" }
      ],
      prices: [
        { name: "Perbaikan Pipa Bocor", price: "Rp 100.000 - Rp 250.000", desc: "Deteksi titik kebocoran pipa air bersih/kotor dan penyambungan ulang." },
        { name: "Pasang Keran / Wastafel", price: "Rp 80.000 / unit", desc: "Pemasangan keran baru, wastafel cuci piring, atau cuci tangan." },
        { name: "Pembersihan Toren Air", price: "Rp 200.000 / unit", desc: "Pembersihan lumut dan kotoran pada tangki penampungan air." },
      ]
    },
    {
      id: "t1",
      name: "Bambang Susilo",
      specialty: "pipa",
      specialtyText: "Spesialis Pipa & Deteksi Kebocoran",
      distance: "1.2 km",
      rating: 4.9,
      completedJobs: 154,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDs8Lu1JkjdYYbB0gEPDz5AnBVfMJ3NSVj6AaIrRwz11aUkV8ZBMBntVWf7pu9UI9D2d2AV34cbAWarBRu7rkglulzLscU8ytWB_P23UDj2DxligPU1OzKwGGdyBv232-R9WFCHLleZ09J9-F_X2kOAswEol__7wRLilrK5dUYX-1ePXpWmLdaFVTJvesnu-5TksZM3IpA1BvN-EMB7F6YzyPEsTaVDJ7WbyhBHGUp7n8ASgFlNwP4NEzEYN3gvtniLpOjy5cmWOl70",
      status: "Tersedia",
      bio: "Berpengalaman lebih dari 8 tahun dalam menangani segala jenis kebocoran pipa, sanitasi, dan waterproofing atap rumah.",
      priceFormatted: "Rp 150.000/jam",
      experience: 8,
      portfolio: [
        { label: "Instalasi Pipa Wastafel", desc: "Penggantian pipa PVC & saringan", before: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=300&auto=format&fit=crop", after: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=300&auto=format&fit=crop" }
      ],
      reviews: [
        { name: "Andi Wijaya", rating: 5, comment: "Pekerjaan rapi dan cepat selesai. Alatnya lengkap dan profesional.", date: "2 hari lalu", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=80&auto=format&fit=crop" }
      ],
      prices: [
        { name: "Perbaikan Pipa Bocor", price: "Rp 100.000 - Rp 250.000", desc: "Deteksi titik kebocoran pipa air bersih/kotor." }
      ]
    },
    {
      id: "t2",
      name: "Andi Wijaya",
      specialty: "listrik",
      specialtyText: "Instalasi & Perbaikan Listrik",
      distance: "2.1 km",
      rating: 4.8,
      completedJobs: 98,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
      status: "Tersedia",
      bio: "Ahli kelistrikan rumah tangga. Menangani perbaikan sekring, korsleting, instalasi panel baru, dan pemasangan saklar/stop kontak tambahan secara aman.",
      priceFormatted: "Rp 100.000/jam",
      experience: 6,
      portfolio: [
        { label: "MCB & Box Panel", desc: "Merakit ulang instalasi pembagi daya", before: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?q=80&w=300&auto=format&fit=crop", after: "https://images.unsplash.com/photo-1621905252507-b354bc25edac?q=80&w=300&auto=format&fit=crop" }
      ],
      reviews: [
        { name: "Rian Kusuma", rating: 4.8, comment: "Sangat edukatif menjelaskan penyebab korsleting. Pengerjaan cepat dan aman.", date: "4 hari lalu", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=80&auto=format&fit=crop" }
      ],
      prices: [
        { name: "Pasang Stop Kontak / Saklar", price: "Rp 35.000 / unit", desc: "Pemasangan stop kontak tambahan atau penggantian saklar rusak." },
        { name: "Perbaikan Konsleting Listrik", price: "Rp 150.000 / jam", desc: "Deteksi dan perbaikan arus pendek atau sekring rumah." }
      ]
    },
    {
      id: "t3",
      name: "Hadi Pratama",
      specialty: "cat",
      specialtyText: "Spesialis Cat Dinding & Interior",
      distance: "1.9 km",
      rating: 4.9,
      completedJobs: 132,
      image: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=200&auto=format&fit=crop",
      status: "Tersedia",
      bio: "Ahli dekorasi dinding, pengecatan rumah baru/lama, serta pengerjaan interior berbahan kayu seperti kusen dan kabinet.",
      priceFormatted: "Rp 90.000/jam",
      experience: 4,
      portfolio: [],
      reviews: [],
      prices: []
    },
    {
      id: "t4",
      name: "Siti Aminah",
      specialty: "kebersihan",
      specialtyText: "Spesialis Deep Cleaning Apartemen",
      distance: "1.0 km",
      rating: 4.9,
      completedJobs: 110,
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
      status: "Tersedia",
      bio: "Pakar pembersihan mendalam (deep cleaning) apartemen dan rumah tinggal. Menggunakan cairan pembersih ramah lingkungan dan alat modern vacuum hydro-cleaner.",
      priceFormatted: "Rp 80.000/jam",
      experience: 5,
      portfolio: [],
      reviews: [],
      prices: []
    },
    {
      id: "t5",
      name: "Joko Susilo",
      specialty: "atap",
      specialtyText: "Spesialis Genteng & Atap Bocor",
      distance: "2.4 km",
      rating: 4.7,
      completedJobs: 86,
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=200&auto=format&fit=crop",
      status: "Sibuk",
      bio: "Melayani perbaikan genteng bocor, pemasangan talang air baru, pelapisan dak beton dengan cat anti bocor (waterproofing).",
      priceFormatted: "Rp 150.000/jam",
      experience: 6,
      portfolio: [],
      reviews: [],
      prices: []
    }
  ];

  // Find specialist by name (fallback to first item if not found)
  const specialist = specialists.find(
    (s) => s.name.toLowerCase() === specialistName.toLowerCase()
  ) || specialists[0];

  return (
    <div className="bg-background text-on-surface min-h-screen selection:bg-secondary/30 selection:text-secondary font-sans relative overflow-x-hidden flex">
      {/* Backdrop for Mobile Sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SideNavBar */}
      <aside className={`h-screen w-64 fixed left-0 top-0 bg-surface-container flex flex-col py-6 px-4 z-50 border-r border-surface-variant/20 transition-transform duration-300 lg:transition-none lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-4 mb-8 flex justify-between items-center">
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-secondary">TukangAja</h1>
            <p className="text-on-surface-variant font-label-sm text-[10px] tracking-widest uppercase opacity-60">Elite Home Services</p>
          </div>
          <button className="lg:hidden text-on-surface-variant hover:text-on-surface cursor-pointer" onClick={() => setIsSidebarOpen(false)}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="flex-1 space-y-1">
          {navigationItems.map((item) => {
            const isActive = item.active;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`w-full flex items-center gap-4 py-3 px-4 transition-colors duration-200 ease-in-out font-semibold rounded-xl text-left cursor-pointer ${
                  isActive
                    ? "text-secondary border-r-4 border-secondary bg-surface-container-highest shadow-[10px_0_20px_-10px_rgba(255,183,131,0.3)]"
                    : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
                <span className="text-sm font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto pt-4 border-t border-surface-variant/20">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/30 shrink-0">
                <img
                  className="w-full h-full object-cover"
                  alt="User Profile"
                  src={user && user.foto_profil ? (user.foto_profil.startsWith("http") ? user.foto_profil : `http://127.0.0.1:8000/storage/${user.foto_profil}`) : `https://ui-avatars.com/api/?name=${user ? user.name : 'Pelanggan'}&background=random`}
                />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-on-surface truncate">{user ? user.name : "Memuat..."}</h4>
                <p className="text-xs text-on-surface-variant/60 truncate">{user ? user.email : ""}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsLogoutModalOpen(true)}
              className="text-on-surface-variant hover:text-red-400 transition-colors p-1 flex items-center justify-center cursor-pointer bg-transparent border-none" 
              title="Log Out"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <main className="flex-grow lg:ml-64 min-h-screen relative flex flex-col">
        {/* TopAppBar */}
        <header className="fixed top-0 right-0 left-0 lg:left-64 z-40 flex justify-between items-center px-6 md:px-12 h-20 bg-surface/80 backdrop-blur-xl border-b border-surface-variant/20 transition-all duration-300">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <span className="font-headline-md text-headline-md font-bold text-secondary hidden sm:block">Profil Tukang</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/notifikasi" className="p-2 text-on-surface-variant hover:text-secondary transition-colors relative cursor-pointer flex items-center justify-center">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full"></span>
            </Link>
            <div className="h-10 w-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/30 ml-2">
              <img
                className="w-full h-full object-cover"
                alt="User Profile"
                src={user && user.foto_profil ? (user.foto_profil.startsWith("http") ? user.foto_profil : `http://127.0.0.1:8000/storage/${user.foto_profil}`) : `https://ui-avatars.com/api/?name=${user ? user.name : 'Pelanggan'}&background=random`}
              />
            </div>
          </div>
        </header>

        {/* Canvas */}
        <div className="pt-28 pb-12 px-6 md:px-12 max-w-7xl w-full mx-auto space-y-8 flex-grow page-transition">
          {/* Header & Back Button */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-variant/15 text-on-surface-variant hover:text-on-surface transition-all cursor-pointer flex items-center justify-center"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                <Link to="/pelanggan/dashboard" className="hover:underline">Dashboard</Link>
                <span>/</span>
                <Link to="/pelanggan/pesanan" className="hover:underline">Pesanan Saya</Link>
                <span>/</span>
                <span className="text-on-surface font-semibold">{specialist.name}</span>
              </div>
              <h2 className="text-xl font-bold text-on-surface mt-1">Detail Mitra</h2>
            </div>
          </div>

          {/* Profile Card Header */}
          <div className="bg-surface-container p-6 rounded-3xl border border-surface-variant/15 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-secondary/30 shrink-0">
                <img className="w-full h-full object-cover" src={specialist.image} alt={specialist.name} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold text-on-surface">{specialist.name}</h3>
                  <span className="material-symbols-outlined text-secondary text-base" title="Verified Specialist">verified</span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    specialist.status === "Tersedia"
                      ? "bg-green-500/10 border-green-500/20 text-green-400"
                      : "bg-red-500/10 border-red-500/20 text-red-400"
                  }`}>
                    {specialist.status}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant font-medium mt-1">{specialist.specialtyText}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-on-surface-variant/85 font-semibold">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    {specialist.rating.toFixed(1)} Rating
                  </span>
                  <span>•</span>
                  <span>{specialist.completedJobs} Pekerjaan Selesai</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">location_on</span>
                    {specialist.distance} dari Anda
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto shrink-0">
              <button
                onClick={() => navigate("/pelanggan/chat", { state: { orderId: "DIRECT", specialistId: specialist.name } })}
                className="flex-1 md:flex-initial bg-surface-container-high border border-outline-variant/30 hover:border-secondary/40 text-on-surface hover:text-secondary py-3 px-5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">chat</span>
                Hubungi Chat
              </button>
              <button
                onClick={() => navigate("/posting-pekerjaan", { state: { prefillService: specialist.specialtyText } })}
                className="flex-1 md:flex-initial bg-secondary text-on-secondary hover:bg-secondary/90 py-3 px-6 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-secondary/15 hover:scale-[1.01] active:scale-[0.99]"
              >
                <span className="material-symbols-outlined text-xs">calendar_today</span>
                Pesan Sekarang
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-surface-variant/20 gap-6 pb-2">
            {[
              { id: "profil", label: "Profil & Informasi" },
              { id: "portofolio", label: "Portofolio Pekerjaan" },
              { id: "ulasan", label: "Ulasan Pelanggan" },
              { id: "harga", label: "Daftar Harga Jasa" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2 text-xs font-bold capitalize transition-colors relative cursor-pointer ${
                  activeTab === tab.id ? "text-secondary" : "text-on-surface-variant/70 hover:text-on-surface"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          {/* Tab Panels */}
          <div className="min-h-[250px]">
            {activeTab === "profil" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                  <div className="bg-surface-container p-6 rounded-3xl border border-surface-variant/15 space-y-4">
                    <h4 className="font-bold text-sm text-on-surface uppercase tracking-wider">Tentang Penyedia Jasa</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                      {specialist.bio}
                    </p>
                  </div>

                  <div className="bg-surface-container p-6 rounded-3xl border border-surface-variant/15 space-y-4">
                    <h4 className="font-bold text-sm text-on-surface uppercase tracking-wider">Sertifikat & Lisensi Profesional</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-surface-container-high/50 p-4 rounded-xl border border-outline-variant/20 flex items-center gap-3">
                        <span className="material-symbols-outlined text-secondary text-2xl">verified_user</span>
                        <div>
                          <p className="text-xs font-bold text-on-surface">Sertifikasi Kompetensi BNSP</p>
                          <p className="text-[10px] text-on-surface-variant mt-0.5">Memenuhi standar keahlian nasional</p>
                        </div>
                      </div>
                      <div className="bg-surface-container-high/50 p-4 rounded-xl border border-outline-variant/20 flex items-center gap-3">
                        <span className="material-symbols-outlined text-secondary text-2xl">health_and_safety</span>
                        <div>
                          <p className="text-xs font-bold text-on-surface">K3 Safety Standard Certified</p>
                          <p className="text-[10px] text-on-surface-variant mt-0.5">Keselamatan dan keamanan kerja terjamin</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4">
                  <div className="bg-surface-container p-6 rounded-3xl border border-surface-variant/15 space-y-4">
                    <h4 className="font-bold text-sm text-on-surface uppercase tracking-wider">Statistik Mitra</h4>
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center text-xs py-1 border-b border-surface-variant/10">
                        <span className="text-on-surface-variant font-medium">Pengalaman Kerja</span>
                        <span className="font-bold text-on-surface">{specialist.experience} Tahun</span>
                      </div>
                      <div className="flex justify-between items-center text-xs py-1 border-b border-surface-variant/10">
                        <span className="text-on-surface-variant font-medium">Kredibilitas Pelanggan</span>
                        <span className="font-bold text-green-400">Sangat Baik</span>
                      </div>
                      <div className="flex justify-between items-center text-xs py-1 border-b border-surface-variant/10">
                        <span className="text-on-surface-variant font-medium">Jarak Lokasi</span>
                        <span className="font-bold text-on-surface">{specialist.distance}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs py-1 border-b border-surface-variant/10">
                        <span className="text-on-surface-variant font-medium">Rata-rata Harga Jasa</span>
                        <span className="font-bold text-secondary">{specialist.priceFormatted}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs py-1">
                        <span className="text-on-surface-variant font-medium">Status Akun</span>
                        <span className="font-bold text-green-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Aktif
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "portofolio" && (
              <div className="bg-surface-container p-6 rounded-3xl border border-surface-variant/15 space-y-6">
                {specialist.portfolio.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {specialist.portfolio.map((port, idx) => (
                      <div key={idx} className="bg-surface-container-high/40 p-4 rounded-2xl border border-outline-variant/30 space-y-3">
                        <div className="flex justify-between items-center">
                          <h5 className="font-bold text-xs text-on-surface">{port.label}</h5>
                          <span className="text-[10px] text-on-surface-variant font-semibold bg-surface-container px-2 py-0.5 rounded-full">{port.desc}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="relative rounded-xl overflow-hidden h-36 border border-outline-variant/30">
                            <img className="w-full h-full object-cover" src={port.before} alt="Sebelum" />
                            <span className="absolute bottom-2 left-2 text-[9px] font-bold bg-red-500/90 text-white px-2 py-0.5 rounded uppercase">Sebelum</span>
                          </div>
                          <div className="relative rounded-xl overflow-hidden h-36 border border-outline-variant/30">
                            <img className="w-full h-full object-cover" src={port.after} alt="Sesudah" />
                            <span className="absolute bottom-2 left-2 text-[9px] font-bold bg-green-500/90 text-white px-2 py-0.5 rounded uppercase">Sesudah</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-on-surface-variant text-center py-8 italic">Belum ada portofolio yang diunggah.</p>
                )}
              </div>
            )}

            {activeTab === "ulasan" && (
              <div className="bg-surface-container p-6 rounded-3xl border border-surface-variant/15 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-4 border-b border-surface-variant/10 items-center">
                  <div className="text-center">
                    <h3 className="text-4xl font-extrabold text-secondary">{specialist.rating.toFixed(1)}</h3>
                    <div className="flex justify-center gap-0.5 text-secondary my-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                    </div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase">Skor Kepuasan Umum</p>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    {[
                      { stars: 5, pct: 90 },
                      { stars: 4, pct: 10 },
                      { stars: 3, pct: 0 },
                      { stars: 2, pct: 0 },
                      { stars: 1, pct: 0 }
                    ].map((row, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-[11px] font-semibold text-on-surface-variant">
                        <span className="w-3 shrink-0">{row.stars}</span>
                        <span className="material-symbols-outlined text-[10px] text-secondary shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <div className="flex-grow h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                          <div className="h-full bg-secondary rounded-full" style={{ width: `${row.pct}%` }}></div>
                        </div>
                        <span className="w-8 text-right shrink-0">{row.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  {specialist.reviews.length > 0 ? (
                    specialist.reviews.map((rev, idx) => (
                      <div key={idx} className="space-y-2 text-xs pb-4 border-b border-surface-variant/10 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full overflow-hidden bg-surface-container-high shrink-0">
                              <img className="w-full h-full object-cover" src={rev.avatar} alt={rev.name} />
                            </div>
                            <div>
                              <p className="font-bold text-on-surface text-xs">{rev.name}</p>
                              <div className="flex items-center gap-0.5 text-secondary mt-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: i < rev.rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] text-on-surface-variant/60 font-semibold">{rev.date}</span>
                        </div>
                        <p className="text-on-surface-variant/90 leading-relaxed font-medium italic pl-10">"{rev.comment}"</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-on-surface-variant text-center py-8 italic">Belum ada ulasan dari pelanggan.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "harga" && (
              <div className="space-y-4">
                <div className="bg-surface-container rounded-3xl border border-surface-variant/15 overflow-hidden">
                  {specialist.prices.length > 0 ? (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-surface-container-high border-b border-surface-variant/20 text-on-surface-variant">
                          <th className="p-4 font-bold uppercase tracking-wider">Spesifikasi Layanan</th>
                          <th className="p-4 font-bold uppercase tracking-wider">Estimasi Harga</th>
                          <th className="p-4 font-bold uppercase tracking-wider">Deskripsi Pekerjaan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {specialist.prices.map((svc, idx) => (
                          <tr key={idx} className="border-b border-surface-variant/10 last:border-0 hover:bg-surface-container-high/40 transition-colors">
                            <td className="p-4 font-bold text-on-surface">{svc.name}</td>
                            <td className="p-4 font-extrabold text-secondary">{svc.price}</td>
                            <td className="p-4 text-on-surface-variant font-medium leading-relaxed">{svc.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-xs text-on-surface-variant text-center py-8 italic">Daftar harga belum tersedia.</p>
                  )}
                </div>
                <p className="text-[10px] text-on-surface-variant/60 ml-2">
                  * Harga di atas merupakan estimasi awal pengerjaan standar. Biaya akhir akan disepakati bersama mitra setelah diskusi/negosiasi keluhan melalui Chat.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={() => navigate("/")} 
        role="pelanggan" 
      />
    </div>
  );
}

export default ProfilTukang;
