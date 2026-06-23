import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Verification queue state for interactivity
  const [verifications, setVerifications] = useState([
    {
      id: 1,
      name: "Budi Santoso",
      type: "Tukang Listrik & Elektronik",
      location: "Kec. Lowokwaru, Malang",
      date: "22 Mei 2024",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBHbv4u2L_IGov9GQcUgwEvUphPz5E-YY5V0_Owl2pzSNiWDy0OPynrhBPHuRC7P7aorHJdpaEuctn60Mb7qg5W_2qeY1x7abSmDskRpRySJrkMa8lmcxg2FELR3cMeC7V9KVlPYS81XtKr_gJQXHJyM6rN7HiH5sGKlGP7NKEKrFULu0NyTIJf8ng2FoTMc9TThfzODwnO_lDamxc0xhuMh9ISfQ2WiV2z2nAK7v_hZX_3vb4qbu0vCswd94yNu-pGHiaJ2lmWBW8P",
      status: "pending"
    },
    {
      id: 2,
      name: "Siti Aminah",
      type: "Tukang Ledeng & Pipa",
      location: "Kec. Sukun, Malang",
      date: "23 Mei 2024",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAUOGUlOHo5W6x4MbUKaAvHWBpbZqNNrS4YhRF1j69VQfHjUIhJSm00d490GK0m8HRCPDdxhY5L3asuOPXEuOBdFTnIwl0JplhncExSwE7drBsBKcGyxRq49XI8AjklEt9ErQ-TsYPbEqTUBDYGvDrAwcm3IA0a_xIlXYLa63PjXPKorqCq3TDM6SJw7Dt25XuGey-5P6x1Y8qAhC5j07kSo5ZL5sWDenFTlBkV2PJ4eg7rjnJaoUqFMZw64j9d5cFni6t1Yc04S3Ds",
      status: "pending"
    },
    {
      id: 3,
      name: "Hendra Wijaya",
      type: "Tukang Kayu & Mebel",
      location: "Kec. Blimbing, Malang",
      date: "24 Mei 2024",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIC7DStFxVfqZ3Ik5DA2xJ5Theg2yJDHYsem9dm4rquDfX5ygrbjDU1d3FZZa5Pd_aptqvxet3LAwzZ4HL9R4S55dxiZLd5ST9rNRoef_w-NYm3CsgdmOyGDXsSZ6CZwv8ozXgHx0xYCXLUHFP-lYJvqb6iIme2M2WbqmARrzrLIytKt_nBJ0qP-RWAGECpVnMV3p3rEtYRFuL72xsmGJPnSkUiktlLzxKRwlnxcGBVwF_E74MH_M7nFfvNugjAXJyqawrgwtJLH57",
      status: "pending"
    }
  ]);

  const [notificationCount, setNotificationCount] = useState(3);

  // Statistics
  const pendingCount = 42 + verifications.filter(v => v.status === "pending").length - 3;
  const activeCount = 1208 + verifications.filter(v => v.status === "verified").length;

  const handleVerify = (id) => {
    setVerifications(prev =>
      prev.map(v => (v.id === id ? { ...v, status: "verifying" } : v))
    );

    setTimeout(() => {
      setVerifications(prev =>
        prev.map(v => (v.id === id ? { ...v, status: "verified" } : v))
      );
      setTimeout(() => {
        setVerifications(prev => prev.filter(v => v.id !== id));
      }, 500);
    }, 800);
  };

  const handleReject = (id) => {
    setVerifications(prev =>
      prev.map(v => (v.id === id ? { ...v, status: "rejecting" } : v))
    );

    setTimeout(() => {
      setVerifications(prev => prev.filter(v => v.id !== id));
    }, 500);
  };

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/admin/dashboard", active: true },
    { id: "verifikasi", label: "Verifikasi Tukang", icon: "how_to_reg", path: "/admin/verifikasi" },
    { id: "data", label: "Data Tukang", icon: "engineering", path: "/admin/data" },
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

      {/* SideNavBar - Styled exactly like the customer dashboard */}
      <aside className={`h-screen w-64 fixed left-0 top-0 bg-surface-container flex flex-col py-6 px-4 z-50 border-r border-surface-variant/20 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-4 mb-8 flex justify-between items-center">
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-secondary">TukangAja</h1>
            <p className="text-on-surface-variant font-label-sm text-[10px] tracking-widest uppercase opacity-60">Service Management</p>
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
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBptQCBhIVkNm2XczCHyaEWm7xor36dHEkGaOhsjsuLkFPJ-JhXUY9RNh7B9La-S8mH3aenNWIwcNT0Hgywql2RVPcWFngWxNw0IXczpplDGiYdECoST8JQVlLOQyuXPvsB9Ygiz56bBrl72G_tQoL3R36-ioHzMFWZJJ7kJAdlSfe7pVKBgluV4BSTDcqHuOoDc_Xa-Tp8GrGXLfY7a-j6W2ql6QTka6ObhwJe6qJOkilQKUm6I5S6YoGFxAYxY4Nq_B1I02iICNRP"
                />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-on-surface truncate">Super Admin</h4>
                <p className="text-xs text-on-surface-variant/60 truncate">admin@tukangaja.id</p>
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
              className="lg:hidden p-2 text-on-surface-variant transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">search</span>
              <input 
                className="w-full bg-surface-container-high border-none rounded-full py-2.5 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-secondary/50 transition-all text-sm" 
                placeholder="Cari tukang, wilayah, atau layanan..." 
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-on-surface-variant relative cursor-pointer flex items-center justify-center bg-transparent border-none">
              <span className="material-symbols-outlined">notifications</span>
              {notificationCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full"></span>
              )}
            </button>
            <button className="p-2 text-on-surface-variant cursor-pointer flex items-center justify-center bg-transparent border-none">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </header>

        {/* Canvas */}
        <div className="pt-28 pb-12 px-6 md:px-12 max-w-7xl w-full mx-auto space-y-8 flex-grow page-transition">
          
          {/* Welcome Section */}
          <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-headline-xl text-headline-xl text-on-background mb-2 text-3xl font-bold mt-3">Selamat Datang, <span className="text-secondary">Admin!</span></h2>
              <p className="font-body-lg text-sm text-on-surface-variant/80 font-normal leading-relaxed">Berikut adalah ringkasan operasional TukangAja hari ini.</p>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-high border border-surface-variant/20 px-4 py-2 rounded-xl text-xs font-semibold text-on-surface self-start sm:self-auto">
              <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_today</span>
              <span className="text-xs font-semibold">Senin, 24 Mei 2024</span>
            </div>
          </section>

          {/* Summary Cards (Bento Grid Style - hover and scale transformations removed) */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-surface-container-high/60 backdrop-blur-md p-6 rounded-2xl flex flex-col gap-4 border border-surface-variant/20 shadow-lg">
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-xl bg-secondary/15 text-secondary border border-secondary/10">
                  <span className="material-symbols-outlined">pending_actions</span>
                </div>
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest bg-secondary/10 px-2 py-0.5 rounded-full border border-secondary/15">
                  +12%
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-on-surface-variant/70 uppercase tracking-wider">Menunggu Verifikasi</p>
                <h3 className="text-3xl font-extrabold mt-1 text-on-surface">{pendingCount}</h3>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-surface-container-high/60 backdrop-blur-md p-6 rounded-2xl flex flex-col gap-4 border border-surface-variant/20 shadow-lg">
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-xl bg-primary/15 text-primary border border-primary/10">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full border border-primary/15">
                  Normal
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-on-surface-variant/70 uppercase tracking-wider">Tukang Aktif</p>
                <h3 className="text-3xl font-extrabold mt-1 text-on-surface">{activeCount.toLocaleString("id-ID")}</h3>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-surface-container-high/60 backdrop-blur-md p-6 rounded-2xl flex flex-col gap-4 border border-surface-variant/20 shadow-lg">
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-xl bg-green-500/15 text-green-400 border border-green-500/10">
                  <span className="material-symbols-outlined">cancel</span>
                </div>
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/15">
                  -2%
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-on-surface-variant/70 uppercase tracking-wider">Tukang Tidak Aktif</p>
                <h3 className="text-3xl font-extrabold mt-1 text-on-surface">{154}</h3>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-surface-container-high/60 backdrop-blur-md p-6 rounded-2xl flex flex-col gap-4 border border-surface-variant/20 shadow-lg">
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-xl bg-red-500/15 text-red-400 border border-red-500/10">
                  <span className="material-symbols-outlined">warning</span>
                </div>
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/15">
                  Perhatian
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-on-surface-variant/70 uppercase tracking-wider">Rating Bermasalah</p>
                <h3 className="text-3xl font-extrabold mt-1 text-on-surface">{8}</h3>
              </div>
            </div>
          </section>

          {/* Priority Section: Verification Queue */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-secondary rounded-full"></div>
                <h3 className="text-lg font-bold text-on-surface">Antrean Verifikasi</h3>
              </div>
              <button className="text-secondary font-bold text-xs flex items-center gap-1 bg-transparent border-none cursor-pointer">
                Lihat Semua <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            {/* Verification List - Hover actions/borders completely disabled */}
            <div className="space-y-3">
              {verifications.length === 0 ? (
                <div className="bg-surface-container p-8 rounded-2xl text-center text-on-surface-variant/65">
                  <span className="material-symbols-outlined text-4xl mb-2 text-secondary/45">verified_user</span>
                  <p className="text-xs font-medium">Semua pengajuan tukang telah selesai diverifikasi!</p>
                </div>
              ) : (
                verifications.map((item) => (
                  <div 
                    key={item.id} 
                    className={`bg-surface-container-high/40 p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4 border border-surface-variant/10 ${
                      item.status === "verifying" 
                        ? "border-l-4 border-l-yellow-500" 
                        : item.status === "rejecting"
                        ? "border-l-4 border-l-red-500"
                        : "border-l-4 border-l-secondary"
                    } ${
                      item.status === "verified" || item.status === "rejected"
                        ? "opacity-0 translate-x-12 scale-95 duration-500" 
                        : "duration-300"
                    } transition-all`}
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container-lowest shrink-0 border border-outline-variant/20 relative">
                      <img className="w-full h-full object-cover" alt={item.name} src={item.avatar} />
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                      <div className="flex flex-col justify-center">
                        <h4 className="font-bold text-on-surface text-sm truncate">{item.name}</h4>
                        <p className="text-secondary text-xs font-bold mt-0.5">{item.type}</p>
                      </div>
                      
                      <div className="flex flex-col justify-center space-y-1">
                        <div className="flex items-center gap-2 text-on-surface-variant">
                          <span className="material-symbols-outlined text-[12px]">location_on</span>
                          <span className="text-[10px] font-medium">{item.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-on-surface-variant">
                          <span className="material-symbols-outlined text-[12px]">calendar_month</span>
                          <span className="text-[10px] font-medium">Daftar: {item.date}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2.5">
                        <Link to="/admin/verifikasi" className="px-4 py-2 rounded-xl border border-outline-variant text-on-surface-variant text-xs font-bold shrink-0 cursor-pointer bg-transparent">
                          Lihat Detail
                        </Link>
                        
                        <button 
                          onClick={() => handleReject(item.id)}
                          disabled={item.status !== "pending"}
                          className={`px-4 py-2 rounded-xl border border-red-500/30 text-red-400 text-xs font-bold bg-transparent cursor-pointer ${
                            item.status === "rejecting" ? "opacity-50" : ""
                          }`}
                        >
                          {item.status === "rejecting" ? "Ditolak..." : "Tolak"}
                        </button>

                        <button 
                          onClick={() => handleVerify(item.id)}
                          disabled={item.status !== "pending"}
                          className="bg-secondary text-on-secondary px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer border-none shadow-md shadow-secondary/15"
                        >
                          {item.status === "verifying" 
                            ? "Diproses..." 
                            : item.status === "verified"
                            ? "Sukses!"
                            : "Verifikasi"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      </main>

      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-secondary text-on-secondary rounded-full shadow-2xl flex items-center justify-center z-50 border-none cursor-pointer">
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      {/* Decorative Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-secondary/5 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-primary/5 blur-[80px] rounded-full"></div>
      </div>

    </div>
  );
}

export default AdminDashboard;
