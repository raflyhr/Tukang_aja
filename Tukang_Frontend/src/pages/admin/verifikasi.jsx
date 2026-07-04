import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { adminData } from "./adminData";
import LogoutModal from "../../components/LogoutModal";
import axios from "axios";

function VerifikasiTukang() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInverted, setIsInverted] = useState(false);
  const [showRejectionBox, setShowRejectionBox] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  // Interactive internal notes state
  const [notes, setNotes] = useState([
    {
      id: 1,
      author: "Sistem AI",
      date: "09 Nov, 14:20",
      content: "Analisis otomatis mendeteksi kecocokan wajah 92% antara foto profil dan KTP.",
      isSystem: true
    },
    {
      id: 2,
      author: "Admin CS-2",
      date: "09 Nov, 15:45",
      content: "Sudah dihubungi via telepon, data alamat sudah sesuai dengan database domisili setempat.",
      isSystem: false
    }
  ]);
  const [newNote, setNewNote] = useState("");

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const now = new Date();
    const formattedDate = `${now.getDate()} ${now.toLocaleString("id-ID", { month: "short" })}, ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    setNotes(prev => [
      ...prev,
      {
        id: Date.now(),
        author: "Admin Utama",
        date: formattedDate,
        content: newNote,
        isSystem: false
      }
    ]);
    setNewNote("");
  };

  const [tukangData, setTukangData] = useState(null);
  const [totalPending, setTotalPending] = useState(0);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // Get all pending to count them and get the first one if no id is provided
      const resList = await axios.get("http://localhost:8000/api/admin/verifikasi");
      if (resList.data.status === 'Sukses') {
        const pendingList = resList.data.data;
        setTotalPending(pendingList.length);
        
        let targetId = id;
        if (!targetId && pendingList.length > 0) {
          targetId = pendingList[0].id;
        }

        if (targetId) {
          const resDetail = await axios.get(`http://localhost:8000/api/tukang/${targetId}`);
          if (resDetail.data.status === 'Sukses') {
            setTukangData(resDetail.data.data);
          }
        } else {
          setTukangData(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleApprove = async () => {
    if (!tukangData) return;
    if (confirm(`Apakah Anda yakin ingin menyetujui verifikasi untuk ${tukangData.nama}?`)) {
      try {
        const response = await axios.put(`http://localhost:8000/api/admin/verifikasi/${tukangData.id}`, { action: 'approve' });
        if (response.data.status === 'Sukses') {
          alert("Verifikasi Berhasil Disetujui!");
          navigate("/admin/dashboard");
        }
      } catch (e) {
        alert("Gagal memproses verifikasi.");
      }
    }
  };

  const handleConfirmRejection = async () => {
    if (!tukangData) return;
    if (!rejectionReason.trim()) {
      alert("Silakan masukkan alasan penolakan terlebih dahulu.");
      return;
    }
    if (confirm("Tolak verifikasi ini?")) {
      try {
        const response = await axios.put(`http://localhost:8000/api/admin/verifikasi/${tukangData.id}`, { action: 'reject', reason: rejectionReason });
        if (response.data.status === 'Sukses') {
          alert("Verifikasi ditolak. Alasan: " + rejectionReason);
          navigate("/admin/dashboard");
        }
      } catch (e) {
        alert("Gagal memproses penolakan.");
      }
    }
  };

  // KTP Zoom tracking
  const ktpContainerRef = useRef(null);
  const ktpImageRef = useRef(null);

  const handleKtpMouseMove = (e) => {
    if (!ktpContainerRef.current || !ktpImageRef.current) return;
    const { left, top, width, height } = ktpContainerRef.current.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    ktpImageRef.current.style.transformOrigin = `${x}% ${y}%`;
  };

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

      {/* SideNavBar - Layout and colors matching dashboard.jsx */}
      <aside className={`h-screen w-64 fixed left-0 top-0 bg-surface-container flex flex-col py-6 px-4 z-50 border-r border-surface-variant/20 transition-transform duration-300 lg:transition-none lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-4 mb-8 flex justify-between items-center">
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-secondary">TukangAja</h1>
            <p className="text-on-surface-variant font-label-sm text-[10px] tracking-widest uppercase opacity-60">Service Management</p>
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
        {/* Top App Bar */}
        <header className="fixed top-0 right-0 left-0 lg:left-64 z-40 flex justify-between items-center px-6 md:px-12 h-20 bg-surface/80 backdrop-blur-xl border-b border-surface-variant/20 transition-all duration-300">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-on-surface-variant transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex items-center gap-4">
              <Link to="/admin/dashboard" className="text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined cursor-pointer">arrow_back</span>
              </Link>
              <h2 className="text-base md:text-lg font-bold text-on-surface">Detail Verifikasi Tukang</h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex items-center bg-surface-container px-4 py-1.5 rounded-full border border-surface-variant/20">
              <span className="material-symbols-outlined text-on-surface-variant text-sm">search</span>
              <input className="bg-transparent border-none focus:ring-0 text-sm text-on-surface ml-2 w-32 md:w-48 placeholder:text-on-surface-variant/40" placeholder="Cari ID Pendaftaran..." type="text"/>
            </div>
            <button className="p-2 text-on-surface-variant flex items-center justify-center bg-transparent border-none cursor-pointer">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="p-2 text-on-surface-variant flex items-center justify-center bg-transparent border-none cursor-pointer">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </header>

        {/* Canvas */}
        <div className="pt-28 pb-12 px-6 md:px-12 max-w-7xl w-full mx-auto space-y-8 flex-grow page-transition">
          
          {/* Header Identity Card */}
          {tukangData ? (
          <section className="bg-surface-container-high/60 backdrop-blur-md p-6 rounded-2xl border border-surface-variant/20 shadow-lg flex flex-col md:flex-row gap-6 items-start">
            <div className="relative shrink-0">
              <img 
                className="w-28 h-28 md:w-36 md:h-36 rounded-2xl object-cover border border-surface-variant/20 shadow-md" 
                alt={tukangData.nama} 
                src={tukangData.foto_profil ? (tukangData.foto_profil.startsWith('http') ? tukangData.foto_profil : `http://localhost:8000/storage/${tukangData.foto_profil}`) : `https://ui-avatars.com/api/?name=${tukangData.nama}&background=random`}
              />
              <div className="absolute -bottom-2 -right-2 bg-secondary text-on-secondary p-1.5 rounded-lg shadow-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              </div>
            </div>

            <div className="flex-grow space-y-4 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-on-surface">{tukangData.nama}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs">
                    <span className="bg-secondary/15 text-secondary px-2.5 py-0.5 rounded-full font-bold border border-secondary/20">{tukangData.keahlian}</span>
                    <span className="text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      {tukangData.alamat}
                    </span>
                  </div>
                </div>
                <div className="sm:text-right">
                  <p className="text-on-surface-variant text-[10px] uppercase font-bold tracking-wider">ID Pendaftaran</p>
                  <p className="font-mono text-secondary font-bold text-base md:text-lg">TKG-{tukangData.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface-container-high/40 p-4 rounded-xl border border-surface-variant/10">
                  <p className="text-on-surface-variant text-[10px] font-bold mb-1.5 uppercase tracking-wider">Informasi Kontak</p>
                  <p className="text-on-surface flex items-center gap-2 text-xs font-semibold">
                    <span className="material-symbols-outlined text-xs text-secondary">phone_iphone</span>
                    {tukangData.no_hp || "-"}
                  </p>
                  <p className="text-on-surface flex items-center gap-2 text-xs font-semibold mt-1">
                    <span className="material-symbols-outlined text-xs text-secondary">mail</span>
                    {tukangData.user?.email || "-"}
                  </p>
                </div>
                <div className="bg-surface-container-high/40 p-4 rounded-xl border border-surface-variant/10">
                  <p className="text-on-surface-variant text-[10px] font-bold mb-1.5 uppercase tracking-wider">Alamat Lengkap</p>
                  <p className="text-on-surface text-xs leading-relaxed">
                    {tukangData.alamat}
                  </p>
                </div>
              </div>
            </div>
          </section>
          ) : (
            <div className="bg-surface-container p-8 rounded-2xl text-center text-on-surface-variant/65">
              <span className="material-symbols-outlined text-4xl mb-2 text-secondary/45">inbox</span>
              <p className="text-xs font-medium">Tidak ada data pendaftar untuk ditampilkan.</p>
            </div>
          )}

          {/* Bento Grid Content */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column - Documents (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* KTP Document Card */}
              <div className="bg-surface-container rounded-2xl border border-surface-variant/20 overflow-hidden shadow-lg">
                <div className="p-5 flex items-center justify-between bg-surface-container-high/50 border-b border-surface-variant/15">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary">badge</span>
                    <h4 className="font-bold text-sm text-on-surface">Dokumen Identitas (KTP)</h4>
                  </div>
                  <button 
                    className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-highest border border-surface-variant/25 text-on-surface rounded-lg text-xs font-bold transition-all cursor-pointer" 
                    onClick={() => setIsInverted(prev => !prev)}
                  >
                    <span className="material-symbols-outlined text-xs">invert_colors</span>
                    Invert Warna
                  </button>
                </div>
                
                <div className="p-5">
                  <div 
                    ref={ktpContainerRef}
                    onMouseMove={handleKtpMouseMove}
                    className="relative cursor-zoom-in overflow-hidden rounded-xl bg-black/50 aspect-[1.6/1] flex items-center justify-center border border-surface-variant/15" 
                    id="ktp-container"
                  >
                    <img 
                      ref={ktpImageRef}
                      className={`w-full h-full object-cover transition-transform duration-500 ${isInverted ? "invert" : ""}`} 
                      alt="Indonesian ID Card (KTP)" 
                      id="ktp-image" 
                      src={tukangData?.foto_ktp ? (tukangData.foto_ktp.startsWith('http') ? tukangData.foto_ktp : `http://localhost:8000/storage/${tukangData.foto_ktp}`) : "https://via.placeholder.com/600x400?text=No+KTP"}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="p-3 bg-surface-container-low rounded-lg border border-surface-variant/10 text-center sm:text-left">
                      <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">NIK Match</p>
                      <p className="text-green-400 text-xs font-bold flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        Valid (98%)
                      </p>
                    </div>
                    <div className="p-3 bg-surface-container-low rounded-lg border border-surface-variant/10 text-center sm:text-left">
                      <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Face Match</p>
                      <p className="text-green-400 text-xs font-bold flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        Match (92%)
                      </p>
                    </div>
                    <div className="p-3 bg-surface-container-low rounded-lg border border-surface-variant/10 text-center sm:text-left">
                      <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Expiry</p>
                      <p className="text-on-surface text-xs font-bold mt-0.5">Seumur Hidup</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CV & Portfolio Card */}
              <div className="bg-surface-container rounded-2xl border border-surface-variant/20 shadow-lg">
                <div className="p-5 flex items-center justify-between border-b border-surface-variant/15 bg-surface-container-high/50">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary">description</span>
                    <h4 className="font-bold text-sm text-on-surface">CV &amp; Portofolio</h4>
                  </div>
                  <button className="flex items-center gap-1.5 text-secondary text-xs font-bold bg-transparent border-none cursor-pointer">
                    <span className="material-symbols-outlined text-xs">download</span>
                    Download PDF
                  </button>
                </div>
                
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-surface-variant/15 rounded-xl p-4 flex flex-col gap-3 cursor-pointer bg-surface-container-high/40">
                    <div className="flex items-start justify-between">
                      <span className="material-symbols-outlined text-red-400 text-3xl">picture_as_pdf</span>
                      <span className="text-[9px] bg-red-400/10 text-red-400 px-2 py-0.5 rounded border border-red-400/20 font-bold">2.4 MB</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface truncate">Curriculum_Vitae_Budi.pdf</p>
                      <p className="text-[9px] text-on-surface-variant mt-0.5">Terakhir diperbarui: 2 hari lalu</p>
                    </div>
                  </div>
                  
                  <div className="border border-surface-variant/15 rounded-xl p-4 flex flex-col gap-3 cursor-pointer bg-surface-container-high/40">
                    <div className="flex items-start justify-between">
                      <span className="material-symbols-outlined text-blue-400 text-3xl">folder_zip</span>
                      <span className="text-[9px] bg-blue-400/10 text-blue-400 px-2 py-0.5 rounded border border-blue-400/20 font-bold">15.8 MB</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface truncate">Project_Portfolio_Photos.zip</p>
                      <p className="text-[9px] text-on-surface-variant mt-0.5">42 File Foto &amp; Video</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column - Decision Panel & Internal Notes (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Decision Panel */}
              <div className="bg-surface-container rounded-2xl border border-surface-variant/20 p-5 shadow-lg flex flex-col gap-4">
                <h4 className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest">Panel Keputusan</h4>
                <div className="space-y-3">
                  <button 
                    onClick={handleApprove}
                    className="w-full bg-secondary text-on-secondary py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm border-none shadow-md shadow-secondary/15 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    Setujui Verifikasi
                  </button>
                  
                  <button 
                    onClick={() => setShowRejectionBox(prev => !prev)}
                    className="w-full border-2 border-red-500/30 text-red-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm bg-transparent cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">block</span>
                    Tolak Verifikasi
                  </button>
                </div>

                {/* Rejection Reason Form */}
                {showRejectionBox && (
                  <div className="mt-2 space-y-4 pt-4 border-t border-surface-variant/15">
                    <label className="block text-xs font-bold text-on-surface-variant">Alasan Penolakan</label>
                    <textarea 
                      className="w-full bg-surface-container-high border border-surface-variant/25 rounded-xl text-on-surface focus:ring-2 focus:ring-secondary/50 focus:border-transparent transition-all placeholder:text-on-surface-variant/30 text-xs p-3" 
                      id="rejection-reason" 
                      placeholder="Contoh: Foto KTP tidak jelas atau sudah kadaluwarsa..." 
                      rows="3"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button 
                        className="flex-1 bg-red-500 text-white py-2 rounded-lg font-bold text-xs border-none cursor-pointer" 
                        onClick={handleConfirmRejection}
                      >
                        Konfirmasi Tolak
                      </button>
                      <button 
                        className="px-4 py-2 border border-surface-variant/25 rounded-lg text-xs text-on-surface-variant bg-transparent cursor-pointer" 
                        onClick={() => setShowRejectionBox(false)}
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Notes */}
              <div className="bg-surface-container rounded-2xl border border-surface-variant/20 p-5 shadow-lg flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-on-surface font-bold text-xs">Catatan Internal</h4>
                  <span className="material-symbols-outlined text-on-surface-variant text-sm">add_circle</span>
                </div>
                
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-surface-container-high/40 p-3 rounded-lg border border-surface-variant/10 text-xs">
                      <div className="flex justify-between items-start mb-1 font-bold">
                        <p className={note.isSystem ? "text-secondary" : "text-on-surface"}>{note.author}</p>
                        <p className="text-[9px] text-on-surface-variant font-medium">{note.date}</p>
                      </div>
                      <p className="text-on-surface-variant/90 leading-relaxed">{note.content}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddNote} className="mt-2 flex gap-2">
                  <input 
                    className="flex-1 bg-surface-container-lowest border border-surface-variant/20 rounded-lg text-xs p-2 text-on-surface placeholder:text-on-surface-variant/35 focus:ring-1 focus:ring-secondary/50 outline-none" 
                    placeholder="Tambah catatan..." 
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                  <button type="submit" className="bg-secondary/15 p-2 rounded-lg text-secondary border border-secondary/10 flex items-center justify-center cursor-pointer">
                    <span className="material-symbols-outlined text-sm">send</span>
                  </button>
                </form>
              </div>

              {/* Statistics Card */}
              <div className="bg-surface-container rounded-2xl border border-surface-variant/20 p-5 shadow-lg flex items-center gap-4">
                <div className="h-11 w-11 bg-secondary/15 rounded-full flex items-center justify-center text-secondary border border-secondary/10 shrink-0">
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
                </div>
                <div>
                  <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">Total Pendaftaran</p>
                  <p className="text-on-surface font-bold text-lg">{totalPending} <span className="text-[10px] font-normal text-on-surface-variant/70 ml-1">dalam antrian</span></p>
                </div>
              </div>

            </div>

          </section>

        </div>
      </main>

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

export default VerifikasiTukang;
