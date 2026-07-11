import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminData } from "./adminData";
import LogoutModal from "../../components/LogoutModal";
import axios from "axios";

function MonitoringRating() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  const [stats, setStats] = useState({
    averageRating: 0.0,
    totalReviews: 0,
    problematicCount: 0
  });

  const [performances, setPerformances] = useState([]);

  useEffect(() => {
    fetchMonitoringData();
  }, []);

  const fetchMonitoringData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/monitoring`);
      if (response.data.status === 'Sukses') {
        const { averageRating, totalReviews, problematicCount, performances } = response.data.data;
        setStats({ averageRating, totalReviews, problematicCount });
        
        const mappedPerf = performances.map(p => ({
          id: p.id,
          name: p.nama,
          specialty: p.keahlian,
          rating: p.rating || 0.0,
          reviews: p.ulasans_count || 0,
          complaints: 0, // Mock for now, maybe add logic in backend later
          status: p.status_verifikasi === 'Menunggu' ? 'Ditinjau' : (p.status_verifikasi || (p.is_aktif ? 'Aktif' : 'Nonaktif')),
          avatar: p.foto_profil ? (p.foto_profil.startsWith('http') ? p.foto_profil : `${import.meta.env.VITE_API_BASE_URL}/storage/${p.foto_profil}`) : `https://ui-avatars.com/api/?name=${p.nama}&background=random`
        }));
        setPerformances(mappedPerf);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeactivate = async (id) => {
    if (confirm(`Apakah Anda yakin ingin menonaktifkan/mengubah status akun dengan ID ${id}?`)) {
      try {
        const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/admin/tukang/${id}/status`);
        if (response.data.status === 'Sukses') {
          fetchMonitoringData();
          alert(`Status akun ${id} telah berhasil diubah.`);
        }
      } catch (e) {
        alert("Gagal mengubah status tukang.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm(`Apakah Anda yakin ingin MENGHAPUS akun tukang dengan ID ${id} secara permanen? Tindakan ini tidak dapat dibatalkan.`)) {
      try {
        const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/admin/tukang/${id}`);
        if (response.data.status === 'Sukses') {
          fetchMonitoringData();
          alert(response.data.message);
        }
      } catch (e) {
        alert("Gagal menghapus akun tukang.");
      }
    }
  };

  const filteredPerformances = performances.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/admin/dashboard" },
    { id: "verifikasi", label: "Verifikasi Tukang", icon: "how_to_reg", path: "/admin/verifikasi" },
    { id: "data", label: "Data Tukang", icon: "engineering", path: "/admin/data" },
    { id: "pelanggan", label: "Data Pelanggan", icon: "group", path: "/admin/pelanggan" },
    { id: "rating", label: "Monitoring Rating", icon: "star_rate", path: "/admin/rating", active: true },
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
      <aside className={`h-screen w-64 fixed left-0 top-0 bg-surface-container flex flex-col py-6 px-4 z-50 border-r border-surface-variant/20 transition-transform duration-300 lg:transition-none lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-4 mb-8 flex justify-between items-center">
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-secondary">TukangAja</h1>
            <p className="text-on-surface-variant font-label-sm text-[10px] tracking-widest uppercase opacity-60">Service Management</p>
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
                  alt={adminData.name} 
                  src={adminData.avatar}
                />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-on-surface truncate">{adminData.name}</h4>
                <p className="text-[10px] text-on-surface-variant/60 truncate uppercase tracking-wider">{adminData.role}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsLogoutModalOpen(true)}
              className="text-on-surface-variant p-1 flex items-center justify-center cursor-pointer bg-transparent border-none" 
              title="Keluar"
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
              className="lg:hidden p-2 text-on-surface-variant transition-colors cursor-pointer bg-transparent border-none"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">search</span>
              <input 
                className="w-full bg-surface-container-high border-none rounded-full py-2.5 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-secondary/50 transition-all text-sm outline-none" 
                placeholder="Cari nama tukang..." 
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
          
          {/* Header Section */}
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-on-surface">Monitoring Rating &amp; Quality</h2>
            <p className="text-sm text-on-surface-variant/80 font-normal mt-1">Analisis performa mitra tukang dan manajemen komplain pelanggan.</p>
          </div>

          {/* Bento Stats Grid (hover transformations removed) */}
          <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            
            {/* Stat 1: Rating Rata-rata */}
            <div className="bg-surface-container-high/60 backdrop-blur-md p-6 rounded-2xl flex flex-col justify-between border border-surface-variant/20 shadow-lg min-h-[160px]">
              <div>
                <div className="w-11 h-11 rounded-xl bg-secondary/15 flex items-center justify-center mb-3 text-secondary border border-secondary/10 shrink-0">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
                <span className="block text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Rating Rata-rata</span>
                <h3 className="text-3xl font-black mt-1">{stats.averageRating}</h3>
              </div>
              <div className="mt-4 flex items-center gap-2 text-green-400 text-[10px] font-bold">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>+0.2 dari bulan lalu</span>
              </div>
            </div>

            {/* Stat 2: Total Ulasan */}
            <div className="bg-surface-container-high/60 backdrop-blur-md p-6 rounded-2xl flex flex-col justify-between border border-surface-variant/20 shadow-lg min-h-[160px]">
              <div>
                <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center mb-3 text-primary border border-primary/10 shrink-0">
                  <span className="material-symbols-outlined">forum</span>
                </div>
                <span className="block text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Total Ulasan</span>
                <h3 className="text-3xl font-black mt-1">{stats.totalReviews.toLocaleString("id-ID")}</h3>
              </div>
              <div className="mt-4 text-on-surface-variant/75 text-[10px] font-bold">
                98% ulasan terverifikasi
              </div>
            </div>

            {/* Stat 3: Jumlah Komplain Aktif */}
            <div className="bg-red-500/5 backdrop-blur-md p-6 rounded-2xl flex flex-col justify-between border border-red-500/25 shadow-lg md:col-span-2 min-h-[160px]">
              <div className="flex justify-between items-start">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-red-500/15 flex items-center justify-center mb-3 text-red-400 border border-red-500/10 shrink-0">
                    <span className="material-symbols-outlined">report</span>
                  </div>
                  <span className="block text-[9px] text-red-400 font-bold uppercase tracking-wider">Akun Rating Rendah</span>
                  <h3 className="text-3xl font-black text-red-400 mt-1">{stats.problematicCount}</h3>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-bold uppercase mb-1.5">Peringatan Tinggi</span>
                  <p className="text-[10px] text-on-surface-variant/90 max-w-[200px] leading-relaxed">3 akun memerlukan tindakan penonaktifan segera.</p>
                </div>
              </div>
              <div className="mt-4 w-full bg-surface-container h-2 rounded-full overflow-hidden border border-surface-variant/10">
                <div className="bg-red-500 h-full" style={{ width: "75%" }}></div>
              </div>
            </div>

          </section>

          {/* List Table Container */}
          <div className="bg-surface-container/60 border border-surface-variant/15 rounded-2xl overflow-hidden shadow-2xl">
            
            {/* Table Header */}
            <div className="px-6 py-5 border-b border-surface-variant/15 flex justify-between items-center bg-surface-container-high/40">
              <h4 className="font-bold text-sm text-on-surface">Daftar Performa Tukang</h4>
              <div className="flex gap-2">
                <button className="px-3.5 py-2 bg-surface-container border border-surface-variant/20 text-on-surface-variant rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                  <span className="material-symbols-outlined text-base">filter_list</span>
                  Filter Rating
                </button>
                <button className="px-3.5 py-2 bg-surface-container border border-surface-variant/20 text-on-surface-variant rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                  <span className="material-symbols-outlined text-base">download</span>
                  Ekspor Data
                </button>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-container-high/35 text-on-surface-variant uppercase text-[9px] font-bold tracking-widest border-b border-surface-variant/15">
                    <th className="px-6 py-4">Nama Tukang</th>
                    <th className="px-6 py-4 text-center">Rating</th>
                    <th className="px-6 py-4 text-center">Total Ulasan</th>
                    <th className="px-6 py-4 text-center">Komplain</th>
                    <th className="px-6 py-4">Status Akun</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant/10 font-medium">
                  {filteredPerformances.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-on-surface-variant/65">
                        <span className="material-symbols-outlined text-3xl mb-1.5 text-secondary/45">search_off</span>
                        <p className="text-xs font-semibold">Tidak ada data tukang yang cocok.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPerformances.map((item) => {
                      const isLowRating = item.rating < 4.0;
                      const hasHighComplaints = item.complaints >= 5;
                      const isAlert = isLowRating || hasHighComplaints;
                      
                      return (
                        <tr 
                          key={item.id} 
                          className={`border-b border-surface-variant/10 ${
                            isAlert ? "bg-red-500/5" : ""
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img className="w-9 h-9 rounded-lg object-cover border border-surface-variant/20 shrink-0" alt={item.name} src={item.avatar} />
                              <div>
                                <p className="font-bold text-sm text-on-surface">{item.name}</p>
                                <p className="text-[10px] text-on-surface-variant mt-0.5">{item.specialty}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1 font-semibold">
                              <span className={`material-symbols-outlined text-sm ${isLowRating ? "text-red-400" : "text-secondary"}`} style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                              <span className={isLowRating ? "text-red-400 font-bold" : "text-on-surface"}>{item.rating.toFixed(1)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center text-on-surface-variant">{item.reviews}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={item.complaints > 0 ? "text-red-400 font-bold" : "text-on-surface-variant"}>
                              {item.complaints}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wide ${
                              item.status === "Aktif" 
                                ? "bg-green-500/10 border-green-500/20 text-green-400"
                                : item.status === "Ditinjau" || item.status === "Peringatan"
                                ? "bg-red-500/10 border-red-500/20 text-red-400"
                                : "bg-surface-container-highest border-surface-variant/20 text-on-surface-variant"
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2.5">
                              {isAlert ? (
                                <>
                                  <Link 
                                    to="/admin/verifikasi" 
                                    className="px-3 py-1 bg-secondary text-on-secondary rounded-lg text-[10px] font-extrabold uppercase shadow-sm shadow-secondary/15 cursor-pointer flex items-center justify-center"
                                  >
                                    Lihat Detail
                                  </Link>
                                  <button 
                                    onClick={() => handleDeactivate(item.id)}
                                    className="px-3 py-1 border border-red-500/30 text-red-400 rounded-lg text-[10px] font-extrabold uppercase bg-transparent cursor-pointer hover:bg-red-500/10"
                                  >
                                    {item.status === 'Nonaktif' ? 'Aktifkan' : 'Nonaktifkan'}
                                  </button>
                                  <button 
                                    onClick={() => handleDelete(item.id)}
                                    className="px-3 py-1 border border-red-600/40 text-red-500 rounded-lg text-[10px] font-extrabold uppercase bg-transparent cursor-pointer hover:bg-red-500/10"
                                  >
                                    Hapus
                                  </button>
                                </>
                              ) : (
                                <>
                                  <Link 
                                    to="/admin/verifikasi" 
                                    className="p-1.5 bg-surface-container border border-surface-variant/20 rounded-lg text-on-surface-variant cursor-pointer flex items-center justify-center" 
                                    title="Lihat Detail"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                                  </Link>
                                  <button 
                                    onClick={() => handleDeactivate(item.id)}
                                    className="p-1.5 bg-surface-container border border-surface-variant/20 rounded-lg text-on-surface-variant cursor-pointer flex items-center justify-center" 
                                    title={item.status === 'Nonaktif' ? 'Aktifkan' : 'Nonaktifkan'}
                                  >
                                    <span className="material-symbols-outlined text-[16px]">{item.status === 'Nonaktif' ? 'check_circle' : 'block'}</span>
                                  </button>
                                  <button 
                                    onClick={() => handleDelete(item.id)}
                                    className="p-1.5 bg-surface-container border border-red-500/20 rounded-lg text-red-400 cursor-pointer flex items-center justify-center hover:bg-red-500/10" 
                                    title="Hapus Akun"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-5 border-t border-surface-variant/15 flex justify-between items-center bg-surface-container-high/20">
              <span className="text-xs text-on-surface-variant font-medium">Menampilkan {filteredPerformances.length} tukang</span>
            </div>

          </div>

          {/* Quality Insights Section */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Chart Bento Card */}
            <div className="bg-surface-container/60 border border-surface-variant/15 rounded-2xl p-5 shadow-lg">
              <h5 className="font-bold text-sm mb-6 flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-secondary">analytics</span>
                Trend Rating 30 Hari Terakhir
              </h5>
              
              <div className="h-60 flex items-end justify-between gap-3 px-2">
                <div className="flex-1 bg-secondary/15 border border-secondary/10 rounded-t-lg" style={{ height: "60%" }}></div>
                <div className="flex-1 bg-secondary/25 border border-secondary/15 rounded-t-lg" style={{ height: "65%" }}></div>
                <div className="flex-1 bg-secondary/35 border border-secondary/20 rounded-t-lg" style={{ height: "75%" }}></div>
                <div className="flex-1 bg-secondary/45 border border-secondary/20 rounded-t-lg" style={{ height: "70%" }}></div>
                <div className="flex-1 bg-secondary/35 border border-secondary/20 rounded-t-lg" style={{ height: "80%" }}></div>
                <div className="flex-1 bg-secondary border border-secondary/20 rounded-t-lg shadow-lg shadow-secondary/10" style={{ height: "90%" }}></div>
                <div className="flex-1 bg-secondary/80 border border-secondary/20 rounded-t-lg" style={{ height: "85%" }}></div>
              </div>
              
              <div className="mt-4 flex justify-between text-[10px] text-on-surface-variant px-2 font-bold uppercase tracking-wider">
                <span>Minggu 1</span>
                <span>Minggu 2</span>
                <span>Minggu 3</span>
                <span>Hari Ini</span>
              </div>
            </div>

            {/* Complaint Categories Bento Card */}
            <div className="bg-surface-container/60 border border-surface-variant/15 rounded-2xl p-5 shadow-lg">
              <h5 className="font-bold text-sm mb-6 flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-red-400">warning</span>
                Kategori Komplain Terbanyak
              </h5>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-bold">
                    <span className="text-on-surface-variant">Pekerjaan Tidak Rapi</span>
                    <span className="text-on-surface">45%</span>
                  </div>
                  <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden border border-surface-variant/10">
                    <div className="bg-secondary h-full" style={{ width: "45%" }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-bold">
                    <span className="text-on-surface-variant">Keterlambatan</span>
                    <span className="text-on-surface">30%</span>
                  </div>
                  <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden border border-surface-variant/10">
                    <div className="bg-secondary h-full" style={{ width: "30%" }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-bold">
                    <span className="text-on-surface-variant">Komunikasi Buruk</span>
                    <span className="text-on-surface">15%</span>
                  </div>
                  <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden border border-surface-variant/10">
                    <div className="bg-secondary h-full" style={{ width: "15%" }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-bold">
                    <span className="text-on-surface-variant">Harga Tidak Sesuai</span>
                    <span className="text-on-surface">10%</span>
                  </div>
                  <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden border border-surface-variant/10">
                    <div className="bg-secondary h-full" style={{ width: "10%" }}></div>
                  </div>
                </div>
              </div>
            </div>

          </section>

        </div>
      </main>

      {/* Decorative Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-secondary/5 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-primary/5 blur-[80px] rounded-full"></div>
      </div>

      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={() => navigate("/")} 
        role="admin" 
      />
    </div>
  );
}

export default MonitoringRating;
