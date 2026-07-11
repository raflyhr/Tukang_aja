import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminData } from "./adminData";
import LogoutModal from "../../components/LogoutModal";
import axios from "axios";

function DataTukang() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  // Interactive Tukang Data state
  const [tukangList, setTukangList] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const MOCK_TUKANG = [
    {
      id: "TKG-001",
      name: "Budi Santoso",
      specialty: "Tukang Kayu",
      location: "Jakarta Barat",
      status: "Aktif",
      rating: 4.8,
      reviews: 24,
      joinDate: "10/05/2026",
      avatar: "https://ui-avatars.com/api/?name=Budi+Santoso&background=random"
    },
    {
      id: "TKG-002",
      name: "Agus Prasetyo",
      specialty: "Tukang Ledeng",
      location: "Jakarta Selatan",
      status: "Ditinjau",
      rating: 4.5,
      reviews: 12,
      joinDate: "15/06/2026",
      avatar: "https://ui-avatars.com/api/?name=Agus+Prasetyo&background=random"
    },
    {
      id: "TKG-003",
      name: "Iwan Setiawan",
      specialty: "Tukang Kelistrikan",
      location: "Tangerang",
      status: "Tidak Aktif",
      rating: 4.2,
      reviews: 8,
      joinDate: "01/04/2026",
      avatar: "https://ui-avatars.com/api/?name=Iwan+Setiawan&background=random"
    },
    {
      id: "TKG-004",
      name: "Siti Rahma",
      specialty: "Pembersih Rumah",
      location: "Depok",
      status: "Aktif",
      rating: 4.9,
      reviews: 35,
      joinDate: "20/03/2026",
      avatar: "https://ui-avatars.com/api/?name=Siti+Rahma&background=random"
    }
  ];

  const handleUndoDeactivate = () => {
    setShowToast(false);
  };

  const filteredTukangs = tukangList.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredTukangs.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTukangs = filteredTukangs.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    fetchTukangList();
  }, []);

  const fetchTukangList = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/tukang`);
      if (response.data.status === 'Sukses') {
        const fetchedList = response.data.data.map(t => ({
          id: t.id,
          name: t.nama,
          specialty: t.keahlian,
          location: t.alamat,
          status: t.status_verifikasi === 'Menunggu' ? 'Ditinjau' : (t.status_verifikasi || (t.is_aktif ? 'Aktif' : 'Tidak Aktif')),
          rating: t.rating || 0.0,
          reviews: t.total_reviews || 0,
          joinDate: new Date(t.created_at).toLocaleDateString('id-ID'),
          avatar: t.foto_profil ? (t.foto_profil.startsWith('http') ? t.foto_profil : `${import.meta.env.VITE_API_BASE_URL}/storage/${t.foto_profil}`) : `https://ui-avatars.com/api/?name=${t.nama}&background=random`
        }));
        setTukangList(fetchedList);
      }
    } catch (error) {
      console.error("Failed to fetch tukang list, loading mock data:", error);
      setTukangList(MOCK_TUKANG);
    }
  };

  const handleDeactivate = async (id) => {
    if (confirm(`Apakah Anda yakin ingin mengubah status akun dengan ID ${id}?`)) {
      try {
        const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/admin/tukang/${id}/status`);
        if (response.data.status === 'Sukses') {
          fetchTukangList(); // Refresh data
          alert(response.data.message);
        }
      } catch (e) {
        alert("Gagal mengubah status tukang.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm(`Apakah Anda yakin ingin MENGHAPUS akun tukang dengan ID ${id} secara permanen? Tindakan ini tidak dapat dibatalkan.`)) {
      try {
        const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/admin/tukang/${id}`);
        if (response.data.status === 'Sukses') {
          fetchTukangList(); // Refresh data
          alert(response.data.message);
        }
      } catch (e) {
        alert("Gagal menghapus akun tukang.");
      }
    }
  };

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/admin/dashboard" },
    { id: "verifikasi", label: "Verifikasi Tukang", icon: "how_to_reg", path: "/admin/verifikasi" },
    { id: "data", label: "Data Tukang", icon: "engineering", path: "/admin/data", active: true },
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

      {/* SideNavBar - Styled exactly like the customer/admin dashboard */}
      <aside className={`h-screen w-64 fixed left-0 top-0 bg-surface-container flex flex-col py-6 px-4 z-50 border-r border-surface-variant/20 transition-transform duration-300 lg:transition-none lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-4 mb-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary/15 rounded-lg flex items-center justify-center text-secondary border border-secondary/10 shrink-0">
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>engineering</span>
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
                placeholder="Cari nama tukang atau kategori..." 
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
              <h1 className="text-2xl md:text-3xl font-black text-on-surface">Manajemen Data Tukang</h1>
              <p className="text-sm text-on-surface-variant/80 font-normal mt-1">Kelola dan pantau seluruh penyedia jasa profesional yang terdaftar.</p>
            </div>
            
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-surface-container border border-surface-variant/20 rounded-xl text-xs font-bold text-on-surface cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">file_download</span>
                Ekspor Data
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-on-secondary rounded-xl text-xs font-extrabold cursor-pointer border-none shadow-md shadow-secondary/15">
                <span className="material-symbols-outlined text-[16px]">add</span>
                Tambah Tukang
              </button>
            </div>
          </div>

          {/* Interactive Stats Panel */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-surface-container-high/40 p-4 rounded-xl border border-surface-variant/10 text-center shadow-inner">
              <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mb-1">Total Tukang</p>
              <h4 className="text-xl font-black text-on-surface">{tukangList.length}</h4>
            </div>
            <div className="bg-secondary/5 p-4 rounded-xl border border-secondary/20 text-center shadow-inner">
              <p className="text-secondary text-[10px] font-bold uppercase tracking-wider mb-1">Aktif</p>
              <h4 className="text-xl font-black text-secondary">{tukangList.filter(t => t.status === "Aktif").length}</h4>
            </div>
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 text-center shadow-inner">
              <p className="text-primary text-[10px] font-bold uppercase tracking-wider mb-1">Ditinjau</p>
              <h4 className="text-xl font-black text-primary">{tukangList.filter(t => t.status === "Ditinjau").length}</h4>
            </div>
            <div className="bg-surface-container-highest p-4 rounded-xl border border-surface-variant/20 text-center shadow-inner">
              <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mb-1">Tidak Aktif</p>
              <h4 className="text-xl font-black text-on-surface-variant">{tukangList.filter(t => t.status === "Tidak Aktif" || t.status === "Nonaktif" || t.status === "Ditolak").length}</h4>
            </div>
          </div>

          {/* Table Content */}
          <div className="bg-surface-container/60 border border-surface-variant/15 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-container-high/35 text-on-surface-variant uppercase text-[9px] font-bold tracking-widest border-b border-surface-variant/15">
                    <th className="px-6 py-4">Nama</th>
                    <th className="px-6 py-4">Kategori Jasa</th>
                    <th className="px-6 py-4">Lokasi</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Rating</th>
                    <th className="px-6 py-4">Tanggal Bergabung</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant/10 font-medium">
                  {paginatedTukangs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-on-surface-variant/65">
                        <span className="material-symbols-outlined text-3xl mb-1.5 text-secondary/45">search_off</span>
                        <p className="text-xs font-semibold">Tidak ada data tukang yang tersedia.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedTukangs.map((item) => (
                      <tr key={item.id} className="border-b border-surface-variant/10">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-surface-container-highest border border-surface-variant/20 overflow-hidden shrink-0">
                              <img className="w-full h-full object-cover" alt={item.name} src={item.avatar} />
                            </div>
                            <div>
                              <span className="block font-bold text-sm text-on-surface">{item.name}</span>
                              <span className="block text-[9px] text-on-surface-variant/65 font-mono">{item.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-on-surface font-semibold">{item.specialty}</td>
                        <td className="px-6 py-4 text-on-surface-variant">{item.location}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wide ${
                            item.status === "Aktif" 
                              ? "bg-green-500/10 border-green-500/20 text-green-400"
                              : item.status === "Ditinjau"
                              ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                              : "bg-red-500/10 border-red-500/20 text-red-400"
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 font-semibold">
                            <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            <span className="text-on-surface">{item.rating.toFixed(1)}</span>
                            <span className="text-[10px] text-on-surface-variant">({item.reviews})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant">{item.joinDate}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2.5">
                            <Link to={`/admin/verifikasi/${item.id}`} className="px-3 py-1.5 rounded-xl border border-outline-variant text-on-surface-variant text-xs font-bold bg-transparent cursor-pointer hover:bg-surface-container-highest transition-colors">
                              Lihat Profil
                            </Link>
                            {item.status === "Ditinjau" ? (
                              <Link to={`/admin/verifikasi/${item.id}`} className="px-3 py-1.5 rounded-xl bg-secondary text-on-secondary text-xs font-bold border-none cursor-pointer shadow-md shadow-secondary/20 flex items-center justify-center">
                                Verifikasi
                              </Link>
                            ) : (
                              <>
                                <button 
                                  onClick={() => handleDeactivate(item.id)}
                                  className={`px-3 py-1.5 rounded-xl border ${item.status === 'Aktif' ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-green-500/30 text-green-400 hover:bg-green-500/10'} text-xs font-bold bg-transparent cursor-pointer transition-colors`}
                                >
                                  {item.status === 'Aktif' ? 'Block Akun' : 'Aktifkan Akun'}
                                </button>
                                <button 
                                  onClick={() => handleDelete(item.id)}
                                  className="px-3 py-1.5 rounded-xl border border-red-600/40 text-red-500 hover:bg-red-500/10 text-xs font-bold bg-transparent cursor-pointer transition-colors flex items-center justify-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-[14px]">delete</span>
                                  Hapus
                                </button>
                              </>
                            )}
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
              <span className="text-xs text-on-surface-variant font-medium">
                Menampilkan {filteredTukangs.length > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + itemsPerPage, filteredTukangs.length)} dari {filteredTukangs.length} tukang
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

      {/* Floating Action Toast Notification Bar */}
      {showToast && (
        <div className="fixed bottom-6 right-8 left-6 md:left-[calc(256px+32px)] flex justify-between items-center bg-secondary text-on-secondary py-3 px-6 rounded-2xl shadow-2xl z-50">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-on-secondary">info</span>
            <p className="text-sm font-bold text-on-secondary">{toastMessage}</p>
          </div>
          <button 
            onClick={handleUndoDeactivate}
            className="text-xs font-extrabold underline text-on-secondary bg-transparent border-none cursor-pointer"
          >
            Batalkan
          </button>
        </div>
      )}

      {/* Decorative Background Glows */}
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

export default DataTukang;
