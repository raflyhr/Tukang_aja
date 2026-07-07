import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoutModal from "../../components/LogoutModal";
import axios from "axios";
import { supabase } from "../../lib/supabase";

function Chat() {
  const navigate = useNavigate();
  
  
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("pelanggan_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const userObj = parsed.user || parsed;
        setUser(userObj);
      } catch (error) {
        console.error("Gagal parse data user:", error);
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("semua");
  const textareaRef = useRef(null);
  
  const [chatList, setChatList] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChatTukang, setActiveChatTukang] = useState(null);
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [ulasan, setUlasan] = useState("");

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Ambil user_id yang di-set di login.jsx secara langsung agar lebih aman
    const userId = localStorage.getItem("user_id");
    if (userId) {
      setCurrentUser({ id: userId });
      fetchChats(userId);
    } else {
      // Coba fallback dengan parsing user string
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setCurrentUser(user);
          if (user && user.id) fetchChats(user.id);
        } catch (e) {
          console.error("Gagal parse data user", e);
        }
      }
    }
  }, []);

  const fetchChats = async (userId) => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/user/${userId}/chats`);
      setChatList(res.data.data);
      // Auto-select chat pertama jika belum ada yang terpilih
      if (res.data.data.length > 0 && !activeChatId) {
        selectChat(res.data.data[0]);
      }
    } catch (error) {
      console.error("Gagal mengambil chat", error);
    }
  };

  const selectChat = async (chat) => {
    setActiveChatId(chat.id);
    setActiveChatTukang(chat.tukang);
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/chat/${chat.id}/messages`);
      setMessages(res.data.data);
    } catch (error) {
      console.error("Gagal mengambil pesan", error);
    }
  };

  useEffect(() => {
    if (!activeChatId) return;

    // Subscribe ke Supabase Realtime
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${activeChatId}` },
        (payload) => {
          setMessages((prevMessages) => {
            // Hapus pesan sementara (optimistic) yang teksnya sama dengan pesan dari server ini
            const filtered = prevMessages.filter(m => !(m.is_optimistic && m.text === payload.new.text));
            // Cek apakah pesan ini sudah ada (mencegah duplicate)
            if (filtered.some(m => m.id === payload.new.id)) return filtered;
            return [...filtered, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChatId]);
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

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeChatId || !currentUser) return;
    
    const tempText = inputText;
    setInputText(""); // Kosongkan input seketika agar terasa cepat
    
    // 1. Optimistic Update: Langsung tampilkan pesan di layar
    const tempMsg = {
      id: `temp-${Date.now()}`,
      sender_type: "user",
      message_type: "text",
      text: tempText,
      created_at: new Date().toISOString(),
      is_optimistic: true
    };
    
    setMessages((prev) => [...prev, tempMsg]);
    
    // 2. Kirim ke server di background
    try {
      await axios.post("http://127.0.0.1:8000/api/chat/send", {
        chat_id: activeChatId,
        sender_type: "user",
        sender_id: currentUser.id,
        text: tempText
      });
      // Fallback: Langsung tarik pesan terbaru dari server 
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/chat/${activeChatId}/messages`);
        setMessages(res.data.data);
      } catch (e) {}
    } catch (err) {
      alert("Gagal mengirim pesan");
      // Jika gagal, hapus pesan sementara tadi
      setMessages((prev) => prev.filter(m => m.id !== tempMsg.id));
    }
  };

  const handleDeleteChat = async () => {
    if (!activeChatId) return;
    if (!window.confirm("Yakin ingin menghapus obrolan ini secara permanen?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/chat/${activeChatId}`);
      setActiveChatId(null);
      setActiveChatTukang(null);
      setMessages([]);
      if (currentUser && currentUser.id) {
        fetchChats(currentUser.id);
      }
    } catch (err) {
      alert("Gagal menghapus obrolan");
    }
  };

  const handleTextareaChange = (e) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

const kirimRating = async () => {
    try {
        const response = await axios.post(
            "http://127.0.0.1:8000/api/ulasan",
            {
                user_id: 1,
                pesanan_id: 1,
                rating: rating,
                komentar: ulasan,
                tukang_id: 1,
            }
        );

        alert(response.data.message);

        setShowRatingModal(false);
        setRating(5);
        setUlasan("");

        navigate("/pelanggan/dashboard");

    } catch (error) {
    console.log(error);
    console.log(error.response);
    console.log(error.response?.data);

    alert(JSON.stringify(error.response?.data));
}
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
                  alt="User Profile"
                  src={user && user.foto_profil ? (user.foto_profil.startsWith("http") ? user.foto_profil : `http://127.0.0.1:8000/storage/${user.foto_profil}`) : `https://ui-avatars.com/api/?name=${user ? user.name : 'Pelanggan'}&background=random`}
                />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-on-surface truncate">{user ? user.name : "Memuat..."}</h4>
                <p className="text-xs text-on-surface-variant/60 truncate">{user ? user.email : ""}</p>
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
                alt="User Profile"
                src={user && user.foto_profil ? (user.foto_profil.startsWith("http") ? user.foto_profil : `http://127.0.0.1:8000/storage/${user.foto_profil}`) : `https://ui-avatars.com/api/?name=${user ? user.name : 'Pelanggan'}&background=random`}
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
                      onClick={() => {
    setActiveFilter(tab.id);

    if (tab.id === "selesai") {
        setShowRatingModal(true);
    }
}}
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
            
            <div className="flex-1 overflow-y-auto chat-scrollbar px-3 py-2 space-y-1">
              {chatList.map((chat) => {
                const isActive = activeChatId === chat.id;
                return (
                <div 
                  key={chat.id}
                  onClick={() => selectChat(chat)}
                  className={`p-3.5 rounded-2xl flex gap-3 cursor-pointer transition-all duration-200 ${
                    isActive 
                      ? "bg-secondary/10 border-l-4 border-secondary" 
                      : "hover:bg-surface-container-high"
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant/10">
                      <img
                        className="w-full h-full object-cover"
                        alt={chat.tukang?.nama || "Tukang"}
                        src={chat.tukang?.foto_profil || "https://lh3.googleusercontent.com/aida-public/AB6AXuAL0cRCPI5uo9Ps-ux4AGfokR1MuCIPmBsBQi1vRM0RN8J_qTGz_R7cFHCT9enkqiZuB-UXT7st3S2IR6fkFrajESZ-a10ueGyJ9jZ2258rXOBvr0KbaFV0DqCnaLy2R3GdUjb7SWZSCZy7ZfJXi9yWVuHgrgj4yG6wNUuQkGsmklmfh143xRENb_JoPsOXW6B-O3w3RJBPnt9RHG-YVu2jgTxAaWzQgXBMxblPRM0BcCgu3eqVIHfDCLnriHK3cW0GazAPLAr0aGDH"}
                      />
                    </div>
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-xs text-on-surface truncate">{chat.tukang?.nama || "Tukang"}</h3>
                      {chat.messages && chat.messages.length > 0 && (
                        <span className="text-[9px] text-on-surface-variant/70 font-semibold">
                          {new Date(chat.messages[0].created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant/80 truncate mt-0.5">
                      {chat.messages && chat.messages.length > 0 ? chat.messages[0].text : "Belum ada pesan"}
                    </p>
                  </div>
                </div>
                );
              })}
            </div>
          </section>

          {/* Message Window (Right Pane) */}
          <section className="flex-grow flex flex-col h-full bg-surface-container-lowest relative min-w-0">
            {/* Active Chat Header */}
            {activeChatTukang ? (
            <div className="p-4 flex items-center justify-between bg-surface-container/60 border-b border-surface-variant/15 z-10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-outline-variant/20 shrink-0">
                  <img
                    className="w-full h-full object-cover"
                    alt={activeChatTukang.nama}
                    src={activeChatTukang.foto_profil || "https://lh3.googleusercontent.com/aida-public/AB6AXuAL0cRCPI5uo9Ps-ux4AGfokR1MuCIPmBsBQi1vRM0RN8J_qTGz_R7cFHCT9enkqiZuB-UXT7st3S2IR6fkFrajESZ-a10ueGyJ9jZ2258rXOBvr0KbaFV0DqCnaLy2R3GdUjb7SWZSCZy7ZfJXi9yWVuHgrgj4yG6wNUuQkGsmklmfh143xRENb_JoPsOXW6B-O3w3RJBPnt9RHG-YVu2jgTxAaWzQgXBMxblPRM0BcCgu3eqVIHfDCLnriHK3cW0GazAPLAr0aGDH"}
                  />
                </div>
                <div>
                  <h2 className="font-bold text-xs text-on-surface leading-tight">{activeChatTukang.nama}</h2>
                  <span className="text-[10px] text-green-500 flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={handleDeleteChat}
                  className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-full text-on-surface-variant transition-colors cursor-pointer"
                  title="Hapus Obrolan"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
            ) : (
            <div className="p-4 flex items-center justify-between bg-surface-container/60 border-b border-surface-variant/15 z-10 backdrop-blur-md">
              <h3 className="font-bold text-on-surface leading-tight text-sm">Pilih percakapan</h3>
            </div>
            )}

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 chat-scrollbar flex flex-col">
              {messages.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-5xl opacity-30 mb-3 text-secondary">chat_bubble_outline</span>
                  <p className="text-sm font-semibold">Belum ada obrolan</p>
                  <p className="text-xs opacity-60 mt-1 max-w-[280px]">Kirimkan pesan pertama untuk memulai obrolan.</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-center mb-6">
                    <span className="text-[9px] bg-surface-container px-3.5 py-1 rounded-full text-on-surface-variant/80 uppercase tracking-widest font-extrabold">Hari Ini</span>
                  </div>
                  {messages.map((msg) => {
                    const isMine = msg.sender_type === "user";
                    return (
                      <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isMine ? "ml-auto justify-end" : ""} ${msg.is_optimistic ? 'opacity-70' : ''}`}>
                        {!isMine && (
                          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 self-end mb-1 border border-outline-variant/20">
                            <img className="w-full h-full object-cover" alt={activeChatTukang?.nama} src={activeChatTukang?.foto_profil || "https://lh3.googleusercontent.com/aida-public/AB6AXuAL0cRCPI5uo9Ps-ux4AGfokR1MuCIPmBsBQi1vRM0RN8J_qTGz_R7cFHCT9enkqiZuB-UXT7st3S2IR6fkFrajESZ-a10ueGyJ9jZ2258rXOBvr0KbaFV0DqCnaLy2R3GdUjb7SWZSCZy7ZfJXi9yWVuHgrgj4yG6wNUuQkGsmklmfh143xRENb_JoPsOXW6B-O3w3RJBPnt9RHG-YVu2jgTxAaWzQgXBMxblPRM0BcCgu3eqVIHfDCLnriHK3cW0GazAPLAr0aGDH"} />
                          </div>
                        )}
                        <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isMine 
                            ? "bg-secondary/15 text-on-surface border border-secondary/20 rounded-br-none" 
                            : "bg-surface-container text-on-surface rounded-bl-none"
                        }`}>
                          <p>{msg.text}</p>
                          <span className="flex items-center justify-end gap-1 mt-1.5">
                            <span className="text-[9px] text-on-surface-variant/60 block text-right">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {msg.is_optimistic && (
                              <span className="material-symbols-outlined text-[10px] text-on-surface-variant/60 animate-spin">sync</span>
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* Input area */}
            <div className="p-4 bg-surface/40 border-t border-surface-variant/15 backdrop-blur-md shrink-0">
              <div className="flex items-end gap-2.5 max-w-4xl mx-auto">
                <div className="flex gap-0.5 shrink-0">
                  <button className="p-2.5 hover:bg-surface-container-high rounded-xl text-on-surface-variant/80 transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                  </button>
                  <button className="p-2.5 hover:bg-surface-container-high rounded-xl text-on-surface-variant/80 transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-sm">image</span>
                  </button>
                </div>
                <div className="flex-grow">
                  <textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={handleTextareaChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    rows={1}
                    placeholder="Ketik pesan..."
                    className="w-full bg-surface-container border border-outline-variant/10 rounded-2xl py-3 px-4 text-xs text-on-surface focus:ring-1 focus:ring-secondary/50 outline-none resize-none chat-scrollbar"
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  className="bg-secondary text-on-secondary p-3 rounded-2xl flex items-center justify-center shadow-lg shadow-secondary/10 hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
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

              {showRatingModal && (
<div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
    <div className="bg-surface-container p-6 rounded-xl w-[420px]">

        <h2 className="text-xl font-bold mb-4">
            Beri Penilaian
        </h2>

        <select
            className="w-full border p-2 rounded mb-4"
            value={rating}
            onChange={(e)=>setRating(e.target.value)}
        >
            <option value="5">⭐⭐⭐⭐⭐</option>
            <option value="4">⭐⭐⭐⭐</option>
            <option value="3">⭐⭐⭐</option>
            <option value="2">⭐⭐</option>
            <option value="1">⭐</option>
        </select>

        <textarea
            className="w-full border rounded p-2"
            rows="4"
            placeholder="Tulis ulasan..."
            value={ulasan}
            onChange={(e)=>setUlasan(e.target.value)}
        />

        <div className="flex justify-end gap-3 mt-4">

            <button
                onClick={()=>setShowRatingModal(false)}
                className="px-4 py-2 rounded bg-gray-500"
            >
                Batal
            </button>

            <button
                onClick={kirimRating}
                className="px-4 py-2 rounded bg-orange-500"
            >
                Kirim
            </button>

        </div>

    </div>
</div>
)}

      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={() => navigate("/")} 
        role="pelanggan" 
      />
    </div>
  );
}

export default Chat;