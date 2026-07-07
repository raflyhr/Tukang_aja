const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/pages/pelanggan');

const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx') && f !== 'dashboard.jsx');

const sidebarRegex = /<div className="flex items-center gap-3 min-w-0">[\s\S]*?<div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant\/30 shrink-0">[\s\S]*?<img[\s\S]*?alt="Reze Profile"[\s\S]*?src="https:\/\/i\.pinimg\.com\/736x\/3a\/5f\/ec\/3a5fec637c8a8850f6e2732cf42f5c67\.jpg"[\s\S]*?\/>[\s\S]*?<\/div>[\s\S]*?<div className="min-w-0">[\s\S]*?<h4 className="font-bold text-sm text-on-surface truncate">Reze<\/h4>[\s\S]*?<p className="text-xs text-on-surface-variant\/60 truncate">chaostknight483@gmail\.com<\/p>[\s\S]*?<\/div>[\s\S]*?<\/div>/;

const headerRegex = /<div className="h-10 w-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant\/30 ml-2">[\s\S]*?<img[\s\S]*?className="w-full h-full object-cover"[\s\S]*?alt="Reze Profile"[\s\S]*?src="https:\/\/i\.pinimg\.com\/736x\/3a\/5f\/ec\/3a5fec637c8a8850f6e2732cf42f5c67\.jpg"[\s\S]*?\/>[\s\S]*?<\/div>/;

const sidebarReplacement = `<div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/30 shrink-0">
                <img
                  className="w-full h-full object-cover"
                  alt="User Profile"
                  src={user && user.foto_profil ? (user.foto_profil.startsWith("http") ? user.foto_profil : \`http://127.0.0.1:8000/storage/\${user.foto_profil}\`) : \`https://ui-avatars.com/api/?name=\${user ? user.name : 'Pelanggan'}&background=random\`}
                />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-on-surface truncate">{user ? user.name : "Memuat..."}</h4>
                <p className="text-xs text-on-surface-variant/60 truncate">{user ? user.email : ""}</p>
              </div>
            </div>`;

const headerReplacement = `<div className="h-10 w-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/30 ml-2">
              <img
                className="w-full h-full object-cover"
                alt="User Profile"
                src={user && user.foto_profil ? (user.foto_profil.startsWith("http") ? user.foto_profil : \`http://127.0.0.1:8000/storage/\${user.foto_profil}\`) : \`https://ui-avatars.com/api/?name=\${user ? user.name : 'Pelanggan'}&background=random\`}
              />
            </div>`;

const stateLogic = `
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const userObj = parsed.user || parsed;
        setUser(userObj);
      } catch (error) {
        console.error("Gagal parse data user:", error);
      }
    } else {
      navigate("/");
    }
  }, [navigate]);
`;

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace the HTML blocks
    let modified = false;
    if (sidebarRegex.test(content)) {
        content = content.replace(sidebarRegex, sidebarReplacement);
        modified = true;
    }
    if (headerRegex.test(content)) {
        content = content.replace(headerRegex, headerReplacement);
        modified = true;
    }

    if (modified) {
        // Add the logic
        // Find component function definition
        const componentMatch = content.match(/function\s+([A-Z]\w+)\s*\([^)]*\)\s*\{/);
        if (componentMatch) {
            const funcName = componentMatch[1];
            // Insert state logic after navigate definition or at top of function
            const navigateMatch = content.match(/const\s+navigate\s*=\s*useNavigate\(\);\s*/);
            
            if (navigateMatch) {
                // If the state logic is not already there
                if (!content.includes('const [user, setUser] = useState')) {
                    content = content.replace(navigateMatch[0], navigateMatch[0] + stateLogic + '\n');
                }
            } else {
                // Add navigate and logic
                const funcDef = componentMatch[0];
                if (!content.includes('const [user, setUser] = useState')) {
                    content = content.replace(funcDef, funcDef + '\n  const navigate = useNavigate();' + stateLogic);
                }
            }
        }

        // Add imports if needed
        if (!content.includes('import { useState, useEffect }') && (!content.match(/import\s+.*useState/))) {
            if (content.includes('import {')) {
                // just let it be or add it
                content = `import { useState, useEffect } from "react";\n` + content;
            }
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("Updated", file);
    }
});
