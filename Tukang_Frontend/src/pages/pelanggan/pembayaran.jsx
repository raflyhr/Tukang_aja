import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import LogoutModal from "../../components/LogoutModal";

function Pembayaran() {
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

const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Toast Notification State
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "success") => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // State-managed Saved Payment Methods
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, name: "Transfer Bank (BCA)", type: "Bank Transfer", detail: "Rek. **** 9012", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg", isPrimary: true, logoBg: "bg-white p-1" },
    { id: 2, name: "Dana", type: "E-Wallet", detail: "0812 **** 4832", logo: "https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg", isPrimary: false, logoBg: "bg-white/5 p-2" },
    { id: 3, name: "GoPay", type: "E-Wallet", detail: "0812 **** 4832", logo: "https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg", isPrimary: false, logoBg: "bg-white/5 p-1.5" },
    { id: 4, name: "OVO", type: "E-Wallet", detail: "0812 **** 4832", logo: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_ovo_purple.svg", isPrimary: false, logoBg: "bg-white/5 p-2" },
  ]);

  // State-managed Pending Payments with countdown values (timeLeft in seconds)
  const [pendingPayments, setPendingPayments] = useState([
    {
      id: "PAY-WAIT-102",
      service: "Perbaikan Pipa Air - Darurat",
      tukang: "Budi Santoso",
      amount: "Rp 250.000",
      method: "GoPay",
      status: "Menunggu Pembayaran",
      statusColor: "text-secondary bg-secondary/10 border-secondary/20",
      timeLeft: 120, // 2 minutes (ticks down)
    },
    {
      id: "PAY-WAIT-101",
      service: "Instalasi Panel Listrik Baru",
      tukang: "Andi Wijaya",
      amount: "Rp 1.200.000",
      method: "Transfer Bank BCA",
      status: "Diproses",
      statusColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      timeLeft: 7200, // 2 hours
    },
  ]);

  // State-managed Transaction History
  const [transactionHistory, setTransactionHistory] = useState([
    {
      id: "TX-9812",
      service: "Perbaikan Wastafel",
      tukang: "Bambang Susilo",
      date: "22 Juni 2026",
      method: "OVO",
      status: "Berhasil",
      statusColor: "text-green-400 bg-green-500/10 border-green-500/20",
      amount: "Rp 180.000",
    },
    {
      id: "TX-9790",
      service: "Pengecatan Ruang Tamu",
      tukang: "Hadi Pratama",
      date: "12 Nov 2023",
      method: "Transfer BCA",
      status: "Berhasil",
      statusColor: "text-green-400 bg-green-500/10 border-green-500/20",
      amount: "Rp 850.000",
    },
    {
      id: "TX-9755",
      service: "Deep Cleaning Apartemen",
      tukang: "Siti Aminah",
      date: "5 Nov 2023",
      method: "Dana",
      status: "Berhasil",
      statusColor: "text-green-400 bg-green-500/10 border-green-500/20",
      amount: "Rp 450.000",
    },
    {
      id: "TX-9730",
      service: "Perbaikan Atap Bocor",
      tukang: "Joko Susilo",
      date: "1 Nov 2023",
      method: "QRIS",
      status: "Gagal",
      statusColor: "text-red-400 bg-red-500/10 border-red-500/20",
      amount: "Rp 600.000",
    },
  ]);

  // Search & Filters State
  const [historyCategory, setHistoryCategory] = useState("Semua");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterOpts, setFilterOpts] = useState({
    date: "",
    method: "",
    status: "",
    minAmount: "",
    maxAmount: "",
  });

  // Modal open states
  const [isAddMethodOpen, setIsAddMethodOpen] = useState(false);
  const [newMethodData, setNewMethodData] = useState({ name: "", type: "Bank Transfer", detail: "" });
  const [selectedMethodActions, setSelectedMethodActions] = useState(null);
  const [selectedPendingDetail, setSelectedPendingDetail] = useState(null);
  const [selectedTxDetail, setSelectedTxDetail] = useState(null);
  const [activeInvoice, setActiveInvoice] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  // Handles checkout completion redirect state check
  useEffect(() => {
    if (location.state?.paymentSuccess) {
      const { paymentId, serviceName, methodUsed } = location.state;
      // Mark as paid
      setPendingPayments((prev) => prev.filter((p) => p.id !== paymentId));
      
      // Append to history
      const newTx = {
        id: "TX-" + Math.floor(1000 + Math.random() * 9000),
        service: serviceName,
        tukang: "Budi Santoso",
        date: "Hari ini",
        method: methodUsed,
        status: "Berhasil",
        statusColor: "text-green-400 bg-green-500/10 border-green-500/20",
        amount: "Rp 250.000",
      };
      setTransactionHistory((prev) => [newTx, ...prev]);

      showToast(`Pembayaran "${serviceName}" Berhasil!`, "success");
      // Clear location state
      navigate(location.pathname, { replace: true });
    }
  }, [location.state]);

  // Countdowns ticking effect
  useEffect(() => {
    const timer = setInterval(() => {
      setPendingPayments((prev) =>
        prev.map((p) => {
          if (p.timeLeft > 0) {
            const nextTime = p.timeLeft - 1;
            return {
              ...p,
              timeLeft: nextTime,
              status: nextTime === 0 ? "Expired" : p.status,
              statusColor: nextTime === 0 ? "text-red-400 bg-red-500/10 border-red-500/20" : p.statusColor,
            };
          }
          return p;
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds) => {
    if (seconds <= 0) return "Expired";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/pelanggan/dashboard" },
    { id: "pesanan", label: "Pesanan Saya", icon: "receipt_long", path: "/pelanggan/pesanan" },
    { id: "chat", label: "Chat", icon: "chat", path: "/pelanggan/chat" },

    { id: "profil", label: "Profil", icon: "person", path: "/pelanggan/profil" },
  ];

  const summaryData = [
    { label: "Total Pengeluaran", value: "Rp 3.820.000", icon: "payments", color: "text-secondary bg-secondary/10 border-secondary/15" },
    { label: "Pembayaran Bulan Ini", value: "Rp 1.100.000", icon: "calendar_today", color: "text-primary bg-primary/10 border-primary/15" },
    { label: "Transaksi Berhasil", value: `${transactionHistory.filter(t => t.status === "Berhasil").length} Transaksi`, icon: "task_alt", color: "text-green-400 bg-green-500/10 border-green-500/15" },
  ];

  // Saved payment method modifiers
  const handleSetPrimary = (method) => {
    setPaymentMethods((prev) =>
      prev.map((m) => ({ ...m, isPrimary: m.id === method.id }))
    );
    setSelectedMethodActions(null);
    showToast(`"${method.name}" dijadikan metode pembayaran utama.`, "success");
  };

  const handleDeleteMethod = (method) => {
    setPaymentMethods((prev) => prev.filter((m) => m.id !== method.id));
    setSelectedMethodActions(null);
    showToast(`"${method.name}" berhasil dihapus.`, "error");
  };

  const handleAddMethod = (e) => {
    e.preventDefault();
    if (!newMethodData.name || !newMethodData.detail) return;

    const logoMap = {
      BCA: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg",
      Dana: "https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg",
      GoPay: "https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg",
      OVO: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_ovo_purple.svg",
    };

    const typeLower = newMethodData.name.toLowerCase();
    const resolvedLogo = typeLower.includes("bca") ? logoMap.BCA :
      typeLower.includes("dana") ? logoMap.Dana :
      typeLower.includes("gopay") ? logoMap.GoPay :
      typeLower.includes("ovo") ? logoMap.OVO :
      "https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg";

    const newMethod = {
      id: Date.now(),
      name: newMethodData.name,
      type: newMethodData.type,
      detail: newMethodData.detail,
      logo: resolvedLogo,
      isPrimary: paymentMethods.length === 0,
      logoBg: "bg-white p-1",
    };

    setPaymentMethods((prev) => [...prev, newMethod]);
    setIsAddMethodOpen(false);
    setNewMethodData({ name: "", type: "Bank Transfer", detail: "" });
    showToast("Metode Pembayaran berhasil ditambahkan!", "success");
  };

  // Filter and Search execution
  const filteredHistory = transactionHistory.filter((tx) => {
    // Search Query (ID, service, specialist, method, status)
    const matchesSearch =
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.tukang.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.status.toLowerCase().includes(searchQuery.toLowerCase());

    // Tabs Category (Layanan vs Semua)
    const matchesTab = historyCategory === "Semua" || tx.service.toLowerCase().includes(searchQuery.toLowerCase());

    // Advanced filters
    const matchesDate = !filterOpts.date || tx.date.includes(filterOpts.date) || filterOpts.date === "";
    const matchesMethod = !filterOpts.method || tx.method.toLowerCase().includes(filterOpts.method.toLowerCase());
    const matchesStatus = !filterOpts.status || tx.status === filterOpts.status;

    // Nominal
    const numericAmount = parseInt(tx.amount.replace(/[^0-9]/g, "")) || 0;
    const matchesMinAmount = !filterOpts.minAmount || numericAmount >= parseInt(filterOpts.minAmount);
    const matchesMaxAmount = !filterOpts.maxAmount || numericAmount <= parseInt(filterOpts.maxAmount);

    return matchesSearch && matchesTab && matchesDate && matchesMethod && matchesStatus && matchesMinAmount && matchesMaxAmount;
  });

  // Paginated set
  const totalPages = Math.ceil(filteredHistory.length / pageSize) || 1;
  const paginatedHistory = filteredHistory.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDownloadPDF = (tx) => {
    showToast(`Invoice ${tx.id} berhasil diunduh.`, "success");
  };

  return (
    <div className="bg-background text-on-surface min-h-screen selection:bg-secondary/30 selection:text-secondary font-sans relative overflow-x-hidden flex">
      {/* Backdrop for Mobile Sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Toast Overlay */}
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
              {t.type === "success" ? "check_circle" : t.type === "error" ? "error" : "info"}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

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
                  src={user && user.foto_profil ? (user.foto_profil.startsWith("http") ? user.foto_profil : `${import.meta.env.VITE_API_BASE_URL}/storage/${user.foto_profil}`) : `https://ui-avatars.com/api/?name=${user ? user.name : 'Pelanggan'}&background=random`}
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
            <div className="flex items-center gap-4">
              <h2 className="font-headline-md text-headline-md font-bold text-secondary">Pembayaran</h2>
              <div className={`hidden md:flex bg-surface-container-high rounded-full px-4 py-1.5 items-center gap-3 ml-4 transition-all duration-200 ${searchFocused ? "ring-2 ring-secondary/50" : ""}`}>
                <span className="material-symbols-outlined text-on-surface-variant/50 text-sm">search</span>
                <input
                  className="bg-transparent border-none focus:ring-0 text-sm w-48 text-on-surface placeholder:text-on-surface-variant/40 outline-none"
                  placeholder="Cari transaksi..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/notifikasi" className="p-2 text-on-surface-variant hover:text-secondary transition-colors relative cursor-pointer flex items-center justify-center">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full"></span>
            </Link>
            <Link to="/bantuan" className="p-2 text-on-surface-variant hover:text-secondary transition-colors cursor-pointer flex items-center justify-center">
              <span className="material-symbols-outlined">help</span>
            </Link>
            <div className="h-10 w-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/30 ml-2">
              <img
                className="w-full h-full object-cover"
                alt="User Profile"
                src={user && user.foto_profil ? (user.foto_profil.startsWith("http") ? user.foto_profil : `${import.meta.env.VITE_API_BASE_URL}/storage/${user.foto_profil}`) : `https://ui-avatars.com/api/?name=${user ? user.name : 'Pelanggan'}&background=random`}
              />
            </div>
          </div>
        </header>

        {/* Canvas */}
        <div className="pt-28 pb-12 px-6 md:px-12 max-w-7xl w-full mx-auto space-y-8 flex-grow page-transition">
          
          {/* Ringkasan Pembayaran (Section 1) */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {summaryData.map((data) => (
              <div key={data.label} className="bg-surface-container/60 backdrop-blur-md p-6 rounded-2xl flex flex-col gap-4 border border-surface-variant/15 shadow-lg group hover:border-secondary/10 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-xl border ${data.color}`}>
                    <span className="material-symbols-outlined">{data.icon}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-on-surface-variant/70 uppercase tracking-wider">
                    {data.label}
                  </p>
                  <h3 className="text-2xl font-extrabold mt-1 text-on-surface">{data.value}</h3>
                </div>
              </div>
            ))}
          </section>

          {/* Bento Grid: Saved Payment Methods & Pending Payments */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Metode Pembayaran Tersimpan (Section 2) */}
            <div className="lg:col-span-6 bg-surface-container p-6 rounded-3xl border border-surface-variant/20 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-on-surface text-base">Metode Pembayaran Tersimpan</h3>
                  <span className="text-[10px] bg-secondary/10 border border-secondary/20 px-2 py-0.5 rounded-full text-secondary font-bold">Default</span>
                </div>
                
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div 
                      key={method.id} 
                      onClick={() => setSelectedMethodActions(method)}
                      title="Klik untuk atur metode pembayaran"
                      className="flex items-center justify-between p-3.5 bg-surface-container-high rounded-2xl border border-surface-variant/10 hover:border-secondary/20 transition-all duration-200 cursor-pointer hover:scale-[1.01]"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-outline-variant/10 overflow-hidden ${method.logoBg}`}>
                          <img src={method.logo} alt={method.name} className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-on-surface">{method.name}</p>
                          <p className="text-[10px] text-on-surface-variant/60 mt-0.5">{method.detail}</p>
                        </div>
                      </div>
                      {method.isPrimary && (
                        <span className="text-[9px] text-secondary border border-secondary/35 px-2 py-0.5 rounded-full font-bold uppercase">
                          Utama
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setIsAddMethodOpen(true)}
                className="w-full mt-6 bg-secondary text-on-secondary font-bold py-3 rounded-2xl text-xs hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 border-none"
              >
                <span className="material-symbols-outlined text-sm">add_circle</span>
                Tambah Metode Pembayaran
              </button>
            </div>

            {/* Pembayaran Menunggu Konfirmasi (Section 3) */}
            <div className="lg:col-span-6 bg-surface-container p-6 rounded-3xl border border-surface-variant/20 shadow-lg flex flex-col">
              <h3 className="font-bold text-on-surface mb-6 text-base">Menunggu Konfirmasi Pembayaran</h3>
              
              <div className="space-y-4 flex-1">
                {pendingPayments.map((item) => {
                  const isExpired = item.timeLeft <= 0;
                  return (
                    <div 
                      key={item.id} 
                      className="p-4 bg-surface-container-high rounded-2xl border border-surface-variant/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-secondary/15 transition-all cursor-pointer"
                      onClick={(e) => {
                        // Click card to open pending detail
                        if (e.target.tagName !== "BUTTON") {
                          setSelectedPendingDetail(item);
                        }
                      }}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">{item.id}</span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${item.statusColor}`}>
                            {isExpired ? "Expired" : item.status}
                          </span>
                          {!isExpired && (
                            <span className="text-[10px] text-on-surface-variant font-bold flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs text-secondary">schedule</span>
                              {formatTimer(item.timeLeft)}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-xs text-on-surface mt-1.5">{item.service}</h4>
                        <p className="text-[10px] text-on-surface-variant mt-0.5">Tukang: {item.tukang} • {item.method}</p>
                      </div>
                      <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                        <span className="font-extrabold text-sm text-on-surface">{item.amount}</span>
                        <button 
                          disabled={isExpired}
                          onClick={() => !isExpired && navigate("/pelanggan/checkout", { state: { pendingPayment: item } })}
                          className={`text-on-secondary text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all border-none ${
                            isExpired 
                              ? "bg-outline-variant/20 text-on-surface-variant/40 cursor-not-allowed" 
                              : "bg-secondary hover:scale-105 active:scale-95 cursor-pointer"
                          }`}
                        >
                          {isExpired ? "Expired" : "Bayar Sekarang"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </section>

          {/* Riwayat Transaksi (Section 4) */}
          <section className="bg-surface-container-low border border-surface-variant/15 rounded-3xl overflow-hidden shadow-lg">
            <div className="p-6 border-b border-surface-variant/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-on-surface text-base">Riwayat Transaksi</h3>
                <p className="text-on-surface-variant text-xs mt-0.5">Daftar transaksi pembayaran jasa yang telah selesai atau gagal</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-surface-container rounded-xl p-1 border border-outline-variant/10 text-xs font-semibold">
                  <button 
                    onClick={() => { setHistoryCategory("Semua"); setCurrentPage(1); }}
                    className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer border-none ${
                      historyCategory === "Semua" ? "bg-surface-container-highest text-on-surface font-bold" : "bg-transparent text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    Semua
                  </button>
                  <button 
                    onClick={() => { setHistoryCategory("Layanan"); setCurrentPage(1); }}
                    className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer border-none ${
                      historyCategory === "Layanan" ? "bg-surface-container-highest text-on-surface font-bold" : "bg-transparent text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    Layanan
                  </button>
                </div>
                <button 
                  onClick={() => setIsFilterModalOpen(true)}
                  className="p-2 rounded-xl bg-surface-container-high border border-outline-variant/20 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-sm">filter_list</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto scroll-hide">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-container-high/40 text-on-surface-variant/70 font-semibold border-b border-surface-variant/10">
                    <th className="p-4 uppercase tracking-wider">Transaksi</th>
                    <th className="p-4 uppercase tracking-wider">Tukang</th>
                    <th className="p-4 uppercase tracking-wider">Tanggal</th>
                    <th className="p-4 uppercase tracking-wider">Metode</th>
                    <th className="p-4 uppercase tracking-wider">Status</th>
                    <th className="p-4 uppercase tracking-wider text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant/10 font-medium">
                  {paginatedHistory.map((tx) => {
                    const isSuccess = tx.status === "Berhasil";
                    const isFailed = tx.status === "Gagal";
                    return (
                      <tr 
                        key={tx.id} 
                        className="hover:bg-surface-container-high/15 transition-colors cursor-pointer"
                        onClick={(e) => {
                          if (e.target.tagName !== "BUTTON") {
                            setSelectedTxDetail(tx);
                          }
                        }}
                      >
                        <td className="p-4">
                          <div>
                            <p className="font-bold text-on-surface">{tx.service}</p>
                            <p className="text-[10px] text-on-surface-variant/60 mt-0.5">{tx.id}</p>
                          </div>
                        </td>
                        <td className="p-4 text-on-surface-variant">{tx.tukang}</td>
                        <td className="p-4 text-on-surface-variant">{tx.date}</td>
                        <td className="p-4 text-on-surface-variant">{tx.method}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${tx.statusColor}`}>
                              {tx.status}
                            </span>
                            {isSuccess && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); setActiveInvoice(tx); }}
                                className="px-2 py-1 text-[9px] bg-secondary/15 text-secondary border border-secondary/25 hover:bg-secondary/25 transition-all rounded font-bold cursor-pointer"
                              >
                                Lihat Invoice
                              </button>
                            )}
                            {isFailed && (
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  navigate("/pelanggan/checkout", { state: { transaction: tx } }); 
                                }}
                                className="px-2 py-1 text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all rounded font-bold cursor-pointer"
                              >
                                Bayar Lagi
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right font-bold text-on-surface">{tx.amount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer Pagination */}
            <div className="p-4 flex items-center justify-between border-t border-surface-variant/10 bg-surface-container-high/20 text-xs font-semibold">
              <p className="text-on-surface-variant opacity-75">
                Menampilkan {filteredHistory.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, filteredHistory.length)} dari {filteredHistory.length} transaksi
              </p>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="p-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-on-surface-variant hover:text-on-surface disabled:opacity-30 transition-all flex items-center justify-center cursor-pointer" 
                  disabled={currentPage === 1}
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`h-8 w-8 flex items-center justify-center rounded-xl transition-all cursor-pointer border-none ${
                      currentPage === i + 1 
                        ? "bg-secondary text-on-secondary font-bold" 
                        : "hover:bg-surface-container-highest text-on-surface-variant"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className="p-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-on-surface-variant hover:text-on-surface disabled:opacity-30 transition-all flex items-center justify-center cursor-pointer"
                  disabled={currentPage === totalPages}
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </section>

          {/* Support */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="bg-primary-container/10 p-6 rounded-3xl border border-primary/20 relative overflow-hidden flex flex-col justify-between h-48">
              <div className="relative z-10 max-w-sm">
                <h4 className="font-bold text-primary mb-1 text-sm">Butuh Bantuan Transaksi?</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Jika Anda mengalami kendala mengenai pembayaran, konfirmasi transfer, atau kendala teknis lainnya, tim support kami siap membantu 24/7.
                </p>
              </div>
              <button 
                onClick={() => navigate("/pelanggan/chat", { state: { chatWith: "Customer Service" } })}
                className="relative z-10 w-fit flex items-center gap-1.5 text-primary text-xs font-bold hover:underline cursor-pointer border-none bg-transparent"
              >
                Hubungi Customer Service
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-[120px] text-primary/10 select-none pointer-events-none">support_agent</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-surface-container/40 rounded-2xl border border-surface-variant/10">
                <div className="h-10 w-10 rounded-full bg-surface-container-high flex items-center justify-center text-secondary shrink-0 border border-secondary/15">
                  <span className="material-symbols-outlined text-base">verified_user</span>
                </div>
                <div>
                  <h5 className="font-bold text-xs text-on-surface">Pembayaran Aman & Terenkripsi</h5>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed mt-0.5">
                    Setiap transaksi diproses dengan standar enkripsi SSL 256-bit tingkat perbankan untuk menjamin keamanan penuh.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-surface-container/40 rounded-2xl border border-surface-variant/10">
                <div className="h-10 w-10 rounded-full bg-surface-container-high flex items-center justify-center text-secondary shrink-0 border border-secondary/15">
                  <span className="material-symbols-outlined text-base">shield_with_heart</span>
                </div>
                <div>
                  <h5 className="font-bold text-xs text-on-surface">Perlindungan Dana Pelanggan</h5>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed mt-0.5">
                    Dana Anda hanya akan diteruskan ke tukang setelah Anda mengonfirmasi pekerjaan telah selesai dengan baik.
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* MODAL: TAMBAH METODE PEMBAYARAN */}
      {isAddMethodOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container border border-surface-variant/15 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up text-xs font-semibold">
            <div className="p-5 border-b border-surface-variant/10 flex justify-between items-center bg-surface-container-high">
              <h3 className="text-sm font-extrabold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">add_circle</span>
                Tambah Metode Pembayaran
              </h3>
              <button 
                onClick={() => setIsAddMethodOpen(false)}
                className="p-1 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleAddMethod} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-on-surface-variant text-[11px]">Nama Bank / E-Wallet</label>
                <input 
                  type="text"
                  placeholder="Contoh: BCA, Dana, GoPay, OVO"
                  className="w-full bg-surface-container-high border border-outline-variant rounded-xl p-3 text-xs text-on-surface outline-none focus:ring-1 focus:ring-secondary/50 font-bold"
                  value={newMethodData.name}
                  onChange={(e) => setNewMethodData({ ...newMethodData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-on-surface-variant text-[11px]">Kategori Tipe</label>
                <select
                  className="w-full bg-surface-container-high border border-outline-variant rounded-xl p-3 text-xs text-on-surface font-bold outline-none cursor-pointer"
                  value={newMethodData.type}
                  onChange={(e) => setNewMethodData({ ...newMethodData, type: e.target.value })}
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="E-Wallet">E-Wallet</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-on-surface-variant text-[11px]">Nomor Rekening / HP</label>
                <input 
                  type="text"
                  placeholder="Contoh: 0812 **** 4832 / 8012891282"
                  className="w-full bg-surface-container-high border border-outline-variant rounded-xl p-3 text-xs text-on-surface outline-none focus:ring-1 focus:ring-secondary/50 font-bold"
                  value={newMethodData.detail}
                  onChange={(e) => setNewMethodData({ ...newMethodData, detail: e.target.value })}
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full mt-2 bg-secondary text-on-secondary font-bold py-3.5 rounded-xl hover:scale-[1.01] transition-transform border-none cursor-pointer"
              >
                Tambahkan Metode
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: METHOD ACTIONS OVERLAY */}
      {selectedMethodActions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container border border-surface-variant/15 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up text-xs font-semibold">
            <div className="p-5 border-b border-surface-variant/10 flex justify-between items-center bg-surface-container-high">
              <h3 className="text-sm font-extrabold text-on-surface">Kelola: {selectedMethodActions.name}</h3>
              <button 
                onClick={() => setSelectedMethodActions(null)}
                className="p-1 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-6 space-y-3.5">
              <p className="text-on-surface-variant text-center mb-2">Pilih tindakan untuk metode pembayaran ini ({selectedMethodActions.detail})</p>
              
              {!selectedMethodActions.isPrimary && (
                <button
                  onClick={() => handleSetPrimary(selectedMethodActions)}
                  className="w-full bg-secondary text-on-secondary py-3 rounded-xl font-bold transition-all border-none cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">star</span>
                  Jadikan Utama
                </button>
              )}
              
              <button
                onClick={() => {
                  alert(`Fitur edit ${selectedMethodActions.name} akan dihubungkan ke backend.`);
                  setSelectedMethodActions(null);
                }}
                className="w-full bg-surface-container-highest border border-outline-variant/30 text-on-surface py-3 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                Edit Detail
              </button>

              <button
                onClick={() => handleDeleteMethod(selectedMethodActions)}
                className="w-full bg-red-500/10 border border-red-500/30 text-red-400 py-3 rounded-xl font-bold hover:bg-red-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                Hapus Metode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PENDING PAYMENT DETAIL */}
      {selectedPendingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container border border-surface-variant/15 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up text-xs font-semibold">
            <div className="p-5 border-b border-surface-variant/10 flex justify-between items-center bg-surface-container-high">
              <div>
                <h3 className="text-sm font-extrabold text-on-surface">Menunggu Konfirmasi Pembayaran</h3>
                <p className="text-[10px] text-on-surface-variant mt-0.5">ID Pembayaran: {selectedPendingDetail.id}</p>
              </div>
              <button 
                onClick={() => setSelectedPendingDetail(null)}
                className="p-1 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="p-4 bg-surface-container-high rounded-xl border border-outline-variant/10 space-y-2">
                <p className="text-[10px] text-on-surface-variant">Layanan Jasa:</p>
                <h4 className="text-sm font-extrabold text-on-surface">{selectedPendingDetail.service}</h4>
                <p className="text-[10px] text-on-surface-variant">Tukang: <strong>{selectedPendingDetail.tukang}</strong></p>
                <p className="text-[10px] text-on-surface-variant">Metode Pilihan: <strong>{selectedPendingDetail.method}</strong></p>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant">Nominal Tagihan:</span>
                <span className="font-extrabold text-base text-secondary">{selectedPendingDetail.amount}</span>
              </div>

              {/* QRIS / QR Code rendering inside Pending details */}
              {(selectedPendingDetail.method.includes("QRIS") || selectedPendingDetail.method.includes("GoPay") || selectedPendingDetail.method.includes("Dana") || selectedPendingDetail.method.includes("OVO")) && (
                <div className="text-center bg-white p-4 rounded-2xl border border-outline-variant/10 inline-block mx-auto w-fit">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-32 h-32 mx-auto">
                    <rect width="100" height="100" fill="white"/>
                    <rect x="5" y="5" width="20" height="20" fill="black"/>
                    <rect x="8" y="8" width="14" height="14" fill="white"/>
                    <rect x="11" y="11" width="8" height="8" fill="black"/>
                    <rect x="75" y="5" width="20" height="20" fill="black"/>
                    <rect x="78" y="8" width="14" height="14" fill="white"/>
                    <rect x="81" y="11" width="8" height="8" fill="black"/>
                    <rect x="5" y="75" width="20" height="20" fill="black"/>
                    <rect x="8" y="78" width="14" height="14" fill="white"/>
                    <rect x="11" y="81" width="8" height="8" fill="black"/>
                    <rect x="35" y="35" width="30" height="30" fill="black"/>
                    <rect x="40" y="40" width="20" height="20" fill="white"/>
                    <rect x="45" y="45" width="10" height="10" fill="black"/>
                    <rect x="75" y="75" width="20" height="20" fill="black"/>
                  </svg>
                  <p className="text-[9px] text-gray-500 mt-2 font-bold uppercase">Scan QRIS Untuk Bayar Cepat</p>
                </div>
              )}

              <div className="p-3 bg-surface-container-high/40 rounded-xl border border-outline-variant/10 flex items-center justify-between text-[10px] text-on-surface-variant font-medium">
                <span>Batas Waktu Pembayaran:</span>
                <span className="font-extrabold text-secondary">{formatTimer(selectedPendingDetail.timeLeft)}</span>
              </div>
            </div>

            <div className="p-5 border-t border-surface-variant/10 flex justify-end gap-2.5 bg-surface-container-high">
              <button 
                onClick={() => setSelectedPendingDetail(null)}
                className="px-4 py-2 border border-outline-variant text-on-surface hover:bg-surface-container-highest transition-all rounded-xl font-bold cursor-pointer bg-transparent"
              >
                Tutup
              </button>
              {selectedPendingDetail.timeLeft > 0 && (
                <button 
                  onClick={() => {
                    setSelectedPendingDetail(null);
                    navigate("/pelanggan/checkout", { state: { pendingPayment: selectedPendingDetail } });
                  }}
                  className="px-4 py-2 bg-secondary text-on-secondary hover:bg-secondary/90 transition-all rounded-xl font-bold cursor-pointer border-none"
                >
                  Bayar Sekarang
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TRANSACTION DETAIL */}
      {selectedTxDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container border border-surface-variant/15 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up text-xs font-semibold">
            <div className="p-5 border-b border-surface-variant/10 flex justify-between items-center bg-surface-container-high">
              <div>
                <h3 className="text-sm font-extrabold text-on-surface">Rincian Transaksi</h3>
                <p className="text-[10px] text-on-surface-variant mt-0.5">ID: {selectedTxDetail.id}</p>
              </div>
              <button 
                onClick={() => setSelectedTxDetail(null)}
                className="p-1 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2 pb-3 border-b border-surface-variant/10 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Layanan</span>
                  <span className="text-on-surface font-extrabold">{selectedTxDetail.service}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Tukang</span>
                  <span className="text-on-surface font-bold">{selectedTxDetail.tukang}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Tanggal</span>
                  <span className="text-on-surface">{selectedTxDetail.date}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Metode</span>
                  <span className="text-on-surface">{selectedTxDetail.method}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Status</span>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${selectedTxDetail.statusColor}`}>
                    {selectedTxDetail.status}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1 text-xs">
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span>Biaya Jasa</span>
                  <span>{selectedTxDetail.amount}</span>
                </div>
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span>Biaya Platform/Admin</span>
                  <span>Rp 10.000</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-surface-variant/10">
                  <span className="font-extrabold text-on-surface">Total</span>
                  <span className="font-extrabold text-secondary text-sm">
                    {"Rp " + (
                      (parseInt(selectedTxDetail.amount.replace(/[^0-9]/g, "")) || 0) + 10000
                    ).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-surface-variant/10 flex justify-end gap-2.5 bg-surface-container-high">
              {selectedTxDetail.status === "Berhasil" ? (
                <>
                  <button 
                    onClick={() => {
                      setSelectedTxDetail(null);
                      setActiveInvoice(selectedTxDetail);
                    }}
                    className="px-4 py-2 border border-outline-variant text-on-surface hover:bg-surface-container-highest transition-all rounded-xl font-bold cursor-pointer bg-transparent"
                  >
                    Lihat Invoice
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedTxDetail(null);
                      handleDownloadPDF(selectedTxDetail);
                    }}
                    className="px-4 py-2 bg-secondary text-on-secondary hover:bg-secondary/90 transition-all rounded-xl font-bold cursor-pointer border-none"
                  >
                    Unduh PDF
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      setSelectedTxDetail(null);
                      navigate("/pelanggan/chat", { state: { chatWith: "Customer Service" } });
                    }}
                    className="px-4 py-2 border border-outline-variant text-on-surface hover:bg-surface-container-highest transition-all rounded-xl font-bold cursor-pointer bg-transparent"
                  >
                    Bantuan CS
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedTxDetail(null);
                      navigate("/pelanggan/checkout", { state: { transaction: selectedTxDetail } });
                    }}
                    className="px-4 py-2 bg-secondary text-on-secondary hover:bg-secondary/90 transition-all rounded-xl font-bold cursor-pointer border-none"
                  >
                    Bayar Lagi
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FILTER ADVANCED */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container border border-surface-variant/15 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up text-xs font-semibold">
            <div className="p-5 border-b border-surface-variant/10 flex justify-between items-center bg-surface-container-high">
              <h3 className="text-sm font-extrabold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">filter_alt</span>
                Filter Transaksi
              </h3>
              <button 
                onClick={() => setIsFilterModalOpen(false)}
                className="p-1 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-on-surface-variant text-[11px]">Tanggal / Bulan</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Juni, Nov, 2023"
                  className="w-full bg-surface-container-high border border-outline-variant rounded-xl p-3 text-xs text-on-surface outline-none"
                  value={filterOpts.date}
                  onChange={(e) => setFilterOpts({ ...filterOpts, date: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-on-surface-variant text-[11px]">Metode Pembayaran</label>
                <select
                  className="w-full bg-surface-container-high border border-outline-variant rounded-xl p-3 text-xs text-on-surface outline-none"
                  value={filterOpts.method}
                  onChange={(e) => setFilterOpts({ ...filterOpts, method: e.target.value })}
                >
                  <option value="">Semua Metode</option>
                  <option value="BCA">Transfer Bank BCA</option>
                  <option value="Dana">Dana</option>
                  <option value="GoPay">GoPay</option>
                  <option value="OVO">OVO</option>
                  <option value="QRIS">QRIS</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-on-surface-variant text-[11px]">Status</label>
                <select
                  className="w-full bg-surface-container-high border border-outline-variant rounded-xl p-3 text-xs text-on-surface outline-none"
                  value={filterOpts.status}
                  onChange={(e) => setFilterOpts({ ...filterOpts, status: e.target.value })}
                >
                  <option value="">Semua Status</option>
                  <option value="Berhasil">Berhasil</option>
                  <option value="Gagal">Gagal</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-on-surface-variant text-[11px]">Min Nominal</label>
                  <input 
                    type="number" 
                    placeholder="Min"
                    className="w-full bg-surface-container-high border border-outline-variant rounded-xl p-3 text-xs text-on-surface outline-none"
                    value={filterOpts.minAmount}
                    onChange={(e) => setFilterOpts({ ...filterOpts, minAmount: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-on-surface-variant text-[11px]">Max Nominal</label>
                  <input 
                    type="number" 
                    placeholder="Max"
                    className="w-full bg-surface-container-high border border-outline-variant rounded-xl p-3 text-xs text-on-surface outline-none"
                    value={filterOpts.maxAmount}
                    onChange={(e) => setFilterOpts({ ...filterOpts, maxAmount: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-surface-variant/10 flex justify-end gap-2.5 bg-surface-container-high">
              <button 
                onClick={() => {
                  setFilterOpts({ date: "", method: "", status: "", minAmount: "", maxAmount: "" });
                  setIsFilterModalOpen(false);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-outline-variant text-on-surface hover:bg-surface-container-highest transition-all rounded-xl font-bold cursor-pointer bg-transparent"
              >
                Reset
              </button>
              <button 
                onClick={() => { setIsFilterModalOpen(false); setCurrentPage(1); }}
                className="px-4 py-2 bg-secondary text-on-secondary hover:bg-secondary/90 transition-all rounded-xl font-bold cursor-pointer border-none"
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PRATINJAU INVOICE */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container border border-surface-variant/15 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up text-xs font-semibold">
            <div className="p-5 border-b border-surface-variant/10 flex justify-between items-center bg-surface-container-high">
              <h3 className="text-sm font-extrabold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">receipt</span>
                Pratinjau Invoice
              </h3>
              <button 
                onClick={() => setActiveInvoice(null)}
                className="p-1 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-extrabold text-secondary uppercase">TukangAja Invoice</h4>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Invoice No: INV/{activeInvoice.id}</p>
                  <p className="text-[10px] text-on-surface-variant">Tanggal: {activeInvoice.date}</p>
                </div>
                <span className="bg-green-500/10 border border-green-500/20 text-green-400 font-bold px-2 py-0.5 rounded text-[9px] uppercase">
                  Lunas
                </span>
              </div>

              <div className="p-4 bg-surface-container-high rounded-xl border border-outline-variant/10 space-y-2">
                <div className="flex justify-between text-on-surface">
                  <span>{activeInvoice.service}</span>
                  <span className="font-bold">{activeInvoice.amount}</span>
                </div>
                <div className="flex justify-between text-[10px] text-on-surface-variant">
                  <span>Biaya Layanan & Admin</span>
                  <span>Rp 10.000</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-surface-variant/10 font-extrabold">
                  <span className="text-on-surface">Total Pembayaran</span>
                  <span className="text-secondary">
                    {"Rp " + (
                      (parseInt(activeInvoice.amount.replace(/[^0-9]/g, "")) || 0) + 10000
                    ).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-surface-variant/10 flex justify-end gap-2.5 bg-surface-container-high">
              <button 
                onClick={() => {
                  setActiveInvoice(null);
                  handleDownloadPDF(activeInvoice);
                }}
                className="px-4 py-2 bg-secondary text-on-secondary hover:bg-secondary/90 transition-all rounded-xl font-bold cursor-pointer border-none"
              >
                Unduh PDF
              </button>
              <button 
                onClick={() => window.print()}
                className="px-4 py-2 border border-outline-variant text-on-surface hover:bg-surface-container-highest transition-all rounded-xl font-bold cursor-pointer bg-transparent"
              >
                Cetak
              </button>
            </div>
          </div>
        </div>
      )}

      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={() => navigate("/")} 
        role="pelanggan" 
      />
    </div>
  );
}

export default Pembayaran;
