// Pruebas estaticas (sin navegador): detectan clases de bugs ya encontrados para que no vuelvan.
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");

test("los archivos JS tienen sintaxis valida", () => {
  for (const f of ["app.js", "schema.js", "supabase_config.js", "consecutivo_data.js"]) {
    expect(() => new Function(read(f)), `${f} no compila`).not.toThrow();
  }
});

test("no se encadena .catch() sobre consultas de Supabase (los builders no tienen .catch y la peticion nunca se envia)", () => {
  const src = read("app.js");
  const re = /\.from\('([a-z_]+)'\)([^;]*?);/g;
  const bad = [];
  let m;
  while ((m = re.exec(src))) {
    if (/\.catch\(/.test(m[2])) bad.push(`linea ${src.slice(0, m.index).split("\n").length} (${m[1]})`);
  }
  expect(bad, `Usa .then(ok, err) en lugar de .catch: ${bad.join(", ")}`).toEqual([]);
});

test("toda consulta delete/update/upsert/insert se ejecuta (await, return o .then)", () => {
  const src = read("app.js");
  const re = /(\S[^\n]{0,60})\.from\('([a-z_]+)'\)\??\.(delete|update|upsert|insert)\(([^;]*?);/g;
  const lazy = [];
  let m;
  while ((m = re.exec(src))) {
    const before = m[1];
    const chain = m[4];
    if (!/await\s|return\s|=\s*$|\(\s*$/.test(before + " ") && !/\.then\(/.test(chain) && !/^\s*await/.test(before)) {
      lazy.push(`linea ${src.slice(0, m.index).split("\n").length} (${m[2]}.${m[3]})`);
    }
  }
  expect(lazy, `Consultas que nunca se ejecutan: ${lazy.join(", ")}`).toEqual([]);
});

test("las consultas de lectura de messages no pueden quedar sin limite ni filtro (limite de 1000 filas)", () => {
  const src = read("app.js");
  expect(src).not.toMatch(/from\('messages'\)\.select\('\*'\)\.order\('created_at', \{ ascending: true \}\)/);
});

test("index.html referencia scripts locales que existen", () => {
  const html = read("index.html");
  const refs = [...html.matchAll(/<(?:script|link)[^>]+(?:src|href)="([^"?#]+)[^"]*"/g)].map((m) => m[1]);
  const local = refs.filter((r) => !/^https?:/.test(r));
  expect(local.length).toBeGreaterThan(0);
  for (const r of local) expect(fs.existsSync(path.join(root, r)), `${r} no existe`).toBeTruthy();
});

test("las migraciones SQL existen y la de seguridad esta marcada como no ejecutar aun", () => {
  const dir = path.join(root, "supabase", "migrations");
  const files = fs.readdirSync(dir);
  expect(files.some((f) => f.startsWith("001_"))).toBeTruthy();
  expect(files.some((f) => f.startsWith("002_"))).toBeTruthy();
});
