import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminData } from "./adminData";
import LogoutModal from "../../components/LogoutModal";
import api from "../../lib/axios";

const MOCK_PELANGGAN = [
  {
    id: "PLG-001",
    nama: "Rian Hidayat",
    email: "rian.hid@gmail.com",
    no_hp: "081234567890",
    alamat: "Kebon Jeruk, Jakarta Barat",
    status: "Aktif",
    transaksi: 14,
    total_pengeluaran: 2450000,
    tanggal_daftar: "12 Jan 2026",
    avatar: "https://ui-avatars.com/api/?name=Rian+Hidayat&background=random"
  },
  {
    id: "PLG-002",
    nama: "Dewi Lestari",
    email: "dewi.les@yahoo.com",
    no_hp: "089876543210",
    alamat: "Kemang, Jakarta Selatan",
    status: "Aktif",
    transaksi: 8,
    total_pengeluaran: 1250000,
    tanggal_daftar: "05 Feb 2026",
    avatar: "https://ui-avatars.com/api/?name=Dewi+Lestari&background=random"
  },
  {
    id: "PLG-003",
    nama: "Andi Wijaya",
    email: "andi.wij@outlook.com",
    no_hp: "087711223344",
    alamat: "Serpong, Tangerang",
    status: "Suspended",
    transaksi: 2,
    total_pengeluaran: 300000,
    tanggal_daftar: "20 Mar 2026",
    avatar: "https://ui-avatars.com/api/?name=Andi+Wijaya&background=random"
  },
  {
    id: "PLG-004",
    nama: "Budi Pratama",
    email: "budi.prat@gmail.com",
    no_hp: "081122334455",
    alamat: "Depok Baru, Depok",
    status: "Aktif",
    transaksi: 18,
    total_pengeluaran: 4100000,
    tanggal_daftar: "15 Oct 2025",
    avatar: "https://ui-avatars.com/api/?name=Budi+Pratama&background=random"
  },
  {
    id: "PLG-005",
    nama: "Siti Aminah",
    email: "siti.aminah@gmail.com",
    no_hp: "081255667788",
    alamat: "Dago, Bandung",
    status: "Aktif",
    transaksi: 5,
    total_pengeluaran: 850000,
    tanggal_daftar: "01 Apr 2026",
    avatar: "https://ui-avatars.com/api/?name=Siti+Aminah&background=random"
  }
];

