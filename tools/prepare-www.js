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
    'firebase_config.js',
    'consecutivo_data.js',
    'Logo interno.png',
    'logo sin fondo.png',
    'fondo sistema.png',
    'CNAME'
];

for (const file of files) {
    const src = path.join(root, file);
    const dest = path.join(www, file);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
    }
}
console.log('✓ Archivos web preparados exitosamente en carpeta www/');

// Version para auto-actualizacion de clientes (version.json)
const crypto = require('crypto');
try {
    const hash = crypto.createHash('md5');
    ['index.html','app.js','styles.css','schema.js','firebase_config.js','consecutivo_data.js'].forEach(f => {
        const p = path.join(www, f);
        if (fs.existsSync(p)) hash.update(fs.readFileSync(p));
    });
    fs.writeFileSync(path.join(www, 'version.json'), JSON.stringify({ version: hash.digest('hex'), built: new Date().toISOString() }));
    console.log('✓ version.json generado');
} catch (e) { console.warn('No se pudo generar version.json', e); }
