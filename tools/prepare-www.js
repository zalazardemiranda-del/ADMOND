const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const www = path.join(root, 'www');

if (!fs.existsSync(www)) {
    fs.mkdirSync(www, { recursive: true });
}

const files = [
    'index.html',
    'app.js',
    'styles.css',
    'schema.js',
    'supabase_config.js',
    'consecutivo_data.js',
    'Logo interno.png',
    'logo sin fondo.png',
    'fondo sistema.png'
];

for (const file of files) {
    const src = path.join(root, file);
    const dest = path.join(www, file);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
    }
}
console.log('✓ Archivos web preparados exitosamente en carpeta www/');
