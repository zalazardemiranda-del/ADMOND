// Sube el numero de version (?v=...) de los archivos modificados para que los navegadores
// de los usuarios NO usen una copia vieja en cache. Uso: npm run bump
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "index.html");
let html = fs.readFileSync(htmlPath, "utf8");

const assets = ["styles.css", "supabase_config.js", "consecutivo_data.js", "schema.js", "app.js"];
for (const asset of assets) {
  const file = path.join(root, asset);
  if (!fs.existsSync(file)) continue;
  const hash = crypto.createHash("sha1").update(fs.readFileSync(file)).digest("hex").slice(0, 8);
  const re = new RegExp(`(${asset.replace(".", "\\.")})\\?v=[^"']*`, "g");
  const before = html;
  html = html.replace(re, `$1?v=${hash}`);
  if (html !== before) console.log(`${asset} -> v=${hash}`);
}

fs.writeFileSync(htmlPath, html);
