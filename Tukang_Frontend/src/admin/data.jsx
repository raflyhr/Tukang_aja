import { useState } from "react";
import { Link } from "react-router-dom";

function DataTukang() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("Terbaru");
  
  // Toast state
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [lastDeactivatedId, setLastDeactivatedId] = useState(null);

  // Initial Tukang list
  const [tukangs, setTukangs] = useState([
    {
      id: "TKG-9842",
      name: "Agus Setiawan",
      category: "Listrik & AC",
      location: "Jakarta Selatan",
      status: "Aktif",
      rating: 4.9,
      reviews: 128,
      joinDate: "12 Jan 2023",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD7l2fBzOsQ-fzUo9QvZATzFqP8V2Gqtg0ihmvM_rhHgtRdd22pOfHcJVj8mh3fMUf_nTKIB3EDVe1noayy3jTuEgZu1n13Kb23FSkgdckG53-RD0wYuUKTWFRCoeVZOVV9ByXImLtQzH-rhmRjzFIxnFsrFp4aII-MWXS2QyXpl9humsvoRKs_iiS2yd0uiT7X6v0Il2JP6itUq87lJ4mljieMw1o7krKq33EG5xMjHSMLBuROHXI3Q0oDNpx4l6nxpp86RwJKWGUv"
    },
    {
      id: "TKG-7123",
      name: "Supardi Slamet",
      category: "Pipa & Ledeng",
      location: "Depok",
      status: "Menunggu",
      rating: 0.0,
      reviews: 0,
      joinDate: "05 Mar 2024",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxj2JOBaiT3dvyTZ4UdUUyg7hr8_xWJ7nNEUFU5wJ32tmUEM7S3jUVVtgrUlkAxzBTafpEzUM3dvOjmL-ME2UWnrBHVQNGtVENnwZ47M-jrqnQLptANjiBRpCQdXJtlMo5mi8X7dxfvCAwuCVZ-tzM-Xy5dVlG6SR6NUMqrypLzqii9zTxSMj27Fm5NZgjyiT-uIfQkMOr0-zStRGii5xqB0dEyj8gkrneFFKFRrT1sgLmFHGTpPOBifDXC1mxkCdzLtB65BZV_iAu"
    },
    {
      id: "TKG-5521",
      name: "Dewi Lestari",
      category: "Pengecatan & Dekor",
      location: "Tangerang",
      status: "Aktif",
      rating: 4.7,
      reviews: 45,
      joinDate: "21 Nov 2023",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9N9ouswxxtFNdmpfQrjQy0RhlSBgjVfK1RP3uglsSMxeN3S5yXUv6WECifR8SlUlX9I14aTmDfXuWdtl732i0P5zWno5xtrRfEnghHA4M_2xUpcdTOy7J-Hin5JrRZyc1TFZnch_OSDbgAgURBDuMHTlMiL04H6QsMaaI1Hyb4-i_p5HuUhjhL2aA7z9v_1V-RECSXf_Q8OR-Su-O7MufBHZryl8DFt8l3LTeyKNF8p_7cQy3Zfdu_vD_7VOeJwuEjJvY-tEuxw5I"
    },
    {
      id: "TKG-2019",
      name: "Hendrik Wijaya",
      category: "Kayu & Konstruksi",
      location: "Bekasi",
      status: "Tidak Aktif",
      rating: 4.2,
      reviews: 12,
      joinDate: "10 Aug 2022",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBG27b6ZShzgQdzfekaiNWP-rcLP262GbB6GgAi2Vrw3g39d_8UAHIBJmByrkeKuWJnOOn6mqACMtmDVAS51L3KQReFeKbIAicrXKqM-esRV3Cx4X9lniqAb6oAjCt2J00Pyx_9j3_94hDVXiaNgcFKp3HMvbtFdRyuS638bZocOVTjh0aRYNmIbaRksefjcypFWNM0L20jFmGZoSORpAfXAXePciLsUblN38X7vh1vKJyXbdP_BAhG8iII9CF2eymWzDNdUutfqGKf"
    }
  ]);

  const handleDeactivate = (id) => {
    const updated = tukangs.map(t => {
      if (t.id === id) {
        return { ...t, status: "Tidak Aktif" };
      }
      return t;
    });
    setTukangs(updated);
    setLastDeactivatedId(id);
    setToastMessage(`1 Akun Tukang (${id}) telah berhasil dinonaktifkan.`);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  const handleUndoDeactivate = () => {
    if (!lastDeactivatedId) return;
    const updated = tukangs.map(t => {
      if (t.id === lastDeactivatedId) {
        return { ...t, status: "Aktif" };
      }
      return t;
    });
    setTukangs(updated);
    setShowToast(false);
    setLastDeactivatedId(null);
  };

  const handleExport = () => {
    alert("Mengekspor data tukang ke format CSV...");
  };

  const handleAddTukang = () => {
    alert("Membuka formulir pendaftaran tukang baru...");
  };

  // Filter & Sort Logic
  const filteredTukangs = tukangs
    .filter(t => {
      if (filterStatus === "Semua") return true;
      return t.status.toLowerCase() === filterStatus.toLowerCase();
    })
    .filter(t => {
      const query = searchQuery.toLowerCase();
      return t.name.toLowerCase().includes(query) || t.category.toLowerCase().includes(query) || t.id.toLowerCase().includes(query);
    })
    .sort((a, b) => {
      if (sortOption === "Rating Tertinggi") {
        return b.rating - a.rating;
      }
      if (sortOption === "Abjad A-Z") {
        return a.name.localeCompare(b.name);
      }
      // Fallback or "Terbaru"
      return b.id.localeCompare(a.id);
    });

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/admin/dashboard" },
    { id: "verifikasi", label: "Verifikasi Tukang", icon: "how_to_reg", path: "/admin/verifikasi" },
    { id: "data", label: "Data Tukang", icon: "engineering", path: "/admin/data", active: true },
    { id: "rating", label: "Monitoring Rating", icon: "star_rate", path: "/admin/rating" },
    { id: "profil", label: "Profil Admin", icon: "admin_panel_settings", path: "/admin/profil" },
  ];

  return (
    <div className="bg-background text-on-surface min-h-screen selection:bg-secondary/30 selection:text-secondary font-sans relative overflow-x-hidden flex">
      
      {/* Backdrop for Mobile Sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SideNavBar - Styled exactly like the customer/admin dashboard */}
      <aside className={`h-screen w-64 fixed left-0 top-0 bg-surface-container flex flex-col py-6 px-4 z-50 border-r border-surface-variant/20 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-4 mb-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary/15 rounded-lg flex items-center justify-center text-secondary border border-secondary/10 shrink-0">
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>engineering</span>
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md font-bold text-secondary text-sm">TukangAja</h1>
              <p className="text-on-surface-variant font-label-sm text-[9px] tracking-widest uppercase opacity-60">Service Management</p>
            </div>
          </div>
          <button className="lg:hidden text-on-surface-variant hover:text-on-surface cursor-pointer bg-transparent border-none" onClick={() => setIsSidebarOpen(false)}>
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
                className={`w-full flex items-center gap-4 py-3 px-4 font-semibold rounded-xl text-left cursor-pointer ${
                  isActive
                    ? "text-secondary border-r-4 border-secondary bg-surface-container-highest shadow-[10px_0_20px_-10px_rgba(255,183,131,0.3)]"
                    : "text-on-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
                <span className="text-sm font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Profile Section at Bottom */}
        <div className="mt-auto pt-4 border-t border-surface-variant/20">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/30 shrink-0">
                <img 
                  className="w-full h-full object-cover" 
                  alt="Super Admin" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSTqGhb4RjOSZcRd_yUppzK5nxOyWm47BZblGHTMKIvHRf74MTmyUM3mLR9wk6BOEA-ZWfKGRy4Gw30Sb4bnOjyNj3BH-vF--MrjF7nsei-FdGZavcuZHrQmcpn0W8mhkHjILBNxFvml8BHe4aChG9BvAq93iRJ0UonsSxiVL-uAEMZGFoC_Rfqk3D1soa9onuUgkb5gAUHKfZmzie8InzGwA9MjaXIexaFzLYj6qo9KHKUESxuMIS1V4vZNiE4EgRzgHT0XhRezXt"
                />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-on-surface truncate">Budi Santoso</h4>
                <p className="text-xs text-on-surface-variant/60 truncate">Super Admin</p>
              </div>
            </div>
            <Link to="/" className="text-on-surface-variant p-1 flex items-center justify-center cursor-pointer" title="Keluar">
              <span className="material-symbols-outlined">logout</span>
            </Link>
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
              className="lg:hidden p-2 text-on-surface-variant transition-colors cursor-pointer bg-transparent border-none"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">search</span>
              <input 
                className="w-full bg-surface-container-high border-none rounded-full py-2.5 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-secondary/50 transition-all text-sm outline-none" 
                placeholder="Cari nama tukang atau kategori..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-on-surface-variant relative cursor-pointer flex items-center justify-center bg-transparent border-none">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full"></span>
            </button>
            <button className="p-2 text-on-surface-variant cursor-pointer flex items-center justify-center bg-transparent border-none">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </header>

        {/* Canvas */}
        <div className="pt-28 pb-12 px-6 md:px-12 max-w-7xl w-full mx-auto space-y-8 flex-grow page-transition">
          
          {/* Header & Main Title */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-on-surface">Manajemen Data Tukang</h1>
              <p className="text-sm text-on-surface-variant/80 font-normal mt-1">Kelola dan pantau seluruh penyedia jasa profesional yang terdaftar.</p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2.5 bg-surface-container border border-surface-variant/20 rounded-xl text-xs font-bold text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">file_download</span>
                Ekspor Data
              </button>
              <button 
                onClick={handleAddTukang}
                className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-on-secondary rounded-xl text-xs font-extrabold cursor-pointer border-none shadow-md shadow-secondary/15"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Tambah Tukang
              </button>
            </div>
          </div>

          {/* Quick Statistics (hover transformations removed) */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Total Tukang */}
            <div className="bg-surface-container-high/60 backdrop-blur-md p-5 rounded-2xl flex items-center gap-4 border border-surface-variant/20 shadow-lg">
              <div className="w-12 h-12 bg-secondary/15 rounded-full flex items-center justify-center text-secondary border border-secondary/10 shrink-0">
                <span className="material-symbols-outlined text-[24px]">group</span>
              </div>
              <div>
                <span className="block text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Total Tukang</span>
                <span className="text-xl font-black">1.248</span>
              </div>
            </div>

            {/* Card 2: Aktif */}
            <div className="bg-surface-container-high/60 backdrop-blur-md p-5 rounded-2xl flex items-center gap-4 border border-surface-variant/20 shadow-lg">
              <div className="w-12 h-12 bg-green-500/15 rounded-full flex items-center justify-center text-green-400 border border-green-500/10 shrink-0">
                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
              <div>
                <span className="block text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Aktif</span>
                <span className="text-xl font-black text-green-400">942</span>
              </div>
            </div>

            {/* Card 3: Menunggu */}
            <div className="bg-surface-container-high/60 backdrop-blur-md p-5 rounded-2xl flex items-center gap-4 border border-surface-variant/20 shadow-lg">
              <div className="w-12 h-12 bg-yellow-500/15 rounded-full flex items-center justify-center text-yellow-400 border border-yellow-500/10 shrink-0">
                <span className="material-symbols-outlined text-[24px]">pending</span>
              </div>
              <div>
                <span className="block text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Menunggu</span>
                <span className="text-xl font-black text-yellow-400">56</span>
              </div>
            </div>

            {/* Card 4: Nonaktif */}
            <div className="bg-surface-container-high/60 backdrop-blur-md p-5 rounded-2xl flex items-center gap-4 border border-surface-variant/20 shadow-lg">
              <div className="w-12 h-12 bg-red-500/15 rounded-full flex items-center justify-center text-red-400 border border-red-500/10 shrink-0">
                <span className="material-symbols-outlined text-[24px]">cancel</span>
              </div>
              <div>
                <span className="block text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Nonaktif</span>
                <span className="text-xl font-black text-red-400">250</span>
              </div>
            </div>
          </section>

          {/* Filters & Table Section */}
          <div className="bg-surface-container/60 border border-surface-variant/15 rounded-2xl overflow-hidden shadow-2xl">
            
            {/* Filter Actions Header */}
            <div className="p-5 border-b border-surface-variant/15 flex flex-wrap gap-4 items-center justify-between bg-surface-container-high/40">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-on-surface-variant mr-2">Filter Status:</span>
                {["Semua", "Aktif", "Menunggu", "Tidak Aktif"].map(status => (
                  <button 
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                      filterStatus === status 
                        ? "bg-secondary text-on-secondary border-secondary shadow-sm shadow-secondary/15" 
                        : "bg-surface-container-low border-surface-variant/20 text-on-surface-variant"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-3">
                <select 
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-surface-container-low border border-surface-variant/20 rounded-xl px-3 py-1.5 text-xs text-on-surface focus:outline-none"
                >
                  <option value="Terbaru">Urutkan: Terbaru</option>
                  <option value="Rating Tertinggi">Urutkan: Rating Tertinggi</option>
                  <option value="Abjad A-Z">Urutkan: Abjad A-Z</option>
                </select>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-container-high/35 text-on-surface-variant uppercase text-[9px] font-bold tracking-widest border-b border-surface-variant/15">
                    <th className="px-6 py-4">Nama</th>
                    <th className="px-6 py-4">Kategori Jasa</th>
                    <th className="px-6 py-4">Lokasi</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Rating</th>
                    <th className="px-6 py-4">Tanggal Bergabung</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant/10 font-medium">
                  {filteredTukangs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-on-surface-variant/65">
                        <span className="material-symbols-outlined text-3xl mb-1.5 text-secondary/45">search_off</span>
                        <p className="text-xs font-semibold">Tidak ada data tukang yang cocok dengan kriteria.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredTukangs.map((t) => (
                      <tr key={t.id} className="border-b border-surface-variant/10">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-surface-container-highest border border-surface-variant/20 overflow-hidden shrink-0">
                              <img className="w-full h-full object-cover" alt={t.name} src={t.avatar} />
                            </div>
                            <div>
                              <span className="block font-bold text-sm text-on-surface">{t.name}</span>
                              <span className="block text-[9px] text-on-surface-variant/65 font-mono">{t.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-on-surface font-semibold">{t.category}</td>
                        <td className="px-6 py-4 text-on-surface-variant">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">location_on</span>
                            {t.location}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wide ${
                            t.status === "Aktif" 
                              ? "bg-green-500/10 border-green-500/20 text-green-400"
                              : t.status === "Menunggu"
                              ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                              : "bg-red-500/10 border-red-500/20 text-red-400"
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 font-semibold">
                            <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            <span className="text-on-surface">{t.rating.toFixed(1)}</span>
                            <span className="text-[10px] text-on-surface-variant">({t.reviews})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant">{t.joinDate}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link 
                              to="/admin/verifikasi"
                              className="p-1.5 bg-surface-container border border-surface-variant/20 rounded-lg text-on-surface-variant cursor-pointer flex items-center justify-center" 
                              title="Lihat Profil"
                            >
                              <span className="material-symbols-outlined text-[16px]">visibility</span>
                            </Link>
                            
                            <button 
                              onClick={() => handleDeactivate(t.id)}
                              disabled={t.status === "Tidak Aktif"}
                              className={`p-1.5 bg-surface-container border border-surface-variant/20 rounded-lg text-on-surface-variant cursor-pointer flex items-center justify-center ${
                                t.status === "Tidak Aktif" ? "opacity-35 cursor-not-allowed" : ""
                              }`} 
                              title="Nonaktifkan Akun"
                            >
                              <span className="material-symbols-outlined text-[16px]">block</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-5 border-t border-surface-variant/15 flex items-center justify-between bg-surface-container-high/20">
              <span className="text-xs text-on-surface-variant font-medium">Menampilkan 1 - {filteredTukangs.length} dari 1.248 tukang</span>
              <div className="flex gap-1.5">
                <button className="p-1.5 rounded-lg border border-surface-variant/20 text-on-surface-variant bg-transparent cursor-pointer" disabled>
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
                <button className="w-8 h-8 rounded-lg bg-secondary text-on-secondary text-xs font-bold shadow-md shadow-secondary/10 border-none cursor-pointer">1</button>
                <button className="w-8 h-8 rounded-lg border border-surface-variant/20 text-on-surface-variant text-xs font-bold bg-transparent cursor-pointer">2</button>
                <button className="w-8 h-8 rounded-lg border border-surface-variant/20 text-on-surface-variant text-xs font-bold bg-transparent cursor-pointer">3</button>
                <span className="flex items-end px-1 text-on-surface-variant">...</span>
                <button className="w-8 h-8 rounded-lg border border-surface-variant/20 text-on-surface-variant text-xs font-bold bg-transparent cursor-pointer">312</button>
                <button className="p-1.5 rounded-lg border border-surface-variant/20 text-on-surface-variant bg-transparent cursor-pointer">
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Floating Action Toast Notification Bar */}
      {showToast && (
        <div className="fixed bottom-6 right-8 left-6 md:left-[calc(256px+32px)] flex justify-between items-center bg-secondary text-on-secondary py-3 px-6 rounded-2xl shadow-2xl z-50">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-on-secondary">info</span>
            <p className="text-sm font-bold text-on-secondary">{toastMessage}</p>
          </div>
          <button 
            onClick={handleUndoDeactivate}
            className="text-xs font-extrabold underline text-on-secondary bg-transparent border-none cursor-pointer"
          >
            Batalkan
          </button>
        </div>
      )}

      {/* Decorative Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-secondary/5 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-primary/5 blur-[80px] rounded-full"></div>
      </div>

    </div>
  );
}

export default DataTukang;
