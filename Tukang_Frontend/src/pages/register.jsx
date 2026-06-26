import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  return (
    <div className="bg-background font-body-md text-on-surface min-h-screen flex items-center justify-center relative select-none">
      
      {/* Background Decoration Elements */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-secondary/5 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-primary/5 blur-[80px] rounded-full"></div>
      </div>

      <main className="w-full max-w-4xl mx-auto px-6 md:px-12 py-12 flex flex-col justify-center items-center z-10 min-h-screen">
        
        {/* Back button to Login */}
        <div className="w-full max-w-2xl mb-8 flex justify-start">
          <Link
            to="/login"
            className="flex items-center gap-2 text-on-surface-variant hover:text-secondary transition-all text-sm font-semibold active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            <span>Kembali ke Login</span>
          </Link>
        </div>

        {/* Title Area */}
        <header className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-3 tracking-tight">
            Mulai Perjalanan Anda
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant font-medium max-w-md mx-auto">
            Pilih bagaimana Anda ingin menggunakan TukangAja.
          </p>
        </header>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          
          {/* Card 1: Pelanggan */}
          <div
            onClick={() => navigate("/register-pelanggan")}
            className="bg-surface-container rounded-3xl p-8 shadow-md border border-surface-variant/20 hover:border-secondary/35 hover:-translate-y-1 hover:shadow-xl hover:shadow-secondary/5 transition-all duration-300 cursor-pointer flex flex-col items-center text-center group"
          >
            <div className="bg-secondary/10 p-5 rounded-full mb-6 border border-secondary/20 group-hover:scale-110 group-hover:bg-secondary/15 transition-all duration-300">
              <span
                className="material-symbols-outlined text-secondary text-5xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                person
              </span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2 group-hover:text-secondary transition-colors">
              Daftar sebagai Pelanggan
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Cari tukang profesional untuk kebutuhan rumah Anda.
            </p>
          </div>

          {/* Card 2: Tukang */}
          <div
            onClick={() => navigate("/register-tukang")}
            className="bg-surface-container rounded-3xl p-8 shadow-md border border-surface-variant/20 hover:border-secondary/35 hover:-translate-y-1 hover:shadow-xl hover:shadow-secondary/5 transition-all duration-300 cursor-pointer flex flex-col items-center text-center group"
          >
            <div className="bg-secondary/10 p-5 rounded-full mb-6 border border-secondary/20 group-hover:scale-110 group-hover:bg-secondary/15 transition-all duration-300">
              <span
                className="material-symbols-outlined text-secondary text-5xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                construction
              </span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2 group-hover:text-secondary transition-colors">
              Daftar sebagai Tukang
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Tawarkan jasa Anda dan mulai mendapatkan pelanggan.
            </p>
          </div>

        </div>

        {/* Footer info link */}
        <footer className="mt-12 text-center">
          <p className="text-sm text-on-surface-variant font-medium flex items-center justify-center gap-1.5">
            Sudah punya akun?
            <Link
              className="text-secondary font-bold hover:underline transition-all text-sm"
              to="/login"
            >
              Masuk
            </Link>
          </p>
        </footer>

      </main>

    </div>
  );
}

export default Register;
