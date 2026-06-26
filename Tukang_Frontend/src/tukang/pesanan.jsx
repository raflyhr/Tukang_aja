import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import LogoutModal from "../components/LogoutModal";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

function TukangPesanan() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Set active tab based on dashboard state redirect, defaults to 'semua'
  const [activeTab, setActiveTab] = useState(location.state?.tab || "semua");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Terbaru");
  const [radiusLimit, setRadiusLimit] = useState("Semua");
  const [isSpinning, setIsSpinning] = useState(false);

  // Real-time location sharing map state (dict mapping orderId to boolean)
  const [realtimeSharing, setRealtimeSharing] = useState({});

  // Toast Notification State
  const [toasts, setToasts] = useState([]);
  
  const showToast = (message, type = "success") => {
    const id = Date.now().toString() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Modals active states
  const [activeModal, setActiveModal] = useState(null); // null | 'sendBid' | 'bidDetail' | 'cancelBid' | 'navigation' | 'completeJob' | 'cancellation' | 'invoice' | 'review'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [imageZoom, setImageZoom] = useState(null);

  // Input states inside modals
  const [bidForm, setBidForm] = useState({ price: "", duration: "1 Hari", notes: "" });
  const [completionForm, setCompletionForm] = useState({ beforePhoto: null, afterPhoto: null, receiptPhoto: null, notes: "" });

  const beforePhotoInput = useRef(null);
  const afterPhotoInput = useRef(null);
  const receiptPhotoInput = useRef(null);

  // Rejection reasons
  const rejectReasons = [
    "Jadwal Bentrok",
    "Lokasi Terlalu Jauh",
    "Biaya Tidak Sesuai",
    "Keahlian Tidak Sesuai",
    "Lainnya"
  ];

  // Stateful orders list
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
      distance: 3.2,
      createdTime: 1, // hours ago
      clientPhone: "0812-9876-5432",
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
      bidDuration: "2 Jam",
      bidNotes: "Sudah termasuk baut dyna bolt premium untuk dinding bata merah.",
      distance: 6.8,
      createdTime: 3,
      clientPhone: "0813-1122-3344",
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
      stepProgress: 60,
      latitude: -6.3021,
      longitude: 106.6523,
      address: "Jl. Melati No.25 BSD City Tangerang Selatan",
      distance: 1.5,
      createdTime: 2,
      clientPhone: "0878-8877-6655",
      countdown: 3600, // 1 hour countdown
    },
    {
      id: 4,
      clientName: "Bambang S.",
      clientLoc: "Senen, Jakarta Pusat",
      clientAvatar: "",
      status: "ditolak",
      title: "Instalasi Listrik Gudang",
      rejectReason: "Keahlian Tidak Sesuai",
      rejectNotes: "Tegangan listrik terlalu tinggi untuk standar residensial.",
      timeText: "2 jam yang lalu",
      isReasonSaved: true,
      distance: 12.4,
      createdTime: 5,
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
      distance: 2.1,
      createdTime: 4,
      clientPhone: "0811-2233-4455",
      stepProgress: 80,
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
      distance: 7.2,
      createdTime: 24,
      clientPhone: "0899-8877-6655",
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
      distance: 14.2,
      createdTime: 8,
      clientPhone: "0812-3456-7890",
      stepProgress: 90,
      reminderSent: false,
    },
    {
      id: 8,
      clientName: "Rina Wijaya",
      clientLoc: "Kebayoran Baru, Jakarta Selatan",
      clientAvatar: "",
      status: "dibatalkan",
      title: "Service Pompa Air",
      totalValue: "Rp 200.000",
      cancelReason: "Pelanggan membatalkan pesanan karena kendala waktu mendadak.",
      cancelDate: "26 Juni 2026 14:05 WIB",
      distance: 5.4,
      createdTime: 12,
    }
  ]);

  // 5. Payment countdown updates
  useEffect(() => {
    const timer = setInterval(() => {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.status === "menunggu_pembayaran" && o.countdown > 0) {
            const nextCount = o.countdown - 1;
            if (nextCount === 0) {
              showToast(`Pembayaran pesanan #${o.id} kedaluwarsa.`, "error");
              return { ...o, countdown: 0, status: "expired" };
            }
            return { ...o, countdown: nextCount };
          }
          return o;
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 22. Auto-polling simulating background fetch
  useEffect(() => {
    const polling = setInterval(() => {
      showToast("Data pesanan disinkronkan dengan server.", "default");
    }, 45000);
    return () => clearInterval(polling);
  }, []);

  const handleManualRefresh = () => {
    setIsSpinning(true);
    setTimeout(() => {
      setIsSpinning(false);
      showToast("Pesanan berhasil diperbarui!", "success");
    }, 800);
  };

  // Helper format countdown seconds
  const formatTime = (secs) => {
    if (secs <= 0) return "Expired";
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // 1. Bid Modal Submit Handler
  const handleOpenSendBid = (order) => {
    setSelectedOrder(order);
    setBidForm({ price: order.budgetRange.split(" - ")[0].replace("Rp ", "").replace(".", ""), duration: "1 Hari", notes: "" });
    setActiveModal("sendBid");
  };

  const handleConfirmSendBid = (e) => {
    e.preventDefault();
    if (!bidForm.price) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrder.id
          ? {
              ...o,
              hasBidSent: true,
              bidValue: `Rp ${parseInt(bidForm.price).toLocaleString("id-ID")}`,
              bidDuration: bidForm.duration,
              bidNotes: bidForm.notes,
              status: "menunggu_persetujuan",
            }
          : o
      )
    );

    showToast("Penawaran harga Anda berhasil dikirim!", "success");
    setActiveModal(null);
    setSelectedOrder(null);
  };

  // 4. Cancel Bid
  const handleOpenCancelBid = (order) => {
    setSelectedOrder(order);
    setActiveModal("cancelBid");
  };

  const confirmCancelBid = () => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrder.id
          ? { ...o, hasBidSent: false, status: "menunggu_penawaran", bidValue: null }
          : o
      )
    );
    showToast("Penawaran Anda berhasil dibatalkan.", "success");
    setActiveModal(null);
    setSelectedOrder(null);
  };

  // 8. Selesaikan Pekerjaan
  const handleOpenCompleteJob = (order) => {
    setSelectedOrder(order);
    setCompletionForm({ beforePhoto: null, afterPhoto: null, receiptPhoto: null, notes: "" });
    setActiveModal("completeJob");
  };

  const handleImageUpload = (e, field) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCompletionForm((prev) => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const submitCompletedJob = (e) => {
    e.preventDefault();
    if (!completionForm.beforePhoto || !completionForm.afterPhoto) {
      showToast("Foto Sebelum dan Sesudah pengerjaan harus diunggah!", "error");
      return;
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrder.id
          ? {
              ...o,
              status: "menunggu_konfirmasi",
              stepProgress: 90,
              finishBeforeImg: completionForm.beforePhoto,
              finishAfterImg: completionForm.afterPhoto,
              receiptImg: completionForm.receiptPhoto,
              finishNotes: completionForm.notes,
            }
          : o
      )
    );

    showToast("Laporan penyelesaian pekerjaan berhasil dikirim!", "success");
    setActiveModal(null);
    setSelectedOrder(null);
  };

  // 10. Send reminder to client
  const handleSendReminder = (id) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, reminderSent: true } : o))
    );
    showToast("Pemberitahuan pengingat dikirim ke pelanggan!", "success");
  };

  // 14. Save reject reasons (LOCKED once saved)
  const handleSaveReason = (id, reason, notes) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, rejectReason: reason, rejectNotes: notes, isReasonSaved: true }
          : o
      )
    );
    showToast("Alasan penolakan berhasil dikunci & disimpan!", "success");
  };

  // Navigation Options Selector
  const handleOpenNavigation = (order) => {
    setSelectedOrder(order);
    setActiveModal("navigation");
  };

  const handleNavigateApp = (app) => {
    if (!selectedOrder) return;
    const url =
      app === "google"
        ? `https://www.google.com/maps?q=${selectedOrder.latitude},${selectedOrder.longitude}`
        : `https://waze.com/ul?ll=${selectedOrder.latitude},${selectedOrder.longitude}&navigate=yes`;
    window.open(url, "_blank");
    setActiveModal(null);
  };

  // Filter & Search Logic
  const filteredOrders = orders.filter((order) => {
    // 17. Search filter query
    const matchesSearch =
      order.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.clientLoc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.status.toLowerCase().includes(searchQuery.toLowerCase());

    // 19. Radius filter query
    const matchesRadius =
      radiusLimit === "Semua" ||
      order.distance <= parseInt(radiusLimit.replace(" km", ""));

    // Tabs filter
    const matchesTab = activeTab === "semua" || order.status === activeTab;

    return matchesSearch && matchesRadius && matchesTab;
  });

  // 18. Sorting Logic
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === "Terdekat") {
      return a.distance - b.distance;
    }
    if (sortBy === "Budget terbesar") {
      const getVal = (o) => {
        const valStr = o.totalValue || o.bidValue || o.budgetRange || "0";
        const clean = valStr.replace(/[^0-9]/g, "");
        return parseInt(clean) || 0;
      };
      return getVal(b) - getVal(a);
    }
    // Terbaru default
    return b.createdTime - a.createdTime;
  });

  // Helper render customer location panel
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

    const handymanLat = order.latitude + 0.004;
    const handymanLng = order.longitude - 0.006;

    const isLocSharing = realtimeSharing[order.id];

    return (
      <div className="mt-4 pt-4 space-y-3 font-sans text-left border-t border-surface-variant/10">
        
        {/* 23. ETA detail layout */}
        <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant/80 bg-surface-container-high/40 p-2.5 rounded-xl">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-secondary">location_on</span>
              {order.distance} km
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-secondary">schedule</span>
              {Math.round(order.distance * 3 + 2)} menit (ETA)
            </span>
          </div>

          {/* 25. Real-time location sharing locator */}
          {order.status === "sedang_dikerjakan" && (
            <button
              onClick={() => {
                setRealtimeSharing((prev) => ({ ...prev, [order.id]: !prev[order.id] }));
                showToast(
                  isLocSharing ? "Berbagi lokasi dinonaktifkan." : "Lokasi real-time Anda dibagikan ke pelanggan.",
                  isLocSharing ? "default" : "success"
                );
              }}
              className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase border flex items-center gap-1.5 cursor-pointer ${
                isLocSharing
                  ? "bg-green-500/10 border-green-500/30 text-green-400"
                  : "bg-surface-container-low border-outline-variant/30 text-on-surface-variant"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full bg-green-400 ${isLocSharing ? "animate-ping" : ""}`}></span>
              {isLocSharing ? "Berbagi" : "Bagikan GPS"}
            </button>
          )}
        </div>

        <div className="text-xs text-on-surface-variant space-y-1">
          <p className="font-semibold text-on-surface leading-relaxed">{order.address}</p>
        </div>

        {/* Leaflet Map */}
        <div className="relative w-full h-[210px] rounded-2xl overflow-hidden shadow-sm">
          <MapContainer
            center={[order.latitude + 0.002, order.longitude - 0.003]}
            zoom={13}
            bounds={[[handymanLat, handymanLng], [order.latitude, order.longitude]]}
            boundsOptions={{ padding: [25, 25] }}
            style={{ height: "100%", width: "100%", borderRadius: "16px" }}
            zoomControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[order.latitude, order.longitude]} icon={clientEmojiIcon} />
            <Marker position={[handymanLat, handymanLng]} icon={handymanEmojiIcon} />
            <Polyline
              positions={[[handymanLat, handymanLng], [order.latitude, order.longitude]]}
              color="#ff9753"
              weight={3}
              dashArray="5, 8"
            />
          </MapContainer>
        </div>

        {/* 7. Waze / Google Maps Navigasi selector */}
        <div className="pt-1">
          <button
            onClick={() => handleOpenNavigation(order)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-surface-container-high hover:bg-surface-container-highest rounded-xl text-xs font-bold text-on-surface transition-all cursor-pointer border-none bg-transparent"
          >
            <span className="material-symbols-outlined text-sm">explore</span>
            Navigasi Peta
          </button>
        </div>
      </div>
    );
  };

  // Helper render completed job summary panel
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
            <span className="font-bold text-secondary">{order.totalValue}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant">Status Pembayaran</span>
            <span className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-extrabold uppercase text-[9px]">
              Lunas
            </span>
          </div>
        </div>

        {/* 12 & 13. Rating click triggers ulasan detailed modal */}
        {order.rating && (
          <div 
            onClick={() => {
              setSelectedOrder(order);
              setActiveModal("review");
            }}
            className="bg-surface-container-high/60 rounded-2xl p-4 border border-outline-variant/20 space-y-2 cursor-pointer hover:border-secondary/20 transition-colors"
          >
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

  const filterTabs = [
    { id: "semua", label: "Semua" },
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

  return (
    <div className="bg-background text-on-surface min-h-screen selection:bg-secondary/30 selection:text-secondary font-sans relative overflow-x-hidden flex">
      
      {/* Backdrop for Mobile Sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Floating Action Button (New Job Hunt) */}
      {/* 20. FAB Navigates to Dashboard marketplace */}
      <button 
        onClick={() => navigate("/tukang/dashboard")}
        className="fixed right-6 bottom-24 lg:bottom-10 bg-secondary text-on-secondary p-4 rounded-2xl shadow-2xl hover:scale-110 active:scale-95 transition-transform z-40 flex items-center gap-2 cursor-pointer border-none font-bold text-sm"
      >
        <span className="material-symbols-outlined">search</span>
        <span className="hidden md:block">Cari Pekerjaan Baru</span>
      </button>

      {/* Toast Notifications */}
      <div className="fixed top-24 right-6 z-[100] space-y-3 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-slide-in text-xs font-semibold ${
              t.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : t.type === "error"
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "bg-surface-container border-outline-variant/30 text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {t.type === "success" ? "check_circle" : t.type === "error" ? "error" : "notifications"}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

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
          
          {/* 17. Search bar, 21. Refresh icon, 18. Sorting, 19. Radius Limits */}
          <div className="bg-surface-container border border-surface-variant/15 p-5 rounded-3xl space-y-4 shadow-md">
            
            {/* Search Input & Manual Refresh */}
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Cari berdasarkan pelanggan, judul, lokasi..."
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl py-2.5 pl-10 pr-4 text-xs text-on-surface outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 font-semibold"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-sm">
                  search
                </span>
              </div>
              
              <button 
                onClick={handleManualRefresh}
                className="p-2.5 rounded-xl border border-outline-variant/30 text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer bg-transparent flex items-center justify-center"
                title="Perbarui Pesanan"
              >
                <span className={`material-symbols-outlined text-sm ${isSpinning ? "animate-spin text-secondary" : ""}`}>
                  refresh
                </span>
              </button>
            </div>

            {/* Sorting & Radius Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="space-y-1.5">
                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Jarak Maksimal (Radius)</span>
                <div className="flex gap-1.5">
                  {["Semua", "5 km", "10 km", "20 km"].map((rad) => (
                    <button
                      key={rad}
                      onClick={() => setRadiusLimit(rad)}
                      className={`flex-1 py-1.5 border rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                        radiusLimit === rad
                          ? "bg-secondary border-secondary text-on-secondary"
                          : "bg-surface-container-low border-outline-variant/25 text-on-surface-variant"
                      }`}
                    >
                      {rad}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Urutkan Pesanan</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 text-on-surface text-[11px] rounded-xl px-3 py-2 outline-none font-bold cursor-pointer"
                >
                  <option value="Terbaru">Terbaru Ditambahkan</option>
                  <option value="Terdekat">Jarak Terdekat</option>
                  <option value="Budget terbesar">Budget Terbesar</option>
                </select>
              </div>

            </div>

          </div>

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
          {sortedOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">assignment_late</span>
              <p className="text-on-surface-variant text-sm">Tidak ada pesanan dengan parameter filter ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sortedOrders.map((order) => {
                
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
                              <img className="w-full h-full object-cover" alt={order.clientName} src={order.clientAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"} />
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-on-surface">{order.clientName}</h3>
                              <div className="flex items-center gap-1 text-on-surface-variant/80 text-[11px] mt-0.5">
                                <span className="material-symbols-outlined text-xs">location_on</span>
                                {order.clientLoc} ({order.distance} km)
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
                              // 16. Click image for fullscreen zoom preview
                              <div 
                                key={idx} 
                                onClick={() => setImageZoom(img)}
                                className="aspect-square rounded-xl overflow-hidden bg-surface-container-high cursor-pointer relative group"
                              >
                                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="Job Attachment" src={img} />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <span className="material-symbols-outlined text-white text-[16px]">zoom_in</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-surface-variant/10">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-on-surface-variant/60 uppercase font-semibold">Budget Perkiraan</span>
                          <span className="text-xs font-bold text-on-surface mt-0.5">{order.budgetRange}</span>
                        </div>
                        {order.hasBidSent ? (
                          // 2. Click button to view submitted bid detail modal
                          <button 
                            onClick={() => {
                              setSelectedOrder(order);
                              setActiveModal("bidDetail");
                            }}
                            className="bg-surface-container-high hover:bg-surface-container-highest text-secondary text-xs font-bold px-4 py-2 rounded-xl cursor-pointer border-none"
                          >
                            Lihat Penawaran
                          </button>
                        ) : (
                          // 1. Click button to show bid send modal input
                          <button 
                            onClick={() => handleOpenSendBid(order)}
                            className="bg-secondary text-on-secondary text-xs font-bold px-4 py-2.5 rounded-xl hover:scale-105 active:scale-95 transition-transform cursor-pointer border-none"
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

                      {/* 3. Hubungi Chat, 4. Batalkan Penawaran Confirmation */}
                      <div className="flex gap-3 pt-3 border-t border-surface-variant/10">
                        <button 
                          onClick={() => navigate("/tukang/chat", { state: { orderId: order.id, clientName: order.clientName } })}
                          className="flex-grow py-2.5 bg-surface-container-high hover:bg-surface-container-highest text-xs font-bold text-on-surface rounded-xl transition-all cursor-pointer border-none"
                        >
                          Hubungi Chat
                        </button>
                        <button 
                          onClick={() => handleOpenCancelBid(order)}
                          className="flex-grow bg-surface-container-high text-error hover:bg-red-500/10 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer border-none"
                        >
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
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[9px] font-extrabold uppercase tracking-wider">
                              Pembayaran
                            </span>
                            <span className="text-xs font-extrabold text-on-surface mt-1">{order.totalValue}</span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-secondary font-bold text-sm mb-1">{order.title}</h4>
                          {/* 6. Progress bar follows status */}
                          <div className="flex items-center gap-3 mt-2">
                            <div className="h-1.5 flex-grow bg-surface-container-highest rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${order.stepProgress}%` }}></div>
                            </div>
                            <span className="text-[10px] font-bold text-on-surface-variant/70 whitespace-nowrap">{order.stepText}</span>
                          </div>

                          {/* 5. Countdown timer for payments */}
                          {order.countdown !== undefined && (
                            <div className="mt-3 flex items-center justify-between p-2.5 bg-red-500/5 border border-red-500/10 rounded-xl text-[10px]">
                              <span className="text-red-400 font-bold uppercase tracking-wider">Batas Waktu Bayar Pelanggan</span>
                              <span className="font-mono text-red-400 font-bold">{formatTime(order.countdown)}</span>
                            </div>
                          )}
                        </div>

                        {/* Customer Location Panel */}
                        {renderCustomerLocationPanel(order)}
                      </div>

                      {/* 24. Telephone button once order is accepted */}
                      <div className="flex gap-2.5 mt-4">
                        <button 
                          onClick={() => window.open(`tel:${order.clientPhone || "0812-3456-7890"}`)}
                          className="px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface cursor-pointer border-none flex items-center justify-center"
                          title="Telepon Pelanggan"
                        >
                          <span className="material-symbols-outlined text-sm">phone</span>
                        </button>
                        <button className="flex-1 py-2.5 rounded-xl bg-surface-container-high text-xs font-bold text-on-surface-variant/60 cursor-not-allowed border-none">
                          Menunggu Pembayaran Klien
                        </button>
                      </div>
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
                          {/* Progress bar */}
                          <div className="flex items-center gap-3 mt-2">
                            <div className="h-1.5 flex-grow bg-surface-container-highest rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${order.stepProgress || 80}%` }}></div>
                            </div>
                            <span className="text-[10px] font-bold text-on-surface-variant/70 whitespace-nowrap">Langkah 4/5</span>
                          </div>
                        </div>

                        {/* Customer Location Panel */}
                        {renderCustomerLocationPanel(order)}
                      </div>

                      {/* 24. Telephone button, 8. Selesaikan pekerjaan button */}
                      <div className="flex gap-2.5 mt-4">
                        <button 
                          onClick={() => window.open(`tel:${order.clientPhone || "0812-3456-7890"}`)}
                          className="px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface cursor-pointer border-none flex items-center justify-center"
                          title="Telepon Pelanggan"
                        >
                          <span className="material-symbols-outlined text-sm">phone</span>
                        </button>
                        
                        <button 
                          onClick={() => handleOpenCompleteJob(order)}
                          className="flex-1 py-2.5 rounded-xl bg-green-500 text-on-secondary text-xs font-bold hover:scale-[1.02] active:scale-95 transition-all cursor-pointer border-none"
                        >
                          Selesaikan Pekerjaan
                        </button>
                      </div>
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

                      {/* 11. Preview & Download invoice triggers */}
                      <div className="grid grid-cols-2 gap-2.5 mt-4">
                        <button 
                          onClick={() => {
                            setSelectedOrder(order);
                            setActiveModal("invoice");
                          }}
                          className="py-2.5 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container-high transition-colors text-xs font-bold cursor-pointer bg-transparent"
                        >
                          Invoice
                        </button>
                        <button 
                          onClick={() => {
                            showToast("Menyiapkan berkas PDF...", "default");
                            setTimeout(() => window.print(), 1200);
                          }}
                          className="py-2.5 rounded-xl bg-secondary text-on-secondary text-xs font-bold hover:opacity-90 cursor-pointer border-none"
                        >
                          Cetak PDF
                        </button>
                      </div>
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
                            Laporan penyelesaian pekerjaan Anda sedang ditinjau oleh pelanggan.
                          </p>
                        </div>

                        {/* Customer Location Panel */}
                        {renderCustomerLocationPanel(order)}
                      </div>

                      {/* 10. Send reminder notice to client */}
                      <button 
                        onClick={() => handleSendReminder(order.id)}
                        disabled={order.reminderSent}
                        className={`w-full mt-4 py-2.5 rounded-xl text-xs font-bold transition-all border-none ${
                          order.reminderSent
                            ? "bg-surface-container-high text-on-surface-variant/40 cursor-not-allowed"
                            : "bg-secondary text-on-secondary hover:opacity-90 cursor-pointer"
                        }`}
                      >
                        {order.reminderSent ? "Pengingat Dikirim" : "Kirim Pengingat Pelanggan"}
                      </button>
                    </div>
                  );
                }

                // Card 8: Dibatalkan
                if (order.status === "dibatalkan" || order.status === "expired") {
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
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                            order.status === "expired" ? "bg-red-500/10 text-red-400" : "bg-outline-variant/10 text-on-surface-variant"
                          }`}>
                            {order.status === "expired" ? "Kedaluwarsa" : "Batal"}
                          </span>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-on-surface-variant font-bold text-sm mb-1">{order.title}</h4>
                          <div className="mt-2 p-3.5 rounded-xl bg-surface-container-high/60 border-l-4 border-outline text-xs italic text-on-surface-variant/90 leading-relaxed">
                            "{order.cancelReason || "Pembayaran batas waktu terlampaui."}"
                          </div>
                        </div>
                      </div>

                      {/* 15. Detail pembatalan modal trigger */}
                      {order.status === "dibatalkan" && (
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setActiveModal("cancellation");
                          }}
                          className="w-full mt-2 py-2.5 border border-outline-variant text-on-surface hover:bg-surface-container-high transition-colors text-xs font-bold rounded-xl cursor-pointer bg-transparent"
                        >
                          Lihat Detail Pembatalan
                        </button>
                      )}
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
                      // 14. Locked once saved
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

      {/* Logout modal */}
      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={() => navigate("/")} 
        role="teknisi" 
      />

      {/* FULLSCREEN IMAGE ZOOM MODAL */}
      {imageZoom && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="absolute inset-0" onClick={() => setImageZoom(null)}></div>
          <div className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col items-center z-10">
            <button 
              onClick={() => setImageZoom(null)}
              className="absolute top-4 right-4 bg-black/60 p-2.5 rounded-full text-white hover:bg-black/80 transition-colors z-20 cursor-pointer border-none flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
            <img src={imageZoom} alt="Fullscreen View" className="max-w-full max-h-[80vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

      {/* MODAL: KIRIM PENAWARAN */}
      {activeModal === "sendBid" && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container border border-surface-variant/15 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up text-xs font-semibold">
            <div className="p-5 border-b border-surface-variant/10 flex justify-between items-center bg-surface-container-high">
              <h3 className="text-sm font-extrabold text-on-surface">Kirim Penawaran Harga</h3>
              <button 
                onClick={() => {
                  setActiveModal(null);
                  setSelectedOrder(null);
                }}
                className="p-1 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleConfirmSendBid} className="p-6 space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant uppercase font-bold">Harga Ajuan (Rupiah)</label>
                <input 
                  type="number"
                  placeholder="Contoh: 250000"
                  className="w-full bg-surface-container-high border border-outline-variant rounded-xl p-3 text-xs text-on-surface outline-none"
                  value={bidForm.price}
                  onChange={(e) => setBidForm({ ...bidForm, price: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant uppercase font-bold">Estimasi Waktu Pengerjaan</label>
                <select
                  value={bidForm.duration}
                  onChange={(e) => setBidForm({ ...bidForm, duration: e.target.value })}
                  className="w-full bg-surface-container-high border border-outline-variant rounded-xl p-3 text-xs text-on-surface outline-none cursor-pointer"
                >
                  <option value="1 Jam">1 Jam</option>
                  <option value="2 Jam">2 Jam</option>
                  <option value="4 Jam">4 Jam</option>
                  <option value="1 Hari">1 Hari</option>
                  <option value="2 Hari">2 Hari</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant uppercase font-bold">Catatan Tambahan (Bahan dll)</label>
                <textarea 
                  placeholder="Tulis rincian penawaran..."
                  className="w-full bg-surface-container-high border border-outline-variant rounded-xl p-3 text-xs text-on-surface outline-none resize-none"
                  rows="3"
                  value={bidForm.notes}
                  onChange={(e) => setBidForm({ ...bidForm, notes: e.target.value })}
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-secondary text-on-secondary font-bold py-3.5 rounded-xl hover:scale-[1.01] transition-transform border-none cursor-pointer mt-2"
              >
                Kirim Penawaran Sekarang
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DETAIL PENAWARAN SUBMITTED */}
      {activeModal === "bidDetail" && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container border border-surface-variant/15 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up text-xs font-semibold">
            <div className="p-5 border-b border-surface-variant/10 flex justify-between items-center bg-surface-container-high">
              <h3 className="text-sm font-extrabold text-on-surface">Detail Penawaran Diajukan</h3>
              <button 
                onClick={() => {
                  setActiveModal(null);
                  setSelectedOrder(null);
                }}
                className="p-1 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-surface-container-high rounded-2xl border border-outline-variant/10 space-y-3">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant font-medium">Harga Diajukan</span>
                  <span className="font-extrabold text-secondary">{selectedOrder.bidValue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant font-medium">Estimasi Waktu</span>
                  <span className="font-bold text-on-surface">{selectedOrder.bidDuration || "1 Hari"}</span>
                </div>
                <div className="flex flex-col space-y-1 text-left border-t border-outline-variant/10 pt-3">
                  <span className="text-on-surface-variant font-medium">Catatan Tambahan</span>
                  <p className="text-[11px] text-on-surface leading-normal italic">
                    "{selectedOrder.bidNotes || "Tidak ada catatan tambahan."}"
                  </p>
                </div>
                <div className="flex justify-between items-center border-t border-outline-variant/10 pt-3 text-[10px]">
                  <span className="text-on-surface-variant font-medium">Status Penawaran</span>
                  <span className="px-2 py-0.5 rounded-full bg-secondary/15 border border-secondary/20 text-secondary uppercase font-bold">
                    Menunggu Persetujuan
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleOpenCancelBid(selectedOrder)}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-3 rounded-xl transition-colors border border-red-500/20 cursor-pointer"
              >
                Batalkan Penawaran Ini
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CANCEL BID CONFIRMATION */}
      {activeModal === "cancelBid" && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container border border-surface-variant/20 w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center space-y-4 animate-scale-up text-xs font-semibold">
            <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
              <span className="material-symbols-outlined text-2xl font-bold">cancel</span>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-extrabold text-base text-on-surface">Batalkan Penawaran?</h4>
              <p className="text-xs text-on-surface-variant/80 leading-relaxed px-2">
                Apakah Anda yakin ingin menarik penawaran pada pekerjaan <strong>"{selectedOrder.title}"</strong>?
              </p>
            </div>

            <div className="flex gap-3 w-full pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-outline-variant/30 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer bg-transparent"
              >
                Kembali
              </button>
              <button
                onClick={confirmCancelBid}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-colors cursor-pointer border-none"
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NAVIGATION SELECT APP */}
      {activeModal === "navigation" && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container border border-surface-variant/20 w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center space-y-4 animate-scale-up text-xs font-semibold">
            <div className="w-12 h-12 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center border border-secondary/25">
              <span className="material-symbols-outlined text-lg">explore</span>
            </div>

            <div>
              <h4 className="font-bold text-sm text-on-surface">Pilih Aplikasi Navigasi</h4>
              <p className="text-[11px] text-on-surface-variant/80 mt-1 leading-relaxed px-4">
                Pilih perangkat peta untuk memandu navigasi rute menuju lokasi pelanggan.
              </p>
            </div>

            <div className="w-full space-y-2 pt-2">
              <button
                onClick={() => handleNavigateApp("google")}
                className="w-full py-3 bg-surface-container-high hover:bg-surface-container-highest rounded-xl text-xs font-bold text-on-surface flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                <span className="material-symbols-outlined text-sm text-primary">map</span>
                Google Maps
              </button>
              <button
                onClick={() => handleNavigateApp("waze")}
                className="w-full py-3 bg-surface-container-high hover:bg-surface-container-highest rounded-xl text-xs font-bold text-on-surface flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                <span className="material-symbols-outlined text-sm text-secondary">explore</span>
                Waze Navigation
              </button>
            </div>

            <button
              onClick={() => {
                setActiveModal(null);
                setSelectedOrder(null);
              }}
              className="w-full py-2.5 rounded-xl border border-outline-variant/30 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer bg-transparent"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* MODAL: COMPLETE JOB FORM */}
      {activeModal === "completeJob" && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-surface-container border border-surface-variant/15 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up text-xs font-semibold my-8">
            <div className="p-5 border-b border-surface-variant/10 flex justify-between items-center bg-surface-container-high">
              <h3 className="text-sm font-extrabold text-on-surface">Laporan Penyelesaian</h3>
              <button 
                onClick={() => {
                  setActiveModal(null);
                  setSelectedOrder(null);
                }}
                className="p-1 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={submitCompletedJob} className="p-6 space-y-4 text-left">
              
              <div className="grid grid-cols-2 gap-4">
                
                {/* Before Photo */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Foto Sebelum Kerja</span>
                  <div 
                    onClick={() => beforePhotoInput.current.click()}
                    className="h-28 rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container-low hover:bg-surface-container-high transition-colors cursor-pointer flex flex-col items-center justify-center overflow-hidden"
                  >
                    {completionForm.beforePhoto ? (
                      <img src={completionForm.beforePhoto} alt="Before" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-on-surface-variant/60 text-lg">add_a_photo</span>
                        <span className="text-[9px] text-on-surface-variant/60 mt-1">Pilih Foto</span>
                      </>
                    )}
                  </div>
                  <input type="file" ref={beforePhotoInput} accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "beforePhoto")} />
                </div>

                {/* After Photo */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Foto Setelah Kerja</span>
                  <div 
                    onClick={() => afterPhotoInput.current.click()}
                    className="h-28 rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container-low hover:bg-surface-container-high transition-colors cursor-pointer flex flex-col items-center justify-center overflow-hidden"
                  >
                    {completionForm.afterPhoto ? (
                      <img src={completionForm.afterPhoto} alt="After" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-on-surface-variant/60 text-lg">add_a_photo</span>
                        <span className="text-[9px] text-on-surface-variant/60 mt-1">Pilih Foto</span>
                      </>
                    )}
                  </div>
                  <input type="file" ref={afterPhotoInput} accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "afterPhoto")} />
                </div>

              </div>

              {/* 9. Receipt photo upload */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Upload Bukti Pembelian/Nota (Opsional)</span>
                <div 
                  onClick={() => receiptPhotoInput.current.click()}
                  className="h-20 rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container-low hover:bg-surface-container-high transition-colors cursor-pointer flex items-center justify-center gap-2 overflow-hidden"
                >
                  {completionForm.receiptPhoto ? (
                    <img src={completionForm.receiptPhoto} alt="Receipt" className="h-full object-contain" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-on-surface-variant/60 text-sm">receipt</span>
                      <span className="text-[9px] text-on-surface-variant/60">Pilih Berkas/Nota Belanja</span>
                    </>
                  )}
                </div>
                <input type="file" ref={receiptPhotoInput} accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "receiptPhoto")} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant uppercase font-bold">Catatan Pekerjaan</label>
                <textarea 
                  placeholder="Tulis ringkasan hasil pekerjaan dan material tambahan..."
                  className="w-full bg-surface-container-high border border-outline-variant rounded-xl p-3 text-xs text-on-surface outline-none resize-none"
                  rows="3"
                  value={completionForm.notes}
                  onChange={(e) => setCompletionForm({ ...completionForm, notes: e.target.value })}
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-secondary text-on-secondary font-bold py-3.5 rounded-xl hover:scale-[1.01] transition-transform border-none cursor-pointer mt-2 flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[15px]">send</span>
                Kirim Laporan Selesai
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DETAIL PEMBATALAN */}
      {activeModal === "cancellation" && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container border border-surface-variant/15 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up text-xs font-semibold">
            <div className="p-5 border-b border-surface-variant/10 flex justify-between items-center bg-surface-container-high">
              <h3 className="text-sm font-extrabold text-on-surface">Detail Pembatalan Pekerjaan</h3>
              <button 
                onClick={() => {
                  setActiveModal(null);
                  setSelectedOrder(null);
                }}
                className="p-1 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-surface-container-high rounded-2xl border border-outline-variant/10 space-y-3">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant font-medium">Tanggal Batal</span>
                  <span className="font-bold text-on-surface">{selectedOrder.cancelDate || "26 Juni 2026"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant font-medium">Dana Pengganti (Fine)</span>
                  <span className="font-extrabold text-green-400">Rp 25.000</span>
                </div>
                <div className="flex flex-col space-y-1 text-left border-t border-outline-variant/10 pt-3">
                  <span className="text-on-surface-variant font-medium">Alasan Pembatalan Klien</span>
                  <p className="text-[11px] text-on-surface leading-normal italic">
                    "{selectedOrder.cancelReason || "Pembatalan sepihak dari klien."}"
                  </p>
                </div>
              </div>

              <button 
                onClick={() => {
                  setActiveModal(null);
                  setSelectedOrder(null);
                }}
                className="w-full bg-secondary text-on-secondary font-bold py-3 rounded-xl hover:scale-[1.01] transition-transform border-none cursor-pointer"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PREVIEW INVOICE */}
      {activeModal === "invoice" && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-surface-container border border-surface-variant/15 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up text-xs font-semibold my-8">
            <div className="p-5 border-b border-surface-variant/10 flex justify-between items-center bg-surface-container-high">
              <h3 className="text-sm font-extrabold text-on-surface">Invoice Pembayaran</h3>
              <button 
                onClick={() => {
                  setActiveModal(null);
                  setSelectedOrder(null);
                }}
                className="p-1 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center">
                <h4 className="font-extrabold text-on-surface text-base">TUKANGAJA INVOICE</h4>
                <p className="text-[9px] text-on-surface-variant">Nomor: INV/TK/{selectedOrder.id}/2026</p>
              </div>

              <div className="border-t border-dashed border-outline-variant/30 pt-3 space-y-2 text-[10px] text-on-surface-variant font-medium">
                <div className="flex justify-between">
                  <span>Nama Teknisi</span>
                  <span className="text-on-surface font-bold">Denji</span>
                </div>
                <div className="flex justify-between">
                  <span>Pelanggan</span>
                  <span className="text-on-surface font-bold">{selectedOrder.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Layanan</span>
                  <span className="text-on-surface font-bold truncate max-w-[180px]">{selectedOrder.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal</span>
                  <span className="text-on-surface font-bold">{selectedOrder.finishDate || "26 Juni 2026"}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-outline-variant/30 pt-3 space-y-2 text-xs">
                <div className="flex justify-between font-bold">
                  <span>Biaya Layanan Jasa</span>
                  <span className="text-on-surface">{selectedOrder.totalValue}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant/80 text-[10px]">
                  <span>Ppn 11%</span>
                  <span>Sudah Termasuk</span>
                </div>
                <div className="flex justify-between font-extrabold text-secondary border-t border-outline-variant/10 pt-2 text-sm">
                  <span>Total Penerimaan</span>
                  <span>{selectedOrder.totalValue}</span>
                </div>
              </div>

              <button 
                onClick={() => {
                  showToast("Invoice berhasil diunduh ke folder Downloads!", "success");
                  setActiveModal(null);
                }}
                className="w-full bg-secondary text-on-secondary font-bold py-3 rounded-xl hover:scale-[1.01] transition-transform border-none cursor-pointer mt-2"
              >
                Unduh PDF Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CUSTOMER REVIEW DETAILED */}
      {activeModal === "review" && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container border border-surface-variant/15 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up text-xs font-semibold">
            <div className="p-5 border-b border-surface-variant/10 flex justify-between items-center bg-surface-container-high">
              <h3 className="text-sm font-extrabold text-on-surface">Detail Ulasan Klien</h3>
              <button 
                onClick={() => {
                  setActiveModal(null);
                  setSelectedOrder(null);
                }}
                className="p-1 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 text-center">
              <div className="flex items-center justify-center text-yellow-400 gap-1 text-lg">
                {[...Array(5)].map((_, i) => (
                  <span 
                    key={i} 
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: i < selectedOrder.rating ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    star
                  </span>
                ))}
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-on-surface">{selectedOrder.clientName}</h4>
                <p className="text-[10px] text-on-surface-variant">{selectedOrder.clientLoc}</p>
              </div>

              <p className="p-4 bg-surface-container-high rounded-2xl italic text-on-surface text-xs leading-relaxed border-l-4 border-secondary">
                "{selectedOrder.review || "Pelanggan memberikan rating bintang 5 tanpa ulasan tertulis."}"
              </p>

              <button 
                onClick={() => {
                  setActiveModal(null);
                  setSelectedOrder(null);
                }}
                className="w-full bg-secondary text-on-secondary font-bold py-3 rounded-xl hover:scale-[1.01] transition-transform border-none cursor-pointer mt-2"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[0%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-[120px]"></div>
      </div>

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
                disabled={order.isReasonSaved}
                className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl py-2 px-3 text-xs text-on-surface focus:border-secondary outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                disabled={order.isReasonSaved}
                className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl py-2 px-3 text-xs text-on-surface focus:border-secondary outline-none transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed" 
                placeholder="Tulis alasan lebih detail..." 
                rows="2"
              />
            </div>
            
            <button 
              type="button"
              onClick={() => onSaveReason(order.id, selectedReason, notes)}
              disabled={order.isReasonSaved}
              className="w-full py-2.5 rounded-xl bg-error text-white text-xs font-bold hover:bg-error/85 transition-colors cursor-pointer border-none mt-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {order.isReasonSaved ? "Alasan Dikunci" : "Simpan Alasan"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TukangPesanan;
