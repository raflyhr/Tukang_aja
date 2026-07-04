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
        <Route path="/pelanggan/dashboard" element={<Dashboard />} />
        <Route path="/pelanggan/pesanan" element={<Pesanan />} />
        <Route path="/pelanggan/chat" element={<Chat />} />
        <Route path="/pelanggan/pembayaran" element={<Pembayaran />} />
        <Route path="/pelanggan/profil" element={<Profil />} />
        <Route path="/pelanggan/detail-pesanan" element={<DetailPesanan />} />
        <Route path="/pelanggan/profil-tukang" element={<ProfilTukang />} />
        <Route path="/posting-pekerjaan" element={<PostingPekerjaan />} />
        <Route path="/pelanggan/checkout" element={<CheckoutPembayaran />} />
        <Route path="/pelanggan/riwayat-login" element={<RiwayatLogin />} />

        {/* Tukang (Technician) Routes */}
        <Route path="/tukang/dashboard" element={<TukangDashboard />} />
        <Route path="/tukang/pesanan" element={<TukangPesanan />} />
        <Route path="/tukang/chat" element={<TukangChat />} />
        <Route path="/tukang/profil" element={<TukangProfil />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/verifikasi/:id?" element={<VerifikasiTukang />} />
        <Route path="/admin/data" element={<DataTukang />} />
        <Route path="/admin/pelanggan" element={<DataPelanggan />} />
        <Route path="/admin/pesanan" element={<AdminPesanan />} />
        <Route path="/admin/pembayaran" element={<AdminPembayaran />} />
        <Route path="/admin/laporan" element={<AdminLaporan />} />
        <Route path="/admin/rating" element={<MonitoringRating />} />
        <Route path="/admin/profil" element={<ProfilAdmin />} />

        {/* General Pages */}
        <Route path="/notifikasi" element={<Notifications />} />
        <Route path="/bantuan" element={<HelpCenter />} />
        
        {/* Fallback redirect to /admin/dashboard */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
