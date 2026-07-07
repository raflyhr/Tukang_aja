import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`, // Sesuaikan port dengan backend laravel
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Helper function untuk menentukan role berdasarkan URL saat ini
const getRolePrefix = () => {
  const path = window.location.pathname;
  if (path.startsWith('/tukang')) return 'tukang';
  if (path.startsWith('/admin')) return 'admin';
  return 'pelanggan'; // Default, karena rute pelanggan ada di root
};

// Interceptor untuk menyisipkan token secara otomatis ke setiap request
api.interceptors.request.use(
  (config) => {
    // Ambil token dari localStorage berdasarkan role prefix
    const prefix = getRolePrefix();
    const token = localStorage.getItem(`${prefix}_token`);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor response untuk menangani error 401 (Unauthorized / Token Kedaluwarsa)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const prefix = getRolePrefix();
      // Hapus data sesi yang kedaluwarsa
      localStorage.removeItem(`${prefix}_token`);
      localStorage.removeItem(`${prefix}_user`);
      localStorage.removeItem(`${prefix}_id`);
      localStorage.removeItem(`${prefix}_role`);
      
      // Tampilkan notifikasi agar user tahu
      alert("Sesi Anda telah berakhir. Silakan login kembali untuk melanjutkan.");
      
      // Redirect ke login tanpa merefresh paksa jika bisa di-handle router, 
      // tapi window.location.href paling aman untuk force clear state memory
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;
