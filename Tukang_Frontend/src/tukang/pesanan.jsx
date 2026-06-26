import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoutModal from "../components/LogoutModal";

import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

function TukangPesanan() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("semua");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  // Rejection reason select options
  const rejectReasons = [
    "Jadwal Bentrok",
    "Lokasi Terlalu Jauh",
    "Biaya Tidak Sesuai",
    "Keahlian Tidak Sesuai",
    "Lainnya"
  ];

  // Stateful orders list to support interaction (e.g. sending a bid, changing rejection reasons, saving reasons)
  const [orders, setOrders] = useState([
    {
      id: 1,
      clientName: "Siti Aminah",
      clientLoc: "BSD City, Tangerang Selatan",
      clientAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKTfl-bPc3TYOy5r-jjyWK-ywD97kiKmUzf_fckpbG-fUGriGzIBeAYvujKLJIrVAaFR_vAJ-IPv7FSCgP8PVrxcSvLSiS3wILfbXS_YBz2fAaK6QbKEibAKOEdSbdNxSzP_1_P6gigW-WXYWGSUkNpqGCi9S8d0Mbhv7sTh-o5PXLb1XzNaj-x3BKXoYylvhC_l_RPbMK9V1uVH_HsOJeC-UFwuZ5dFhLWeri2WlVrGC41Qbkjt2paaIKIH8i6E9HxuTNhfn7nl4V",
      status: "menunggu_penawaran",
      title: "Perbaikan Pipa Bocor di Dapur",
      desc: "Pipa wastafel bocor parah sejak tadi malam, butuh penanganan segera agar tidak banjir ke area ruang makan.",
      images: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDuvvzLYFv8KuAQ3PaWGnK1219yGfK6XEy-FJUG6TEs5ogKLTkh6vorFWSHr5dwXVqX4kf8W-H6i8ZWf_IU9TmgGUk4C5n__rDr_utm4MS-dwMn83tc36ULlOXjuyPQg_SHqdfg0l1c21NKC5UG6m2e0esnPE9Lq4htj3k0zsZQjlsOhcXVzZtLCXEDYE_x5NwpeqT5U4XrYtP3dfYPOpAHHWPLqtlTz5WFlZuA2dhpXGy_c5HjaC0j04qayJ8Q9VA6baoFk2-OlXr2",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB2B4cYD5S557LOaI2yjg7fHk0dKt5onzJd48uHby8URHI3GnHuMZt1myvC5nutee9uyvJNMAYVh0bGBdUevhc4fRqqdOHh0qVShmThEUd1F4i7WDNqA3vRuSVQNqTdHPLtz0HEkso80fqhNkPpHP8b6NFoIJ1QwBCoQOUMj1tVi1BMz4Piv5PDdMQxnmO16Y2EO2CE2hRbVwKzpdllSXnFi9qMq01EOEwLjwQiciWQ1aBrDuGyv4mZ3PYH3iH9_iEsWpBA7Adx4nox"
      ],
      budgetRange: "Rp 150.000 - 300.000",
      hasBidSent: false,
    },
    {
      id: 2,
      clientName: "Rian Hidayat",
      clientLoc: "Kebayoran Baru, Jakarta Selatan",
      clientAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBbdo8dOVMNjo7LLWag1LurBy_-yYkPck5d6B_gR7idpkdkHC7XyX8dPd9Q2kuv0-j5c6pVvz6FgYNcs7JcjQhe5xcqWjLdrE8VDpQZwDC5apUVor7rB8AtpDV9fKvAjozbnuaPyEb4LfTGqqc7B8PeJ4nJ1AuRdAl-nPPHFnDM9hIbpu7N3Y5oJsIJmzZaxKBrWhaBU2hCWOuHp3Cz2dQj_x615I561dc1EyCQFbC-GO4_QEzJ6bSgzAeqid-ybxdItksm6JEBNqc5",
      status: "menunggu_persetujuan",
      title: "Pasang Bracket TV 55 Inch",
      bidValue: "Rp 250.000",
      clientNotes: "Menunggu konfirmasi dari klien atas rincian biaya material tambahan.",
    },
    {
      id: 3,
      clientName: "Diana Putri",
      clientLoc: "BSD City, Tangerang Selatan",
      clientAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBanKwNeoZOu9pYge-LR7B8wnMRqj60WBtEqUzr4I-BIm8lWF3X22GN8zU1Zbh5CuLqwVv1m2MGfbHZFYjykcYw_sNPVKmM8DKeNE5FqywuplpHeEL2czJiwW5Jxq4po7wZUJ4KpXMkhNy7Qi-8rcKSHfiRu7ztwcR--YUbSoyJKV1ezC-EdIJO739bwcg8R4zBtnVWVLq34JeAHnrFjEVyxQim53HhE6DCNwjlCY3UCBv2noUm32zR-HXub8AiZQ5c0638rLe9r-GD",
      status: "menunggu_pembayaran",
      title: "Service AC Split & Cuci Besar (4 Unit)",
      totalValue: "Rp 1.250.000",
      stepText: "Langkah 4/5",
      stepProgress: 80,
      latitude: -6.3021,
      longitude: 106.6523,
      address: "Jl. Melati No.25 BSD City Tangerang Selatan",
    },
    {
      id: 4,
      clientName: "Bambang S.",
      clientLoc: "Senen, Jakarta Pusat",
      clientAvatar: "",
      status: "ditolak",
      title: "Instalasi Listrik Gudang",
      rejectReason: "Keahlian Tidak Sesuai",
      rejectNotes: "",
      timeText: "2 jam yang lalu",
      isReasonSaved: false,
    },
    {
      id: 5,
      clientName: "Budi Santoso",
      clientLoc: "BSD City, Tangerang Selatan",
      clientAvatar: "",
      status: "sedang_dikerjakan",
      title: "Instalasi Pompa Air Baru",
      totalValue: "Rp 450.000",
      latitude: -6.3121,
      longitude: 106.6623,
      address: "Cluster Lavender No. 12, BSD City, Tangerang Selatan",
    },
    {
      id: 6,
      clientName: "Siska Amelia",
      clientLoc: "Gading Serpong, Tangerang",
      clientAvatar: "",
      status: "selesai",
      title: "Pengecatan Tembok Rumah",
      totalValue: "Rp 850.000",
      latitude: -6.2521,
      longitude: 106.6223,
      address: "Cluster Rosemary Blk. B No. 8, Gading Serpong, Tangerang",
      finishDate: "25 Juni 2026",
      duration: "3 Jam 45 Menit",
      rating: 5,
      review: "Pengecatan sangat rapi, warna sesuai dengan request. Sangat puas!",
    },
    {
      id: 7,
      clientName: "Agus Pratama",
      clientLoc: "Menteng, Jakarta Pusat",
      clientAvatar: "",
      status: "menunggu_konfirmasi",
      title: "Perbaikan Instalasi Listrik",
      totalValue: "Rp 350.000",
      latitude: -6.2088,
      longitude: 106.8456,
      address: "Jl. Teuku Cik Ditiro No. 10, Menteng, Jakarta Pusat",
    },
    {
      id: 8,
      clientName: "Rina Wijaya",
      clientLoc: "Kebayoran Baru, Jakarta Selatan",
      clientAvatar: "",
      status: "dibatalkan",
      title: "Service Pompa Air",
      totalValue: "Rp 200.000",
      cancelReason: "Pelanggan membatalkan pesanan karena kendala waktu.",
    }
  ]);

  const filterTabs = [
    { id: "semua", label: "Semua Pesanan" },
    { id: "menunggu_penawaran", label: "Menunggu Penawaran" },
    { id: "menunggu_persetujuan", label: "Menunggu Persetujuan" },
    { id: "menunggu_pembayaran", label: "Menunggu Pembayaran" },
    { id: "sedang_dikerjakan", label: "Sedang Dikerjakan" },
    { id: "menunggu_konfirmasi", label: "Menunggu Konfirmasi" },
    { id: "selesai", label: "Selesai" },
    { id: "ditolak", label: "Ditolak" },
    { id: "dibatalkan", label: "Dibatalkan" }
  ];

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/tukang/dashboard" },
    { id: "pesanan", label: "Pesanan Saya", icon: "assignment", path: "/tukang/pesanan", active: true },
    { id: "chat", label: "Chat", icon: "chat", path: "/tukang/chat" },
    { id: "profil", label: "Profil", icon: "person", path: "/tukang/profil" },
  ];

  // Handle Action - Send Bid
  const handleSendBid = (id) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, hasBidSent: true } : o));
  };

  // Handle Action - Save Reason
  const handleSaveReason = (id, reason, notes) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, rejectReason: reason, rejectNotes: notes, isReasonSaved: true } : o));
    alert("Alasan penolakan berhasil disimpan!");
  };

  // Helper to render customer location map panel
  const renderCustomerLocationPanel = (order) => {
    if (!order.latitude || !order.longitude) {
      return (
        <div className="mt-4 p-3 bg-surface-container-high rounded-xl text-center text-xs text-on-surface-variant">
          Data lokasi tidak tersedia
        </div>
      );
    }

    const clientEmojiIcon = L.divIcon({
      html: `<div style="font-size: 24px; filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.3)); line-height: 1;">📍</div>`,
      className: "bg-transparent border-none",
      iconSize: [26, 26],
      iconAnchor: [13, 26]
    });

    const handymanEmojiIcon = L.divIcon({
      html: `<div style="font-size: 24px; filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.3)); line-height: 1;">🔧</div>`,
      className: "bg-transparent border-none",
      iconSize: [26, 26],
      iconAnchor: [13, 26]
    });

    const handymanLat = order.latitude + 0.008;
    const handymanLng = order.longitude - 0.012;

    return (
      <div className="mt-4 pt-4 space-y-3 font-sans text-left border-t border-surface-variant/10">
        {/* Simplified distance & estimation panel */}
        <div className="flex items-center gap-4 text-xs font-semibold text-on-surface-variant/80 bg-surface-container-high/40 p-2.5 rounded-xl">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-secondary">location_on</span>
            4.2 km
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-secondary">schedule</span>
            12 menit
          </span>
        </div>

        {/* Address text (only full address, no lat/lng display) */}
        <div className="text-xs text-on-surface-variant space-y-1">
          <p className="font-semibold text-on-surface leading-relaxed">{order.address}</p>
        </div>

        {/* Leaflet Map: Height 200px - 220px */}
        <div className="relative w-full h-[210px] rounded-2xl overflow-hidden shadow-sm">
          <MapContainer
            center={[order.latitude + 0.004, order.longitude - 0.006]}
            zoom={12}
            bounds={[[handymanLat, handymanLng], [order.latitude, order.longitude]]}
            boundsOptions={{ padding: [25, 25] }}
            style={{ height: "100%", width: "100%", borderRadius: "16px" }}
            zoomControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {/* Customer Marker */}
            <Marker position={[order.latitude, order.longitude]} icon={clientEmojiIcon} />
            
            {/* Handyman Marker */}
            <Marker position={[handymanLat, handymanLng]} icon={handymanEmojiIcon} />
            
            {/* Polyline Route */}
            <Polyline
              positions={[[handymanLat, handymanLng], [order.latitude, order.longitude]]}
              color="#ff9753"
              weight={3}
              dashArray="5, 8"
            />
          </MapContainer>
        </div>

        {/* Navigation Button: Single Navigasi Button */}
        <div className="pt-1">
          <a
            href={`https://www.google.com/maps?q=${order.latitude},${order.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-surface-container-high hover:bg-surface-container-highest rounded-xl text-xs font-bold text-on-surface transition-all cursor-pointer decoration-none"
          >
            <span className="material-symbols-outlined text-sm">explore</span>
            Navigasi
          </a>
        </div>
      </div>
    );
  };

  // Helper to render job summary panel for completed orders
  const renderJobSummaryPanel = (order) => {
    return (
      <div className="mt-6 border-t border-surface-variant/15 pt-6 space-y-4 text-left font-sans">
        <div className="flex items-center gap-2 text-green-400">
          <span className="material-symbols-outlined">check_circle</span>
          <h4 className="font-bold text-sm">Pekerjaan Selesai</h4>
        </div>

        <div className="bg-surface-container-high/60 rounded-2xl p-4 border border-outline-variant/20 space-y-3 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant">Tanggal Selesai</span>
            <span className="font-bold text-on-surface">{order.finishDate || "26 Juni 2026"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant">Durasi Pengerjaan</span>
            <span className="font-bold text-on-surface">{order.duration || "2 Jam"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant">Total Pembayaran</span>
            <span className="font-bold text-secondary">{order.totalValue || order.totalPaid}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant">Status Pembayaran</span>
            <span className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-extrabold uppercase text-[9px]">
              Lunas
            </span>
          </div>
          <div className="border-t border-surface-variant/10 pt-3 space-y-1">
            <span className="text-on-surface-variant block">Lokasi Pekerjaan</span>
            <p className="font-semibold text-on-surface leading-relaxed">{order.address || order.clientLoc}</p>
          </div>
        </div>

        {order.rating && (
          <div className="bg-surface-container-high/60 rounded-2xl p-4 border border-outline-variant/20 space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-on-surface-variant">Rating Pelanggan:</span>
              <div className="flex items-center text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <span 
                    key={i} 
                    className="material-symbols-outlined text-sm"
                    style={{ fontVariationSettings: i < order.rating ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    star
                  </span>
                ))}
              </div>
              <span className="text-xs font-bold text-on-surface">({order.rating.toFixed(1)})</span>
            </div>
            {order.review && (
              <p className="text-xs italic text-on-surface-variant/90 leading-relaxed bg-background/40 p-2.5 rounded-xl border-l-4 border-secondary">
                "{order.review}"
              </p>
            )}
          </div>
        )}
      </div>
    );
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
                className="w-full h-full object-cover"
                alt="Denji Profile"
                src="https://64.media.tumblr.com/c9a40e15310bd677150504d378595de4/708a33221029625f-0b/s1280x1920/3304739f2245fc3c15e6e70ffff7ee91b2d2ac69.jpg"
              />
            </div>
          </div>
        </header>

        {/* Canvas */}
        <div className="pt-28 pb-32 px-6 md:px-12 max-w-7xl w-full mx-auto space-y-8 flex-grow page-transition">
          
          {/* Status Tabs (Horizontal Scrollable) */}
          <div className="flex overflow-x-auto tabs-scrollbar gap-2 pb-2 sticky top-20 bg-background/95 backdrop-blur-sm z-30 py-2 border-b border-surface-variant/10">
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
                      className="bg-surface-container rounded-3xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant/10 shrink-0">
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
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-extrabold uppercase tracking-wider">
                            Baru
                          </span>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-secondary font-bold text-sm mb-1">{order.title}</h4>
                          <p className="text-on-surface-variant/80 text-xs leading-relaxed line-clamp-2">{order.desc}</p>
                        </div>

                        {order.images && order.images.length > 0 && (
                          <div className="grid grid-cols-3 gap-2 mb-4">
                            {order.images.map((img, idx) => (
                              <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-surface-container-high">
                                <img className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" alt="Job Attachment" src={img} />
                              </div>
                            ))}
                            <div className="aspect-square rounded-xl flex items-center justify-center bg-surface-container-high text-on-surface-variant font-extrabold text-xs">
                              +1
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-surface-variant/10">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-on-surface-variant/60 uppercase font-semibold">Budget Perkiraan</span>
                          <span className="text-xs font-bold text-on-surface mt-0.5">{order.budgetRange}</span>
                        </div>
                        {order.hasBidSent ? (
                          <button className="bg-surface-container-high text-on-surface-variant/60 text-xs font-bold px-4 py-2 rounded-xl cursor-not-allowed">
                            Penawaran Terkirim
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleSendBid(order.id)}
                            className="bg-secondary text-on-secondary text-xs font-bold px-4 py-2.5 rounded-xl hover:scale-105 active:scale-95 transition-transform cursor-pointer"
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
                      className="bg-surface-container rounded-3xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant/10 shrink-0">
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
                          <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[9px] font-extrabold uppercase tracking-wider">
                            Persetujuan
                          </span>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-secondary font-bold text-sm mb-1">{order.title}</h4>
                          <p className="text-xs text-on-surface-variant/80">
                            Penawaran Anda: <span className="text-on-surface font-extrabold">{order.bidValue}</span>
                          </p>
                          {order.clientNotes && (
                            <div className="mt-3 p-3 rounded-xl bg-surface-container-high/60 border-l-4 border-secondary text-xs italic text-on-surface-variant/90 leading-relaxed">
                              "{order.clientNotes}"
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-3 border-t border-surface-variant/10">
                        <button className="flex-grow py-2 bg-surface-container-high text-xs font-bold text-on-surface hover:bg-surface-container-highest rounded-xl transition-all cursor-pointer">
                          Hubungi Chat
                        </button>
                        <button className="flex-grow bg-surface-container-high text-error text-xs font-bold py-2 rounded-xl hover:bg-error/15 transition-all cursor-pointer">
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
                      className="bg-surface-container rounded-3xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant/10 shrink-0">
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
                          <div className="flex flex-col items-end">
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[9px] font-extrabold uppercase tracking-wider">
                              Pembayaran
                            </span>
                            <span className="text-xs font-extrabold text-on-surface mt-1">{order.totalValue}</span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-secondary font-bold text-sm mb-1">{order.title}</h4>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="h-1.5 flex-grow bg-surface-container-highest rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${order.stepProgress}%` }}></div>
                            </div>
                            <span className="text-[10px] font-bold text-on-surface-variant/70 whitespace-nowrap">{order.stepText}</span>
                          </div>
                        </div>

                        {/* Customer Location Panel */}
                        {renderCustomerLocationPanel(order)}
                      </div>

                      <button className="w-full mt-4 py-2.5 rounded-xl bg-surface-container-high text-xs font-bold text-on-surface-variant/60 cursor-not-allowed">
                        Menunggu Pembayaran User
                      </button>
                    </div>
                  );
                }

                // Card 5: Sedang Dikerjakan
                if (order.status === "sedang_dikerjakan") {
                  return (
                    <div 
                      key={order.id} 
                      className="bg-surface-container rounded-3xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant/10 shrink-0">
                              <img className="w-full h-full object-cover" alt={order.clientName} src={order.clientAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"} />
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-on-surface">{order.clientName}</h3>
                              <div className="flex items-center gap-1 text-on-surface-variant/80 text-[11px] mt-0.5">
                                <span className="material-symbols-outlined text-xs">location_on</span>
                                {order.clientLoc}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[9px] font-extrabold uppercase tracking-wider">
                              Aktif
                            </span>
                            <span className="text-xs font-extrabold text-on-surface mt-1">{order.totalValue}</span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-secondary font-bold text-sm mb-1">{order.title}</h4>
                          <p className="text-on-surface-variant/80 text-xs leading-relaxed line-clamp-2">
                            Pekerjaan sedang berlangsung. Harap selesaikan sesuai dengan kesepakatan rincian biaya.
                          </p>
                        </div>

                        {/* Customer Location Panel */}
                        {renderCustomerLocationPanel(order)}
                      </div>

                      <button className="w-full mt-4 py-2.5 rounded-xl bg-green-500 text-on-secondary text-xs font-bold hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">
                        Selesaikan Pekerjaan
                      </button>
                    </div>
                  );
                }

                // Card 6: Selesai
                if (order.status === "selesai") {
                  return (
                    <div 
                      key={order.id} 
                      className="bg-surface-container rounded-3xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant/10 shrink-0">
                              <img className="w-full h-full object-cover" alt={order.clientName} src={order.clientAvatar || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80"} />
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-on-surface">{order.clientName}</h3>
                              <div className="flex items-center gap-1 text-on-surface-variant/80 text-[11px] mt-0.5">
                                <span className="material-symbols-outlined text-xs">location_on</span>
                                {order.clientLoc}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant text-[9px] font-extrabold uppercase tracking-wider">
                              Selesai
                            </span>
                            <span className="text-xs font-extrabold text-on-surface mt-1">{order.totalValue}</span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-secondary font-bold text-sm mb-1">{order.title}</h4>
                          <p className="text-on-surface-variant/80 text-xs leading-relaxed line-clamp-2">
                            Pekerjaan telah selesai dan pembayaran telah diterima sepenuhnya.
                          </p>
                        </div>

                        {/* Job Summary Panel */}
                        {renderJobSummaryPanel(order)}
                      </div>

                      <button className="w-full mt-4 py-2.5 rounded-xl bg-surface-container-high text-xs font-bold text-on-surface-variant cursor-default">
                        Sudah Selesai
                      </button>
                    </div>
                  );
                }

                // Card 7: Menunggu Konfirmasi
                if (order.status === "menunggu_konfirmasi") {
                  return (
                    <div 
                      key={order.id} 
                      className="bg-surface-container rounded-3xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant/10 shrink-0">
                              <img className="w-full h-full object-cover" alt={order.clientName} src={order.clientAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"} />
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-on-surface">{order.clientName}</h3>
                              <div className="flex items-center gap-1 text-on-surface-variant/80 text-[11px] mt-0.5">
                                <span className="material-symbols-outlined text-xs">location_on</span>
                                {order.clientLoc}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-[9px] font-extrabold uppercase tracking-wider">
                              Konfirmasi
                            </span>
                            <span className="text-xs font-extrabold text-on-surface mt-1">{order.totalValue}</span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-secondary font-bold text-sm mb-1">{order.title}</h4>
                          <p className="text-on-surface-variant/80 text-xs leading-relaxed line-clamp-2">
                            Pekerjaan telah ditandai selesai. Menunggu persetujuan konfirmasi dari pelanggan.
                          </p>
                        </div>

                        {/* Customer Location Panel */}
                        {renderCustomerLocationPanel(order)}
                      </div>

                      <button className="w-full mt-4 py-2.5 rounded-xl bg-surface-container-high text-xs font-bold text-on-surface-variant/60 cursor-not-allowed">
                        Menunggu Konfirmasi Pelanggan
                      </button>
                    </div>
                  );
                }

                // Card 8: Dibatalkan
                if (order.status === "dibatalkan") {
                  return (
                    <div 
                      key={order.id} 
                      className="bg-surface-container rounded-3xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant/10 shrink-0 flex items-center justify-center bg-surface-container-highest">
                              <span className="material-symbols-outlined text-on-surface-variant">block</span>
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-on-surface">{order.clientName}</h3>
                              <div className="flex items-center gap-1 text-on-surface-variant/80 text-[11px] mt-0.5">
                                <span className="material-symbols-outlined text-xs">location_on</span>
                                {order.clientLoc}
                              </div>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-outline-variant/10 text-on-surface-variant text-[9px] font-extrabold uppercase tracking-wider">
                            Batal
                          </span>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-on-surface-variant font-bold text-sm mb-1">{order.title}</h4>
                          <div className="mt-2 p-3.5 rounded-xl bg-surface-container-high/60 border-l-4 border-outline text-xs italic text-on-surface-variant/90 leading-relaxed">
                            "{order.cancelReason || "Pesanan dibatalkan oleh sistem."}"
                          </div>
                        </div>
                      </div>
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
    <div className="bg-surface-container rounded-3xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant/10 shrink-0">
              <img className="w-full h-full object-cover" alt={order.clientName} src={order.clientAvatar || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80"} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-on-surface">{order.clientName}</h3>
              <div className="flex items-center gap-1 text-on-surface-variant/80 text-[11px] mt-0.5">
                <span className="material-symbols-outlined text-xs">location_on</span>
                {order.clientLoc}
              </div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[9px] font-extrabold uppercase tracking-wider">
            Ditolak
          </span>
        </div>

        <div className="mb-4">
          <h4 className="text-on-surface-variant font-bold text-sm mb-1">{order.title}</h4>
          
          <form className="mt-4 space-y-3" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/75 mb-1.5">Alasan Penolakan</label>
              <select 
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl py-2 px-3 text-xs text-on-surface focus:border-secondary outline-none transition-all cursor-pointer"
              >
                {rejectReasons.map((reason) => (
                  <option key={reason} value={reason} className="bg-surface-container text-on-surface">{reason}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/75 mb-1.5">Catatan Tambahan (Opsional)</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl py-2 px-3 text-xs text-on-surface focus:border-secondary outline-none transition-all resize-none" 
                placeholder="Tulis alasan lebih detail..." 
                rows="2"
              />
            </div>
            
            <button 
              type="button"
              onClick={() => onSaveReason(order.id, selectedReason, notes)}
              className="w-full py-2 rounded-xl bg-error text-white text-xs font-bold hover:bg-error/85 transition-colors cursor-pointer border-none mt-1"
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
