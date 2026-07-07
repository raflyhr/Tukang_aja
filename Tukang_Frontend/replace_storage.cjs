const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    for (const { from, to } of replacements) {
        content = content.split(from).join(to);
    }
    if (original !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

// 1. Pelanggan Files
const pelangganFiles = [
    'src/pages/pelanggan/profil.jsx',
    'src/pages/pelanggan/dashboard.jsx',
    'src/pages/pelanggan/riwayat-login.jsx',
    'src/pages/pelanggan/profil-tukang.jsx',
    'src/pages/pelanggan/pesanan.jsx',
    'src/pages/pelanggan/pembayaran.jsx',
    'src/pages/pelanggan/checkout.jsx',
    'src/pages/pelanggan/chat.jsx'
];
pelangganFiles.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
        replaceInFile(fullPath, [
            { from: 'localStorage.getItem("user")', to: 'localStorage.getItem("pelanggan_user")' },
            { from: 'localStorage.getItem("user_id")', to: 'localStorage.getItem("pelanggan_id")' },
            { from: 'localStorage.getItem("user_role")', to: 'localStorage.getItem("pelanggan_role")' },
            { from: 'localStorage.clear()', to: 'localStorage.removeItem("pelanggan_token"); localStorage.removeItem("pelanggan_user"); localStorage.removeItem("pelanggan_id"); localStorage.removeItem("pelanggan_role");' }
        ]);
    }
});

// 2. Tukang Files
const tukangFiles = [
    'src/pages/tukang/profil.jsx',
    'src/pages/tukang/dashboard.jsx',
    'src/pages/tukang/pesanan.jsx',
    'src/pages/tukang/chat.jsx'
];
tukangFiles.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
        replaceInFile(fullPath, [
            { from: 'localStorage.getItem("user")', to: 'localStorage.getItem("tukang_user")' },
            { from: 'localStorage.removeItem("user")', to: 'localStorage.removeItem("tukang_user")' },
            { from: 'localStorage.removeItem("token")', to: 'localStorage.removeItem("tukang_token")' },
            { from: 'localStorage.getItem("user_id")', to: 'localStorage.getItem("tukang_id")' }
        ]);
    }
});

// 3. Admin Files (Just in case)
const adminFiles = [
    'src/pages/admin/profil.jsx',
    'src/pages/admin/dashboard.jsx',
];
adminFiles.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
        replaceInFile(fullPath, [
            { from: 'localStorage.getItem("user")', to: 'localStorage.getItem("admin_user")' },
            { from: 'localStorage.getItem("user_id")', to: 'localStorage.getItem("admin_id")' },
            { from: 'localStorage.clear()', to: 'localStorage.removeItem("admin_token"); localStorage.removeItem("admin_user"); localStorage.removeItem("admin_id");' }
        ]);
    }
});

// 4. LogoutModal.jsx
const logoutModalPath = path.join(__dirname, 'src/components/LogoutModal.jsx');
if (fs.existsSync(logoutModalPath)) {
    replaceInFile(logoutModalPath, [
        { 
            from: 'localStorage.clear();', 
            to: `const path = window.location.pathname;
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
              }` 
        }
    ]);
}

console.log("Done");
