import React from "react";

function LogoutModal({ isOpen, onClose, onConfirm, role = "pelanggan" }) {
  if (!isOpen) return null;

  let message = "Apakah Anda yakin ingin keluar dari akun TukangAja?";
  if (role === "teknisi") {
    message = "Apakah Anda yakin ingin keluar dari akun teknisi TukangAja?";
  } else if (role === "admin") {
    message = "Apakah Anda yakin ingin keluar dari akun admin TukangAja?";
  } else if (role === "pelanggan") {
    message = "Apakah Anda yakin ingin keluar dari akun pelanggan TukangAja?";
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Blur & Dark Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300 cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-surface-container border border-surface-variant/20 w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center space-y-4 animate-[scaleUp_0.25s_cubic-bezier(0.34,1.56,0.64,1)_forwards]">
        
        {/* Logout Icon */}
        <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
          <span className="material-symbols-outlined text-2xl font-bold">logout</span>
        </div>

        <div className="space-y-1.5">
          <h4 className="font-extrabold text-base text-on-surface">Keluar dari Akun?</h4>
          <p className="text-xs text-on-surface-variant/80 leading-relaxed px-2">
            {message}
          </p>
        </div>

        <div className="flex gap-3 w-full pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-outline-variant/30 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer bg-transparent"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={(e) => {
              const path = window.location.pathname;
              if (path.startsWith('/tukang')) {
                localStorage.removeItem('tukang_token');
                localStorage.removeItem('tukang_user');
                localStorage.removeItem('tukang_id');
                localStorage.removeItem('tukang_role');
              } else if (path.startsWith('/admin')) {
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_user');
                localStorage.removeItem('admin_id');
                localStorage.removeItem('admin_role');
              } else {
                localStorage.removeItem('pelanggan_token');
                localStorage.removeItem('pelanggan_user');
                localStorage.removeItem('pelanggan_id');
                localStorage.removeItem('pelanggan_role');
              }
              if (onConfirm) onConfirm(e);
            }}
            className="flex-1 py-2.5 bg-secondary text-on-secondary rounded-xl text-xs font-bold hover:opacity-95 transition-opacity cursor-pointer shadow-lg shadow-secondary/15 border-none"
          >
            Ya, Keluar
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogoutModal;
