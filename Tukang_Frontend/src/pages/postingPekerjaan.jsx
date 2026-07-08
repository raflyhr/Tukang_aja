import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import LogoutModal from "../components/LogoutModal";

function PostingPekerjaan() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const prefilledService = location.state?.prefillService || "";

  // Form states
  const [serviceCategory, setServiceCategory] = useState(
    prefilledService.includes("Pipa") ? "Plumbing" :
    prefilledService.includes("Listrik") ? "Kelistrikan" :
    prefilledService.includes("Cat") ? "Pengecatan" :
    prefilledService.includes("Kebersihan") ? "Pembersihan" : "Lainnya"
  );
  const [title, setTitle] = useState(prefilledService || "");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan");
  const [budget, setBudget] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file tidak boleh lebih dari 5MB");
        return;
      }
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/pelanggan/dashboard" },
    { id: "pesanan", label: "Pesanan Saya", icon: "receipt_long", path: "/pelanggan/pesanan" },
    { id: "chat", label: "Chat", icon: "chat", path: "/pelanggan/chat" },
    { id: "pembayaran", label: "Pembayaran", icon: "payments", path: "/pelanggan/pembayaran" },
    { id: "profil", label: "Profil", icon: "person", path: "/pelanggan/profil" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    
    // Reset photo
    setPhoto(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview("");
    }

    setTimeout(() => {
      setIsSubmitted(false);
      // Redirect back to orders lists
      navigate("/pelanggan/pesanan");
    }, 2000);
  };

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
            const isActive = item.id === "dashboard";
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
            <span className="font-headline-md text-headline-md font-bold text-secondary hidden sm:block">Posting Pekerjaan Baru</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/notifikasi" className="p-2 text-on-surface-variant hover:text-secondary transition-colors relative cursor-pointer flex items-center justify-center">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full"></span>
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
        <div className="pt-28 pb-12 px-6 md:px-12 max-w-3xl w-full mx-auto space-y-8 flex-grow page-transition">
          {/* Header & Back Button */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-variant/15 text-on-surface-variant hover:text-on-surface transition-all cursor-pointer flex items-center justify-center"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                <Link to="/pelanggan/dashboard" className="hover:underline">Dashboard</Link>
                <span>/</span>
                <span className="text-on-surface font-semibold">Posting Pekerjaan</span>
              </div>
              <h2 className="text-xl font-bold text-on-surface mt-1">Carikan Solusi Rumah Anda</h2>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-surface-container p-6 md:p-8 rounded-3xl border border-surface-variant/15 shadow-xl">
            {isSubmitted ? (
              <div className="text-center py-12 space-y-4 animate-fade-in">
                <span className="material-symbols-outlined text-secondary text-6xl animate-bounce">task_alt</span>
                <h3 className="text-lg font-bold text-on-surface">Pekerjaan Berhasil Diposting!</h3>
                <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
                  Sistem sedang memproses penawaran dan akan mencocokkan dengan mitra terdekat. Anda dialihkan kembali ke menu pesanan...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 text-xs font-semibold">
                {/* Category Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant ml-1">Kategori Layanan</label>
                  <select
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value)}
                    className="w-full bg-surface-container-high border border-outline-variant rounded-xl py-3.5 px-4 text-xs font-bold text-on-surface focus:ring-1 focus:ring-secondary/50 focus:border-secondary outline-none transition-all cursor-pointer"
                    required
                  >
                    <option value="Plumbing">Perpipaan & Pompa Air (Plumbing)</option>
                    <option value="Kelistrikan">Kelistrikan & Saklar</option>
                    <option value="Pengecatan">Pengecatan Dinding & Kusen</option>
                    <option value="Pembersihan">Pembersihan Kamar/Deep Clean</option>
                    <option value="Lainnya">Lainnya / Pertukangan Umum</option>
                  </select>
                </div>

                {/* Job Title */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant ml-1">Judul Permasalahan / Pekerjaan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Kran Wastafel Bocor Parah / Pasang Toren Baru"
                    className="w-full bg-surface-container-high border border-outline-variant rounded-xl py-3.5 px-4 text-xs text-on-surface focus:ring-1 focus:ring-secondary/50 focus:border-secondary outline-none transition-all"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant ml-1">Jelaskan Detail Kerusakan / Pekerjaan</label>
                  <textarea
                    rows="4"
                    placeholder="Sebutkan kendala Anda secara rinci, merk peralatan jika ada, dan jumlah titik yang ingin diperbaiki agar tukang dapat menyiapkan sparepart yang tepat."
                    className="w-full bg-surface-container-high border border-outline-variant rounded-xl p-4 font-medium text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-secondary/50 focus:border-secondary outline-none transition-all"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant ml-1">Rencana Kunjungan</label>
                    <input
                      type="date"
                      className="w-full bg-surface-container-high border border-outline-variant rounded-xl py-3.5 px-4 text-xs text-on-surface focus:ring-1 focus:ring-secondary/50 focus:border-secondary outline-none transition-all cursor-pointer"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant ml-1">Rencana Jam</label>
                    <input
                      type="time"
                      className="w-full bg-surface-container-high border border-outline-variant rounded-xl py-3.5 px-4 text-xs text-on-surface focus:ring-1 focus:ring-secondary/50 focus:border-secondary outline-none transition-all cursor-pointer"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant ml-1">Alamat Pengerjaan</label>
                  <input
                    type="text"
                    className="w-full bg-surface-container-high border border-outline-variant rounded-xl py-3.5 px-4 text-xs text-on-surface focus:ring-1 focus:ring-secondary/50 focus:border-secondary outline-none transition-all"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>

                {/* Budget Range */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant ml-1">Anggaran Jasa Maksimal (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Rp 200.000"
                    className="w-full bg-surface-container-high border border-outline-variant rounded-xl py-3.5 px-4 text-xs text-on-surface focus:ring-1 focus:ring-secondary/50 focus:border-secondary outline-none transition-all"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />
                </div>

                {/* Photo Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant ml-1">Lampirkan Foto Kerusakan (Opsional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    id="job-photo-input"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  <label
                    htmlFor="job-photo-input"
                    className="border-2 border-dashed border-outline-variant/40 hover:border-secondary/40 rounded-xl p-5 text-center cursor-pointer transition-all bg-surface-container-high flex flex-col items-center justify-center gap-2 block"
                  >
                    {photoPreview ? (
                      <div className="relative w-full max-h-32 flex flex-col items-center justify-center gap-2">
                        <img src={photoPreview} alt="Preview" className="max-h-24 object-contain rounded-lg border border-outline-variant" />
                        <span className="text-[10px] text-secondary font-bold truncate max-w-full">{photo?.name}</span>
                      </div>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-on-surface-variant/70 text-2xl animate-pulse">upload_file</span>
                        <span className="text-xs font-bold text-on-surface">Pilih File Foto</span>
                        <span className="text-[10px] text-on-surface-variant/60">Format JPG, PNG hingga 5MB</span>
                      </>
                    )}
                  </label>
                </div>

                {/* CTA Submit */}
                <button
                  type="submit"
                  className="w-full bg-secondary text-on-secondary hover:bg-secondary/90 py-3.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-secondary/15 hover:scale-[1.01] active:scale-[0.99] border-none"
                >
                  <span className="material-symbols-outlined text-xs">rocket_launch</span>
                  Posting Pekerjaan Baru
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={() => navigate("/")} 
        role="pelanggan" 
      />
    </div>
  );
}

export default PostingPekerjaan;
