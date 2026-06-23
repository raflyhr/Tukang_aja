import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Toast notification state
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState(""); // "success" | "error"
  const [showToast, setShowToast] = useState(false);

  const navigate = useNavigate();

  // Temporary frontend-only dummy authentication system for UI/UX testing and navigation
  // Will be replaced with real backend API integration later.
  const dummyUsers = [
    { 
      email: "admin@tukangaja.com", 
      password: "admin123", 
      role: "admin", 
      path: "/admin/dashboard", 
      message: "Login berhasil sebagai Admin" 
    },
    { 
      email: "tukang@tukangaja.com", 
      password: "tukang123", 
      role: "tukang", 
      path: "/tukang/dashboard", 
      message: "Login berhasil sebagai Tukang" 
    },
    { 
      email: "user@tukangaja.com", 
      password: "user123", 
      role: "pelanggan", 
      path: "/pelanggan/dashboard", 
      message: "Login berhasil sebagai Pelanggan" 
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check credentials against dummy data
    const matchedUser = dummyUsers.find(
      (user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password
    );

    if (matchedUser) {
      setToastType("success");
      setToastMessage(matchedUser.message);
      setShowToast(true);
      
      // Delay navigation slightly so user can see the success toast notification
      setTimeout(() => {
        navigate(matchedUser.path);
      }, 1200);
    } else {
      setToastType("error");
      setToastMessage("Email atau password salah");
      setShowToast(true);
      
      // Automatically hide error toast after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
  };

  return (
    <div className="bg-background font-body-md text-on-surface min-h-screen flex items-center justify-center relative select-none">
      
      {/* Toast Notification Bar */}
      {showToast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3.5 rounded-2xl shadow-2xl transition-all duration-300 ${
          toastType === "success" 
            ? "bg-secondary text-on-secondary" 
            : "bg-red-500/10 border border-red-500/30 text-red-400 backdrop-blur-md"
        }`}>
          <span className="material-symbols-outlined">
            {toastType === "success" ? "check_circle" : "error"}
          </span>
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      <main className="w-full max-w-7xl mx-auto px-6 md:px-12 py-12 flex min-h-screen items-center z-10">
        <div className="bg-surface-container-lowest rounded-3xl overflow-hidden flex flex-col md:flex-row w-full min-h-[700px] shadow-2xl border border-surface-variant/20">
          
          {/* Left Side: Visual Illustration (Hidden on Mobile) */}
          <div className="hidden md:flex md:w-1/2 bg-[#0d0d0d] relative p-12 flex-col justify-between overflow-hidden border-r border-surface-variant/20">
            {/* Abstract Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--color-primary)_0%,_transparent_70%)]"></div>
            </div>

            {/* Logo */}
            <div className="relative z-10">
              <Link
                to="/"
                className="font-headline-md text-headline-md font-bold text-secondary hover:opacity-90 transition-all"
              >
                TukangAja
              </Link>
            </div>

            {/* Main Illustration Area */}
            <div className="relative z-10 flex flex-col items-start gap-4">
              <div className="bg-secondary/10 p-4 rounded-full mb-4 border border-secondary/20">
                <span
                  className="material-symbols-outlined text-secondary text-5xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  construction
                </span>
              </div>
              <h1 className="text-4xl font-extrabold text-on-surface leading-tight tracking-tight max-w-md">
                Hubungkan Kebutuhan dan Keahlian dalam Satu Platform.
              </h1>
              <p className="text-sm md:text-base text-on-surface-variant max-w-sm leading-relaxed">
                Masuk ke akun TukangAja untuk mencari layanan terpercaya atau
                mengelola pekerjaan Anda dengan lebih mudah.
              </p>
            </div>

            {/* Footer Image/Context */}
            <div className="relative z-10 w-full h-64 rounded-2xl overflow-hidden shadow-2xl border border-surface-variant/25">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d]/90 to-transparent z-10"></div>
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAS5AQAFLmfgQ6ns1Sza4k2GRk2wrdmMxX6V9hzURdUhUsvqvW1IlC3ALDanhWpLTQdop6E0ym4Y39EI-4q-yOiEDFEYqscP5Rh3ehP8t_sKahulJ2eJq-OoB9tJVQWjihDzYWQNZfB60NcHRgmclB_GyzW_jaL80QL3GhWjAs5-2OXF2bUGxoeZif22ZHS-EsoTbSzB1YbOCTv6ErjZ5dnYIOhspdoroiUJfrRmy0W3mKDtQzmJMw3oZi1leUYbeP8CO2-gasA3mEq')",
                }}
              ></div>
              <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-[#0d0d0d] bg-surface-container bg-cover bg-center"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAD0dNWW0gJiE8Vf7bEISo_PLIftNs0p5c4MXKNBHE6aVSjAyI8oWUtnc7qYrg-h5kBE2GeRY1_xISiiWjKfV2eauQC-AR-Hz9aOeX8ohApU84tfkFUKvl9iKRg2UZzshKEYcq85cnD6Bo3NGiqpsYmrBX_iewkTr2c9jNRtxRc7JC2VnOoGdt94B04SZTVs9amKTeZ2r9hs2hmI_cRZ7KJx6CkSHvIzFpntnX8buB555--4udfMiphMFHnqbXTc_bS909MnQ6CRTy0')",
                    }}
                  ></div>
                  <div
                    className="w-8 h-8 rounded-full border-2 border-[#0d0d0d] bg-surface-container bg-cover bg-center"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAPlNL-dwzPtBXpFW5dQr35ZSzKv7oc0JQcQgZn0xSws3eNsvvT6wxE7xPuL4XCwvjGh6XEGPPylZ7tX1mZ9U-pE2kmi7jgc8qUxD0QD_FSJYAduqFxlymI5a-oxcZArBuS6dFLwQyZB689tPwF5HE1_d9Z-cisfsFOsQZthyVwFUMJ7L3IQNC7oFOtPC3zopNxI8XViKOcGjpaK3Fi1GPMbIWrPN2ea39XAlqA01Yr3ukYlFssDyRf1SMu-cZMw2CSjq5a7kLhFTEN')",
                    }}
                  ></div>
                </div>
                <span className="text-on-surface text-xs font-semibold">
                  5.000+ Tukang Terverifikasi
                </span>
              </div>
            </div>
          </div>

          {/* Right Side: Login Form */}
          <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-surface-container">
            <div className="max-w-md mx-auto w-full">
              {/* Mobile Logo (Shown only on small screens) */}
              <div className="md:hidden mb-8">
                <Link
                  to="/"
                  className="font-headline-md text-headline-md font-bold text-secondary"
                >
                  TukangAja
                </Link>
              </div>

              <header className="mb-8">
                <h2 className="text-3xl font-bold text-on-surface mb-2 tracking-tight">
                  Selamat Datang Kembali
                </h2>
                <p className="text-sm text-on-surface-variant font-medium">
                  Silakan masukkan detail akun Anda untuk masuk.
                </p>
              </header>

              {/* Login Form */}
              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* Email Input */}
                <div className="space-y-2">
                  <label
                    className="text-sm font-semibold text-on-surface-variant px-1"
                    htmlFor="email"
                  >
                    Alamat Email
                  </label>
                  <div className="relative group focus-within:scale-[1.01] transition-transform duration-200">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">
                      mail
                    </span>
                    <input
                      className="w-full pl-10 pr-4 py-3 bg-surface-container-high border border-outline-variant/30 rounded-xl focus:ring-1 focus:ring-secondary/50 focus:border-secondary outline-none transition-all text-sm text-on-surface placeholder:text-on-surface-variant/40"
                      id="email"
                      placeholder="nama@email.com"
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label
                    className="text-sm font-semibold text-on-surface-variant px-1"
                    htmlFor="password"
                  >
                    Kata Sandi
                  </label>
                  <div className="relative group focus-within:scale-[1.01] transition-transform duration-200">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">
                      lock
                    </span>
                    <input
                      className="w-full pl-10 pr-10 py-3 bg-surface-container-high border border-outline-variant/30 rounded-xl focus:ring-1 focus:ring-secondary/50 focus:border-secondary outline-none transition-all text-sm text-on-surface placeholder:text-on-surface-variant/40"
                      id="password"
                      placeholder="•••••••"
                      required
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer bg-transparent border-none"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Extra Actions */}
                <div className="flex items-center justify-between py-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      className="h-4 w-4 rounded border-outline-variant/50 bg-surface-container-high text-secondary focus:ring-secondary/50 cursor-pointer"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="text-xs text-on-surface-variant group-hover:text-on-surface transition-colors font-medium">
                      Ingat Saya
                    </span>
                  </label>
                  <a
                    className="text-xs text-secondary hover:opacity-80 transition-all font-semibold"
                    href="#"
                  >
                    Lupa Password?
                  </a>
                </div>

                {/* Submit Button */}
                <button
                  className="w-full py-3.5 bg-secondary text-on-secondary font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-secondary/15 cursor-pointer border-none"
                  type="submit"
                >
                  <span className="font-bold text-sm">Masuk Sekarang</span>
                  <span className="material-symbols-outlined text-lg">
                    arrow_forward
                  </span>
                </button>

                {/* Divider */}
                <div className="relative py-2 flex items-center">
                  <div className="flex-grow border-t border-outline-variant/20"></div>
                  <span className="flex-shrink mx-4 text-xs text-on-surface-variant/60 uppercase tracking-widest font-bold">
                    Atau
                  </span>
                  <div className="flex-grow border-t border-outline-variant/20"></div>
                </div>

                {/* Social Login */}
                <button
                  className="w-full py-3 bg-surface-container-high border border-outline-variant/30 text-on-surface font-semibold text-sm rounded-xl hover:bg-surface-variant/45 transition-all flex items-center justify-center gap-3 active:scale-[0.98] cursor-pointer"
                  type="button"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    ></path>
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    ></path>
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    ></path>
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    ></path>
                  </svg>
                  <span>Masuk dengan Google</span>
                </button>
              </form>

              {/* Registration Link */}
              <footer className="mt-8 text-center">
                <p className="text-sm text-on-surface-variant font-medium">
                  Belum punya akun?{" "}
                  <Link
                    className="text-secondary font-bold hover:underline transition-all"
                    to="/"
                  >
                    Daftar Sekarang
                  </Link>
                </p>
              </footer>
            </div>
          </div>
        </div>
      </main>

      {/* Background Decoration Elements */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-secondary/5 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-primary/5 blur-[80px] rounded-full"></div>
      </div>
    </div>
  );
}

export default Login;
