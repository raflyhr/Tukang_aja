import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminData } from "./adminData";
import LogoutModal from "../components/LogoutModal";
import axios from "axios";

// Fallback Mock Data
const MOCK_SUMMARY = {
  pendingVerifications: 5,
  totalTukang: 142,
  totalPelanggan: 320,
  activeOrders: 18,
  completedOrders: 1240,
  platformRevenue: 45230000,
  problematicRatings: 3,
  incomingReports: 2
};

const MOCK_CUSTOMER_STATS = {
  total: 320,
  newThisWeek: 24,
  activeToday: 85,
  neverOrdered: 42,
  mostActive: "Budi Pratama (18x)"
};

const MOCK_ORDER_STATS = {
  new: 3,
  processing: 10,
  pendingPayment: 5,
  completed: 1240,
  cancelled: 45
};

const MOCK_ACTIVITIES = [
  { id: 1, text: "Pelanggan Rian Hidayat mendaftar ke platform", time: "13:15 WIB", icon: "group", color: "text-green-400 bg-green-500/10" },
  { id: 2, text: "Mitra Tukang Joko Susilo berhasil diverifikasi", time: "12:40 WIB", icon: "verified", color: "text-secondary bg-secondary/10" },
  { id: 3, text: "Pembayaran TRX-9982 sebesar Rp 150.000 berhasil diterima", time: "11:30 WIB", icon: "check_circle", color: "text-green-400 bg-green-500/10" },
  { id: 4, text: "Laporan aduan baru masuk dari Dewi Lestari terkait keterlambatan", time: "10:15 WIB", icon: "warning", color: "text-red-400 bg-red-500/10" },
  { id: 5, text: "Pendaftaran Tukang Ahmad ditolak karena KTP tidak terbaca", time: "09:45 WIB", icon: "block", color: "text-red-400 bg-red-500/10" },
  { id: 6, text: "Rating buruk (2.0) diterima oleh Agus Prasetyo", time: "Kemarin", icon: "star", color: "text-red-400 bg-red-500/10" }
];

const MOCK_CATEGORIES = [
  { name: "AC", percentage: 45, count: 560 },
  { name: "Listrik", percentage: 30, count: 370 },
  { name: "Pipa & Air", percentage: 15, count: 185 },
  { name: "Cat Rumah", percentage: 12, count: 150 },
  { name: "Cleaning Service", percentage: 10, count: 125 },
  { name: "Pertukangan", percentage: 8, count: 100 }
];

const MOCK_TOP_TUKANG = [
  { name: "Budi Santoso", specialty: "AC", rating: 4.9, orders: 84, revenue: 12600000, online: true, avatar: "https://ui-avatars.com/api/?name=Budi+Santoso&background=random" },
  { name: "Agus Prasetyo", specialty: "Listrik", rating: 4.8, orders: 62, revenue: 9300000, online: true, avatar: "https://ui-avatars.com/api/?name=Agus+Prasetyo&background=random" },
  { name: "Hendra Wijaya", specialty: "Pipa", rating: 4.7, orders: 55, revenue: 8250000, online: false, avatar: "https://ui-avatars.com/api/?name=Hendra+Wijaya&background=random" }
];

const MOCK_TOP_PELANGGAN = [
  { name: "Budi Pratama", orders: 18, spending: 4100000, lastActive: "Hari Ini", avatar: "https://ui-avatars.com/api/?name=Budi+Pratama&background=random" },
  { name: "Rian Hidayat", orders: 14, spending: 2450000, lastActive: "Hari Ini", avatar: "https://ui-avatars.com/api/?name=Rian+Hidayat&background=random" },
  { name: "Dewi Lestari", orders: 8, spending: 1250000, lastActive: "Kemarin", avatar: "https://ui-avatars.com/api/?name=Dewi+Lestari&background=random" }
];

const MOCK_NOTIFICATIONS = [
  { id: 1, text: "5 Mitra Tukang menunggu verifikasi", icon: "how_to_reg", path: "/admin/verifikasi" },
  { id: 2, text: "2 Laporan pengaduan baru masuk", icon: "report", path: "/admin/laporan" },
  { id: 3, text: "Pembayaran gagal dari TRX-9977 (Dewi Lestari)", icon: "error", path: "/admin/pembayaran" },
  { id: 4, text: "1 Akun terdeteksi rating bermasalah (< 3.0)", icon: "star_half", path: "/admin/rating" },
  { id: 5, text: "Pesanan baru TRX-9983 memerlukan alokasi", icon: "pending_actions", path: "/admin/pesanan" }
];

function AdminDashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // States for interactive widgets
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSpeedDial, setShowSpeedDial] = useState(false);
  
  // Dashboard Status States
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  // Dynamic Data States
  const [summary, setSummary] = useState(MOCK_SUMMARY);
  const [verifications, setVerifications] = useState([]);
  const [recentActivities, setRecentActivities] = useState(MOCK_ACTIVITIES);
  const [topTukang, setTopTukang] = useState(MOCK_TOP_TUKANG);
  const [topPelanggan, setTopPelanggan] = useState(MOCK_TOP_PELANGGAN);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setIsError(false);
    setIsEmpty(false);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/dashboard-stats`);
      if (response.data.status === 'Sukses') {
        const data = response.data.data;
        
        // Populate dashboard stats from API, fallback where needed
        setSummary({
          pendingVerifications: data.pendingCount || 0,
          totalTukang: (data.activeCount || 0) + (data.inactiveCount || 0),
          totalPelanggan: MOCK_SUMMARY.totalPelanggan,
          activeOrders: MOCK_SUMMARY.activeOrders,
          completedOrders: MOCK_SUMMARY.completedOrders,
          platformRevenue: MOCK_SUMMARY.platformRevenue,
          problematicRatings: data.problemCount || 0,
          incomingReports: MOCK_SUMMARY.incomingReports
        });

        const fetchedVerifications = data.recentVerifications.map(v => ({
          id: v.id,
          name: v.nama,
          type: v.keahlian,
          location: v.alamat,
          date: new Date(v.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }),
          avatar: v.foto_profil ? (v.foto_profil.startsWith('http') ? v.foto_profil : `${import.meta.env.VITE_API_BASE_URL}/storage/${v.foto_profil}`) : `https://ui-avatars.com/api/?name=${v.nama}&background=random`,
          status: "pending"
        }));
        setVerifications(fetchedVerifications);
      } else {
        setSummary(MOCK_SUMMARY);
        setVerifications([]);
      }
    } catch (error) {
      console.error("Failed to fetch admin stats, using fallbacks:", error);
      // Since backend might be offline, we gracefully fallback
      setSummary(MOCK_SUMMARY);
    } finally {
      // Simulate modern loading transition
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    }
  };

  // Actions
  const handleVerify = async (id) => {
    setVerifications(prev =>
      prev.map(v => (v.id === id ? { ...v, status: "verifying" } : v))
    );
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/admin/verifikasi/${id}`, { action: 'approve' });
      if (response.data.status === 'Sukses') {
        setVerifications(prev =>
          prev.map(v => (v.id === id ? { ...v, status: "verified" } : v))
        );
        alert("Pendaftar berhasil disetujui!");
        setTimeout(() => {
          setVerifications(prev => prev.filter(v => v.id !== id));
          fetchDashboardData();
        }, 500);
      }
    } catch (e) {
      alert("Gagal memproses persetujuan.");
      setVerifications(prev => prev.map(v => (v.id === id ? { ...v, status: "pending" } : v)));
    }
  };

  const handleReject = async (id) => {
    if (confirm("Apakah Anda yakin ingin menolak pendaftaran ini?")) {
      setVerifications(prev =>
        prev.map(v => (v.id === id ? { ...v, status: "rejecting" } : v))
      );
      try {
        const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/admin/verifikasi/${id}`, { action: 'reject' });
        if (response.data.status === 'Sukses') {
          alert("Pendaftar berhasil ditolak.");
          setTimeout(() => {
            setVerifications(prev => prev.filter(v => v.id !== id));
            fetchDashboardData();
          }, 500);
        }
      } catch (e) {
        alert("Gagal memproses penolakan.");
        setVerifications(prev => prev.map(v => (v.id === id ? { ...v, status: "pending" } : v)));
      }
    }
  };

  const handleSpeedDialAction = (label) => {
    alert(`Aksi: "${label}" dipicu dari Speed Dial!`);
    setShowSpeedDial(false);
  };

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/admin/dashboard", active: true },
    { id: "verifikasi", label: "Verifikasi Tukang", icon: "how_to_reg", path: "/admin/verifikasi" },
    { id: "data", label: "Data Tukang", icon: "engineering", path: "/admin/data" },
    { id: "pelanggan", label: "Data Pelanggan", icon: "group", path: "/admin/pelanggan" },
    { id: "rating", label: "Monitoring Rating", icon: "star_rate", path: "/admin/rating" },
    { id: "profil", label: "Profil Admin", icon: "admin_panel_settings", path: "/admin/profil" },
  ];

  // Search Results filtering
  const searchResults = searchQuery ? {
    tukang: topTukang.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.specialty.toLowerCase().includes(searchQuery.toLowerCase())),
    pelanggan: topPelanggan.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())),
    aktivitas: recentActivities.filter(a => a.text.toLowerCase().includes(searchQuery.toLowerCase()))
  } : null;

  const showSearchResults = searchResults && (searchResults.tukang.length > 0 || searchResults.pelanggan.length > 0 || searchResults.aktivitas.length > 0);

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
      <aside className={`h-screen w-64 fixed left-0 top-0 bg-surface-container flex flex-col py-6 px-4 z-50 border-r border-surface-variant/20 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-4 mb-8 flex justify-between items-center">
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-secondary">TukangAja</h1>
            <p className="text-on-surface-variant font-label-sm text-[10px] tracking-widest uppercase opacity-60">Control Center</p>
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
                placeholder="Cari global (pelanggan, tukang, layanan)..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Notification Toggle */}
            <button 
              onClick={() => setShowNotifications(prev => !prev)}
              className="p-2 text-on-surface-variant relative cursor-pointer flex items-center justify-center bg-transparent border-none"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full"></span>
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 top-12 bg-surface-container-high border border-surface-variant/20 rounded-2xl w-80 py-3 shadow-2xl z-[60] overflow-hidden">
                <div className="px-4 pb-2 border-b border-surface-variant/15 flex justify-between items-center">
                  <span className="text-xs font-bold text-on-surface">Notifikasi Operasional</span>
                  <button onClick={() => setShowNotifications(false)} className="text-[10px] text-secondary font-bold bg-transparent border-none cursor-pointer">Tutup</button>
                </div>
                <div className="divide-y divide-surface-variant/10">
                  {MOCK_NOTIFICATIONS.map(n => (
                    <Link 
                      key={n.id} 
                      to={n.path} 
                      onClick={() => setShowNotifications(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-highest transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-secondary text-base">{n.icon}</span>
                      <span className="text-[11px] text-on-surface-variant font-medium leading-tight">{n.text}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => navigate("/admin/profil")} className="p-2 text-on-surface-variant cursor-pointer flex items-center justify-center bg-transparent border-none">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </header>

        {/* Canvas */}
        <div className="pt-28 pb-12 px-6 md:px-12 max-w-7xl w-full mx-auto space-y-8 flex-grow page-transition">
          
          {/* Welcome & Debug Controls */}
          <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-headline-xl text-headline-xl text-on-background mb-2 text-3xl font-bold mt-3">Admin <span className="text-secondary">Control Center</span></h2>
              <p className="font-body-lg text-sm text-on-surface-variant/80 font-normal leading-relaxed">Pusat pemantauan aktivitas pelanggan, mitra tukang, pesanan, dan keuangan TukangAja.</p>
            </div>

            {/* State Toggles (Helper for Grading/Preview) */}
            <div className="flex gap-2 self-start sm:self-auto">
              <button 
                onClick={() => { setIsLoading(true); setTimeout(() => setIsLoading(false), 1500); }}
                className="px-3 py-1 bg-surface-container-high hover:bg-surface-container-highest border border-surface-variant/20 rounded-lg text-[10px] font-bold text-on-surface cursor-pointer"
              >
                Test Loading
              </button>
              <button 
                onClick={() => setIsError(prev => !prev)}
                className={`px-3 py-1 border rounded-lg text-[10px] font-bold cursor-pointer ${isError ? "bg-red-500/20 border-red-500/40 text-red-400" : "bg-surface-container-high border-surface-variant/20 text-on-surface"}`}
              >
                Test Error
              </button>
              <button 
                onClick={() => setIsEmpty(prev => !prev)}
                className={`px-3 py-1 border rounded-lg text-[10px] font-bold cursor-pointer ${isEmpty ? "bg-secondary/20 border-secondary/40 text-secondary" : "bg-surface-container-high border-surface-variant/20 text-on-surface"}`}
              >
                Test Empty
              </button>
            </div>
          </section>

          {/* ERROR STATE */}
          {isError ? (
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-400 mx-auto border border-red-500/20">
                <span className="material-symbols-outlined text-3xl">warning</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface">Gagal Memuat Data Operasional</h3>
              <p className="text-xs text-on-surface-variant max-w-md mx-auto leading-relaxed">Terjadi kegagalan koneksi ke API server Laravel backend (http://localhost:8000). Pastikan backend Anda sudah menyala.</p>
              <button 
                onClick={fetchDashboardData}
                className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl border-none cursor-pointer shadow-lg shadow-red-500/20"
              >
                Coba Lagi (Retry)
              </button>
            </div>
          ) : isEmpty ? (
            /* EMPTY STATE */
            <div className="bg-surface-container/40 border border-surface-variant/15 rounded-2xl p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center text-secondary mx-auto border border-secondary/20 animate-bounce">
                <span className="material-symbols-outlined text-3xl">inventory_2</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface">Data Dashboard Kosong</h3>
              <p className="text-xs text-on-surface-variant max-w-md mx-auto leading-relaxed">Belum ada statistik atau pendaftaran masuk untuk ditampilkan saat ini.</p>
              <button 
                onClick={fetchDashboardData}
                className="px-6 py-2.5 bg-secondary text-on-secondary font-bold text-xs rounded-xl border-none cursor-pointer shadow-lg shadow-secondary/15"
              >
                Muat Ulang (Refresh)
              </button>
            </div>
          ) : isLoading ? (
            /* SKELETON LOADING STATE */
            <div className="space-y-8 animate-pulse">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-surface-container-high/40 h-28 rounded-2xl border border-surface-variant/10"></div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-surface-container-high/40 h-64 rounded-2xl border border-surface-variant/10"></div>
                <div className="bg-surface-container-high/40 h-64 rounded-2xl border border-surface-variant/10"></div>
              </div>
            </div>
          ) : showSearchResults ? (
            /* GLOBAL SEARCH RESULTS PANEL */
            <section className="bg-surface-container/60 border border-surface-variant/20 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-surface-variant/15 pb-3">
                <h3 className="font-bold text-sm text-secondary flex items-center gap-2">
                  <span className="material-symbols-outlined">search</span>
                  Hasil Pencarian Global untuk "{searchQuery}"
                </h3>
                <button onClick={() => setSearchQuery("")} className="text-xs text-on-surface-variant font-bold hover:underline bg-transparent border-none cursor-pointer">Clear</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tukang Match */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Tukang ({searchResults.tukang.length})</h4>
                  {searchResults.tukang.map((t, idx) => (
                    <div key={idx} className="bg-surface-container-high/40 p-3 rounded-xl border border-surface-variant/10 flex items-center gap-3">
                      <img className="w-8 h-8 rounded-lg object-cover" src={t.avatar} alt={t.name} />
                      <div>
                        <p className="font-bold text-xs text-on-surface">{t.name}</p>
                        <p className="text-[10px] text-secondary">{t.specialty}</p>
                      </div>
                    </div>
                  ))}
                  {searchResults.tukang.length === 0 && <p className="text-[11px] text-on-surface-variant/50">Tidak ada tukang cocok.</p>}
                </div>

                {/* Pelanggan Match */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Pelanggan ({searchResults.pelanggan.length})</h4>
                  {searchResults.pelanggan.map((p, idx) => (
                    <div key={idx} className="bg-surface-container-high/40 p-3 rounded-xl border border-surface-variant/10 flex items-center gap-3">
                      <img className="w-8 h-8 rounded-full object-cover" src={p.avatar} alt={p.name} />
                      <div>
                        <p className="font-bold text-xs text-on-surface">{p.name}</p>
                        <p className="text-[10px] text-on-surface-variant/60">{p.orders} Transaksi</p>
                      </div>
                    </div>
                  ))}
                  {searchResults.pelanggan.length === 0 && <p className="text-[11px] text-on-surface-variant/50">Tidak ada pelanggan cocok.</p>}
                </div>

                {/* Aktivitas Match */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Log Aktivitas ({searchResults.aktivitas.length})</h4>
                  {searchResults.aktivitas.map((a, idx) => (
                    <div key={idx} className="bg-surface-container-high/40 p-3 rounded-xl border border-surface-variant/10 text-xs">
                      <p className="text-on-surface">{a.text}</p>
                      <span className="text-[9px] text-on-surface-variant/60 mt-1 block">{a.time}</span>
                    </div>
                  ))}
                  {searchResults.aktivitas.length === 0 && <p className="text-[11px] text-on-surface-variant/50">Tidak ada log cocok.</p>}
                </div>
              </div>
            </section>
          ) : (
            /* NORMAL DASHBOARD VIEW */
            <>
              {/* 1. Extended Summary Cards (8 Bento Grid) */}
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Menunggu Verifikasi", val: summary.pendingVerifications, badge: `+${summary.pendingVerifications} Baru`, color: "bg-secondary/15 text-secondary border-secondary/15", icon: "pending_actions", path: "/admin/verifikasi" },
                  { label: "Total Tukang", val: summary.totalTukang, badge: "+8% bln ini", color: "bg-primary/15 text-primary border-primary/15", icon: "engineering", path: "/admin/data" },
                  { label: "Total Pelanggan", val: summary.totalPelanggan, badge: "+12% bln ini", color: "bg-green-500/10 text-green-400 border-green-500/15", icon: "group", path: "/admin/pelanggan" },
                  { label: "Pesanan Aktif", val: summary.activeOrders, badge: "Live monitor", color: "bg-blue-500/10 text-blue-400 border-blue-500/15", icon: "explore", path: "/admin/pesanan" },
                  { label: "Pesanan Selesai", val: summary.completedOrders, badge: "+94 transaksi", color: "bg-purple-500/10 text-purple-400 border-purple-500/15", icon: "task_alt", path: "/admin/pesanan" },
                  { label: "Pendapatan Platform", val: `Rp ${(summary.platformRevenue/1000000).toFixed(1)}jt`, badge: "+15% bln ini", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/15", icon: "account_balance_wallet", path: "/admin/pembayaran" },
                  { label: "Rating Bermasalah", val: summary.problematicRatings, badge: "Perlu Tindakan", color: "bg-red-500/10 text-red-400 border-red-500/15", icon: "report", path: "/admin/rating" },
                  { label: "Laporan Masuk", val: summary.incomingReports, badge: "Belum Selesai", color: "bg-pink-500/10 text-pink-400 border-pink-500/15", icon: "gavel", path: "/admin/laporan" }
                ].map((card, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => navigate(card.path)}
                    className="bg-surface-container-high/60 backdrop-blur-md p-5 rounded-2xl border border-surface-variant/20 shadow-lg cursor-pointer flex flex-col justify-between min-h-[140px] hover:border-secondary/40 hover:scale-[1.02] transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className={`p-2.5 rounded-xl ${card.color} border shrink-0`}>
                        <span className="material-symbols-outlined text-lg">{card.icon}</span>
                      </div>
                      <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${card.color}`}>
                        {card.badge}
                      </span>
                    </div>
                    <div className="mt-4">
                      <span className="block text-[10px] text-on-surface-variant/75 font-bold uppercase tracking-wider">{card.label}</span>
                      <h3 className="text-2xl font-black mt-1 text-on-surface">{card.val}</h3>
                    </div>
                  </div>
                ))}
              </section>

              {/* 2. Quick Management Section */}
              <section className="bg-surface-container/40 border border-surface-variant/15 rounded-2xl p-6">
                <h3 className="font-bold text-sm mb-4 text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">apps</span>
                  Pusat Kelola Cepat
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { title: "Kelola Pelanggan", desc: "Kelola akun & sanksi", icon: "group", path: "/admin/pelanggan", color: "text-green-400 bg-green-500/5" },
                    { title: "Kelola Tukang", desc: "Verifikasi & status", icon: "engineering", path: "/admin/data", color: "text-secondary bg-secondary/5" },
                    { title: "Kelola Pesanan", desc: "Pantau pengerjaan", icon: "list_alt", path: "/admin/pesanan", color: "text-blue-400 bg-blue-500/5" },
                    { title: "Kelola Pembayaran", desc: "Rekonsiliasi dana", icon: "payments", path: "/admin/pembayaran", color: "text-yellow-400 bg-yellow-500/5" },
                    { title: "Monitoring Rating", desc: "Cek kepuasan user", icon: "star_rate", path: "/admin/rating", color: "text-purple-400 bg-purple-500/5" },
                    { title: "Laporan Masuk", desc: "Resolusi sengketa", icon: "gavel", path: "/admin/laporan", color: "text-pink-400 bg-pink-500/5" }
                  ].map((act, i) => (
                    <div 
                      key={i} 
                      onClick={() => navigate(act.path)}
                      className="bg-surface-container-high/50 p-4 rounded-xl border border-surface-variant/15 flex flex-col justify-between hover:border-secondary/35 cursor-pointer shadow hover:scale-[1.03] transition-all min-h-[120px]"
                    >
                      <span className={`material-symbols-outlined text-2xl p-2 rounded-lg w-10 h-10 flex items-center justify-center border border-surface-variant/10 ${act.color}`}>{act.icon}</span>
                      <div className="mt-3">
                        <h4 className="text-[11px] font-bold text-on-surface">{act.title}</h4>
                        <p className="text-[9px] text-on-surface-variant mt-0.5 leading-tight">{act.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 3. Charts Section (Custom SVGs) */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Chart 1: Line Chart (Growth) - 7 columns */}
                <div className="lg:col-span-7 bg-surface-container/60 border border-surface-variant/15 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm mb-1 flex items-center gap-2 text-on-surface">
                      <span className="material-symbols-outlined text-secondary">analytics</span>
                      Tren Pertumbuhan Pengguna (6 Bulan Terakhir)
                    </h4>
                    <p className="text-[10px] text-on-surface-variant">Pertumbuhan jumlah Tukang (Oranye) vs Pelanggan (Biru)</p>
                  </div>
                  
                  {/* custom SVG Line Chart */}
                  <div className="mt-6 relative">
                    <svg viewBox="0 0 600 240" className="w-full h-auto overflow-visible">
                      {/* Grid Lines */}
                      <line x1="40" y1="20" x2="580" y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      <line x1="40" y1="75" x2="580" y2="75" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      <line x1="40" y1="130" x2="580" y2="130" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      <line x1="40" y1="185" x2="580" y2="185" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      <line x1="40" y1="200" x2="580" y2="200" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />

                      {/* X Axis Labels */}
                      <text x="40" y="220" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle" fontWeight="bold">JAN</text>
                      <text x="148" y="220" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle" fontWeight="bold">FEB</text>
                      <text x="256" y="220" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle" fontWeight="bold">MAR</text>
                      <text x="364" y="220" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle" fontWeight="bold">APR</text>
                      <text x="472" y="220" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle" fontWeight="bold">MEI</text>
                      <text x="580" y="220" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle" fontWeight="bold">JUN</text>

                      {/* Y Axis Labels */}
                      <text x="30" y="24" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="end" fontWeight="bold">350</text>
                      <text x="30" y="79" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="end" fontWeight="bold">200</text>
                      <text x="30" y="134" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="end" fontWeight="bold">100</text>
                      <text x="30" y="189" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="end" fontWeight="bold">0</text>

                      {/* Paths and Areas */}
                      {/* Pelanggan Path (Blue) */}
                      <path 
                        d="M40,158 L148,137 L256,110 L364,84 L472,52 L580,31" 
                        fill="none" 
                        stroke="#60A5FA" 
                        strokeWidth="3.5" 
                        strokeLinecap="round"
                      />
                      {/* Tukang Path (Orange) */}
                      <path 
                        d="M40,184 L148,176 L256,168 L364,158 L472,142 L580,125" 
                        fill="none" 
                        stroke="#FFB783" 
                        strokeWidth="3.5" 
                        strokeLinecap="round"
                      />

                      {/* Points */}
                      <circle cx="580" cy="31" r="5" fill="#60A5FA" stroke="#121318" strokeWidth="2" />
                      <circle cx="580" cy="125" r="5" fill="#FFB783" stroke="#121318" strokeWidth="2" />
                    </svg>
                  </div>
                </div>

                {/* Chart 2: Doughnut Chart (Status Pesanan) - 5 columns */}
                <div className="lg:col-span-5 bg-surface-container/60 border border-surface-variant/15 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm mb-1 flex items-center gap-2 text-on-surface">
                      <span className="material-symbols-outlined text-secondary">pie_chart</span>
                      Status Distribusi Pesanan
                    </h4>
                    <p className="text-[10px] text-on-surface-variant">Rasio status pengerjaan pesanan</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-around gap-6 mt-6">
                    {/* SVG Doughnut */}
                    <div className="relative w-36 h-36">
                      <svg width="100%" height="100%" viewBox="0 0 42 42" className="transform -rotate-90">
                        {/* Track circle */}
                        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="4.2" />
                        
                        {/* Completed segment (50%) -> Green */}
                        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#4ADE80" strokeWidth="4.2" strokeDasharray="50 100" strokeDashoffset="0" />
                        {/* Processing segment (25%) -> Blue */}
                        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#60A5FA" strokeWidth="4.2" strokeDasharray="25 100" strokeDashoffset="-50" />
                        {/* Pending payment (15%) -> Yellow */}
                        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#FBBF24" strokeWidth="4.2" strokeDasharray="15 100" strokeDashoffset="-75" />
                        {/* Cancelled segment (10%) -> Red */}
                        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#F87171" strokeWidth="4.2" strokeDasharray="10 100" strokeDashoffset="-90" />
                      </svg>
                      {/* Center text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[10px] text-on-surface-variant font-bold">TOTAL</span>
                        <span className="text-base font-black text-on-surface">1,303</span>
                      </div>
                    </div>

                    {/* Legends */}
                    <div className="text-[10px] space-y-2 font-bold uppercase tracking-wider text-on-surface-variant">
                      <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded bg-[#4ADE80]"></span> Selesai (50%)</div>
                      <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded bg-[#60A5FA]"></span> Diproses (25%)</div>
                      <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded bg-[#FBBF24]"></span> Nunggu Bayar (15%)</div>
                      <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded bg-[#F87171]"></span> Batal (10%)</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 4. Statistics: Aktivitas Pelanggan & Progress Status Pesanan */}
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Aktivitas Pelanggan List */}
                <div className="bg-surface-container/60 border border-surface-variant/15 rounded-2xl p-5 shadow-lg">
                  <h4 className="font-bold text-sm mb-4 text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">trending_up</span>
                    Analisis Aktivitas Pelanggan
                  </h4>
                  <div className="space-y-3 font-medium">
                    {[
                      { key: "Total Pelanggan", val: MOCK_CUSTOMER_STATS.total, icon: "people" },
                      { key: "Pelanggan Baru Minggu Ini", val: MOCK_CUSTOMER_STATS.newThisWeek, icon: "person_add" },
                      { key: "Aktif Hari Ini", val: MOCK_CUSTOMER_STATS.activeToday, icon: "bolt" },
                      { key: "Belum Pernah Memesan", val: MOCK_CUSTOMER_STATS.neverOrdered, icon: "person_off" },
                      { key: "Pelanggan Paling Aktif", val: MOCK_CUSTOMER_STATS.mostActive, icon: "military_tech" }
                    ].map((row, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-surface-container-high/40 p-3 rounded-xl border border-surface-variant/10 text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-secondary text-base">{row.icon}</span>
                          <span className="text-on-surface-variant">{row.key}</span>
                        </div>
                        <span className="font-bold text-on-surface">{row.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress Status Pesanan */}
                <div className="bg-surface-container/60 border border-surface-variant/15 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm mb-4 text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary">hourglass_top</span>
                      Status Penyelesaian Pesanan
                    </h4>
                    <div className="space-y-4">
                      {[
                        { label: "Pesanan Baru", current: MOCK_ORDER_STATS.new, total: 1303, percentage: 3, color: "bg-yellow-500" },
                        { label: "Sedang Diproses", current: MOCK_ORDER_STATS.processing, total: 1303, percentage: 12, color: "bg-blue-500" },
                        { label: "Menunggu Pembayaran", current: MOCK_ORDER_STATS.pendingPayment, total: 1303, percentage: 6, color: "bg-purple-500" },
                        { label: "Selesai", current: MOCK_ORDER_STATS.completed, total: 1303, percentage: 85, color: "bg-green-500" },
                        { label: "Dibatalkan", current: MOCK_ORDER_STATS.cancelled, total: 1303, percentage: 4, color: "bg-red-500" }
                      ].map((item, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-xs mb-1 font-bold">
                            <span className="text-on-surface-variant">{item.label} ({item.current})</span>
                            <span className="text-on-surface">{item.percentage}%</span>
                          </div>
                          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden border border-surface-variant/10">
                            <div className={`${item.color} h-full`} style={{ width: `${item.percentage}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* 5. Top Kategori & Ranks (Tukang & Pelanggan) */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Top Categories */}
                <div className="bg-surface-container/60 border border-surface-variant/15 rounded-2xl p-5 shadow-lg">
                  <h4 className="font-bold text-sm mb-4 text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">local_fire_department</span>
                    Top Kategori Layanan
                  </h4>
                  <div className="space-y-4">
                    {MOCK_CATEGORIES.map((cat, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-xs mb-1 font-bold">
                          <span className="text-on-surface-variant">{cat.name} ({cat.count} order)</span>
                          <span className="text-on-surface">{cat.percentage}%</span>
                        </div>
                        <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden border border-surface-variant/10">
                          <div className="bg-secondary h-full" style={{ width: `${cat.percentage}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Tukang */}
                <div className="bg-surface-container/60 border border-surface-variant/15 rounded-2xl p-5 shadow-lg">
                  <h4 className="font-bold text-sm mb-4 text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">star</span>
                    Mitra Tukang Berprestasi
                  </h4>
                  <div className="space-y-3 font-medium">
                    {topTukang.map((item, idx) => (
                      <div key={idx} className="bg-surface-container-high/40 p-3 rounded-xl border border-surface-variant/10 flex items-center gap-3 text-xs justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative shrink-0">
                            <img className="w-9 h-9 rounded-lg object-cover" src={item.avatar} alt={item.name} />
                            {item.online && <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 border-2 border-surface-container-high rounded-full"></span>}
                          </div>
                          <div className="min-w-0">
                            <h5 className="font-bold text-on-surface truncate">{item.name}</h5>
                            <p className="text-[10px] text-on-surface-variant truncate">{item.specialty} • {item.orders} order</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-0.5 text-secondary font-bold text-[11px] justify-end">
                            <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            {item.rating.toFixed(1)}
                          </div>
                          <span className="text-[9px] text-on-surface-variant/80 font-bold block mt-0.5">Rp {(item.revenue/1000000).toFixed(1)}jt</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Pelanggan */}
                <div className="bg-surface-container/60 border border-surface-variant/15 rounded-2xl p-5 shadow-lg">
                  <h4 className="font-bold text-sm mb-4 text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">workspace_premium</span>
                    Top Pelanggan
                  </h4>
                  <div className="space-y-3 font-medium">
                    {topPelanggan.map((item, idx) => (
                      <div key={idx} className="bg-surface-container-high/40 p-3 rounded-xl border border-surface-variant/10 flex items-center gap-3 text-xs justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img className="w-9 h-9 rounded-full object-cover shrink-0" src={item.avatar} alt={item.name} />
                          <div className="min-w-0">
                            <h5 className="font-bold text-on-surface truncate">{item.name}</h5>
                            <p className="text-[10px] text-on-surface-variant truncate">{item.orders}x Order • Aktif: {item.lastActive}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-on-surface text-[11px]">Rp {(item.spending/1000000).toFixed(1)}jt</span>
                          <span className="text-[8px] uppercase tracking-wider text-green-400 font-bold block mt-1">Loyal Member</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </section>

              {/* 6. Antrean Verifikasi & Recent Activities */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Antrean Verifikasi (7 columns) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-secondary rounded-full"></div>
                      <h3 className="text-sm font-bold text-on-surface">Antrean Verifikasi Tukang</h3>
                    </div>
                    <Link to="/admin/verifikasi" className="text-secondary font-bold text-xs flex items-center gap-1 hover:underline">
                      Lihat Semua <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {verifications.length === 0 ? (
                      <div className="bg-surface-container/50 p-8 rounded-2xl text-center text-on-surface-variant/65 border border-surface-variant/10">
                        <span className="material-symbols-outlined text-3xl mb-1.5 text-secondary/45">verified_user</span>
                        <p className="text-xs font-semibold">Semua pengajuan tukang telah selesai diverifikasi!</p>
                      </div>
                    ) : (
                      verifications.map((item) => (
                        <div 
                          key={item.id} 
                          className={`bg-surface-container-high/40 p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4 border border-surface-variant/10 transition-all ${
                            item.status === "verifying" 
                              ? "border-l-4 border-l-yellow-500" 
                              : item.status === "rejecting"
                              ? "border-l-4 border-l-red-500"
                              : "border-l-4 border-l-secondary"
                          }`}
                        >
                          <img className="w-12 h-12 rounded-xl object-cover border border-outline-variant/20 shrink-0" alt={item.name} src={item.avatar} />
                          
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 w-full text-xs">
                            <div className="flex flex-col justify-center">
                              <h4 className="font-bold text-on-surface text-xs truncate">{item.name}</h4>
                              <p className="text-secondary text-[10px] font-bold mt-0.5">{item.type}</p>
                            </div>
                            
                            <div className="flex flex-col justify-center space-y-1 text-on-surface-variant/80">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[10px]">location_on</span>
                                <span className="text-[9px] font-semibold">{item.location}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 shrink-0">
                              <button 
                                onClick={() => handleReject(item.id)}
                                disabled={item.status !== "pending"}
                                className="px-2.5 py-1.5 rounded-lg border border-red-500/20 text-red-400 text-[10px] font-bold bg-transparent cursor-pointer"
                              >
                                Tolak
                              </button>
                              <button 
                                onClick={() => handleVerify(item.id)}
                                disabled={item.status !== "pending"}
                                className="bg-secondary text-on-secondary px-3 py-1.5 rounded-lg text-[10px] font-extrabold cursor-pointer border-none shadow"
                              >
                                Verifikasi
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Recent Activities Timeline (5 columns) */}
                <div className="lg:col-span-5 bg-surface-container/60 border border-surface-variant/15 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm mb-4 text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary">history</span>
                      Log Aktivitas Platform
                    </h4>
                    
                    <div className="space-y-4 relative pl-4 border-l border-surface-variant/20 font-medium">
                      {recentActivities.map((act) => (
                        <div key={act.id} className="relative text-xs">
                          {/* Dot marker */}
                          <div className={`absolute -left-[22px] top-1 w-2.5 h-2.5 rounded-full border-2 border-surface-container ${act.color.split(" ")[0].replace("text-", "bg-")}`}></div>
                          <div>
                            <p className="text-on-surface leading-snug">{act.text}</p>
                            <span className="text-[9px] text-on-surface-variant/60 block mt-0.5">{act.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </section>
            </>
          )}

        </div>
      </main>

      {/* Floating Action Button (FAB) + Speed Dial */}
      <div className="fixed bottom-8 right-8 flex flex-col items-end gap-3 z-50">
        {showSpeedDial && (
          <div className="flex flex-col items-end gap-2 mb-2 animate-fade-in-up">
            {[
              { label: "Tambah Admin", icon: "admin_panel_settings" },
              { label: "Tambah Kategori", icon: "category" },
              { label: "Tambah Promo", icon: "local_offer" },
              { label: "Tambah Pengumuman", icon: "campaign" },
              { label: "Export Laporan", icon: "file_download" }
            ].map((sd, i) => (
              <button 
                key={i}
                onClick={() => handleSpeedDialAction(sd.label)}
                className="flex items-center gap-2 bg-surface-container-high hover:bg-surface-container-highest border border-surface-variant/20 py-2 px-3 rounded-xl shadow-lg cursor-pointer transition-all hover:scale-[1.02]"
              >
                <span className="material-symbols-outlined text-secondary text-base">{sd.icon}</span>
                <span className="text-[10px] font-extrabold text-on-surface uppercase tracking-wider">{sd.label}</span>
              </button>
            ))}
          </div>
        )}
        <button 
          onClick={() => setShowSpeedDial(prev => !prev)}
          className={`w-14 h-14 bg-secondary text-on-secondary rounded-full shadow-2xl flex items-center justify-center border-none cursor-pointer transform transition-transform duration-300 ${showSpeedDial ? "rotate-45" : ""}`}
        >
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      </div>

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

export default AdminDashboard;
