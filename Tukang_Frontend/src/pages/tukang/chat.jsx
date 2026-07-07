import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoutModal from "../../components/LogoutModal";
import api from "../../lib/axios";
import { supabase } from "../../lib/supabase";

function TukangChat() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNegoPanelOpen, setIsNegoPanelOpen] = useState(false); // Default to false to keep chat spacious
  const [activeChatId, setActiveChatId] = useState(null);
  const [inputText, setInputText] = useState("");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const textareaRef = useRef(null);

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/tukang/dashboard" },
    { id: "layanan", label: "Layanan Jasa", icon: "home_repair_service", path: "/tukang/layanan" },
    { id: "pesanan", label: "Pesanan Saya", icon: "assignment", path: "/tukang/pesanan" },
    { id: "chat", label: "Chat", icon: "chat", path: "/tukang/chat", active: true },
    { id: "profil", label: "Profil", icon: "person", path: "/tukang/profil" },
  ];

  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [tukangId, setTukangId] = useState(null);
  const [technicianName, setTechnicianName] = useState("Tukang");
  const [avatar, setAvatar] = useState("https://64.media.tumblr.com/c9a40e15310bd677150504d378595de4/708a33221029625f-0b/s1280x1920/3304739f2245fc3c15e6e70ffff7ee91b2d2ac69.jpg");

  useEffect(() => {
    // Ambil tukang_id dari localStorage
    const userDataStr = localStorage.getItem("tukang_user");
    let id = null;
    if (userDataStr) {
      try {
        const parsed = JSON.parse(userDataStr);
        if (parsed && parsed.tukang && parsed.tukang.id) {
          id = parsed.tukang.id;
          if (parsed.tukang.nama) setTechnicianName(parsed.tukang.nama);
          if (parsed.tukang.foto_profil) setAvatar(parsed.tukang.foto_profil.startsWith('http') ? parsed.tukang.foto_profil : `${import.meta.env.VITE_API_BASE_URL}/storage/${parsed.tukang.foto_profil}`);
        }
      } catch (e) {}
    }
    if (!id) {
      navigate("/");
      return;
    }
    setTukangId(id);
  }, []);

  const fetchChats = async () => {
    if (!tukangId) return;
    try {
      const res = await api.get(`/tukang/${tukangId}/chats`);
      if (res.data.status === 'Sukses') {
        const mapped = res.data.data.map(c => ({
          id: c.id,
          name: c.user?.name || "Pelanggan",
          avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDgDnbyp9rLOAb2jO9oe7bGmKYJuagcArNETRx627Q4zAm3lGT5ALP5IwniAJz3ZIJ8wx59z7gLbaEk1P6TrsKEWNIN2M9Ld-IKiHVVPhGYrwJMC0TepBIOIw_Ic5YREwRxHMT-rW5Vhmb8k9Dn9zSkPSjiXr-54QLPIlqJ5_liD9xmSiZg4gB_TTjoD8JVyMJnRtyWMOdd9nFj6HqxxES9P06QWNZtumNkEggXQiZJPzpEQNQOvuVGUUDPzztYZORsOb2rq0PfltCx", // fallback
          online: true,
          time: c.messages && c.messages.length > 0 ? new Date(c.messages[0].created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "",
          lastMsg: c.messages && c.messages.length > 0 ? c.messages[0].text : "Belum ada pesan",
          negotiation: null, // Kita nonaktifkan dulu detail negosiasi kompleks untuk MVP
        }));
        setChats(mapped);
        
        // Auto set active chat jika belum ada
        if (mapped.length > 0 && !activeChatId) {
          setActiveChatId(mapped[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async () => {
    if (!activeChatId) return;
    try {
      const res = await api.get(`/chat/${activeChatId}/messages`);
      if (res.data.status === 'Sukses') {
        const mappedMsg = res.data.data.map(m => ({
          id: m.id,
          sender: m.sender_type,
          type: m.message_type,
          text: m.text,
          time: new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        }));
        setMessages(mappedMsg);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [tukangId]);

  useEffect(() => {
    fetchMessages();
    
    if (!activeChatId) return;

    // Subscribe ke Supabase Realtime
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${activeChatId}` },
        (payload) => {
          const m = payload.new;
          const incomingMsg = {
            id: m.id,
            sender: m.sender_type,
            type: m.message_type,
            text: m.text,
            time: new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
          };
          
          setMessages((prev) => {
            // Hapus pesan optimistic jika teksnya sama
            const filtered = prev.filter(msg => !(msg.is_optimistic && msg.text === m.text));
            // Cek apakah pesan sudah ada
            if (filtered.some(msg => msg.id === m.id)) return filtered;
            return [...filtered, incomingMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChatId]);

  const activeChat = chats.find(c => c.id === activeChatId) || { name: "Loading...", avatar: "", messages: [] };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeChatId) return;
    
    const tempText = inputText;
    setInputText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    
    // 1. Optimistic Update
    const tempMsg = {
      id: `temp-${Date.now()}`,
      sender: "tukang",
      type: "text",
      text: tempText,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      is_optimistic: true
    };
    setMessages((prev) => [...prev, tempMsg]);
    
    // 2. Background send
    try {
      await api.post(`/chat/send`, {
        chat_id: activeChatId,
        sender_type: 'tukang',
        sender_id: tukangId,
        text: tempText
      });
      // Fallback: Langsung fetch pesan terbaru jika Realtime gagal
      fetchMessages();
      fetchChats();
    } catch (err) {
      alert("Gagal mengirim pesan");
      setMessages((prev) => prev.filter(m => m.id !== tempMsg.id));
    }
  };

  const handleDeleteChat = async () => {
    if (!activeChatId) return;
    if (!window.confirm("Yakin ingin menghapus obrolan ini secara permanen?")) return;
    try {
      await api.delete(`/chat/${activeChatId}`);
      setActiveChatId(null);
      setMessages([]);
      fetchChats();
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

  return (
    <div className="bg-background text-on-surface min-h-screen selection:bg-secondary/30 selection:text-secondary font-sans relative overflow-hidden flex">
      
      {/* Backdrop for Mobile Sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SideNavBar - Desktop & Mobile Drawer */}
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
                className={`w-full flex items-center gap-4 py-3 px-4 transition-all duration-200 ease-in-out font-semibold rounded-xl text-left cursor-pointer ${
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

        {/* Profile Section at Bottom */}
        <div className="mt-auto pt-4 border-t border-surface-variant/20">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/30 shrink-0">
                <img
                  className="w-full h-full object-cover"
                  alt="Denji"
                  src={avatar}
                />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-on-surface truncate">{technicianName}</h4>
                <p className="text-xs text-secondary truncate">Elite Technician</p>
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

      {/* Main Chat Layout Area */}
      <div className="flex-grow lg:ml-64 h-screen flex flex-col pt-20">
        
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
              <h2 className="font-headline-md text-headline-md font-bold text-secondary">Pesan Masuk</h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-surface-container px-3 py-1 rounded-full border border-outline-variant/30">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] text-secondary font-extrabold uppercase tracking-wider">Online</span>
            </div>
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
                alt={technicianName}
                src={avatar}
              />
            </div>
          </div>
        </header>

        {/* Content Container (Split into Chat List, Message Panel, Negotiation Drawer) */}
        <div className="flex-grow flex overflow-hidden relative">
          
          {/* 1. Chat List Panel */}
          <section className="w-full md:w-[320px] lg:w-[350px] shrink-0 border-r border-surface-variant/15 flex flex-col bg-surface-container-low md:flex">
            <div className="p-5 pb-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 text-sm">search</span>
                <input
                  type="text"
                  placeholder="Cari percakapan..."
                  className="w-full bg-surface-container border border-outline-variant/20 rounded-xl pl-9 pr-4 py-2.5 text-xs text-on-surface focus:ring-1 focus:ring-secondary/50 outline-none"
                />
              </div>
            </div>

            <div className="flex-grow overflow-y-auto chat-scrollbar px-3 py-2 space-y-1">
              {chats.map((chat) => {
                const isActive = chat.id === activeChatId;
                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      setActiveChatId(chat.id);
                      setIsNegoPanelOpen(false); // keep chat area clean and wide when changing chats
                    }}
                    className={`p-3.5 rounded-2xl flex gap-3 cursor-pointer transition-all duration-200 ${
                      isActive 
                        ? "bg-secondary/10 border-l-4 border-secondary" 
                        : "hover:bg-surface-container-high"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full overflow-hidden border border-outline-variant/10">
                        <img className="w-full h-full object-cover" alt={chat.name} src={chat.avatar} />
                      </div>
                      {chat.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface-container rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-xs text-on-surface truncate">{chat.name}</h3>
                        <span className="text-[9px] text-on-surface-variant/70 font-semibold">{chat.time}</span>
                      </div>
                      {chat.negotiation?.active && (
                        <p className="text-[10px] text-secondary font-extrabold mt-1">Nego: {chat.negotiation.price}</p>
                      )}
                      <p className="text-xs text-on-surface-variant/80 truncate mt-0.5">{chat.lastMsg}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 2. Message Feed Panel */}
          <section className="flex-grow flex flex-col h-full bg-surface-container-lowest relative min-w-0">
            {!activeChatId ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl opacity-30 mb-3 text-secondary">chat_bubble_outline</span>
                <p className="text-sm font-semibold">Belum Ada Percakapan Terpilih</p>
                <p className="text-xs opacity-60 mt-1 max-w-[280px]">Silakan pilih salah satu percakapan di sebelah kiri untuk melihat pesan.</p>
              </div>
            ) : (
              <>
                {/* Header Info */}
                <div className="p-4 flex items-center justify-between bg-surface-container/60 border-b border-surface-variant/15 z-10 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-outline-variant/20 shrink-0">
                      <img className="w-full h-full object-cover" alt={activeChat.name} src={activeChat.avatar} />
                    </div>
                    <div>
                      <h2 className="font-bold text-xs text-on-surface">{activeChat.name}</h2>
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
                    {activeChat.negotiation && (
                      <button 
                        onClick={() => setIsNegoPanelOpen(!isNegoPanelOpen)}
                        className={`p-2 rounded-full transition-colors cursor-pointer ${
                          isNegoPanelOpen 
                            ? "bg-secondary/15 text-secondary" 
                            : "hover:bg-surface-container-high text-on-surface-variant"
                        }`}
                        title="Riwayat Negosiasi"
                      >
                        <span className="material-symbols-outlined text-sm">history_edu</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Chat Body messages */}
                <div className="flex-grow overflow-y-auto chat-scrollbar p-6 space-y-6">
                  <div className="flex justify-center">
                    <span className="text-[9px] bg-surface-container px-3.5 py-1 rounded-full text-on-surface-variant/80 uppercase tracking-widest font-extrabold">Hari Ini</span>
                  </div>

                  {messages.map((msg) => {
                    if (msg.sender === "system" && msg.type === "negotiation_offer") {
                      return (
                        <div key={msg.id} className="flex justify-center my-6">
                          <div className="bg-surface-container border border-secondary/25 p-5 rounded-3xl max-w-xs w-full text-center shadow-lg">
                            <span className="material-symbols-outlined text-secondary text-3xl mb-1">payments</span>
                            <h4 className="font-bold text-xs text-on-surface mb-0.5">Tawaran Harga</h4>
                            <div className="bg-surface-container-lowest py-2 px-4 rounded-xl mb-4">
                              <span className="text-lg font-black text-secondary">{msg.text}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    const isTukang = msg.sender === "tukang";
                    return (
                      <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isTukang ? "ml-auto justify-end" : ""} ${msg.is_optimistic ? 'opacity-70' : ''}`}>
                        {!isTukang && (
                          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 self-end mb-1 border border-outline-variant/20">
                            <img className="w-full h-full object-cover" alt={activeChat.name} src={activeChat.avatar} />
                          </div>
                        )}
                        <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isTukang 
                            ? "bg-secondary/15 text-on-surface border border-secondary/20 rounded-br-none" 
                            : "bg-surface-container text-on-surface rounded-bl-none"
                        }`}>
                          <p>{msg.text}</p>
                          <span className="flex items-center justify-end gap-1 mt-1.5">
                            <span className="text-[9px] text-on-surface-variant/60 block text-right">{msg.time}</span>
                            {msg.is_optimistic && (
                              <span className="material-symbols-outlined text-[10px] text-on-surface-variant/60 animate-spin">sync</span>
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-surface/40 border-t border-surface-variant/15 backdrop-blur-md">
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
                        placeholder="Tulis pesan..."
                        className="w-full bg-surface-container border border-outline-variant/10 rounded-2xl py-3 px-4 text-xs text-on-surface focus:ring-1 focus:ring-secondary/50 outline-none resize-none chat-scrollbar"
                      />
                    </div>
                    <button 
                      onClick={handleSendMessage}
                      className="bg-secondary text-on-secondary p-3 rounded-2xl flex items-center justify-center shadow-lg shadow-secondary/10 hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">send</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>

          {/* 3. Collapsible Negotiation History Drawer (Slides in on desktop or mobile seamlessly, saving chat space) */}
          <section className={`absolute right-0 top-0 bottom-0 z-30 w-[280px] lg:w-[300px] bg-surface-container border-l border-surface-variant/20 shadow-2xl flex flex-col transition-transform duration-300 transform ${
            isNegoPanelOpen ? "translate-x-0" : "translate-x-full"
          }`}>
            <div className="p-5 border-b border-surface-variant/15 flex items-center justify-between">
              <h2 className="font-bold text-xs text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-sm">history_edu</span>
                Riwayat Negosiasi
              </h2>
              <button 
                onClick={() => setIsNegoPanelOpen(false)}
                className="p-1 text-on-surface-variant hover:text-on-surface rounded-lg transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="flex-grow p-5 overflow-y-auto chat-scrollbar space-y-6">
              {activeChat.negotiation ? (
                <>
                  <div className="relative pl-5 space-y-6 before:content-[''] before:absolute before:left-1.5 before:top-1.5 before:bottom-1.5 before:w-[1.5px] before:bg-outline-variant/40">
                    {activeChat.negotiation.history.map((hist, idx) => {
                      const isAgreed = hist.status === "Selesai";
                      return (
                        <div key={idx} className="relative">
                          <div className={`absolute -left-[23px] top-1 w-3 h-3 rounded-full border-2 border-surface-container ${
                            isAgreed ? "bg-green-500" : "bg-outline-variant"
                          }`}></div>
                          <div className="flex flex-col gap-0.5">
                            <div className="flex justify-between items-center">
                              <span className={`text-[9px] font-bold uppercase tracking-wider ${
                                isAgreed ? "text-green-500" : "text-on-surface-variant/70"
                              }`}>{hist.status}</span>
                              <span className="text-[9px] text-on-surface-variant/60">{hist.time}</span>
                            </div>
                            <p className="font-bold text-[11px] text-on-surface">{isAgreed ? "Harga Disepakati" : "Harga Penawaran"}</p>
                            <p className={`font-black text-sm mt-0.5 ${isAgreed ? "text-secondary" : "text-on-surface"}`}>{hist.price}</p>
                            {hist.notes && (
                              <p className="text-[10px] text-on-surface-variant/80 mt-1 italic leading-relaxed">"{hist.notes}"</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-4 pt-4 border-t border-surface-variant/15">
                    <div className="p-3 bg-surface-container-high rounded-2xl">
                      <h4 className="text-[9px] font-bold text-on-surface-variant/70 uppercase mb-2">Status Pekerjaan</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-on-surface">{activeChat.negotiation.jobStatus}</span>
                        <span className="bg-secondary/15 text-secondary text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">Pending</span>
                      </div>
                      <div className="mt-3 w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
                        <div className="w-1/4 h-full bg-secondary"></div>
                      </div>
                    </div>

                    <div className="p-3 bg-surface-container-high rounded-2xl">
                      <h4 className="text-[9px] font-bold text-on-surface-variant/70 uppercase mb-2">Jadwal Rencana</h4>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="material-symbols-outlined text-xs text-on-surface-variant/70">calendar_today</span>
                        <span className="text-[11px] font-semibold text-on-surface">{activeChat.negotiation.schedule}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-on-surface-variant/60 text-xs">Tidak ada riwayat negosiasi untuk chat ini.</div>
              )}
            </div>

            <div className="p-5 border-t border-surface-variant/15">
              <button className="w-full bg-secondary text-on-secondary py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 group hover:brightness-105 transition-all cursor-pointer">
                <span>Buat Kontrak Pekerjaan</span>
                <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
              </button>
            </div>
          </section>

        </div>

      </div>

      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={() => navigate("/")} 
        role="teknisi" 
      />
    </div>
  );
}

export default TukangChat;
