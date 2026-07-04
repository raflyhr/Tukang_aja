import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoutModal from "../../components/LogoutModal";

function RiwayatLogin() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  // Toast notifications state
  const [toasts, setToasts] = useState([]);
  
  const showToast = (message, type = "success") => {
    const id = Date.now().toString() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/pelanggan/dashboard" },
    { id: "pesanan", label: "Pesanan Saya", icon: "receipt_long", path: "/pelanggan/pesanan" },
    { id: "chat", label: "Chat", icon: "chat", path: "/pelanggan/chat" },
    { id: "pembayaran", label: "Pembayaran", icon: "payments", path: "/pelanggan/pembayaran" },
    { id: "profil", label: "Profil", icon: "person", path: "/pelanggan/profil" },
  ];

  // Stateful list of login sessions
  const [sessions, setSessions] = useState([
    {
      id: 1,
      device: "Windows 11 - Chrome 120.0",
      ip: "182.253.142.9",
      location: "Kebayoran Baru, Jakarta Selatan",
      time: "Aktif Sekarang",
      isCurrent: true,
      icon: "laptop_windows",
    },
    {
      id: 2,
      device: "iPhone 15 Pro Max - Safari Mobile",
      ip: "114.122.35.48",
      location: "SCBD, Jakarta Selatan",
      time: "2 jam yang lalu (26 Juni 2026 21:05 WIB)",
      isCurrent: false,
      icon: "phone_iphone",
    },
    {
      id: 3,
      device: "MacBook Pro M3 - Safari 17.2",
      ip: "110.136.210.155",
      location: "Bandung, Jawa Barat",
      time: "3 hari yang lalu (23 Juni 2026 14:20 WIB)",
      isCurrent: false,
      icon: "laptop_mac",
    },
  ]);

  const [isRevoking, setIsRevoking] = useState(false);

  const handleRevokeOthers = () => {
    setIsRevoking(true);
    setTimeout(() => {
      setSessions(sessions.filter((s) => s.isCurrent));
      setIsRevoking(false);
      showToast("Berhasil keluar dari seluruh perangkat lain!", "success");
    }, 1500);
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

      {/* Toast Notifications */}
      <div className="fixed top-24 right-6 z-[100] space-y-3 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-slide-in text-xs font-semibold ${
              t.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-surface-container border-outline-variant/30 text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {t.type === "success" ? "check_circle" : "info"}
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
            const isActive = item.id === "profil";
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
            <span className="font-headline-md text-headline-md font-bold text-secondary hidden sm:block">Riwayat Login</span>
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
        <div className="pt-28 pb-12 px-6 md:px-12 max-w-4xl w-full mx-auto space-y-8 flex-grow page-transition">
          
          {/* Header & Back Button */}
          <div className="flex items-center justify-between gap-4">
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
                  <Link to="/pelanggan/profil" className="hover:underline">Profil</Link>
                  <span>/</span>
                  <span className="text-on-surface font-semibold">Riwayat Login</span>
                </div>
                <h2 className="text-xl font-bold text-on-surface mt-1">Keamanan & Riwayat Akses</h2>
              </div>
            </div>

            {sessions.length > 1 && (
              <button
                disabled={isRevoking}
                onClick={handleRevokeOthers}
                className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
              >
                {isRevoking ? "Memproses..." : "Keluar dari Perangkat Lain"}
              </button>
            )}
          </div>

          <div className="bg-surface-container rounded-3xl border border-surface-variant/15 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-surface-variant/15 bg-surface-container-high/40">
              <h3 className="font-bold text-sm text-on-surface">Sesi Perangkat yang Aktif</h3>
              <p className="text-[11px] text-on-surface-variant/70 mt-0.5">Daftar browser dan perangkat yang baru saja mengakses akun Anda.</p>
            </div>
            
            <div className="divide-y divide-surface-variant/10 text-xs">
              {sessions.map((session) => (
                <div key={session.id} className="p-6 flex items-start gap-4 hover:bg-surface-container-high/5 transition-colors">
                  <div className={`p-3 rounded-2xl border flex items-center justify-center shrink-0 ${session.isCurrent ? "bg-secondary/10 border-secondary/20 text-secondary" : "bg-surface-container-high border-outline-variant/10 text-on-surface-variant"}`}>
                    <span className="material-symbols-outlined text-xl">{session.icon}</span>
                  </div>
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-on-surface">{session.device}</h4>
                      {session.isCurrent && (
                        <span className="bg-green-500/10 border border-green-500/25 text-green-400 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Sesi Ini
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-[11px] text-on-surface-variant/80 font-medium">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-xs">dns</span>
                        <span>IP: {session.ip}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-xs">location_on</span>
                        <span className="truncate">{session.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:col-span-2 md:col-span-1">
                        <span className="material-symbols-outlined text-xs">schedule</span>
                        <span>{session.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 bg-surface-container/40 border border-outline-variant/15 rounded-2xl text-xs text-on-surface-variant flex items-start gap-3">
            <span className="material-symbols-outlined text-secondary text-base shrink-0 mt-0.5">verified_user</span>
            <div className="space-y-1 leading-relaxed">
              <h5 className="font-bold text-on-surface">Melindungi Akun Anda</h5>
              <p className="text-[11px] text-on-surface-variant/80">
                Jika Anda melihat aktivitas masuk dari perangkat atau lokasi yang tidak dikenal, segera keluarkan sesi tersebut menggunakan tombol di kanan atas dan ubah kata sandi akun Anda segera.
              </p>
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

export default RiwayatLogin;
