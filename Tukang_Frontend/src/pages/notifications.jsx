import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Notifications() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("semua");
  const [searchQuery, setSearchQuery] = useState("");

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      category: "transaksi",
      title: "Pembayaran Berhasil",
      message: "Pembayaran untuk pesanan #4412 (Perbaikan Listrik) telah dikonfirmasi sebesar Rp 150.000.",
      time: "10 menit yang lalu",
      unread: true
    },
    {
      id: 2,
      category: "pesan",
      title: "Pesan Baru dari Siska Pratama",
      message: '"Oke, saya setuju dengan harga tersebut jika termasuk penggantian kabel..."',
      time: "25 menit yang lalu",
      unread: true
    },
    {
      id: 3,
      category: "sistem",
      title: "Verifikasi Berhasil",
      message: "Dokumen KTP dan Sertifikat keahlian Anda telah diverifikasi oleh tim TukangAja.",
      time: "2 jam yang lalu",
      unread: false
    },
    {
      id: 4,
      category: "transaksi",
      title: "Pesanan Baru Tersedia",
      message: "Perbaikan Pipa Bocor di BSD City membutuhkan penawaran jasa Anda segera.",
      time: "1 hari yang lalu",
      unread: false
    },
    {
      id: 5,
      category: "sistem",
      title: "Tips Keamanan Akun",
      message: "Jangan pernah memberikan kode verifikasi atau OTP kepada siapa pun demi keamanan akun Anda.",
      time: "3 hari yang lalu",
      unread: false
    }
  ]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const toggleRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: !n.unread } : n));
  };

  const deleteNotification = (id, e) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "transaksi":
        return "payments";
      case "pesan":
        return "chat";
      case "sistem":
        return "settings";
      default:
        return "notifications";
    }
  };

  // Filter & Search Logic
  const filteredNotifications = notifications.filter(n => {
    const matchesCategory = activeFilter === "semua" || n.category === activeFilter;
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Count calculations
  const totalCount = notifications.length;
  const unreadCount = notifications.filter(n => n.unread).length;
  
  const getCountByCategory = (category) => {
    if (category === "semua") return notifications.length;
    return notifications.filter(n => n.category === category).length;
  };

  return (
    <div className="bg-background text-on-surface min-h-screen selection:bg-secondary/30 selection:text-secondary font-sans pb-16">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-surface/80 backdrop-blur-xl border-b border-surface-variant/20 flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-headline-md text-headline-md font-bold text-secondary">Notifikasi</h1>
        </div>

        {unreadCount > 0 && (
          <button 
            onClick={markAllRead}
            className="text-xs font-bold text-secondary hover:underline cursor-pointer bg-transparent border-none"
          >
            Tandai Semua Dibaca
          </button>
        )}
      </header>

      {/* Main Grid Content */}
      <main className="pt-28 px-6 md:px-12 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Panel: Statistics & Category Filters */}
        <section className="lg:col-span-4 space-y-6">
          
          {/* Card Summary */}
          <div className="bg-surface-container rounded-3xl p-6 border border-surface-variant/15 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-[50px] pointer-events-none"></div>
            <h2 className="font-bold text-sm text-on-surface mb-4">Ringkasan Kotak Masuk</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-variant/10 text-center">
                <span className="text-2xl font-black text-secondary">{unreadCount}</span>
                <p className="text-[10px] text-on-surface-variant/80 uppercase font-semibold mt-1">Belum Dibaca</p>
              </div>
              <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-variant/10 text-center">
                <span className="text-2xl font-black text-on-surface">{totalCount}</span>
                <p className="text-[10px] text-on-surface-variant/80 uppercase font-semibold mt-1">Total Pesan</p>
              </div>
            </div>
          </div>

          {/* Card Filters */}
          <div className="bg-surface-container rounded-3xl p-5 border border-surface-variant/15 shadow-xl space-y-2">
            <h3 className="text-[11px] font-bold text-on-surface-variant/70 uppercase tracking-wider px-3 mb-2">Filter Kategori</h3>
            
            {[
              { id: "semua", label: "Semua Notifikasi", icon: "mail" },
              { id: "transaksi", label: "Transaksi", icon: "payments" },
              { id: "pesan", label: "Pesan Chat", icon: "chat" },
              { id: "sistem", label: "Sistem", icon: "settings" }
            ].map(tab => {
              const isActive = activeFilter === tab.id;
              const count = getCountByCategory(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                    isActive 
                      ? "bg-secondary/15 text-secondary font-bold" 
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                    <span className="text-xs font-semibold">{tab.label}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? "bg-secondary text-on-secondary" : "bg-surface-container-highest text-on-surface-variant/80"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

        </section>

        {/* Right Panel: The Main Wrapped Card for Notifications */}
        <section className="lg:col-span-8">
          
          <div className="bg-surface-container rounded-3xl border border-surface-variant/15 shadow-xl overflow-hidden min-h-[450px] flex flex-col">
            
            {/* Inner Header Card */}
            <div className="p-5 bg-surface-container-high/40 border-b border-surface-variant/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="font-bold text-sm text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">inbox</span>
                Kotak Masuk
              </h2>
              
              {/* Inner Search bar */}
              <div className="relative w-full sm:w-60">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-sm">search</span>
                <input 
                  type="text" 
                  placeholder="Cari kata kunci..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl pl-9 pr-4 py-2 text-xs text-on-surface focus:ring-1 focus:ring-secondary/50 outline-none"
                />
              </div>
            </div>

            {/* Notification List Container */}
            <div className="p-6 flex-grow overflow-y-auto space-y-3.5">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/35">notifications_none</span>
                  <p className="text-on-surface-variant/80 text-xs">Tidak ada notifikasi yang ditemukan.</p>
                </div>
              ) : (
                filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => toggleRead(notif.id)}
                    className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex gap-4 relative group ${
                      notif.unread
                        ? "bg-secondary/5 border-secondary/25 shadow-md"
                        : "bg-surface-container-low/80 border-surface-variant/10 opacity-80 hover:opacity-100"
                    }`}
                  >
                    {/* Unread dot indicator */}
                    {notif.unread && (
                      <span className="absolute top-4 right-4 w-2 h-2 bg-secondary rounded-full"></span>
                    )}

                    {/* Category Icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      notif.unread ? "bg-secondary/15 text-secondary" : "bg-surface-container-highest text-on-surface-variant"
                    }`}>
                      <span className="material-symbols-outlined text-lg">{getCategoryIcon(notif.category)}</span>
                    </div>

                    {/* Message Content */}
                    <div className="flex-grow pr-6">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <h3 className="font-bold text-xs text-on-surface">{notif.title}</h3>
                        <span className="text-[9px] text-on-surface-variant/60 font-semibold">{notif.time}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant/90 mt-1 leading-relaxed">{notif.message}</p>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => deleteNotification(notif.id, e)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-on-surface-variant/30 hover:text-error hover:bg-error/15 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                      title="Hapus"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Inner Footer info */}
            <div className="p-4 bg-surface-container-high/30 border-t border-surface-variant/10 text-center">
              <span className="text-[10px] text-on-surface-variant/60">Notifikasi sistem akan dihapus otomatis setelah 30 hari.</span>
            </div>

          </div>

        </section>

      </main>
    </div>
  );
}

export default Notifications;
