import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminData } from "./adminData";
import LogoutModal from "../../components/LogoutModal";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

const MOCK_VERIFIKASI = [
  {
    id: 1,
    nama: "Budi Santoso",
    nik: "3276011204920001",
    keahlian: "Tukang Kayu",
    keahlian_tambahan: "Pembuatan Lemari, Kusen Pintu, Meja",
    tahun_pengalaman: 5,
    deskripsi_pengalaman: "Spesialis dalam perkayuan furniture dan renovasi kusen rumah tinggal.",
    alamat: "Jl. Margonda Raya No. 12, Depok",
    latitude: -6.391782,
    longitude: 106.829443,
    foto_profil: "https://ui-avatars.com/api/?name=Budi+Santoso&background=random",
    foto_ktp: "https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=600&auto=format&fit=crop",
    cv_portofolio: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    status_verifikasi: "Menunggu",
    created_at: "2026-07-03T10:00:00Z",
    no_hp: "081234567890",
    user: { email: "budi.santoso@gmail.com" },
    kota: "Depok",
    radius_layanan: 15
  },
  {
    id: 2,
    nama: "Joko Susilo",
    nik: "3171021508880002",
    keahlian: "Tukang Kelistrikan",
    keahlian_tambahan: "Instalasi AC, Perbaikan Generator, Wiring",
    tahun_pengalaman: 8,
    deskripsi_pengalaman: "Menangani instalasi listrik rumah tangga dan perbaikan sistem kelistrikan gedung.",
    alamat: "Jl. Sudirman No. 45, Jakarta Pusat",
    latitude: -6.2088,
    longitude: 106.8456,
    foto_profil: "https://ui-avatars.com/api/?name=Joko+Susilo&background=random",
    foto_ktp: "https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=600&auto=format&fit=crop",
    cv_portofolio: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    status_verifikasi: "Menunggu",
    created_at: "2026-07-02T11:30:00Z",
    no_hp: "082345678901",
    user: { email: "joko.susilo@gmail.com" },
    kota: "Jakarta",
    radius_layanan: 10
  },
  {
    id: 3,
    nama: "Agus Prasetyo",
    nik: "3275031806900003",
    keahlian: "Tukang Ledeng",
    keahlian_tambahan: "Pipa Bocor, Wastafel, Pompa Air",
    tahun_pengalaman: 4,
    deskripsi_pengalaman: "Ahli dalam perbaikan saluran air mampet dan pemasangan instalasi plumbing.",
    alamat: "Jl. Pajajaran No. 88, Bogor",
    latitude: -6.5971,
    longitude: 106.8060,
    foto_profil: "https://ui-avatars.com/api/?name=Agus+Prasetyo&background=random",
    foto_ktp: "https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=600&auto=format&fit=crop",
    cv_portofolio: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    status_verifikasi: "Aktif",
    created_at: "2026-06-28T09:15:00Z",
    no_hp: "083456789012",
    user: { email: "agus.prasetyo@gmail.com" },
    kota: "Bogor",
    radius_layanan: 12
  },
  {
    id: 4,
    nama: "Siti Aminah",
    nik: "3674044509930004",
    keahlian: "Pembersih Rumah",
    keahlian_tambahan: "Deep Cleaning, Cuci Kasur, Setrika",
    tahun_pengalaman: 3,
    deskripsi_pengalaman: "Jasa bebersih rumah harian maupun bulanan secara detail dan steril.",
    alamat: "Jl. Boulevard Raya Blok M, Tangerang Selatan",
    latitude: -6.2731,
    longitude: 106.6617,
    foto_profil: "https://ui-avatars.com/api/?name=Siti+Aminah&background=random",
    foto_ktp: "https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=600&auto=format&fit=crop",
    cv_portofolio: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    status_verifikasi: "Menunggu",
    created_at: "2026-07-04T08:00:00Z",
    no_hp: "084567890123",
    user: { email: "siti.aminah@gmail.com" },
    kota: "Tangerang",
    radius_layanan: 8
  },
  {
    id: 5,
    nama: "Hendra Wijaya",
    nik: "3273052210850005",
    keahlian: "Tukang Cat",
    keahlian_tambahan: "Cat Dinding, Waterproofing, Cat Dekoratif",
    tahun_pengalaman: 6,
    deskripsi_pengalaman: "Spesialis cat interior dan eksterior rumah dengan jaminan kerapihan.",
    alamat: "Jl. Dago No. 102, Bandung",
    latitude: -6.8915,
    longitude: 107.6161,
    foto_profil: "https://ui-avatars.com/api/?name=Hendra+Wijaya&background=random",
    foto_ktp: "https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=600&auto=format&fit=crop",
    cv_portofolio: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    status_verifikasi: "Ditolak",
    created_at: "2026-06-25T14:20:00Z",
    no_hp: "085678901234",
    user: { email: "hendra.wijaya@gmail.com" },
    kota: "Bandung",
    radius_layanan: 20
  },
  {
    id: 6,
    nama: "Rian Hidayat",
    nik: "3175061403910006",
    keahlian: "Tukang AC",
    keahlian_tambahan: "Service AC, Pasang Baru, Isi Freon",
    tahun_pengalaman: 7,
    deskripsi_pengalaman: "Melayani perawatan AC split, cassette, dan standing untuk perumahan.",
    alamat: "Jl. Kelapa Gading Nias, Jakarta Utara",
    latitude: -6.1554,
    longitude: 106.9024,
    foto_profil: "https://ui-avatars.com/api/?name=Rian+Hidayat&background=random",
    foto_ktp: "https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=600&auto=format&fit=crop",
    cv_portofolio: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    status_verifikasi: "Menunggu",
    created_at: "2026-07-04T12:00:00Z",
    no_hp: "086789012345",
    user: { email: "rian.hidayat@gmail.com" },
    kota: "Jakarta",
    radius_layanan: 15
  },
  {
    id: 7,
    nama: "Ahmad Fauzi",
    nik: "3578072512940007",
    keahlian: "Tukang Kayu",
    keahlian_tambahan: "Perbaikan Furniture, Kitchen Set",
    tahun_pengalaman: 4,
    deskripsi_pengalaman: "Spesialis kitchen set minimalis dan pemasangan lantai parket kayu.",
    alamat: "Jl. Darmo Indah No. 12, Surabaya",
    latitude: -7.2756,
    longitude: 112.7106,
    foto_profil: "https://ui-avatars.com/api/?name=Ahmad+Fauzi&background=random",
    foto_ktp: "https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=600&auto=format&fit=crop",
    cv_portofolio: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    status_verifikasi: "Menunggu",
    created_at: "2026-07-01T15:45:00Z",
    no_hp: "087890123456",
    user: { email: "ahmad.fauzi@gmail.com" },
    kota: "Surabaya",
    radius_layanan: 25
  },
  {
    id: 8,
    nama: "Dewi Lestari",
    nik: "3276025205950008",
    keahlian: "Pembersih Rumah",
    keahlian_tambahan: "Pembersihan Taman, Fogging Disinfektan",
    tahun_pengalaman: 2,
    deskripsi_pengalaman: "Layanan general cleaning pasca renovasi maupun pembersihan rutin.",
    alamat: "Jl. Sawangan Raya, Depok",
    latitude: -6.4024,
    longitude: 106.7786,
    foto_profil: "https://ui-avatars.com/api/?name=Dewi+Lestari&background=random",
    foto_ktp: "https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=600&auto=format&fit=crop",
    cv_portofolio: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    status_verifikasi: "Menunggu",
    created_at: "2026-07-04T16:20:00Z",
    no_hp: "088901234567",
    user: { email: "dewi.lestari@gmail.com" },
    kota: "Depok",
    radius_layanan: 10
  },
  {
    id: 9,
    nama: "Fajar Pratama",
    nik: "3174092911870009",
    keahlian: "Tukang Kelistrikan",
    keahlian_tambahan: "Instalasi Panel, Penangkal Petir",
    tahun_pengalaman: 10,
    deskripsi_pengalaman: "Instalatur listrik bersertifikasi, ahli dalam perakitan panel listrik 3 phase.",
    alamat: "Jl. Tebet Barat Dalam, Jakarta Selatan",
    latitude: -6.2415,
    longitude: 106.8486,
    foto_profil: "https://ui-avatars.com/api/?name=Fajar+Pratama&background=random",
    foto_ktp: "https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=600&auto=format&fit=crop",
    cv_portofolio: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    status_verifikasi: "Aktif",
    created_at: "2026-06-30T10:00:00Z",
    no_hp: "089012345678",
    user: { email: "fajar.pratama@gmail.com" },
    kota: "Jakarta",
    radius_layanan: 15
  },
  {
    id: 10,
    nama: "Gita Safitri",
    nik: "3275104207960010",
    keahlian: "Tukang Cat",
    keahlian_tambahan: "Pengecatan Pagar, Finishing Melamik",
    tahun_pengalaman: 3,
    deskripsi_pengalaman: "Ahli dalam pengecatan dinding lembab dan finishing kusen kayu melamik.",
    alamat: "Jl. Galaxy Raya, Bekasi",
    latitude: -6.2655,
    longitude: 106.9749,
    foto_profil: "https://ui-avatars.com/api/?name=Gita+Safitri&background=random",
    foto_ktp: "https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=600&auto=format&fit=crop",
    cv_portofolio: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    status_verifikasi: "Menunggu",
    created_at: "2026-07-04T17:10:00Z",
    no_hp: "081123456789",
    user: { email: "gita.safitri@gmail.com" },
    kota: "Bekasi",
    radius_layanan: 12
  },
  {
    id: 11,
    nama: "Hadi Syahputra",
    nik: "3173111412890011",
    keahlian: "Tukang Ledeng",
    keahlian_tambahan: "Deteksi Kebocoran Pipa, Cuci Toren",
    tahun_pengalaman: 6,
    deskripsi_pengalaman: "Penyedia jasa plumbing dengan keahlian deteksi pipa bocor dalam dinding.",
    alamat: "Jl. Palmerah Barat, Jakarta Barat",
    latitude: -6.2081,
    longitude: 106.7869,
    foto_profil: "https://ui-avatars.com/api/?name=Hadi+Syahputra&background=random",
    foto_ktp: "https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=600&auto=format&fit=crop",
    cv_portofolio: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    status_verifikasi: "Menunggu",
    created_at: "2026-07-04T18:00:00Z",
    no_hp: "082234567890",
    user: { email: "hadi.syahputra@gmail.com" },
    kota: "Jakarta",
    radius_layanan: 18
  },
  {
    id: 12,
    nama: "Irfan Hakim",
    nik: "3276122002930012",
    keahlian: "Tukang AC",
    keahlian_tambahan: "Bongkar Pasang AC, Service Kompresor",
    tahun_pengalaman: 5,
    deskripsi_pengalaman: "Teknisi AC handal melayani cuci rutin, bongkar pasang, dan perbaikan AC mati.",
    alamat: "Jl. Raya Citayam, Depok",
    latitude: -6.4489,
    longitude: 106.7997,
    foto_profil: "https://ui-avatars.com/api/?name=Irfan+Hakim&background=random",
    foto_ktp: "https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=600&auto=format&fit=crop",
    cv_portofolio: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    status_verifikasi: "Menunggu",
    created_at: "2026-07-04T19:25:00Z",
    no_hp: "083345678901",
    user: { email: "irfan.hakim@gmail.com" },
    kota: "Depok",
    radius_layanan: 10
  }
];

