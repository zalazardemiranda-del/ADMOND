// Pruebas en navegador real (Chromium). Supabase se SIMULA: nunca se toca la base de produccion.
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const supabaseUmd = fs.readFileSync(
  path.resolve(__dirname, "..", "node_modules", "@supabase", "supabase-js", "dist", "umd", "supabase.js"),
  "utf8"
);

async function mockNetwork(page, requests) {
  await page.route("**/*", async (route) => {
    const url = route.request().url();
    if (url.startsWith("http://localhost")) return route.continue();
    if (url.includes("cdn.jsdelivr.net/npm/@supabase/supabase-js")) {
      return route.fulfill({ contentType: "text/javascript", body: supabaseUmd });
    }
    if (url.includes("cdn.jsdelivr.net/npm/chart.js")) {
      return route.fulfill({
        contentType: "text/javascript",
        body: "window.Chart=function(){return {destroy(){},update(){},data:{},options:{}}};window.Chart.register=function(){};",
      });
    }
    if (url.includes(".supabase.co")) {
      requests.push({ method: route.request().method(), url, body: route.request().postData() });
      const isGet = route.request().method() === "GET";
      if (url.includes("/auth/v1/")) return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
      return route.fulfill({
        status: isGet ? 200 : 201,
        contentType: "application/json",
        headers: { "content-range": "*/0" },
        body: "[]",
      });
    }
    return route.abort(); // fuentes de Google, etc.
  });
}

async function openApp(page, requests = []) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await mockNetwork(page, requests);
  await page.goto("/");
  await page.waitForFunction(() => window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.client, null, { timeout: 15000 });
  await page.waitForTimeout(1500); // deja terminar el arranque asincrono
  return errors;
}

test("la app arranca sin errores JavaScript no controlados", async ({ page }) => {
  const errors = await openApp(page);
  expect(errors, errors.join("\n")).toEqual([]);
});

test("sin sesion se muestra la pantalla de login", async ({ page }) => {
  await openApp(page);
  await expect(page.locator("#login-global-email")).toBeVisible();
});

test("showCustomNotification / showStatusMessage existen y muestran un aviso", async ({ page }) => {
  await openApp(page);
  await page.evaluate(() => window.showStatusMessage("Correo enviado", "success"));
  await expect(page.locator(".rp-toast")).toContainText("Correo enviado");
});

test("syncOperacionesToCloud no lanza ReferenceError y guarda el snapshot en la nube", async ({ page }) => {
  const requests = [];
  const errors = await openApp(page, requests);
  const result = await page.evaluate(() => {
    try {
      window.syncOperacionesToCloud(true);
      return "ok";
    } catch (e) {
      return e.name + ": " + e.message;
    }
  });
  expect(result).toBe("ok");
  await page.waitForTimeout(800);
  const snapshot = requests.find(
    (r) => r.method === "POST" && r.url.includes("/rest/v1/messages") && (r.body || "").includes("__cloud_sync_operaciones__")
  );
  expect(snapshot, "no se envio el snapshot de operaciones").toBeTruthy();
  expect(errors).toEqual([]);
});

test("el chat se carga excluyendo filas internas y pidiendo las mas recientes (limite 1000)", async ({ page }) => {
  const requests = [];
  await openApp(page, requests);
  const msgReq = requests.find((r) => r.method === "GET" && r.url.includes("/rest/v1/messages?select=*"));
  expect(msgReq, "no se consulto messages").toBeTruthy();
  expect(decodeURIComponent(msgReq.url)).toContain("chat_id=not.like.\\_\\_%");
  expect(msgReq.url).toContain("order=created_at.desc");
  expect(msgReq.url).toContain("limit=1000");
});

test("el borrado de un expediente envia el DELETE a la nube", async ({ page }) => {
  const requests = [];
  await openApp(page, requests);
  await page.evaluate(() => {
    window.confirm = () => true;
    appState.operacionesProyectos = [{ id: "RDP-TEST-1", consecutivo: "RDP-TEST-1" }];
    window.eliminarProyectoOperaciones("RDP-TEST-1");
  });
  await page.waitForTimeout(800);
  const del = requests.find((r) => r.method === "DELETE" && r.url.includes("/rest/v1/operaciones"));
  expect(del, "no se envio DELETE a operaciones").toBeTruthy();
});
