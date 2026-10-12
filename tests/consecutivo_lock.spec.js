// Pruebas para los requerimientos de Consecutivo:
// 1. Botones Editar y Guardar en Consecutivo (eliminados CSV y Agregar Factura)
// 2. Bloqueo en gris colaborativo y banner cuando otro usuario edita
// 3. Modificación exclusiva de la columna 'ST' (demás columnas solo lectura)
// 4. Estatus 'Pagados' activa asignación de fecha de pago y preparación para archivo
// 5. 'Cancelados' pasa a ser 'Por programar' (PROG)
// 6. Todas las operaciones empiezan por defecto en 'por cobrar' (C) y KPI cards reflejan 'por cobrar'

const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const supabaseUmd = fs.readFileSync(
  path.resolve(__dirname, "..", "node_modules", "@supabase", "supabase-js", "dist", "umd", "supabase.js"),
  "utf8"
);

async function mockNetwork(page, requests = []) {
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
    return route.abort();
  });
}

async function openAppAsAdmin(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await mockNetwork(page);
  await page.goto("/");
  await page.waitForFunction(() => window.appState && window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.client, null, { timeout: 15000 });
  await page.waitForTimeout(500);

  // Iniciar sesión como Gerente/Administrador y entrar a ficha consecutivo
  await page.evaluate(() => {
    window.appState.currentUser = { id: 'admin-user-1', email: 'admin@rodipack.com', nombre: 'Roberto Miranda', rol: 'gerente' };
    window.appState.currentRole = 'gerente';
    if (typeof window.hideGlobalLoginOverlay === 'function') window.hideGlobalLoginOverlay();
    if (typeof window.switchTab === 'function') window.switchTab('administracion');
    if (typeof window.switchAdminFicha === 'function') window.switchAdminFicha('consecutivo');
  });
  await page.waitForTimeout(500);
  return errors;
}

test("1. Consecutivo tiene botones Editar y Guardar y no tiene Exportar CSV ni Agregar Factura", async ({ page }) => {
  await openAppAsAdmin(page);

  const btnEdit = page.locator("#btn-edit-consecutivo");
  const btnSave = page.locator("#btn-save-consecutivo");

  await expect(btnEdit).toBeVisible();
  await expect(btnSave).toBeVisible();

  // Exportar CSV y Agregar Factura ya no deben existir
  await expect(page.locator("button:has-text('Exportar CSV')")).toHaveCount(0);
  await expect(page.locator("button:has-text('Agregar Factura')")).toHaveCount(0);
});

test("2. Modo Editar y Guardar activa y desactiva el modo de edición de Consecutivo", async ({ page }) => {
  await openAppAsAdmin(page);

  const btnEdit = page.locator("#btn-edit-consecutivo");
  const btnSave = page.locator("#btn-save-consecutivo");

  // Al inicio: Editar está habilitado, Guardar está deshabilitado
  await expect(btnEdit).toBeEnabled();
  await expect(btnSave).toBeDisabled();

  // Hacer clic en Editar
  await btnEdit.click();
  await page.waitForTimeout(300);

  // En modo edición: Editar queda deshabilitado (Editando...), Guardar habilitado
  await expect(btnSave).toBeEnabled();
  const isEditing = await page.evaluate(() => window.appState.isEditingConsecutivo);
  expect(isEditing).toBe(true);

  // Hacer clic en Guardar
  await btnSave.click();
  await page.waitForTimeout(300);

  // Vuelve a estar en modo lectura
  await expect(btnEdit).toBeEnabled();
  await expect(btnSave).toBeDisabled();
  const isEditingAfter = await page.evaluate(() => window.appState.isEditingConsecutivo);
  expect(isEditingAfter).toBe(false);
});

test("3. Bloqueo en gris colaborativo y banner cuando otro usuario edita Consecutivo", async ({ page }) => {
  await openAppAsAdmin(page);

  // Simular que otro usuario está editando Consecutivo
  await page.evaluate(() => {
    window.appState.consecutivoLockedBy = {
      userId: 'other-user-456',
      userName: 'Diego Miranda',
      timestamp: Date.now()
    };
    window.updateConsecutivoEditButtonsUI();
  });
  await page.waitForTimeout(300);

  const banner = page.locator("#consecutivo-lock-banner");
  await expect(banner).toBeVisible();
  await expect(banner).toContainText("Diego Miranda");

  const tableContainer = page.locator("#consecutivo-table-container");
  await expect(tableContainer).toHaveClass(/tabla-bloqueada-editando/);

  // Los botones deben estar bloqueados
  const btnEdit = page.locator("#btn-edit-consecutivo");
  await expect(btnEdit).toBeDisabled();
  await expect(btnEdit).toContainText("Bloqueado");

  // Simular que el otro usuario guardó y liberó
  await page.evaluate(() => {
    window.appState.consecutivoLockedBy = null;
    window.updateConsecutivoEditButtonsUI();
  });
  await page.waitForTimeout(300);

  await expect(banner).toBeHidden();
  await expect(tableContainer).not.toHaveClass(/tabla-bloqueada-editando/);
  await expect(btnEdit).toBeEnabled();
});

