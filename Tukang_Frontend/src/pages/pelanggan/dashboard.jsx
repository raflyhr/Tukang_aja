import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoutModal from "../../components/LogoutModal";
import axios from "axios";


function Dashboard() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [tukangs, setTukangs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [bannerSearchQuery, setBannerSearchQuery] = useState("");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [tukangFilter, setTukangFilter] = useState("terdekat"); // "terdekat" | "rating" | "pekerjaan"

  // Filter & Sort State variables for Halaman Daftar Tukang
  const [filterDistance, setFilterDistance] = useState("all");
  const [filterRating, setFilterRating] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPrice, setFilterPrice] = useState("all");
  const [filterExp, setFilterExp] = useState("all");
  const [filterSpecialty, setFilterSpecialty] = useState("all");
  const [sortingOption, setSortingOption] = useState("terdekat");

  // Detail Page active tab state
  const [detailTab, setDetailTab] = useState("profil");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Marketplace sub-navigation states:
  // "home" | "category" | "service" | "tukang" | "search-results"
  const [viewState, setViewState] = useState("home");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedTukang, setSelectedTukang] = useState(null);

  // Booking Form States
  const [bookingDesc, setBookingDesc] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("QRIS");
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const [dashboardStats, setDashboardStats] = useState({ pesanan_aktif: "00", pekerjaan_selesai: "00", total_pengeluaran: 0 });

  const getOrders = async (userId) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user/${userId}/pesanan`);
      setOrders(res.data.data || []);
      
      const statsRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user/${userId}/dashboard-stats`);
      if (statsRes.data.status === "Sukses") {
        setDashboardStats(statsRes.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch user data", error);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("pelanggan_user");
    let userObj = null;
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        userObj = parsed.user || parsed;
        setUser(userObj);
        getOrders(userObj.id);
      } catch (e) {
        console.error(e);
      }
    }
    getTukangs(userObj);
  }, []);

  const getTukangs = async (userObj) => {
    try {
        let url = `${import.meta.env.VITE_API_BASE_URL}/api/tukang`;
        if (userObj && userObj.latitude && userObj.longitude) {
            url += `?latitude=${userObj.latitude}&longitude=${userObj.longitude}`;
        }
        const res = await axios.get(url);
        setTukangs(res.data.data || []);
    } catch (err) {
        console.error("Gagal load tukang", err);
    } finally {
        setLoading(false);
    }
  };

  // Active Orders (calculated dynamically from orders state)
  const activeOrders = orders
    .filter(o => o.status !== "selesai" && o.status !== "batal" && o.status !== "ditolak")
    .map(o => {
      let formattedDate = "Baru Saja";
      if (o.created_at) {
        const d = new Date(o.created_at);
        formattedDate = d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
      }

      const cost = o.harga_penawaran ? `Rp ${o.harga_penawaran.toLocaleString("id-ID")}` : "Menunggu Penawaran";

      return {
        id: `ORD-${o.id}`,
        service: o.kategori_layanan || o.judul || "Jasa Perbaikan",
        tukang: o.tukang ? (o.tukang.nama || o.tukang.name) : "Belum Ada",
        date: formattedDate,
        cost: cost,
        status: o.status === "menunggu" ? "Menunggu Konfirmasi" : o.status === "diterima" ? "Dalam Proses" : o.status,
        statusColor: "text-secondary bg-secondary/10 border-secondary/20",
      };
    });

  const totalPengeluaran = orders
    .filter(o => o.status === "selesai")
    .reduce((sum, o) => sum + (o.harga_penawaran || 0), 0);

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/pelanggan/dashboard", active: true },
    { id: "pesanan", label: "Pesanan Saya", icon: "receipt_long", path: "/pelanggan/pesanan" },
    { id: "chat", label: "Chat", icon: "chat", path: "/pelanggan/chat" },
    { id: "pembayaran", label: "Pembayaran", icon: "payments", path: "/pelanggan/pembayaran" },
    { id: "profil", label: "Profil", icon: "person", path: "/pelanggan/profil" },
  ];

  const categories = [
    { id: "listrik", label: "Listrik", icon: "bolt", desc: "Instalasi & perbaikan listrik" },
    { id: "ac", label: "AC", icon: "ac_unit", desc: "Cuci, tambah freon & pasang AC" },
    { id: "pipa", label: "Pipa & Air", icon: "plumbing", desc: "Saluran air, keran & pompa" },
    { id: "cat", label: "Cat Rumah", icon: "format_paint", desc: "Cat interior & eksterior" },
    { id: "atap", label: "Atap Rumah", icon: "roofing", desc: "Perbaikan genteng & dak bocor" },
    { id: "pertukangan", label: "Pertukangan", icon: "carpenter", desc: "Pintu, kusen & furnitur kayu" },
    { id: "pindahan", label: "Pindahan Rumah", icon: "local_shipping", desc: "Jasa angkut & packing pindahan" },
    { id: "kebersihan", label: "Kebersihan Rumah", icon: "cleaning_services", desc: "Cuci kasur, sofa & sapu pel harian" },
  ];

  const subServices = {
    listrik: [
      { id: "l1", name: "Instalasi Lampu Baru", price: "Rp 50.000 / titik", desc: "Pemasangan kabel dan dudukan lampu baru secara rapi." },
      { id: "l2", name: "Perbaikan Konsleting Listrik", price: "Rp 150.000 / jam", desc: "Deteksi dan perbaikan arus pendek atau sekring rumah yang sering putus." },
      { id: "l3", name: "Pasang Stop Kontak / Saklar", price: "Rp 35.000 / unit", desc: "Pemasangan stop kontak tambahan atau penggantian saklar rusak." },
    ],
    ac: [
      { id: "a1", name: "Cuci AC (0.5 - 2 PK)", price: "Rp 75.000 / unit", desc: "Pembersihan filter, evaporator, dan outdoor unit agar AC kembali dingin." },
      { id: "a2", name: "Isi & Tambah Freon R32/R410", price: "Rp 150.000 / unit", desc: "Pengisian freon AC sesuai takaran standar kompresor." },
      { id: "a3", name: "Bongkar Pasang AC Baru/Bekas", price: "Rp 350.000 / unit", desc: "Jasa pencopotan dan pemasangan kembali AC di lokasi baru." },
    ],
    pipa: [
      { id: "p1", name: "Perbaikan Pipa Bocor", price: "Rp 100.000 - Rp 250.000", desc: "Deteksi titik kebocoran pipa air bersih/kotor dan penyambungan ulang." },
      { id: "p2", name: "Pasang Keran / Wastafel", price: "Rp 80.000 / unit", desc: "Pemasangan keran baru, wastafel cuci piring, atau cuci tangan." },
      { id: "p3", name: "Pembersihan Toren Air", price: "Rp 200.000 / unit", desc: "Pembersihan lumut dan kotoran pada tangki penampungan air." },
    ],
    cat: [
      { id: "c1", name: "Cat Tembok Interior", price: "Rp 25.000 / m²", desc: "Pengecatan dinding dalam rumah dengan cat berkualitas." },
      { id: "c2", name: "Cat Tembok Eksterior", price: "Rp 35.000 / m²", desc: "Pengecatan dinding luar rumah tahan cuaca ekstrim." },
      { id: "c3", name: "Cat Plafon/Langit-langit", price: "Rp 20.000 / m²", desc: "Pengecatan plafon gypsum atau triplek rumah." },
    ],
    atap: [
      { id: "r1", name: "Tambal Genteng Bocor", price: "Rp 150.000 / titik", desc: "Pencarian dan penambalan genteng pecah atau bergeser penyebab bocor." },
      { id: "r2", name: "Waterproofing Dak Beton", price: "Rp 75.000 / m²", desc: "Pelapisan cat anti-bocor pada dak semen eksterior." },
      { id: "r3", name: "Pemasangan Talang Air", price: "Rp 90.000 / meter", desc: "Pemasangan talang air PVC atau seng untuk pembuangan air hujan." },
    ],
    pertukangan: [
      { id: "k1", name: "Perbaikan Daun Pintu / Kusen", price: "Rp 200.000 / unit", desc: "Penyetelan daun pintu seret atau kusen kropos dimakan rayap." },
      { id: "k2", name: "Perakitan Furnitur / Lemari", price: "Rp 150.000 / unit", desc: "Jasa perakitan meja, kursi, tempat tidur, atau lemari knockdown." },
      { id: "k3", name: "Pembuatan Sekat Ruangan Gypsum", price: "Rp 300.000 / m²", desc: "Pemasangan dinding partisi gypsum dengan rangka besi hollow." },
    ],
    pindahan: [
      { id: "s1", name: "Pindahan Kost (Pickup)", price: "Rp 300.000", desc: "Pindahan barang kost menggunakan mobil pickup terbuka/bak." },
      { id: "s2", name: "Pindahan Rumah (Truk Engkel)", price: "Rp 800.000", desc: "Pindahan rumah dengan kapasitas barang besar menggunakan truk engkel box." },
      { id: "s3", name: "Jasa Packing & Bongkar Muat", price: "Rp 250.000", desc: "Bantuan pembungkusan bubble wrap dan pengangkutan barang masuk/keluar armada." },
    ],
    kebersihan: [
      { id: "cl1", name: "Deep Cleaning Pasca Renovasi", price: "Rp 15.000 / m²", desc: "Pembersihan menyeluruh noda cat, debu tebal, semen, dan sisa bahan bangunan." },
      { id: "cl2", name: "Cuci Sofa / Kasur / Karpet", price: "Rp 80.000 / seat", desc: "Pembersihan noda, tungau, dan bakteri menggunakan alat vacum wet & dry." },
      { id: "cl3", name: "Pembersihan Harian Rumah (2 Jam)", price: "Rp 100.000", desc: "Pekerjaan rumah tangga standar seperti menyapu, mengepel, mengelap meja." },
    ],
  };

  const getMappedTukangs = () => {
    if (!tukangs || tukangs.length === 0) return [];
    return tukangs.map(t => {
      const keahlianLower = (t.keahlian || "").toLowerCase();
      let specialty = "listrik"; // default
      if (keahlianLower.includes("pipa") || keahlianLower.includes("air") || keahlianLower.includes("plumbing")) {
        specialty = "pipa";
      } else if (keahlianLower.includes("ac") || keahlianLower.includes("pendingin")) {
        specialty = "ac";
      } else if (keahlianLower.includes("cat") || keahlianLower.includes("tembok")) {
        specialty = "cat";
      } else if (keahlianLower.includes("atap") || keahlianLower.includes("genteng")) {
        specialty = "atap";
      } else if (keahlianLower.includes("kayu") || keahlianLower.includes("pertukangan") || keahlianLower.includes("pintu")) {
        specialty = "pertukangan";
      } else if (keahlianLower.includes("pindahan") || keahlianLower.includes("angkut")) {
        specialty = "pindahan";
      } else if (keahlianLower.includes("bersih") || keahlianLower.includes("sapu") || keahlianLower.includes("kasur") || keahlianLower.includes("sofa")) {
        specialty = "kebersihan";
      }

      let image = "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=200&auto=format&fit=crop";
      if (t.foto_profil) {
        image = t.foto_profil.startsWith("http") ? t.foto_profil : `${import.meta.env.VITE_API_BASE_URL}/storage/${t.foto_profil}`;
      }

      let distance = t.distance !== undefined ? `${parseFloat(Number(t.distance).toFixed(1))} km` : "Aktifkan GPS / Update Profil";
      let distanceValue = t.distance !== undefined ? parseFloat(Number(t.distance).toFixed(1)) : 999;

      return {
        id: t.id,
        name: t.nama || "Tukang",
        specialty: specialty,
        specialtyText: t.keahlian || "Teknisi Jasa",
        distance: distance,
        distanceValue: distanceValue,
        rating: t.rating !== undefined && t.rating !== null ? parseFloat(t.rating) : 0,
        completedJobs: t.completed_jobs_count || 0,
        image: image,
        status: t.is_aktif ? "Tersedia" : "Sibuk",
        bio: t.deskripsi_pengalaman || "Penyedia jasa terverifikasi.",
        price: 100000 + (t.tahun_pengalaman * 15000),
        priceFormatted: `Rp ${(100000 + (t.tahun_pengalaman * 15000)).toLocaleString("id-ID")}/jam`,
        experience: t.tahun_pengalaman || 2,
        sertifikats: t.sertifikats || [],
        layanans: t.layanans || [],
        portofolios: t.portofolios || [],
        ulasans: t.ulasans || []
      };
    });
  };

  const recommendedTukang = getMappedTukangs();

  // Helper: Get matching Tukangs based on category ID
  const getTukangsForCategory = (catId) => {
    return recommendedTukang.filter(t => t.specialty === catId);
  };

  // Trigger search from input
  const handleSearchSubmit = (query) => {
    setSearchQuery(query);
    setViewState("category");
    window.scrollTo(0, 0);
  };

  // Handle Category Select
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setFilterSpecialty(category.id);
    setSearchQuery("");
    setViewState("category");
    window.scrollTo(0, 0);
  };

  // Handle Service Select
  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setViewState("service");
    window.scrollTo(0, 0);
  };

  // Handle Tukang Select
  const handleTukangSelect = (tukang) => {
    setSelectedTukang(tukang);
    setViewState("tukang");
    window.scrollTo(0, 0);
  };

  // Handle Booking Submit
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingDesc || !bookingDate || !bookingTime) {
      alert("Harap lengkapi deskripsi kerusakan, tanggal, dan waktu.");
      return;
    }

    try {
      const savedUser = localStorage.getItem("pelanggan_user");
      if (!savedUser) return;
      const parsed = JSON.parse(savedUser);
      const userObj = parsed.user || parsed;
      
      const payload = {
        user_id: userObj.id,
        tukang_id: selectedTukang.id,
        deskripsi_masalah: bookingDesc,
        judul: selectedService ? selectedService.name : "Jasa Perbaikan Umum",
        kategori_layanan: selectedTukang.specialtyText || selectedTukang.specialty || "Pertukangan",
        latitude: userObj.latitude || -6.2088,
        longitude: userObj.longitude || 106.8456,
        alamat_lengkap: userObj.alamat || "Alamat Pelanggan",
        harga_penawaran: selectedTukang.price || 150000,
      };

      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/pesanan`, payload);
      
      if (response.data.data) {
        const orderData = response.data.data;
        const chatRes = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/chat/start`, {
          user_id: userObj.id,
          tukang_id: selectedTukang.id,
          pesanan_id: orderData.id
        });
        
        setShowSuccessToast(true);
        setIsBookingModalOpen(false);
        setBookingDesc("");
        setBookingDate("");
        setBookingTime("");

        setTimeout(() => {
          setShowSuccessToast(false);
          navigate("/pelanggan/chat", { state: { activeChatId: chatRes.data.data.id } });
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal melakukan booking. Silakan coba lagi.");
    }
  };

  const handleStartChat = async (tukangId) => {
    try {
      const savedUser = localStorage.getItem("pelanggan_user");
      if (!savedUser) {
        navigate("/");
        return;
      }
      const parsed = JSON.parse(savedUser);
      const userObj = parsed.user || parsed;
      
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/chat/start`, {
        user_id: userObj.id,
        tukang_id: tukangId
      });
      
      if (response.data.status === "Sukses") {
        navigate("/pelanggan/chat", { state: { activeChatId: response.data.data.id } });
      } else {
        navigate("/pelanggan/chat");
      }
    } catch (error) {
      console.error("Gagal memulai obrolan", error);
      navigate("/pelanggan/chat");
    }
  };

  // Top Rated Tukang (rating >= 4.9)
  const topRatedTukang = recommendedTukang.filter(t => t.rating >= 4.9);

  // Search filter results
  const filteredTukangs = recommendedTukang.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.specialtyText.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort recommended handymen list based on tukangFilter
  const getSortedTukangs = () => {
    let list = [...recommendedTukang];
    if (tukangFilter === "terdekat") {
      return list.sort((a, b) => a.distanceValue - b.distanceValue);
    } else if (tukangFilter === "rating") {
      return list.sort((a, b) => b.rating - a.rating);
    } else if (tukangFilter === "pekerjaan") {
      return list.sort((a, b) => b.completedJobs - a.completedJobs);
    }
    return list;
  };

  // Comprehensive Filter & Sorting for HALAMAN DAFTAR TUKANG
  const getFilteredAndSortedTukangs = () => {
    let list = [...recommendedTukang];

    // Filter by Specialty
    if (filterSpecialty !== "all") {
      list = list.filter(t => t.specialty === filterSpecialty);
    }

    // Filter by Search Query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => 
        t.name.toLowerCase().includes(q) ||
        t.specialtyText.toLowerCase().includes(q) ||
        t.specialty.toLowerCase().includes(q)
      );
    }

    // Filter by Distance / Jarak
    if (filterDistance === "5") {
      list = list.filter(t => t.distanceValue <= 5);
    } else if (filterDistance === "10") {
      list = list.filter(t => t.distanceValue <= 10);
    } else if (filterDistance === "20") {
      list = list.filter(t => t.distanceValue <= 20);
    }

    // Filter by Rating
    if (filterRating !== "all") {
      const minRating = parseFloat(filterRating);
      list = list.filter(t => t.rating >= minRating);
    }

    // Filter by Status
    if (filterStatus !== "all") {
      list = list.filter(t => t.status === filterStatus);
    }

    // Filter by Harga
    if (filterPrice === "low") {
      list = list.filter(t => t.price <= 150000);
    } else if (filterPrice === "high") {
      list = list.filter(t => t.price > 150000);
    }

    // Filter by Pengalaman
    if (filterExp === "senior") {
      list = list.filter(t => t.experience >= 5);
    } else if (filterExp === "new") {
      list = list.filter(t => t.experience < 5);
    }

    // Sorting (Urutan)
    if (sortingOption === "terdekat") {
      list.sort((a, b) => a.distanceValue - b.distanceValue);
    } else if (sortingOption === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortingOption === "pekerjaan") {
      list.sort((a, b) => b.completedJobs - a.completedJobs);
    } else if (sortingOption === "harga_rendah") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortingOption === "harga_tinggi") {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  };

  // Helper: Portfolio Data based on Handyman Specialty
  const getPortofolioData = (specialty) => {
    switch (specialty) {
      case "listrik":
        return [
          { label: "Instalasi Panel Baru", desc: "Pemasangan MCB & Box Schneider", before: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?q=80&w=300&auto=format&fit=crop", after: "https://images.unsplash.com/photo-1621905252507-b354bc25edac?q=80&w=300&auto=format&fit=crop" },
          { label: "Smart Home Lighting", desc: "Instalasi smart switch Bardi", before: "https://images.unsplash.com/photo-1558224494-ef3b3b444585?q=80&w=300&auto=format&fit=crop", after: "https://images.unsplash.com/photo-1565538810844-1e1194826f06?q=80&w=300&auto=format&fit=crop" }
        ];
      case "ac":
        return [
          { label: "Service AC Split", desc: "Cuci filter & cleaning outdoor", before: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=300&auto=format&fit=crop", after: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=300&auto=format&fit=crop" },
          { label: "Bongkar Pasang AC Daikin", desc: "Pemasangan unit baru 1 PK", before: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=300&auto=format&fit=crop", after: "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?q=80&w=300&auto=format&fit=crop" }
        ];
      case "pipa":
      default:
        return [
          { label: "Instalasi Pipa Wastafel", desc: "Penggantian pipa PVC & saringan", before: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=300&auto=format&fit=crop", after: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=300&auto=format&fit=crop" },
          { label: "Pasang Pompa Air Shimizu", desc: "Instalasi jalur booster pump", before: "https://images.unsplash.com/photo-1542060748-10c28b629f6f?q=80&w=300&auto=format&fit=crop", after: "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?q=80&w=300&auto=format&fit=crop" }
        ];
    }
  };

  // Helper: Customer Reviews
  const getUlasanData = (tukangId) => {
    return [
      { name: "Andi Wijaya", rating: 5, comment: "Pekerjaan rapi dan cepat selesai. Alatnya lengkap dan profesional.", date: "2 hari lalu", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKTfl-bPc3TYOy5r-jjyWK-ywD97kiKmUzf_fckpbG-fUGriGzIBeAYvujKLJIrVAaFR_vAJ-IPv7FSCgP8PVrxcSvLSiS3wILfbXS_YBz2fAaK6QbKEibAKOEdSbdNxSzP_1_P6gigW-WXYWGSUkNpqGCi9S8d0Mbhv7sTh-o5PXLb1XzNaj-x3BKXoYylvhC_l_RPbMK9V1uVH_HsOJeC-UFwuZ5dFhLWeri2WlVrGC41Qbkjt2paaIKIH8i6E9HxuTNhfn7nl4V" },
      { name: "Siti Rahmawati", rating: 5, comment: "Sangat direkomendasikan! Ramah dan datang tepat waktu. Harga sesuai.", date: "1 minggu lalu", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBQ70JmVD3JFhA5GBYSENBj4iOvz8fHvPcEgS4_HNs0H7SbJxYn9onPa141a39fCHWqGRQXaOY3-FRbi34aXFdIgbIZBG4tAdRdj0uIpmKEgJiTDWcp9tYs3Crc70XzdTnbWc1LsUUAXzDeLveVLyG8BZceDsHhAowB_0n8YEtHOyTfqjIUXWdfwqIPa1V6s8dpBHOqu6M9o0mWg17ZBYfinwfS-s_Yxbikr7GOHOABARqmpqNa-spZPM2sMFUMOHGGcLIuc4xuCU9z" },
      { name: "Budi Santoso", rating: 5, comment: "Pekerjaan rapi dan cepat selesai. AC dingin lagi mantap.", date: "2 minggu lalu", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDs8Lu1JkjdYYbB0gEPDz5AnBVfMJ3NSVj6AaIrRwz11aUkV8ZBMBntVWf7pu9UI9D2d2AV34cbAWarBRu7rkglulzLscU8ytWB_P23UDj2DxligPU1OzKwGGdyBv232-R9WFCHLleZ09J9-F_X2kOAswEol__7wRLilrK5dUYX-1ePXpWmLdaFVTJvesnu-5TksZM3IpA1BvN-EMB7F6YzyPEsTaVDJ7WbyhBHGUp7n8ASgFlNwP4NEzEYN3gvtniLpOjy5cmWOl70" }
    ];
  };

  // Helper: Detailed Prices list for Handyman Tab
  const getServicePrices = (specialty) => {
    switch (specialty) {
      case "listrik":
        return [
          { name: "Instalasi Lampu Baru", price: "Rp 50.000 / titik", desc: "Pemasangan kabel dan dudukan lampu baru secara rapi." },
          { name: "Perbaikan Konsleting Listrik", price: "Rp 150.000 / jam", desc: "Deteksi dan perbaikan arus pendek atau sekring rumah." },
          { name: "Pasang Stop Kontak / Saklar", price: "Rp 35.000 / unit", desc: "Pemasangan stop kontak tambahan atau penggantian saklar rusak." },
        ];
      case "ac":
        return [
          { name: "Cuci AC (0.5 - 2 PK)", price: "Rp 75.000 / unit", desc: "Pembersihan filter, evaporator, dan outdoor unit." },
          { name: "Isi & Tambah Freon R32/R410", price: "Rp 150.000 / unit", desc: "Pengisian freon AC sesuai takaran standar." },
          { name: "Bongkar Pasang AC Baru/Bekas", price: "Rp 350.000 / unit", desc: "Jasa pencopotan dan pemasangan kembali AC." },
        ];
      case "pipa":
        return [
          { name: "Perbaikan Pipa Bocor", price: "Rp 100.000 - Rp 250.000", desc: "Deteksi titik kebocoran pipa air bersih/kotor." },
          { name: "Pasang Keran / Wastafel", price: "Rp 80.000 / unit", desc: "Pemasangan keran baru, wastafel cuci piring." },
          { name: "Pembersihan Toren Air", price: "Rp 200.000 / unit", desc: "Pembersihan lumut dan kotoran pada tangki air." },
        ];
      case "cat":
        return [
          { name: "Cat Tembok Interior", price: "Rp 25.000 / m²", desc: "Pengecatan dinding dalam rumah dengan cat berkualitas." },
          { name: "Cat Tembok Eksterior", price: "Rp 35.000 / m²", desc: "Pengecatan dinding luar rumah tahan cuaca ekstrim." },
          { name: "Cat Plafon/Langit-langit", price: "Rp 20.000 / m²", desc: "Pengecatan plafon gypsum atau triplek rumah." },
        ];
      case "atap":
        return [
          { name: "Tambal Genteng Bocor", price: "Rp 150.000 / titik", desc: "Pencarian dan penambalan genteng pecah penyebab bocor." },
          { name: "Waterproofing Dak Beton", price: "Rp 75.000 / m²", desc: "Pelapisan cat anti-bocor pada dak semen eksterior." },
          { name: "Pemasangan Talang Air", price: "Rp 90.000 / meter", desc: "Pemasangan talang air PVC atau seng." },
        ];
      case "pertukangan":
        return [
          { name: "Perbaikan Daun Pintu / Kusen", price: "Rp 200.000 / unit", desc: "Penyetelan daun pintu seret atau kusen kropos." },
          { name: "Perakitan Furnitur / Lemari", price: "Rp 150.000 / unit", desc: "Jasa perakitan meja, kursi, tempat tidur, lemari." },
          { name: "Pembuatan Sekat Ruangan Gypsum", price: "Rp 300.000 / m²", desc: "Pemasangan dinding partisi gypsum rangka hollow." },
        ];
      case "pindahan":
        return [
          { name: "Pindahan Kost (Pickup)", price: "Rp 300.000", desc: "Pindahan barang kost menggunakan mobil pickup terbuka." },
          { name: "Pindahan Rumah (Truk Engkel)", price: "Rp 800.000", desc: "Pindahan rumah dengan kapasitas barang besar." },
          { name: "Jasa Packing & Bongkar Muat", price: "Rp 250.000", desc: "Bantuan pembungkusan bubble wrap dan pengangkutan." },
        ];
      case "kebersihan":
      default:
        return [
          { name: "Deep Cleaning Pasca Renovasi", price: "Rp 15.000 / m²", desc: "Pembersihan menyeluruh noda cat, debu tebal, semen." },
          { name: "Cuci Sofa / Kasur / Karpet", price: "Rp 80.000 / seat", desc: "Pembersihan noda, tungau, dan bakteri." },
          { name: "Pembersihan Harian Rumah (2 Jam)", price: "Rp 100.000", desc: "Pekerjaan rumah tangga standar menyapu, mengepel." },
        ];
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen selection:bg-secondary/30 selection:text-secondary font-sans relative overflow-x-hidden flex">
      
      {/* Toast Notification for Success Booking */}
      {showSuccessToast && (
        <div className="fixed top-24 right-6 z-[99] bg-surface-container border-2 border-secondary rounded-2xl p-5 shadow-2xl animate-bounce max-w-sm">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-3xl">check_circle</span>
            <div>
              <h5 className="font-bold text-sm text-on-surface">Pemesanan Berhasil Dikirim!</h5>
              <p className="text-xs text-on-surface-variant mt-0.5">Mengalihkan ke ruang chat untuk bernegosiasi dengan {selectedTukang?.name}...</p>
            </div>
          </div>
        </div>
      )}

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
                  alt="User Profile"
                  src={user && user.foto_profil ? (user.foto_profil.startsWith("http") ? user.foto_profil : `http://127.0.0.1:8000/storage/${user.foto_profil}`) : `https://ui-avatars.com/api/?name=${user ? user.name : 'Pelanggan'}&background=random`}
                />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-on-surface truncate">{user ? user.name : "Pelanggan"}</h4>
                <p className="text-xs text-on-surface-variant/60 truncate">{user ? user.email : ""}</p>
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
            <span className="font-headline-md text-headline-md font-bold text-secondary hidden sm:block">Dashboard</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/pelanggan/pesanan" className="p-2 text-on-surface-variant hover:text-secondary transition-colors relative cursor-pointer flex items-center justify-center">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full"></span>
            </Link>
            <div className="h-10 w-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/30 ml-2">
              <img
                className="w-full h-full object-cover"
                alt="User Profile"
                src={user && user.foto_profil ? (user.foto_profil.startsWith("http") ? user.foto_profil : `http://127.0.0.1:8000/storage/${user.foto_profil}`) : `https://ui-avatars.com/api/?name=${user ? user.name : 'Pelanggan'}&background=random`}
              />
            </div>
          </div>
        </header>

        {/* Canvas */}
        <div className="pt-28 pb-12 px-6 md:px-12 max-w-7xl w-full mx-auto space-y-8 flex-grow page-transition">
          
          {viewState === "home" && (
            <>
              {/* Hero & Search Section */}
              <section className="relative overflow-hidden rounded-3xl bg-surface-container p-8 md:p-12 border border-surface-variant/20 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="relative z-10 max-w-xl space-y-4 w-full">
                  <div>
                    <h2 className="font-headline-xl text-headline-xl text-on-background mb-2 text-4xl font-bold mt-3">
                      Halo, <span className="text-secondary">{user ? user.name : "Pelanggan"}!</span>
                    </h2>
                    <p className="font-body-lg text-sm text-on-surface-variant/80 font-normal leading-relaxed">
                      Butuh perbaikan rumah? Temukan penyedia jasa terpercaya untuk melayani kebutuhan listrik, pipa, kebersihan, dan atap rumah Anda.
                    </p>
                  </div>

                  {/* Search Bar */}
                  <div className="flex items-center bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-1.5 w-full max-w-md shadow-lg group focus-within:border-secondary/50 focus-within:ring-1 focus-within:ring-secondary/50 transition-all duration-200">
                    <span className="material-symbols-outlined text-on-surface-variant/50 pl-2">search</span>
                    <input
                      type="text"
                      placeholder="Cari layanan listrik, AC, pipa, cat rumah, atap, dan lainnya"
                      className="bg-transparent border-none focus:ring-0 text-sm flex-grow px-3 text-on-surface outline-none placeholder:text-on-surface-variant/40"
                      value={bannerSearchQuery}
                      onChange={(e) => setBannerSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit(bannerSearchQuery)}
                    />
                    <button 
                      onClick={() => handleSearchSubmit(bannerSearchQuery)}
                      className="bg-secondary text-on-secondary px-5 py-2.5 rounded-xl text-xs font-bold hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 cursor-pointer border-none"
                    >
                      Cari Jasa
                    </button>
                  </div>

                  {/* Quick Search Suggestions */}
                  <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
                    <span className="text-on-surface-variant/70 font-semibold">Saran:</span>
                    {["Listrik", "AC", "Pipa Bocor", "Cat Rumah", "Atap"].map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => {
                          setBannerSearchQuery(sug);
                          handleSearchSubmit(sug);
                        }}
                        className="bg-surface-container-high hover:bg-secondary/15 hover:text-secondary text-on-surface-variant px-3 py-1 rounded-full border border-surface-variant/20 transition-all cursor-pointer font-bold"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Banner Vector */}
                <div className="absolute right-12 bottom-0 hidden lg:block w-72 h-72 pointer-events-none">
                  <img
                    className="w-full h-full object-contain filter drop-shadow-[0_20px_50px_rgba(249,115,22,0.35)]"
                    alt="Tools Belt Render"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIrTiL3nKB6rs8CjUTMxr2C0LyTTXcNZN-iUWiGCz-yI9b5oln7dnDCUoDXrTM7dLIbVN1yktRr1Y_UtI1qKGvZAxTw3B4JfLd6JBhWe4Crv-y03wrNj8-3OR5nsFturaPxlvgWQH11tPlEzZRBJh1DRCxFJ8P_Yv2Cgrty3x9zpqxEREuobN510UkBQc4R3EaPcqnBA08r7exVif_oWOfV0ZBTlWwZOYRr6SAyKTO8I0bPVqQmmy4_dOAr9Ap7_hXQICgfiuDYLOP"
                  />
                </div>
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 blur-[100px] rounded-full pointer-events-none"></div>
              </section>

              {/* Service Categories Grid (Main Focus right under Hero) */}
              <section className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-on-surface">Kategori Layanan Utama</h3>
                  <p className="text-on-surface-variant text-xs mt-0.5">Pilih kategori layanan jasa yang Anda butuhkan</p>
                </div>
                <div className="flex lg:grid overflow-x-auto lg:grid-cols-4 gap-4 pb-3 lg:pb-0 custom-scrollbar snap-x snap-mandatory">
                  {categories.map((cat) => (
                    <div 
                      key={cat.id} 
                      onClick={() => handleCategorySelect(cat)}
                      className="snap-start shrink-0 min-w-[145px] lg:min-w-0 group cursor-pointer p-5 rounded-2xl bg-surface-container flex flex-col items-center justify-center text-center gap-3 border border-surface-variant/15 hover:border-secondary/40 hover:bg-secondary/5 transition-all duration-300 h-36"
                    >
                      <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-secondary group-hover:scale-110 transition-transform duration-200">
                        <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                      </div>
                      <div>
                        <span className="font-bold text-sm text-on-surface block group-hover:text-secondary transition-colors">{cat.label}</span>
                        <span className="text-[10px] text-on-surface-variant opacity-75 mt-1 block truncate max-w-[130px]">{cat.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Active Orders Section */}
              {activeOrders.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">pending_actions</span>
                    <h3 className="text-lg font-bold text-on-surface">Pesanan Aktif</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeOrders.map((order) => (
                      <div key={order.id} className="bg-surface-container border border-secondary/30 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-secondary/60 transition-colors">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-secondary/15 text-secondary border border-secondary/20 font-bold px-2 py-0.5 rounded-full">
                              {order.id}
                            </span>
                            <span className="text-xs text-on-surface-variant">{order.date}</span>
                          </div>
                          <h4 className="font-bold text-base text-on-surface">{order.service}</h4>
                          <p className="text-xs text-on-surface-variant">Tukang: <strong className="text-on-surface">{order.tukang}</strong> • {order.cost}</p>
                          <span className="inline-block text-[10px] font-bold text-secondary bg-secondary/15 px-2.5 py-0.5 rounded-full border border-secondary/20">
                            {order.status}
                          </span>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto shrink-0 mt-3 sm:mt-0">
                          <Link 
                            to="/pelanggan/chat"
                            className="flex-1 sm:flex-initial text-center bg-secondary hover:bg-secondary/90 text-on-secondary px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-xs">chat</span>
                            Chat
                          </Link>
                          <button 
                            onClick={() => {
                              alert(`Detail Pesanan: ${order.service}\nMitra: ${order.tukang}\nTanggal: ${order.date}\nBiaya: ${order.cost}\nStatus: ${order.status}`);
                            }}
                            className="flex-1 sm:flex-initial text-center bg-surface-container-highest border border-outline-variant/30 text-on-surface hover:bg-surface-container-high px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-xs">info</span>
                            Detail
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Recommended Tukang Section (Merged List with Filters) */}
              <section className="space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-4 pb-2 border-b border-surface-variant/10">
                  <div>
                    <h3 className="text-lg font-bold text-on-surface">Tukang Rekomendasi</h3>
                    <p className="text-on-surface-variant text-xs mt-0.5">Daftar mitra penyedia jasa handal pilihan untuk Anda</p>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                    {[
                      { id: "terdekat", label: "Terdekat", icon: "distance" },
                      { id: "rating", label: "Rating Tertinggi", icon: "star" },
                      { id: "pekerjaan", label: "Paling Banyak Pekerjaan", icon: "work_history" }
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setTukangFilter(f.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border shrink-0 ${
                          tukangFilter === f.id
                            ? "bg-secondary border-secondary text-on-secondary shadow-lg shadow-secondary/15"
                            : "bg-surface-container-high border-surface-variant/20 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest"
                        }`}
                      >
                        <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: f.id === "rating" && tukangFilter === "rating" ? "'FILL' 1" : "'FILL' 0" }}>{f.icon}</span>
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getSortedTukangs().map((tukang) => (
                    <div 
                      key={tukang.id} 
                      onClick={() => handleTukangSelect(tukang)}
                      className="bg-surface-container-high/40 p-4 rounded-2xl flex items-center gap-4 group hover:bg-surface-container-high transition-all duration-300 border border-surface-variant/10 cursor-pointer"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container-lowest shrink-0 border border-outline-variant/20">
                        <img className="w-full h-full object-cover" alt={tukang.name} src={tukang.image} />
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-on-surface text-sm truncate">{tukang.name}</h4>
                              <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${
                                tukang.status === "Tersedia"
                                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                                  : "bg-red-500/10 border-red-500/20 text-red-400"
                              }`}>
                                {tukang.status}
                              </span>
                            </div>
                            <p className="text-xs text-on-surface-variant truncate mt-0.5">{tukang.specialtyText}</p>
                          </div>
                          <div className="flex items-center gap-1 bg-secondary/15 px-2 py-0.5 rounded-full shrink-0 border border-secondary/10">
                            <span className="material-symbols-outlined text-[10px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            <span className="text-[10px] font-bold text-secondary">{tukang.rating}</span>
                          </div>
                        </div>
                        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-on-surface-variant">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">location_on</span>
                            {tukang.distance} dari Anda
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">work_history</span>
                            {tukang.completedJobs} Pekerjaan
                          </span>
                        </div>
                      </div>
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartChat(tukang.id);
                        }}
                        className="p-2.5 rounded-xl border border-outline-variant hover:border-secondary hover:text-secondary text-on-surface-variant transition-all shrink-0 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">chat</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Statistics Grid (Placed at the bottom, smaller padding/typography) */}
              <section className="space-y-3 pt-6 border-t border-surface-variant/10">
                <div>
                  <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest opacity-75">Statistik Akun Saya</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-surface-container/60 backdrop-blur-md p-4 rounded-xl flex items-center gap-3 border border-surface-variant/10 shadow-sm">
                    <div className="p-2 rounded-lg bg-secondary/10 text-secondary border border-secondary/5 shrink-0">
                      <span className="material-symbols-outlined text-sm">pending_actions</span>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-on-surface-variant/75 uppercase tracking-wider">
                        Pesanan Aktif
                      </p>
                      <h3 className="text-lg font-extrabold text-on-surface leading-tight">
                        {String(activeOrders.length).padStart(2, "0")}
                      </h3>
                    </div>
                  </div>

                  <div className="bg-surface-container/60 backdrop-blur-md p-4 rounded-xl flex items-center gap-3 border border-surface-variant/10 shadow-sm">
                    <div className="p-2 rounded-lg bg-secondary/10 text-secondary border border-secondary/5 shrink-0">
                      <span className="material-symbols-outlined text-sm">task_alt</span>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-on-surface-variant/75 uppercase tracking-wider">
                        Pekerjaan Selesai
                      </p>
                      <h3 className="text-lg font-extrabold text-on-surface leading-tight">
                        {String(orders.filter(o => o.status === "selesai").length).padStart(2, "0")}
                      </h3>
                    </div>
                  </div>

                  <div className="bg-surface-container/60 backdrop-blur-md p-4 rounded-xl flex items-center gap-3 border border-surface-variant/10 shadow-sm">
                    <div className="p-2 rounded-lg bg-secondary/10 text-secondary border border-secondary/5 shrink-0">
                      <span className="material-symbols-outlined text-sm">payments</span>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-on-surface-variant/75 uppercase tracking-wider">
                        Total Pengeluaran
                      </p>
                      <h3 className="text-lg font-extrabold text-on-surface leading-tight">
                        Rp {totalPengeluaran.toLocaleString("id-ID")}
                      </h3>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* VIEW: DAFTAR TUKANG (Category List + Advanced Filter) */}
          {viewState === "category" && (
            <div className="space-y-6">
              {/* Header / Breadcrumb */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      setViewState("home");
                      setSelectedCategory(null);
                      setFilterSpecialty("all");
                      setSearchQuery("");
                    }}
                    className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-variant/15 text-on-surface-variant hover:text-on-surface transition-all cursor-pointer flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                  </button>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                      <span className="cursor-pointer hover:underline" onClick={() => {
                        setViewState("home");
                        setSelectedCategory(null);
                        setFilterSpecialty("all");
                        setSearchQuery("");
                      }}>Dashboard</span>
                      <span>/</span>
                      <span className="text-on-surface font-semibold">Cari Jasa</span>
                    </div>
                    <h2 className="text-xl font-bold text-on-surface mt-1">
                      {selectedCategory ? `Daftar Tukang: ${selectedCategory.label}` : searchQuery ? `Hasil Cari: "${searchQuery}"` : "Daftar Semua Tukang"}
                    </h2>
                  </div>
                </div>
                
                {/* Reset Filters Shortcut */}
                <button
                  onClick={() => {
                    setFilterDistance("all");
                    setFilterRating("all");
                    setFilterStatus("all");
                    setFilterPrice("all");
                    setFilterExp("all");
                    setFilterSpecialty(selectedCategory ? selectedCategory.id : "all");
                    setSortingOption("terdekat");
                    setSearchQuery("");
                  }}
                  className="text-xs text-secondary hover:text-secondary/80 font-bold flex items-center gap-1 bg-secondary/15 px-3.5 py-2 rounded-xl transition-all cursor-pointer border border-secondary/20"
                >
                  <span className="material-symbols-outlined text-xs">restart_alt</span>
                  Reset Semua Filter
                </button>
              </div>

              {/* Grid: Left Filter Panel, Right Tukang Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left: Filter Panel */}
                <aside className="lg:col-span-4 space-y-5">
                  <div className="bg-surface-container p-6 rounded-3xl border border-surface-variant/15 space-y-6 shadow-xl sticky top-24">
                    <div className="flex items-center justify-between pb-3 border-b border-surface-variant/10">
                      <h3 className="font-bold text-sm text-on-surface uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-secondary text-sm">tune</span>
                        Panel Filter
                      </h3>
                    </div>

                    {/* Filter 1: Spesialisasi */}
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block">Spesialisasi</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => setFilterSpecialty("all")}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border text-left truncate ${
                            filterSpecialty === "all"
                              ? "bg-secondary/10 border-secondary text-secondary"
                              : "bg-surface-container-high border-surface-variant/20 text-on-surface-variant hover:text-on-surface"
                          }`}
                        >
                          Semua Layanan
                        </button>
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => setFilterSpecialty(cat.id)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border text-left truncate ${
                              filterSpecialty === cat.id
                                ? "bg-secondary/10 border-secondary text-secondary"
                                : "bg-surface-container-high border-surface-variant/20 text-on-surface-variant hover:text-on-surface"
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Filter 2: Jarak */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block">Jarak dari Anda</label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { id: "all", label: "Semua Jarak" },
                          { id: "5", label: "< 5 km" },
                          { id: "10", label: "< 10 km" },
                          { id: "20", label: "< 20 km" }
                        ].map((d) => (
                          <button
                            key={d.id}
                            onClick={() => setFilterDistance(d.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              filterDistance === d.id
                                ? "bg-secondary/10 border-secondary text-secondary"
                                : "bg-surface-container-high border-surface-variant/20 text-on-surface-variant hover:text-on-surface"
                            }`}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Filter 3: Rating Minimal */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block">Rating Minimum</label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { id: "all", label: "Semua" },
                          { id: "4.0", label: "4.0+" },
                          { id: "4.5", label: "4.5+" },
                          { id: "4.8", label: "4.8+" },
                          { id: "5.0", label: "5.0" }
                        ].map((r) => (
                          <button
                            key={r.id}
                            onClick={() => setFilterRating(r.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 ${
                              filterRating === r.id
                                ? "bg-secondary/10 border-secondary text-secondary"
                                : "bg-surface-container-high border-surface-variant/20 text-on-surface-variant hover:text-on-surface"
                            }`}
                          >
                            {r.label}
                            {r.id !== "all" && <span className="material-symbols-outlined text-[10px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Filter 4: Status Ketersediaan */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block">Status Tukang</label>
                      <div className="flex gap-2">
                        {[
                          { id: "all", label: "Semua" },
                          { id: "Tersedia", label: "Tersedia Sekarang" },
                          { id: "Sibuk", label: "Sedang Sibuk" }
                        ].map((s) => (
                          <button
                            key={s.id}
                            onClick={() => setFilterStatus(s.id)}
                            className={`flex-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              filterStatus === s.id
                                ? "bg-secondary/10 border-secondary text-secondary"
                                : "bg-surface-container-high border-surface-variant/20 text-on-surface-variant hover:text-on-surface"
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Filter 5: Rentang Harga */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block">Harga Estimasi</label>
                      <div className="flex gap-2">
                        {[
                          { id: "all", label: "Semua" },
                          { id: "low", label: "Termurah" },
                          { id: "high", label: "Termahal" }
                        ].map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setFilterPrice(p.id)}
                            className={`flex-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              filterPrice === p.id
                                ? "bg-secondary/10 border-secondary text-secondary"
                                : "bg-surface-container-high border-surface-variant/20 text-on-surface-variant hover:text-on-surface"
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Filter 6: Pengalaman Kerja */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block">Pengalaman Kerja</label>
                      <div className="flex gap-2">
                        {[
                          { id: "all", label: "Semua" },
                          { id: "senior", label: "Senior (> 5 Tahun)" },
                          { id: "new", label: "Junior (< 5 Tahun)" }
                        ].map((x) => (
                          <button
                            key={x.id}
                            onClick={() => setFilterExp(x.id)}
                            className={`flex-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${
                              filterExp === x.id
                                ? "bg-secondary/10 border-secondary text-secondary"
                                : "bg-surface-container-high border-surface-variant/20 text-on-surface-variant hover:text-on-surface"
                            }`}
                          >
                            {x.label}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </aside>

                {/* Right: Handymen List and Sorting Header */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Sorting Header */}
                  <div className="bg-surface-container p-4 rounded-2xl border border-surface-variant/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <span className="text-xs font-bold text-on-surface-variant">
                      Ditemukan <strong className="text-on-surface">{getFilteredAndSortedTukangs().length}</strong> mitra tukang
                    </span>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="text-xs text-on-surface-variant font-bold shrink-0">Urutkan:</span>
                      <select
                        value={sortingOption}
                        onChange={(e) => setSortingOption(e.target.value)}
                        className="bg-surface-container-high border border-outline-variant/30 rounded-xl px-3 py-2 text-xs font-bold text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary w-full sm:w-auto cursor-pointer text-ellipsis overflow-hidden"
                      >
                        <option value="terdekat">Terdekat</option>
                        <option value="rating">Rating Tertinggi</option>
                        <option value="pekerjaan">Paling Banyak Pekerjaan</option>
                        <option value="harga_rendah">Harga Terendah</option>
                        <option value="harga_tinggi">Harga Tertinggi</option>
                      </select>
                    </div>
                  </div>

                  {/* List Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getFilteredAndSortedTukangs().map((tukang) => (
                      <div
                        key={tukang.id}
                        onClick={() => handleTukangSelect(tukang)}
                        className="bg-surface-container p-5 rounded-3xl border border-surface-variant/15 hover:border-secondary/40 hover:bg-surface-container-high transition-all cursor-pointer space-y-4 flex flex-col justify-between"
                      >
                        <div className="flex gap-4">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-outline-variant/20">
                            <img className="w-full h-full object-cover" src={tukang.image} alt={tukang.name} />
                          </div>
                          <div className="min-w-0 flex-grow">
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="font-bold text-on-surface text-base truncate">{tukang.name}</h4>
                              <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${
                                tukang.status === "Tersedia"
                                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                                  : "bg-red-500/10 border-red-500/20 text-red-400"
                              }`}>
                                {tukang.status}
                              </span>
                            </div>
                            <p className="text-xs text-on-surface-variant truncate mt-0.5">{tukang.specialtyText}</p>
                            <p className="text-[10px] text-on-surface-variant mt-1.5 line-clamp-2 leading-relaxed">
                              {tukang.bio}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-3 border-t border-surface-variant/10">
                          <span className="flex items-center gap-0.5 font-bold text-secondary">
                            <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            {tukang.rating.toFixed(1)}
                          </span>
                          <span className="flex items-center gap-1 font-semibold">
                            <span className="material-symbols-outlined text-[12px]">work_history</span>
                            {tukang.completedJobs} Pekerjaan
                          </span>
                          <span className="flex items-center gap-1 font-semibold">
                            <span className="material-symbols-outlined text-[12px]">location_on</span>
                            {tukang.distance}
                          </span>
                          <span className="font-bold text-secondary">{tukang.priceFormatted}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {getFilteredAndSortedTukangs().length === 0 && (
                    <div className="bg-surface-container rounded-3xl p-12 text-center border border-surface-variant/15 space-y-4">
                      <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">search_off</span>
                      <h4 className="text-base font-bold text-on-surface">Tidak Ada Mitra Jasa Sesuai Kriteria</h4>
                      <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                        Silakan atur ulang panel filter di sebelah kiri atau hapus pencarian Anda untuk menampilkan semua penyedia jasa.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* VIEW: TUKANG DETAIL & BOOKING FORM */}
          {viewState === "tukang" && selectedTukang && (
            <div className="space-y-6">
              
              {/* Header / Breadcrumb */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    setViewState("category");
                  }}
                  className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-variant/15 text-on-surface-variant hover:text-on-surface transition-all cursor-pointer flex items-center justify-center"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                    <span className="cursor-pointer hover:underline" onClick={() => setViewState("home")}>Dashboard</span>
                    <span>/</span>
                    <span className="cursor-pointer hover:underline" onClick={() => setViewState("category")}>Cari Jasa</span>
                    <span>/</span>
                    <span className="text-on-surface font-semibold">{selectedTukang.name}</span>
                  </div>
                  <h2 className="text-xl font-bold text-on-surface mt-1">Profil Mitra Tukang</h2>
                </div>
              </div>

              {/* Profile Header Block */}
              <div className="bg-surface-container p-6 rounded-3xl border border-surface-variant/15 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-secondary/30 shrink-0">
                    <img className="w-full h-full object-cover" src={selectedTukang.image} alt={selectedTukang.name} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-bold text-on-surface">{selectedTukang.name}</h3>
                      <span className="material-symbols-outlined text-secondary text-base" title="Verified Specialist">verified</span>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        selectedTukang.status === "Tersedia"
                          ? "bg-green-500/10 border-green-500/20 text-green-400"
                          : "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}>
                        {selectedTukang.status}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant font-medium mt-1">{selectedTukang.specialtyText}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-on-surface-variant/85 font-semibold">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        {selectedTukang.rating.toFixed(1)} Rating
                      </span>
                      <span>•</span>
                      <span>{selectedTukang.completedJobs} Pekerjaan Selesai</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">location_on</span>
                        {selectedTukang.distance} dari Anda
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main CTA Actions (Pilih & Booking / Chat) */}
                <div className="flex gap-3 w-full md:w-auto shrink-0">
                  <button
                    onClick={() => {
                      handleStartChat(selectedTukang.id);
                    }}
                    className="flex-1 md:flex-initial bg-surface-container-high border border-outline-variant/30 hover:border-secondary/40 text-on-surface hover:text-secondary py-3 px-5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xs">chat</span>
                    Chat Tukang
                  </button>
                  <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className="flex-1 md:flex-initial bg-secondary text-on-secondary hover:bg-secondary/90 py-3 px-6 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-secondary/15 hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <span className="material-symbols-outlined text-xs">calendar_today</span>
                    Pilih & Booking
                  </button>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="flex border-b border-surface-variant/20 gap-6 pb-2">
                {[
                  { id: "profil", label: "Profil & Informasi" },
                  { id: "portofolio", label: "Portofolio Pekerjaan" },
                  { id: "ulasan", label: "Ulasan Pelanggan" },
                  { id: "harga", label: "Daftar Harga Jasa" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setDetailTab(tab.id)}
                    className={`pb-2 text-xs font-bold capitalize transition-colors relative cursor-pointer ${
                      detailTab === tab.id ? "text-secondary" : "text-on-surface-variant/70 hover:text-on-surface"
                    }`}
                  >
                    {tab.label}
                    {detailTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div className="min-h-[250px]">
                {detailTab === "profil" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: About and Certs */}
                    <div className="lg:col-span-8 space-y-6">
                      <div className="bg-surface-container p-6 rounded-3xl border border-surface-variant/15 space-y-4">
                        <h4 className="font-bold text-sm text-on-surface uppercase tracking-wider">Tentang Penyedia Jasa</h4>
                        <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                          {selectedTukang.bio}
                        </p>
                      </div>

                      <div className="bg-surface-container p-6 rounded-3xl border border-surface-variant/15 space-y-4">
                        <h4 className="font-bold text-sm text-on-surface uppercase tracking-wider">Sertifikat & Lisensi Profesional</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {selectedTukang.sertifikats && selectedTukang.sertifikats.length > 0 ? (
                            selectedTukang.sertifikats.map(cert => (
                              <div key={cert.id} className="bg-surface-container-high/50 p-4 rounded-xl border border-outline-variant/20 flex items-center gap-3">
                                <span className="material-symbols-outlined text-secondary text-2xl">verified_user</span>
                                <div>
                                  <p className="text-xs font-bold text-on-surface">{cert.judul}</p>
                                  <p className="text-[10px] text-on-surface-variant mt-0.5">{cert.penerbit} {cert.tahun ? `(${cert.tahun})` : ''}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-on-surface-variant italic col-span-2">Belum ada sertifikat.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Key Stats */}
                    <div className="lg:col-span-4">
                      <div className="bg-surface-container p-6 rounded-3xl border border-surface-variant/15 space-y-4">
                        <h4 className="font-bold text-sm text-on-surface uppercase tracking-wider">Statistik Tukang</h4>
                        <div className="space-y-3.5">
                          <div className="flex justify-between items-center text-xs py-1 border-b border-surface-variant/10">
                            <span className="text-on-surface-variant font-medium">Pengalaman Kerja</span>
                            <span className="font-bold text-on-surface">{selectedTukang.experience} Tahun</span>
                          </div>
                          <div className="flex justify-between items-center text-xs py-1 border-b border-surface-variant/10">
                            <span className="text-on-surface-variant font-medium">Kredibilitas Pelanggan</span>
                            <span className="font-bold text-green-400">Sangat Baik</span>
                          </div>
                          <div className="flex justify-between items-center text-xs py-1 border-b border-surface-variant/10">
                            <span className="text-on-surface-variant font-medium">Jarak Lokasi</span>
                            <span className="font-bold text-on-surface">{selectedTukang.distance}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs py-1 border-b border-surface-variant/10">
                            <span className="text-on-surface-variant font-medium">Rata-rata Harga Jasa</span>
                            <span className="font-bold text-secondary">{selectedTukang.priceFormatted}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs py-1">
                            <span className="text-on-surface-variant font-medium">Status Akun</span>
                            <span className="font-bold text-green-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Aktif
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {detailTab === "portofolio" && (
                  <div className="bg-surface-container p-6 rounded-3xl border border-surface-variant/15 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedTukang.portofolios && selectedTukang.portofolios.length > 0 ? (
                        selectedTukang.portofolios.map(port => (
                          <div key={port.id} className="bg-surface-container-high/40 p-3 rounded-2xl border border-outline-variant/30 space-y-2">
                            <div className="relative rounded-xl overflow-hidden h-40 border border-outline-variant/30">
                              <img className="w-full h-full object-cover" src={port.foto_url.startsWith('http') ? port.foto_url : `${import.meta.env.VITE_API_BASE_URL}/storage/${port.foto_url}`} alt={port.judul} />
                            </div>
                            <h5 className="font-bold text-xs text-on-surface truncate">{port.judul}</h5>
                            <p className="text-[10px] text-on-surface-variant line-clamp-2">{port.deskripsi}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-on-surface-variant italic col-span-3">Belum ada portofolio pekerjaan.</p>
                      )}
                    </div>
                  </div>
                )}

                {detailTab === "ulasan" && (
                  <div className="bg-surface-container p-6 rounded-3xl border border-surface-variant/15 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-4 border-b border-surface-variant/10 items-center">
                      <div className="text-center">
                        <h3 className="text-4xl font-extrabold text-secondary">{selectedTukang.rating.toFixed(1)}</h3>
                        <div className="flex justify-center gap-0.5 text-secondary my-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          ))}
                        </div>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase">Skor Kepuasan Umum</p>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        {[
                          { stars: 5, pct: 90 },
                          { stars: 4, pct: 10 },
                          { stars: 3, pct: 0 },
                          { stars: 2, pct: 0 },
                          { stars: 1, pct: 0 }
                        ].map((row, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-[11px] font-semibold text-on-surface-variant">
                            <span className="w-3 shrink-0">{row.stars}</span>
                            <span className="material-symbols-outlined text-[10px] text-secondary shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            <div className="flex-grow h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                              <div className="h-full bg-secondary rounded-full" style={{ width: `${row.pct}%` }}></div>
                            </div>
                            <span className="w-8 text-right shrink-0">{row.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      {selectedTukang.ulasans && selectedTukang.ulasans.length > 0 ? (
                        selectedTukang.ulasans.map((rev) => (
                          <div key={rev.id} className="space-y-2 text-xs pb-4 border-b border-surface-variant/10 last:border-0 last:pb-0">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full overflow-hidden bg-surface-container-high shrink-0 flex items-center justify-center text-on-surface-variant font-bold border border-outline-variant/30">
                                  {rev.pelanggan ? rev.pelanggan.nama.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                  <p className="font-bold text-on-surface text-xs">{rev.pelanggan ? rev.pelanggan.nama : 'User'}</p>
                                  <div className="flex items-center gap-0.5 text-secondary mt-0.5">
                                    {[...Array(parseInt(rev.rating) || 5)].map((_, i) => (
                                      <span key={i} className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[10px] text-on-surface-variant/60 font-semibold">{new Date(rev.created_at).toLocaleDateString("id-ID")}</span>
                            </div>
                            <p className="text-on-surface-variant/90 leading-relaxed font-medium italic pl-10">"{rev.komentar}"</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-on-surface-variant italic">Belum ada ulasan untuk tukang ini.</p>
                      )}
                    </div>
                  </div>
                )}

                {detailTab === "harga" && (
                  <div className="space-y-4">
                    <div className="bg-surface-container rounded-3xl border border-surface-variant/15 overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-surface-container-high border-b border-surface-variant/20 text-on-surface-variant">
                            <th className="p-4 font-bold uppercase tracking-wider">Spesifikasi Layanan</th>
                            <th className="p-4 font-bold uppercase tracking-wider">Estimasi Harga</th>
                            <th className="p-4 font-bold uppercase tracking-wider">Deskripsi Pekerjaan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedTukang.layanans && selectedTukang.layanans.length > 0 ? (
                            selectedTukang.layanans.map((svc) => (
                              <tr key={svc.id} className="border-b border-surface-variant/10 last:border-0 hover:bg-surface-container-high/40 transition-colors">
                                <td className="p-4 font-bold text-on-surface">{svc.nama_layanan}</td>
                                <td className="p-4 font-extrabold text-secondary">
                                  {svc.harga ? `Rp ${parseInt(svc.harga).toLocaleString('id-ID')}` : 'Hubungi'} {svc.satuan}
                                </td>
                                <td className="p-4 text-on-surface-variant font-medium leading-relaxed">{svc.deskripsi}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="3" className="p-4 text-center text-xs text-on-surface-variant italic">Belum ada daftar harga jasa.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-[10px] text-on-surface-variant/60 ml-2">
                      * Harga di atas merupakan estimasi awal pengerjaan standar. Biaya akhir akan disepakati bersama mitra setelah diskusi/negosiasi keluhan melalui Chat.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </main>

      {/* Decorative Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-secondary/5 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-primary/5 blur-[80px] rounded-full"></div>
      </div>

      {/* BOOKING MODAL */}
      {isBookingModalOpen && selectedTukang && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container border border-surface-variant/15 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-up flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-surface-variant/10 flex justify-between items-center bg-surface-container-high">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-secondary/20">
                  <img className="w-full h-full object-cover" src={selectedTukang.image} alt={selectedTukang.name} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface">Booking Jasa: {selectedTukang.name}</h3>
                  <p className="text-xs text-on-surface-variant">{selectedTukang.specialtyText}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsBookingModalOpen(false)}
                className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleBookingSubmit} className="p-6 overflow-y-auto space-y-5 text-xs font-semibold flex-grow">
              {/* Service Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant ml-1">Pilih Layanan</label>
                <select
                  value={selectedService ? selectedService.name : ""}
                  onChange={(e) => {
                    const services = selectedTukang.layanans || [];
                    const selectedName = e.target.value;
                    const found = services.find(s => s.nama_layanan === selectedName);
                    if (found) {
                      setSelectedService({ name: found.nama_layanan, price: found.harga, desc: found.deskripsi });
                    }
                  }}
                  className="w-full bg-surface-container-high border border-outline-variant rounded-xl py-3.5 px-4 text-xs font-bold text-on-surface focus:ring-1 focus:ring-secondary/50 focus:border-secondary outline-none transition-all cursor-pointer"
                  required
                >
                  <option value="" disabled>-- Pilih Spesifikasi Layanan --</option>
                  {selectedTukang.layanans && selectedTukang.layanans.length > 0 ? (
                    selectedTukang.layanans.map((svc) => (
                      <option key={svc.id} value={svc.nama_layanan}>
                        {svc.nama_layanan} - ({svc.harga ? `Rp ${parseInt(svc.harga).toLocaleString('id-ID')} ${svc.satuan}` : 'Hubungi'})
                      </option>
                    ))
                  ) : (
                    <option disabled>Tukang belum menambahkan layanan, silahkan deskripsikan masalah Anda</option>
                  )}
                </select>
              </div>

              {/* Problem Description */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant ml-1">Deskripsi Masalah / Pekerjaan</label>
                <textarea 
                  rows="3"
                  placeholder="Jelaskan kendala Anda secara detail agar mitra kami dapat mempersiapkan peralatan yang tepat (misalnya: Pipa saluran pembuangan air di bawah tempat cuci piring bocor parah sehingga air menggenang)"
                  className="w-full bg-surface-container-high border border-outline-variant rounded-xl p-4 font-body-md text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-secondary/50 focus:border-secondary outline-none transition-all font-medium"
                  value={bookingDesc}
                  onChange={(e) => setBookingDesc(e.target.value)}
                  required
                />
              </div>

              {/* Photo Upload Simulation */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant ml-1">Unggah Foto Lokasi / Kerusakan (Opsional)</label>
                <div className="border-2 border-dashed border-outline-variant/40 hover:border-secondary/40 rounded-xl p-5 text-center cursor-pointer transition-colors bg-surface-container-high flex flex-col items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-on-surface-variant/70 text-2xl">upload_file</span>
                  <span className="text-xs font-bold text-on-surface">Pilih File Foto</span>
                  <span className="text-[10px] text-on-surface-variant/60">Mendukung JPG, PNG hingga 5MB</span>
                </div>
              </div>

              {/* Schedule: Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant ml-1">Jadwal Kunjungan</label>
                  <input 
                    type="date"
                    className="w-full bg-surface-container-high border border-outline-variant rounded-xl py-3.5 px-4 text-xs text-on-surface focus:ring-1 focus:ring-secondary/50 focus:border-secondary outline-none transition-all cursor-pointer"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant ml-1">Jam Kunjungan</label>
                  <input 
                    type="time"
                    className="w-full bg-surface-container-high border border-outline-variant rounded-xl py-3.5 px-4 text-xs text-on-surface focus:ring-1 focus:ring-secondary/50 focus:border-secondary outline-none transition-all cursor-pointer"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Payment Method Option */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-on-surface-variant ml-1 block">Metode Pembayaran (Bayar Setelah Selesai)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {["QRIS", "Dana", "OVO", "GoPay"].map((method) => (
                    <div 
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`cursor-pointer p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                        paymentMethod === method 
                          ? "bg-secondary/10 border-secondary text-secondary"
                          : "bg-surface-container-high border-outline-variant/30 hover:border-outline-variant text-on-surface-variant"
                      }`}
                    >
                      {method}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-on-surface-variant/60 ml-1">Pembayaran dilakukan secara aman langsung ke Mitra via Bank/e-Wallet setelah pengerjaan divalidasi selesai.</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-3">
                <button 
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="flex-1 bg-surface-container-high border border-outline-variant/30 hover:bg-surface-container-highest py-3.5 px-5 rounded-2xl font-bold text-xs transition-all cursor-pointer text-center text-on-surface"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-secondary text-on-secondary hover:bg-secondary/90 py-3.5 px-5 rounded-2xl font-bold text-xs hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm font-bold">chat</span>
                  Kirim & Mulai Chat
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          localStorage.removeItem("pelanggan_token"); localStorage.removeItem("pelanggan_user"); localStorage.removeItem("pelanggan_id"); localStorage.removeItem("pelanggan_role");;
          navigate("/");
        }}
        role="pelanggan" 
      />
    </div>
  );
}

export default Dashboard;