function VerifikasiTukang() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Data states
  const [tukangList, setTukangList] = useState([]);
  const [selectedTukang, setSelectedTukang] = useState(null);

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [keahlianFilter, setKeahlianFilter] = useState("Semua");
  const [dateFilter, setDateFilter] = useState("Semua");
  const [kotaFilter, setKotaFilter] = useState("Semua");
  const [radiusFilter, setRadiusFilter] = useState("Semua");
  const [sortOption, setSortOption] = useState("Terbaru");

  // NIK Visibility map state
  const [visibleNiks, setVisibleNiks] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Detail Modal internal States
  const [checklist, setChecklist] = useState({
    nikValid: false,
    fotoProfilSesuai: false,
    cvValid: false,
    lokasiDipilih: false
  });

  // Action Modals State
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("Foto KTP buram");
  const [otherRejectionReason, setOtherRejectionReason] = useState("");

  // Document Lightbox & PDF preview states
  const [zoomedImage, setZoomedImage] = useState(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [pdfPreviewName, setPdfPreviewName] = useState("");

  // Toast State
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToastMessage = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetching all Tukangs to populate queue and allow filters (using the backend list)
      const res = await axios.get("http://localhost:8000/api/admin/tukang");
      if (res.data.status === "Sukses") {
        setTukangList(res.data.data);
      } else {
        setTukangList(MOCK_VERIFIKASI);
      }
    } catch (e) {
      console.error("Backend offline or error, falling back to mock data:", e);
      setTukangList(MOCK_VERIFIKASI);
    }
  };

  // Mask NIK helper: 327601******0001
  const maskNik = (nik) => {
    if (!nik || nik.length < 16) return "327601******0001";
    return `${nik.slice(0, 6)}******${nik.slice(12)}`;
  };

  const toggleNikVisibility = (id) => {
    setVisibleNiks(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Checklist handler
  const handleChecklistChange = (key) => {
    setChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isChecklistComplete = Object.values(checklist).every(val => val === true);

  // Approval Submission handler
  const handleApproveConfirm = async () => {
    if (!selectedTukang) return;
    try {
      const response = await axios.put(`http://localhost:8000/api/admin/verifikasi/${selectedTukang.id}`, {
        action: "approve"
      });
      if (response.data.status === "Sukses") {
        showToastMessage("Berhasil disetujui.", "success");
      } else {
        showToastMessage("Berhasil disetujui (Offline Mode).", "success");
      }
    } catch (e) {
      showToastMessage("Berhasil disetujui (Offline Mode).", "success");
    }

    // Update local state to reflect approved status
    setTukangList(prev => prev.map(item => {
      if (item.id === selectedTukang.id) {
        return { ...item, status_verifikasi: "Aktif" };
      }
      return item;
    }));

    setIsApprovalModalOpen(false);
    setSelectedTukang(null);
  };

  // Rejection Submission handler
  const handleRejectConfirm = async () => {
    if (!selectedTukang) return;
    const finalReason = rejectionReason === "Lainnya" ? otherRejectionReason : rejectionReason;
    if (!finalReason.trim()) {
      alert("Masukkan alasan penolakan.");
      return;
    }

    try {
      const response = await axios.put(`http://localhost:8000/api/admin/verifikasi/${selectedTukang.id}`, {
        action: "reject",
        reason: finalReason
      });
      if (response.data.status === "Sukses") {
        showToastMessage("Pendaftaran berhasil ditolak.", "error");
      } else {
        showToastMessage("Pendaftaran berhasil ditolak (Offline Mode).", "error");
      }
    } catch (e) {
      showToastMessage("Pendaftaran berhasil ditolak (Offline Mode).", "error");
    }

    // Update local state to reflect rejected status
    setTukangList(prev => prev.map(item => {
      if (item.id === selectedTukang.id) {
        return { ...item, status_verifikasi: "Ditolak" };
      }
      return item;
    }));

    setIsRejectionModalOpen(false);
    setSelectedTukang(null);
  };

  // Open detail modal and reset checklist
  const openDetailModal = (item) => {
    setSelectedTukang(item);
    setChecklist({
      nikValid: false,
      fotoProfilSesuai: false,
      cvValid: false,
      lokasiDipilih: false
    });
  };

  // Filtering Logic
  const filteredTukangs = tukangList.filter((item) => {
    // 1. Search Bar: Nama, NIK, Email, Nomor HP
    const query = searchQuery.toLowerCase();
    const matchesSearch = searchQuery ? (
      item.nama.toLowerCase().includes(query) ||
      (item.nik && item.nik.includes(query)) ||
      (item.user?.email && item.user.email.toLowerCase().includes(query)) ||
      (item.no_hp && item.no_hp.includes(query))
    ) : true;

    // 2. Status Filter
    const itemStatus = item.status_verifikasi || "Menunggu";
    let matchesStatus = true;
    if (statusFilter !== "Semua") {
      if (statusFilter === "Menunggu Verifikasi") matchesStatus = itemStatus === "Menunggu";
      else if (statusFilter === "Terverifikasi") matchesStatus = itemStatus === "Aktif";
      else if (statusFilter === "Ditolak") matchesStatus = itemStatus === "Ditolak";
    }

    // 3. Keahlian Filter
    const matchesKeahlian = keahlianFilter === "Semua" || item.keahlian === keahlianFilter;

    // 4. Kota Filter
    const itemKota = item.kota || (item.alamat && item.alamat.toLowerCase().includes("depok") ? "Depok" : 
                                  item.alamat && item.alamat.toLowerCase().includes("jakarta") ? "Jakarta" : 
                                  item.alamat && item.alamat.toLowerCase().includes("bogor") ? "Bogor" : 
                                  item.alamat && item.alamat.toLowerCase().includes("tangerang") ? "Tangerang" : 
                                  item.alamat && item.alamat.toLowerCase().includes("bekasi") ? "Bekasi" : "Jakarta");
    const matchesKota = kotaFilter === "Semua" || itemKota === kotaFilter;

    // 5. Radius Kerja Filter
    const itemRadius = item.radius_layanan || 15;
    let matchesRadius = true;
    if (radiusFilter !== "Semua") {
      const limit = parseInt(radiusFilter.replace(/[^0-9]/g, ""), 10);
      matchesRadius = itemRadius <= limit;
    }

    // 6. Tanggal Registrasi Filter
    let matchesDate = true;
    if (dateFilter !== "Semua") {
      const itemDate = new Date(item.created_at);
      const now = new Date();
      const diffTime = Math.abs(now - itemDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (dateFilter === "Hari Ini") {
        matchesDate = diffDays <= 1;
      } else if (dateFilter === "Minggu Ini") {
        matchesDate = diffDays <= 7;
      } else if (dateFilter === "Bulan Ini") {
        matchesDate = diffDays <= 30;
      }
    }

    return matchesSearch && matchesStatus && matchesKeahlian && matchesKota && matchesRadius && matchesDate;
  });

  // Sorting Logic
  const sortedTukangs = [...filteredTukangs].sort((a, b) => {
    if (sortOption === "Terbaru") {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    if (sortOption === "Terlama") {
      return new Date(a.created_at) - new Date(b.created_at);
    }
    if (sortOption === "Nama A-Z") {
      return a.nama.localeCompare(b.nama);
    }
    if (sortOption === "Nama Z-A") {
      return b.nama.localeCompare(a.nama);
    }
    return 0;
  });

  // Pagination Logic
  const itemsPerPage = 10;
  const totalPages = Math.ceil(sortedTukangs.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTukangs = sortedTukangs.slice(startIndex, startIndex + itemsPerPage);

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/admin/dashboard" },
    { id: "verifikasi", label: "Verifikasi Tukang", icon: "how_to_reg", path: "/admin/verifikasi", active: true },
    { id: "data", label: "Data Tukang", icon: "engineering", path: "/admin/data" },
    { id: "pelanggan", label: "Data Pelanggan", icon: "group", path: "/admin/pelanggan" },
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

      {/* SideNavBar */}
      <aside className={`h-screen w-64 fixed left-0 top-0 bg-surface-container flex flex-col py-6 px-4 z-50 border-r border-surface-variant/20 transition-transform duration-300 lg:transition-none lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-4 mb-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary/15 rounded-lg flex items-center justify-center text-secondary border border-secondary/10 shrink-0">
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>how_to_reg</span>
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md font-bold text-secondary text-sm">TukangAja</h1>
              <p className="text-on-surface-variant font-label-sm text-[9px] tracking-widest uppercase opacity-60">Service Management</p>
            </div>
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
                    : "text-on-surface-variant hover:bg-surface-container-highest/20 hover:text-on-surface"
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
              onClick={() => setIsLogoutModalOpen(true)}
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
        {/* Top App Bar */}
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
                placeholder="Cari nama, NIK, email, atau no HP..." 
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
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
        <div className="pt-28 pb-12 px-6 md:px-12 max-w-7xl w-full mx-auto space-y-8 flex-grow page-transition">
          
          {/* Header & Main Title */}
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-on-surface">Verifikasi Pendaftaran Tukang</h1>
            <p className="text-sm text-on-surface-variant/80 font-normal mt-1">Review pendaftaran akun penyedia jasa dan verifikasi NIK identitas mereka.</p>
          </div>

          {/* Interactive Filters Grid */}
          <div className="bg-surface-container/40 p-5 rounded-2xl border border-surface-variant/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            
            {/* Status Filter */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Status</span>
              <select 
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="w-full bg-surface-container-high border border-surface-variant/15 text-on-surface text-xs rounded-xl px-3 py-2.5 outline-none font-bold"
              >
                <option value="Semua">Semua Status</option>
                <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                <option value="Terverifikasi">Terverifikasi</option>
                <option value="Ditolak">Ditolak</option>
              </select>
            </div>

            {/* Keahlian Filter */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Keahlian</span>
              <select 
                value={keahlianFilter}
                onChange={(e) => { setKeahlianFilter(e.target.value); setCurrentPage(1); }}
                className="w-full bg-surface-container-high border border-surface-variant/15 text-on-surface text-xs rounded-xl px-3 py-2.5 outline-none font-bold"
              >
                <option value="Semua">Semua Keahlian</option>
                <option value="Tukang Kayu">Tukang Kayu</option>
                <option value="Tukang Ledeng">Tukang Ledeng</option>
                <option value="Tukang Kelistrikan">Tukang Kelistrikan</option>
                <option value="Pembersih Rumah">Pembersih Rumah</option>
                <option value="Tukang Cat">Tukang Cat</option>
                <option value="Tukang AC">Tukang AC</option>
              </select>
            </div>

            {/* Tanggal Registrasi Filter */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Tanggal Daftar</span>
              <select 
                value={dateFilter}
                onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
                className="w-full bg-surface-container-high border border-surface-variant/15 text-on-surface text-xs rounded-xl px-3 py-2.5 outline-none font-bold"
              >
                <option value="Semua">Semua Waktu</option>
                <option value="Hari Ini">Hari Ini</option>
                <option value="Minggu Ini">Minggu Ini</option>
                <option value="Bulan Ini">Bulan Ini</option>
              </select>
            </div>

            {/* Kota Filter */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Kota</span>
              <select 
                value={kotaFilter}
                onChange={(e) => { setKotaFilter(e.target.value); setCurrentPage(1); }}
                className="w-full bg-surface-container-high border border-surface-variant/15 text-on-surface text-xs rounded-xl px-3 py-2.5 outline-none font-bold"
              >
                <option value="Semua">Semua Kota</option>
                <option value="Jakarta">Jakarta</option>
                <option value="Depok">Depok</option>
                <option value="Tangerang">Tangerang</option>
                <option value="Bogor">Bogor</option>
                <option value="Bekasi">Bekasi</option>
                <option value="Bandung">Bandung</option>
                <option value="Surabaya">Surabaya</option>
              </select>
            </div>

            {/* Radius Kerja Filter */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Radius Layanan</span>
              <select 
                value={radiusFilter}
                onChange={(e) => { setRadiusFilter(e.target.value); setCurrentPage(1); }}
                className="w-full bg-surface-container-high border border-surface-variant/15 text-on-surface text-xs rounded-xl px-3 py-2.5 outline-none font-bold"
              >
                <option value="Semua">Semua Jangkauan</option>
                <option value="<= 10 km">&lt;= 10 km</option>
                <option value="<= 15 km">&lt;= 15 km</option>
                <option value="<= 20 km">&lt;= 20 km</option>
                <option value="<= 25 km">&lt;= 25 km</option>
              </select>
            </div>

          </div>

          {/* Sorting and Search Stats Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <span className="text-xs text-on-surface-variant/80">
              Ditemukan <span className="font-bold text-secondary">{sortedTukangs.length}</span> pendaftaran tukang
            </span>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-on-surface-variant font-bold uppercase">Urutkan</span>
              <select 
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-surface-container border border-surface-variant/20 text-on-surface text-xs rounded-xl px-3 py-2 font-bold outline-none cursor-pointer"
              >
                <option value="Terbaru">Registrasi Terbaru</option>
                <option value="Terlama">Registrasi Terlama</option>
                <option value="Nama A-Z">Nama A-Z</option>
                <option value="Nama Z-A">Nama Z-A</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-surface-container/60 border border-surface-variant/15 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-container-high/35 text-on-surface-variant uppercase text-[9px] font-bold tracking-widest border-b border-surface-variant/15">
                    <th className="px-6 py-4">Nama Lengkap</th>
                    <th className="px-6 py-4">NIK (Nomor Induk Kependudukan)</th>
                    <th className="px-6 py-4">Keahlian</th>
                    <th className="px-6 py-4">Tanggal Daftar</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant/10 font-medium">
                  {paginatedTukangs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-on-surface-variant/65">
                        <span className="material-symbols-outlined text-3xl mb-1.5 text-secondary/45">search_off</span>
                        <p className="text-xs font-semibold">Tidak ada pendaftar tukang yang cocok.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedTukangs.map((item) => {
                      const isMasked = !visibleNiks[item.id];
                      const displayNik = isMasked ? maskNik(item.nik) : item.nik;
                      const statusVal = item.status_verifikasi || "Menunggu";

                      return (
                        <tr key={item.id} className="border-b border-surface-variant/10 hover:bg-surface-container-high/20 transition-colors">
                          {/* Nama Lengkap */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-surface-container-highest border border-surface-variant/20 overflow-hidden shrink-0">
                                <img 
                                  className="w-full h-full object-cover" 
                                  alt={item.nama} 
                                  src={item.foto_profil ? (item.foto_profil.startsWith("http") ? item.foto_profil : `http://localhost:8000/storage/${item.foto_profil}`) : `https://ui-avatars.com/api/?name=${item.nama}&background=random`} 
                                />
                              </div>
                              <div>
                                <span className="block font-bold text-sm text-on-surface">{item.nama}</span>
                                <span className="block text-[9px] text-on-surface-variant/65 font-mono">ID: TKG-{item.id}</span>
                              </div>
                            </div>
                          </td>

                          {/* NIK with Visibility Toggle */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-on-surface tracking-wider">{displayNik}</span>
                              <button 
                                onClick={() => toggleNikVisibility(item.id)}
                                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-highest transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
                                title={isMasked ? "Tampilkan NIK" : "Sembunyikan NIK"}
                              >
                                <span className="material-symbols-outlined text-[16px]">{isMasked ? "visibility" : "visibility_off"}</span>
                              </button>
                            </div>
                          </td>

                          {/* Keahlian */}
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-0.5 rounded-full border border-secondary/20 bg-secondary/10 text-secondary text-[10px] font-bold">
                              {item.keahlian}
                            </span>
                          </td>

                          {/* Tanggal Daftar */}
                          <td className="px-6 py-4 text-on-surface-variant font-medium">
                            {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            {statusVal === "Menunggu" ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-bold flex items-center gap-1.5 w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
                                Menunggu Verifikasi
                              </span>
                            ) : statusVal === "Aktif" ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold flex items-center gap-1.5 w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                Terverifikasi
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold flex items-center gap-1.5 w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                Ditolak
                              </span>
                            )}
                          </td>

                          {/* Aksi */}
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => openDetailModal(item)}
                              className="px-4 py-2 rounded-xl bg-secondary text-on-secondary text-xs font-bold border-none cursor-pointer shadow-md shadow-secondary/15 hover:brightness-105 active:scale-[0.98] transition-all"
                            >
                              Lihat Detail
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-5 border-t border-surface-variant/15 flex items-center justify-between bg-surface-container-high/20">
              <span className="text-xs text-on-surface-variant font-medium">
                Menampilkan {sortedTukangs.length > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + itemsPerPage, sortedTukangs.length)} dari {sortedTukangs.length} pendaftar
              </span>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-surface-variant/20 text-on-surface-variant bg-transparent cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
                
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold border-none cursor-pointer ${currentPage === idx + 1 ? "bg-secondary text-on-secondary shadow-md" : "bg-transparent border border-surface-variant/20 text-on-surface-variant"}`}
                  >
                    {idx + 1}
                  </button>
                ))}

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-surface-variant/20 text-on-surface-variant bg-transparent cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* 4-CARD DETAIL MODAL */}
      {selectedTukang && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-surface-container w-full max-w-5xl rounded-3xl border border-surface-variant/20 shadow-2xl p-6 relative max-h-[92vh] overflow-y-auto animate-fade-in flex flex-col gap-6">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-surface-variant/15">
              <div>
                <h3 className="text-lg md:text-xl font-black text-on-surface">Detail Registrasi &amp; Verifikasi Tukang</h3>
                <p className="text-xs text-on-surface-variant mt-1">Review detail biodata, peta lokasi, dokumen verifikasi, dan isi checklist kelayakan.</p>
              </div>
              <div className="flex items-center gap-3">
                {selectedTukang.status_verifikasi === "Menunggu" ? (
                  <span className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-extrabold">
                    Menunggu Verifikasi
                  </span>
                ) : selectedTukang.status_verifikasi === "Aktif" ? (
                  <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-extrabold">
                    Terverifikasi
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-extrabold">
                    Ditolak
                  </span>
                )}
                <button 
                  onClick={() => setSelectedTukang(null)}
                  className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-highest cursor-pointer border-none bg-transparent flex items-center justify-center"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* Modal Body: Two-Column Bento Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto pr-1">
              
              {/* Left Column (7 cols): Cards 1, 2, and 3 */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Card 1: Identitas */}
                <div className="bg-surface-container-high/40 p-5 rounded-2xl border border-surface-variant/15 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">person</span>
                    Card 1: Identitas Profil
                  </h4>
                  
                  <div className="flex flex-col sm:flex-row gap-5 items-start">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-surface-variant/20 shadow-md">
                      <img 
                        className="w-full h-full object-cover" 
                        alt={selectedTukang.nama} 
                        src={selectedTukang.foto_profil ? (selectedTukang.foto_profil.startsWith("http") ? selectedTukang.foto_profil : `http://localhost:8000/storage/${selectedTukang.foto_profil}`) : `https://ui-avatars.com/api/?name=${selectedTukang.nama}&background=random`} 
                      />
                    </div>
                    
                    <div className="space-y-2 flex-grow text-xs">
                      <div>
                        <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Nama Lengkap</span>
                        <span className="text-sm font-bold text-on-surface">{selectedTukang.nama}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">NIK</span>
                          <span className="font-mono font-bold text-on-surface tracking-wider">{selectedTukang.nik}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Tanggal Registrasi</span>
                          <span className="font-bold text-on-surface">
                            {new Date(selectedTukang.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">WhatsApp</span>
                          <span className="font-bold text-on-surface flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px] text-green-400">phone</span>
                            {selectedTukang.no_hp}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Email</span>
                          <span className="font-bold text-on-surface flex items-center gap-1.5 truncate">
                            <span className="material-symbols-outlined text-[14px] text-blue-400">mail</span>
                            {selectedTukang.user?.email || "-"}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Card 2: Keahlian */}
                <div className="bg-surface-container-high/40 p-5 rounded-2xl border border-surface-variant/15 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">construction</span>
                    Card 2: Spesialisasi &amp; Pengalaman
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Kategori Jasa Utama</span>
                      <span className="font-bold text-on-surface block mt-0.5">{selectedTukang.keahlian}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Tahun Pengalaman</span>
                      <span className="font-bold text-on-surface block mt-0.5">{selectedTukang.tahun_pengalaman} Tahun</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Radius Kerja Layanan</span>
                      <span className="font-bold text-on-surface block mt-0.5">{selectedTukang.radius_layanan || 15} km</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Keahlian Tambahan</span>
                      <span className="font-bold text-on-surface block mt-0.5">{selectedTukang.keahlian_tambahan || "-"}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Deskripsi Pengalaman</span>
                      <p className="text-on-surface-variant mt-1 leading-relaxed">{selectedTukang.deskripsi_pengalaman || "Tidak ada deskripsi."}</p>
                    </div>
                  </div>
                </div>

                {/* Card 3: Lokasi */}
                <div className="bg-surface-container-high/40 p-5 rounded-2xl border border-surface-variant/15 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">distance</span>
                    Card 3: Lokasi Area Cakupan
                  </h4>
                  
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Alamat Lengkap</span>
                      <span className="font-medium text-on-surface leading-relaxed block mt-0.5">{selectedTukang.alamat}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Latitude</span>
                        <span className="font-mono text-on-surface font-semibold">{selectedTukang.latitude || "-"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Longitude</span>
                        <span className="font-mono text-on-surface font-semibold">{selectedTukang.longitude || "-"}</span>
                      </div>
                    </div>

                    {/* Leaflet Map Preview */}
                    {selectedTukang.latitude && selectedTukang.longitude && (
                      <div key={selectedTukang.id} className="h-48 w-full rounded-xl overflow-hidden border border-outline-variant/30 relative mt-2 z-10">
                        <MapContainer
                          center={[selectedTukang.latitude, selectedTukang.longitude]}
                          zoom={13}
                          scrollWheelZoom={false}
                          style={{ height: "100%", width: "100%" }}
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <Marker position={[selectedTukang.latitude, selectedTukang.longitude]}>
                            <Popup>{selectedTukang.nama}</Popup>
                          </Marker>
                        </MapContainer>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column (5 cols): Card 4 (Documents), Checklist, and Actions */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Card 4: Dokumen Verifikasi */}
                <div className="bg-surface-container-high/40 p-5 rounded-2xl border border-surface-variant/15 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">folder</span>
                    Card 4: Dokumen Verifikasi
                  </h4>
                  
                  <div className="space-y-4">
                    {/* CV / Portfolio Document */}
                    <div>
                      <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block mb-2">CV &amp; Portofolio Kerja</span>
                      <div className="border border-surface-variant/20 rounded-xl p-3.5 flex items-center justify-between bg-surface-container-high/60">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="material-symbols-outlined text-red-400 text-3xl shrink-0">picture_as_pdf</span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-on-surface truncate">Dokumen_CV_Portofolio.pdf</p>
                            <p className="text-[9px] text-on-surface-variant/70 mt-0.5">Format PDF • Verified</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 shrink-0">
                          <button 
                            onClick={() => { setPdfPreviewUrl(selectedTukang.cv_portofolio); setPdfPreviewName("Dokumen_CV_Portofolio.pdf"); }}
                            className="p-2 text-secondary hover:bg-secondary/15 rounded-lg transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
                            title="Lihat Dokumen"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                          </button>
                          
                          <a 
                            href={selectedTukang.cv_portofolio}
                            download
                            className="p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                            title="Unduh PDF"
                          >
                            <span className="material-symbols-outlined text-sm">download</span>
                          </a>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Checklist Verifikasi */}
                <div className="bg-surface-container-high/40 p-5 rounded-2xl border border-surface-variant/15 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">rule</span>
                    Checklist Verifikasi Data
                  </h4>
                  
                  <p className="text-[10px] text-on-surface-variant/70 leading-relaxed">
                    Periksa semua data di atas dengan teliti. Dapatkan kecocokan 100% dan centang seluruh poin sebelum menyetujui akun.
                  </p>

                  <div className="space-y-2.5 pt-2">
                    {/* Item 1 */}
                    <label className="flex items-center gap-3 cursor-pointer select-none text-xs font-bold text-on-surface">
                      <input 
                        type="checkbox" 
                        checked={checklist.nikValid}
                        onChange={() => handleChecklistChange("nikValid")}
                        className="w-4 h-4 rounded text-secondary focus:ring-secondary border-surface-variant/30 bg-surface-container-highest"
                      />
                      <span>NIK Valid (16 Digit Angka)</span>
                    </label>

                    {/* Item 2 */}
                    <label className="flex items-center gap-3 cursor-pointer select-none text-xs font-bold text-on-surface">
                      <input 
                        type="checkbox" 
                        checked={checklist.fotoProfilSesuai}
                        onChange={() => handleChecklistChange("fotoProfilSesuai")}
                        className="w-4 h-4 rounded text-secondary focus:ring-secondary border-surface-variant/30 bg-surface-container-highest"
                      />
                      <span>Foto Profil Valid</span>
                    </label>

                    {/* Item 3 */}
                    <label className="flex items-center gap-3 cursor-pointer select-none text-xs font-bold text-on-surface">
                      <input 
                        type="checkbox" 
                        checked={checklist.cvValid}
                        onChange={() => handleChecklistChange("cvValid")}
                        className="w-4 h-4 rounded text-secondary focus:ring-secondary border-surface-variant/30 bg-surface-container-highest"
                      />
                      <span>CV &amp; Portofolio Valid</span>
                    </label>

                    {/* Item 4 */}
                    <label className="flex items-center gap-3 cursor-pointer select-none text-xs font-bold text-on-surface">
                      <input 
                        type="checkbox" 
                        checked={checklist.lokasiDipilih}
                        onChange={() => handleChecklistChange("lokasiDipilih")}
                        className="w-4 h-4 rounded text-secondary focus:ring-secondary border-surface-variant/30 bg-surface-container-highest"
                      />
                      <span>Lokasi Cakupan Telah Sesuai</span>
                    </label>
                  </div>
                </div>

                {/* Verification Actions */}
                {selectedTukang.status_verifikasi === "Menunggu" && (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setIsRejectionModalOpen(true)}
                      className="flex-1 py-3 border border-red-500/30 text-red-400 text-xs font-bold rounded-xl bg-transparent hover:bg-red-500/10 cursor-pointer transition-colors"
                    >
                      Tolak
                    </button>
                    
                    <button 
                      disabled={!isChecklistComplete}
                      onClick={() => setIsApprovalModalOpen(true)}
                      className={`flex-1 py-3 text-xs font-bold rounded-xl border-none cursor-pointer shadow-md transition-all ${isChecklistComplete ? "bg-secondary text-on-secondary shadow-secondary/15 hover:brightness-105" : "bg-surface-container-highest text-on-surface-variant/40 cursor-not-allowed shadow-none"}`}
                    >
                      Setujui
                    </button>
                  </div>
                )}

              </div>

            </div>

          </div>
        </div>
      )}

      {/* APPROVAL CONFIRMATION MODAL */}
      {isApprovalModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container w-full max-w-md rounded-2xl border border-surface-variant/20 shadow-2xl p-6 space-y-4">
            <h4 className="text-on-surface font-extrabold text-base flex items-center gap-2 text-secondary">
              <span className="material-symbols-outlined">how_to_reg</span>
              Setujui Verifikasi Tukang?
            </h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Pastikan seluruh data identitas telah sesuai sebelum menyetujui akun ini.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button 
                onClick={() => setIsApprovalModalOpen(false)}
                className="px-4 py-2 border border-surface-variant/20 text-on-surface-variant text-xs font-bold bg-transparent rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button 
                onClick={handleApproveConfirm}
                className="px-5 py-2 bg-secondary text-on-secondary text-xs font-bold rounded-lg border-none shadow-md cursor-pointer hover:brightness-105"
              >
                Setujui
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {isRejectionModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container w-full max-w-md rounded-2xl border border-surface-variant/20 shadow-2xl p-6 space-y-4">
            <h4 className="text-on-surface font-extrabold text-base flex items-center gap-2 text-red-400">
              <span className="material-symbols-outlined">block</span>
              Tolak Verifikasi Pendaftaran
            </h4>
            
            <div className="space-y-3 text-xs">
              <label className="block font-bold text-on-surface-variant">Pilih Alasan Penolakan</label>
              <select 
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-surface-container-high border border-surface-variant/20 text-on-surface rounded-xl px-3 py-2.5 outline-none font-bold"
              >
                <option value="Foto KTP buram">Foto KTP buram</option>
                <option value="NIK tidak valid">NIK tidak valid</option>
                <option value="Dokumen tidak lengkap">Dokumen tidak lengkap</option>
                <option value="Data tidak sesuai">Data tidak sesuai</option>
                <option value="Keahlian tidak sesuai">Keahlian tidak sesuai</option>
                <option value="Lainnya">Lainnya (Tulis Kustom)</option>
              </select>

              {rejectionReason === "Lainnya" && (
                <div className="space-y-1 pt-1 animate-slide-in">
                  <label className="block font-bold text-on-surface-variant/80">Alasan Kustom</label>
                  <textarea 
                    value={otherRejectionReason}
                    onChange={(e) => setOtherRejectionReason(e.target.value)}
                    placeholder="Masukkan alasan penolakan secara detail..."
                    rows={3}
                    className="w-full bg-surface-container-high border border-surface-variant/20 rounded-xl p-3 text-on-surface outline-none placeholder:text-on-surface-variant/30"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button 
                onClick={() => setIsRejectionModalOpen(false)}
                className="px-4 py-2 border border-surface-variant/20 text-on-surface-variant text-xs font-bold bg-transparent rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button 
                onClick={handleRejectConfirm}
                className="px-5 py-2 bg-red-500 text-white text-xs font-bold rounded-lg border-none shadow-md cursor-pointer hover:bg-red-600"
              >
                Tolak Pendaftaran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ZOOMABLE IMAGE MODAL (LIGHTBOX) */}
      {zoomedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="absolute inset-0" onClick={() => setZoomedImage(null)}></div>
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col items-center justify-center z-10 gap-4">
            
            <div className="overflow-auto max-w-full max-h-[75vh] flex items-center justify-center bg-black/20 p-2 rounded-xl">
              <img 
                style={{ transform: `scale(${zoomScale})`, transition: "transform 0.2s" }}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                src={zoomedImage}
                alt="Zoomed Preview"
              />
            </div>

            {/* Control Bar */}
            <div className="bg-surface-container-high/90 backdrop-blur border border-surface-variant/20 px-6 py-2.5 rounded-full flex items-center gap-5 shadow-2xl z-20">
              <button 
                onClick={() => setZoomScale(prev => Math.min(prev + 0.25, 3))}
                className="p-1.5 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer bg-transparent border-none flex items-center justify-center"
                title="Perbesar"
              >
                <span className="material-symbols-outlined">zoom_in</span>
              </button>
              
              <button 
                onClick={() => setZoomScale(prev => Math.max(prev - 0.25, 0.5))}
                className="p-1.5 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer bg-transparent border-none flex items-center justify-center"
                title="Perkecil"
              >
                <span className="material-symbols-outlined">zoom_out</span>
              </button>

              <button 
                onClick={() => setZoomScale(1)}
                className="p-1.5 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer bg-transparent border-none flex items-center justify-center"
                title="Reset Zoom"
              >
                <span className="material-symbols-outlined">restart_alt</span>
              </button>

              <div className="w-[1px] h-4 bg-surface-variant/30"></div>

              <button 
                onClick={() => setZoomedImage(null)}
                className="p-1.5 text-red-400 hover:text-red-300 transition-colors cursor-pointer bg-transparent border-none flex items-center justify-center font-bold"
                title="Tutup"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PDF PREVIEW MODAL */}
      {pdfPreviewUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-surface-container w-full max-w-4xl h-[85vh] rounded-2xl border border-surface-variant/20 shadow-2xl flex flex-col overflow-hidden animate-fade-in">
            <div className="p-4 bg-surface-container-high border-b border-surface-variant/15 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-400">picture_as_pdf</span>
                <h4 className="font-bold text-sm text-on-surface">Preview Dokumen: {pdfPreviewName}</h4>
              </div>
              <button 
                onClick={() => { setPdfPreviewUrl(null); setPdfPreviewName(""); }}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer bg-transparent border-none flex items-center justify-center p-1 hover:bg-surface-container-highest rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 bg-surface-container-low p-4 flex items-center justify-center overflow-hidden">
              <iframe 
                src={pdfPreviewUrl} 
                className="w-full h-full rounded-xl border-none bg-white" 
                title="PDF Viewer" 
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification Bar */}
      {toast.show && (
        <div className={`fixed bottom-6 right-8 left-6 md:left-[calc(256px+32px)] flex justify-between items-center py-3.5 px-6 rounded-2xl shadow-2xl z-[110] animate-slide-in ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-white">
              {toast.type === "success" ? "check_circle" : "error"}
            </span>
            <p className="text-sm font-extrabold text-white">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Logout Confirmation */}
      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={() => navigate("/")} 
        role="admin" 
      />

    </div>
  );
}

export default VerifikasiTukang;