test("4. Columnas de Consecutivo son de solo lectura y solo ST es editable", async ({ page }) => {
  await openAppAsAdmin(page);

  // Agregar una fila de prueba
  await page.evaluate(() => {
    window.appState.consecutivo = [{
      consecutivo: 1,
      factura: 'FE-100',
      fechaEmision: '2026-10-12',
      cliente: 'CLIENTE PRUEBA',
      folioCliente: 'OC-999',
      subtotal: 10000,
      iva: 1600,
      total: 11600,
      st: 'C',
      fechaPago: '',
      referenciaOp: 'RDP-PRUEBA',
      servicio: 'Flete'
    }];
    window.renderConsecutivo();
  });
  await page.waitForTimeout(300);

  // Verificar que la tabla no contiene inputs editables en factura, cliente, subtotal, etc.
  const rowInputs = page.locator("#tbody-consecutivo tr input");
  await expect(rowInputs).toHaveCount(0);

  // Solo el trigger de ST está presente
  const stBadge = page.locator("#tbody-consecutivo .st-badge-trigger");
  await expect(stBadge).toBeVisible();
});

test("5. Estatus Pagados (P) añade automáticamente la fecha de pago", async ({ page }) => {
  await openAppAsAdmin(page);

  await page.evaluate(() => {
    window.appState.consecutivo = [{
      consecutivo: 1,
      factura: 'FE-200',
      fechaEmision: '2026-10-12',
      cliente: 'CLIENTE TEST',
      folioCliente: 'OC-123',
      subtotal: 5000,
      iva: 800,
      total: 5800,
      st: 'C',
      fechaPago: '',
      referenciaOp: 'RDP-200',
      servicio: 'Flete'
    }];
    window.startEditingConsecutivo();
  });
  await page.waitForTimeout(300);

  // Cambiar a estatus 'P' (Pagado)
  await page.evaluate(() => {
    window.selectStOption(0, 'P');
  });
  await page.waitForTimeout(300);

  // Verificar que se asignó fechaPago y el estatus es P
  const item = await page.evaluate(() => window.appState.consecutivo[0]);
  expect(item.st).toBe('P');
  expect(item.fechaPago).toBeTruthy();
});

test("6. Filtro Cancelados ahora es 'Por programar' (PROG) y las operaciones empiezan en 'por cobrar' (C)", async ({ page }) => {
  await openAppAsAdmin(page);

  // Verificar que el botón de filtro dice 'Por programar'
  const progBtn = page.locator(".consecutivo-filter-btn[data-st='PROG']");
  await expect(progBtn).toBeVisible();
  await expect(progBtn).toContainText("Por programar");

  // Sincronizar un proyecto desde Operaciones a Consecutivo y verificar que empieza en 'C'
  await page.evaluate(() => {
    const dummyOp = {
      id: 'RDP-NEW-OP',
      numProyecto: 'RDP-NEW-OP',
      generado: true,
      subtotal: 20000,
      iva: 3200,
      total: 23200,
      cliente: 'CLIENTE AUTO',
      servicioName: 'Servicio Local'
    };
    window.syncProjectToConsecutivo(dummyOp, true);
  });
  await page.waitForTimeout(300);

  const syncedItem = await page.evaluate(() => {
    return window.appState.consecutivo.find(c => c.referenciaOp === 'RDP-NEW-OP');
  });
  expect(syncedItem).toBeTruthy();
  expect(syncedItem.st).toBe('C');

  // KPI cards reflejan los montos de 'por cobrar'
  const kpiTotal = page.locator("#consecutivo-kpi-total");
  await expect(kpiTotal).toBeVisible();
  const kpiText = await kpiTotal.innerText();
  expect(kpiText).not.toBe("$0.00");
});
