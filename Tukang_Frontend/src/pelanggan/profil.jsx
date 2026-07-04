import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import LeafletMapPicker from "../components/LeafletMapPicker";
import LogoutModal from "../components/LogoutModal";
import ImageCropModal from "../components/ImageCropModal";

function Profil() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // Sidebar open/close
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Logout modal state
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Toast Notification State
  const [toasts, setToasts] = useState([]);
  
  const showToast = (message, type = "success") => {
    const id = Date.now().toString() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Initial user data for change detection
  const initialData = {
    fullName: "Reze",
    email: "chaostknight483@gmail.com",
    phone: "0812 3456 7890",
    primaryAddress: "Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan, 12190",
  };

  // Profile data states
  const [profileData, setProfileData] = useState({ ...initialData });
  const [profilePic, setProfilePic] = useState("https://i.pinimg.com/736x/3a/5f/ec/3a5fec637c8a8850f6e2732cf42f5c67.jpg");

  // Saved Addresses State (with Coordinates)
  const [addresses, setAddresses] = useState([
    { id: 1, label: "Rumah Utama", details: "Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan, 12190", lat: -6.2244, lng: 106.8086, isPrimary: true },
    { id: 2, label: "Kantor", details: "Pacific Century Place Lt. 15, SCBD Lot 10, Jl. Jend. Sudirman, Jakarta Pusat, 12190", lat: -6.2231, lng: 106.8094, isPrimary: false },
  ]);

  // Modal toggle states
  const [isFullscreenPicOpen, setIsFullscreenPicOpen] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState("");
  const [cropZoom, setCropZoom] = useState(1);
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordFields, setPasswordFields] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });

  const [otpVerificationState, setOtpVerificationState] = useState(null); // null | { type: "email" | "phone", value: string, code: string }
  const [pendingProfileUpdates, setPendingProfileUpdates] = useState(null);

  // Address edit modal state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [selectedAddressForDelete, setSelectedAddressForDelete] = useState(null); // addr object or null
  const [addressLabel, setAddressLabel] = useState("");
  const [addressDetails, setAddressDetails] = useState("");
  const [addressCoords, setAddressCoords] = useState({ lat: -6.2088, lng: 106.8456 });
  const [editingAddressId, setEditingAddressId] = useState(null);

  // Delete Account multi-step flow
  const [deleteAccountStep, setDeleteAccountStep] = useState(0); // 0 = closed, 1 = confirm password, 2 = confirm OTP, 3 = final double-confirm
  const [deletePasswordInput, setDeletePasswordInput] = useState("");
  const [deleteOtpInput, setDeleteOtpInput] = useState("");

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/pelanggan/dashboard" },
    { id: "pesanan", label: "Pesanan Saya", icon: "receipt_long", path: "/pelanggan/pesanan" },
    { id: "chat", label: "Chat", icon: "chat", path: "/pelanggan/chat" },
    { id: "pembayaran", label: "Pembayaran", icon: "payments", path: "/pelanggan/pembayaran" },
    { id: "profil", label: "Profil", icon: "person", path: "/pelanggan/profil", active: true },
  ];

  // 1. Profile Picture upload trigger & simple crop simulator
  const handleEditPicClick = (e) => {
    e.stopPropagation();
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropImageSrc(reader.result);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmCrop = ({ file, dataUrl }) => {
    setProfilePic(dataUrl);
    setIsCropModalOpen(false);
    showToast("Foto profil berhasil diperbarui!", "success");
  };

  // 4. Web Share / Clipboard API
  const handleShareProfile = async () => {
    const shareUrl = "https://tukangaja.com/u/reze-customer";
    const shareData = {
      title: "Profil Pelanggan TukangAja",
      text: "Hubungi jasa tukang terpercaya melalui profil saya di TukangAja.",
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        showToast("Profil berhasil dibagikan!", "success");
      } catch (err) {
        // Fallback to copy if share fails or cancelled
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
    setIsShareModalOpen(false);
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    showToast("Tautan profil berhasil disalin ke clipboard!", "success");
  };

  // 3. Simpan Perubahan & sequence OTP for email/phone changes
  const handleSaveProfile = () => {
    if (!profileData.fullName.trim()) {
      showToast("Nama lengkap tidak boleh kosong!", "error");
      return;
    }

    const emailChanged = profileData.email.trim() !== initialData.email;
    const phoneChanged = profileData.phone.trim() !== initialData.phone;

    if (emailChanged) {
      // Trigger Email OTP flow
      setPendingProfileUpdates({ ...profileData });
      setOtpVerificationState({
        type: "email",
        value: profileData.email.trim(),
        code: "",
      });
      return;
    }

    if (phoneChanged) {
      // Trigger Phone OTP flow
      setPendingProfileUpdates({ ...profileData });
      setOtpVerificationState({
        type: "phone",
        value: profileData.phone.trim(),
        code: "",
      });
      return;
    }

    // Standard save if no security values changed
    showToast("Perubahan profil berhasil disimpan!", "success");
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    if (!otpVerificationState || otpVerificationState.code.length < 6) return;

    // Simulate OTP validation (using "123456" as dummy valid code)
    if (otpVerificationState.code === "123456") {
      showToast(`Verifikasi OTP untuk ${otpVerificationState.type} berhasil!`, "success");
      
      const updatedData = { ...pendingProfileUpdates };
      
      // If we verified email first and phone was also changed, trigger phone OTP next
      if (otpVerificationState.type === "email" && updatedData.phone !== initialData.phone) {
        setOtpVerificationState({
          type: "phone",
          value: updatedData.phone,
          code: "",
        });
      } else {
        setOtpVerificationState(null);
        setPendingProfileUpdates(null);
        showToast("Seluruh profil Anda berhasil diperbarui & disimpan!", "success");
      }
    } else {
      showToast("Kode OTP salah! Gunakan kode dummy: 123456", "error");
    }
  };

  // 7. Change Password modal action
  const handleChangePasswordSubmit = (e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = passwordFields;

    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast("Seluruh kolom password harus diisi!", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast("Kata sandi baru minimal harus 6 karakter!", "error");
      return;
    }
    if (newPassword === oldPassword) {
      showToast("Kata sandi baru tidak boleh sama dengan kata sandi lama!", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Konfirmasi kata sandi baru tidak cocok!", "error");
      return;
    }

    showToast("Kata sandi Anda berhasil diperbarui!", "success");
    setIsPasswordModalOpen(false);
    setPasswordFields({ oldPassword: "", newPassword: "", confirmPassword: "" });
  };

  // 8 & 9. Add or Edit Address with Leaflet Map Callback
  const handleMapLocationChange = (loc) => {
    if (loc.address) {
      setAddressDetails(loc.address);
    }
    setAddressCoords({ lat: loc.latitude, lng: loc.longitude });
  };

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressLabel("");
    setAddressDetails("");
    setAddressCoords({ lat: -6.2088, lng: 106.8456 }); // Default center Jakarta
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddressLabel(addr.label);
    setAddressDetails(addr.details);
    setAddressCoords({ lat: addr.lat || -6.2088, lng: addr.lng || 106.8456 });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!addressLabel.trim() || !addressDetails.trim()) {
      showToast("Label dan detail alamat tidak boleh kosong!", "error");
      return;
    }

    if (editingAddressId) {
      // Edit mode
      setAddresses(
        addresses.map((addr) =>
          addr.id === editingAddressId
            ? { ...addr, label: addressLabel, details: addressDetails, lat: addressCoords.lat, lng: addressCoords.lng }
            : addr
        )
      );
      showToast("Alamat berhasil diperbarui!", "success");
    } else {
      // Add mode
      const newAddr = {
        id: Date.now(),
        label: addressLabel,
        details: addressDetails,
        lat: addressCoords.lat,
        lng: addressCoords.lng,
        isPrimary: addresses.length === 0,
      };
      setAddresses([...addresses, newAddr]);
      showToast("Alamat baru berhasil ditambahkan!", "success");
    }

    setIsAddressModalOpen(false);
    setAddressLabel("");
    setAddressDetails("");
  };

  // 10. Delete address confirm
  const handleConfirmDeleteAddress = () => {
    if (selectedAddressForDelete) {
      setAddresses(addresses.filter((addr) => addr.id !== selectedAddressForDelete.id));
      showToast(`Alamat "${selectedAddressForDelete.label}" berhasil dihapus.`, "success");
      setSelectedAddressForDelete(null);
    }
  };

  // 11. Set primary address sync
  const handleSetPrimaryAddress = (id) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isPrimary: addr.id === id,
      }))
    );
    const targetAddr = addresses.find((addr) => addr.id === id);
    if (targetAddr) {
      setProfileData((prev) => ({
        ...prev,
        primaryAddress: targetAddr.details,
      }));
      showToast(`"${targetAddr.label}" dijadikan alamat utama.`, "success");
    }
  };

  // 13. Delete Account multi-step trigger
  const handleDeleteAccountSubmit = (e) => {
    e.preventDefault();

    if (deleteAccountStep === 1) {
      // Validate Password
      if (!deletePasswordInput) {
        showToast("Masukkan kata sandi untuk verifikasi!", "error");
        return;
      }
      // Simulating correct password match
      if (deletePasswordInput === "password") {
        setDeleteAccountStep(2);
        showToast("Verifikasi OTP telah dikirim ke ponsel Anda.", "success");
      } else {
        showToast("Kata sandi salah! Gunakan: password", "error");
      }
    } else if (deleteAccountStep === 2) {
      // Validate OTP
      if (deleteOtpInput === "123456") {
        setDeleteAccountStep(3);
      } else {
        showToast("Kode OTP salah! Gunakan kode dummy: 123456", "error");
      }
    }
  };

  const handleFinalDeleteAccount = () => {
    showToast("Akun Anda telah berhasil dihapus permanent.", "success");
    setDeleteAccountStep(0);
    setDeletePasswordInput("");
    setDeleteOtpInput("");
    navigate("/");
  };

  return (
    <div className="bg-background text-on-surface min-h-screen selection:bg-secondary/30 selection:text-secondary font-sans relative overflow-x-hidden flex">
      {/* File input (Hidden) */}
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      {/* Backdrop for Mobile Sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Toast notifications rendering */}
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
              {t.type === "success" ? "check_circle" : t.type === "error" ? "error" : "info"}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

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
                  alt="Reze Profile"
                  src={profilePic}
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
                src={profilePic}
              />
            </div>
          </div>
        </header>

        {/* Canvas */}
        <div className="pt-28 pb-12 px-6 md:px-12 max-w-5xl w-full mx-auto space-y-8 flex-grow page-transition">
          
          {/* Header Profil (Section 1) */}
          <section className="bg-surface-container rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6 border border-surface-variant/15 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 blur-[100px] pointer-events-none"></div>
            
            <div className="relative group cursor-pointer" onClick={() => setIsFullscreenPicOpen(true)} title="Klik untuk perbesar">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-surface-container-high overflow-hidden shadow-xl">
                <img
                  className="w-full h-full object-cover"
                  alt="Reze Profile"
                  src={profilePic}
                />
              </div>
              <button 
                onClick={handleEditPicClick}
                className="absolute bottom-0 right-0 bg-secondary text-on-secondary p-1.5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer border-none flex items-center justify-center"
                title="Ganti Foto Profil"
              >
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
              <button 
                onClick={handleEditPicClick}
                className="border border-outline-variant hover:border-secondary hover:text-secondary text-on-surface-variant px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-transparent"
              >
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
                    <button 
                      onClick={() => setIsPasswordModalOpen(true)}
                      className="text-secondary text-xs font-bold hover:underline bg-transparent border-none cursor-pointer"
                    >
                      Ubah Sandi
                    </button>
                  </div>

                  {/* Riwayat Login Navigation */}
                  <div className="flex items-center justify-between p-3.5 border border-outline-variant/20 rounded-2xl bg-surface-container-low/50 hover:border-secondary/15 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="bg-surface-container-high p-2 rounded-xl text-secondary">
                        <span className="material-symbols-outlined text-base">devices</span>
                      </div>
                      <div>
                        <p className="font-bold text-xs text-on-surface">Riwayat Login</p>
                        <p className="text-[10px] text-on-surface-variant/60 mt-0.5">Pantau sesi perangkat aktif Anda</p>
                      </div>
                    </div>
                    <Link 
                      to="/pelanggan/riwayat-login"
                      className="text-secondary text-xs font-bold hover:underline cursor-pointer"
                    >
                      Lihat Sesi
                    </Link>
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

                  {/* Hapus Akun Action Row */}
                  <div className="flex items-center justify-between p-3.5 border border-red-500/20 rounded-2xl bg-red-500/5 hover:bg-red-500/10 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-500/10 p-2 rounded-xl text-red-400">
                        <span className="material-symbols-outlined text-base">delete_forever</span>
                      </div>
                      <div>
                        <p className="font-bold text-xs text-on-surface">Hapus Akun Permanen</p>
                        <p className="text-[10px] text-on-surface-variant/60 mt-0.5">Menghapus seluruh riwayat dan data profil Anda</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setDeleteAccountStep(1)}
                      className="text-red-400 text-xs font-bold hover:underline cursor-pointer border-none bg-transparent"
                    >
                      Hapus Akun
                    </button>
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
                      onClick={handleOpenAddAddress}
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
                            onClick={() => handleOpenEditAddress(addr)}
                            className="text-on-surface-variant hover:text-secondary text-[10px] font-bold bg-transparent border-none cursor-pointer flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[12px]">edit</span> Edit
                          </button>
                          {!addr.isPrimary && (
                            <button
                              onClick={() => setSelectedAddressForDelete(addr)}
                              className="text-on-surface-variant hover:text-red-400 text-[10px] font-bold bg-transparent border-none cursor-pointer flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[12px]">delete</span> Hapus
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
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

      {/* MODAL: PHOTO FULLSCREEN VIEW */}
      {isFullscreenPicOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="absolute inset-0" onClick={() => setIsFullscreenPicOpen(false)}></div>
          <div className="relative max-w-lg w-full overflow-hidden rounded-3xl shadow-2xl flex flex-col items-center">
            <button 
              onClick={() => setIsFullscreenPicOpen(false)}
              className="absolute top-4 right-4 bg-black/60 p-2 rounded-full text-white hover:bg-black/80 transition-colors z-10 cursor-pointer border-none flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
            <img 
              src={profilePic} 
              alt="Profile Fullscreen" 
              className="max-h-[80vh] max-w-full object-contain rounded-2xl" 
            />
          </div>
        </div>
      )}

      {/* MODAL: PHOTO CROP */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        imageSrc={cropImageSrc}
        onClose={() => setIsCropModalOpen(false)}
        onConfirm={handleConfirmCrop}
      />

      {/* MODAL: SHARE OPTIONS */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container border border-surface-variant/20 w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center space-y-4 animate-scale-up text-xs font-semibold">
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
                onClick={handleShareProfile}
                className="text-secondary font-bold hover:underline ml-2 bg-transparent border-none cursor-pointer"
              >
                Bagikan
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

      {/* MODAL: UBAH PASSWORD */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container border border-surface-variant/15 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up text-xs font-semibold">
            <div className="p-5 border-b border-surface-variant/10 flex justify-between items-center bg-surface-container-high">
              <h3 className="text-sm font-extrabold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">lock_reset</span>
                Ubah Kata Sandi
              </h3>
              <button 
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-1 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-on-surface-variant text-[11px]">Kata Sandi Lama</label>
                <input 
                  type="password"
                  className="w-full bg-surface-container-high border border-outline-variant rounded-xl p-3 text-xs text-on-surface outline-none"
                  value={passwordFields.oldPassword}
                  onChange={(e) => setPasswordFields({ ...passwordFields, oldPassword: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-on-surface-variant text-[11px]">Kata Sandi Baru</label>
                <input 
                  type="password"
                  placeholder="Min 6 Karakter"
                  className="w-full bg-surface-container-high border border-outline-variant rounded-xl p-3 text-xs text-on-surface outline-none"
                  value={passwordFields.newPassword}
                  onChange={(e) => setPasswordFields({ ...passwordFields, newPassword: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-on-surface-variant text-[11px]">Konfirmasi Kata Sandi Baru</label>
                <input 
                  type="password"
                  className="w-full bg-surface-container-high border border-outline-variant rounded-xl p-3 text-xs text-on-surface outline-none"
                  value={passwordFields.confirmPassword}
                  onChange={(e) => setPasswordFields({ ...passwordFields, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full mt-2 bg-secondary text-on-secondary font-bold py-3.5 rounded-xl hover:scale-[1.01] transition-transform border-none cursor-pointer"
              >
                Perbarui Kata Sandi
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: OTP VERIFICATION FOR EMAIL/PHONE */}
      {otpVerificationState && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container border border-surface-variant/15 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up text-xs font-semibold">
            <div className="p-5 border-b border-surface-variant/10 flex justify-between items-center bg-surface-container-high">
              <h3 className="text-sm font-extrabold text-on-surface">Verifikasi Keamanan</h3>
              <button 
                onClick={() => {
                  setOtpVerificationState(null);
                  setPendingProfileUpdates(null);
                }}
                className="p-1 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleVerifyOTP} className="p-6 space-y-4 text-center">
              <span className="material-symbols-outlined text-secondary text-4xl animate-pulse">lock_person</span>
              <div className="space-y-1">
                <h4 className="font-bold text-on-surface">Masukkan Kode OTP</h4>
                <p className="text-[11px] text-on-surface-variant leading-relaxed px-4">
                  Masukkan 6 digit kode keamanan OTP yang dikirim ke {otpVerificationState.type === "email" ? "Email" : "No Telepon"} baru Anda: <br />
                  <strong className="text-on-surface">{otpVerificationState.value}</strong>
                </p>
              </div>

              <input 
                type="text"
                placeholder="Dummy code: 123456"
                maxLength="6"
                className="w-48 mx-auto tracking-[10px] text-center bg-surface-container-high border border-outline-variant rounded-xl p-3 text-sm text-on-surface outline-none focus:border-secondary font-bold"
                value={otpVerificationState.code}
                onChange={(e) => setOtpVerificationState({ ...otpVerificationState, code: e.target.value })}
                required
              />

              <button 
                type="submit"
                className="w-full bg-secondary text-on-secondary font-bold py-3 rounded-xl hover:scale-[1.01] transition-transform border-none cursor-pointer mt-4"
              >
                Verifikasi & Simpan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT ADDRESS WITH MAP PICKER */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-surface-container border border-surface-variant/15 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-scale-up text-xs font-semibold my-8">
            <div className="p-5 border-b border-surface-variant/10 flex justify-between items-center bg-surface-container-high">
              <h3 className="text-sm font-extrabold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">location_on</span>
                {editingAddressId ? "Ubah Alamat Tersimpan" : "Tambah Alamat Baru"}
              </h3>
              <button 
                onClick={() => setIsAddressModalOpen(false)}
                className="p-1 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-on-surface-variant text-[11px]">Label Alamat</label>
                  <input 
                    type="text"
                    placeholder="Contoh: Rumah Utama, Kantor, Kos"
                    className="w-full bg-surface-container-high border border-outline-variant rounded-xl p-3 text-xs text-on-surface outline-none font-bold"
                    value={addressLabel}
                    onChange={(e) => setAddressLabel(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-on-surface-variant text-[11px]">Alamat Lengkap (Nominatim Geocoded)</label>
                  <textarea 
                    rows="4"
                    placeholder="Pilih lokasi pada peta atau ketik alamat..."
                    className="w-full bg-surface-container-high border border-outline-variant rounded-xl p-3 text-xs text-on-surface outline-none font-bold resize-none"
                    value={addressDetails}
                    onChange={(e) => setAddressDetails(e.target.value)}
                    required
                  />
                </div>

                <div className="p-3 bg-surface-container-high rounded-xl border border-outline-variant/10 space-y-1 text-[10px] text-on-surface-variant font-medium">
                  <p>Koordinat Geospasial:</p>
                  <p className="font-mono text-on-surface">Lat: {addressCoords.lat.toFixed(6)}</p>
                  <p className="font-mono text-on-surface">Lng: {addressCoords.lng.toFixed(6)}</p>
                </div>
              </div>

              {/* Map Column */}
              <div className="space-y-3">
                <label className="text-on-surface-variant text-[11px] block">Peta Pemilih Lokasi (OSM)</label>
                <div className="w-full">
                  <LeafletMapPicker onLocationChange={handleMapLocationChange} />
                </div>
                <p className="text-[9px] text-on-surface-variant/60 leading-normal">
                  Geser pin penunjuk atau gunakan bar pencarian di atas peta untuk menaruh lokasi spesifik Anda.
                </p>
              </div>

              <div className="md:col-span-2 pt-4 border-t border-surface-variant/10 flex justify-end gap-2.5">
                <button 
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2.5 border border-outline-variant text-on-surface hover:bg-surface-container-highest transition-all rounded-xl font-bold cursor-pointer bg-transparent"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2.5 bg-secondary text-on-secondary hover:bg-secondary/90 transition-all rounded-xl font-bold cursor-pointer border-none"
                >
                  Simpan Alamat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE ADDRESS CONFIRMATION */}
      {selectedAddressForDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container border border-surface-variant/20 w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center space-y-4 animate-scale-up text-xs font-semibold">
            <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
              <span className="material-symbols-outlined text-2xl font-bold">delete</span>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-extrabold text-base text-on-surface">Hapus Alamat?</h4>
              <p className="text-xs text-on-surface-variant/80 leading-relaxed px-4">
                Apakah Anda yakin ingin menghapus alamat <strong>{selectedAddressForDelete.label}</strong>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex gap-3 w-full pt-2">
              <button
                onClick={() => setSelectedAddressForDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-outline-variant/30 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer bg-transparent"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDeleteAddress}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-colors cursor-pointer border-none"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE ACCOUNT MULTI-STEP FLOW */}
      {deleteAccountStep > 0 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container border border-surface-variant/15 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up text-xs font-semibold">
            <div className="p-5 border-b border-surface-variant/10 flex justify-between items-center bg-surface-container-high">
              <h3 className="text-sm font-extrabold text-red-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-lg">dangerous</span>
                Hapus Akun (Langkah {deleteAccountStep}/3)
              </h3>
              <button 
                onClick={() => {
                  setDeleteAccountStep(0);
                  setDeletePasswordInput("");
                  setDeleteOtpInput("");
                }}
                className="p-1 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {deleteAccountStep === 1 && (
              <form onSubmit={handleDeleteAccountSubmit} className="p-6 space-y-4 text-center">
                <div className="space-y-1">
                  <h4 className="font-bold text-on-surface text-sm">Konfirmasi Sandi Anda</h4>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    Demi keamanan akun, silakan masukkan kata sandi akun Anda saat ini untuk memulai proses penghapusan.
                  </p>
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[10px] text-on-surface-variant uppercase font-bold">Kata Sandi</label>
                  <input 
                    type="password"
                    placeholder="Masukkan sandi (dummy: password)"
                    className="w-full bg-surface-container-high border border-outline-variant rounded-xl p-3 text-xs text-on-surface outline-none"
                    value={deletePasswordInput}
                    onChange={(e) => setDeletePasswordInput(e.target.value)}
                    required
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-colors border-none cursor-pointer mt-2"
                >
                  Lanjut Ke Langkah 2
                </button>
              </form>
            )}

            {deleteAccountStep === 2 && (
              <form onSubmit={handleDeleteAccountSubmit} className="p-6 space-y-4 text-center">
                <div className="space-y-1">
                  <h4 className="font-bold text-on-surface text-sm">Masukkan Kode OTP Hapus Akun</h4>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    Masukkan 6 digit OTP konfirmasi pembatalan akun yang telah dikirim ke ponsel Anda.
                  </p>
                </div>
                
                <input 
                  type="text"
                  placeholder="Dummy OTP: 123456"
                  maxLength="6"
                  className="w-48 mx-auto tracking-[10px] text-center bg-surface-container-high border border-outline-variant rounded-xl p-3 text-sm text-on-surface outline-none focus:border-secondary font-bold"
                  value={deleteOtpInput}
                  onChange={(e) => setDeleteOtpInput(e.target.value)}
                  required
                />

                <button 
                  type="submit"
                  className="w-full bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-colors border-none cursor-pointer mt-4"
                >
                  Lanjut Ke Langkah 3
                </button>
              </form>
            )}

            {deleteAccountStep === 3 && (
              <div className="p-6 space-y-4 text-center">
                <span className="material-symbols-outlined text-red-500 text-5xl animate-bounce">warning</span>
                <div className="space-y-1">
                  <h4 className="font-bold text-red-400 text-sm">Tindakan Ini Bersifat Permanen!</h4>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed px-2">
                    Menghapus akun Anda akan membatalkan seluruh pesanan aktif, menghapus saldo dompet, riwayat transaksi, dan profil secara permanen. Data tidak dapat dipulihkan kembali.
                  </p>
                </div>
                
                <div className="flex gap-3 w-full pt-2">
                  <button
                    onClick={() => {
                      setDeleteAccountStep(0);
                      setDeletePasswordInput("");
                      setDeleteOtpInput("");
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-outline-variant/30 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer bg-transparent"
                  >
                    Batalkan Hapus
                  </button>
                  <button
                    onClick={handleFinalDeleteAccount}
                    className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer border-none"
                  >
                    Ya, Hapus Permanen
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setIsLogoutModalOpen(false)}
          />
          <div className="relative bg-surface-container border border-surface-variant/20 w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center space-y-4 animate-[scaleUp_0.25s_cubic-bezier(0.34,1.56,0.64,1)_forwards]">
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
                className="flex-1 py-2.5 rounded-xl border border-outline-variant/30 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer bg-transparent"
              >
                Batal
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex-1 py-2.5 bg-secondary text-on-secondary rounded-xl text-xs font-bold hover:opacity-95 transition-opacity cursor-pointer shadow-lg shadow-secondary/15"
              >
                Ya, Keluar
              </button>
            </div>
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
