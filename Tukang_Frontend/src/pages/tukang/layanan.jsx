import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoutModal from "../../components/LogoutModal";
import api from "../../lib/axios";

function TukangLayanan() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [technicianName, setTechnicianName] = useState("Tukang");
  const [avatar, setAvatar] = useState("https://64.media.tumblr.com/c9a40e15310bd677150504d378595de4/708a33221029625f-0b/s1280x1920/3304739f2245fc3c15e6e70ffff7ee91b2d2ac69.jpg");
  const [isActiveWorking, setIsActiveWorking] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  const [layanans, setLayanans] = useState(() => {
    try {
      const cached = sessionStorage.getItem("tukang_layanans");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [tukangId, setTukangId] = useState(null);

  // Form modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newLayanan, setNewLayanan] = useState({ harga: "", satuan: "", deskripsi: "" });
  const [unitOption, setUnitOption] = useState("/ Unit");
  const [customUnit, setCustomUnit] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // 8 Kategori Utama based on user requirements
  const kategoriUtama = [
    { id: "listrik", nama: "Listrik", icon: "bolt", desc: "Instalasi & perbaikan listrik" },
    { id: "ac", nama: "AC", icon: "ac_unit", desc: "Cuci, tambah freon & pasang" },
    { id: "pipa", nama: "Pipa & Air", icon: "plumbing", desc: "Saluran air, keran & pompa" },
    { id: "cat", nama: "Cat Rumah", icon: "format_paint", desc: "Cat interior & eksterior" },
    { id: "atap", nama: "Atap Rumah", icon: "roofing", desc: "Perbaikan genteng & dak" },
    { id: "kayu", nama: "Pertukangan", icon: "carpenter", desc: "Pintu, kusen & furnitur kayu" },
    { id: "pindah", nama: "Pindahan Rumah", icon: "local_shipping", desc: "Jasa angkut & packing" },
    { id: "bersih", nama: "Kebersihan Rumah", icon: "cleaning_services", desc: "Cuci kasur, sofa & sapu pel" },
  ];

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/tukang/dashboard" },
    { id: "layanan", label: "Layanan Jasa", icon: "home_repair_service", path: "/tukang/layanan", active: true },
    { id: "pesanan", label: "Pesanan Saya", icon: "assignment", path: "/tukang/pesanan" },
    { id: "chat", label: "Chat", icon: "chat", path: "/tukang/chat" },
    { id: "profil", label: "Profil", icon: "person", path: "/tukang/profil" },
  ];

  useEffect(() => {
    const userDataStr = localStorage.getItem("tukang_user");
    let id = null;
    if (userDataStr) {
      try {
        const parsed = JSON.parse(userDataStr);
        if (parsed && parsed.tukang && parsed.tukang.id) {
          id = parsed.tukang.id;
          if (parsed.tukang.nama) setTechnicianName(parsed.tukang.nama);
          if (parsed.tukang.foto_profil) setAvatar(parsed.tukang.foto_profil.startsWith('http') ? parsed.tukang.foto_profil : `${import.meta.env.VITE_API_BASE_URL}/storage/${parsed.tukang.foto_profil}`);
        } else if (parsed && parsed.id) {
          id = parsed.id;
          if (parsed.nama) setTechnicianName(parsed.nama);
        } else if (parsed && parsed.user && parsed.user.id) {
          id = parsed.user.id;
        }
      } catch (e) {}
    }
    
    if (!id) {
      navigate("/");
      return;
    }
    setTukangId(id);
    fetchLayanan(id);
  }, []);

  const fetchLayanan = async (id) => {
    try {
      const res = await api.get(`/tukang/${id}`);
      if (res.data.status === 'Sukses' && res.data.data) {
        const layanansData = res.data.data.layanans || [];
        setLayanans(layanansData);
        sessionStorage.setItem("tukang_layanans", JSON.stringify(layanansData));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openForm = (kategori) => {
    setSelectedCategory(kategori);
    setNewLayanan({ harga: "", satuan: "", deskripsi: "" });
    setUnitOption("/ Unit");
    setCustomUnit("");
    setIsDropdownOpen(false);
    setIsFormOpen(true);
  };

  const handleAddLayanan = async (e) => {
    e.preventDefault();
    if (!tukangId || !selectedCategory) return;

    setIsSaving(true);
    try {
      const finalSatuan = unitOption === "Lainnya" ? customUnit : unitOption;
      const payload = {
        nama_layanan: selectedCategory.nama, // Use the fixed category name
        harga: newLayanan.harga,
        satuan: finalSatuan,
        deskripsi: newLayanan.deskripsi
      };

      const res = await api.post(`/tukang/${tukangId}/layanan`, payload);
      if(res.data.status === 'Sukses') {
        const next = [...layanans, res.data.data];
        setLayanans(next);
        sessionStorage.setItem("tukang_layanans", JSON.stringify(next));
        setIsFormOpen(false);
      }
    } catch (err) {
      alert("Gagal menambah layanan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLayanan = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/tukang/${tukangId}/layanan/${id}`);
      const next = layanans.filter(l => l.id !== id);
      setLayanans(next);
      sessionStorage.setItem("tukang_layanans", JSON.stringify(next));
    } catch (err) {
      alert("Gagal menghapus layanan");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("tukang_token");
    localStorage.removeItem("tukang_user");
    navigate("/");
  };

  return (
    <div className="bg-background text-on-surface min-h-screen selection:bg-secondary/30 selection:text-secondary font-sans relative overflow-x-hidden flex">
      {/* 1. Sidebar Navigation */}
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

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Main Content Wrapper */}
      <main className="flex-grow lg:ml-64 min-h-screen relative flex flex-col">
        <header className="flex items-center justify-between p-4 lg:p-6 bg-surface-container/50 backdrop-blur-md border-b border-surface-variant/15 z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 bg-surface-container-high rounded-xl text-on-surface hover:bg-surface-variant transition-colors cursor-pointer shadow-sm">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div>
              <h1 className="font-headline-md text-headline-sm lg:text-headline-md font-bold text-on-surface">Layanan Jasa</h1>
              <p className="text-xs text-on-surface-variant mt-0.5">Kelola daftar layanan dan harga yang Anda tawarkan.</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 chat-scrollbar">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Kategori Layanan Utama */}
            <section>
              <h2 className="text-xl font-bold text-on-surface mb-1">Kategori Layanan Utama</h2>
              <p className="text-sm text-on-surface-variant mb-6">Pilih kategori layanan jasa yang Anda butuhkan untuk menambahkan harga.</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {kategoriUtama.map((kategori) => (
                  <button 
                    key={kategori.id}
                    onClick={() => openForm(kategori)}
                    className="bg-surface-container rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 hover:bg-surface-container-high hover:scale-105 transition-all border border-surface-variant/10 shadow-sm cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                      <span className="material-symbols-outlined text-secondary text-2xl">{kategori.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-on-surface group-hover:text-secondary transition-colors">{kategori.nama}</h3>
                      <p className="text-[10px] text-on-surface-variant mt-1 line-clamp-2">{kategori.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Form Add Layanan (Modal-like Inline Section) */}
            {isFormOpen && selectedCategory && (
              <section className="bg-surface-container-high p-6 rounded-3xl border border-secondary/30 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-secondary"></div>
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">add_circle</span>
                    Tambah Layanan: {selectedCategory.nama}
                  </h3>
                  <button onClick={() => setIsFormOpen(false)} className="text-on-surface-variant hover:text-error transition-colors">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                
                <form onSubmit={handleAddLayanan} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Harga (Rp)</label>
                      <input 
                        type="number" 
                        placeholder="Contoh: 150000" 
                        required
                        value={newLayanan.harga} 
                        onChange={(e) => setNewLayanan({...newLayanan, harga: e.target.value})} 
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-1 focus:ring-secondary/50" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Satuan</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="w-full flex items-center justify-between bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-1 focus:ring-secondary/50 cursor-pointer text-left"
                        >
                          <span>{unitOption}</span>
                          <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                            keyboard_arrow_down
                          </span>
                        </button>
                        
                        {isDropdownOpen && (
                          <div className="absolute left-0 right-0 mt-2 z-50 bg-surface-container-high border border-outline-variant/30 rounded-xl shadow-2xl overflow-hidden py-1">
                            {["/ Unit", "/ Jam", "/ Hari", "Lainnya"].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  setUnitOption(opt);
                                  setIsDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-secondary/15 hover:text-secondary transition-colors cursor-pointer block ${
                                  unitOption === opt ? 'bg-secondary/10 text-secondary' : 'text-on-surface-variant'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {unitOption === "Lainnya" && (
                    <div className="focus-within:scale-[1.01] transition-transform duration-200">
                      <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Satuan Kustom</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: / Meter, / m², / Dus" 
                        required
                        value={customUnit} 
                        onChange={(e) => setCustomUnit(e.target.value)} 
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-1 focus:ring-secondary/50" 
                      />
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Deskripsi Detail</label>
                    <textarea 
                      placeholder="Contoh: Cuci AC split 1/2 PK - 1 PK termasuk tambah freon..." 
                      rows="2"
                      value={newLayanan.deskripsi} 
                      onChange={(e) => setNewLayanan({...newLayanan, deskripsi: e.target.value})} 
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-1 focus:ring-secondary/50 resize-none" 
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <button 
                      type="submit" 
                      disabled={isSaving}
                      className="px-6 py-2.5 bg-secondary text-on-secondary rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-secondary/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-on-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        "Simpan Layanan"
                      )}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* List Layanan Anda */}
            <section>
              <h2 className="text-xl font-bold text-on-surface mb-6 border-b border-surface-variant/20 pb-4">Layanan Jasa Anda</h2>
              
              {layanans.length === 0 ? (
                <div className="text-center py-12 bg-surface-container rounded-3xl border border-surface-variant/20 border-dashed">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/50 mb-2">home_repair_service</span>
                  <p className="text-sm font-bold text-on-surface-variant/70">Belum ada layanan jasa</p>
                  <p className="text-xs text-on-surface-variant mt-1">Pilih kategori di atas untuk menambahkan daftar harga Anda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {layanans.map((layanan) => {
                    // Match icon with kategori
                    const matchedCat = kategoriUtama.find(k => k.nama === layanan.nama_layanan);
                    const icon = matchedCat ? matchedCat.icon : "build";
                    
                    return (
                      <div key={layanan.id} className="bg-surface-container rounded-2xl p-5 border border-surface-variant/15 hover:shadow-md transition-shadow relative group flex flex-col">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-on-surface-variant">{icon}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-on-surface">{layanan.nama_layanan}</h4>
                            <span className="font-black text-secondary text-base">
                              {layanan.harga ? `Rp ${parseInt(layanan.harga).toLocaleString('id-ID')}` : 'Hubungi'} 
                              <span className="text-[10px] font-normal text-on-surface-variant ml-1">{layanan.satuan}</span>
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-on-surface-variant flex-1">{layanan.deskripsi}</p>
                        
                        <button 
                          onClick={() => handleDeleteLayanan(layanan.id)}
                          disabled={deletingId === layanan.id}
                          className={`absolute top-3 right-3 text-red-400 bg-red-500/10 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-red-500/20 disabled:cursor-not-allowed ${
                            deletingId === layanan.id 
                              ? "opacity-100 cursor-default" 
                              : "opacity-0 group-hover:opacity-100"
                          }`}
                          title="Hapus Layanan"
                        >
                          {deletingId === layanan.id ? (
                            <svg className="animate-spin h-4 w-4 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

          </div>
        </div>
      </main>

      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={handleLogout} 
        role="teknisi" 
      />
    </div>
  );
}

export default TukangLayanan;
