import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminData } from "./adminData";

function ProfilAdmin() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/admin/dashboard" },
    { id: "verifikasi", label: "Verifikasi Tukang", icon: "how_to_reg", path: "/admin/verifikasi" },
    { id: "data", label: "Data Tukang", icon: "engineering", path: "/admin/data" },
    { id: "rating", label: "Monitoring Rating", icon: "star_rate", path: "/admin/rating" },
    { id: "profil", label: "Profil Admin", icon: "admin_panel_settings", path: "/admin/profil", active: true },
  ];

  const handleLogout = () => {
    setShowLogoutModal(false);
    navigate("/");
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

      {/* SideNavBar - Styled exactly like the customer/admin dashboard */}
      <aside className={`h-screen w-64 fixed left-0 top-0 bg-surface-container flex flex-col py-6 px-4 z-50 border-r border-surface-variant/20 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
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
              onClick={() => setShowLogoutModal(true)}
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
                placeholder="Cari data atau laporan..." 
                type="text"
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
        <div className="pt-28 pb-12 px-6 md:px-12 max-w-4xl w-full mx-auto space-y-8 flex-grow page-transition">
          
          {/* Header Section */}
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-on-surface">Manajemen Akun Admin</h2>
            <p className="text-sm text-on-surface-variant/80 font-normal mt-1">Kelola identitas dan akses sistem Anda melalui panel profil ini.</p>
          </div>

          {/* Profile Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Main Identity Card */}
            <div className="md:col-span-2 bg-surface-container-high/60 backdrop-blur-md rounded-2xl p-8 border border-surface-variant/20 shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-full transition-all duration-300"></div>
              
              <div className="flex flex-col sm:flex-row gap-8 items-start">
                <div className="relative shrink-0">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden ring-4 ring-secondary/20 bg-surface-container-highest">
                    <img 
                      className="w-full h-full object-cover" 
                      alt={adminData.name} 
                      src={adminData.avatar} 
                    />
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-secondary text-on-secondary rounded-xl flex items-center justify-center shadow-lg cursor-pointer border-none">
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>photo_camera</span>
                  </button>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-secondary mb-1">Informasi Dasar</h3>
                    <p className="font-headline-md text-xl font-bold text-on-surface">{adminData.name}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-medium">
                    <div>
                      <span className="text-xs text-on-surface-variant/70 font-bold block">Email Bisnis</span>
                      <p className="text-sm font-semibold text-on-surface mt-1">{adminData.email}</p>
                    </div>
                    <div>
                      <span className="text-xs text-on-surface-variant/70 font-bold block">Peran Sistem</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2.5 py-0.5 rounded bg-secondary/15 text-secondary text-xs font-bold border border-secondary/10 uppercase tracking-wide">
                          {adminData.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-surface-variant/20 flex flex-wrap gap-4">
                <button 
                  onClick={() => alert("Fitur edit profil sedang dalam pengembangan.")}
                  className="px-6 py-3 bg-secondary text-on-secondary font-bold rounded-xl flex items-center gap-2 cursor-pointer border-none shadow-md shadow-secondary/15"
                >
                  <span className="material-symbols-outlined">edit</span>
                  Edit Profil
                </button>
                <button 
                  onClick={() => setShowLogoutModal(true)}
                  className="px-6 py-3 border border-surface-variant/20 text-on-surface font-bold rounded-xl flex items-center gap-2 hover:bg-surface-container-highest bg-transparent transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-red-400">logout</span>
                  Logout
                </button>
              </div>
            </div>

            {/* Security Info Side Card */}
            <div className="flex flex-col gap-6">
              <div className="bg-surface-container-high/60 backdrop-blur-md rounded-2xl p-6 border border-surface-variant/20 shadow-lg flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-secondary">security</span>
                  <h4 className="font-bold text-on-surface">Keamanan</h4>
                </div>
                <ul className="space-y-4 font-medium">
                  <li className="flex justify-between items-center text-xs">
                    <span className="text-on-surface-variant/70">2FA (Two-Factor Auth)</span>
                    <span className="text-xs font-black text-secondary">AKTIF</span>
                  </li>
                  <li className="flex justify-between items-center text-xs">
                    <span className="text-on-surface-variant/70">Password Terakhir</span>
                    <span className="text-xs text-on-surface font-semibold">30 hari lalu</span>
                  </li>
                </ul>
              </div>

              <div className="bg-surface-container-high/60 backdrop-blur-md rounded-2xl p-6 border border-surface-variant/20 shadow-lg relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:rotate-12 transition-transform duration-500 text-secondary">
                  <span className="material-symbols-outlined" style={{ fontSize: "80px" }}>verified_user</span>
                </div>
                <h4 className="font-bold text-on-surface mb-2">Sertifikat Admin</h4>
                <p className="text-xs text-on-surface-variant/80 leading-relaxed font-medium">Akun Anda telah diverifikasi untuk akses Level 3 Management.</p>
              </div>
            </div>

          </div>

          {/* Activity Log Section (Bento Bottom) */}
          <div className="bg-surface-container-high/60 backdrop-blur-md rounded-2xl p-6 border border-surface-variant/20 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-base text-on-surface">Aktivitas Terakhir</h3>
              <button 
                onClick={() => alert("Membuka log aktivitas lengkap...")}
                className="text-xs font-extrabold text-secondary hover:underline cursor-pointer bg-transparent border-none"
              >
                Lihat Semua
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-highest transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-all">
                  <span className="material-symbols-outlined">login</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-on-surface">Login berhasil dari Chrome (MacOS)</p>
                  <span className="text-[10px] text-on-surface-variant/65">Hari ini, 09:42 WIB • IP: 192.168.1.45</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-highest transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-all">
                  <span className="material-symbols-outlined">settings_suggest</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-on-surface">Mengubah konfigurasi Verifikasi Tukang</p>
                  <span className="text-[10px] text-on-surface-variant/65">Kemarin, 14:15 WIB</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container border border-surface-variant/20 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100 opacity-100 duration-300">
            {/* Modal Header */}
            <div className="bg-surface-container-highest p-6 flex justify-center relative">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/20">
                <span className="material-symbols-outlined" style={{ fontSize: "32px" }}>logout</span>
              </div>
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface cursor-pointer bg-transparent border-none"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {/* Modal Body */}
            <div className="p-8 text-center">
              <h3 className="font-bold text-lg text-on-surface mb-2">Keluar dari Dashboard Admin?</h3>
              <p className="text-xs text-on-surface-variant/80 px-4 font-semibold leading-relaxed">Apakah Anda yakin ingin keluar dari akun admin? Anda harus login kembali untuk mengakses panel kontrol.</p>
            </div>
            {/* Modal Footer */}
            <div className="p-6 bg-surface-container-high/40 border-t border-surface-variant/15 flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 border border-surface-variant/20 text-on-surface font-bold rounded-xl hover:bg-surface-container-highest bg-transparent transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button 
                onClick={handleLogout}
                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-500/90 transition-opacity cursor-pointer border-none"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
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

export default ProfilAdmin;
