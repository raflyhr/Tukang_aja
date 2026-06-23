import { useState } from "react";
import { Link } from "react-router-dom";

function Chat() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("semua");
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/pelanggan/dashboard" },
    { id: "pesanan", label: "Pesanan Saya", icon: "receipt_long", path: "/pelanggan/pesanan" },
    { id: "chat", label: "Chat", icon: "chat", path: "/pelanggan/chat", active: true },
    { id: "pembayaran", label: "Pembayaran", icon: "payments", path: "/pelanggan/pembayaran" },
    { id: "profil", label: "Profil", icon: "person", path: "/pelanggan/profil" },
  ];

  const filterTabs = [
    { id: "semua", label: "Semua" },
    { id: "aktif", label: "Aktif" },
    { id: "menunggu", label: "Menunggu" },
    { id: "selesai", label: "Selesai" },
  ];

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const newMsg = {
      id: Date.now(),
      text: inputText,
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages([...messages, newMsg]);
    setInputText("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen selection:bg-secondary/30 selection:text-secondary font-sans relative overflow-x-hidden flex h-screen">
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
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
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
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
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
            <Link to="/" className="text-on-surface-variant hover:text-red-400 transition-colors p-1 flex items-center justify-center cursor-pointer" title="Log Out">
              <span className="material-symbols-outlined">logout</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <main className="flex-grow lg:ml-64 min-h-screen relative flex flex-col h-full overflow-hidden">
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
              <h2 className="font-headline-md text-headline-md font-bold text-secondary">Chat</h2>
              <div className={`hidden md:flex bg-surface-container-high rounded-full px-4 py-1.5 items-center gap-3 ml-4 transition-all duration-200 ${searchFocused ? "ring-2 ring-secondary/50" : ""}`}>
                <span className="material-symbols-outlined text-on-surface-variant/50 text-sm">search</span>
                <input
                  className="bg-transparent border-none focus:ring-0 text-sm w-48 text-on-surface placeholder:text-on-surface-variant/40"
                  placeholder="Cari percakapan..."
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

        {/* Chat Layout Container */}
        <div className="pt-20 flex flex-1 overflow-hidden h-full page-transition">
          {/* Conversation List (Left Pane) */}
          <section className="w-full md:w-80 lg:w-96 flex flex-col border-r border-surface-variant/10 bg-surface-dim h-full shrink-0">
            <div className="p-4 border-b border-surface-variant/10">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {filterTabs.map((tab) => {
                  const isActive = activeFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveFilter(tab.id)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                        isActive
                          ? "bg-secondary/15 text-secondary border-secondary/20"
                          : "bg-surface-container text-on-surface-variant border-surface-variant/10 hover:bg-surface-container-high"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Contact list containing exactly one person */}
            <div className="flex-1 overflow-y-auto chat-scrollbar">
              <div className="px-4 py-3.5 bg-surface-container-highest border-l-4 border-secondary cursor-pointer transition-colors">
                <div className="flex gap-3">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-container-high border border-outline-variant/10">
                      <img
                        className="w-full h-full object-cover"
                        alt="Budi Santoso"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAL0cRCPI5uo9Ps-ux4AGfokR1MuCIPmBsBQi1vRM0RN8J_qTGz_R7cFHCT9enkqiZuB-UXT7st3S2IR6fkFrajESZ-a10ueGyJ9jZ2258rXOBvr0KbaFV0DqCnaLy2R3GdUjb7SWZSCZy7ZfJXi9yWVuHgrgj4yG6wNUuQkGsmklmfh143xRENb_JoPsOXW6B-O3w3RJBPnt9RHG-YVu2jgTxAaWzQgXBMxblPRM0BcCgu3eqVIHfDCLnriHK3cW0GazAPLAr0aGDH"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-surface-container-highest rounded-full"></div>
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-bold text-on-surface text-sm truncate">Budi Santoso</h4>
                      <span className="text-[10px] text-secondary font-bold uppercase">Online</span>
                    </div>
                    <p className="text-xs text-on-surface-variant font-medium truncate">
                      {messages.length > 0 ? messages[messages.length - 1].text : "Belum ada pesan"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Message Window (Right Pane) */}
          <section className="hidden md:flex flex-1 flex-col bg-surface h-full">
            {/* Active Chat Header */}
            <div className="px-6 py-4 border-b border-surface-variant/10 flex justify-between items-center bg-surface-dim shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-outline-variant/10">
                  <img
                    className="w-full h-full object-cover"
                    alt="Budi Santoso"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAL0cRCPI5uo9Ps-ux4AGfokR1MuCIPmBsBQi1vRM0RN8J_qTGz_R7cFHCT9enkqiZuB-UXT7st3S2IR6fkFrajESZ-a10ueGyJ9jZ2258rXOBvr0KbaFV0DqCnaLy2R3GdUjb7SWZSCZy7ZfJXi9yWVuHgrgj4yG6wNUuQkGsmklmfh143xRENb_JoPsOXW6B-O3w3RJBPnt9RHG-YVu2jgTxAaWzQgXBMxblPRM0BcCgu3eqVIHfDCLnriHK3cW0GazAPLAr0aGDH"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-on-surface leading-tight text-sm">Budi Santoso</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-xs text-on-surface-variant font-medium">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-surface-container rounded-xl transition-colors cursor-pointer text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined text-sm">call</span>
                </button>
                <button className="p-2 hover:bg-surface-container rounded-xl transition-colors cursor-pointer text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined text-sm">video_call</span>
                </button>
                <button className="p-2 hover:bg-surface-container rounded-xl transition-colors cursor-pointer text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined text-sm">more_vert</span>
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 chat-scrollbar flex flex-col">
              {messages.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-5xl opacity-30 mb-3 text-secondary">chat_bubble_outline</span>
                  <p className="text-sm font-semibold">Belum ada obrolan</p>
                  <p className="text-xs opacity-60 mt-1 max-w-[280px]">Kirimkan pesan pertama untuk memulai obrolan dengan Budi Santoso.</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="flex flex-row-reverse gap-3 max-w-[85%] ml-auto animate-message-in"
                  >
                    <div className="space-y-1 items-end flex flex-col">
                      <div className="bg-secondary-container text-on-secondary-container px-4 py-2.5 rounded-2xl rounded-tr-none shadow-md">
                        <p className="text-sm">{msg.text}</p>
                      </div>
                      <div className="flex items-center gap-1 mr-1">
                        <span className="text-[10px] text-on-surface-variant">{msg.time}</span>
                        <span className="material-symbols-outlined text-sm text-secondary">done_all</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input area */}
            <div className="p-4 bg-surface-dim border-t border-surface-variant/10 shrink-0">
              <div className="flex items-end gap-2 bg-surface-container-high rounded-2xl p-1.5">
                <button className="p-2.5 text-on-surface-variant hover:text-secondary transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-lg">add_circle</span>
                </button>
                <textarea
                  className="flex-grow bg-transparent border-none focus:ring-0 text-on-surface text-sm resize-none py-2 chat-scrollbar outline-none max-h-24"
                  placeholder="Ketik pesan..."
                  rows="1"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyPress}
                />
                <button className="p-2.5 text-on-surface-variant hover:text-secondary transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-lg">sentiment_satisfied</span>
                </button>
                <button
                  onClick={handleSendMessage}
                  className="w-10 h-10 flex items-center justify-center bg-secondary text-on-secondary rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Atmospheric Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[0%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
}

export default Chat;
