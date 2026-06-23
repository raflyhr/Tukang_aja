import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Profil() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Logout Modal State
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Profile data state
  const [profileData, setProfileData] = useState({
    fullName: "Reze",
    email: "chaostknight483@gmail.com",
    phone: "0812 3456 7890",
    primaryAddress: "Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan, 12190",
  });

  // Saved Addresses State
  const [addresses, setAddresses] = useState([
    { id: 1, label: "Rumah Utama", details: "Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan, 12190", isPrimary: true },
    { id: 2, label: "Kantor", details: "Pacific Century Place Lt. 15, SCBD Lot 10, Jl. Jend. Sudirman, Jakarta Pusat, 12190", isPrimary: false },
  ]);

  // Form states for adding/editing address
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressLabel, setAddressLabel] = useState("");
  const [addressDetails, setAddressDetails] = useState("");

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/pelanggan/dashboard" },
    { id: "pesanan", label: "Pesanan Saya", icon: "receipt_long", path: "/pelanggan/pesanan" },
    { id: "chat", label: "Chat", icon: "chat", path: "/pelanggan/chat" },
    { id: "pembayaran", label: "Pembayaran", icon: "payments", path: "/pelanggan/pembayaran" },
    { id: "profil", label: "Profil", icon: "person", path: "/pelanggan/profil", active: true },
  ];

  const handleLogout = () => {
    // Redirect to Landing Page
    navigate("/");
  };

  const handleSaveProfile = () => {
    // Show success message (alert or state)
    alert("Perubahan profil berhasil disimpan!");
  };

  const handleAddOrUpdateAddress = (e) => {
    e.preventDefault();
    if (!addressLabel || !addressDetails) return;

    if (editingAddressId) {
      setAddresses(addresses.map(addr => 
        addr.id === editingAddressId 
          ? { ...addr, label: addressLabel, details: addressDetails } 
          : addr
      ));
      setEditingAddressId(null);
    } else {
      const newAddress = {
        id: Date.now(),
        label: addressLabel,
        details: addressDetails,
        isPrimary: addresses.length === 0,
      };
      setAddresses([...addresses, newAddress]);
    }

    setAddressLabel("");
    setAddressDetails("");
    setIsAddressFormOpen(false);
  };

  const handleEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddressLabel(addr.label);
    setAddressDetails(addr.details);
    setIsAddressFormOpen(true);
  };

  const handleDeleteAddress = (id) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
  };

  const handleSetPrimaryAddress = (id) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isPrimary: addr.id === id
    })));
    const primary = addresses.find(addr => addr.id === id);
    if (primary) {
      setProfileData({ ...profileData, primaryAddress: primary.details });
    }
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
            <button onClick={() => setIsLogoutModalOpen(true)} className="text-on-surface-variant hover:text-red-400 transition-colors p-1 flex items-center justify-center cursor-pointer bg-transparent border-none" title="Log Out">
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
              <h2 className="font-headline-md text-headline-md font-bold text-secondary">Profil Saya</h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
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
                alt="Reze Profile"
                src="https://i.pinimg.com/736x/3a/5f/ec/3a5fec637c8a8850f6e2732cf42f5c67.jpg"
              />
            </div>
          </div>
        </header>

        {/* Canvas */}
        <div className="pt-28 pb-12 px-6 md:px-12 max-w-5xl w-full mx-auto space-y-8 flex-grow page-transition">
          
          {/* Header Profil (Section 1) */}
          <section className="bg-surface-container rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6 border border-surface-variant/15 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 blur-[100px] pointer-events-none"></div>
            
            <div className="relative group">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-surface-container-high overflow-hidden shadow-xl">
                <img
                  className="w-full h-full object-cover"
                  alt="Reze Profile"
                  src="https://i.pinimg.com/736x/3a/5f/ec/3a5fec637c8a8850f6e2732cf42f5c67.jpg"
                />
              </div>
              <button className="absolute bottom-0 right-0 bg-secondary text-on-secondary p-1.5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer border-none flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
            </div>
            
            <div className="text-center sm:text-left space-y-1 flex-1">
              <h3 className="text-xl font-extrabold text-on-surface">{profileData.fullName}</h3>
              <p className="text-xs text-on-surface-variant/80">{profileData.email}</p>
              <span className="inline-block mt-2 text-[10px] bg-secondary/15 border border-secondary/20 px-2.5 py-0.5 rounded-full text-secondary font-bold">
                Akun Terverifikasi
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

          {/* Grid Layout for Personal Info & Security vs Address */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column (Personal Info & Security) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Informasi Pribadi (Section 2) */}
              <div className="bg-surface-container rounded-3xl border border-surface-variant/15 overflow-hidden shadow-lg">
                <div className="px-6 py-4 bg-surface-container-high/60 border-b border-surface-variant/10 flex justify-between items-center">
                  <h4 className="font-bold text-sm text-on-surface">Informasi Pribadi</h4>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant/70 uppercase tracking-wider block">Nama Lengkap</label>
                    <input
                      type="text"
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:ring-1 focus:ring-secondary/50 focus:border-secondary/50 transition-all"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-on-surface-variant/70 uppercase tracking-wider block">Email</label>
                      <input
                        type="email"
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:ring-1 focus:ring-secondary/50 focus:border-secondary/50 transition-all"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-on-surface-variant/70 uppercase tracking-wider block">Nomor Telepon</label>
                      <input
                        type="text"
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:ring-1 focus:ring-secondary/50 focus:border-secondary/50 transition-all"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant/70 uppercase tracking-wider block">Alamat Utama</label>
                    <input
                      type="text"
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs text-on-surface-variant bg-surface-container-low/50 cursor-not-allowed"
                      value={profileData.primaryAddress}
                      readOnly
                    />
                    <p className="text-[10px] text-on-surface-variant/60 mt-1">Alamat utama disinkronisasikan dari Alamat Tersimpan pilihan Anda.</p>
                  </div>
                </div>
              </div>

              {/* Keamanan Akun (Section 3) */}
              <div className="bg-surface-container rounded-3xl border border-surface-variant/15 overflow-hidden shadow-lg">
                <div className="px-6 py-4 bg-surface-container-high/60 border-b border-surface-variant/10">
                  <h4 className="font-bold text-sm text-on-surface">Keamanan Akun</h4>
                </div>
                <div className="p-6 space-y-4">
                  
                  {/* Ubah Password */}
                  <div className="flex items-center justify-between p-3.5 border border-outline-variant/20 rounded-2xl bg-surface-container-low/50 hover:border-secondary/15 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="bg-surface-container-high p-2 rounded-xl text-secondary">
                        <span className="material-symbols-outlined text-base">lock</span>
                      </div>
                      <div>
                        <p className="font-bold text-xs text-on-surface">Kata Sandi</p>
                        <p className="text-[10px] text-on-surface-variant/60 mt-0.5">Terakhir diubah 3 bulan lalu</p>
                      </div>
                    </div>
                    <button className="text-secondary text-xs font-bold hover:underline bg-transparent border-none cursor-pointer">
                      Ubah Sandi
                    </button>
                  </div>

                  {/* Verifikasi Email */}
                  <div className="flex items-center justify-between p-3.5 border border-outline-variant/20 rounded-2xl bg-surface-container-low/50">
                    <div className="flex items-center gap-3">
                      <div className="bg-surface-container-high p-2 rounded-xl text-primary">
                        <span className="material-symbols-outlined text-base">verified_user</span>
                      </div>
                      <div>
                        <p className="font-bold text-xs text-on-surface">Verifikasi Email</p>
                        <p className="text-[10px] text-on-surface-variant/60 mt-0.5">Email utama Anda sudah terverifikasi</p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full text-green-400 font-bold uppercase">
                      Aktif
                    </span>
                  </div>

                  {/* Nomor Telepon Terverifikasi */}
                  <div className="flex items-center justify-between p-3.5 border border-outline-variant/20 rounded-2xl bg-surface-container-low/50">
                    <div className="flex items-center gap-3">
                      <div className="bg-surface-container-high p-2 rounded-xl text-green-400">
                        <span className="material-symbols-outlined text-base">phone_iphone</span>
                      </div>
                      <div>
                        <p className="font-bold text-xs text-on-surface">Nomor Telepon Terverifikasi</p>
                        <p className="text-[10px] text-on-surface-variant/60 mt-0.5">OTP verifikasi telepon aktif</p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full text-green-400 font-bold uppercase">
                      Aktif
                    </span>
                  </div>

                </div>
              </div>

            </div>

            {/* Right Column (Addresses Section 4) */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-surface-container rounded-3xl border border-surface-variant/15 overflow-hidden shadow-lg h-full flex flex-col justify-between">
                <div>
                  <div className="px-6 py-4 bg-surface-container-high/60 border-b border-surface-variant/10 flex justify-between items-center">
                    <h4 className="font-bold text-sm text-on-surface">Alamat Tersimpan</h4>
                    <button
                      onClick={() => {
                        setEditingAddressId(null);
                        setAddressLabel("");
                        setAddressDetails("");
                        setIsAddressFormOpen(true);
                      }}
                      className="text-secondary hover:underline text-xs font-bold bg-transparent border-none cursor-pointer"
                    >
                      Tambah
                    </button>
                  </div>

                  <div className="p-6 space-y-3 flex-grow overflow-y-auto">
                    {addresses.map((addr) => (
                      <div key={addr.id} className={`p-4 border rounded-2xl bg-surface-container-low/50 transition-colors relative group ${addr.isPrimary ? "border-secondary/30" : "border-outline-variant/20"}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-xs text-secondary">
                              {addr.label.toLowerCase().includes("kantor") ? "work" : "home"}
                            </span>
                            <span className="font-bold text-xs text-on-surface">{addr.label}</span>
                          </div>
                          {addr.isPrimary ? (
                            <span className="bg-secondary/15 text-secondary text-[8px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                              Utama
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSetPrimaryAddress(addr.id)}
                              className="text-on-surface-variant hover:text-secondary text-[9px] font-bold bg-transparent border-none cursor-pointer hover:underline"
                            >
                              Jadikan Utama
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-on-surface-variant/80 leading-relaxed">
                          {addr.details}
                        </p>
                        
                        {/* Address Actions */}
                        <div className="mt-3 flex gap-3">
                          <button
                            onClick={() => handleEditAddress(addr)}
                            className="text-on-surface-variant hover:text-secondary text-[10px] font-bold bg-transparent border-none cursor-pointer flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[12px]">edit</span> Edit
                          </button>
                          {!addr.isPrimary && (
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="text-on-surface-variant hover:text-red-400 text-[10px] font-bold bg-transparent border-none cursor-pointer flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[12px]">delete</span> Hapus
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Address Form Container (Modal or Box) */}
                    {isAddressFormOpen && (
                      <form onSubmit={handleAddOrUpdateAddress} className="mt-4 p-4 border border-outline-variant/30 rounded-2xl bg-surface-container-high/40 space-y-3">
                        <h5 className="font-bold text-xs text-on-surface">
                          {editingAddressId ? "Edit Alamat" : "Tambah Alamat Baru"}
                        </h5>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Label Alamat</label>
                          <input
                            type="text"
                            placeholder="Contoh: Rumah, Kantor, Kos"
                            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-1.5 text-xs text-on-surface"
                            value={addressLabel}
                            onChange={(e) => setAddressLabel(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Detail Alamat Lengkap</label>
                          <textarea
                            rows="2"
                            placeholder="Jl. Raya No. X, Kota, Kode Pos"
                            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-1.5 text-xs text-on-surface"
                            value={addressDetails}
                            onChange={(e) => setAddressDetails(e.target.value)}
                            required
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setIsAddressFormOpen(false)}
                            className="px-3 py-1.5 border border-outline-variant/30 rounded-xl text-[10px] font-bold text-on-surface-variant hover:bg-surface-container-high cursor-pointer"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="px-3 py-1.5 bg-secondary text-on-secondary rounded-xl text-[10px] font-bold hover:opacity-90 cursor-pointer"
                          >
                            {editingAddressId ? "Simpan" : "Tambah"}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="p-4 bg-surface-container-low rounded-2xl border border-surface-variant/10 text-xs text-on-surface-variant flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary text-sm">info</span>
                    <p className="leading-relaxed text-[10px]">
                      Alamat tersimpan memudahkan Anda saat memesan jasa perbaikan di masa mendatang.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Footer Action (Section 5) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-surface-variant/20">
            <div className="flex items-center gap-2 text-on-surface-variant text-xs">
              <span className="material-symbols-outlined text-sm">security</span>
              <p className="text-[10px]">Data Anda dilindungi penuh oleh kebijakan privasi TukangAja.</p>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
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

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          
          {/* Blur & Dark Backdrop */}
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setIsLogoutModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative bg-surface-container border border-surface-variant/20 w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center space-y-4 animate-[scaleUp_0.25s_cubic-bezier(0.34,1.56,0.64,1)_forwards]">
            
            {/* Logout Icon */}
            <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
              <span className="material-symbols-outlined text-2xl font-bold">logout</span>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-extrabold text-base text-on-surface">Keluar dari Akun?</h4>
              <p className="text-xs text-on-surface-variant/80 leading-relaxed px-2">
                Apakah Anda yakin ingin keluar dari akun TukangAja?
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

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsShareModalOpen(false)}></div>
          
          <div className="relative bg-surface-container border border-surface-variant/20 w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center space-y-4 animate-[scaleUp_0.25s_cubic-bezier(0.34,1.56,0.64,1)_forwards]">
            <div className="w-12 h-12 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center border border-secondary/25">
              <span className="material-symbols-outlined text-lg">share</span>
            </div>
            
            <div>
              <h4 className="font-bold text-sm text-on-surface">Bagikan Profil Saya</h4>
              <p className="text-[11px] text-on-surface-variant/80 mt-1 leading-relaxed">
                Salin tautan profil pelanggan Anda untuk dibagikan.
              </p>
            </div>

            <div className="w-full bg-surface-container-low border border-outline-variant/20 p-2.5 rounded-xl flex items-center justify-between text-xs">
              <span className="truncate text-on-surface-variant font-medium select-all">https://tukangaja.com/u/reze-customer</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText("https://tukangaja.com/u/reze-customer");
                  alert("Link disalin ke clipboard!");
                  setIsShareModalOpen(false);
                }}
                className="text-secondary font-bold hover:underline ml-2 bg-transparent border-none cursor-pointer"
              >
                Salin
              </button>
            </div>

            <button 
              onClick={() => setIsShareModalOpen(false)}
              className="w-full py-2.5 rounded-xl border border-outline-variant/30 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[0%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
}

export default Profil;
