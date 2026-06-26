import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/home";
import RegisterPelanggan from "./pages/registerPelanggan";
import RegisterTukang from "./pages/registerTukang";
import Login from "./pages/login";
import Dashboard from "./pelanggan/dashboard";
import Pesanan from "./pelanggan/pesanan";
import Chat from "./pelanggan/chat";
import Pembayaran from "./pelanggan/pembayaran";
import Profil from "./pelanggan/profil";
import TukangDashboard from "./tukang/dashboard";
import TukangPesanan from "./tukang/pesanan";
import TukangChat from "./tukang/chat";
import TukangProfil from "./tukang/profil";
import Notifications from "./pages/notifications";
import HelpCenter from "./pages/bantuan";
import AdminDashboard from "./admin/dashboard";
import VerifikasiTukang from "./admin/verifikasi";
import DataTukang from "./admin/data";
import MonitoringRating from "./admin/monitoring";
import ProfilAdmin from "./admin/profil";

import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main page (home.jsx) */}
        <Route path="/" element={<Home />} />

        {/* Authentication & Onboarding */}
        <Route path="/register-pelanggan" element={<RegisterPelanggan />} />
        <Route path="/register-tukang" element={<RegisterTukang />} />
        <Route path="/login" element={<Login />} />

        {/* Pelanggan (Customer) Routes */}
        <Route path="/pelanggan/dashboard" element={<Dashboard />} />
        <Route path="/pelanggan/pesanan" element={<Pesanan />} />
        <Route path="/pelanggan/chat" element={<Chat />} />
        <Route path="/pelanggan/pembayaran" element={<Pembayaran />} />
        <Route path="/pelanggan/profil" element={<Profil />} />

        {/* Tukang (Technician) Routes */}
        <Route path="/tukang/dashboard" element={<TukangDashboard />} />
        <Route path="/tukang/pesanan" element={<TukangPesanan />} />
        <Route path="/tukang/chat" element={<TukangChat />} />
        <Route path="/tukang/profil" element={<TukangProfil />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/verifikasi" element={<VerifikasiTukang />} />
        <Route path="/admin/data" element={<DataTukang />} />
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