function DataPelanggan() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  // Data State
  const [pelangganList, setPelangganList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  
  // Modal States
  const [selectedPelanggan, setSelectedPelanggan] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ nama: "", email: "", no_hp: "", alamat: "" });

  useEffect(() => {
    fetchPelangganList();
  }, []);

  const fetchPelangganList = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await api.get(`/admin/pelanggan`);
      if (response.data.status === 'Sukses') {
        const fetched = response.data.data.map(p => ({
          id: p.id,
          nama: p.name,
          email: p.email,
          no_hp: p.no_hp || "-",
          alamat: p.alamat || "-",
          status: p.is_active ? "Aktif" : "Suspended",
          transaksi: p.transaksi_count || 0,
          total_pengeluaran: p.total_spending || 0,
          tanggal_daftar: new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          avatar: p.avatar ? (p.avatar.startsWith('http') ? p.avatar : `${import.meta.env.VITE_API_BASE_URL}/storage/${p.avatar}`) : `https://ui-avatars.com/api/?name=${p.name}&background=random`
        }));
        setPelangganList(fetched);
      } else {
        setPelangganList(MOCK_PELANGGAN);
      }
    } catch (e) {
      console.error("Failed to fetch pelanggan, using mock fallback:", e);
      setPelangganList(MOCK_PELANGGAN);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = async (id, currentStatus) => {
    const nextStatus = currentStatus === "Aktif" ? "Suspended" : "Aktif";
    if (confirm(`Apakah Anda yakin ingin mengubah status akun ${id} menjadi ${nextStatus}?`)) {
      try {
        const response = await api.put(`/admin/pelanggan/${id}/status`);
        if (response.data.status === 'Sukses') {
          fetchPelangganList();
          alert(`Status pelanggan ${id} berhasil diubah.`);
        }
      } catch (e) {
        alert("Gagal mengubah status pelanggan.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm(`Apakah Anda yakin ingin menghapus pelanggan dengan ID ${id}? Tindakan ini permanen.`)) {
      try {
        const response = await api.delete(`/admin/pelanggan/${id}`);
        if (response.data.status === 'Sukses') {
          fetchPelangganList();
          alert(`Pelanggan ${id} berhasil dihapus.`);
        }
      } catch (e) {
        alert("Gagal menghapus pelanggan.");
      }
    }
  };

  const openDetail = (pelanggan) => {
    setSelectedPelanggan(pelanggan);
    setIsDetailOpen(true);
  };

  const openEdit = (pelanggan) => {
    setSelectedPelanggan(pelanggan);
    setEditForm({
      nama: pelanggan.nama,
      email: pelanggan.email,
      no_hp: pelanggan.no_hp,
      alamat: pelanggan.alamat
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setPelangganList(prev =>
      prev.map(p => p.id === selectedPelanggan.id ? { ...p, ...editForm } : p)
    );
    setIsEditOpen(false);
    alert("Profil pelanggan berhasil diperbarui!");
  };

  const filteredPelanggans = pelangganList.filter(p => {
    const matchesSearch = 
      p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(p.id).toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === "Semua") return matchesSearch;
    return matchesSearch && p.status === statusFilter;
  });

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/admin/dashboard" },
    { id: "verifikasi", label: "Verifikasi Tukang", icon: "how_to_reg", path: "/admin/verifikasi" },
    { id: "data", label: "Data Tukang", icon: "engineering", path: "/admin/data" },
    { id: "pelanggan", label: "Data Pelanggan", icon: "group", path: "/admin/pelanggan", active: true },
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
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
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
                placeholder="Cari nama atau email pelanggan..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-on-surface">Manajemen Data Pelanggan</h1>
              <p className="text-sm text-on-surface-variant/80 font-normal mt-1">Kelola dan pantau seluruh pelanggan terdaftar yang menggunakan layanan TukangAja.</p>
            </div>
            
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-surface-container border border-surface-variant/20 rounded-xl text-xs font-bold text-on-surface cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">file_download</span>
                Ekspor Data
              </button>
            </div>
          </div>

          {/* Interactive Stats Panel */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-surface-container-high/40 p-4 rounded-xl border border-surface-variant/10 text-center shadow-inner">
              <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mb-1">Total Pelanggan</p>
              <h4 className="text-xl font-black text-on-surface">{pelangganList.length}</h4>
            </div>
            <div className="bg-secondary/5 p-4 rounded-xl border border-secondary/20 text-center shadow-inner">
              <p className="text-secondary text-[10px] font-bold uppercase tracking-wider mb-1">Status Aktif</p>
              <h4 className="text-xl font-black text-secondary">{pelangganList.filter(p => p.status === "Aktif").length}</h4>
            </div>
            <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/20 text-center shadow-inner">
              <p className="text-red-400 text-[10px] font-bold uppercase tracking-wider mb-1">Suspended</p>
              <h4 className="text-xl font-black text-red-400">{pelangganList.filter(p => p.status === "Suspended").length}</h4>
            </div>
            <div className="bg-surface-container-highest p-4 rounded-xl border border-surface-variant/20 text-center shadow-inner">
              <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mb-1">Total Transaksi</p>
              <h4 className="text-xl font-black text-on-surface">{pelangganList.reduce((acc, curr) => acc + curr.transaksi, 0)}</h4>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex gap-2 mb-4">
            <span className="text-xs font-bold text-on-surface-variant flex items-center">Filter Status:</span>
            {["Semua", "Aktif", "Suspended"].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  statusFilter === status 
                    ? "bg-secondary/15 text-secondary border-secondary/35"
                    : "bg-surface-container-high text-on-surface-variant border-surface-variant/10"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Table Content */}
          <div className="bg-surface-container/60 border border-surface-variant/15 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-container-high/35 text-on-surface-variant uppercase text-[9px] font-bold tracking-widest border-b border-surface-variant/15">
                    <th className="px-6 py-4">Nama Pelanggan</th>
                    <th className="px-6 py-4">Kontak</th>
                    <th className="px-6 py-4">Alamat</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Transaksi</th>
                    <th className="px-6 py-4">Total Pengeluaran</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant/10 font-medium">
                  {isLoading ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-on-surface-variant/65">
                        <p className="text-xs animate-pulse">Memuat data pelanggan...</p>
                      </td>
                    </tr>
                  ) : filteredPelanggans.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-on-surface-variant/65">
                        <span className="material-symbols-outlined text-3xl mb-1.5 text-secondary/45">search_off</span>
                        <p className="text-xs font-semibold">Tidak ada data pelanggan yang cocok.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPelanggans.map((item) => (
                      <tr key={item.id} className="border-b border-surface-variant/10">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-surface-container-highest border border-surface-variant/20 overflow-hidden shrink-0">
                              <img className="w-full h-full object-cover" alt={item.nama} src={item.avatar} />
                            </div>
                            <div>
                              <span className="block font-bold text-sm text-on-surface">{item.nama}</span>
                              <span className="block text-[9px] text-on-surface-variant/65 font-mono">{item.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="block text-on-surface">{item.email}</span>
                          <span className="block text-[10px] text-on-surface-variant mt-0.5">{item.no_hp}</span>
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant max-w-[200px] truncate">{item.alamat}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wide ${
                            item.status === "Aktif" 
                              ? "bg-green-500/10 border-green-500/20 text-green-400"
                              : "bg-red-500/10 border-red-500/20 text-red-400"
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-on-surface">{item.transaksi}x</td>
                        <td className="px-6 py-4 text-on-surface font-semibold">Rp {item.total_pengeluaran.toLocaleString('id-ID')}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => openDetail(item)}
                              className="p-1.5 bg-surface-container border border-surface-variant/20 rounded-lg text-on-surface-variant hover:text-on-surface cursor-pointer"
                              title="Lihat Detail"
                            >
                              <span className="material-symbols-outlined text-[16px]">visibility</span>
                            </button>
                            <button 
                              onClick={() => openEdit(item)}
                              className="p-1.5 bg-surface-container border border-surface-variant/20 rounded-lg text-on-surface-variant hover:text-on-surface cursor-pointer"
                              title="Edit Profil"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button 
                              onClick={() => handleDeactivate(item.id, item.status)}
                              className={`p-1.5 border rounded-lg cursor-pointer ${
                                item.status === "Aktif"
                                  ? "border-red-500/20 text-red-400 hover:bg-red-500/10"
                                  : "border-green-500/20 text-green-400 hover:bg-green-500/10"
                              }`}
                              title={item.status === "Aktif" ? "Suspend" : "Aktifkan"}
                            >
                              <span className="material-symbols-outlined text-[16px]">block</span>
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer"
                              title="Hapus"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-5 border-t border-surface-variant/15 flex items-center justify-between bg-surface-container-high/20">
              <span className="text-xs text-on-surface-variant font-medium">Menampilkan 1 - {filteredPelanggans.length} dari {filteredPelanggans.length} pelanggan</span>
              <div className="flex gap-1.5">
                <button className="p-1.5 rounded-lg border border-surface-variant/20 text-on-surface-variant bg-transparent cursor-pointer" disabled>
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
                <button className="w-8 h-8 rounded-lg bg-secondary text-on-secondary text-xs font-bold shadow-md shadow-secondary/10 border-none cursor-pointer">1</button>
                <button className="p-1.5 rounded-lg border border-surface-variant/20 text-on-surface-variant bg-transparent cursor-pointer" disabled>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {isDetailOpen && selectedPelanggan && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container border border-surface-variant/20 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-surface-container-highest p-6 flex justify-between items-center border-b border-surface-variant/15">
              <h3 className="font-bold text-on-surface">Detail Akun Pelanggan</h3>
              <button onClick={() => setIsDetailOpen(false)} className="text-on-surface-variant hover:text-on-surface cursor-pointer bg-transparent border-none">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <img className="w-16 h-16 rounded-full object-cover border border-outline-variant" src={selectedPelanggan.avatar} alt={selectedPelanggan.nama} />
                <div>
                  <h4 className="font-bold text-lg text-on-surface">{selectedPelanggan.nama}</h4>
                  <p className="text-xs text-on-surface-variant">{selectedPelanggan.id}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                <div>
                  <span className="text-on-surface-variant block">Email</span>
                  <span className="text-on-surface mt-1 block">{selectedPelanggan.email}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block">No. Telepon</span>
                  <span className="text-on-surface mt-1 block">{selectedPelanggan.no_hp}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block">Tanggal Daftar</span>
                  <span className="text-on-surface mt-1 block">{selectedPelanggan.tanggal_daftar}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block">Status</span>
                  <span className="text-on-surface mt-1 block">{selectedPelanggan.status}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block">Total Transaksi</span>
                  <span className="text-on-surface mt-1 block">{selectedPelanggan.transaksi}x Pemesanan</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block">Total Pengeluaran</span>
                  <span className="text-on-surface mt-1 block">Rp {selectedPelanggan.total_pengeluaran.toLocaleString('id-ID')}</span>
                </div>
              </div>
              <div>
                <span className="text-on-surface-variant block text-xs font-bold mb-1">Alamat Terdaftar</span>
                <p className="text-xs text-on-surface bg-surface-container-high/50 p-3 rounded-lg border border-surface-variant/10 leading-relaxed">{selectedPelanggan.alamat}</p>
              </div>
            </div>
            <div className="p-6 bg-surface-container-high/40 border-t border-surface-variant/15 flex justify-end">
              <button onClick={() => setIsDetailOpen(false)} className="px-4 py-2 bg-secondary text-on-secondary font-bold rounded-xl border-none cursor-pointer">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && selectedPelanggan && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleEditSubmit} className="bg-surface-container border border-surface-variant/20 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-surface-container-highest p-6 flex justify-between items-center border-b border-surface-variant/15">
              <h3 className="font-bold text-on-surface">Edit Profil Pelanggan</h3>
              <button type="button" onClick={() => setIsEditOpen(false)} className="text-on-surface-variant hover:text-on-surface cursor-pointer bg-transparent border-none">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={editForm.nama} 
                  onChange={(e) => setEditForm(prev => ({ ...prev, nama: e.target.value }))}
                  required 
                  className="w-full bg-surface-container-high border border-surface-variant/25 rounded-xl text-on-surface p-2.5 text-xs outline-none focus:ring-1 focus:ring-secondary/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant">Email</label>
                <input 
                  type="email" 
                  value={editForm.email} 
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  required 
                  className="w-full bg-surface-container-high border border-surface-variant/25 rounded-xl text-on-surface p-2.5 text-xs outline-none focus:ring-1 focus:ring-secondary/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant">No. HP</label>
                <input 
                  type="text" 
                  value={editForm.no_hp} 
                  onChange={(e) => setEditForm(prev => ({ ...prev, no_hp: e.target.value }))}
                  required 
                  className="w-full bg-surface-container-high border border-surface-variant/25 rounded-xl text-on-surface p-2.5 text-xs outline-none focus:ring-1 focus:ring-secondary/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant">Alamat</label>
                <textarea 
                  value={editForm.alamat} 
                  onChange={(e) => setEditForm(prev => ({ ...prev, alamat: e.target.value }))}
                  required 
                  rows="3"
                  className="w-full bg-surface-container-high border border-surface-variant/25 rounded-xl text-on-surface p-2.5 text-xs outline-none focus:ring-1 focus:ring-secondary/50"
                />
              </div>
            </div>
            <div className="p-6 bg-surface-container-high/40 border-t border-surface-variant/15 flex gap-3">
              <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 py-2.5 border border-surface-variant/20 text-on-surface font-bold rounded-xl bg-transparent cursor-pointer">Batal</button>
              <button type="submit" className="flex-1 py-2.5 bg-secondary text-on-secondary font-bold rounded-xl border-none cursor-pointer">Simpan Perubahan</button>
            </div>
          </form>
        </div>
      )}

      {/* Decorative Glows */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-secondary/5 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-primary/5 blur-[80px] rounded-full"></div>
      </div>

      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={() => navigate("/")} 
        role="admin" 
      />
    </div>
  );
}

export default DataPelanggan;
