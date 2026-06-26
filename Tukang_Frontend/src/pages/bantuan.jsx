import { useState } from "react";
import { useNavigate } from "react-router-dom";

function HelpCenter() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqId, setOpenFaqId] = useState(null);
  
  // Support Form State
  const [contactSubject, setContactSubject] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const faqs = [
    {
      id: 1,
      question: "Bagaimana cara menerima pesanan pelanggan?",
      answer: "Anda dapat melihat pesanan baru yang tersedia pada menu 'Pesanan Saya'. Pilih tab 'Menunggu Penawaran', lalu klik 'Kirim Penawaran' dan masukkan nominal harga jasa Anda. Jika pelanggan menyetujui, status akan berubah menjadi 'Sedang Dikerjakan'."
    },
    {
      id: 2,
      question: "Apakah ada potongan biaya atau komisi untuk setiap transaksi?",
      answer: "TukangAja tidak menggunakan sistem saldo internal atau dompet digital. Seluruh pembayaran dari pelanggan langsung ditransfer ke rekening bank, QRIS, Dana, OVO, atau GoPay Anda tanpa potongan komisi platform."
    },
    {
      id: 3,
      question: "Bagaimana jika pelanggan membatalkan pesanan secara sepihak?",
      answer: "Jika pembatalan terjadi sebelum pekerjaan dimulai, status pesanan otomatis dihentikan. Jika terjadi setelah Anda tiba di lokasi, Anda dapat mendiskusikan biaya transportasi pengganti melalui fitur Chat."
    },
    {
      id: 4,
      question: "Bagaimana cara memperbarui dokumen sertifikasi atau data profil?",
      answer: "Anda dapat memperbarui data profil Anda di menu 'Profil'. Untuk perubahan data KTP, area layanan spesialis, atau sertifikasi keahlian khusus, Anda dapat mengirimkan dokumen terbaru melalui form hubungi bantuan di bawah."
    },
    {
      id: 5,
      question: "Apakah akun saya bisa dinonaktifkan sementara saat libur?",
      answer: "Tentu. Anda cukup mematikan tombol status kerja (dari 'Online' menjadi 'Offline') di bagian kanan atas halaman Dashboard Anda. Pelanggan tidak akan dapat melihat atau menawari Anda pesanan baru selama Anda offline."
    }
  ];

  const categories = [
    { icon: "person", title: "Akun & Profil", desc: "Kelola kata sandi, verifikasi data, dan detail teknisi." },
    { icon: "payments", title: "Pembayaran", desc: "Metode transfer langsung, konfirmasi pembayaran, dan dana." },
    { icon: "construction", title: "Layanan Jasa", desc: "Spesialisasi plumbing, listrik, elektronik, AC, dll." },
    { icon: "verified_user", title: "Keamanan", desc: "Kebijakan perlindungan privasi data dan tips transaksi aman." }
  ];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactSubject || !contactMsg) return;
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setContactSubject("");
      setContactMsg("");
      alert("Pesan Anda telah terkirim! Tim dukungan kami akan segera menghubungi Anda.");
    }, 1500);
  };

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-background text-on-surface min-h-screen selection:bg-secondary/30 selection:text-secondary font-sans pb-16">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-surface/80 backdrop-blur-xl border-b border-surface-variant/20 flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-headline-md text-headline-md font-bold text-secondary">Pusat Bantuan</h1>
        </div>
      </header>

      <main className="pt-28 px-6 md:px-12 max-w-4xl mx-auto space-y-12">
        
        {/* Search Banner */}
        <section className="bg-surface-container p-6 md:p-8 rounded-3xl border border-surface-variant/15 text-center space-y-4 shadow-lg">
          <h2 className="text-xl md:text-2xl font-extrabold text-on-surface">Ada yang bisa kami bantu?</h2>
          <p className="text-xs text-on-surface-variant/80 max-w-md mx-auto">Temukan jawaban cepat atas pertanyaan Anda tentang pendaftaran, pesanan, layanan, dan pembayaran.</p>
          
          <div className="relative max-w-md mx-auto mt-2">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/70">search</span>
            <input 
              type="text" 
              placeholder="Cari solusi atau kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-on-surface focus:ring-1 focus:ring-secondary/50 outline-none"
            />
          </div>
        </section>

        {/* Categories Grid */}
        <section className="space-y-4">
          <h3 className="font-bold text-sm text-on-surface uppercase tracking-wider">Kategori Bantuan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat, idx) => (
              <div key={idx} className="bg-surface-container/60 p-5 rounded-2xl border border-surface-variant/10 hover:border-secondary/30 transition-all flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">{cat.icon}</span>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-on-surface">{cat.title}</h4>
                  <p className="text-[11px] text-on-surface-variant/80 mt-1 leading-relaxed">{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="space-y-4">
          <h3 className="font-bold text-sm text-on-surface uppercase tracking-wider">Pertanyaan Populer (FAQ)</h3>
          
          <div className="space-y-2.5">
            {filteredFaqs.length === 0 ? (
              <p className="text-xs text-on-surface-variant/60 py-6 text-center">Tidak ada pertanyaan yang cocok dengan pencarian Anda.</p>
            ) : (
              filteredFaqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div 
                    key={faq.id}
                    className="bg-surface-container border border-surface-variant/10 rounded-2xl overflow-hidden transition-all duration-300"
                  >
                    <button
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-surface-container-high transition-colors cursor-pointer"
                    >
                      <span className="font-bold text-xs text-on-surface pr-4">{faq.question}</span>
                      <span className={`material-symbols-outlined text-secondary transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                        expand_more
                      </span>
                    </button>
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? "max-h-[300px] border-t border-surface-variant/10 p-4 bg-surface-container-low/40" : "max-h-0"
                    }`}>
                      <p className="text-xs text-on-surface-variant/90 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Support Form Section */}
        <section className="bg-surface-container p-6 md:p-8 rounded-3xl border border-surface-variant/15 space-y-6 shadow-lg">
          <div className="space-y-1.5">
            <h3 className="text-base font-extrabold text-on-surface">Masih Butuh Bantuan?</h3>
            <p className="text-xs text-on-surface-variant/80">Kirimkan pertanyaan atau aduan Anda langsung ke tim layanan pelanggan kami. Kami biasanya merespons dalam 24 jam.</p>
          </div>

          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/75 mb-2">Subjek Masalah</label>
              <input 
                type="text" 
                placeholder="Contoh: Perubahan data spesialisasi layanan, kendala sistem, dll."
                value={contactSubject}
                onChange={(e) => setContactSubject(e.target.value)}
                className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl py-2.5 px-4 text-xs text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary/30 outline-none transition-all"
                required
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/75 mb-2">Detail Pesan / Pertanyaan</label>
              <textarea 
                placeholder="Jelaskan kendala atau keluhan Anda secara detail..."
                rows="4"
                value={contactMsg}
                onChange={(e) => setContactMsg(e.target.value)}
                className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl py-2.5 px-4 text-xs text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary/30 outline-none transition-all resize-none"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={isSubmitted}
              className="bg-secondary text-on-secondary px-6 py-3 rounded-xl text-xs font-bold hover:brightness-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 border-none"
            >
              {isSubmitted ? (
                <>
                  <span className="w-4 h-4 border-2 border-on-secondary border-t-transparent rounded-full animate-spin"></span>
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-xs">send</span>
                  <span>Kirim Laporan</span>
                </>
              )}
            </button>
          </form>
        </section>

      </main>
    </div>
  );
}

export default HelpCenter;
