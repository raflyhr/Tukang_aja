import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import LogoutModal from "../../components/LogoutModal";
import axios from "axios";

function CheckoutPembayaran() {
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

  // Retrieve pending payment or transaction to pay from location state
  const defaultPayment = {
    id: "PAY-WAIT-102",
    service: "Perbaikan Pipa Air - Darurat",
    tukang: "Budi Santoso",
    amount: "Rp 250.000",
    method: "GoPay",
    status: "Menunggu Pembayaran",
  };

  const paymentData = location.state?.pendingPayment || location.state?.transaction || defaultPayment;

  const [selectedMethod, setSelectedMethod] = useState(
    paymentData.method.includes("BCA") ? "Transfer Bank (BCA)" :
    paymentData.method.includes("Dana") ? "Dana" :
    paymentData.method.includes("OVO") ? "OVO" :
    paymentData.method.includes("QRIS") ? "QRIS" : "GoPay"
  );

  const [isPaying, setIsPaying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showQROverlay, setShowQROverlay] = useState(false);

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/pelanggan/dashboard" },
    { id: "pesanan", label: "Pesanan Saya", icon: "receipt_long", path: "/pelanggan/pesanan" },
    { id: "chat", label: "Chat", icon: "chat", path: "/pelanggan/chat" },
    { id: "pembayaran", label: "Pembayaran", icon: "payments", path: "/pelanggan/pembayaran" },
    { id: "profil", label: "Profil", icon: "person", path: "/pelanggan/profil" },
  ];

  const methodsList = [
    { name: "Transfer Bank (BCA)", type: "Bank Transfer", detail: "Rek. **** 9012", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg", logoBg: "bg-white p-1" },
    { name: "Dana", type: "E-Wallet", detail: "0812 **** 4832", logo: "https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg", logoBg: "bg-white p-2" },
    { name: "GoPay", type: "E-Wallet", detail: "0812 **** 4832", logo: "https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg", logoBg: "bg-white p-1.5" },
    { name: "OVO", type: "E-Wallet", detail: "0812 **** 4832", logo: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_ovo_purple.svg", logoBg: "bg-white p-2" },
    { name: "QRIS", type: "Instant", detail: "E-Wallet & Mobile Banking", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg", logoBg: "bg-white p-1" },
  ];

  // Calculate costs
  const numericAmount = parseInt(paymentData.amount.replace(/[^0-9]/g, "")) || 0;
  const adminFee = 10000;
  const ppn = Math.round(numericAmount * 0.11);
  const totalCost = numericAmount + adminFee + ppn;

  const formatRupiah = (num) => {
    return "Rp " + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    
    if (selectedMethod === "QRIS") {
      setShowQROverlay(true);
      return;
    }

    processPaymentSim();
  };

  const processPaymentSim = async () => {
    setIsPaying(true);
    try {
      // Check if it is a real database ID (numeric or is parsed as one)
      const isRealOrder = !isNaN(Number(paymentData.id));
      if (isRealOrder) {
        await axios.put(`http://127.0.0.1:8000/api/pesanan/${paymentData.id}/bayar`, {
          tipe: 'full'
        });
      }
      
      setIsPaying(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        // Redirect back with state indicating payment was successful
        navigate("/pelanggan/pembayaran", { 
          state: { 
            paymentSuccess: true, 
            paymentId: paymentData.id,
            serviceName: paymentData.service,
            methodUsed: selectedMethod
          } 
        });
      }, 1500);
    } catch (err) {
      setIsPaying(false);
      console.error(err);
      alert(err.response?.data?.message || "Gagal memproses pembayaran. Cek saldo Anda.");
    }
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
            const isActive = item.id === "pembayaran";
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
            <span className="font-headline-md text-headline-md font-bold text-secondary hidden sm:block">Checkout Pembayaran</span>
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
                <Link to="/pelanggan/pembayaran" className="hover:underline">Pembayaran</Link>
                <span>/</span>
                <span className="text-on-surface font-semibold">Checkout</span>
              </div>
              <h2 className="text-xl font-bold text-on-surface mt-1">Konfirmasi Pembayaran Anda</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Transaction Review */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-surface-container p-6 rounded-3xl border border-surface-variant/15 shadow-xl space-y-4">
                <h3 className="font-bold text-sm text-on-surface uppercase tracking-wider">Detail Pekerjaan Jasa</h3>
                
                <div className="p-4 bg-surface-container-high rounded-2xl border border-outline-variant/10 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-secondary tracking-widest">{paymentData.id}</span>
                      <h4 className="font-bold text-base text-on-surface mt-1">{paymentData.service}</h4>
                      <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-primary">person</span>
                        Tukang: <strong className="text-on-surface">{paymentData.tukang}</strong>
                      </p>
                    </div>
                    <span className="bg-secondary/15 text-secondary border border-secondary/20 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                      PENDING
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2 text-xs font-semibold">
                  <h4 className="text-xs font-bold text-on-surface-variant">Rincian Biaya</h4>
                  <div className="flex justify-between items-center text-on-surface-variant">
                    <span>Biaya Jasa</span>
                    <span>{paymentData.amount}</span>
                  </div>
                  <div className="flex justify-between items-center text-on-surface-variant">
                    <span>Biaya Platform/Admin</span>
                    <span>{formatRupiah(adminFee)}</span>
                  </div>
                  <div className="flex justify-between items-center text-on-surface-variant pb-2 border-b border-surface-variant/10">
                    <span>PPN (11%)</span>
                    <span>{formatRupiah(ppn)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-extrabold text-on-surface">Total Pembayaran</span>
                    <span className="font-extrabold text-secondary text-sm">{formatRupiah(totalCost)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Payment Method Selector & Pay Action */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-surface-container p-6 rounded-3xl border border-surface-variant/15 shadow-xl space-y-4">
                <h3 className="font-bold text-sm text-on-surface uppercase tracking-wider">Pilih Metode Pembayaran</h3>
                
                {isSuccess ? (
                  <div className="text-center py-10 space-y-3">
                    <span className="material-symbols-outlined text-green-400 text-5xl animate-bounce">task_alt</span>
                    <h4 className="font-bold text-on-surface">Pembayaran Berhasil!</h4>
                    <p className="text-[10px] text-on-surface-variant">Kembali ke dasbor pembayaran...</p>
                  </div>
                ) : isPaying ? (
                  <div className="text-center py-10 space-y-3">
                    <span className="material-symbols-outlined text-secondary text-5xl animate-spin">sync</span>
                    <h4 className="font-bold text-on-surface">Memproses Transaksi...</h4>
                    <p className="text-[10px] text-on-surface-variant">Jangan tutup halaman ini.</p>
                  </div>
                ) : (
                  <form onSubmit={handlePaymentSubmit} className="space-y-6 text-xs font-semibold">
                    <div className="space-y-3">
                      {methodsList.map((m) => {
                        const isChecked = selectedMethod === m.name;
                        return (
                          <div 
                            key={m.name}
                            onClick={() => setSelectedMethod(m.name)}
                            className={`flex items-center justify-between p-3.5 bg-surface-container-high rounded-2xl border cursor-pointer transition-all duration-200 ${
                              isChecked ? "border-secondary bg-surface-container-highest" : "border-outline-variant/10 hover:border-outline-variant/30"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border border-outline-variant/10 overflow-hidden ${m.logoBg}`}>
                                <img src={m.logo} alt={m.name} className="w-full h-full object-contain" />
                              </div>
                              <div>
                                <p className="font-bold text-xs text-on-surface">{m.name}</p>
                                <p className="text-[10px] text-on-surface-variant/50">{m.detail}</p>
                              </div>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${isChecked ? "border-secondary" : "border-outline-variant/50"}`}>
                              {isChecked && <div className="w-2 h-2 bg-secondary rounded-full"></div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-secondary text-on-secondary hover:bg-secondary/90 py-3.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-secondary/15 hover:scale-[1.01] active:scale-[0.99] border-none"
                    >
                      <span className="material-symbols-outlined text-xs">lock</span>
                      Bayar Sekarang ({formatRupiah(totalCost)})
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* QRIS / QR CODE DISPLAY OVERLAY */}
      {showQROverlay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container border border-surface-variant/15 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center text-xs font-semibold space-y-6 animate-scale-up">
            <div className="flex justify-between items-center pb-2 border-b border-surface-variant/10">
              <h4 className="font-extrabold text-sm text-secondary">Scan QRIS Untuk Bayar</h4>
              <button 
                onClick={() => setShowQROverlay(false)}
                className="p-1 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer border-none bg-transparent"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="bg-white p-5 rounded-2xl inline-block border-4 border-secondary/10">
              {/* Dummy SVG QR Code */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-48 h-48 mx-auto">
                <rect width="100" height="100" fill="white"/>
                {/* Outter corner boxes */}
                <rect x="5" y="5" width="20" height="20" fill="black"/>
                <rect x="8" y="8" width="14" height="14" fill="white"/>
                <rect x="11" y="11" width="8" height="8" fill="black"/>
                
                <rect x="75" y="5" width="20" height="20" fill="black"/>
                <rect x="78" y="8" width="14" height="14" fill="white"/>
                <rect x="81" y="11" width="8" height="8" fill="black"/>
                
                <rect x="5" y="75" width="20" height="20" fill="black"/>
                <rect x="8" y="78" width="14" height="14" fill="white"/>
                <rect x="11" y="81" width="8" height="8" fill="black"/>
                
                {/* Random noise matrix simulating QR code data */}
                <rect x="35" y="10" width="5" height="15" fill="black"/>
                <rect x="45" y="5" width="10" height="5" fill="black"/>
                <rect x="60" y="15" width="5" height="5" fill="black"/>
                
                <rect x="10" y="35" width="15" height="5" fill="black"/>
                <rect x="5" y="45" width="5" height="10" fill="black"/>
                <rect x="20" y="55" width="5" height="5" fill="black"/>
                
                <rect x="35" y="35" width="30" height="30" fill="black"/>
                <rect x="40" y="40" width="20" height="20" fill="white"/>
                <rect x="45" y="45" width="10" height="10" fill="black"/>
                
                <rect x="75" y="35" width="10" height="5" fill="black"/>
                <rect x="80" y="45" width="15" height="10" fill="black"/>
                <rect x="90" y="60" width="5" height="15" fill="black"/>
                
                <rect x="35" y="75" width="15" height="5" fill="black"/>
                <rect x="35" y="85" width="5" height="10" fill="black"/>
                <rect x="45" y="90" width="15" height="5" fill="black"/>
                
                <rect x="65" y="75" width="5" height="15" fill="black"/>
                <rect x="75" y="85" width="20" height="10" fill="black"/>
              </svg>
            </div>

            <div className="space-y-1">
              <p className="font-bold text-on-surface text-sm">TOTAL: {formatRupiah(totalCost)}</p>
              <p className="text-[10px] text-on-surface-variant">Merchant: <strong>TukangAja Service</strong></p>
              <p className="text-[9px] text-on-surface-variant/60">Buka e-wallet Anda (Dana, OVO, GoPay) lalu scan kode QR di atas untuk menyelesaikan transaksi.</p>
            </div>

            <button
              onClick={() => {
                setShowQROverlay(false);
                processPaymentSim();
              }}
              className="w-full bg-secondary text-on-secondary hover:bg-secondary/90 py-3 rounded-xl font-bold transition-all border-none cursor-pointer"
            >
              Simulasikan Sukses Scan QRIS
            </button>
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

export default CheckoutPembayaran;
