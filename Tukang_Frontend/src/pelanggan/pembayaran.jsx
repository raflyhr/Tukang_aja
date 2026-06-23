import { useState } from "react";
import { Link } from "react-router-dom";

function Pembayaran() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/pelanggan/dashboard" },
    { id: "pesanan", label: "Pesanan Saya", icon: "receipt_long", path: "/pelanggan/pesanan" },
    { id: "chat", label: "Chat", icon: "chat", path: "/pelanggan/chat" },
    { id: "pembayaran", label: "Pembayaran", icon: "payments", path: "/pelanggan/pembayaran", active: true },
    { id: "profil", label: "Profil", icon: "person", path: "/pelanggan/profil" },
  ];

  const summaryData = [
    { label: "Total Pengeluaran", value: "Rp 3.820.000", icon: "payments", color: "text-secondary bg-secondary/10 border-secondary/15" },
    { label: "Pembayaran Bulan Ini", value: "Rp 1.100.000", icon: "calendar_today", color: "text-primary bg-primary/10 border-primary/15" },
    { label: "Transaksi Berhasil", value: "45 Transaksi", icon: "task_alt", color: "text-green-400 bg-green-500/10 border-green-500/15" },
  ];

  const paymentMethods = [
    { id: 1, name: "Transfer Bank (BCA)", type: "Bank Transfer", detail: "Rek. **** 9012", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg", isPrimary: true, logoBg: "bg-white p-1" },
    { id: 2, name: "Dana", type: "E-Wallet", detail: "0812 **** 4832", logo: "https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg", isPrimary: false, logoBg: "bg-white/5 p-2" },
    { id: 3, name: "GoPay", type: "E-Wallet", detail: "0812 **** 4832", logo: "https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg", isPrimary: false, logoBg: "bg-white/5 p-1.5" },
    { id: 4, name: "OVO", type: "E-Wallet", detail: "0812 **** 4832", logo: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_ovo_purple.svg", isPrimary: false, logoBg: "bg-white/5 p-2" },
  ];

  const pendingPayments = [
    {
      id: "PAY-WAIT-102",
      service: "Perbaikan Pipa Air - Darurat",
      tukang: "Budi Santoso",
      amount: "Rp 250.000",
      method: "GoPay",
      status: "Menunggu Pembayaran",
      statusColor: "text-secondary bg-secondary/10 border-secondary/20",
    },
    {
      id: "PAY-WAIT-101",
      service: "Instalasi Panel Listrik Baru",
      tukang: "Andi Wijaya",
      amount: "Rp 1.200.000",
      method: "Transfer Bank BCA",
      status: "Diproses",
      statusColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
  ];

  const transactionHistory = [
    {
      id: "TX-9812",
      service: "Perbaikan Wastafel",
      tukang: "Bambang Susilo",
      date: "22 Juni 2026",
      method: "OVO",
      status: "Berhasil",
      statusColor: "text-green-400 bg-green-500/10 border-green-500/20",
      amount: "Rp 180.000",
    },
    {
      id: "TX-9790",
      service: "Pengecatan Ruang Tamu",
      tukang: "Hadi Pratama",
      date: "12 Nov 2023",
      method: "Transfer BCA",
      status: "Berhasil",
      statusColor: "text-green-400 bg-green-500/10 border-green-500/20",
      amount: "Rp 850.000",
    },
    {
      id: "TX-9755",
      service: "Deep Cleaning Apartemen",
      tukang: "Siti Aminah",
      date: "5 Nov 2023",
      method: "Dana",
      status: "Berhasil",
      statusColor: "text-green-400 bg-green-500/10 border-green-500/20",
      amount: "Rp 450.000",
    },
    {
      id: "TX-9730",
      service: "Perbaikan Atap Bocor",
      tukang: "Joko Susilo",
      date: "1 Nov 2023",
      method: "QRIS",
      status: "Gagal",
      statusColor: "text-red-400 bg-red-500/10 border-red-500/20",
      amount: "Rp 600.000",
    },
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
            <Link to="/" className="text-on-surface-variant hover:text-red-400 transition-colors p-1 flex items-center justify-center cursor-pointer" title="Log Out">
              <span className="material-symbols-outlined">logout</span>
            </Link>
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
              <h2 className="font-headline-md text-headline-md font-bold text-secondary">Pembayaran</h2>
              <div className={`hidden md:flex bg-surface-container-high rounded-full px-4 py-1.5 items-center gap-3 ml-4 transition-all duration-200 ${searchFocused ? "ring-2 ring-secondary/50" : ""}`}>
                <span className="material-symbols-outlined text-on-surface-variant/50 text-sm">search</span>
                <input
                  className="bg-transparent border-none focus:ring-0 text-sm w-48 text-on-surface placeholder:text-on-surface-variant/40"
                  placeholder="Cari transaksi..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
              </div>
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
        <div className="pt-28 pb-12 px-6 md:px-12 max-w-7xl w-full mx-auto space-y-8 flex-grow page-transition">
          
          {/* Ringkasan Pembayaran (Section 1) */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {summaryData.map((data) => (
              <div key={data.label} className="bg-surface-container/60 backdrop-blur-md p-6 rounded-2xl flex flex-col gap-4 border border-surface-variant/15 shadow-lg group hover:border-secondary/10 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-xl border ${data.color}`}>
                    <span className="material-symbols-outlined">{data.icon}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-on-surface-variant/70 uppercase tracking-wider">
                    {data.label}
                  </p>
                  <h3 className="text-2xl font-extrabold mt-1 text-on-surface">{data.value}</h3>
                </div>
              </div>
            ))}
          </section>

          {/* Bento Grid: Saved Payment Methods & Pending Payments */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Metode Pembayaran Tersimpan (Section 2) */}
            <div className="lg:col-span-6 bg-surface-container p-6 rounded-3xl border border-surface-variant/20 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-on-surface text-base">Metode Pembayaran Tersimpan</h3>
                  <span className="text-[10px] bg-secondary/10 border border-secondary/20 px-2 py-0.5 rounded-full text-secondary font-bold">Default</span>
                </div>
                
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-3.5 bg-surface-container-high rounded-2xl border border-surface-variant/10 hover:border-secondary/20 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-outline-variant/10 overflow-hidden ${method.logoBg}`}>
                          <img src={method.logo} alt={method.name} className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-on-surface">{method.name}</p>
                          <p className="text-[10px] text-on-surface-variant/60 mt-0.5">{method.detail}</p>
                        </div>
                      </div>
                      {method.isPrimary && (
                        <span className="text-[9px] text-secondary border border-secondary/35 px-2 py-0.5 rounded-full font-bold uppercase">
                          Utama
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button className="w-full mt-6 bg-secondary text-on-secondary font-bold py-3 rounded-2xl text-xs hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">add_circle</span>
                Tambah Metode Pembayaran
              </button>
            </div>

            {/* Pembayaran Menunggu Konfirmasi (Section 3) */}
            <div className="lg:col-span-6 bg-surface-container p-6 rounded-3xl border border-surface-variant/20 shadow-lg flex flex-col">
              <h3 className="font-bold text-on-surface mb-6 text-base">Menunggu Konfirmasi Pembayaran</h3>
              
              <div className="space-y-4 flex-1">
                {pendingPayments.map((item) => (
                  <div key={item.id} className="p-4 bg-surface-container-high rounded-2xl border border-surface-variant/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-secondary/15 transition-all">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">{item.id}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${item.statusColor}`}>
                          {item.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-on-surface mt-1.5">{item.service}</h4>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">Tukang: {item.tukang} • {item.method}</p>
                    </div>
                    <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                      <span className="font-extrabold text-sm text-on-surface">{item.amount}</span>
                      <button className="bg-secondary text-on-secondary text-[10px] font-bold px-3 py-1.5 rounded-xl hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer">
                        Bayar Sekarang
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </section>

          {/* Riwayat Transaksi (Section 4) */}
          <section className="bg-surface-container-low border border-surface-variant/15 rounded-3xl overflow-hidden shadow-lg">
            <div className="p-6 border-b border-surface-variant/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-on-surface text-base">Riwayat Transaksi</h3>
                <p className="text-on-surface-variant text-xs mt-0.5">Daftar transaksi pembayaran jasa yang telah selesai atau gagal</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-surface-container rounded-xl p-1 border border-outline-variant/10 text-xs">
                  <button className="px-3.5 py-1.5 rounded-lg bg-surface-container-highest text-on-surface font-bold cursor-pointer">Semua</button>
                  <button className="px-3.5 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">Layanan</button>
                </div>
                <button className="p-2 rounded-xl bg-surface-container-high border border-outline-variant/20 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">filter_list</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto scroll-hide">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-container-high/40 text-on-surface-variant/70 font-semibold border-b border-surface-variant/10">
                    <th className="p-4 uppercase tracking-wider">Transaksi</th>
                    <th className="p-4 uppercase tracking-wider">Tukang</th>
                    <th className="p-4 uppercase tracking-wider">Tanggal</th>
                    <th className="p-4 uppercase tracking-wider">Metode</th>
                    <th className="p-4 uppercase tracking-wider">Status</th>
                    <th className="p-4 uppercase tracking-wider text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant/10 font-medium">
                  {transactionHistory.map((tx) => (
                    <tr key={tx.id} className="hover:bg-surface-container-high/15 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-bold text-on-surface">{tx.service}</p>
                          <p className="text-[10px] text-on-surface-variant/60 mt-0.5">{tx.id}</p>
                        </div>
                      </td>
                      <td className="p-4 text-on-surface-variant">{tx.tukang}</td>
                      <td className="p-4 text-on-surface-variant">{tx.date}</td>
                      <td className="p-4 text-on-surface-variant">{tx.method}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${tx.statusColor}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold text-on-surface">{tx.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Pagination */}
            <div className="p-4 flex items-center justify-between border-t border-surface-variant/10 bg-surface-container-high/20">
              <p className="text-on-surface-variant opacity-75">Menampilkan 1-4 dari 28 transaksi</p>
              <div className="flex items-center gap-1.5">
                <button className="p-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-on-surface-variant hover:text-on-surface disabled:opacity-30 transition-all flex items-center justify-center cursor-pointer" disabled>
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button className="h-8 w-8 flex items-center justify-center rounded-xl bg-secondary text-on-secondary font-bold text-xs">1</button>
                <button className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-surface-container-highest transition-colors text-xs font-semibold cursor-pointer">2</button>
                <button className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-surface-container-highest transition-colors text-xs font-semibold cursor-pointer">3</button>
                <button className="p-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-on-surface-variant hover:text-on-surface transition-all flex items-center justify-center cursor-pointer">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </section>

          {/* Informasi Keamanan (Section 5) & Support */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="bg-primary-container/10 p-6 rounded-3xl border border-primary/20 relative overflow-hidden flex flex-col justify-between h-48">
              <div className="relative z-10 max-w-sm">
                <h4 className="font-bold text-primary mb-1 text-sm">Butuh Bantuan Transaksi?</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Jika Anda mengalami kendala mengenai pembayaran, konfirmasi transfer, atau kendala teknis lainnya, tim support kami siap membantu 24/7.
                </p>
              </div>
              <button className="relative z-10 w-fit flex items-center gap-1.5 text-primary text-xs font-bold hover:underline cursor-pointer">
                Hubungi Customer Service
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-[120px] text-primary/10 select-none pointer-events-none">support_agent</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-surface-container/40 rounded-2xl border border-surface-variant/10">
                <div className="h-10 w-10 rounded-full bg-surface-container-high flex items-center justify-center text-secondary shrink-0 border border-secondary/15">
                  <span className="material-symbols-outlined text-base">verified_user</span>
                </div>
                <div>
                  <h5 className="font-bold text-xs text-on-surface">Pembayaran Aman & Terenkripsi</h5>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed mt-0.5">
                    Setiap transaksi diproses dengan standar enkripsi SSL 256-bit tingkat perbankan untuk menjamin keamanan penuh.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-surface-container/40 rounded-2xl border border-surface-variant/10">
                <div className="h-10 w-10 rounded-full bg-surface-container-high flex items-center justify-center text-secondary shrink-0 border border-secondary/15">
                  <span className="material-symbols-outlined text-base">shield_with_heart</span>
                </div>
                <div>
                  <h5 className="font-bold text-xs text-on-surface">Perlindungan Dana Pelanggan</h5>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed mt-0.5">
                    Dana Anda hanya akan diteruskan ke tukang setelah Anda mengonfirmasi pekerjaan telah selesai dengan baik.
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[0%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
}

export default Pembayaran;
