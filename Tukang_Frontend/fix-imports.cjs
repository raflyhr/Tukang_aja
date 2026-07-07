const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/pages/pelanggan');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(f => {
    const filePath = path.join(dir, f);
    let c = fs.readFileSync(filePath, 'utf8');
    
    // if it uses useEffect but only imports useState
    if (c.includes('useEffect') && c.includes('import { useState }')) {
        c = c.replace(/import { useState } from "react";/, 'import { useState, useEffect } from "react";');
        fs.writeFileSync(filePath, c, 'utf8');
        console.log('Fixed', f);
    }
});
