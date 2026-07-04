import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoutModal from "../../components/LogoutModal";
import api from "../../lib/axios";

function TukangPesanan() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("semua");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  const [technicianName, setTechnicianName] = useState("Tukang");
  const [avatar, setAvatar] = useState("https://64.media.tumblr.com/c9a40e15310bd677150504d378595de4/708a33221029625f-0b/s1280x1920/3304739f2245fc3c15e6e70ffff7ee91b2d2ac69.jpg");
  
  // Rejection reason select options
  const rejectReasons = [
    "Jadwal Bentrok",
    "Lokasi Terlalu Jauh",
    "Biaya Tidak Sesuai",
    "Keahlian Tidak Sesuai",
    "Lainnya"
  ];

  const [orders, setOrders] = useState([]);
  const [tukangId, setTukangId] = useState(null);

  useEffect(() => {
    // Ambil tukang_id dari localStorage
    const userDataStr = localStorage.getItem("user");
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
      navigate("/");
      return;
    }
    setTukangId(id);
  }, []);

  const fetchOrders = async () => {
    if (!tukangId) return;
    try {
      const res = await api.get(`/tukang/${tukangId}/pesanan`);
      if (res.data.status === 'Sukses') {
        const mappedOrders = res.data.data.map(order => ({
          id: order.id,
          clientName: order.user?.name || "Pelanggan",
          clientLoc: order.alamat_lengkap,
          clientAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKTfl-bPc3TYOy5r-jjyWK-ywD97kiKmUzf_fckpbG-fUGriGzIBeAYvujKLJIrVAaFR_vAJ-IPv7FSCgP8PVrxcSvLSiS3wILfbXS_YBz2fAaK6QbKEibAKOEdSbdNxSzP_1_P6gigW-WXYWGSUkNpqGCi9S8d0Mbhv7sTh-o5PXLb1XzNaj-x3BKXoYylvhC_l_RPbMK9V1uVH_HsOJeC-UFwuZ5dFhLWeri2WlVrGC41Qbkjt2paaIKIH8i6E9HxuTNhfn7nl4V",
          status: order.status,
          title: order.judul,
          desc: order.deskripsi_masalah,
          images: order.foto_lampiran ? JSON.parse(order.foto_lampiran) : [],
          budgetRange: order.budget_perkiraan || "Belum ditentukan",
          bidValue: order.harga_penawaran ? `Rp ${order.harga_penawaran.toLocaleString('id-ID')}` : "",
          totalValue: order.harga_penawaran ? `Rp ${order.harga_penawaran.toLocaleString('id-ID')}` : "",
          rejectReason: order.alasan_penolakan || "",
          hasBidSent: false,
          clientNotes: "Menunggu konfirmasi...",
          stepText: "Sedang diproses",
          stepProgress: 50,
          timeText: new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        }));
        setOrders(mappedOrders);
      }
    } catch (err) {
      console.error("Gagal memuat pesanan:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [tukangId]);

  const filterTabs = [
    { id: "semua", label: "Semua Pesanan" },
    { id: "menunggu_penawaran", label: "Menunggu Penawaran" },
    { id: "menunggu_persetujuan", label: "Menunggu Persetujuan" },
    { id: "menunggu_pembayaran", label: "Menunggu Pembayaran" },
    { id: "sedang_dikerjakan", label: "Sedang Dikerjakan" },
    { id: "selesai", label: "Selesai" },
    { id: "ditolak", label: "Ditolak" }
  ];

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/tukang/dashboard" },
    { id: "pesanan", label: "Pesanan Saya", icon: "assignment", path: "/tukang/pesanan", active: true },
    { id: "chat", label: "Chat", icon: "chat", path: "/tukang/chat" },
    { id: "profil", label: "Profil", icon: "person", path: "/tukang/profil" },
  ];

  // Handle Action - Send Bid
  const handleSendBid = async (id) => {
    // Sebagai contoh UI, kita prompt harga. Di dunia nyata bisa lewat form modal
    const harga = prompt("Masukkan nominal harga penawaran Anda (misal: 150000):");
    if (!harga) return;
    try {
      await api.put(`/pesanan/${id}/tawar`, { harga_penawaran: parseInt(harga) });
      fetchOrders();
    } catch (err) {
      alert("Gagal mengirim penawaran.");
    }
  };

  // Handle Action - Save Reason
  const handleSaveReason = async (id, reason, notes) => {
    try {
      await api.put(`/pesanan/${id}/tolak`, { alasan_penolakan: `${reason} - ${notes}` });
      fetchOrders();
      alert("Alasan penolakan berhasil disimpan!");
    } catch (err) {
      alert("Gagal menolak pesanan.");
    }
  };

  // Filter logic
  const filteredOrders = activeTab === "semua" 
    ? orders 
    : orders.filter(o => o.status === activeTab);

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
        <div className="mt-auto pt-4 border-t border-surface-variant/20">
          <div className="flex items-center justify-between px-2">
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
              <h2 className="font-headline-md text-headline-md font-bold text-secondary">Pesanan Saya</h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-surface-container px-3 py-1 rounded-full border border-outline-variant/30">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] text-secondary font-extrabold uppercase tracking-wider">Online</span>
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
            className="w-10 h-10 rounded-full border-2 border-surface-variant/30 object-cover"
            src={avatar}
            alt={technicianName}
          />  </div>
          </div>
        </header>

        {/* Canvas */}
        <div className="pt-28 pb-32 px-6 md:px-12 max-w-7xl w-full mx-auto space-y-8 flex-grow page-transition">
          
          {/* Status Tabs (Horizontal Scrollable) */}
          <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 sticky top-20 bg-background/95 backdrop-blur-sm z-30 py-2 border-b border-surface-variant/10">
            {filterTabs.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 px-6 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-secondary text-on-secondary shadow-lg shadow-secondary/20 scale-95"
                      : "bg-surface-container text-on-surface-variant/80 hover:text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Orders Grid/List */}
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">assignment_late</span>
              <p className="text-on-surface-variant text-sm">Tidak ada pesanan dengan status ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredOrders.map((order) => {
                
                // Card 1: Menunggu Penawaran
                if (order.status === "menunggu_penawaran") {
                  return (
                    <div 
                      key={order.id} 
                      className="bg-surface-container rounded-3xl p-6 border border-surface-variant/15 shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/20 shrink-0">
                              <img className="w-full h-full object-cover" alt={order.clientName} src={order.clientAvatar} />
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-on-surface">{order.clientName}</h3>
                              <div className="flex items-center gap-1 text-on-surface-variant/80 text-[11px] mt-0.5">
                                <span className="material-symbols-outlined text-xs">location_on</span>
                                {order.clientLoc}
                              </div>
                            </div>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-wider border border-primary/15">
                            Baru
                          </span>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-secondary font-bold text-sm mb-1">{order.title}</h4>
                          <p className="text-on-surface-variant/80 text-xs leading-relaxed line-clamp-3">{order.desc}</p>
                        </div>

                        {order.images && order.images.length > 0 && (
                          <div className="grid grid-cols-3 gap-2 mb-6">
                            {order.images.map((img, idx) => (
                              <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-surface-container-high border border-surface-variant/10">
                                <img className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" alt="Job Attachment" src={img} />
                              </div>
                            ))}
                            <div className="aspect-square rounded-xl flex items-center justify-center bg-surface-container-high border border-surface-variant/10 text-on-surface-variant font-extrabold text-xs">
                              +1
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-surface-variant/15">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-on-surface-variant/60 uppercase font-semibold">Budget Perkiraan</span>
                          <span className="text-xs font-bold text-on-surface mt-0.5">{order.budgetRange}</span>
                        </div>
                        {order.hasBidSent ? (
                          <button className="bg-surface-container-high border border-surface-variant/30 text-on-surface-variant text-xs font-bold px-5 py-2 rounded-xl cursor-not-allowed">
                            Penawaran Terkirim
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleSendBid(order.id)}
                            className="bg-secondary text-on-secondary text-xs font-bold px-5 py-2.5 rounded-xl hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                          >
                            Kirim Penawaran
                          </button>
                        )}
                      </div>
                    </div>
                  );
                }

                // Card 2: Menunggu Persetujuan
                if (order.status === "menunggu_persetujuan") {
                  return (
                    <div 
                      key={order.id} 
                      className="bg-surface-container/60 border border-secondary/20 bg-secondary/5 rounded-3xl p-6 shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
                    >
                      <div className="absolute top-0 right-0 px-4 py-1 bg-secondary text-on-secondary font-bold text-[9px] uppercase tracking-wider rounded-bl-2xl shadow-sm">
                        Menunggu Persetujuan
                      </div>

                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/20 shrink-0">
                            <img className="w-full h-full object-cover" alt={order.clientName} src={order.clientAvatar} />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-on-surface">{order.clientName}</h3>
                            <div className="flex items-center gap-1 text-on-surface-variant/80 text-[11px] mt-0.5">
                              <span className="material-symbols-outlined text-xs">location_on</span>
                              {order.clientLoc}
                            </div>
                          </div>
                        </div>

                        <div className="mb-6">
                          <h4 className="text-secondary font-bold text-sm mb-1">{order.title}</h4>
                          <p className="text-xs text-on-surface-variant/80">
                            Penawaran Anda: <span className="text-on-surface font-extrabold">{order.bidValue}</span>
                          </p>
                          {order.clientNotes && (
                            <div className="mt-3 p-3 rounded-xl bg-surface-container-high/80 border-l-4 border-secondary text-xs italic text-on-surface-variant/90 leading-relaxed">
                              "{order.clientNotes}"
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button className="flex-grow py-2 border border-outline-variant/30 text-xs font-bold text-on-surface hover:bg-surface-container-high rounded-xl transition-all cursor-pointer">
                          Hubungi Chat
                        </button>
                        <button className="flex-grow bg-surface-container-highest text-error text-xs font-bold py-2 rounded-xl hover:bg-error/15 transition-all cursor-pointer">
                          Batalkan
                        </button>
                      </div>
                    </div>
                  );
                }

                // Card 3: Menunggu Pembayaran
                if (order.status === "menunggu_pembayaran") {
                  return (
                    <div 
                      key={order.id} 
                      className="bg-surface-container rounded-3xl p-6 border border-surface-variant/15 shadow-xl hover:-translate-y-1 transition-all duration-300 opacity-95 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/20 shrink-0">
                            <img className="w-full h-full object-cover" alt={order.clientName} src={order.clientAvatar} />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-on-surface">{order.clientName}</h3>
                            <div className="flex items-center gap-1 text-on-surface-variant/80 text-[11px] mt-0.5">
                              <span className="material-symbols-outlined text-xs">location_on</span>
                              {order.clientLoc}
                            </div>
                          </div>
                          <div className="ml-auto flex flex-col items-end">
                            <span className="text-[9px] text-primary font-bold uppercase tracking-wider border border-primary/20 px-2 py-0.5 rounded-full bg-primary/10">Pending Payment</span>
                            <span className="text-xs font-extrabold text-on-surface mt-1">{order.totalValue}</span>
                          </div>
                        </div>

                        <div className="mb-6">
                          <h4 className="text-secondary font-bold text-sm mb-1">{order.title}</h4>
                          <div className="flex items-center gap-3 mt-3">
                            <div className="h-2 flex-grow bg-surface-container-highest rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${order.stepProgress}%` }}></div>
                            </div>
                            <span className="text-[10px] font-bold text-on-surface-variant/70 whitespace-nowrap">{order.stepText}</span>
                          </div>
                        </div>
                      </div>

                      <button className="w-full py-2.5 rounded-xl bg-surface-container-high border border-outline-variant/20 text-xs font-bold text-on-surface-variant/60 cursor-not-allowed">
                        Menunggu Pembayaran User
                      </button>
                    </div>
                  );
                }

                // Card 4: Ditolak / Form Alasan
                if (order.status === "ditolak") {
                  return (
                    <RejectionCard 
                      key={order.id}
                      order={order}
                      rejectReasons={rejectReasons}
                      onSaveReason={handleSaveReason}
                    />
                  );
                }

                return null;
              })}
            </div>
          )}

        </div>
      </main>

      {/* Floating Action Button (New Job Hunt) */}
      <button className="fixed right-6 bottom-24 lg:bottom-10 bg-secondary text-on-secondary p-4 rounded-2xl shadow-2xl hover:scale-110 active:scale-95 transition-transform z-40 flex items-center gap-2 cursor-pointer border-none font-bold text-sm">
        <span className="material-symbols-outlined">search</span>
        <span className="hidden md:block">Cari Pekerjaan Baru</span>
      </button>

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
     <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={() => navigate("/")} 
        role="teknisi" 
      />
    </div>
  );
}

// Separate component for Rejection Card to manage local form states easily
function RejectionCard({ order, rejectReasons, onSaveReason }) {
  const [selectedReason, setSelectedReason] = useState(order.rejectReason || rejectReasons[0]);
  const [notes, setNotes] = useState(order.rejectNotes || "");

  return (
    <div className="bg-surface-container border border-error/20 bg-error/5 rounded-3xl p-6 shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-error/15 border border-error/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-error">close</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-on-surface">{order.clientName}</h3>
              <span className="text-error text-[10px] font-bold uppercase tracking-wider">Ditolak oleh Anda</span>
            </div>
          </div>
          <span className="text-on-surface-variant/60 text-[10px] font-medium">{order.timeText}</span>
        </div>

        <div className="mb-4">
          <h4 className="text-on-surface-variant font-bold text-sm mb-1">{order.title}</h4>
          
          <form className="mt-4 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/75 mb-2">Alasan Penolakan</label>
              <select 
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant/30 rounded-xl py-2.5 px-4 text-xs text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary/30 outline-none transition-all cursor-pointer"
              >
                {rejectReasons.map((reason) => (
                  <option key={reason} value={reason} className="bg-surface-container text-on-surface">{reason}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/75 mb-2">Catatan Tambahan (Opsional)</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant/30 rounded-xl py-2.5 px-4 text-xs text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary/30 outline-none transition-all resize-none" 
                placeholder="Tulis alasan lebih detail..." 
                rows="2"
              />

 
            </div>
            
            <button 
              type="button"
              onClick={() => onSaveReason(order.id, selectedReason, notes)}
              className="w-full py-2.5 rounded-xl bg-error text-white text-xs font-bold hover:bg-error/85 transition-colors cursor-pointer"
            >
              Simpan Alasan
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}

export default TukangPesanan;
