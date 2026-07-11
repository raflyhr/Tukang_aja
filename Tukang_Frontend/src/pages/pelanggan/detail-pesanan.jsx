import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import LogoutModal from "../../components/LogoutModal";
import axios from "axios";

function DetailPesanan() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(null);

  const defaultOrder = {
    id: "ORD-2023-9812",
    service: "Perbaikan Pipa Bocor - Darurat",
    specialist: "Budi Santoso",
    schedule: "Hari ini, 14:00 WIB",
    status: "Dalam Perjalanan",
    statusType: "proses",
    cost: "Rp 250.000",
    icon: "plumbing",
    badge: "AKTIF",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB6yWPnddSoXxHicpYNBtHEB9FXwtpuTluaIkKfA2eKT4jdvEjy8C7RCg9K1NnouBaRsuUFpfOL_FUKN1Irzlwnw-7qoBxPKbIbJzM8LHYLbfBqF8s-Mks4p6Q-WMrNp6Zda5KPxHzwVy6DNRaSZ8v_qnF9NJPLHu6CcE6Z_ARUIJl-QCp6UCA1st-XSPbyVy_K3GpPJ8UCvhln7dm55FhSFi-VgaIFVFtaKKcZE55BMCu6TAxbvYpHGgdlo3HGEpWzGkdhRNk4Wl9e",
  };

  const order = location.state?.order || defaultOrder;

  useEffect(() => {
    if (order && order.status) {
      setCurrentStatus(order.status);
    }
  }, [order]);

  const handleAction = async (action) => {
    if (typeof order.id === 'string' && order.id.startsWith("ORD-")) {
      if(action === 'bayar') setCurrentStatus('menunggu_pengerjaan');
      if(action === 'konfirmasi-selesai') setCurrentStatus('selesai');
      if(action === 'komplain') setCurrentStatus('komplain');
      alert("Simulasi berhasil (Mode Dummy)");
      return;
    }
    try {
      if (action === 'bayar') {
        const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/pesanan/${order.id}/bayar`);
        if (res.data.snap_token) {
          window.snap.pay(res.data.snap_token, {
            onSuccess: async function (result) {
              try {
                await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/pesanan/${order.id}/bypass-midtrans`);
                alert("Pembayaran Berhasil!");
                setCurrentStatus('menunggu_pengerjaan');
              } catch (e) {
                console.error("Bypass Error:", e);
                alert("Berhasil bayar tapi gagal bypass status.");
              }
            },
            onPending: function (result) {
              alert("Menunggu Pembayaran Anda.");
            },
            onError: function (result) {
              alert("Pembayaran gagal!");
            },
            onClose: function () {
              alert("Anda menutup halaman pembayaran.");
            }
          });
          return;
        } else {
          alert(res.data.message || "Pembayaran berhasil dilakukan!");
          setCurrentStatus('menunggu_pengerjaan');
          return;
        }
      }

      const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/pesanan/${order.id}/${action}`);
      if(response.data) {
        alert(response.data.message);
        if(action === 'konfirmasi-selesai') setCurrentStatus('selesai');
        if(action === 'komplain') setCurrentStatus('komplain');
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem.");
    }
  };

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/pelanggan/dashboard" },
    { id: "pesanan", label: "Pesanan Saya", icon: "receipt_long", path: "/pelanggan/pesanan" },
    { id: "chat", label: "Chat", icon: "chat", path: "/pelanggan/chat" },

    { id: "profil", label: "Profil", icon: "person", path: "/pelanggan/profil" },
  ];

  // Define steps for timeline stepper
  const timelineSteps = [
    { label: "Pesanan Dibuat", time: "12:00 WIB", desc: "Pesanan berhasil dikonfirmasi oleh pelanggan.", active: true },
    { label: "Mencari Tukang", time: "12:05 WIB", desc: "Sistem mencocokkan mitra terbaik untuk Anda.", active: true },
    { label: "Tukang Ditugaskan", time: "12:15 WIB", desc: `${order.specialist} menyetujui pekerjaan.`, active: true },
    { 
      label: "Dalam Perjalanan", 
      time: "13:30 WIB", 
      desc: "Mitra sedang menuju ke lokasi Anda.", 
      active: order.status === "Dalam Perjalanan" || order.status === "Pengerjaan" || order.status === "Selesai" 
    },
    { 
      label: "Pengerjaan", 
      time: "--:--", 
      desc: "Perbaikan kerusakan sedang berlangsung.", 
      active: order.status === "Pengerjaan" || order.status === "Selesai" 
    },
    { 
      label: "Selesai", 
      time: "--:--", 
      desc: "Pekerjaan selesai dilakukan dan dikonfirmasi.", 
      active: order.status === "Selesai" 
    }
  ];

  // Calculate costs
  const numericCost = parseInt(order.cost.replace(/[^0-9]/g, "")) || 0;
  const adminFee = 10000;
  const ppn = Math.round(numericCost * 0.11);
  const totalCost = numericCost + adminFee + ppn;

  const formatRupiah = (num) => {
    return "Rp " + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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
                  alt="Reze Profile"
                  src="https://i.pinimg.com/736x/3a/5f/ec/3a5fec637c8a8850f6e2732cf42f5c67.jpg"
                />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-on-surface truncate">Reze</h4>
                <p className="text-xs text-on-surface-variant/60 truncate">chaostknight483@gmail.com</p>
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
            <span className="font-headline-md text-headline-md font-bold text-secondary hidden sm:block">Detail Pesanan</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/notifikasi" className="p-2 text-on-surface-variant hover:text-secondary transition-colors relative cursor-pointer flex items-center justify-center">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full"></span>
            </Link>
            <div className="h-10 w-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/30 ml-2">
              <img
                className="w-full h-full object-cover"
                alt="Reze Profile"
                src="https://i.pinimg.com/736x/3a/5f/ec/3a5fec637c8a8850f6e2732cf42f5c67.jpg"
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
                <span className="text-on-surface font-semibold">{order.id}</span>
              </div>
              <h2 className="text-xl font-bold text-on-surface mt-1">Detail Transaksi Jasa</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: General Info & Stepper */}
            <div className="lg:col-span-8 space-y-6">
              {/* Service & Specialist Overview */}
              <div className="bg-surface-container p-6 rounded-3xl border border-surface-variant/15 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-surface-container-highest flex items-center justify-center text-secondary shrink-0">
                    <span className="material-symbols-outlined text-[28px]">{order.icon}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-secondary/15 text-secondary border border-secondary/20 font-bold px-2 py-0.5 rounded uppercase">
                        {order.badge || "TRANSAKSI"}
                      </span>
                      <span className="text-xs text-on-surface-variant font-semibold">{order.id}</span>
                    </div>
                    <h3 className="font-bold text-lg text-on-surface mt-1">{order.service}</h3>
                    <p className="text-xs text-on-surface-variant mt-1.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-secondary">schedule</span>
                      {order.schedule}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-start sm:items-end gap-1">
                  <span className="text-[10px] text-on-surface-variant font-semibold block">Status Pekerjaan</span>
                  <span className={`font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 ${
                    (currentStatus || order.status) === "Dalam Perjalanan"
                      ? "bg-primary-container/20 text-primary"
                      : (currentStatus || order.status) === "Pengerjaan" || currentStatus === "sedang_dikerjakan" || currentStatus === "menunggu_pengerjaan" || currentStatus === "menunggu_konfirmasi_selesai"
                        ? "bg-on-tertiary-fixed-variant/50 text-tertiary"
                        : (currentStatus || order.status) === "Dibatalkan" || currentStatus === "komplain"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-green-500/10 text-green-400"
                  }`}>
                    {(currentStatus || order.status) === "Dalam Perjalanan" && <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>}
                    {currentStatus || order.status}
                  </span>
                </div>
              </div>

              {/* Progress Stepper Timeline */}
              <div className="bg-surface-container p-6 rounded-3xl border border-surface-variant/15 shadow-xl space-y-6">
                <h4 className="font-bold text-sm text-on-surface uppercase tracking-wider">Timeline Progress Pekerjaan</h4>
                <div className="relative pl-6 space-y-6 border-l border-outline-variant/30 ml-3">
                  {timelineSteps.map((step, idx) => {
                    const isCanceledOrder = order.status === "Dibatalkan";
                    const isStepCompleted = !isCanceledOrder && step.active;
                    return (
                      <div key={idx} className="relative">
                        {/* Dot indicator */}
                        <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-4 ${
                          isCanceledOrder && idx >= 3
                            ? "bg-surface-container border-red-500/35"
                            : isStepCompleted
                              ? "bg-secondary border-background"
                              : "bg-surface-container border-outline-variant/30"
                        } flex items-center justify-center z-10`}>
                          {isStepCompleted && (
                            <span className="w-1.5 h-1.5 bg-background rounded-full"></span>
                          )}
                        </div>

                        {/* Text info */}
                        <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-1">
                          <div>
                            <h5 className={`text-xs font-bold ${isStepCompleted ? "text-on-surface" : "text-on-surface-variant/50"}`}>
                              {isCanceledOrder && idx >= 3 && idx === 3 ? "Pesanan Dibatalkan" : step.label}
                            </h5>
                            <p className={`text-[10px] mt-0.5 ${isStepCompleted ? "text-on-surface-variant" : "text-on-surface-variant/40"}`}>
                              {isCanceledOrder && idx >= 3 && idx === 3 ? "Pekerjaan dibatalkan oleh pengguna/sistem." : step.desc}
                            </p>
                          </div>
                          <span className={`text-[10px] font-semibold shrink-0 ${isStepCompleted ? "text-secondary" : "text-on-surface-variant/30"}`}>
                            {isCanceledOrder && idx >= 3 ? "--:--" : step.time}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Specialist & Payment Detail */}
            <div className="lg:col-span-4 space-y-6">
              {/* Specialist Info Card */}
              <div className="bg-surface-container p-6 rounded-3xl border border-surface-variant/15 shadow-xl space-y-4">
                <h4 className="font-bold text-sm text-on-surface uppercase tracking-wider">Penyedia Jasa Anda</h4>
                <div className="flex items-center gap-3">
                  <div 
                    onClick={() => navigate("/pelanggan/profil-tukang", { state: { specialistName: order.tukang?.nama || order.specialist, specialistId: order.tukang?.id } })}
                    className="w-12 h-12 rounded-xl overflow-hidden border border-outline-variant/20 shrink-0 cursor-pointer"
                  >
                    <img 
                      className="w-full h-full object-cover" 
                      src={order.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=80&auto=format&fit=crop"} 
                      alt={order.tukang?.nama || order.specialist} 
                    />
                  </div>
                  <div>
                    <h5 
                      onClick={() => navigate("/pelanggan/profil-tukang", { state: { specialistName: order.tukang?.nama || order.specialist, specialistId: order.tukang?.id } })}
                      className="font-bold text-sm text-on-surface hover:text-secondary cursor-pointer"
                    >
                      {order.tukang?.nama || order.specialist}
                    </h5>
                    <p className="text-[10px] text-on-surface-variant">Mitra Terverifikasi TukangAja</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => navigate("/pelanggan/chat", { state: { orderId: order.id, specialistId: order.tukang?.id || order.specialist } })}
                    className="flex-grow bg-secondary/15 text-secondary border border-secondary/20 hover:bg-secondary/25 text-[11px] font-bold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xs">chat</span>
                    Kirim Chat
                  </button>
                  <button 
                    onClick={() => navigate("/pelanggan/profil-tukang", { state: { specialistName: order.tukang?.nama || order.specialist, specialistId: order.tukang?.id } })}
                    className="bg-surface-container-high border border-outline-variant/30 hover:border-secondary/40 text-on-surface text-[11px] font-bold py-2 px-3 rounded-xl transition-all cursor-pointer"
                  >
                    Lihat Profil
                  </button>
                </div>
              </div>

              {/* Payment Details Card */}
              <div className="bg-surface-container p-6 rounded-3xl border border-surface-variant/15 shadow-xl space-y-4">
                <h4 className="font-bold text-sm text-on-surface uppercase tracking-wider">Rincian Pembayaran</h4>
                <div className="space-y-2 text-xs font-semibold">
                  <div className="flex justify-between items-center text-on-surface-variant">
                    <span>Biaya Jasa</span>
                    <span>{formatRupiah(numericCost)}</span>
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

                <div className="p-3 bg-surface-container-high/50 rounded-xl border border-outline-variant/15 text-[10px] text-on-surface-variant font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-xs text-secondary">payments</span>
                    <span>Metode Pembayaran: <strong>QRIS (Bayar di Tempat)</strong></span>
                  </div>
                </div>
              </div>

              {/* Address details */}
              <div className="bg-surface-container p-6 rounded-3xl border border-surface-variant/15 shadow-xl space-y-2.5">
                <h4 className="font-bold text-sm text-on-surface uppercase tracking-wider">Lokasi Pengerjaan</h4>
                <div className="flex items-start gap-2.5 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm text-secondary mt-0.5">location_on</span>
                  <div>
                    <h5 className="font-bold text-on-surface">Rumah Utama</h5>
                    <p className="text-[10px] leading-relaxed mt-0.5">Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan, 12190</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-surface-container p-6 rounded-3xl border border-surface-variant/15 shadow-xl space-y-3">
                <h4 className="font-bold text-sm text-on-surface uppercase tracking-wider">Tindakan Pesanan</h4>
                
                {currentStatus === "menunggu_penawaran" || currentStatus === "menunggu" || currentStatus === "menunggu_pembayaran" || currentStatus === "menunggu_persetujuan" ? (
                  <button onClick={() => handleAction('bayar')} className="w-full bg-secondary text-background font-bold py-3 rounded-xl hover:bg-secondary/90 transition-all shadow-md cursor-pointer">
                    Bayar & Masuk Escrow
                  </button>
                ) : null}

                {currentStatus === "menunggu_konfirmasi_selesai" && (
                  <>
                    <button onClick={() => handleAction('konfirmasi-selesai')} className="w-full bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition-all shadow-md cursor-pointer">
                      Konfirmasi Pekerjaan Selesai
                    </button>
                    <button onClick={() => handleAction('komplain')} className="w-full mt-2 bg-red-500/10 text-red-500 font-bold py-3 rounded-xl hover:bg-red-500/20 border border-red-500/30 transition-all shadow-md cursor-pointer">
                      Komplain Pekerjaan
                    </button>
                  </>
                )}

                {(currentStatus === "menunggu_pengerjaan" || currentStatus === "sedang_dikerjakan") && (
                  <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-xl text-xs text-secondary font-semibold text-center">
                    Uang Anda ditahan di Escrow secara aman. Menunggu penyelesaian dari Tukang.
                  </div>
                )}
                
                {currentStatus === "komplain" && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 font-semibold text-center">
                    Pesanan dalam proses Komplain/Dispute oleh Admin.
                  </div>
                )}
                
                {currentStatus === "selesai" && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-xs text-green-600 font-semibold text-center">
                    Pekerjaan Selesai. Uang telah diteruskan ke Tukang.
                  </div>
                )}
              </div>
            </div>
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

export default DetailPesanan;
