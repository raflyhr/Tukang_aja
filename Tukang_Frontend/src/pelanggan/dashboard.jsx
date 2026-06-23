import { useState } from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [bannerSearchQuery, setBannerSearchQuery] = useState("");

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/pelanggan/dashboard", active: true },
    { id: "pesanan", label: "Pesanan Saya", icon: "receipt_long", path: "/pelanggan/pesanan" },
    { id: "chat", label: "Chat", icon: "chat", path: "/pelanggan/chat" },
    { id: "pembayaran", label: "Pembayaran", icon: "payments", path: "/pelanggan/pembayaran" },
    { id: "profil", label: "Profil", icon: "person", path: "/pelanggan/profil" },
  ];

  const categories = [
    { label: "Listrik", icon: "bolt", desc: "Instalasi & perbaikan" },
    { label: "Pipa & Air", icon: "plumbing", desc: "Pipa bocor & wastafel" },
    { label: "Atap Rumah", icon: "roofing", desc: "Genteng bocor & waterproofing" },
    { label: "Cat Dinding", icon: "format_paint", desc: "Interior & eksterior" },
    { label: "Service AC", icon: "ac_unit", desc: "Cuci AC & isi freon" },
    { label: "Pertukangan Kayu", icon: "carpenter", desc: "Pintu, kusen & furnitur" },
    { label: "Bersih-Bersih", icon: "cleaning_services", desc: "Sapu, pel & disinfektan" },
    { label: "Taman", icon: "yard", desc: "Pangkas rumput & tanaman" },
  ];

  const recommendedTukang = [
    {
      name: "Bambang Susilo",
      specialty: "Ahli Pipa & Deteksi Kebocoran",
      distance: "1.2 km",
      rating: 4.9,
      completedJobs: 154,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDs8Lu1JkjdYYbB0gEPDz5AnBVfMJ3NSVj6AaIrRwz11aUkV8ZBMBntVWf7pu9UI9D2d2AV34cbAWarBRu7rkglulzLscU8ytWB_P23UDj2DxligPU1OzKwGGdyBv232-R9WFCHLleZ09J9-F_X2kOAswEol__7wRLilrK5dUYX-1ePXpWmLdaFVTJvesnu-5TksZM3IpA1BvN-EMB7F6YzyPEsTaVDJ7WbyhBHGUp7n8ASgFlNwP4NEzEYN3gvtniLpOjy5cmWOl70",
      status: "Tersedia",
    },
    {
      name: "Maya Putri",
      specialty: "Spesialis Listrik & Smart Home",
      distance: "2.5 km",
      rating: 5.0,
      completedJobs: 89,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBQ70JmVD3JFhA5GBYSENBj4iOvz8fHvPcEgS4_HNs0H7SbJxYn9onPa141a39fCHWqGRQXaOY3-FRbi34aXFdIgbIZBG4tAdRdj0uIpmKEgJiTDWcp9tYs3Crc70XzdTnbWc1LsUUAXzDeLveVLyG8BZceDsHhAowB_0n8YEtHOyTfqjIUXWdfwqIPa1V6s8dpBHOqu6M9o0mWg17ZBYfinwfS-s_Yxbikr7GOHOABARqmpqNa-spZPM2sMFUMOHGGcLIuc4xuCU9z",
      status: "Tersedia",
    },
    {
      name: "Joko Susilo",
      specialty: "Teknisi AC & Pendingin Ruangan",
      distance: "0.8 km",
      rating: 4.8,
      completedJobs: 210,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAL0cRCPI5uo9Ps-ux4AGfokR1MuCIPmBsBQi1vRM0RN8J_qTGz_R7cFHCT9enkqiZuB-UXT7st3S2IR6fkFrajESZ-a10ueGyJ9jZ2258rXOBvr0KbaFV0DqCnaLy2R3GdUjb7SWZSCZy7ZfJXi9yWVuHgrgj4yG6wNUuQkGsmklmfh143xRENb_JoPsOXW6B-O3w3RJBPnt9RHG-YVu2jgTxAaWzQgXBMxblPRM0BcCgu3eqVIHfDCLnriHK3cW0GazAPLAr0aGDH",
      status: "Sibuk",
    },
  ];

  const recentOrders = [
    {
      id: "ORD-2023-9812",
      service: "Perbaikan Pipa Bocor",
      tukang: "Budi Santoso",
      date: "23 Juni 2026",
      cost: "Rp 250.000",
      status: "Dalam Proses",
      statusColor: "text-secondary bg-secondary/10 border-secondary/20",
    },
    {
      id: "ORD-2023-9790",
      service: "Pengecatan Ruang Tamu",
      tukang: "Hadi Pratama",
      date: "12 November 2023",
      cost: "Rp 850.000",
      status: "Selesai",
      statusColor: "text-green-400 bg-green-500/10 border-green-500/20",
    },
    {
      id: "ORD-2023-9730",
      service: "Perbaikan Atap Bocor",
      tukang: "Joko Susilo",
      date: "1 November 2023",
      cost: "Rp 600.000",
      status: "Dibatalkan",
      statusColor: "text-red-400 bg-red-500/10 border-red-500/20",
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
            <div
              className={`relative w-full max-w-md transition-transform duration-200 hidden md:block ${searchFocused ? "scale-[1.02]" : ""}`}
            >
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                search
              </span>
              <input
                className="w-full bg-surface-container-high border-none rounded-full py-2.5 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-secondary/50 transition-all text-sm"
                placeholder="Cari spesialis atau layanan..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
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
          {/* Welcome Banner */}
          <section className="relative overflow-hidden rounded-3xl bg-surface-container p-8 md:p-12 border border-surface-variant/20 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="relative z-10 max-w-xl space-y-4">
              <div>
                <h2 className="font-headline-xl text-headline-xl text-on-background mb-2 text-4xl font-bold mt-3">
                  Halo, <span className="text-secondary">Reze!</span>
                </h2>
                <p className="font-body-lg text-sm text-on-surface-variant/80 font-normal leading-relaxed">
                  Butuh perbaikan rumah? Temukan tukang profesional, terpercaya, dan bersertifikasi di sekitar Anda.
                </p>
              </div>

              {/* Integrated Search Bar */}
              <div className="flex items-center bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-1.5 w-full max-w-md shadow-lg group focus-within:border-secondary/50 focus-within:ring-1 focus-within:ring-secondary/50 transition-all duration-200">
                <span className="material-symbols-outlined text-on-surface-variant/50 pl-2">search</span>
                <input
                  type="text"
                  placeholder="Butuh jasa apa hari ini?"
                  className="bg-transparent border-none focus:ring-0 text-sm flex-grow px-3 text-on-surface outline-none placeholder:text-on-surface-variant/40"
                  value={bannerSearchQuery}
                  onChange={(e) => setBannerSearchQuery(e.target.value)}
                />
                <button className="bg-secondary text-on-secondary px-4 py-2 rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer">
                  Cari Jasa
                </button>
              </div>
            </div>

            {/* Banner Vector / Belt Tool Image */}
            <div className="absolute right-12 bottom-0 hidden lg:block w-72 h-72 pointer-events-none">
              <img
                className="w-full h-full object-contain filter drop-shadow-[0_20px_50px_rgba(249,115,22,0.35)]"
                alt="Tools Belt Render"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIrTiL3nKB6rs8CjUTMxr2C0LyTTXcNZN-iUWiGCz-yI9b5oln7dnDCUoDXrTM7dLIbVN1yktRr1Y_UtI1qKGvZAxTw3B4JfLd6JBhWe4Crv-y03wrNj8-3OR5nsFturaPxlvgWQH11tPlEzZRBJh1DRCxFJ8P_Yv2Cgrty3x9zpqxEREuobN510UkBQc4R3EaPcqnBA08r7exVif_oWOfV0ZBTlWwZOYRr6SAyKTO8I0bPVqQmmy4_dOAr9Ap7_hXQICgfiuDYLOP"
              />
            </div>
            
            {/* Ambient Background Glow */}
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 blur-[100px] rounded-full pointer-events-none"></div>
          </section>

          {/* Statistics Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Active Orders Card */}
            <div className="bg-surface-container-high/60 backdrop-blur-md p-6 rounded-2xl flex flex-col gap-4 border border-surface-variant/20 shadow-lg group hover:border-secondary/20 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-xl bg-secondary/15 text-secondary border border-secondary/10">
                  <span className="material-symbols-outlined">pending_actions</span>
                </div>
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest bg-secondary/10 px-2 py-0.5 rounded-full border border-secondary/15">
                  Dalam Proses
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-on-surface-variant/70 uppercase tracking-wider">
                  Pesanan Aktif
                </p>
                <h3 className="text-3xl font-extrabold mt-1 text-on-surface group-hover:text-secondary transition-colors">02</h3>
              </div>
            </div>

            {/* Completed Jobs Card */}
            <div className="bg-surface-container-high/60 backdrop-blur-md p-6 rounded-2xl flex flex-col gap-4 border border-surface-variant/20 shadow-lg group hover:border-primary/20 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-xl bg-primary/15 text-primary border border-primary/10">
                  <span className="material-symbols-outlined">task_alt</span>
                </div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full border border-primary/15">
                  Selesai
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-on-surface-variant/70 uppercase tracking-wider">
                  Pekerjaan Selesai
                </p>
                <h3 className="text-3xl font-extrabold mt-1 text-on-surface group-hover:text-primary transition-colors">45</h3>
              </div>
            </div>

            {/* Total Expenditures Card (No internal balance/wallet credits) */}
            <div className="bg-surface-container-high/60 backdrop-blur-md p-6 rounded-2xl flex flex-col gap-4 border border-surface-variant/20 shadow-lg group hover:border-green-500/20 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-xl bg-green-500/15 text-green-400 border border-green-500/10">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/15">
                  Bulan Ini
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-on-surface-variant/70 uppercase tracking-wider">
                  Total Pengeluaran
                </p>
                <h3 className="text-3xl font-extrabold mt-1 text-on-surface group-hover:text-green-400 transition-colors">Rp 3.820.000</h3>
              </div>
            </div>
          </section>

          {/* Main Dashboard Bento Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column (Categories, Recommended Tukang, Recent Orders) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Popular Categories Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-lg font-bold text-on-surface">Kategori Layanan Populer</h3>
                    <p className="text-on-surface-variant text-xs mt-0.5">
                      Paling sering dipesan oleh pelanggan
                    </p>
                  </div>
                  <button className="text-secondary font-bold text-xs hover:underline cursor-pointer">
                    Lihat Semua
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {categories.map((cat) => (
                    <div key={cat.label} className="group cursor-pointer">
                      <div className="p-4 rounded-2xl bg-surface-container flex flex-col items-center justify-center text-center gap-3 group-hover:bg-secondary/5 transition-all duration-300 border border-surface-variant/15 group-hover:border-secondary/20 h-32">
                        <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-secondary group-hover:scale-110 transition-transform duration-200">
                          <span className="material-symbols-outlined text-2xl">
                            {cat.icon}
                          </span>
                        </div>
                        <div>
                          <span className="font-bold text-xs text-on-surface block">{cat.label}</span>
                          <span className="text-[9px] text-on-surface-variant opacity-60 block mt-0.5 truncate max-w-[120px]">{cat.desc}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Nearby Tukang Section */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-on-surface">Rekomendasi Tukang Terdekat</h3>
                  <p className="text-on-surface-variant text-xs mt-0.5">
                    Tukang dengan rating tinggi di sekitar wilayah Anda
                  </p>
                </div>

                <div className="space-y-3">
                  {recommendedTukang.map((tukang) => (
                    <div key={tukang.name} className="bg-surface-container-high/40 p-4 rounded-2xl flex items-center gap-4 group hover:bg-surface-container-high transition-all duration-300 border border-surface-variant/10">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container-lowest shrink-0 border border-outline-variant/20">
                        <img
                          className="w-full h-full object-cover"
                          alt={tukang.name}
                          src={tukang.image}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-on-surface text-sm truncate">
                                {tukang.name}
                              </h4>
                              <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${
                                tukang.status === "Tersedia"
                                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                                  : "bg-red-500/10 border-red-500/20 text-red-400"
                              }`}>
                                {tukang.status}
                              </span>
                            </div>
                            <p className="text-xs text-on-surface-variant truncate mt-0.5">
                              {tukang.specialty}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 bg-secondary/15 px-2 py-0.5 rounded-full shrink-0 border border-secondary/10">
                            <span className="material-symbols-outlined text-[10px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                              star
                            </span>
                            <span className="text-[10px] font-bold text-secondary">
                              {tukang.rating}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-on-surface-variant">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">location_on</span>
                            {tukang.distance} dari lokasi Anda
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">work_history</span>
                            {tukang.completedJobs} Pekerjaan Selesai
                          </span>
                        </div>
                      </div>
                      <Link
                        to="/pelanggan/chat"
                        className="p-2.5 rounded-xl border border-outline-variant hover:border-secondary hover:text-secondary text-on-surface-variant transition-all shrink-0 cursor-pointer flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-sm">chat</span>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-lg font-bold text-on-surface">Riwayat Pesanan Terakhir</h3>
                    <p className="text-on-surface-variant text-xs mt-0.5">
                      Ringkasan transaksi jasa terbaru Anda
                    </p>
                  </div>
                  <Link to="/pelanggan/pesanan" className="text-secondary font-bold text-xs hover:underline cursor-pointer">
                    Semua Pesanan
                  </Link>
                </div>

                <div className="bg-surface-container/60 border border-surface-variant/15 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-surface-variant/20 bg-surface-container-high/40 text-on-surface-variant/70 font-semibold">
                          <th className="p-4">ID Pesanan</th>
                          <th className="p-4">Nama Jasa</th>
                          <th className="p-4">Spesialis</th>
                          <th className="p-4">Tanggal</th>
                          <th className="p-4">Biaya</th>
                          <th className="p-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-variant/10 font-medium">
                        {recentOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-surface-container-high/20 transition-colors">
                            <td className="p-4 font-bold text-secondary">{order.id}</td>
                            <td className="p-4 text-on-surface">{order.service}</td>
                            <td className="p-4 text-on-surface-variant">{order.tukang}</td>
                            <td className="p-4 text-on-surface-variant">{order.date}</td>
                            <td className="p-4 text-on-surface font-bold">{order.cost}</td>
                            <td className="p-4 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${order.statusColor}`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column (Recent Activity & Mini Map) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Recent Activity Timeline Section */}
              <div className="bg-surface-container p-6 rounded-3xl flex-1 flex flex-col border border-surface-variant/20 shadow-lg">
                <h3 className="font-bold text-on-surface mb-6 text-base">Aktivitas Terkini</h3>
                <div className="space-y-6 flex-1 relative font-medium">
                  {/* Timeline Bar */}
                  <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-outline-variant/20"></div>

                  <div className="flex gap-4 relative group/item">
                    <div className="z-10 w-6 h-6 rounded-full bg-secondary flex items-center justify-center mt-1 shadow-[0_0_15px_rgba(255,183,131,0.4)] group-hover/item:scale-110 transition-transform duration-200">
                      <span className="material-symbols-outlined text-[13px] text-on-secondary font-bold">check</span>
                    </div>
                    <div className="pb-4">
                      <p className="font-bold text-xs text-on-surface">Pekerjaan Selesai</p>
                      <p className="text-[11px] text-on-surface-variant/80 mt-1 leading-relaxed">
                        Layanan Perbaikan AC oleh Joko Susilo telah selesai dikerjakan.
                      </p>
                      <p className="text-[9px] text-secondary font-bold mt-2">10 Menit Lalu</p>
                    </div>
                  </div>

                  <div className="flex gap-4 relative group/item">
                    <div className="z-10 w-6 h-6 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center mt-1 group-hover/item:scale-110 transition-transform duration-200">
                      <span className="material-symbols-outlined text-[13px] text-on-surface-variant">schedule</span>
                    </div>
                    <div className="pb-4">
                      <p className="font-bold text-xs text-on-surface">Pesanan Baru Diterima</p>
                      <p className="text-[11px] text-on-surface-variant/80 mt-1 leading-relaxed">
                        Bambang Susilo telah mengonfirmasi kunjungan pipa besok jam 10:00.
                      </p>
                      <p className="text-[9px] text-on-surface-variant/60 font-bold mt-2">2 Jam Lalu</p>
                    </div>
                  </div>

                  <div className="flex gap-4 relative group/item">
                    <div className="z-10 w-6 h-6 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center mt-1 group-hover/item:scale-110 transition-transform duration-200">
                      <span className="material-symbols-outlined text-[13px] text-on-surface-variant">payments</span>
                    </div>
                    <div>
                      <p className="font-bold text-xs text-on-surface">Pembayaran Berhasil</p>
                      <p className="text-[11px] text-on-surface-variant/80 mt-1 leading-relaxed">
                        Pembayaran sebesar Rp 250.000 untuk perbaikan pipa telah berhasil divalidasi.
                      </p>
                      <p className="text-[9px] text-on-surface-variant/60 font-bold mt-2">Kemarin, 15:30</p>
                    </div>
                  </div>
                </div>
                <Link to="/pelanggan/pesanan" className="mt-6 py-2.5 text-center border border-outline-variant/20 rounded-xl text-on-surface-variant font-bold text-xs hover:bg-surface-container-high hover:text-on-surface hover:border-surface-variant transition-colors cursor-pointer block">
                  Lihat Riwayat Lengkap
                </Link>
              </div>

              {/* Mini Map Card */}
              <div className="bg-surface-container p-6 rounded-3xl overflow-hidden relative group border border-surface-variant/20 shadow-lg">
                <div className="absolute inset-0 grayscale contrast-125 opacity-25 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none">
                  <img
                    className="w-full h-full object-cover"
                    alt="Jakarta styled map"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVDvCZwGUvFT6K_TwyHOonFNu_fOOE9QLKHril_HwV9XEQDyn8aTSbutAexQyFmero8HN9WzJVEQSVs4F1nSZAC9Rt-gvxvevLt8guhVP4MoU5kgeD3HTGea-nYjset3x85Bo-ds6Iwi__jyIzhlbmE-dPzYjR-GttUV8YI1WEsnPamX_TD5p5o5MeIeyn5f9_3Bdv01Au27lDuR5MQZRl2v1fu54pxPczEjFioHlIAD671A75ZW9rHt4WZ5Ka_qL9EOSc7fQiPs_n"
                  />
                </div>
                <div className="relative z-10">
                  <h4 className="font-bold text-on-surface mb-1 text-sm">Cek Tukang Sekitar</h4>
                  <p className="text-[10px] text-on-surface-variant font-medium opacity-80">
                    Ada 24 spesialis jasa yang aktif di wilayah Anda saat ini.
                  </p>
                  <button className="mt-16 bg-surface/90 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold border border-secondary/30 text-secondary flex items-center gap-2 hover:bg-secondary hover:text-on-secondary hover:border-secondary transition-all cursor-pointer shadow-lg">
                    <span className="material-symbols-outlined text-[14px]">my_location</span>
                    Buka Peta Jasa
                  </button>
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
    </div>
  );
}

export default Dashboard;