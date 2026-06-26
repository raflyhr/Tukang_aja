import { Link, useNavigate } from "react-router-dom";
import LogoutModal from "../components/LogoutModal";
import { useState, useEffect } from "react";
import axios from "axios";

function Pesanan() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("semua");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/pelanggan/dashboard" },
    { id: "pesanan", label: "Pesanan Saya", icon: "receipt_long", path: "/pelanggan/pesanan", active: true },
    { id: "chat", label: "Chat", icon: "chat", path: "/pelanggan/chat" },
    { id: "pembayaran", label: "Pembayaran", icon: "payments", path: "/pelanggan/pembayaran" },
    { id: "profil", label: "Profil", icon: "person", path: "/pelanggan/profil" },
  ];

  const filterTabs = [
    { id: "semua", label: "Semua Pesanan" },
    { id: "proses", label: "Dalam Proses" },
    { id: "riwayat", label: "Riwayat" },
  ];

  useEffect(() => {
    getPesanan();
}, []);

const getPesanan = async () => {
    try {
        const userId = localStorage.getItem("user_id");

        const res = await axios.get(
            `http://127.0.0.1:8000/api/user/${userId}/pesanan`
        );

        setOrdersData(res.data.data);
    } catch (error) {
        console.log(error);
    }
};

  const [ordersData, setOrdersData] = useState([]);

  // Dynamic filter and search logic
  const filteredOrders = ordersData.filter((order) => {
    const matchesFilter =
    activeFilter === "semua" ||
    (activeFilter === "riwayat" &&
        (order.status === "selesai" ||
         order.status === "ditolak")) ||
    (activeFilter === "proses" &&
        order.status !== "selesai" &&
        order.status !== "ditolak");
  });

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
      <aside
        className={`h-screen w-64 fixed left-0 top-0 bg-surface-container flex flex-col py-6 px-4 z-50 border-r border-surface-variant/20 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
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
            const isLink = item.path.startsWith("/");
            return isLink ? (
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
            ) : (
              <button
                key={item.id}
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
              </button>
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
            <div className="flex items-center gap-4">
              <h2 className="font-headline-md text-headline-md font-bold text-secondary hidden sm:block">
                Pesanan Saya
              </h2>
              <div
                className={`relative w-full max-w-xs transition-transform duration-200 ${searchFocused ? "scale-[1.02]" : ""}`}
              >
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                  search
                </span>
                <input
                  className="w-full bg-surface-container border-none rounded-full py-2.5 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-secondary/50 transition-all text-sm"
                  placeholder="Cari ID atau layanan..."
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
          {/* Filters / Tabs */}
          <div className="flex items-center gap-6 border-b border-surface-container-highest overflow-x-auto custom-scrollbar scrollbar-none">
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`pb-3 border-b-2 font-semibold text-sm transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "border-secondary text-secondary"
                      : "border-transparent text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Orders Grid/List */}
          <div className="space-y-6">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => {
                const isProses = order.statusType === "proses";
                const isSelesai = order.statusType === "selesai";

                return (
                  <div
                    key={order.id}
                    className={`bg-surface-container p-6 rounded-2xl transition-all hover:bg-surface-container-high border border-surface-variant/10 shadow-md ${
                      isSelesai
                        ? "bg-surface-container/50 opacity-90 hover:opacity-100"
                        : ""
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-surface-container-highest flex items-center justify-center text-secondary shrink-0">
                          <span className="material-symbols-outlined text-[32px]">
                            {order.icon}
                          </span>
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            {order.badge && (
                              <span className="text-[10px] font-bold bg-secondary/15 text-secondary px-2 py-0.5 rounded uppercase tracking-wider">
                                {order.badge}
                              </span>
                            )}
                            <span className="text-on-surface-variant text-xs font-semibold">
                              {order.id}
                            </span>
                          </div>
                          <h3 className="font-bold text-lg text-on-surface">
                            {order.deskripsi_masalah}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-on-surface-variant">
                            <span className="flex items-center gap-1.5 font-medium">
                              <span className="material-symbols-outlined text-sm text-primary">
                                person
                              </span>
                              <span className="text-on-surface">
                                {order.tukang?.nama}
                              </span>
                            </span>
                            <span className="text-outline-variant hidden md:inline">
                              •
                            </span>
                            <span className="flex items-center gap-1.5 font-medium">
                              <span className="material-symbols-outlined text-sm text-secondary">
                                schedule
                              </span>
                              <span className="text-on-surface">
                                {new Date(order.created_at).toLocaleDateString("id-ID")}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col md:items-end gap-3 shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-on-surface-variant font-medium">
                            Status:
                          </span>
                          <span
                            className={`font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 ${
                              order.status === "Dalam Perjalanan"
                                ? "bg-primary-container/20 text-primary"
                                : order.status === "Pengerjaan"
                                  ? "bg-on-tertiary-fixed-variant/50 text-tertiary"
                                  : "bg-green-500/10 text-green-400"
                            }`}
                          >
                            {order.status === "Dalam Perjalanan" && (
                              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            )}
                            {order.status}
                          </span>
                        </div>
                        <div className="md:text-right">
                          <p className="text-xs text-on-surface-variant font-medium">
                            Total Biaya
                          </p>
                          <p
                            className={`font-bold text-xl ${isSelesai ? "text-on-surface" : "text-secondary"}`}
                          >
                            {`Rp ${order.harga_penawaran ?? 0}`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-6 pt-6 border-t border-surface-container-highest flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      {order.rating ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex text-secondary">
                            {Array.from({ length: order.rating }).map(
                              (_, i) => (
                                <span
                                  key={i}
                                  className="material-symbols-outlined text-base"
                                  style={{ fontVariationSettings: "'FILL' 1" }}
                                >
                                  star
                                </span>
                              ),
                            )}
                          </div>
                          {order.comment && (
                            <span className="text-xs text-on-surface-variant italic font-medium">
                              "{order.comment}"
                            </span>
                          )}
                        </div>
                      ) : (
                        <div>
                          {order.image && (
                            <div className="w-10 h-10 rounded-lg border border-surface-container overflow-hidden">
                              <img
                                className="w-full h-full object-cover"
                                alt="Plumbing preview"
                                src={order.image}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-3 w-full sm:w-auto justify-end">
                        {isSelesai ? (
                          <>
                            <button className="px-4 py-2 text-xs rounded-xl border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all font-bold cursor-pointer">
                              Invoice
                            </button>
                            <button className="px-4 py-2 text-xs rounded-xl bg-surface-container-highest text-on-surface font-bold hover:brightness-110 transition-all cursor-pointer">
                              Pesan Lagi
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="px-4 py-2 text-xs rounded-xl border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all flex items-center gap-1.5 font-bold cursor-pointer">
                              <span className="material-symbols-outlined text-sm">
                                chat
                              </span>
                              <span>Chat Tukang</span>
                            </button>
                            <button className="px-4 py-2 text-xs rounded-xl bg-primary text-on-primary-container font-bold hover:brightness-110 transition-all cursor-pointer">
                              Lihat Detail
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-surface-container/30 border border-dashed border-surface-variant/30 rounded-2xl py-16 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl opacity-40">
                  receipt_long
                </span>
                <p className="mt-3 font-semibold">
                  Tidak ada pesanan yang sesuai dengan filter atau pencarian
                  Anda.
                </p>
              </div>
            )}
          </div>

          {/* Load More Button */}
          {filteredOrders.length > 0 && (
            <div className="mt-12 flex justify-center">
              <button className="flex items-center gap-2 text-on-surface-variant hover:text-secondary transition-all font-bold text-sm cursor-pointer">
                <span>Tampilkan lebih banyak</span>
                <span className="material-symbols-outlined">expand_more</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* FAB Mobile Only */}
      <div className="fixed bottom-8 right-8 z-[100] md:hidden">
        <Link to="/posting-pekerjaan">
          <button className="w-14 h-14 bg-secondary text-on-secondary rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer">
            <span className="material-symbols-outlined text-[32px]">add</span>
          </button>
        </Link>
      </div>

      {/* Atmospheric Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[0%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-[120px]"></div>
      </div>

      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={() => navigate("/")} 
        role="pelanggan" 
      />
    </div>
  );
}

export default Pesanan;
