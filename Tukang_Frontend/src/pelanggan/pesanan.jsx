import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoutModal from "../components/LogoutModal";

function Pesanan() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("semua");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Pagination state: default showing 3 orders
  const [visibleCount, setVisibleCount] = useState(3);

  // Modals state
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [activeTimeline, setActiveTimeline] = useState(null);
  const [activeRatingEdit, setActiveRatingEdit] = useState(null);
  const [activeImagePreview, setActiveImagePreview] = useState(null);

  // Rating modal edit states
  const [ratingVal, setRatingVal] = useState(5);
  const [commentVal, setCommentVal] = useState("");

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/pelanggan/dashboard" },
    { id: "pesanan", label: "Pesanan Saya", icon: "receipt_long", path: "/pelanggan/pesanan", active: true },
    { id: "chat", label: "Chat", icon: "chat", path: "/pelanggan/chat" },
    { id: "pembayaran", label: "Pembayaran", icon: "payments", path: "/pelanggan/pembayaran" },
    { id: "profil", label: "Profil", icon: "person", path: "/pelanggan/profil" },
  ];

  const filterTabs = [
    { id: "semua", label: "Semua Pesanan" },
    { id: "proses", label: "Dalam Proses" },
    { id: "riwayat", label: "Riwayat" },
  ];

  // State-managed orders list for inline updates (e.g. ratings)
  const [orders, setOrders] = useState([
    {
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
    },
    {
      id: "ORD-2023-9805",
      service: "Instalasi Panel Listrik Baru",
      specialist: "Andi Wijaya",
      schedule: "Besok, 09:00 WIB",
      status: "Pengerjaan",
      statusType: "proses",
      cost: "Rp 1.200.000",
      icon: "electrical_services",
      badge: "AKTIF",
    },
    {
      id: "ORD-2023-9790",
      service: "Pengecatan Ruang Tamu",
      specialist: "Hadi Pratama",
      schedule: "Selesai pada 12 Nov 2023",
      status: "Selesai",
      statusType: "selesai",
      cost: "Rp 850.000",
      icon: "format_paint",
      rating: 5,
      comment: "Sangat rapi dan bersih!",
    },
    {
      id: "ORD-2023-9755",
      service: "Deep Cleaning Apartemen",
      specialist: "Siti Aminah",
      schedule: "Selesai pada 5 Nov 2023",
      status: "Selesai",
      statusType: "selesai",
      cost: "Rp 450.000",
      icon: "cleaning_services",
    },
    {
      id: "ORD-2023-9730",
      service: "Perbaikan Atap Bocor",
      specialist: "Joko Susilo",
      schedule: "Dibatalkan pada 1 Nov 2023",
      status: "Dibatalkan",
      statusType: "dibatalkan",
      cost: "Rp 600.000",
      icon: "roofing",
    },
  ]);

  // Open rating modal and initialize values
  const handleOpenRatingEdit = (order) => {
    setActiveRatingEdit(order);
    setRatingVal(order.rating || 5);
    setCommentVal(order.comment || "");
  };

  // Save new rating and comments back to state
  const handleSaveRating = () => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === activeRatingEdit.id
          ? { ...o, rating: ratingVal, comment: commentVal }
          : o
      )
    );
    setActiveRatingEdit(null);
  };

  // Dynamic filter and search logic (updated to check status as well)
  const filteredOrders = orders.filter((order) => {
    const matchesFilter =
      activeFilter === "semua" ||
      (activeFilter === "riwayat" && (order.statusType === "selesai" || order.statusType === "dibatalkan")) ||
      order.statusType === activeFilter;
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.specialist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.status.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Paginated display subset
  const displayedOrders = filteredOrders.slice(0, visibleCount);

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
      <aside
        className={`h-screen w-64 fixed left-0 top-0 bg-surface-container flex flex-col py-6 px-4 z-50 border-r border-surface-variant/20 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="px-4 mb-8 flex justify-between items-center">
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-secondary">
              TukangAja
            </h1>
            <p className="text-on-surface-variant font-label-sm text-[10px] tracking-widest uppercase opacity-60">
              Elite Home Services
            </p>
          </div>
          <button
            className="lg:hidden text-on-surface-variant hover:text-on-surface cursor-pointer"
            onClick={() => setIsSidebarOpen(false)}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="flex-1 space-y-1">
          {navigationItems.map((item) => {
            const isActive = item.active;
            const isLink = item.path.startsWith("/");
            return isLink ? (
              <Link
                key={item.id}
                to={item.path}
                className={`w-full flex items-center gap-4 py-3 px-4 transition-colors duration-200 ease-in-out font-semibold rounded-xl text-left cursor-pointer ${
                  isActive
                    ? "text-secondary border-r-4 border-secondary bg-surface-container-highest shadow-[10px_0_20px_-10px_rgba(255,183,131,0.3)]"
                    : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                }`}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {item.icon}
                </span>
                <span className="text-sm font-semibold">{item.label}</span>
              </Link>
            ) : (
              <button
                key={item.id}
                className={`w-full flex items-center gap-4 py-3 px-4 transition-colors duration-200 ease-in-out font-semibold rounded-xl text-left cursor-pointer ${
                  isActive
                    ? "text-secondary border-r-4 border-secondary bg-surface-container-highest shadow-[10px_0_20px_-10px_rgba(255,183,131,0.3)]"
                    : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                }`}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {item.icon}
                </span>
                <span className="text-sm font-semibold">{item.label}</span>
              </button>
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
            <div className="flex items-center gap-4">
              <h2 className="font-headline-md text-headline-md font-bold text-secondary hidden sm:block">
                Pesanan Saya
              </h2>
              <div
                className={`relative w-full max-w-xs transition-transform duration-200 ${searchFocused ? "scale-[1.02]" : ""}`}
              >
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                  search
                </span>
                <input
                  className="w-full bg-surface-container border-none rounded-full py-2.5 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-secondary/50 transition-all text-sm"
                  placeholder="Cari ID, layanan, atau status..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                alt="Reze Profile"
                src="https://i.pinimg.com/736x/3a/5f/ec/3a5fec637c8a8850f6e2732cf42f5c67.jpg"
              />
            </div>
          </div>
        </header>

        {/* Canvas */}
        <div className="pt-28 pb-12 px-6 md:px-12 max-w-7xl w-full mx-auto space-y-8 flex-grow page-transition">
          {/* Filters / Tabs */}
          <div className="flex items-center gap-6 border-b border-surface-container-highest overflow-x-auto custom-scrollbar scrollbar-none">
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveFilter(tab.id);
                    setVisibleCount(3); // Reset visible count on filter tab switch
                  }}
                  className={`pb-3 border-b-2 font-semibold text-sm transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "border-secondary text-secondary"
                      : "border-transparent text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Orders Grid/List */}
          <div className="space-y-6">
            {displayedOrders.length > 0 ? (
              displayedOrders.map((order) => {
                const isProses = order.statusType === "proses";
                const isSelesai = order.statusType === "selesai";

                return (
                  <div
                    key={order.id}
                    className={`bg-surface-container p-6 rounded-2xl transition-all hover:bg-surface-container-high border border-surface-variant/10 shadow-md ${
                      isSelesai
                        ? "bg-surface-container/50 opacity-90 hover:opacity-100"
                        : ""
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-surface-container-highest flex items-center justify-center text-secondary shrink-0">
                          <span className="material-symbols-outlined text-[32px]">
                            {order.icon}
                          </span>
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            {order.badge && (
                              <span className="text-[10px] font-bold bg-secondary/15 text-secondary px-2 py-0.5 rounded uppercase tracking-wider">
                                {order.badge}
                              </span>
                            )}
                            <span className="text-on-surface-variant text-xs font-semibold">
                              {order.id}
                            </span>
                          </div>
                          <h3 className="font-bold text-lg text-on-surface">
                            {order.service}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-on-surface-variant">
                            {/* Specialist Link (Avatar & Name) */}
                            <span 
                              onClick={() => navigate('/pelanggan/profil-tukang', { state: { specialistName: order.specialist } })}
                              className="flex items-center gap-1.5 font-medium cursor-pointer hover:text-secondary group transition-colors"
                            >
                              <div className="w-5 h-5 rounded-full overflow-hidden border border-outline-variant/30 shrink-0">
                                <img
                                  className="w-full h-full object-cover"
                                  alt={order.specialist}
                                  src={order.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=80&auto=format&fit=crop"}
                                />
                              </div>
                              <span className="text-on-surface group-hover:text-secondary transition-colors">
                                {order.specialist}
                              </span>
                            </span>
                            <span className="text-outline-variant hidden md:inline">
                              •
                            </span>
                            <span className="flex items-center gap-1.5 font-medium">
                              <span className="material-symbols-outlined text-sm text-secondary">
                                schedule
                              </span>
                              <span className="text-on-surface">
                                {order.schedule}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col md:items-end gap-3 shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-on-surface-variant font-medium">
                            Status:
                          </span>
                          {/* Badge Status (opens timeline) */}
                          <span
                            onClick={() => setActiveTimeline(order)}
                            title="Klik untuk lihat timeline pengerjaan"
                            className={`font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 cursor-pointer hover:scale-[1.03] transition-all ${
                              order.status === "Dalam Perjalanan"
                                ? "bg-primary-container/20 text-primary"
                                : order.status === "Pengerjaan"
                                  ? "bg-on-tertiary-fixed-variant/50 text-tertiary"
                                  : order.status === "Dibatalkan"
                                    ? "bg-red-500/10 text-red-400"
                                    : "bg-green-500/10 text-green-400"
                            }`}
                          >
                            {order.status === "Dalam Perjalanan" && (
                              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            )}
                            {order.status}
                          </span>
                        </div>
                        <div className="md:text-right">
                          <p className="text-xs text-on-surface-variant font-medium">
                            Total Biaya
                          </p>
                          <p
                            className={`font-bold text-xl ${isSelesai ? "text-on-surface" : "text-secondary"}`}
                          >
                            {order.cost}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-6 pt-6 border-t border-surface-container-highest flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      {order.rating ? (
                        <div 
                          onClick={() => order.statusType === 'selesai' && handleOpenRatingEdit(order)}
                          className="flex flex-wrap items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity"
                          title="Klik untuk ubah rating"
                        >
                          <div className="flex text-secondary">
                            {Array.from({ length: 5 }).map(
                              (_, i) => (
                                <span
                                  key={i}
                                  className="material-symbols-outlined text-base"
                                  style={{ fontVariationSettings: i < order.rating ? "'FILL' 1" : "'FILL' 0" }}
                                >
                                  star
                                </span>
                              ),
                            )}
                          </div>
                          {order.comment && (
                            <span className="text-xs text-on-surface-variant italic font-medium">
                              "{order.comment}"
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          {isSelesai && (
                            <button 
                              onClick={() => handleOpenRatingEdit(order)}
                              className="text-xs text-secondary hover:text-secondary/80 font-bold flex items-center gap-1 bg-secondary/15 px-3 py-1.5 rounded-xl transition-all cursor-pointer border border-secondary/20 mr-2"
                            >
                              <span className="material-symbols-outlined text-xs">star</span>
                              Beri Rating
                            </button>
                          )}
                          {order.image && (
                            <div 
                              onClick={() => setActiveImagePreview(order.image)}
                              title="Klik untuk perbesar gambar"
                              className="w-10 h-10 rounded-lg border border-surface-container overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                            >
                              <img
                                className="w-full h-full object-cover"
                                alt="Plumbing preview"
                                src={order.image}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-3 w-full sm:w-auto justify-end">
                        {isSelesai ? (
                          <>
                            <button 
                              onClick={() => setActiveInvoice(order)}
                              className="px-4 py-2 text-xs rounded-xl border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all font-bold cursor-pointer"
                            >
                              Invoice
                            </button>
                            <button 
                              onClick={() => navigate('/posting-pekerjaan', { state: { prefillService: order.service } })}
                              className="px-4 py-2 text-xs rounded-xl bg-surface-container-highest text-on-surface font-bold hover:brightness-110 transition-all cursor-pointer"
                            >
                              Pesan Lagi
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => navigate('/pelanggan/chat', { state: { orderId: order.id, specialistId: order.specialist } })}
                              className="px-4 py-2 text-xs rounded-xl border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all flex items-center gap-1.5 font-bold cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-sm">
                                chat
                              </span>
                              <span>Chat Tukang</span>
                            </button>
                            <button 
                              onClick={() => navigate('/pelanggan/detail-pesanan', { state: { order } })}
                              className="px-4 py-2 text-xs rounded-xl bg-primary text-on-primary-container font-bold hover:brightness-110 transition-all cursor-pointer"
                            >
                              Lihat Detail
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-surface-container/30 border border-dashed border-surface-variant/30 rounded-2xl py-16 text-center text-on-surface-variant flex flex-col items-center justify-center gap-3">
                <span className="material-symbols-outlined text-5xl opacity-40">
                  receipt_long
                </span>
                <p className="font-semibold">
                  Tidak ada pesanan yang sesuai dengan filter atau pencarian Anda.
                </p>
                <button
                  onClick={() => navigate("/pelanggan/dashboard")}
                  className="bg-secondary text-on-secondary hover:bg-secondary/90 py-2.5 px-5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-secondary/15 hover:scale-[1.01] active:scale-[0.99] border-none"
                >
                  <span className="material-symbols-outlined text-xs">search</span>
                  Cari Tukang
                </button>
              </div>
            )}
          </div>

          {/* Load More Button */}
          {filteredOrders.length > visibleCount && (
            <div className="mt-12 flex justify-center">
              <button 
                onClick={() => setVisibleCount((prev) => prev + 3)}
                className="flex items-center gap-2 text-on-surface-variant hover:text-secondary transition-all font-bold text-sm cursor-pointer border-none bg-transparent"
              >
                <span>Tampilkan lebih banyak</span>
                <span className="material-symbols-outlined">expand_more</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* FAB Mobile Only */}
      <div className="fixed bottom-8 right-8 z-[100] md:hidden">
        <Link to="/posting-pekerjaan">
          <button className="w-14 h-14 bg-secondary text-on-secondary rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer">
            <span className="material-symbols-outlined text-[32px]">add</span>
          </button>
        </Link>
      </div>

      {/* Atmospheric Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[0%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-[120px]"></div>
      </div>

      {/* INVOICE MODAL */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container border border-surface-variant/15 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-scale-up text-xs font-semibold">
            {/* Modal Header */}
            <div className="p-5 border-b border-surface-variant/10 flex justify-between items-center bg-surface-container-high">
              <h3 className="text-sm font-extrabold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">receipt</span>
                Pratinjau Invoice
              </h3>
              <button 
                onClick={() => setActiveInvoice(null)}
                className="p-1 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer flex items-center justify-center border-none bg-transparent"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Header Info */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h4 className="font-extrabold text-sm text-secondary uppercase">TukangAja Invoice</h4>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Invoice No: INV/2023/{activeInvoice.id.split("-")[2]}</p>
                  <p className="text-[10px] text-on-surface-variant">Tanggal: {activeInvoice.schedule.replace("Selesai pada ", "")}</p>
                </div>
                <div className="text-right">
                  <span className="bg-green-500/10 border border-green-500/20 text-green-400 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                    Lunas
                  </span>
                </div>
              </div>

              {/* Sender & Receiver Info */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-surface-variant/10">
                <div>
                  <p className="text-[10px] text-on-surface-variant font-medium">Ditagih Ke:</p>
                  <p className="font-bold text-on-surface mt-1">Reze</p>
                  <p className="text-[10px] text-on-surface-variant">chaostknight483@gmail.com</p>
                  <p className="text-[10px] text-on-surface-variant">Jakarta, Indonesia</p>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant font-medium">Penyedia Jasa:</p>
                  <p className="font-bold text-on-surface mt-1">{activeInvoice.specialist}</p>
                  <p className="text-[10px] text-on-surface-variant">Mitra Terverifikasi TukangAja</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-3">
                <p className="text-[10px] text-on-surface-variant font-medium">Rincian Pekerjaan:</p>
                <div className="bg-surface-container-high/40 rounded-xl p-4 border border-outline-variant/15 space-y-2">
                  <div className="flex justify-between items-center text-on-surface">
                    <span>{activeInvoice.service}</span>
                    <span className="font-bold">{activeInvoice.cost}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-on-surface-variant">
                    <span>Biaya Layanan & Administrasi</span>
                    <span>Rp 10.000</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-on-surface-variant pb-2 border-b border-surface-variant/10">
                    <span>PPN (11%)</span>
                    <span>
                      {"Rp " + (Math.round((parseInt(activeInvoice.cost.replace(/[^0-9]/g, "")) || 0) * 0.11)).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 font-extrabold text-sm">
                    <span className="text-on-surface">Total</span>
                    <span className="text-secondary">
                      {"Rp " + (
                        (parseInt(activeInvoice.cost.replace(/[^0-9]/g, "")) || 0) + 
                        10000 + 
                        Math.round((parseInt(activeInvoice.cost.replace(/[^0-9]/g, "")) || 0) * 0.11)
                      ).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-surface-container-high/30 rounded-xl border border-outline-variant/10 text-[10px] text-on-surface-variant font-medium">
                Pembayaran berhasil diproses menggunakan metode <strong>QRIS (Dana/Gopay)</strong> secara instan saat pekerjaan selesai dikonfirmasi.
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-surface-variant/10 flex justify-end gap-2.5 bg-surface-container-high">
              <button 
                onClick={() => alert("Invoice berhasil diunduh ke folder Downloads.")}
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

      {/* TIMELINE PROGRESS MODAL */}
      {activeTimeline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container border border-surface-variant/15 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up text-xs font-semibold">
            {/* Modal Header */}
            <div className="p-5 border-b border-surface-variant/10 flex justify-between items-center bg-surface-container-high">
              <div>
                <h3 className="text-sm font-extrabold text-on-surface">Timeline Progress</h3>
                <p className="text-[10px] text-on-surface-variant mt-0.5">ID Pesanan: {activeTimeline.id}</p>
              </div>
              <button 
                onClick={() => setActiveTimeline(null)}
                className="p-1 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer flex items-center justify-center border-none bg-transparent"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              <div className="relative pl-6 space-y-5 border-l border-outline-variant/30 ml-3">
                {/* Step 1 */}
                <div className="relative">
                  <div className="absolute -left-[31px] w-4 h-4 rounded-full border-4 bg-secondary border-background flex items-center justify-center z-10">
                    <span className="w-1.5 h-1.5 bg-background rounded-full"></span>
                  </div>
                  <div>
                    <h5 className="font-bold text-on-surface text-xs">Pesanan Dibuat</h5>
                    <p className="text-[10px] text-on-surface-variant/80 mt-0.5">Pesanan berhasil dikirim dan terkonfirmasi oleh sistem.</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className="absolute -left-[31px] w-4 h-4 rounded-full border-4 bg-secondary border-background flex items-center justify-center z-10">
                    <span className="w-1.5 h-1.5 bg-background rounded-full"></span>
                  </div>
                  <div>
                    <h5 className="font-bold text-on-surface text-xs">Tukang Ditugaskan</h5>
                    <p className="text-[10px] text-on-surface-variant/80 mt-0.5">Mitra {activeTimeline.specialist} ditugaskan untuk keluhan Anda.</p>
                  </div>
                </div>

                {/* Step 3 (Conditional Highlight based on status) */}
                <div className="relative">
                  <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-4 flex items-center justify-center z-10 ${
                    activeTimeline.status === "Dalam Perjalanan" || activeTimeline.status === "Pengerjaan" || activeTimeline.status === "Selesai"
                      ? "bg-secondary border-background"
                      : activeTimeline.status === "Dibatalkan"
                        ? "bg-red-500/20 border-red-500"
                        : "bg-surface-container border-outline-variant/30"
                  }`}>
                    {activeTimeline.status === "Dibatalkan" ? (
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                    ) : (
                      (activeTimeline.status === "Dalam Perjalanan" || activeTimeline.status === "Pengerjaan" || activeTimeline.status === "Selesai") && (
                        <span className="w-1.5 h-1.5 bg-background rounded-full"></span>
                      )
                    )}
                  </div>
                  <div>
                    <h5 className={`font-bold text-xs ${
                      activeTimeline.status === "Dibatalkan"
                        ? "text-red-400"
                        : activeTimeline.status === "Dalam Perjalanan" || activeTimeline.status === "Pengerjaan" || activeTimeline.status === "Selesai"
                          ? "text-on-surface"
                          : "text-on-surface-variant/40"
                    }`}>
                      {activeTimeline.status === "Dibatalkan" ? "Pesanan Dibatalkan" : "Dalam Perjalanan"}
                    </h5>
                    <p className="text-[10px] text-on-surface-variant/80 mt-0.5">
                      {activeTimeline.status === "Dibatalkan" 
                        ? "Pesanan telah dibatalkan oleh pengguna / mitra." 
                        : `Mitra ${activeTimeline.specialist} sedang dalam perjalanan menuju lokasi.`}
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative">
                  <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-4 flex items-center justify-center z-10 ${
                    !activeTimeline.status.includes("Batal") && (activeTimeline.status === "Pengerjaan" || activeTimeline.status === "Selesai")
                      ? "bg-secondary border-background"
                      : "bg-surface-container border-outline-variant/30"
                  }`}>
                    {!activeTimeline.status.includes("Batal") && (activeTimeline.status === "Pengerjaan" || activeTimeline.status === "Selesai") && (
                      <span className="w-1.5 h-1.5 bg-background rounded-full"></span>
                    )}
                  </div>
                  <div>
                    <h5 className={`font-bold text-xs ${
                      !activeTimeline.status.includes("Batal") && (activeTimeline.status === "Pengerjaan" || activeTimeline.status === "Selesai")
                        ? "text-on-surface"
                        : "text-on-surface-variant/40"
                    }`}>
                      Pengerjaan
                    </h5>
                    <p className="text-[10px] text-on-surface-variant/80 mt-0.5">Perbaikan kerusakan sedang dikerjakan secara langsung oleh mitra.</p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="relative">
                  <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-4 flex items-center justify-center z-10 ${
                    activeTimeline.status === "Selesai"
                      ? "bg-secondary border-background"
                      : "bg-surface-container border-outline-variant/30"
                  }`}>
                    {activeTimeline.status === "Selesai" && (
                      <span className="w-1.5 h-1.5 bg-background rounded-full"></span>
                    )}
                  </div>
                  <div>
                    <h5 className={`font-bold text-xs ${activeTimeline.status === "Selesai" ? "text-on-surface" : "text-on-surface-variant/40"}`}>
                      Selesai
                    </h5>
                    <p className="text-[10px] text-on-surface-variant/80 mt-0.5">Pekerjaan diselesaikan dengan baik dan invoice diterbitkan.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-surface-variant/10 flex justify-end bg-surface-container-high">
              <button 
                onClick={() => setActiveTimeline(null)}
                className="px-5 py-2 bg-secondary text-on-secondary hover:bg-secondary/90 transition-all rounded-xl font-bold cursor-pointer border-none"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT / FILL RATING MODAL */}
      {activeRatingEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container border border-surface-variant/15 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up text-xs font-semibold">
            {/* Modal Header */}
            <div className="p-5 border-b border-surface-variant/10 flex justify-between items-center bg-surface-container-high">
              <div>
                <h3 className="text-sm font-extrabold text-on-surface">Ubah Rating & Ulasan</h3>
                <p className="text-[10px] text-on-surface-variant mt-0.5">ID Pesanan: {activeRatingEdit.id}</p>
              </div>
              <button 
                onClick={() => setActiveRatingEdit(null)}
                className="p-1 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer flex items-center justify-center border-none bg-transparent"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Star selector */}
              <div className="space-y-2">
                <label className="text-xs text-on-surface-variant">Pilih Bintang (Rating Kepuasan)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                      key={star}
                      onClick={() => setRatingVal(star)}
                      className="material-symbols-outlined text-3xl text-secondary cursor-pointer hover:scale-110 transition-transform"
                      style={{ fontVariationSettings: star <= ratingVal ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      star
                    </span>
                  ))}
                </div>
              </div>

              {/* Comment Input */}
              <div className="space-y-2">
                <label className="text-xs text-on-surface-variant">Ulasan / Masukan (Opsional)</label>
                <textarea 
                  rows="3"
                  className="w-full bg-surface-container-high border border-outline-variant rounded-xl p-3 text-xs text-on-surface outline-none focus:ring-1 focus:ring-secondary/50 font-medium"
                  placeholder="Ceritakan pengalaman Anda menggunakan jasa mitra ini..."
                  value={commentVal}
                  onChange={(e) => setCommentVal(e.target.value)}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-surface-variant/10 flex justify-end gap-2.5 bg-surface-container-high">
              <button 
                onClick={() => setActiveRatingEdit(null)}
                className="px-4 py-2 border border-outline-variant text-on-surface hover:bg-surface-container-highest transition-all rounded-xl font-bold cursor-pointer bg-transparent"
              >
                Batal
              </button>
              <button 
                onClick={handleSaveRating}
                className="px-4 py-2 bg-secondary text-on-secondary hover:bg-secondary/90 transition-all rounded-xl font-bold cursor-pointer border-none"
              >
                Simpan Ulasan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMAGE PREVIEW MODAL */}
      {activeImagePreview && (
        <div 
          onClick={() => setActiveImagePreview(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm cursor-zoom-out animate-fade-in"
        >
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl flex items-center justify-center">
            <img 
              src={activeImagePreview} 
              alt="Full screen preview" 
              className="object-contain w-full h-full"
            />
            {/* Close Button overlay */}
            <button 
              onClick={() => setActiveImagePreview(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white cursor-pointer flex items-center justify-center border-none"
            >
              <span className="material-symbols-outlined">close</span>
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

export default Pesanan;
