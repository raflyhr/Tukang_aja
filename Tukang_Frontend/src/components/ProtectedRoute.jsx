import React from "react";
import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem(`${allowedRole}_token`);
  const role = localStorage.getItem(`${allowedRole}_role`);

  // Pelanggan di backend role-nya adalah 'user'
  const isRoleValid = 
    role === allowedRole || 
    (allowedRole === "pelanggan" && role === "user");

  if (!token || !isRoleValid) {
    // Balikkan ke login jika tidak terautentikasi atau role tidak sesuai
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function GeneralProtectedRoute({ children }) {
  const isPelanggan = localStorage.getItem("pelanggan_token");
  const isTukang = localStorage.getItem("tukang_token");
  const isAdmin = localStorage.getItem("admin_token");

  if (!isPelanggan && !isTukang && !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
