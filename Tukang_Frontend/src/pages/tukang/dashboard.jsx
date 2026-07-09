import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoutModal from "../../components/LogoutModal";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import api from "../../lib/axios";
import { supabase } from "../../lib/supabase";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

function TukangDashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [technicianName, setTechnicianName] = useState("Tukang");
  const [avatar, setAvatar] = useState("https://64.media.tumblr.com/c9a40e15310bd677150504d378595de4/708a33221029625f-0b/s1280x1920/3304739f2245fc3c15e6e70ffff7ee91b2d2ac69.jpg");
  const [isActiveWorking, setIsActiveWorking] = useState(() => {
    const saved = sessionStorage.getItem("tukang_active");
    return saved ? JSON.parse(saved) === true : true;
  });
  const [progressWidth, setProgressWidth] = useState(0);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  // 15. Notification badge state
  const [notificationCount, setNotificationCount] = useState(3);

  // 22. Radius kerja state (in km)
  const [workingRadius, setWorkingRadius] = useState(5);

  // 20. Filter pekerjaan category state
  const [selectedCategory, setSelectedCategory] = useState("semua");

  // 21. Sorting state
  const [selectedSort, setSelectedSort] = useState("Terdekat");

  // Spin animation state for manual refresh button
  const [isSpinning, setIsSpinning] = useState(false);

  // Toast notification state
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "success") => {
    const id = Date.now().toString() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Modals active states
  const [activeModal, setActiveModal] = useState(null); // null | 'reviews' | 'earnings' | 'stats' | 'confirmAccept' | 'detail' | 'map'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const [tukangSaldo, setTukangSaldo] = useState(0);
  const [riwayatTarik, setRiwayatTarik] = useState([]);
  const [tarikAmount, setTarikAmount] = useState("");
  const [tarikRekening, setTarikRekening] = useState("");
  const [isSubmittingTarik, setIsSubmittingTarik] = useState(false);

  // Active summary stats counters
  const [statsCounters, setStatsCounters] = useState(() => {
    const saved = sessionStorage.getItem("tukang_stats");
    if (saved) {
      const data = JSON.parse(saved);
      return {
        activeOrders: data.pesanan_aktif,
        completedJobs: data.pekerjaan_selesai,
        avgRating: parseFloat(data.rating_rata_rata || 0),
        monthlyIncome: (data.pendapatan_bulan_ini / 1000000).toFixed(1) + "M",
      };
    }
    return {
      activeOrders: "00",
      completedJobs: 0,
      avgRating: 0.0,
      monthlyIncome: "Rp 0.0M",
    };
  });

  const [recentActivities, setRecentActivities] = useState(() => {
    const saved = sessionStorage.getItem("tukang_activities");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [tukangLayanans, setTukangLayanans] = useState(() => {
    try {
      const cached = sessionStorage.getItem("tukang_layanans");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  // Order List State
  const [ordersList, setOrdersList] = useState(() => {
    const saved = sessionStorage.getItem("tukang_orders");
    return saved ? JSON.parse(saved) : [];
  });
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const isFetchingRef = useRef(false);

  // User Location & Auth State
  const [userLocation, setUserLocation] = useState(() => {
    const saved = sessionStorage.getItem("tukang_location");
    return saved ? JSON.parse(saved) : { lat: null, lng: null };
  });
  const [tukangId, setTukangId] = useState(null);

  useEffect(() => {
    // Simple target progress animation
    const timer = setTimeout(() => {
      setProgressWidth(85);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Ambil tukang_id dari localStorage (asumsi login menyimpan { data: { tukang: { id: ... } } })    // Get tukang_id from localStorage
    const userDataStr = localStorage.getItem("tukang_user");
    let id = null;
    if (userDataStr) {
      try {
        const parsed = JSON.parse(userDataStr);
        if (parsed && parsed.tukang && parsed.tukang.id) {
          id = parsed.tukang.id;
          if (parsed.tukang.nama) setTechnicianName(parsed.tukang.nama);
          if (parsed.tukang.foto_profil) setAvatar(parsed.tukang.foto_profil.startsWith('http') ? parsed.tukang.foto_profil : `${import.meta.env.VITE_API_BASE_URL}/storage/${parsed.tukang.foto_profil}`);
        }
      } catch (e) {}
    }
    
    if (!id) {
      // Jika tidak ada ID tukang (mungkin belum login, atau login sebagai pelanggan), redirect ke login
      navigate("/");
      return;
    }
    setTukangId(id);
  }, []);

  const fetchDashboardData = async () => {
    if (!tukangId) return;

    // 1. Fetch dashboard stats
    try {
      const statsRes = await api.get(`/tukang/${tukangId}/dashboard-stats`);
      if (statsRes.data.status === "Sukses") {
        sessionStorage.setItem("tukang_stats", JSON.stringify(statsRes.data.data));
        setStatsCounters({
          activeOrders: statsRes.data.data.pesanan_aktif,
          completedJobs: statsRes.data.data.pekerjaan_selesai,
          avgRating: parseFloat(statsRes.data.data.rating_rata_rata || 0),
          monthlyIncome: (statsRes.data.data.pendapatan_bulan_ini / 1000000).toFixed(1) + "M",
        });
      }
    } catch (e) {
      console.error("Gagal memuat stats:", e);
    }

    // 2. Fetch recent activities
    try {
      const actRes = await api.get(`/tukang/${tukangId}/activities`);
      if (actRes.data.status === "Sukses") {
        sessionStorage.setItem("tukang_activities", JSON.stringify(actRes.data.data));
        setRecentActivities(actRes.data.data);
      }
    } catch (e) {
      console.error("Gagal memuat aktivitas:", e);
    }

    // 3. Fetch profile & coordinates
    try {
      const profilRes = await api.get(`/tukang/${tukangId}`);
      if (profilRes.data.status === "Sukses") {
        setIsActiveWorking(!!profilRes.data.data.is_aktif);
        setTukangSaldo(profilRes.data.data.saldo || 0);
        sessionStorage.setItem("tukang_active", JSON.stringify(!!profilRes.data.data.is_aktif));
        const layanansData = profilRes.data.data.layanans || [];
        setTukangLayanans(layanansData);
        sessionStorage.setItem("tukang_layanans", JSON.stringify(layanansData));
        
        const locationObj = {
          lat: parseFloat(profilRes.data.data.latitude || -7.7693966),
          lng: parseFloat(profilRes.data.data.longitude || 110.3804236)
        };
        sessionStorage.setItem("tukang_location", JSON.stringify(locationObj));
        setUserLocation(locationObj);
      }
    } catch (error) {
      console.error("Gagal memuat profil/koordinat:", error);
      const fallbackObj = {
        lat: -7.7693966,
        lng: 110.3804236
      };
      sessionStorage.setItem("tukang_location", JSON.stringify(fallbackObj));
      setUserLocation(fallbackObj);
    }

    // 4. Fetch Riwayat Penarikan
    try {
      const riwayatRes = await api.get(`/tukang/${tukangId}/riwayat-tarik`);
      if (riwayatRes.data.status === "Sukses") {
        setRiwayatTarik(riwayatRes.data.data);
      }
    } catch (e) {}
  };

  const handleTarikDana = async () => {
    if (!tarikAmount || !tarikRekening) {
      showToast("Harap isi nominal dan rekening tujuan!", "error");
      return;
    }
    const amount = parseInt(tarikAmount.replace(/\D/g, ''));
    if (amount < 10000) {
      showToast("Minimal penarikan Rp 10.000", "error");
      return;
    }
    setIsSubmittingTarik(true);
    try {
      const res = await api.post(`/tukang/${tukangId}/tarik-dana`, {
        jumlah_tarik: amount,
        rekening_tujuan: tarikRekening
      });
      showToast(res.data.message || "Penarikan berhasil diajukan!", "success");
      setTukangSaldo(res.data.sisa_saldo);
      setTarikAmount("");
      setTarikRekening("");
      fetchDashboardData();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal menarik dana", "error");
    } finally {
      setIsSubmittingTarik(false);
    }
  };

  useEffect(() => {
    if (tukangId) {
      // Subscribe to Supabase Postgres Changes
      const channel = supabase
        .channel('public:layanan_tukangs')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'layanan_tukangs', filter: `tukang_id=eq.${tukangId}` },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setTukangLayanans(prev => {
                const next = [...prev, payload.new];
                sessionStorage.setItem("tukang_layanans", JSON.stringify(next));
                return next;
              });
            } else if (payload.eventType === 'DELETE') {
              setTukangLayanans(prev => {
                const next = prev.filter(l => l.id !== payload.old.id);
                sessionStorage.setItem("tukang_layanans", JSON.stringify(next));
                return next;
              });
            } else if (payload.eventType === 'UPDATE') {
              setTukangLayanans(prev => {
                const next = prev.map(l => l.id === payload.new.id ? payload.new : l);
                sessionStorage.setItem("tukang_layanans", JSON.stringify(next));
                return next;
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [tukangId]);

  const getDynamicCategories = () => {
    const base = [{ id: "semua", label: "Semua" }];
    const addedNames = [...new Set(tukangLayanans.map(l => l.nama_layanan))];
    const blueprints = [
      { nama: "Listrik", id: "listrik", label: "Listrik" },
      { nama: "AC", id: "ac", label: "AC" },
      { nama: "Pipa & Air", id: "pipa", label: "Pipa & Air" },
      { nama: "Cat Rumah", id: "cat", label: "Cat Rumah" },
      { nama: "Atap Rumah", id: "atap", label: "Atap Rumah" },
      { nama: "Pertukangan", id: "pertukangan", label: "Pertukangan" },
      { nama: "Pindahan Rumah", id: "pindahan", label: "Pindahan" },
      { nama: "Kebersihan Rumah", id: "kebersihan", label: "Kebersihan" }
    ];
    const matched = blueprints.filter(bp => addedNames.includes(bp.nama));
    return [...base, ...matched];
  };

  const handleToggleActiveWorking = async (checked) => {
    setIsActiveWorking(checked);
    sessionStorage.setItem("tukang_active", JSON.stringify(checked));
    try {
      await api.put(`/tukang/${tukangId}/status`, {
        is_aktif: checked
      });
      showToast(
        `Status diubah menjadi ${checked ? "Online" : "Offline"}`,
        checked ? "success" : "default"
      );
      // Sync local storage
      const userDataStr = localStorage.getItem("tukang_user");
      if (userDataStr) {
        const parsed = JSON.parse(userDataStr);
        if (parsed && parsed.tukang) {
          parsed.tukang.is_aktif = checked;
          localStorage.setItem("tukang_user", JSON.stringify(parsed));
        }
      }
    } catch (error) {
      console.error("Error updating working status:", error);
      showToast("Gagal mengubah status kerja", "error");
      setIsActiveWorking(!checked);
    }
  };

  const fetchAvailableOrders = async () => {
    if (!userLocation.lat || !userLocation.lng) return;
    if (isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    setIsOrdersLoading(true);
    try {
      const res = await api.get(`/pesanan/available`, {
        params: {
          lat: userLocation.lat,
          lng: userLocation.lng,
          radius: workingRadius,
          kategori: selectedCategory,
          tukang_id: tukangId,
        }
      });
      if (res.data.status === "Sukses") {
        const formatted = res.data.data.map(order => ({
          id: order.id,
          category: order.kategori_layanan,
          title: order.judul,
          locationName: order.alamat_lengkap,
          lat: order.latitude,
          lng: order.longitude,
          distance: parseFloat(order.jarak).toFixed(1),
          fee: order.harga_penawaran,
          feeText: `Rp ${(order.harga_penawaran).toLocaleString("id-ID")}`,
          image: order.foto_lampiran 
            ? (order.foto_lampiran.startsWith("http") ? order.foto_lampiran : `${import.meta.env.VITE_API_BASE_URL}/storage/${order.foto_lampiran}`)
            : "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop",
          description: order.deskripsi_masalah,
          clientName: order.user?.nama || order.user?.name || "Pelanggan",
          clientPhone: order.user?.no_hp || "0812-xxxx-xxxx",
          tanggalKunjungan: order.tanggal_kunjungan || "-",
          jamKunjungan: order.jam_kunjungan || "-",
          metodePembayaran: order.metode_pembayaran || "QRIS",
          chatId: order.chat?.id,
          createdTime: new Date(order.created_at).getTime(),
        }));
        sessionStorage.setItem("tukang_orders", JSON.stringify(formatted));
        setOrdersList(formatted);
      }
    } catch (e) {
      console.error("Gagal memuat pesanan tersedia:", e);
    } finally {
      setIsOrdersLoading(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [tukangId]);

  useEffect(() => {
    if (isActiveWorking) {
      fetchAvailableOrders();
      
      // Subscribe to real-time changes on the pesanans table
      const channel = supabase
        .channel('public:pesanans')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'pesanans' },
          (payload) => {
            fetchAvailableOrders();
          }
        )
        .subscribe();

      const polling = setInterval(fetchAvailableOrders, 30000);
      return () => {
        supabase.removeChannel(channel);
        clearInterval(polling);
      };
    }
  }, [userLocation, workingRadius, selectedCategory, isActiveWorking]);

  // 18. Manual Refresh Orders click handler
  const handleManualRefresh = () => {
    setIsSpinning(true);
    setTimeout(() => {
      setIsSpinning(false);
      showToast("Data pesanan berhasil diperbarui!", "success");
    }, 800);
  };

  // 7. Accept Job Handler
  const handleAcceptOrder = (order) => {
    setSelectedOrder(order);
    setActiveModal("confirmAccept");
  };

  const confirmAcceptJob = async () => {
    if (!selectedOrder || !tukangId) return;

    try {
      const res = await api.post(`/pesanan/${selectedOrder.id}/terima`, {
        tukang_id: tukangId
      });
      
      if (res.data.message) {
        showToast(`Pekerjaan "${selectedOrder.title}" berhasil diterima!`, "success");
        // Remove from list
        setOrdersList((prev) => prev.filter((o) => o.id !== selectedOrder.id));
        
        // Refresh dashboard stats and activities
        fetchDashboardData();
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Gagal menerima pekerjaan", "error");
    } finally {
      setActiveModal(null);
      setSelectedOrder(null);
    }
  };

  // Filter & Sort Logic
  // 22. Uses radius to filter, 20. Uses category to filter
  const filteredOrders = ordersList.filter((order) => {
    const matchesCategory = selectedCategory === "semua" || order.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesRadius = order.distance <= workingRadius;
    return matchesCategory && matchesRadius;
  });

  // 21. Sorting Logic
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (selectedSort === "Terdekat") {
      return a.distance - b.distance;
    }
    if (selectedSort === "Bayaran tertinggi") {
      return b.fee - a.fee;
    }
    if (selectedSort === "Terbaru") {
      return a.createdTime - b.createdTime;
    }
    return 0;
  });

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/tukang/dashboard", active: true },
    { id: "layanan", label: "Layanan Jasa", icon: "home_repair_service", path: "/tukang/layanan" },
    { id: "pesanan", label: "Pesanan Saya", icon: "assignment", path: "/tukang/pesanan" },
    { id: "chat", label: "Chat", icon: "chat", path: "/tukang/chat" },
    { id: "profil", label: "Profil", icon: "person", path: "/tukang/profil" },
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

      {/* Toast Notifications */}
      <div className="fixed top-24 right-6 z-[100] space-y-3 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-slide-in text-xs font-semibold ${
              t.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : t.type === "error"
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "bg-surface-container border-outline-variant/30 text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {t.type === "success" ? "check_circle" : t.type === "error" ? "error" : "notifications"}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* SideNavBar - Desktop & Mobile Drawer */}
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
                className={`w-full flex items-center gap-4 py-3 px-4 transition-all duration-200 ease-in-out font-semibold rounded-xl text-left cursor-pointer ${
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

        {/* Profile Section at Bottom */}
        {/* 16. Click profile details to navigate */}
        <div 
          onClick={() => navigate("/tukang/profil")}
          className="mt-auto pt-4 border-t border-surface-variant/20 cursor-pointer hover:bg-surface-container-highest/30 rounded-xl transition-all"
        >
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/30 shrink-0">
                <img
                  className="w-full h-full object-cover"
                  alt={technicianName}
                  src={avatar}
                />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-on-surface truncate">{technicianName}</h4>
                <p className="text-xs text-secondary truncate">Elite Technician</p>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsLogoutModalOpen(true);
              }}
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
            <div className="flex items-center gap-4">
              <h2 className="font-headline-md text-headline-md font-bold text-secondary">Dashboard</h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-secondary/15 rounded-full border border-secondary/20">
              <span className={`w-2 h-2 rounded-full ${isActiveWorking ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></span>
              <span className="text-[10px] text-secondary font-extrabold uppercase tracking-wider">
                {isActiveWorking ? "Online" : "Offline"}
              </span>
            </div>
            <Link to="/notifikasi" className="p-2 text-on-surface-variant hover:text-secondary transition-colors relative cursor-pointer flex items-center justify-center">
              <span className="material-symbols-outlined">notifications</span>
              {notificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] bg-secondary text-on-secondary rounded-full flex items-center justify-center font-bold text-[8px] px-0.5">
                  {notificationCount}
                </span>
              )}
            </Link>
            <Link to="/bantuan" className="p-2 text-on-surface-variant hover:text-secondary transition-colors cursor-pointer flex items-center justify-center">
              <span className="material-symbols-outlined">help</span>
            </Link>
            <div 
              onClick={() => navigate("/tukang/profil")}
              className="h-10 w-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/30 ml-2 cursor-pointer hover:opacity-90"
            >
              <img 
                className="w-10 h-10 rounded-full border-2 border-surface-variant/30 object-cover"
                src={avatar}
                alt={technicianName}
              />
            </div>
          </div>
        </header>

        {/* Canvas */}
        <div className="pt-28 pb-12 px-6 md:px-12 max-w-7xl w-full mx-auto space-y-8 flex-grow page-transition">
          
          {/* Status & Greeting Section */}
          <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              {/* 17. Greeting state name */}
              <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface">Halo, {technicianName}!</h2>
              <p className="text-on-surface-variant/80 text-xs mt-1">Siap untuk membantu pelanggan hari ini?</p>
            </div>
            
            {/* Work Status Toggle */}
            <div className="bg-surface-container p-4 rounded-2xl flex items-center justify-between gap-8 border border-surface-variant/15 shadow-lg min-w-[280px]">
              <div>
                <p className="font-bold text-xs text-on-surface">{isActiveWorking ? "Aktif Bekerja" : "Tidak Aktif"}</p>
                <p className="text-[10px] text-on-surface-variant/60">Terlihat oleh pelanggan</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isActiveWorking}
                  onChange={(e) => handleToggleActiveWorking(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
              </label>
            </div>
          </section>

          {/* Ringkasan Hari Ini Bento Grid */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* 2. Active Orders Card */}
            <div 
              onClick={() => navigate("/tukang/pesanan", { state: { tab: "Aktif" } })}
              className="bg-surface-container p-5 rounded-2xl border-l-4 border-secondary shadow-md hover:-translate-y-1 transition-transform cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="material-symbols-outlined text-secondary">pending_actions</span>
                <span className="text-[10px] text-secondary bg-secondary/10 px-2 py-0.5 rounded-full font-bold">+12%</span>
              </div>
              <p className="text-[11px] font-bold text-on-surface-variant/70 uppercase tracking-wider">Pesanan Aktif</p>
              <h3 className="text-2xl font-extrabold mt-1 text-on-surface">
                {String(statsCounters.activeOrders).padStart(2, "0")}
              </h3>
            </div>

            {/* 3. Completed Jobs Card */}
            <div 
              onClick={() => navigate("/tukang/pesanan", { state: { tab: "Selesai" } })}
              className="bg-surface-container p-5 rounded-2xl border-l-4 border-primary shadow-md hover:-translate-y-1 transition-transform cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="material-symbols-outlined text-primary">task_alt</span>
              </div>
              <p className="text-[11px] font-bold text-on-surface-variant/70 uppercase tracking-wider">Pekerjaan Selesai</p>
              <h3 className="text-2xl font-extrabold mt-1 text-on-surface">
                {statsCounters.completedJobs}
              </h3>
            </div>

            {/* 4. Average Rating Card */}
            <div 
              onClick={() => setActiveModal("reviews")}
              className="bg-surface-container p-5 rounded-2xl border-l-4 border-yellow-500 shadow-md hover:-translate-y-1 transition-transform cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="material-symbols-outlined text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
              <p className="text-[11px] font-bold text-on-surface-variant/70 uppercase tracking-wider">Rating Rata-rata</p>
              <h3 className="text-2xl font-extrabold mt-1 text-on-surface">
                {statsCounters.avgRating.toFixed(1)}
              </h3>
            </div>

            {/* 5. Monthly Income Card */}
            <div 
              onClick={() => setActiveModal("earnings")}
              className="bg-surface-container p-5 rounded-2xl border-l-4 border-green-500 shadow-md hover:-translate-y-1 transition-transform cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="material-symbols-outlined text-green-500">payments</span>
              </div>
              <p className="text-[11px] font-bold text-on-surface-variant/70 uppercase tracking-wider">Pendapatan (Bln Ini)</p>
              <h3 className="text-2xl font-extrabold mt-1 text-on-surface">
                Rp {statsCounters.monthlyIncome}
              </h3>
            </div>

          </section>

          {/* Grid: Pesanan Baru & Aktivitas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Main Feed: Pesanan Baru */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Header section with Refresh and Title */}
              <div className="flex items-center justify-between h-8">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-on-surface text-base">Pesanan Baru Tersedia</h3>
                  {/* 18. Manual Refresh Order Button */}
                  <button 
                    onClick={handleManualRefresh}
                    className="p-1 rounded-full text-on-surface-variant hover:text-secondary hover:bg-surface-container-high transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
                    title="Refresh Pesanan"
                  >
                    <span className={`material-symbols-outlined text-sm ${isSpinning ? "animate-spin text-secondary" : ""}`}>
                      refresh
                    </span>
                  </button>
                </div>
                
                {/* 6. Lihat Semua Button */}
                <button 
                  onClick={() => navigate("/tukang/pesanan", { state: { tab: "Marketplace" } })}
                  className="text-secondary hover:underline text-xs font-bold bg-transparent border-none cursor-pointer"
                >
                  Lihat Semua
                </button>
              </div>

              {/* Advanced Filter, Sort & Radius Panel */}
              <div className="bg-surface-container border border-surface-variant/15 p-5 rounded-3xl space-y-4 shadow-sm">
                
                {/* 20. Filter Pekerjaan Categories */}
                <div className="space-y-2">
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Layanan Pekerjaan</span>
                  <div className="flex flex-wrap gap-2">
                    {getDynamicCategories().map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                          selectedCategory === cat.id
                            ? "bg-secondary border-secondary text-on-secondary"
                            : "bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:border-secondary/30"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 21. Sorting & 22. Radius parameters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-outline-variant/10">
                  
                  {/* Radius slide filter */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-on-surface-variant font-bold uppercase">
                      <span>Jangkauan Radius Kerja</span>
                      <span className="text-secondary">{workingRadius} km</span>
                    </div>
                    <input 
                      type="range"
                      min="1"
                      max="15"
                      step="0.5"
                      className="w-full accent-secondary"
                      value={workingRadius}
                      onChange={(e) => setWorkingRadius(parseFloat(e.target.value))}
                    />
                  </div>

                  {/* Sorting dropdown */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Urutkan Pesanan</span>
                    <select
                      className="w-full bg-surface-container-low border border-outline-variant/30 text-on-surface text-[11px] rounded-xl px-3 py-2 outline-none font-bold"
                      value={selectedSort}
                      onChange={(e) => setSelectedSort(e.target.value)}
                    >
                      <option value="Terdekat">Jarak Terdekat</option>
                      <option value="Terbaru">Terbaru Ditambahkan</option>
                      <option value="Bayaran tertinggi">Bayaran Tertinggi</option>
                    </select>
                  </div>

                </div>

              </div>

              {/* Feed items container */}
              <div className="space-y-4 relative min-h-[200px]">
                {/* Local Loader overlay inside the feed container */}
                {(isOrdersLoading || !userLocation.lat || !userLocation.lng) && isActiveWorking && (
                  <div className="absolute inset-0 bg-[#0d0d0d]/80 backdrop-blur-md z-30 flex flex-col items-center justify-center gap-3 rounded-3xl transition-all duration-300">
                    <div className="relative flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full border-4 border-secondary/20 border-t-secondary animate-spin"></div>
                      <span className="material-symbols-outlined text-secondary text-xl absolute animate-pulse">
                        engineering
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-[11px] font-bold text-on-surface">Mencari Pesanan...</p>
                    </div>
                  </div>
                )}
                {!isActiveWorking ? (
                  // 1. Offline warnings state
                  <div className="bg-surface-container/60 border border-dashed border-outline-variant/30 p-8 rounded-3xl text-center space-y-3">
                    <span className="material-symbols-outlined text-red-400 text-4xl">portable_wifi_off</span>
                    <div>
                      <h4 className="font-bold text-sm text-on-surface">Anda sedang Offline</h4>
                      <p className="text-[11px] text-on-surface-variant mt-1 max-w-xs mx-auto">
                        Aktifkan toggle status kerja Anda di atas untuk mulai memantau dan menerima pesanan baru dari pelanggan.
                      </p>
                    </div>
                  </div>
                ) : sortedOrders.length === 0 ? (
                  <div className="bg-surface-container/60 border border-dashed border-outline-variant/30 p-8 rounded-3xl text-center space-y-3">
                    <span className="material-symbols-outlined text-secondary text-4xl">explore_off</span>
                    <div>
                      <h4 className="font-bold text-sm text-on-surface">Tidak Ada Pesanan Tersedia</h4>
                      <p className="text-[11px] text-on-surface-variant mt-1 max-w-xs mx-auto">
                        Coba perbesar radius jangkauan kerja atau ubah filter layanan untuk mencari pesanan perbaikan lainnya.
                      </p>
                    </div>
                  </div>
                ) : (
                  sortedOrders.map((order) => (
                    // 9. Clicking the entire card triggers order details modal
                    <div 
                      key={order.id} 
                      onClick={() => {
                        setSelectedOrder(order);
                        setActiveModal("detail");
                      }}
                      className="group bg-surface-container hover:bg-surface-container-high/70 p-5 rounded-3xl border border-surface-variant/15 transition-all shadow-lg overflow-hidden relative cursor-pointer"
                    >
                      <div className="flex flex-col md:flex-row gap-5">
                        
                        {/* 10. Clicking the job image views fullscreen */}
                        <div 
                          className="w-full md:w-32 h-32 rounded-2xl overflow-hidden shrink-0 relative"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFullscreenImage(order.image);
                          }}
                        >
                          <img
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            alt={order.title}
                            src={order.image}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="material-symbols-outlined text-white text-lg">zoom_in</span>
                          </div>
                        </div>

                        <div className="flex-grow flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <span className={`text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold border ${
                                order.category === "Plumbing" 
                                  ? "text-secondary bg-secondary/10 border-secondary/15" 
                                  : "text-primary bg-primary/10 border-primary/15"
                              }`}>
                                {order.category}
                              </span>
                              <p className="font-extrabold text-lg text-secondary">{order.feeText}</p>
                            </div>
                            
                            <h4 className="font-bold text-sm text-on-surface mb-2 leading-snug">
                              {order.title}
                            </h4>
                            
                            <div className="flex flex-wrap gap-4 text-on-surface-variant/80 text-[10px]">
                              {/* 11. Clicking the location opens a map popup */}
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrder(order);
                                  setActiveModal("map");
                                }}
                                className="flex items-center gap-1 hover:text-secondary transition-colors"
                              >
                                <span className="material-symbols-outlined text-xs">location_on</span>
                                <span className="underline decoration-dotted">{order.locationName}</span>
                              </div>
                              
                              {/* 12. Clicking the distance opens Google Maps navigation */}
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${order.lat},${order.lng}`, "_blank");
                                }}
                                className="flex items-center gap-1 hover:text-secondary transition-colors"
                              >
                                <span className="material-symbols-outlined text-xs">near_me</span>
                                <span className="underline decoration-dotted">{order.distance} km dari lokasi Anda</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex gap-3">
                            {/* 7. Terima Pekerjaan Button */}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAcceptOrder(order);
                              }}
                              className="flex-1 py-2 bg-secondary text-on-secondary text-xs font-bold rounded-xl hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer border-none"
                            >
                              Terima Pekerjaan
                            </button>
                            
                            {/* 8. Tombol Detail */}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(order);
                                setActiveModal("detail");
                              }}
                              className="px-4 py-2 border border-outline-variant/30 text-xs font-bold text-on-surface hover:bg-surface-container-high rounded-xl transition-colors cursor-pointer bg-transparent"
                            >
                              Detail
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Side Section: Aktivitas Terbaru */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between h-8">
                <h3 className="font-bold text-on-surface text-base">Aktivitas Terbaru</h3>
              </div>
              <div className="bg-surface-container p-6 rounded-3xl border border-surface-variant/15 shadow-lg relative">
                
                {/* 13. Dynamic Timeline using State */}
                <div className="space-y-6 relative before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-outline-variant/40">
                  
                  {recentActivities.length > 0 ? (
                    recentActivities.map((act, index) => (
                      <div key={act.id || index} className="relative pl-8">
                        <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                          act.tipe === "pekerjaan_selesai" 
                            ? "bg-secondary text-on-secondary" 
                            : "bg-surface-container-highest border border-outline-variant/30 text-on-surface-variant"
                        }`}>
                          <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: act.tipe === "ulasan" ? "'FILL' 1" : "" }}>
                            {act.tipe === "pekerjaan_selesai" ? "check_circle" : "star"}
                          </span>
                        </div>
                        <p className="text-on-surface font-bold text-xs">{act.judul}</p>
                        <p className="text-[10px] text-on-surface-variant/75 mt-0.5">{act.deskripsi}</p>
                        <span className="text-[9px] text-secondary/60 mt-1 block">{act.waktu}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-on-surface-variant">
                      <span className="material-symbols-outlined text-2xl mb-1 opacity-50">history</span>
                      <p className="text-xs">Belum ada aktivitas terbaru</p>
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Mobile Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe bg-surface/85 backdrop-blur-xl border-t border-surface-variant/15 rounded-t-2xl shadow-2xl">
        {navigationItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
              item.active 
                ? "bg-secondary text-on-secondary scale-95" 
                : "text-on-surface-variant hover:text-secondary"
            }`}
          >
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: item.active ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
            <span className="text-[9px] font-bold mt-0.5">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout Confirmation */}
      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={() => navigate("/")} 
        role="teknisi" 
      />

      {/* FULLSCREEN IMAGE MODAL */}
      {fullscreenImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="absolute inset-0" onClick={() => setFullscreenImage(null)}></div>
          <div className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col items-center z-10">
            <button 
              onClick={() => setFullscreenImage(null)}
              className="absolute top-4 right-4 bg-black/60 p-2.5 rounded-full text-white hover:bg-black/80 transition-colors z-20 cursor-pointer border-none flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
            <img src={fullscreenImage} alt="Fullscreen View" className="max-w-full max-h-[80vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

      {/* MODAL: ACCEPT CONFIRMATION */}
      {activeModal === "confirmAccept" && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container border border-surface-variant/20 w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center space-y-4 animate-scale-up text-xs font-semibold">
            <div className="w-14 h-14 rounded-full bg-secondary/10 text-secondary flex items-center justify-center border border-secondary/20">
              <span className="material-symbols-outlined text-2xl font-bold">handyman</span>
            </div>
            
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-base text-on-surface">Terima Pekerjaan ini?</h4>
              <p className="text-xs text-on-surface-variant/80 leading-relaxed px-2">
                Anda akan mengambil pekerjaan <strong>"{selectedOrder.title}"</strong> dengan tarif sebesar <strong>{selectedOrder.feeText}</strong>.
              </p>
            </div>

            <div className="flex gap-3 w-full pt-2">
              <button
                onClick={() => {
                  setActiveModal(null);
                  setSelectedOrder(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-outline-variant/30 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer bg-transparent"
              >
                Batal
              </button>
              <button
                onClick={confirmAcceptJob}
                className="flex-1 py-2.5 bg-secondary text-on-secondary rounded-xl text-xs font-bold hover:opacity-95 transition-opacity cursor-pointer border-none"
              >
                Ya, Terima
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ORDER DETAIL VIEW */}
      {activeModal === "detail" && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-surface-container border border-surface-variant/15 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up text-xs font-semibold my-8">
            <div className="p-5 border-b border-surface-variant/10 flex justify-between items-center bg-surface-container-high">
              <h3 className="text-sm font-extrabold text-on-surface">Detail Pesanan Baru</h3>
              <button 
                onClick={() => {
                  setActiveModal(null);
                  setSelectedOrder(null);
                }}
                className="p-1 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              
              <div 
                className="w-full h-40 rounded-2xl overflow-hidden relative cursor-pointer group"
                onClick={() => setFullscreenImage(selectedOrder.image)}
              >
                <img src={selectedOrder.image} alt={selectedOrder.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-white text-2xl">zoom_in</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[10px] text-secondary bg-secondary/15 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold border border-secondary/25">
                  {selectedOrder.category}
                </span>
                <p className="text-lg font-extrabold text-secondary">{selectedOrder.feeText}</p>
              </div>

              <div>
                <h4 className="font-extrabold text-sm text-on-surface leading-tight">{selectedOrder.title}</h4>
                <p className="text-[11px] text-on-surface-variant/80 mt-2 font-medium leading-relaxed">
                  {selectedOrder.description}
                </p>
              </div>

              <div className="p-4 bg-surface-container-high rounded-2xl border border-outline-variant/10 space-y-2 text-[11px] text-on-surface-variant/90 font-medium">
                 <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant/60">Pelanggan</span>
                  <span className="font-bold text-on-surface">{selectedOrder.clientName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant/60">Kontak</span>
                  <span className="font-mono text-on-surface">{selectedOrder.clientPhone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant/60">Jarak</span>
                  <span className="font-bold text-on-surface">{selectedOrder.distance} km</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant/60">Jadwal Kunjungan</span>
                  <span className="font-bold text-on-surface">{selectedOrder.tanggalKunjungan}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant/60">Jam Kunjungan</span>
                  <span className="font-bold text-on-surface">{selectedOrder.jamKunjungan}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant/60">Metode Pembayaran</span>
                  <span className="font-bold text-secondary uppercase bg-secondary/10 px-2 py-0.5 rounded text-[10px]">{selectedOrder.metodePembayaran}</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-on-surface-variant/60 shrink-0">Lokasi</span>
                  <span className="font-bold text-on-surface text-right">{selectedOrder.locationName}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    navigate("/tukang/chat", { 
                      state: { 
                        activeChatId: selectedOrder.chatId
                      } 
                    });
                  }}
                  className="flex-1 py-2.5 border border-outline-variant text-on-surface hover:bg-surface-container-highest transition-all rounded-xl font-bold cursor-pointer bg-transparent flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">chat</span> Tawar melalui chat
                </button>
                
                <button
                  onClick={() => {
                    const orderToAccept = selectedOrder;
                    setActiveModal(null);
                    setSelectedOrder(orderToAccept);
                    setActiveModal("confirmAccept");
                  }}
                  className="flex-1 py-2.5 bg-secondary text-on-secondary hover:opacity-95 transition-all rounded-xl font-bold cursor-pointer border-none flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">handyman</span> Terima
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL: MAP COORDINATE LOCATION */}
      {activeModal === "map" && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-surface-container border border-surface-variant/15 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-scale-up text-xs font-semibold my-8">
            <div className="p-5 border-b border-surface-variant/10 flex justify-between items-center bg-surface-container-high">
              <h3 className="text-sm font-extrabold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">map</span>
                Lokasi Pekerjaan
              </h3>
              <button 
                onClick={() => {
                  setActiveModal(null);
                  setSelectedOrder(null);
                }}
                className="p-1 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-[11px] text-on-surface-variant font-medium leading-tight">
                Lokasi pelanggan: <strong className="text-on-surface">{selectedOrder.locationName}</strong>
              </p>
              
              <div className="relative w-full rounded-2xl overflow-hidden border border-outline-variant shadow-md">
                <MapContainer
                  center={[selectedOrder.lat, selectedOrder.lng]}
                  zoom={14}
                  style={{
                    height: "300px",
                    width: "100%",
                    borderRadius: "16px",
                  }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[selectedOrder.lat, selectedOrder.lng]} />
                </MapContainer>
              </div>

              <div className="flex justify-end gap-2.5">
                <button 
                  onClick={() => {
                    setActiveModal(null);
                    setSelectedOrder(null);
                  }}
                  className="px-4 py-2 border border-outline-variant text-on-surface hover:bg-surface-container-highest transition-all rounded-xl font-bold cursor-pointer bg-transparent"
                >
                  Tutup
                </button>
                <button 
                  onClick={() => {
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedOrder.lat},${selectedOrder.lng}`, "_blank");
                  }}
                  className="px-4 py-2 bg-secondary text-on-secondary hover:bg-secondary/90 transition-all rounded-xl font-bold cursor-pointer border-none"
                >
                  Buka di Google Maps
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: WEEKLY TARGET STATS PERFORMANCE */}
      {activeModal === "stats" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-surface-container border border-surface-variant/15 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up text-xs font-semibold my-8">
            <div className="p-5 border-b border-surface-variant/10 flex justify-between items-center bg-surface-container-high">
              <h3 className="text-sm font-extrabold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">equalizer</span>
                Statistik Performa
              </h3>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-4 bg-surface-container-high rounded-2xl border border-outline-variant/10">
                  <span className="text-[10px] text-on-surface-variant/60 uppercase">Penyelesaian</span>
                  <p className="text-lg font-extrabold text-secondary mt-1">98.2%</p>
                </div>
                <div className="p-4 bg-surface-container-high rounded-2xl border border-outline-variant/10">
                  <span className="text-[10px] text-on-surface-variant/60 uppercase">Pembatalan</span>
                  <p className="text-lg font-extrabold text-red-400 mt-1">1.8%</p>
                </div>
                <div className="p-4 bg-surface-container-high rounded-2xl border border-outline-variant/10">
                  <span className="text-[10px] text-on-surface-variant/60 uppercase">Waktu Respon</span>
                  <p className="text-lg font-extrabold text-primary mt-1">~5 mnt</p>
                </div>
                <div className="p-4 bg-surface-container-high rounded-2xl border border-outline-variant/10">
                  <span className="text-[10px] text-on-surface-variant/60 uppercase">Jam Kerja</span>
                  <p className="text-lg font-extrabold text-green-400 mt-1">142 jam</p>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Progres Target Mingguan</span>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] text-on-surface-variant">
                    <span>Target Target (15 Order)</span>
                    <span className="font-bold text-on-surface">{statsCounters.activeOrders + 12}/15 Selesai</span>
                  </div>
                  <div className="w-full bg-surface-container-low border border-outline-variant/20 h-2 rounded-full overflow-hidden">
                    <div className="bg-secondary h-full" style={{ width: "85%" }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] text-on-surface-variant">
                    <span>Jam Online (40 Jam)</span>
                    <span className="font-bold text-on-surface">36/40 Jam</span>
                  </div>
                  <div className="w-full bg-surface-container-low border border-outline-variant/20 h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: "90%" }}></div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setActiveModal(null)}
                className="w-full mt-2 bg-secondary text-on-secondary font-bold py-3 rounded-xl hover:scale-[1.01] transition-transform border-none cursor-pointer"
              >
                Tutup Statistik
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EARNINGS HISTORY */}
      {activeModal === "earnings" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-surface-container border border-surface-variant/15 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up text-xs font-semibold my-8">
            <div className="p-5 border-b border-surface-variant/10 flex justify-between items-center bg-surface-container-high">
              <h3 className="text-sm font-extrabold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-green-500">payments</span>
                Dompet & Pendapatan
              </h3>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              
              <div className="p-5 bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-2xl text-center space-y-1">
                <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider block">Saldo Dompet Saya</span>
                <h4 className="text-2xl font-extrabold text-green-400">Rp {tukangSaldo.toLocaleString("id-ID")}</h4>
                <p className="text-[9px] text-on-surface-variant/70">Dapat ditarik ke rekening bank secara instan</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <input type="text" placeholder="Nominal Tarik (Min 10.000)" value={tarikAmount} onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setTarikAmount(val ? "Rp " + parseInt(val).toLocaleString("id-ID") : "");
                  }} className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl p-3 text-xs text-on-surface focus:ring-1 focus:ring-green-500 outline-none transition-all" />
                  <input type="text" placeholder="Rekening Tujuan (Cth: BCA 1234567890 a/n Budi)" value={tarikRekening} onChange={(e) => setTarikRekening(e.target.value)} className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl p-3 text-xs text-on-surface focus:ring-1 focus:ring-green-500 outline-none transition-all" />
                </div>
                <div className="flex gap-2.5 pt-1 mb-4">
                  <button
                    onClick={handleTarikDana}
                    disabled={isSubmittingTarik || tukangSaldo < 10000}
                    className="flex-1 py-2.5 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors border-none cursor-pointer flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmittingTarik ? <span className="material-symbols-outlined text-sm animate-spin">sync</span> : "Tarik Saldo"}
                  </button>
                </div>

                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Riwayat Penarikan</span>
                
                <div className="divide-y divide-outline-variant/10 max-h-40 overflow-y-auto space-y-2 pr-1 chat-scrollbar">
                  {riwayatTarik.length === 0 ? (
                    <p className="text-xs text-on-surface-variant/60 text-center py-4">Belum ada riwayat penarikan.</p>
                  ) : riwayatTarik.map(rt => (
                    <div key={rt.id} className="flex justify-between items-center py-2 text-[11px] font-medium">
                      <div>
                        <p className="text-on-surface">Ke {rt.rekening_tujuan}</p>
                        <p className="text-[9px] text-on-surface-variant/60">{new Date(rt.created_at).toLocaleDateString("id-ID", {day: 'numeric', month: 'short', year:'numeric'})}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-on-surface-variant/80 font-bold block">-Rp {parseInt(rt.jumlah_tarik).toLocaleString("id-ID")}</span>
                        <span className={`text-[9px] font-bold ${rt.status === 'pending' ? 'text-yellow-500' : 'text-green-500'}`}>{rt.status.toUpperCase()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CUSTOMER REVIEWS */}
      {activeModal === "reviews" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-surface-container border border-surface-variant/15 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up text-xs font-semibold my-8">
            <div className="p-5 border-b border-surface-variant/10 flex justify-between items-center bg-surface-container-high">
              <h3 className="text-sm font-extrabold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                Ulasan Pelanggan
              </h3>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              
              <div className="flex items-center gap-4 p-4 bg-surface-container-high rounded-2xl border border-outline-variant/10">
                <h4 className="text-3xl font-extrabold text-yellow-500">4.9</h4>
                <div className="space-y-1">
                  <div className="flex text-yellow-500 text-sm">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                  </div>
                  <p className="text-[10px] text-on-surface-variant/80">Rata-rata ulasan dari 142 pelanggan</p>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Ulasan Terbaru</span>
                
                <div className="divide-y divide-outline-variant/10 max-h-56 overflow-y-auto space-y-3 pr-1">
                  <div className="py-2 text-[11px] leading-normal font-medium space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-on-surface">Ibu Sinta</span>
                      <span className="text-[9px] text-on-surface-variant/60">2 hari yang lalu</span>
                    </div>
                    <div className="flex text-yellow-500 text-[10px]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                    </div>
                    <p className="text-on-surface-variant/80 italic">"Sangat cepat dan kerannya terpasang rapi sekali. Terima kasih banyak mas Denji."</p>
                  </div>

                  <div className="py-2 text-[11px] leading-normal font-medium space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-on-surface">Bpk. Ronald</span>
                      <span className="text-[9px] text-on-surface-variant/60">4 hari yang lalu</span>
                    </div>
                    <div className="flex text-yellow-500 text-[10px]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                    </div>
                    <p className="text-on-surface-variant/80 italic">"Pengerjaan rapi dan cepat, TV terpasang dengan kuat di dinding."</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setActiveModal(null)}
                className="w-full mt-2 bg-secondary text-on-secondary font-bold py-3 rounded-xl hover:scale-[1.01] transition-transform border-none cursor-pointer"
              >
                Tutup Ulasan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[0%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-[120px]"></div>
      </div>

    </div>
  );
}

export default TukangDashboard;
