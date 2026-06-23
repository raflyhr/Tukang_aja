import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function TukangDashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isActiveWorking, setIsActiveWorking] = useState(true);
  const [progressWidth, setProgressWidth] = useState(0);

  useEffect(() => {
    // Simple animation
    const timer = setTimeout(() => {
      setProgressWidth(85);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/tukang/dashboard", active: true },
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

      {/* SideNavBar - Desktop & Mobile Drawer */}
      <aside className={`h-screen w-64 fixed left-0 top-0 bg-surface-container flex flex-col py-6 px-4 z-50 border-r border-surface-variant/20 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
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
        <div className="mt-auto pt-4 border-t border-surface-variant/20">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/30 shrink-0">
                <img
                  className="w-full h-full object-cover"
                  alt="Denji"
                  src="https://64.media.tumblr.com/c9a40e15310bd677150504d378595de4/708a33221029625f-0b/s1280x1920/3304739f2245fc3c15e6e70ffff7ee91b2d2ac69.jpg"
                />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-on-surface truncate">Denji</h4>
                <p className="text-xs text-secondary truncate">Elite Technician</p>
              </div>
            </div>
            <Link to="/" className="text-on-surface-variant hover:text-red-400 transition-colors p-1 flex items-center justify-center cursor-pointer" title="Log Out">
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
              <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full"></span>
            </Link>
            <Link to="/bantuan" className="p-2 text-on-surface-variant hover:text-secondary transition-colors cursor-pointer flex items-center justify-center">
              <span className="material-symbols-outlined">help</span>
            </Link>
            <div className="h-10 w-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/30 ml-2">
              <img
                className="w-full h-full object-cover"
                alt="Denji Profile"
                src="https://64.media.tumblr.com/c9a40e15310bd677150504d378595de4/708a33221029625f-0b/s1280x1920/3304739f2245fc3c15e6e70ffff7ee91b2d2ac69.jpg"
              />
            </div>
          </div>
        </header>

        {/* Canvas */}
        <div className="pt-28 pb-12 px-6 md:px-12 max-w-7xl w-full mx-auto space-y-8 flex-grow page-transition">
          
          {/* Status & Greeting Section */}
          <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface">Halo, Denji!</h2>
              <p className="text-on-surface-variant/80 text-xs mt-1">Siap untuk membantu pelanggan hari ini?</p>
            </div>
            
            {/* Work Status Toggle */}
            <div className="bg-surface-container p-4 rounded-2xl flex items-center justify-between gap-8 border border-surface-variant/15 shadow-lg min-w-[280px]">
              <div>
                <p className="font-bold text-xs text-on-surface">{isActiveWorking ? "Aktif Bekerja" : "Tidak Aktif"}</p>
                <p className="text-[10px] text-on-surface-variant/60">Terlihat oleh pelanggan</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActiveWorking}
                  onChange={(e) => setIsActiveWorking(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
              </label>
            </div>
          </section>

          {/* Ringkasan Hari Ini Bento Grid */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Active Orders */}
            <div className="bg-surface-container p-5 rounded-2xl border-l-4 border-secondary shadow-md hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-3">
                <span className="material-symbols-outlined text-secondary">pending_actions</span>
                <span className="text-[10px] text-secondary bg-secondary/10 px-2 py-0.5 rounded-full font-bold">+12%</span>
              </div>
              <p className="text-[11px] font-bold text-on-surface-variant/70 uppercase tracking-wider">Pesanan Aktif</p>
              <h3 className="text-2xl font-extrabold mt-1 text-on-surface">03</h3>
            </div>

            {/* Completed Jobs */}
            <div className="bg-surface-container p-5 rounded-2xl border-l-4 border-primary shadow-md hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-3">
                <span className="material-symbols-outlined text-primary">task_alt</span>
              </div>
              <p className="text-[11px] font-bold text-on-surface-variant/70 uppercase tracking-wider">Pekerjaan Selesai</p>
              <h3 className="text-2xl font-extrabold mt-1 text-on-surface">128</h3>
            </div>

            {/* Average Rating */}
            <div className="bg-surface-container p-5 rounded-2xl border-l-4 border-yellow-500 shadow-md hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-3">
                <span className="material-symbols-outlined text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
              <p className="text-[11px] font-bold text-on-surface-variant/70 uppercase tracking-wider">Rating Rata-rata</p>
              <h3 className="text-2xl font-extrabold mt-1 text-on-surface">4.9</h3>
            </div>

            {/* Monthly Income */}
            <div className="bg-surface-container p-5 rounded-2xl border-l-4 border-green-500 shadow-md hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-3">
                <span className="material-symbols-outlined text-green-500">payments</span>
              </div>
              <p className="text-[11px] font-bold text-on-surface-variant/70 uppercase tracking-wider">Pendapatan (Bln Ini)</p>
              <h3 className="text-2xl font-extrabold mt-1 text-on-surface">Rp 8.4M</h3>
            </div>

          </section>

          {/* Grid: Pesanan Baru & Aktivitas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Main Feed: Pesanan Baru */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between h-8">
                <h3 className="font-bold text-on-surface text-base">Pesanan Baru Tersedia</h3>
                <button className="text-secondary hover:underline text-xs font-bold bg-transparent border-none cursor-pointer">
                  Lihat Semua
                </button>
              </div>

              <div className="space-y-4">
                
                {/* Order Card 1 */}
                <div className="group bg-surface-container hover:bg-surface-container-high/70 p-5 rounded-3xl border border-surface-variant/15 transition-all shadow-lg overflow-hidden relative">
                  <div className="flex flex-col md:flex-row gap-5">
                    <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden shrink-0">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        alt="Plumbing Job"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDymauO8hECOyauQr6APO_jnNU9MKKTqBHTkSw52lJDN-lQDP_AUEbTizrRdQLZY2rOCzIhl2L8juduEkx4cUwNfl_XDpwDnECGqrNVGxNu6SNZfxvK-fsjBPcQ9uzGZ5NRCeoQQPMbNv4QZJrh8LVPbG7Jsa4G0mAbZbxmrEM2bU4CHYNsnJQ3AAKTqyYozf617f7y9Agt18uD1vW8v5BtEzdBn0MJynAsbSqoPdk9ArpVMczz6rnyiimxpUm_mmb7Zg-eS8VaBANb"
                      />
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] text-secondary bg-secondary/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold border border-secondary/15">
                            Plumbing
                          </span>
                          <p className="font-extrabold text-lg text-secondary">Rp 250rb</p>
                        </div>
                        <h4 className="font-bold text-sm text-on-surface mb-2 leading-snug">
                          Perbaikan Keran Bocor & Instalasi Pipa Wastafel
                        </h4>
                        <div className="flex flex-wrap gap-4 text-on-surface-variant/80 text-[10px]">
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">location_on</span>
                            Kemang, Jakarta Selatan
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">near_me</span>
                            2.4 km dari lokasi Anda
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex gap-3">
                        <button className="flex-1 py-2 bg-secondary text-on-secondary text-xs font-bold rounded-xl hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer">
                          Terima Pekerjaan
                        </button>
                        <button className="px-4 py-2 border border-outline-variant/30 text-xs font-bold text-on-surface hover:bg-surface-container-high rounded-xl transition-colors cursor-pointer">
                          Detail
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Card 2 */}
                <div className="group bg-surface-container hover:bg-surface-container-high/70 p-5 rounded-3xl border border-surface-variant/15 transition-all shadow-lg overflow-hidden relative">
                  <div className="flex flex-col md:flex-row gap-5">
                    <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden shrink-0">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        alt="Electronics Job"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAoudWbFHMdlNaites7UIdGX0WIb8i9ixTaD3IQoQ9Zq7wsCnFOnOr1OgRIw9QBVAYovkQ9FsimLjMPDqhb8wLShaM7on1t00GKS76KjPlcUOy6uq1afccIJVG9_b_ZZ2Lk_ZsvHPYcNqOFjGF_PSxhG3fNexRgbPVbQy4YlS7NixsSG_RalvQ3ia89Oj4mK0TSPi4e1iyBTh7nU_d3arSSBHYOVhlL0_iA2K50Zi2HI4dLkdD7l4Qpq3NkekKkWCnMuJWWhCXs9VIu"
                      />
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] text-primary bg-primary/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold border border-primary/15">
                            Elektronik
                          </span>
                          <p className="font-extrabold text-lg text-secondary">Rp 450rb</p>
                        </div>
                        <h4 className="font-bold text-sm text-on-surface mb-2 leading-snug">
                          Instalasi TV Wall Mount 65 inch
                        </h4>
                        <div className="flex flex-wrap gap-4 text-on-surface-variant/80 text-[10px]">
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">location_on</span>
                            Senopati, Jakarta Selatan
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">near_me</span>
                            4.1 km dari lokasi Anda
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex gap-3">
                        <button className="flex-1 py-2 bg-secondary text-on-secondary text-xs font-bold rounded-xl hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer">
                          Terima Pekerjaan
                        </button>
                        <button className="px-4 py-2 border border-outline-variant/30 text-xs font-bold text-on-surface hover:bg-surface-container-high rounded-xl transition-colors cursor-pointer">
                          Detail
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Side Section: Aktivitas Terbaru */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between h-8">
                <h3 className="font-bold text-on-surface text-base">Aktivitas Terbaru</h3>
              </div>
              <div className="bg-surface-container p-6 rounded-3xl border border-surface-variant/15 shadow-lg relative">
                
                <div className="space-y-6 relative before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-outline-variant/40">
                  
                  {/* Timeline Item 1 */}
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-secondary flex items-center justify-center z-10">
                      <span className="material-symbols-outlined text-[12px] text-on-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    </div>
                    <p className="text-on-surface font-bold text-xs">Selesaikan Pekerjaan #4412</p>
                    <p className="text-[10px] text-on-surface-variant/75 mt-0.5">Perbaikan Listrik - Bpk. Irwan</p>
                    <span className="text-[9px] text-secondary/60 mt-1 block">15 menit yang lalu</span>
                  </div>

                  {/* Timeline Item 2 */}
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center z-10 border border-outline-variant/30">
                      <span className="material-symbols-outlined text-[12px] text-on-surface-variant">chat</span>
                    </div>
                    <p className="text-on-surface font-bold text-xs">Pesan Baru dari Ibu Siti</p>
                    <p className="text-[10px] text-on-surface-variant/75 mt-0.5">"Bisa datang jam 2 siang besok?"</p>
                    <span className="text-[9px] text-on-surface-variant/50 mt-1 block">1 jam yang lalu</span>
                  </div>

                  {/* Timeline Item 3 */}
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center z-10 border border-outline-variant/30">
                      <span className="material-symbols-outlined text-[12px] text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    </div>
                    <p className="text-on-surface font-bold text-xs">Rating 5 Bintang Diterima</p>
                    <p className="text-[10px] text-on-surface-variant/75 mt-0.5">Pekerjaan Cat Tembok - Apartemen Park</p>
                    <span className="text-[9px] text-on-surface-variant/50 mt-1 block">3 jam yang lalu</span>
                  </div>

                </div>

                <div className="mt-6 pt-5 border-t border-surface-variant/15">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-on-surface">Performa Minggu Ini</p>
                    <span className="text-[10px] text-secondary font-bold">Sangat Baik</span>
                  </div>
                  <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                    <div className="bg-secondary h-full transition-all duration-1000" style={{ width: `${progressWidth}%` }}></div>
                  </div>
                  <p className="text-[10px] text-on-surface-variant/70 mt-2 text-right">{progressWidth}% Target Tercapai</p>
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

    </div>
  );
}

export default TukangDashboard;
