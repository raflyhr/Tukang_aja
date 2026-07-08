import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/home";
import Register from "./pages/register";
import RegisterPelanggan from "./pages/registerPelanggan";
import RegisterTukang from "./pages/registerTukang";
import Login from "./pages/login";
import Dashboard from "./pages/pelanggan/dashboard";
import Pesanan from "./pages/pelanggan/pesanan";
import Chat from "./pages/pelanggan/chat";
import Pembayaran from "./pages/pelanggan/pembayaran";
import Profil from "./pages/pelanggan/profil";
import DetailPesanan from "./pages/pelanggan/detail-pesanan";
import ProfilTukang from "./pages/pelanggan/profil-tukang";
import PostingPekerjaan from "./pages/postingPekerjaan";
import CheckoutPembayaran from "./pages/pelanggan/checkout";
import RiwayatLogin from "./pages/pelanggan/riwayat-login";
import TukangDashboard from "./pages/tukang/dashboard";
import TukangPesanan from "./pages/tukang/pesanan";
import TukangChat from "./pages/tukang/chat";
import TukangProfil from "./pages/tukang/profil";
import TukangLayanan from "./pages/tukang/layanan";
import Notifications from "./pages/notifications";
import HelpCenter from "./pages/bantuan";
import AdminDashboard from "./pages/admin/dashboard";
import VerifikasiTukang from "./pages/admin/verifikasi";
import DataTukang from "./pages/admin/data";
import MonitoringRating from "./pages/admin/monitoring";
import ProfilAdmin from "./pages/admin/profil";
import DataPelanggan from "./pages/admin/pelanggan";
import AdminPesanan from "./pages/admin/pesanan";
import AdminPembayaran from "./pages/admin/pembayaran";
import AdminLaporan from "./pages/admin/laporan";
import { ProtectedRoute, GeneralProtectedRoute } from "./components/ProtectedRoute";

import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main page (home.jsx) */}
        <Route path="/" element={<Home />} />

        {/* Authentication & Onboarding */}
        <Route path="/register" element={<Register />} />
        <Route path="/register-pelanggan" element={<RegisterPelanggan />} />
        <Route path="/register-tukang" element={<RegisterTukang />} />
        <Route path="/login" element={<Login />} />

        {/* Pelanggan (Customer) Routes */}
        <Route path="/pelanggan/dashboard" element={<ProtectedRoute allowedRole="pelanggan"><Dashboard /></ProtectedRoute>} />
        <Route path="/pelanggan/pesanan" element={<ProtectedRoute allowedRole="pelanggan"><Pesanan /></ProtectedRoute>} />
        <Route path="/pelanggan/chat" element={<ProtectedRoute allowedRole="pelanggan"><Chat /></ProtectedRoute>} />
        <Route path="/pelanggan/pembayaran" element={<ProtectedRoute allowedRole="pelanggan"><Pembayaran /></ProtectedRoute>} />
        <Route path="/pelanggan/profil" element={<ProtectedRoute allowedRole="pelanggan"><Profil /></ProtectedRoute>} />
        <Route path="/pelanggan/detail-pesanan" element={<ProtectedRoute allowedRole="pelanggan"><DetailPesanan /></ProtectedRoute>} />
        <Route path="/pelanggan/profil-tukang" element={<ProtectedRoute allowedRole="pelanggan"><ProfilTukang /></ProtectedRoute>} />
        <Route path="/posting-pekerjaan" element={<ProtectedRoute allowedRole="pelanggan"><PostingPekerjaan /></ProtectedRoute>} />
        <Route path="/pelanggan/checkout" element={<ProtectedRoute allowedRole="pelanggan"><CheckoutPembayaran /></ProtectedRoute>} />
        <Route path="/pelanggan/riwayat-login" element={<ProtectedRoute allowedRole="pelanggan"><RiwayatLogin /></ProtectedRoute>} />

        {/* Tukang (Technician) Routes */}
        <Route path="/tukang/dashboard" element={<ProtectedRoute allowedRole="tukang"><TukangDashboard /></ProtectedRoute>} />
        <Route path="/tukang/pesanan" element={<ProtectedRoute allowedRole="tukang"><TukangPesanan /></ProtectedRoute>} />
        <Route path="/tukang/chat" element={<ProtectedRoute allowedRole="tukang"><TukangChat /></ProtectedRoute>} />
        <Route path="/tukang/profil" element={<ProtectedRoute allowedRole="tukang"><TukangProfil /></ProtectedRoute>} />
        <Route path="/tukang/layanan" element={<ProtectedRoute allowedRole="tukang"><TukangLayanan /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/verifikasi/:id?" element={<ProtectedRoute allowedRole="admin"><VerifikasiTukang /></ProtectedRoute>} />
        <Route path="/admin/data" element={<ProtectedRoute allowedRole="admin"><DataTukang /></ProtectedRoute>} />
        <Route path="/admin/pelanggan" element={<ProtectedRoute allowedRole="admin"><DataPelanggan /></ProtectedRoute>} />
        <Route path="/admin/pesanan" element={<ProtectedRoute allowedRole="admin"><AdminPesanan /></ProtectedRoute>} />
        <Route path="/admin/pembayaran" element={<ProtectedRoute allowedRole="admin"><AdminPembayaran /></ProtectedRoute>} />
        <Route path="/admin/laporan" element={<ProtectedRoute allowedRole="admin"><AdminLaporan /></ProtectedRoute>} />
        <Route path="/admin/rating" element={<ProtectedRoute allowedRole="admin"><MonitoringRating /></ProtectedRoute>} />
        <Route path="/admin/profil" element={<ProtectedRoute allowedRole="admin"><ProfilAdmin /></ProtectedRoute>} />

        {/* General Pages */}
        <Route path="/notifikasi" element={<GeneralProtectedRoute><Notifications /></GeneralProtectedRoute>} />
        <Route path="/bantuan" element={<GeneralProtectedRoute><HelpCenter /></GeneralProtectedRoute>} />
        
        {/* Fallback redirect to /admin/dashboard */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
