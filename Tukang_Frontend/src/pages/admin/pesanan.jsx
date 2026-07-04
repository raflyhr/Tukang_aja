import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminData } from "./adminData";
import LogoutModal from "../../components/LogoutModal";

const MOCK_PESANAN = [
  { id: "TRX-9982", pelanggan: "Rian Hidayat", tukang: "Budi Santoso", layanan: "Servis AC", status: "Selesai", total: 150000, tanggal: "03 Jul 2026" },
  { id: "TRX-9981", pelanggan: "Dewi Lestari", tukang: "Agus Prasetyo", layanan: "Instalasi Listrik", status: "Sedang Diproses", total: 350000, tanggal: "03 Jul 2026" },
  { id: "TRX-9980", pelanggan: "Budi Pratama", tukang: "Hendra Wijaya", layanan: "Perbaikan Pipa Air", status: "Menunggu Pembayaran", total: 200000, tanggal: "02 Jul 2026" },
  { id: "TRX-9979", pelanggan: "Siti Aminah", tukang: "Budi Santoso", layanan: "Pembersihan AC", status: "Selesai", total: 120000, tanggal: "01 Jul 2026" },
  { id: "TRX-9978", pelanggan: "Andi Wijaya", tukang: "Joko Susilo", layanan: "Cat Dinding", status: "Dibatalkan", total: 1200000, tanggal: "30 Jun 2026" }
];

function AdminPesanan() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [pesananList, setPesananList] = useState(MOCK_PESANAN);

  const filteredPesanan = pesananList.filter(p => {
    const matchesSearch = 
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.pelanggan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tukang.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.layanan.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === "Semua") return matchesSearch;
    return matchesSearch && p.status === statusFilter;
  });

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/admin/dashboard" },
    { id: "verifikasi", label: "Verifikasi Tukang", icon: "how_to_reg", path: "/admin/verifikasi" },
    { id: "data", label: "Data Tukang", icon: "engineering", path: "/admin/data" },
    { id: "pelanggan", label: "Data Pelanggan", icon: "group", path: "/admin/pelanggan" },
    { id: "rating", label: "Monitoring Rating", icon: "star_rate", path: "/admin/rating" },
    { id: "profil", label: "Profil Admin", icon: "admin_panel_settings", path: "/admin/profil" },
  ];

  return (
    <div className="bg-background text-on-surface min-h-screen selection:bg-secondary/30 selection:text-secondary font-sans relative overflow-x-hidden flex">
      {/* Sidebar */}
      <aside className={`h-screen w-64 fixed left-0 top-0 bg-surface-container flex flex-col py-6 px-4 z-50 border-r border-surface-variant/20 transition-transform duration-300 lg:transition-none lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-4 mb-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary/15 rounded-lg flex items-center justify-center text-secondary border border-secondary/10 shrink-0">
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>list_alt</span>
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
          {navigationItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className="w-full flex items-center gap-4 py-3 px-4 font-semibold rounded-xl text-left cursor-pointer text-on-surface-variant"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>{item.icon}</span>
              <span className="text-sm font-semibold">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow lg:ml-64 min-h-screen relative flex flex-col">
        {/* TopAppBar */}
        <header className="fixed top-0 right-0 left-0 lg:left-64 z-40 flex justify-between items-center px-6 md:px-12 h-20 bg-surface/80 backdrop-blur-xl border-b border-surface-variant/20">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-on-surface-variant bg-transparent border-none cursor-pointer">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">search</span>
              <input 
                className="w-full bg-surface-container-high border-none rounded-full py-2.5 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-secondary/50 text-sm outline-none" 
                placeholder="Cari transaksi, pelanggan, tukang..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* Canvas */}
        <div className="pt-28 pb-12 px-6 md:px-12 max-w-7xl w-full mx-auto space-y-8 flex-grow">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-on-surface">Manajemen Monitoring Pesanan</h1>
            <p className="text-sm text-on-surface-variant/80 font-normal mt-1">Pantau seluruh order jasa pertukangan secara realtime di platform.</p>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {["Semua", "Sedang Diproses", "Menunggu Pembayaran", "Selesai", "Dibatalkan"].map(status => (
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

          {/* Table */}
          <div className="bg-surface-container/60 border border-surface-variant/15 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-container-high/35 text-on-surface-variant uppercase text-[9px] font-bold tracking-widest border-b border-surface-variant/15">
                    <th className="px-6 py-4">ID Pesanan</th>
                    <th className="px-6 py-4">Pelanggan</th>
                    <th className="px-6 py-4">Mitra Tukang</th>
                    <th className="px-6 py-4">Layanan</th>
                    <th className="px-6 py-4">Tanggal</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant/10 font-medium">
                  {filteredPesanan.map((item) => (
                    <tr key={item.id} className="border-b border-surface-variant/10">
                      <td className="px-6 py-4 font-mono font-bold text-secondary">{item.id}</td>
                      <td className="px-6 py-4 text-on-surface">{item.pelanggan}</td>
                      <td className="px-6 py-4 text-on-surface">{item.tukang}</td>
                      <td className="px-6 py-4 text-on-surface-variant">{item.layanan}</td>
                      <td className="px-6 py-4 text-on-surface-variant">{item.tanggal}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wide ${
                          item.status === "Selesai" 
                            ? "bg-green-500/10 border-green-500/20 text-green-400"
                            : item.status === "Sedang Diproses"
                            ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                            : item.status === "Menunggu Pembayaran"
                            ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                            : "bg-red-500/10 border-red-500/20 text-red-400"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-on-surface font-semibold">Rp {item.total.toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={() => navigate("/")} 
        role="admin" 
      />
    </div>
  );
}

export default AdminPesanan;
