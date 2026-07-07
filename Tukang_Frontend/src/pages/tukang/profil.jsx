import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../lib/axios";

function TukangProfil() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  // Ambil data awal secara sinkron (langsung) dari localStorage untuk mencegah efek kedip/delay
  const getInitialProfile = () => {
    try {
      const userDataStr = localStorage.getItem("tukang_user");
      if (userDataStr) {
        const parsed = JSON.parse(userDataStr);
        if (parsed?.tukang) {
          const t = parsed.tukang;
          return {
            id: t.id || null,
            fullName: t.nama || "",
            email: parsed.user?.email || "",
            phone: t.nomor_telepon || "",
            category: t.keahlian || "",
            rating: t.rating || "0.0",
            reviewsCount: 0,
            avatar: t.foto_profil ? (t.foto_profil.startsWith('http') ? t.foto_profil : `${import.meta.env.VITE_API_BASE_URL}/storage/${t.foto_profil}`) : "https://ui-avatars.com/api/?name=" + (t.nama || "Tukang") + "&background=random"
          };
        }
      }
    } catch (e) {}
    
    return {
      id: null,
      fullName: "",
      email: "",
      phone: "",
      category: "",
      rating: "0.0",
      reviewsCount: 0,
      avatar: "https://ui-avatars.com/api/?name=User&background=random"
    };
  };

  // Profile data (technician state) diisi langsung dari data localStorage
  const [profileData, setProfileData] = useState(getInitialProfile());

  // Coverage radius and area
  const [radius, setRadius] = useState(15);
  const [coverageArea, setCoverageArea] = useState("Jakarta Selatan, Pusat, dan sebagian Jakarta Timur");

  // Skills state
  const [skills, setSkills] = useState([
    "Instalasi AC",
    "Perbaikan Panel Listrik",
    "Instalasi Pompa Air",
    "Pipa & Plambing",
    "Maintenance Gedung",
    "CCTV Setup"
  ]);

  // Skill form state
  const [isSkillFormOpen, setIsSkillFormOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  
  // Dynamic features states
  const [sertifikats, setSertifikats] = useState([]);
  const [layanans, setLayanans] = useState([]);
  const [portofolios, setPortofolios] = useState([]);
  
  // Forms state for dynamic features
  const [newSertifikat, setNewSertifikat] = useState({ judul: "", penerbit: "", tahun: "", deskripsi: "" });
  const [isSertifikatFormOpen, setIsSertifikatFormOpen] = useState(false);
  
  const [newPortofolio, setNewPortofolio] = useState({ judul: "", deskripsi: "", foto: null });
  const [isPortofolioFormOpen, setIsPortofolioFormOpen] = useState(false);

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/tukang/dashboard" },
    { id: "layanan", label: "Layanan Jasa", icon: "home_repair_service", path: "/tukang/layanan" },
    { id: "pesanan", label: "Pesanan Saya", icon: "assignment", path: "/tukang/pesanan" },
    { id: "chat", label: "Chat", icon: "chat", path: "/tukang/chat" },
    { id: "profil", label: "Profil", icon: "person", path: "/tukang/profil", active: true },
  ];

  // Fetch profil saat komponen dimuat
  useEffect(() => {
    const userDataStr = localStorage.getItem("tukang_user");
    let id = null;
    if (userDataStr) {
      try {
        const parsed = JSON.parse(userDataStr);
        if (parsed && parsed.tukang && parsed.tukang.id) {
          id = parsed.tukang.id;
        }
      } catch (e) {}
    }
    
    if (id) {
      fetchProfil(id);
    } else {
      navigate("/");
    }
  }, []);

  const fetchProfil = async (id) => {
    try {
      const res = await api.get(`/tukang/${id}`);
      if (res.data.status === 'Sukses') {
        const data = res.data.data;
        setProfileData({
          id: data.id,
          fullName: data.nama || "",
          email: data.user?.email || "",
          phone: data.no_hp || "",
          category: data.keahlian || "",
          rating: data.rating || "0.0",
          reviewsCount: data.ulasans?.length || 0,
          avatar: data.foto_profil ? (data.foto_profil.startsWith('http') ? data.foto_profil : `${import.meta.env.VITE_API_BASE_URL}/storage/${data.foto_profil}`) : "https://64.media.tumblr.com/c9a40e15310bd677150504d378595de4/708a33221029625f-0b/s1280x1920/3304739f2245fc3c15e6e70ffff7ee91b2d2ac69.jpg"
        });
        setRadius(data.radius_layanan || 15);
        setCoverageArea(data.area_cakupan || "");
        if (data.keahlian_tambahan && Array.isArray(data.keahlian_tambahan)) {
          setSkills(data.keahlian_tambahan);
        } else {
          setSkills([]);
        }
        
        // Populate new dynamic data
        setSertifikats(data.sertifikats || []);
        setPortofolios(data.portofolios || []);
      }
    } catch (err) {
      console.error("Gagal load profil", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("tukang_token");
    localStorage.removeItem("tukang_user");
    navigate("/");
  };

  const handleSaveProfile = async () => {
    if (!profileData.id) return;
    try {
      await api.put(`/tukang/${profileData.id}/profil`, {
        nama: profileData.fullName,
        no_hp: profileData.phone,
        keahlian: profileData.category,
        radius_layanan: radius,
        area_cakupan: coverageArea,
        keahlian_tambahan: skills
      });
      alert("Perubahan profil teknisi berhasil disimpan!");
    } catch (err) {
      alert("Gagal menyimpan profil.");
      console.error(err);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    if (!skills.includes(newSkillName.trim())) {
      setSkills([...skills, newSkillName.trim()]);
    }
    setNewSkillName("");
    setIsSkillFormOpen(false);
  };

  const handleDeleteSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleAddSertifikat = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/tukang/${profileData.id}/sertifikat`, newSertifikat);
      if(res.data.status === 'Sukses') {
        setSertifikats([...sertifikats, res.data.data]);
        setNewSertifikat({ judul: "", penerbit: "", tahun: "", deskripsi: "" });
        setIsSertifikatFormOpen(false);
      }
    } catch (err) { alert("Gagal menambah sertifikat"); }
  };

  const handleDeleteSertifikat = async (id) => {
    try {
      await api.delete(`/tukang/${profileData.id}/sertifikat/${id}`);
      setSertifikats(sertifikats.filter(s => s.id !== id));
    } catch (err) { alert("Gagal menghapus sertifikat"); }
  };

  const handleAddPortofolio = async (e) => {
    e.preventDefault();
    if (!newPortofolio.foto) return alert("Foto wajib diunggah!");
    try {
      const formData = new FormData();
      formData.append('judul', newPortofolio.judul);
      formData.append('deskripsi', newPortofolio.deskripsi);
      formData.append('foto', newPortofolio.foto);

      const res = await api.post(`/tukang/${profileData.id}/portofolio`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if(res.data.status === 'Sukses') {
        setPortofolios([...portofolios, res.data.data]);
        setNewPortofolio({ judul: "", deskripsi: "", foto: null });
        setIsPortofolioFormOpen(false);
      }
    } catch (err) { alert("Gagal menambah portofolio"); }
  };

  const handleDeletePortofolio = async (id) => {
    try {
      await api.delete(`/tukang/${profileData.id}/portofolio/${id}`);
      setPortofolios(portofolios.filter(p => p.id !== id));
    } catch (err) { alert("Gagal menghapus portofolio"); }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen selection:bg-secondary/30 selection:text-secondary font-sans relative overflow-hidden flex">
      {/* Backdrop for Mobile Sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SideNavBar */}
      <aside
        className={`h-screen w-64 fixed left-0 top-0 bg-surface-container flex flex-col py-6 px-4 z-50 border-r border-surface-variant/20 transition-transform duration-300 lg:transition-none lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
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
            );
          })}
        </nav>
        <div className="mt-auto pt-4 border-t border-surface-variant/20">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/30 shrink-0">
                <img
                  className="w-full h-full object-cover"
                  alt={profileData.fullName}
                  src={profileData.avatar}
                />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-on-surface truncate">
                  {profileData.fullName}
                </h4>
                <p className="text-xs text-secondary truncate">
                  Elite Technician
                </p>
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
              <h2 className="font-headline-md text-headline-md font-bold text-secondary">
                Profil Saya
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-secondary/15 rounded-full border border-secondary/20">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] text-secondary font-extrabold uppercase tracking-wider">
                Online
              </span>
            </div>
            <Link
              to="/notifikasi"
              className="p-2 text-on-surface-variant hover:text-secondary transition-colors relative cursor-pointer flex items-center justify-center"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full"></span>
            </Link>
            <Link
              to="/bantuan"
              className="p-2 text-on-surface-variant hover:text-secondary transition-colors cursor-pointer flex items-center justify-center"
            >
              <span className="material-symbols-outlined">help</span>
            </Link>
            <div className="h-10 w-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/30 ml-2">
              <img
                className="w-full h-full object-cover"
                alt={profileData.fullName}
                src={profileData.avatar}
              />
            </div>
          </div>
        </header>

        {/* Canvas */}
        <div className="pt-28 pb-12 px-6 md:px-12 max-w-5xl w-full mx-auto space-y-8 flex-grow page-transition">
          {/* Header Profil */}
          <section className="bg-surface-container rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6 border border-surface-variant/15 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 blur-[100px] pointer-events-none"></div>

            <div className="relative group">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-surface-container-high overflow-hidden shadow-xl">
                <img
                  className="w-full h-full object-cover"
                  alt={profileData.fullName}
                  src={profileData.avatar}
                />
              </div>
              <button className="absolute bottom-0 right-0 bg-secondary text-on-secondary p-1.5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer border-none flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">
                  edit
                </span>
              </button>
            </div>

            <div className="text-center sm:text-left space-y-1 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                <h3 className="text-xl font-extrabold text-on-surface">
                  {profileData.fullName}
                </h3>
                <span className="inline-block text-[10px] bg-secondary/15 border border-secondary/20 px-2.5 py-0.5 rounded-full text-secondary font-bold self-center">
                  ★ {profileData.rating} ({profileData.reviewsCount} Ulasan)
                </span>
              </div>
              <p className="text-xs text-on-surface-variant/85">
                {profileData.category} • {profileData.email}
              </p>
              <span className="inline-block mt-2 text-[10px] bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 rounded-full text-green-400 font-bold uppercase tracking-wider">
                AKUN TERVERIFIKASI
              </span>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="border border-outline-variant hover:border-secondary hover:text-secondary text-on-surface-variant px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-transparent flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">share</span>
                Bagikan Profil
              </button>
              <button className="border border-outline-variant hover:border-secondary hover:text-secondary text-on-surface-variant px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-transparent">
                Ganti Foto Profil
              </button>
            </div>
          </section>

          {/* Symmetrical Balanced Grid Layout (2 Columns of equal height) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Personal Info & Service Area (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Informasi Pribadi */}
              <div className="bg-surface-container rounded-3xl border border-surface-variant/15 overflow-hidden shadow-lg">
                <div className="px-6 py-4 bg-surface-container-high/60 border-b border-surface-variant/10 flex justify-between items-center">
                  <h4 className="font-bold text-sm text-on-surface">
                    Informasi Pribadi &amp; Jasa
                  </h4>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant/70 uppercase tracking-wider block">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:ring-1 focus:ring-secondary/50 focus:border-secondary/50 transition-all outline-none"
                      value={profileData.fullName}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          fullName: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-on-surface-variant/70 uppercase tracking-wider block">
                        Email Utama
                      </label>
                      <input
                        type="email"
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:ring-1 focus:ring-secondary/50 focus:border-secondary/50 transition-all outline-none"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-on-surface-variant/70 uppercase tracking-wider block">
                        Nomor Telepon
                      </label>
                      <input
                        type="text"
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:ring-1 focus:ring-secondary/50 focus:border-secondary/50 transition-all outline-none"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant/70 uppercase tracking-wider block">
                      Kategori Pekerjaan Utama
                    </label>
                    <input
                      type="text"
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:ring-1 focus:ring-secondary/50 focus:border-secondary/50 transition-all outline-none"
                      value={profileData.category}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          category: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Jangkauan Kerja & Wilayah */}
              <div className="bg-surface-container rounded-3xl border border-surface-variant/15 overflow-hidden shadow-lg p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-on-surface">
                    Jangkauan Kerja
                  </h4>
                  <span className="bg-secondary/15 text-secondary text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                    Radius {radius} km
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="rounded-2xl overflow-hidden relative group h-28 border border-surface-variant/10">
                    <div
                      className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{
                        backgroundImage:
                          "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDPgyKBXcsV-z7hqbp0gtCraF1KkLvzwECqHyoPGXLOCBnpUfnlguyJgvvdD9SzMEbm9zaT73jTjMdpH21uouAOF2HcClGdiuf4RqPAUQOM5e-4xKZ5DhD0DV775Bc7gignmj9j9j1g5A3JqeqCm3Bft2WC5WYLiBtpo19P43XMVOnUEistzQT-jW-EoQk0KG0FLVINPD9cTnwQ46ZUMR_0SJU-7CGoTPHNTtwdnrJpHnK7qY5hd2_2NBHiV9lpS-vuZlR79GWWNljB')",
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                      <span>Atur Jari-jari Layanan</span>
                      <span className="text-secondary">{radius} km</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      step="5"
                      value={radius}
                      onChange={(e) => setRadius(parseInt(e.target.value))}
                      className="w-full accent-secondary cursor-pointer h-1 bg-surface-container-high rounded-lg appearance-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                      Area Cakupan
                    </label>
                    <input
                      type="text"
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs text-on-surface outline-none focus:ring-1 focus:ring-secondary/50"
                      value={coverageArea}
                      onChange={(e) => setCoverageArea(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Skills list & Security Cards (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
              {/* Keahlian Jasa Teknisi */}
              <div className="bg-surface-container rounded-3xl border border-surface-variant/15 overflow-hidden shadow-lg flex flex-col justify-between">
                <div>
                  <div className="px-6 py-4 bg-surface-container-high/60 border-b border-surface-variant/10 flex justify-between items-center">
                    <h4 className="font-bold text-sm text-on-surface">
                      Keahlian Jasa Teknisi
                    </h4>
                    <button
                      onClick={() => {
                        setNewSkillName("");
                        setIsSkillFormOpen(true);
                      }}
                      className="text-secondary hover:underline text-xs font-bold bg-transparent border-none cursor-pointer"
                    >
                      Tambah
                    </button>
                  </div>

                  <div className="p-6 space-y-3 flex-grow overflow-y-auto max-h-[170px]">
                    {skills.map((skill, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 border rounded-xl bg-surface-container-low/50 border-outline-variant/20 flex justify-between items-center transition-colors hover:border-secondary/20"
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-xs text-secondary">
                            construction
                          </span>
                          <span className="font-bold text-xs text-on-surface">
                            {skill}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteSkill(skill)}
                          className="text-on-surface-variant hover:text-red-400 transition-colors p-1 flex items-center justify-center cursor-pointer bg-transparent border-none"
                          title="Hapus Keahlian"
                        >
                          <span className="material-symbols-outlined text-[15px]">
                            delete
                          </span>
                        </button>
                      </div>
                    ))}

                    {/* Skill Form Container */}
                    {isSkillFormOpen && (
                      <form
                        onSubmit={handleAddSkill}
                        className="mt-4 p-4 border border-outline-variant/30 rounded-2xl bg-surface-container-high/40 space-y-3"
                      >
                        <h5 className="font-bold text-xs text-on-surface">
                          Tambah Keahlian Baru
                        </h5>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                            Nama Jasa / Keahlian
                          </label>
                          <input
                            type="text"
                            placeholder="Contoh: Perbaikan Pompa Air"
                            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-1.5 text-xs text-on-surface outline-none"
                            value={newSkillName}
                            onChange={(e) => setNewSkillName(e.target.value)}
                            required
                            autoFocus
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setIsSkillFormOpen(false)}
                            className="px-3 py-1.5 border border-outline-variant/30 rounded-xl text-[10px] font-bold text-on-surface-variant hover:bg-surface-container-high cursor-pointer"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="px-3 py-1.5 bg-secondary text-on-secondary rounded-xl text-[10px] font-bold hover:opacity-90 cursor-pointer"
                          >
                            Tambah
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>

                <div className="p-4 border-t border-surface-variant/10">
                  <div className="p-3 bg-surface-container-low rounded-xl border border-surface-variant/10 text-xs text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-sm">
                      info
                    </span>
                    <p className="leading-relaxed text-[10px]">
                      Keahlian ini menentukan orderan perbaikan yang akan Anda
                      terima.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Sertifikasi & Keamanan */}
              <div className="bg-surface-container rounded-3xl border border-surface-variant/15 overflow-hidden shadow-lg flex-grow">
                <div className="px-6 py-4 bg-surface-container-high/60 border-b border-surface-variant/10">
                  <h4 className="font-bold text-sm text-on-surface">
                    Kredensial &amp; Keamanan Akun
                  </h4>
                </div>
                <div className="p-6 space-y-3.5">
                  {/* Ubah Password */}
                  <div className="flex items-center justify-between p-3 border border-outline-variant/20 rounded-xl bg-surface-container-low/50 hover:border-secondary/15 transition-all">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm">
                        lock
                      </span>
                      <div>
                        <p className="font-bold text-[11px] text-on-surface">
                          Kata Sandi
                        </p>
                        <p className="text-[9px] text-on-surface-variant/60">
                          Diubah 2 bulan lalu
                        </p>
                      </div>
                    </div>
                    <button className="text-secondary text-xs font-bold hover:underline bg-transparent border-none cursor-pointer">
                      Ubah
                    </button>
                  </div>

                  {/* KTP Verifikasi */}
                  <div className="flex items-center justify-between p-3 border border-outline-variant/20 rounded-xl bg-surface-container-low/50">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm">
                        id_card
                      </span>
                      <div>
                        <p className="font-bold text-[11px] text-on-surface">
                          Dokumen KTP
                        </p>
                        <p className="text-[9px] text-on-surface-variant/60">
                          Terverifikasi sistem
                        </p>
                      </div>
                    </div>
                    <span className="text-[8px] bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full text-green-400 font-bold uppercase">
                      Terverifikasi
                    </span>
                  </div>

                  {/* Sertifikat BNSP */}
                  <div className="flex items-center justify-between p-3 border border-outline-variant/20 rounded-xl bg-surface-container-low/50">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-sm">
                        verified
                      </span>
                      <div>
                        <p className="font-bold text-[11px] text-on-surface">
                          Sertifikasi BNSP
                        </p>
                        <p className="text-[9px] text-on-surface-variant/60">
                          Sertifikat Elektrikal aktif
                        </p>
                      </div>
                    </div>
                    <span className="text-[8px] bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full text-green-400 font-bold uppercase">
                      Aktif
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dinamis: Sertifikat & Lisensi */}
          <div className="bg-surface-container rounded-3xl border border-surface-variant/15 overflow-hidden shadow-lg p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-surface-variant/15 pb-4">
              <h4 className="font-bold text-sm md:text-base text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">verified</span>
                Sertifikat &amp; Lisensi
              </h4>
              <button onClick={() => setIsSertifikatFormOpen(!isSertifikatFormOpen)} className="text-secondary text-xs hover:underline bg-transparent border-none cursor-pointer font-bold">
                {isSertifikatFormOpen ? "Tutup" : "Tambah"}
              </button>
            </div>
            
            {isSertifikatFormOpen && (
              <form onSubmit={handleAddSertifikat} className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Judul Sertifikat" required value={newSertifikat.judul} onChange={(e) => setNewSertifikat({...newSertifikat, judul: e.target.value})} className="w-full bg-surface-container-high border border-outline-variant/30 rounded-lg px-3 py-2 text-xs text-on-surface" />
                  <input type="text" placeholder="Penerbit" value={newSertifikat.penerbit} onChange={(e) => setNewSertifikat({...newSertifikat, penerbit: e.target.value})} className="w-full bg-surface-container-high border border-outline-variant/30 rounded-lg px-3 py-2 text-xs text-on-surface" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Tahun" value={newSertifikat.tahun} onChange={(e) => setNewSertifikat({...newSertifikat, tahun: e.target.value})} className="w-full bg-surface-container-high border border-outline-variant/30 rounded-lg px-3 py-2 text-xs text-on-surface" />
                  <input type="text" placeholder="Deskripsi Singkat" value={newSertifikat.deskripsi} onChange={(e) => setNewSertifikat({...newSertifikat, deskripsi: e.target.value})} className="w-full bg-surface-container-high border border-outline-variant/30 rounded-lg px-3 py-2 text-xs text-on-surface" />
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="px-4 py-2 bg-secondary text-on-secondary rounded-lg text-xs font-bold hover:opacity-90">Simpan Sertifikat</button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sertifikats.map((sertifikat) => (
                <div key={sertifikat.id} className="bg-surface-container-low p-4 rounded-xl border border-surface-variant/20 relative group">
                  <h5 className="font-bold text-sm text-on-surface">{sertifikat.judul}</h5>
                  <p className="text-[10px] text-secondary mt-1">{sertifikat.penerbit} {sertifikat.tahun ? `• ${sertifikat.tahun}` : ''}</p>
                  <p className="text-xs text-on-surface-variant mt-2 line-clamp-2">{sertifikat.deskripsi}</p>
                  <button onClick={() => handleDeleteSertifikat(sertifikat.id)} className="absolute top-2 right-2 text-red-400 bg-red-500/10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                  </button>
                </div>
              ))}
              {sertifikats.length === 0 && <p className="text-xs text-on-surface-variant/70 italic">Belum ada sertifikat.</p>}
            </div>
          </div>

          {/* Dinamis: Portofolio Pekerjaan */}
          <div className="bg-surface-container rounded-3xl border border-surface-variant/15 overflow-hidden shadow-lg p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-surface-variant/15 pb-4">
              <h4 className="font-bold text-sm md:text-base text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">photo_library</span>
                Portofolio Pekerjaan
              </h4>
              <button onClick={() => setIsPortofolioFormOpen(!isPortofolioFormOpen)} className="text-secondary text-xs hover:underline bg-transparent border-none cursor-pointer font-bold">
                {isPortofolioFormOpen ? "Tutup" : "Tambah"}
              </button>
            </div>

            {isPortofolioFormOpen && (
              <form onSubmit={handleAddPortofolio} className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 space-y-3">
                <div className="space-y-3">
                  <input type="text" placeholder="Judul Proyek" required value={newPortofolio.judul} onChange={(e) => setNewPortofolio({...newPortofolio, judul: e.target.value})} className="w-full bg-surface-container-high border border-outline-variant/30 rounded-lg px-3 py-2 text-xs text-on-surface" />
                  <textarea placeholder="Deskripsi Proyek" value={newPortofolio.deskripsi} onChange={(e) => setNewPortofolio({...newPortofolio, deskripsi: e.target.value})} className="w-full bg-surface-container-high border border-outline-variant/30 rounded-lg px-3 py-2 text-xs text-on-surface h-20 resize-none"></textarea>
                  <input type="file" accept="image/*" onChange={(e) => setNewPortofolio({...newPortofolio, foto: e.target.files[0]})} className="w-full text-xs text-on-surface-variant" />
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="px-4 py-2 bg-secondary text-on-secondary rounded-lg text-xs font-bold hover:opacity-90">Upload Portofolio</button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portofolios.map((porto) => (
                <div key={porto.id} className="bg-surface-container-low rounded-xl border border-surface-variant/20 overflow-hidden relative group">
                  <div className="h-32 w-full overflow-hidden">
                    <img src={porto.foto_url.startsWith('http') ? porto.foto_url : `${import.meta.env.VITE_API_BASE_URL}/storage/${porto.foto_url}`} alt={porto.judul} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <h5 className="font-bold text-xs text-on-surface">{porto.judul}</h5>
                    <p className="text-[10px] text-on-surface-variant line-clamp-2 mt-1">{porto.deskripsi}</p>
                  </div>
                  <button onClick={() => handleDeletePortofolio(porto.id)} className="absolute top-2 right-2 text-red-400 bg-red-500/10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                  </button>
                </div>
              ))}
              {portofolios.length === 0 && <p className="text-xs text-on-surface-variant/70 italic">Belum ada foto portofolio.</p>}
            </div>
          </div>
          {/* Rating & Ulasan Terbaru (Full-Width Card at the bottom) */}
          <div className="bg-surface-container rounded-3xl border border-surface-variant/15 overflow-hidden shadow-lg p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-surface-variant/15 pb-4">
              <h4 className="font-bold text-sm md:text-base text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">
                  reviews
                </span>
                Rating &amp; Ulasan Pelanggan
              </h4>
              <button className="text-secondary text-xs hover:underline bg-transparent border-none cursor-pointer font-bold">
                Lihat Semua
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Part: Rating breakdown statistics (lg:col-span-4) */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-surface-container-low rounded-2xl border border-surface-variant/10 text-center h-full min-h-[180px]">
                <span className="text-4xl md:text-5xl font-black text-secondary">
                  4.9
                </span>
                <div className="flex text-secondary mt-1 justify-center">
                  {[1, 2, 3, 4].map((star) => (
                    <span
                      key={star}
                      className="material-symbols-outlined text-xs"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                  <span
                    className="material-symbols-outlined text-xs"
                    style={{ fontVariationSettings: "'FILL' 0" }}
                  >
                    star_half
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant/60 font-semibold mt-1">
                  124 Ulasan Teknisi
                </p>

                <div className="w-full mt-4 space-y-1 text-xs">
                  {[
                    { star: 5, pct: "85%", count: 105 },
                    { star: 4, pct: "12%", count: 15 },
                    { star: 3, pct: "3%", count: 4 },
                  ].map((item) => (
                    <div key={item.star} className="flex items-center gap-2">
                      <span className="w-2 font-bold text-on-surface-variant">
                        {item.star}
                      </span>
                      <div className="flex-grow h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary"
                          style={{ width: item.pct }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-on-surface-variant/75 w-6 text-right font-semibold">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Part: Side-by-side reviews grid (lg:col-span-8) */}
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    name: "Santi Rahayu",
                    time: "2 hari yang lalu",
                    rating: 5,
                    avatar:
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuZvsrzGPxdEAPtL4hi4NXFnMtyKGl5roHW6VyIDeE3oMnu-pO25vins35GD9VWC_BErjPhq35I993EwovRGZxFudFj7RdB0xbcN7-Wu1W0lX2XuaD9KrzyIIUNBpDGe1nyMFoo3pT-A8aLmT7km0f5-7n5VE4zTyZnh4a71sEhaj_nUhV8008Hu6CUf2uLk5rQhYw8xAI_KgiRSPDxiM9a7CE0llcwMVsPV5tN9I_K3BkPJC0RaqoC3pbjgS8g_bSjLrQUUbfBuXQ",
                    message:
                      "Pak Denji sangat profesional. Datang tepat waktu dan perbaikan AC dilakukan dengan sangat rapi. Sangat direkomendasikan!",
                  },
                  {
                    name: "Andi Wijaya",
                    time: "1 minggu yang lalu",
                    rating: 4,
                    avatar:
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuDCYKQgysgOYBO0VnG26QbHcfPR2BNu9IXOvrq_7oSEjOvRH7BwxpIf9totvBE7G9B9i9l_K6jWNUxX6d1MZIqmBx7Fjg41Vxvhw9sxbly87ztOgE-S0SRGFSBuqtrfJU48LgrNe4IWxKPJaOsbRsJCKXYLVI3qYQ02YstUfIONzPDa-ezxWsbr2yrhNdpjOafGoqaRXgCKNm8COhPl42ApwN2lQkLU1-_T7J-zdU8hE_Q2U3W-eMe2H3hos2CisyKIn8MrHd46ABFq",
                    message:
                      "Kerja cepat dan paham masalah kelistrikan rumah saya. Terima kasih banyak.",
                  },
                ].map((rev, idx) => (
                  <div
                    key={idx}
                    className="bg-surface-container-low p-4 rounded-2xl border border-surface-variant/10 flex flex-col justify-between space-y-3 min-h-[140px] text-xs"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <div className="flex gap-2.5 items-center">
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/30 shrink-0">
                            <img
                              className="w-full h-full object-cover"
                              src={rev.avatar}
                              alt={rev.name}
                            />
                          </div>
                          <div>
                            <p className="font-bold text-on-surface">
                              {rev.name}
                            </p>
                            <div className="flex text-secondary scale-75 -ml-3 -mt-0.5">
                              {Array.from({ length: 5 }).map((_, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="material-symbols-outlined text-[10px]"
                                  style={{
                                    fontVariationSettings:
                                      sIdx < rev.rating
                                        ? "'FILL' 1"
                                        : "'FILL' 0",
                                  }}
                                >
                                  star
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-[9px] text-on-surface-variant/60 font-semibold">
                          {rev.time}
                        </span>
                      </div>
                      <p className="text-on-surface-variant/90 leading-relaxed italic mt-2.5">
                        "{rev.message}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-surface-variant/20">
            <div className="flex items-center gap-2 text-on-surface-variant text-xs">
              <span className="material-symbols-outlined text-sm">
                security
              </span>
              <p className="text-[10px]">
                Data kredensial dan lisensi Anda dilindungi penuh oleh kebijakan
                TukangAja.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer bg-transparent"
              >
                Keluar Akun
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-secondary text-on-secondary rounded-xl text-xs font-bold hover:opacity-90 shadow-lg shadow-secondary/15 cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsShareModalOpen(false)}
          ></div>

          <div className="relative bg-surface-container border border-surface-variant/20 w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center space-y-4 animate-[scaleUp_0.25s_cubic-bezier(0.34,1.56,0.64,1)_forwards]">
            <div className="w-12 h-12 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center border border-secondary/25">
              <span className="material-symbols-outlined text-lg">share</span>
            </div>

            <div>
              <h4 className="font-bold text-sm text-on-surface">
                Bagikan Profil Profesional
              </h4>
              <p className="text-[11px] text-on-surface-variant/80 mt-1 leading-relaxed">
                Salin tautan profil profesional Anda untuk dibagikan kepada
                calon pelanggan di luar aplikasi.
              </p>
            </div>

            <div className="flex bg-surface-container-high rounded-lg overflow-hidden border border-outline-variant/30 focus-within:ring-2 focus-within:ring-secondary/50 focus-within:border-secondary transition-all w-full">
              <input 
                type="text" 
                readOnly 
                value={`https://tukangaja.com/p/${profileData.fullName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-elite`} 
                className="w-full bg-transparent px-4 py-3 text-sm text-on-surface outline-none"
              />
              <button 
                className="px-4 py-3 bg-secondary/10 hover:bg-secondary/20 text-secondary font-bold text-sm transition-colors border-l border-outline-variant/30 cursor-pointer"
                onClick={() => {
                  navigator.clipboard.writeText(`https://tukangaja.com/p/${profileData.fullName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-elite`);
                  alert("Link disalin!");
                  setIsShareModalOpen(false);
                }}
              >
                Salin
              </button>
            </div>

            <button
              onClick={() => setIsShareModalOpen(false)}
              className="w-full py-2.5 rounded-xl border border-outline-variant/30 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setIsLogoutModalOpen(false)}
          ></div>

          <div className="relative bg-surface-container border border-surface-variant/20 w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center space-y-4 animate-[scaleUp_0.25s_cubic-bezier(0.34,1.56,0.64,1)_forwards]">
            <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
              <span className="material-symbols-outlined text-2xl font-bold">
                logout
              </span>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-extrabold text-base text-on-surface">
                Keluar dari Akun?
              </h4>
              <p className="text-xs text-on-surface-variant/80 leading-relaxed px-2">
                Apakah Anda yakin ingin keluar dari akun teknisi TukangAja?
              </p>
            </div>

            <div className="flex gap-3 w-full pt-2">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-outline-variant/30 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 bg-secondary text-on-secondary rounded-xl text-xs font-bold hover:opacity-95 transition-opacity cursor-pointer shadow-lg shadow-secondary/15"
              >
                Ya, Keluar
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

export default TukangProfil;
