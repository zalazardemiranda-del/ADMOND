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

const firebaseMock = fs.readFileSync(
  path.resolve(__dirname, "firebase-mock.js"),
  "utf8"
);

async function mockNetwork(page, requests = []) {
  await page.addInitScript(() => {
    const OrigWS = window.WebSocket;
    window.WebSocket = function (url, protocols) {
      if (url && (String(url).includes("supabase.co") || String(url).includes("firebase"))) {
        return {
          readyState: 1,
          send() {},
          close() {},
          addEventListener() {},
          removeEventListener() {},
        };
      }
      return new OrigWS(url, protocols);
    };
    window.WebSocket.CONNECTING = 0;
    window.WebSocket.OPEN = 1;
    window.WebSocket.CLOSING = 2;
    window.WebSocket.CLOSED = 3;
  });
  await page.route("**/*", async (route) => {
    const url = route.request().url();
    if (url.startsWith("http://localhost")) return route.continue();
    if (url.includes("cdn.jsdelivr.net/npm/chart.js")) {
      return route.fulfill({
        contentType: "text/javascript",
        body: "window.Chart=function(ctx,cfg){return {canvas:ctx&&ctx.canvas,destroy(){},update(){},data:(cfg&&cfg.data)||{},options:(cfg&&cfg.options)||{}}};window.Chart.register=function(){};",
      });
    }
    if (url.includes("firebasejs")) {
      return route.fulfill({
        contentType: "text/javascript",
        body: firebaseMock,
      });
    }
    if (url.includes(".supabase.co") || url.includes("firebaseapp.com/api")) {
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
    const adminUser = { id: 'admin-user-1', email: 'admin@rodipack.com', nombre: 'Roberto Miranda', rol: 'gerente' };
    localStorage.setItem('rp_session_active', 'true');
    localStorage.setItem('rp_auth_epoch', '20261015_SEC_EPOCH_V1');
    localStorage.setItem('rp_logged_user', JSON.stringify(adminUser));
    window.appState.currentUser = adminUser;
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
      referenciaOp: 'RDP2610901-F',
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
  await expect(stBadge.first()).toBeVisible();
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
      referenciaOp: 'RDP2610902-F',
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

test("6. Sin Estatus eliminado y todos los proyectos por defecto empiezan en 'PP' (Por programar)", async ({ page }) => {
  await openAppAsAdmin(page);

  // Verificar que el botón de filtro dice 'PP'
  const ppBtn = page.locator(".consecutivo-filter-btn[data-st='PP']");
  await expect(ppBtn).toBeVisible();
  await expect(ppBtn).toContainText("PP");

  // Sincronizar un proyecto desde Operaciones a Consecutivo y verificar que empieza en 'PP' (Por programar)
  await page.evaluate(() => {
    const dummyOp = {
      id: 'RDP2610903-F',
      numProyecto: 'RDP2610903-F',
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
    return window.appState.consecutivo.find(c => c.referenciaOp === 'RDP2610903-F');
  });
  expect(syncedItem).toBeTruthy();
  expect(syncedItem.st).toBe('PP');

  // Verificar que ya NO existe la opción "Sin Estatus" en el menú desplegable
  const sinEstatusCount = await page.locator("#tbody-consecutivo .st-dropdown-menu .option-name:has-text('Sin Estatus')").count();
  expect(sinEstatusCount).toBe(0);

  // KPI cards reflejan los montos de 'por cobrar' + 'por programar'
  const kpiTotal = page.locator("#consecutivo-kpi-total");
  await expect(kpiTotal).toBeVisible();
  const kpiText = await kpiTotal.innerText();
  expect(kpiText).not.toBe("$0.00");
});

test("7. Cambiar estatus asigna fecha de pago, preserva el filtro activo y no cambia de filtro automáticamente", async ({ page }) => {
  await openAppAsAdmin(page);

  // Cargar registro de prueba con estatus PP bajo el filtro Todos
  await page.evaluate(() => {
    window.appState.consecutivo = [{
      consecutivo: 1,
      factura: 'FE-555',
      fechaEmision: '2026-10-12',
      cliente: 'CLIENTE PP TEST',
      folioCliente: 'OC-555',
      subtotal: 8000,
      iva: 1280,
      total: 9280,
      st: 'PP',
      fechaPago: '',
      referenciaOp: 'RDP2610904-F',
      servicio: 'Flete Local'
    }];
    window.filterConsecutivoByST('all');
    window.startEditingConsecutivo();
  });
  await page.waitForTimeout(300);

  // Verificar que el filtro Todos está activo
  const activeFilterBtnBefore = page.locator(".consecutivo-filter-btn.active");
  await expect(activeFilterBtnBefore).toHaveAttribute("data-st", "all");

  // Verificar que la fila con badge PP es visible
  const ppBadge = page.locator("#tbody-consecutivo .st-badge-trigger.st-badge-pp");
  await expect(ppBadge).toBeVisible();
  await expect(ppBadge).toContainText("PP");

  // Abrir el menú dropdown de ST
  await ppBadge.click();
  await page.waitForTimeout(200);

  // Verificar que el menú se abre y contiene las opciones
  const menu = page.locator("#st-menu-0");
  await expect(menu).toBeVisible();
  await expect(menu.locator(".option-name:has-text('Por programar (PP)')")).toBeVisible();
  await expect(menu.locator(".option-name:has-text('Pagado (P)')")).toBeVisible();

  // Simular que corre fetchConsecutivoFromCloud en segundo plano y verificar que NO cierra el dropdown
  await page.evaluate(async () => {
    if (typeof window.fetchConsecutivoFromCloud === 'function') {
      await window.fetchConsecutivoFromCloud();
    }
  });
  await page.waitForTimeout(300);
  await expect(menu).toBeVisible();

  // Seleccionar la opción 'Pagado (P)'
  const optionP = menu.locator(".st-dropdown-option:has-text('Pagado (P)')");
  await optionP.click();
  await page.waitForTimeout(300);

  // El filtro NO debe cambiar automáticamente: sigue siendo Todos
  const activeFilterBtnAfter = page.locator(".consecutivo-filter-btn.active");
  await expect(activeFilterBtnAfter).toHaveAttribute("data-st", "all");

  // La fila sigue visible en la tabla con el badge P y fecha asignada
  const pBadge = page.locator("#tbody-consecutivo .st-badge-trigger.st-badge-p");
  await expect(pBadge).toBeVisible();
  await expect(pBadge).toContainText("P");

  const row = await page.evaluate(() => window.appState.consecutivo[0]);
  expect(row.st).toBe("P");
  expect(row.fechaPago).toBeTruthy();
});

test("8. Cambiar de P a C quita la fecha de pago y los cambios solo se guardan al dar clic en Guardar (Consecutivo y Proveedores)", async ({ page }) => {
  await openAppAsAdmin(page);

  // 1. Preparar registro inicial guardado en localStorage con estatus C y sin fecha
  await page.evaluate(() => {
    const initialList = [{
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
      referenciaOp: 'RDP2610905-F',
      servicio: 'Flete'
    }];
    window.appState.consecutivo = JSON.parse(JSON.stringify(initialList));
    localStorage.setItem('rp_consecutivo_data', JSON.stringify(initialList));
    window.renderConsecutivo();
    window.startEditingConsecutivo();
  });
  await page.waitForTimeout(200);

  // 2. Cambiar a P -> debe agregar fechaPago en memoria, pero NO guardar aún en localStorage
  await page.evaluate(() => {
    window.selectStOption(0, 'P');
  });
  await page.waitForTimeout(200);

  const inMemoryAfterP = await page.evaluate(() => window.appState.consecutivo[0]);
  expect(inMemoryAfterP.st).toBe('P');
  expect(inMemoryAfterP.fechaPago).toBeTruthy();

  const storedBeforeSave = await page.evaluate(() => JSON.parse(localStorage.getItem('rp_consecutivo_data'))[0]);
  expect(storedBeforeSave.st).toBe('C');
  expect(storedBeforeSave.fechaPago).toBe('');

  // 3. Cambiar de P a C -> debe QUITAR la fecha de pago
  await page.evaluate(() => {
    window.selectStOption(0, 'C');
  });
  await page.waitForTimeout(200);

  const inMemoryAfterC = await page.evaluate(() => window.appState.consecutivo[0]);
  expect(inMemoryAfterC.st).toBe('C');
  expect(inMemoryAfterC.fechaPago).toBe('');

  // 4. Volver a cambiar a P y dar clic en Guardar -> ahora SÍ se guarda en localStorage
  await page.evaluate(() => {
    window.selectStOption(0, 'P');
  });
  await page.locator("#btn-save-consecutivo").click();
  await page.waitForTimeout(300);

  const storedAfterSave = await page.evaluate(() => JSON.parse(localStorage.getItem('rp_consecutivo_data'))[0]);
  expect(storedAfterSave.st).toBe('P');
  expect(storedAfterSave.fechaPago).toBeTruthy();

  // 5. Verificar en Proveedores que tampoco se guarda hasta dar clic en Guardar y que al cambiar a PROG se quita la fecha
  await page.evaluate(() => {
    window.switchAdminFicha('proveedores');
    const initialProv = [{
      op: 'RDP2610906-F',
      fecha: '2026-10-12',
      proveedor: 'PROVEEDOR TEST',
      subtotal: 5000,
      iva: 800,
      total: 5800,
      p: 'PROG',
      estatus: 'PROG',
      fechaPago: ''
    }];
    window.appState.proveedores = JSON.parse(JSON.stringify(initialProv));
    localStorage.setItem('rp_proveedores_data', JSON.stringify(initialProv));
    window.startEditingProveedores();
    window.updateProveedorCell(0, 'p', 'PAGADO');
  });
  await page.waitForTimeout(200);

  const provInMemAfterPagado = await page.evaluate(() => window.appState.proveedores[0]);
  expect(provInMemAfterPagado.p).toBe('PAGADO');
  expect(provInMemAfterPagado.fechaPago).toBeTruthy();

  const provStoredBeforeSave = await page.evaluate(() => JSON.parse(localStorage.getItem('rp_proveedores_data'))[0]);
  expect(provStoredBeforeSave.p).toBe('PROG');

  // Cambiar de PAGADO a PROG (Programar a pago) en Proveedores -> quita la fecha de pago
  await page.evaluate(() => {
    window.updateProveedorCell(0, 'p', 'PROG');
  });
  await page.waitForTimeout(200);
  const provInMemAfterProg = await page.evaluate(() => window.appState.proveedores[0]);
  expect(provInMemAfterProg.p).toBe('PROG');
  expect(provInMemAfterProg.fechaPago).toBe('');

  // Volver a PAGADO y dar clic en Guardar
  await page.evaluate(() => {
    window.updateProveedorCell(0, 'p', 'PAGADO');
  });
  await page.locator("#btn-save-proveedores").click();
  await page.waitForTimeout(300);

  const provStoredAfterSave = await page.evaluate(() => JSON.parse(localStorage.getItem('rp_proveedores_data'))[0]);
  expect(provStoredAfterSave.p).toBe('PAGADO');
  expect(provStoredAfterSave.fechaPago).toBeTruthy();
});

test("9. Operaciones detalle tiene pasos 1-4 abajo en forma de botones con borde rectangular, sin Anterior/Continuar, y 3 botones superiores (Editar, Guardar, Regresar a operaciones)", async ({ page }) => {
  await openAppAsAdmin(page);

  await page.evaluate(() => {
    window.switchAdminFicha('operaciones');
    const testProj = {
      id: 'RDP2610950-F',
      numProyecto: 'RDP2610950-F',
      consecutivo: 'RDP2610950-F',
      numConsecutivo: 'RDP2610950-F',
      fechaInicio: '2026-10-12',
      fechaInicioDisplay: '12/10/2026',
      numFactura: 'FE-950',
      factura: 'FE-950',
      numOC: 'OC-950',
      cliente: 'CLIENTE OPERACIONES',
      estatus: 'PENDIENTE',
      generado: true,
      tipoProyecto: 'servicio_local',
      infoViaje: { terminal: 'Manzanillo', mblMawb: 'MBL123', destino: 'CDMX', observaciones: 'Inicial' },
      contenedores: [{ id: 1, label: 'Contenedor 1', numContenedor: 'CONT-001' }]
    };
    window.appState.operacionesProyectos = [testProj];
    localStorage.setItem('rp_operaciones_proyectos', JSON.stringify([testProj]));
    window.renderOperaciones();
    window.openOperacionesDetail('RDP2610950-F');
  });
  await page.waitForTimeout(300);

  // 1. Verificar los 3 botones superiores: Editar, Guardar, Regresar a operaciones
  const btnEdit = page.locator("#btn-edit-op-detail");
  const btnSave = page.locator("#btn-save-op-detail");
  const btnBack = page.locator("#btn-back-op-detail");

  await expect(btnEdit).toBeVisible();
  await expect(btnEdit).toContainText("Editar");
  await expect(btnEdit).toBeEnabled();

  await expect(btnSave).toBeVisible();
  await expect(btnSave).toContainText("Guardar");
  await expect(btnSave).toBeDisabled();

  await expect(btnBack).toBeVisible();
  await expect(btnBack).toContainText("Regresar a operaciones");
  await expect(btnBack).toBeEnabled();

  // 2. Verificar que los botones ANTERIOR y CONTINUAR fueron eliminados de los pasos
  await expect(page.locator("#operaciones-view-detail button:has-text('CONTINUAR')")).toHaveCount(0);
  await expect(page.locator("#operaciones-view-detail button:has-text('ANTERIOR')")).toHaveCount(0);

  // 3. Verificar que los pasos 1, 2, 3 y 4 están abajo como botones con margen/borde rectangular
  const bottomStepper = page.locator("#op-bottom-stepper");
  await expect(bottomStepper).toBeVisible();

  for (let i = 1; i <= 4; i++) {
    const stepBtn = page.locator(`#op-step-indicator-${i}`);
    await expect(stepBtn).toBeVisible();
    const tagName = await stepBtn.evaluate(el => el.tagName.toLowerCase());
    expect(tagName).toBe("button");
    const borderStyle = await stepBtn.evaluate(el => window.getComputedStyle(el).borderStyle);
    expect(borderStyle).toBe("solid");
  }

  // Navegar entre pasos dando clic directamente en los botones 1, 2, 3 y 4 de abajo
  await page.locator("#op-step-indicator-2").click();
  await expect(page.locator("#op-step-pane-2")).toBeVisible();
  await page.locator("#op-step-indicator-3").click();
  await expect(page.locator("#op-step-pane-3")).toBeVisible();
  await page.locator("#op-step-indicator-4").click();
  await expect(page.locator("#op-step-pane-4")).toBeVisible();
  await page.locator("#op-step-indicator-1").click();
  await expect(page.locator("#op-step-pane-1")).toBeVisible();
});

test("10. Reglas de bloqueo y edición en Operaciones: fila gris para otros usuarios, edición solo al dar clic en Editar, guardado solo con Guardar, liberación al Regresar a operaciones", async ({ page }) => {
  await openAppAsAdmin(page);

  await page.evaluate(() => {
    window.switchAdminFicha('operaciones');
    const testProj = {
      id: 'RDP2610951-F',
      numProyecto: 'RDP2610951-F',
      consecutivo: 'RDP2610951-F',
      numConsecutivo: 'RDP2610951-F',
      fechaInicio: '2026-10-12',
      fechaInicioDisplay: '12/10/2026',
      numFactura: 'FE-951',
      factura: 'FE-951',
      numOC: 'OC-951',
      cliente: 'CLIENTE REGLAS',
      estatus: 'PENDIENTE',
      generado: true,
      tipoProyecto: 'servicio_local',
      infoViaje: { terminal: 'Veracruz', mblMawb: 'MBL-951', destino: 'Monterrey', observaciones: '' },
      contenedores: [{ id: 1, label: 'Contenedor 1', numContenedor: 'CONT-951' }]
    };
    window.appState.operacionesProyectos = [testProj];
    localStorage.setItem('rp_operaciones_proyectos', JSON.stringify([testProj]));
    window.renderOperaciones();
  });
  await page.waitForTimeout(200);

  // 1. Cuando otro usuario tiene abierto el proyecto, aparece en gris y dice "El proyecto está siendo editado por (nombre)"
  await page.evaluate(() => {
    window.handleIncomingOperacionesProjectLock({
      projectId: 'RDP2610951-F',
      isLocked: true,
      userId: 'user-maria-2',
      userName: 'Maria Perez',
      clientId: 'client_other_999',
      timestamp: Date.now()
    });
  });
  await page.waitForTimeout(200);

  const lockedRow = page.locator("#tbody-operaciones-proyectos tr[data-op-id='RDP2610951-F']");
  await expect(lockedRow).toHaveClass(/op-row-locked/);
  await expect(lockedRow).toContainText("El proyecto está siendo editado por Maria Perez");
  const lockedBtn = lockedRow.locator(".btn-op-abrir");
  await expect(lockedBtn).toBeDisabled();
  await expect(lockedBtn).toContainText("BLOQUEADO");

  // 2. El otro usuario da clic en "Regresar a operaciones" y libera el bloqueo
  await page.evaluate(() => {
    window.handleIncomingOperacionesProjectLock({
      projectId: 'RDP2610951-F',
      isLocked: false,
      userId: 'user-maria-2',
      userName: 'Maria Perez',
      clientId: 'client_other_999',
      timestamp: Date.now()
    });
  });
  await page.waitForTimeout(200);

  await expect(lockedRow).not.toHaveClass(/op-row-locked/);
  await expect(lockedRow.locator(".btn-op-abrir")).toBeEnabled();

  // 3. Nuestro usuario da clic en "Abrir" -> entra en modo solo lectura (no puede editar sin dar clic en "Editar")
  await lockedRow.locator(".btn-op-abrir").click();
  await page.waitForTimeout(200);

  await expect(page.locator("#operaciones-view-detail")).toHaveClass(/op-detail-readonly/);
  await page.locator("#op-step-indicator-2").click();
  await expect(page.locator("#op-step1-factura-num")).toBeDisabled();

  // Intentar modificar sin haber dado clic en "Editar" -> es ignorado
  await page.evaluate(() => {
    window.updateProjectHeaderField('numFactura', 'FE-NO-PERMITIDO');
  });
  const facBeforeEdit = await page.evaluate(() => window.appState.operacionesProyectos[0].numFactura);
  expect(facBeforeEdit).toBe("FE-951");

  // 4. Dar clic en "Editar" -> habilita la edición, pero NO guarda en localStorage hasta dar clic en "Guardar"
  await page.locator("#btn-edit-op-detail").click();
  await page.waitForTimeout(200);
  await expect(page.locator("#operaciones-view-detail")).not.toHaveClass(/op-detail-readonly/);
  await expect(page.locator("#op-step1-factura-num")).toBeEnabled();

  await page.evaluate(() => {
    window.updateProjectHeaderField('numFactura', 'FE-TEMPORAL');
  });
  const storedBeforeSave = await page.evaluate(() => JSON.parse(localStorage.getItem('rp_operaciones_proyectos'))[0].numFactura);
  expect(storedBeforeSave).toBe("FE-951");

  // Si da clic en "Regresar a operaciones" SIN dar clic en "Guardar", se descartan los cambios no guardados
  await page.locator("#btn-back-op-detail").click();
  await page.waitForTimeout(200);

  const facAfterCancel = await page.evaluate(() => window.appState.operacionesProyectos[0].numFactura);
  expect(facAfterCancel).toBe("FE-951");

  // 5. Volver a abrir, dar clic en "Editar", modificar y dar clic en "Guardar" -> ahora SÍ se guarda
  await page.locator("#tbody-operaciones-proyectos .btn-op-abrir").first().click();
  await page.locator("#btn-edit-op-detail").click();
  await page.evaluate(() => {
    window.updateProjectHeaderField('numFactura', 'FE-GUARDADO-OK');
  });
  await page.locator("#btn-save-op-detail").click();
  await page.waitForTimeout(200);

  const storedAfterSave = await page.evaluate(() => JSON.parse(localStorage.getItem('rp_operaciones_proyectos'))[0].numFactura);
  expect(storedAfterSave).toBe("FE-GUARDADO-OK");

  // Regresar a operaciones libera el bloqueo del proyecto
  await page.locator("#btn-back-op-detail").click();
  await page.waitForTimeout(200);
  const activeLockAfterBack = await page.evaluate(() => window.getOperacionesProjectLock('RDP2610951-F'));
  expect(activeLockAfterBack).toBeNull();
});

test("11. Condición de carrera (el que dio clic antes se queda) y expulsión por actualización en línea (suelta los globos)", async ({ page }) => {
  await openAppAsAdmin(page);

  await page.evaluate(() => {
    window.switchAdminFicha('operaciones');
    const testProj = {
      id: 'RDP2610952-F',
      numProyecto: 'RDP2610952-F',
      consecutivo: 'RDP2610952-F',
      numConsecutivo: 'RDP2610952-F',
      fechaInicio: '2026-10-12',
      fechaInicioDisplay: '12/10/2026',
      numFactura: 'FE-952',
      factura: 'FE-952',
      numOC: 'OC-952',
      cliente: 'CLIENTE CARRERA',
      estatus: 'PENDIENTE',
      generado: true,
      tipoProyecto: 'servicio_local',
      infoViaje: { terminal: 'Manzanillo', mblMawb: 'MBL-952', destino: 'Guadalajara', observaciones: '' },
      contenedores: [{ id: 1, label: 'Contenedor 1', numContenedor: 'CONT-952' }]
    };
    window.appState.operacionesProyectos = [testProj];
    localStorage.setItem('rp_operaciones_proyectos', JSON.stringify([testProj]));
    window.renderOperaciones();
    window.openOperacionesDetail('RDP2610952-F');
  });
  await page.waitForTimeout(200);

  // Caso A: Otro usuario dio clic DESPUÉS (timestamp mayor) -> nuestro usuario dio clic antes y conserva el proyecto abierto
  await page.evaluate(() => {
    const myTs = window.appState._myActiveProjectLock.timestamp;
    window.handleIncomingOperacionesProjectLock({
      projectId: 'RDP2610952-F',
      isLocked: true,
      userId: 'user-late',
      userName: 'Usuario Tardio',
      clientId: 'client_late_999',
      timestamp: myTs + 500
    });
  });
  await page.waitForTimeout(200);
  await expect(page.locator("#operaciones-view-detail")).toBeVisible();

  // Caso B: Otro usuario dio clic ANTES (timestamp menor) -> el sistema deja adentro al que dio clic antes y saca al segundo a la lista
  await page.evaluate(() => {
    const myTs = window.appState._myActiveProjectLock.timestamp;
    window.handleIncomingOperacionesProjectLock({
      projectId: 'RDP2610952-F',
      isLocked: true,
      userId: 'user-early',
      userName: 'Diego Miranda',
      clientId: 'client_early_001',
      timestamp: myTs - 500
    });
  });
  await page.waitForTimeout(200);
  await expect(page.locator("#operaciones-view-detail")).toBeHidden();
  await expect(page.locator("#operaciones-view-list")).toBeVisible();
  await expect(page.locator("#tbody-operaciones-proyectos tr[data-op-id='RDP2610952-F']")).toContainText("El proyecto está siendo editado por Diego Miranda");

  // Caso C: Actualización en línea ("suelta los globos") saca a los usuarios de los proyectos, limpia bloqueos y después los deja volver a entrar
  await page.evaluate(async () => {
    await window.triggerSystemReleaseEviction();
  });
  await page.waitForTimeout(200);

  // El bloqueo se limpió y el usuario puede volver a entrar al proyecto actualizado
  const rowAfterRelease = page.locator("#tbody-operaciones-proyectos tr[data-op-id='RDP2610952-F']");
  await expect(rowAfterRelease).not.toHaveClass(/op-row-locked/);
  await rowAfterRelease.locator(".btn-op-abrir").click();
  await page.waitForTimeout(200);
  await expect(page.locator("#operaciones-view-detail")).toBeVisible();
});

test("12. Proveedores elimina filtros Por pagar y Cancelados dejando Programar a pago por defecto, y Consecutivo tiene sección Archivo para Pagados", async ({ page }) => {
  await openAppAsAdmin(page);

  // 1. Verificar en Consecutivo la sección "Archivo"
  const archivoBtn = page.locator("#btn-consecutivo-archivo");
  await expect(archivoBtn).toBeVisible();
  await expect(archivoBtn).toContainText("Archivo");

  await page.evaluate(() => {
    window.appState.consecutivo = [
      { consecutivo: 1, factura: 'FE-701', fechaEmision: '2026-10-12', cliente: 'CLIENTE PAGADO', subtotal: 5000, iva: 800, total: 5800, st: 'P', fechaPago: '2026-10-12', referenciaOp: 'RDP-P-1' },
      { consecutivo: 2, factura: 'FE-702', fechaEmision: '2026-10-12', cliente: 'CLIENTE PP', subtotal: 10000, iva: 1600, total: 11600, st: 'PP', fechaPago: '', referenciaOp: 'RDP-PP-2' }
    ];
    window.renderConsecutivo();
  });
  await page.waitForTimeout(200);

  // Al dar clic en Archivo, deben mostrarse únicamente los archivos en "Pagados" (P)
  await archivoBtn.click();
  await page.waitForTimeout(200);
  await expect(page.locator("#consecutivo-archivo-banner")).toBeVisible();
  const rowsInArchivo = page.locator("#tbody-consecutivo tr");
  await expect(rowsInArchivo).toHaveCount(1);
  await expect(rowsInArchivo.first()).toContainText("FE-701");

  // 2. Ir a Proveedores y verificar que NO existen los filtros 'Por pagar' ni 'Cancelado'
  await page.evaluate(() => window.switchAdminFicha('proveedores'));
  await page.waitForTimeout(200);

  await expect(page.locator("#btn-status-filter-p")).toHaveCount(0);
  await expect(page.locator("#btn-status-filter-cancelado")).toHaveCount(0);
  await expect(page.locator("#btn-status-filter-prog")).toBeVisible();
  await expect(page.locator("#btn-status-filter-pagado")).toBeVisible();
});

test("13. Visualización: Fórmulas exactas (Bancos + fecha, Ingresos = C + PP, 1..4 Balance parcial, Gastos proveedores, Gastos Indirectos, Nominas, Impuestos, TOTAL GENERAL) y colores solicitados", async ({ page }) => {
  await openAppAsAdmin(page);

  await page.evaluate(() => {
    window.appState.consecutivo = [
      { consecutivo: 1, factura: 'FE-801', subtotal: 10000, iva: 1600, total: 11600, st: 'C' },
      { consecutivo: 2, factura: 'FE-802', subtotal: 5000, iva: 800, total: 5800, st: 'PP' },
      { consecutivo: 3, factura: 'FE-803', subtotal: 20000, iva: 3200, total: 23200, st: 'P' }
    ];
    window.appState.proveedores = [
      { op: 'RDP-1', proveedor: 'PROV 1', subtotal: 3000, iva: 480, total: 3480, p: 'PROG', estatus: 'PROG' },
      { op: 'RDP-2', proveedor: 'PROV 2', subtotal: 2000, iva: 320, total: 2320, p: 'PAGADO', estatus: 'PAGADO' }
    ];
    window.appState.gastosIndirectos = [
      { id: 'gi-1', folio: 'GI-001', concepto: 'Renta', subtotal: 1000, iva: 0, total: 1000 }
    ];
    window.appState.nominas = [
      { folio: '1', empleado: 'Juan', nomina: 2000, servicio: 2000, total: 2000 }
    ];
    window.appState.archivosQuincenales = [];
    window.appState.selectedQuincenaId = 'current';
    window.switchAdminFicha('visualizacion');
    window.updateAdminConcept('bancos', 10000);
    window.updateAdminConcept('impuestos', 500);
  });
  await page.waitForTimeout(200);

  // Verificar que Bancos registró la fecha automáticamente
  const bancosFechaText = await page.locator("#concept-bancos-fecha").innerText();
  expect(bancosFechaText).toContain("Fecha:");

  // Verificar cálculos exactos:
  // Bancos = 10,000
  // Ingresos (C + PP) = 11,600 + 5,800 = 17,400 (excluye P = 23,200)
  // 1 Balance parcial = 10,000 + 17,400 = 27,400
  // Gastos proveedores (solo por pagar / PROG) = 3,480
  // 2 Balance parcial = 27,400 - 3,480 = 23,920
  // Gastos Indirectos = 1,000
  // 3 Balance parcial = 23,920 - 1,000 = 22,920
  // Nominas = 2,000
  // 4 Balance parcial = 22,920 - 2,000 = 20,920
  // Impuestos = 500
  // TOTAL GENERAL = 20,920 - 500 = 20,420
  await expect(page.locator("#concept-ingresos-val")).toHaveText("$17,400.00");
  await expect(page.locator("#balance-subtotal-1")).toHaveText("$27,400.00");
  await expect(page.locator("#concept-gastos-prov-val")).toHaveText("$3,480.00");
  await expect(page.locator("#balance-subtotal-2")).toHaveText("$23,920.00");
  await expect(page.locator("#concept-gastos-ind-val")).toHaveText("$1,000.00");
  await expect(page.locator("#balance-subtotal-3")).toHaveText("$22,920.00");
  await expect(page.locator("#concept-nominas-val")).toHaveText("$2,000.00");
  await expect(page.locator("#balance-subtotal-4")).toHaveText("$20,920.00");
  await expect(page.locator("#concept-total-final")).toHaveText("$20,420.00");

  // Verificar títulos y clases de colores solicitados
  await expect(page.locator("#row-vis-balance-1")).toContainText("1 Balance parcial");
  await expect(page.locator("#row-vis-balance-2")).toContainText("2 Balance parcial");
  await expect(page.locator("#row-vis-balance-3")).toContainText("3 Balance parcial");
  await expect(page.locator("#row-vis-balance-4")).toContainText("4 Balance parcial");
  await expect(page.locator("#row-vis-gastos-ind")).toContainText("Gastos Indirectos");

  await expect(page.locator("#row-vis-balance-1")).toHaveClass(/excel-white-balance-row/);
  await expect(page.locator("#row-vis-gastos-prov")).toHaveClass(/excel-row-gastos-prov/);
  await expect(page.locator("#row-vis-gastos-ind")).toHaveClass(/excel-row-gastos-ind/);
  await expect(page.locator("#row-vis-nominas")).toHaveClass(/excel-row-nominas/);
  await expect(page.locator("#row-vis-impuestos")).toHaveClass(/excel-row-impuestos/);
});

test("14. Colores de gráfica coinciden con tabla, Gastos Indirectos sin info ficticia + menú Categoría armonizado, y botones Editar/Guardar con bloqueo y filtro gris en Nóminas y Gastos Indirectos", async ({ page }) => {
  await openAppAsAdmin(page);

  // 1. Verificar que Gastos Indirectos inicia sin el registro ficticio GI-001 ($670.00) y los colores de la gráfica coinciden con los de la tabla
  await page.evaluate(() => {
    window.switchAdminFicha('visualizacion');
  });
  await page.waitForTimeout(200);

  const giInitCount = await page.evaluate(() => (window.appState.gastosIndirectos || []).length);
  expect(giInitCount).toBe(0);
  await expect(page.locator("#concept-gastos-ind-val")).toHaveText("$0.00");

  const chartColors = await page.evaluate(() => {
    const chart = window.pieChartInstance;
    return chart && chart.data ? {
      labels: chart.data.labels,
      bg: chart.data.datasets[0].backgroundColor
    } : null;
  });
  expect(chartColors).not.toBeNull();
  expect(chartColors.labels).toEqual([
    'Bancos',
    'Ingresos',
    'Gastos proveedores',
    'Gastos Indirectos',
    'Nominas',
    'Impuestos'
  ]);
  expect(chartColors.bg).toEqual([
    '#A9D18E', // Bancos (Verde)
    '#1F4E78', // Ingresos (Azul)
    '#F8BBD0', // Gastos proveedores (Rosa)
    '#FFE699', // Gastos Indirectos (Amarillo)
    '#111827', // Nominas (Negro)
    '#DC2626'  // Impuestos (Rojo)
  ]);

  // 2. Ir a Administración -> Nóminas Quincenales y verificar botones Editar y Guardar + filtro gris y mensaje
  await page.evaluate(() => {
    window.appState.nominas = [{ folio: '1', empleado: 'Juan', fecha: '2026-10-12', nomina: 2000, servicio: 2000, iva: 0, retencion4: 0, retencionIsr: 0, total: 2000 }];
    localStorage.setItem('rp_nominas_data', JSON.stringify(window.appState.nominas));
    window.switchAdminFicha('quincenal');
    window.switchAdminSubSection('quincenas');
  });
  await page.waitForTimeout(200);

  await expect(page.locator("#btn-edit-nominas")).toBeVisible();
  await expect(page.locator("#btn-save-nominas")).toBeVisible();
  await expect(page.locator("#btn-save-nominas")).toBeDisabled();
  await expect(page.locator("#nominas-table-container")).toHaveClass(/tabla-readonly-sin-editar/);

  // Al dar clic en Editar en Nóminas: aparece filtro gris y el mensaje con el nombre de quien edita
  await page.locator("#btn-edit-nominas").click();
  await page.waitForTimeout(200);

  await expect(page.locator("#btn-save-nominas")).toBeEnabled();
  await expect(page.locator("#nominas-lock-banner")).toBeVisible();
  await expect(page.locator("#nominas-lock-banner")).toContainText("Esta tabla está siendo editada por");
  await expect(page.locator("#nominas-lock-banner")).toContainText("Los cambios no se guardarán hasta que el usuario dé clic en \"Guardar\"");
  await expect(page.locator("#nominas-table-container")).toHaveClass(/tabla-filtro-gris-edicion/);

  // Editar un valor en Nóminas: no se guarda en localStorage hasta dar clic en Guardar
  await page.evaluate(() => {
    window.updateNominaCell(0, 'nomina', 3500);
  });
  const storedBeforeSaveNomina = await page.evaluate(() => JSON.parse(localStorage.getItem('rp_nominas_data'))[0].nomina);
  expect(storedBeforeSaveNomina).toBe(2000);

  // Dar clic en Guardar en Nóminas: guarda cambios y libera bloqueo
  await page.locator("#btn-save-nominas").click();
  await page.waitForTimeout(400);

  await expect(page.locator("#btn-save-nominas")).toBeDisabled();
  await expect(page.locator("#nominas-lock-banner")).toBeHidden();
  const storedAfterSaveNomina = await page.evaluate(() => JSON.parse(localStorage.getItem('rp_nominas_data'))[0].nomina);
  expect(storedAfterSaveNomina).toBe(3500);

  // Simular que otro usuario bloquea Nóminas: no deja editar y muestra el filtro gris bloqueado
  await page.evaluate(() => {
    window.appState.nominasLockedBy = {
      isLocked: true,
      userId: 'other-user-99',
      userName: 'Carlos Ruiz',
      timestamp: Date.now() + 2000
    };
    window.updateNominasEditButtonsUI();
    window.renderNominas();
  });
  await page.waitForTimeout(300);
  await expect(page.locator("#btn-edit-nominas")).toBeDisabled();
  await expect(page.locator("#nominas-lock-banner")).toBeVisible();
  await expect(page.locator("#nominas-lock-banner")).toContainText("Esta tabla está siendo editada por Carlos Ruiz");
  await expect(page.locator("#nominas-table-container")).toHaveClass(/tabla-bloqueada-editando/);

  // Liberar bloqueo externo de Nóminas
  await page.evaluate(() => {
    window.appState.nominasLockedBy = null;
    window.updateNominasEditButtonsUI();
    window.renderNominas();
  });

  // 3. Ir a Gastos Indirectos: verificar que está vacío (sin GI-001 ficticio), habilitar edición con Editar, agregar fila, usar menú armonizado de Categoría y guardar con Guardar
  await page.evaluate(() => {
    window.switchAdminSubSection('gastos-indirectos');
  });
  await page.waitForTimeout(200);

  await expect(page.locator("#tbody-gastos-indirectos")).not.toContainText("FAC-8821");
  await expect(page.locator("#tbody-gastos-indirectos")).not.toContainText("Papelería e insumos operativos");
  
  // Verificar que los botones duplicados en la tarjeta fueron eliminados (Imagen 1)
  await expect(page.locator("#btn-edit-gastos-ind")).toHaveCount(0);
  await expect(page.locator("#btn-save-gastos-ind")).toHaveCount(0);

  // Verificar que las columnas Subtotal e IVA fueron eliminadas (Imagen 2)
  await expect(page.locator("#table-gastos-indirectos thead")).not.toContainText("Subtotal");
  await expect(page.locator("#table-gastos-indirectos thead")).not.toContainText("IVA");

  // Botones principales en la barra superior
  await expect(page.locator("#btn-edit-admin-top")).toBeVisible();
  await expect(page.locator("#btn-save-admin-top")).toBeDisabled();

  // Dar clic en Editar en Gastos Indirectos (barra superior)
  await page.locator("#btn-edit-admin-top").click();
  await page.waitForTimeout(200);

  await expect(page.locator("#btn-save-admin-top")).toBeEnabled();
  await expect(page.locator("#gastos-indirectos-lock-banner")).toBeVisible();
  await expect(page.locator("#gastos-indirectos-lock-banner")).toContainText("Esta tabla está siendo editada por");
  await expect(page.locator("#gastos-indirectos-table-container")).toHaveClass(/tabla-filtro-gris-edicion/);

  // Verificar que las secciones de Concepto y Categoría están habilitadas para escribir (Imagen 3)
  const conceptoInput = page.locator("#gi-concepto-input-0");
  await expect(conceptoInput).toBeVisible();
  await expect(conceptoInput).toBeEnabled();
  await conceptoInput.fill("Carga diésel unidades");
  await page.evaluate(() => window.updateGastoIndirectoCell(0, 'concepto', 'Carga diésel unidades'));

  const catInput = page.locator("#gi-categoria-input-0");
  await expect(catInput).toBeVisible();
  await expect(catInput).toBeEnabled();
  await catInput.fill("Combustible");
  await page.evaluate(() => window.updateGastoIndirectoCell(0, 'categoria', 'Combustible'));

  const totalInput = page.locator("#gi-total-input-0");
  await expect(totalInput).toBeVisible();
  await expect(totalInput).toBeEnabled();
  await totalInput.fill("1160");
  await page.evaluate(() => {
    const el = document.getElementById('gi-total-input-0');
    if (el) el.value = '1160';
    window.liveUpdateGastoIndirectoFromTotal(0);
  });

  const giStoredBeforeSave = await page.evaluate(() => JSON.parse(localStorage.getItem('rp_gastos_indirectos') || '[]'));
  expect(giStoredBeforeSave.length).toBe(0);

  // Dar clic en Guardar en Gastos Indirectos (barra superior)
  await page.locator("#btn-save-admin-top").click();
  await page.waitForTimeout(200);

  await expect(page.locator("#btn-save-admin-top")).toBeDisabled();
  await expect(page.locator("#gastos-indirectos-lock-banner")).toBeHidden();

  const giStoredAfterSave = await page.evaluate(() => JSON.parse(localStorage.getItem('rp_gastos_indirectos') || '[]'));
  expect(giStoredAfterSave.length).toBe(1);
  expect(giStoredAfterSave[0].categoria).toBe("Combustible");
  expect(giStoredAfterSave[0].concepto).toBe("Carga diésel unidades");
  expect(giStoredAfterSave[0].total).toBe(1160);
});

test("11. Reconocimiento de propio bloqueo zalazardemiranda y carga/descarga de documentos", async ({ page }) => {
  await openAppAsAdmin(page);

  // 1. Configurar usuario principal zalazardemiranda
  await page.evaluate(() => {
    const userZ = { id: 'user-zalazar', email: 'zalazardemiranda@gmail.com', nombre: 'Roberto Miranda', rol: 'gerente' };
    localStorage.setItem('rp_logged_user', JSON.stringify(userZ));
    localStorage.setItem('rp_session_active', 'true');
    localStorage.setItem('rp_auth_epoch', '20261015_SEC_EPOCH_V1');
    window.appState.currentUser = userZ;
    window.switchAdminFicha('operaciones');
    const testProj = {
      id: 'RDP2610179-F',
      numProyecto: 'RDP2610179-F',
      consecutivo: 'RDP2610179-F',
      numConsecutivo: 'RDP2610179-F',
      fechaInicio: '2026-10-14',
      fechaInicioDisplay: '14/10/2026',
      numFactura: 'FE-179',
      factura: 'FE-179',
      numOC: 'OC-179',
      cliente: 'CLIENTE PRUEBA DOCS',
      estatus: 'PRIORIDAD',
      generado: true,
      tipoProyecto: 'servicio_local',
      documentos: {}
    };
    window.appState.operacionesProyectos = [testProj];
    localStorage.setItem('rp_operaciones_proyectos', JSON.stringify([testProj]));
    window.renderOperaciones();
  });
  await page.waitForTimeout(200);

  // 2. Simular llegada de bloqueo a nombre de 'zalazardemiranda'
  await page.evaluate(() => {
    window.handleIncomingOperacionesProjectLock({
      projectId: 'RDP2610179-F',
      isLocked: true,
      userId: 'user-zalazar',
      userName: 'zalazardemiranda',
      clientId: 'client_session_prev',
      timestamp: Date.now()
    });
  });
  await page.waitForTimeout(200);

  // Debe reconocer que el bloqueo pertenece al usuario actual (NO mostrar BLOQUEADO para él)
  const row = page.locator("#tbody-operaciones-proyectos tr[data-op-id='RDP2610179-F']");
  await expect(row).not.toHaveClass(/op-row-locked/);
  const btnAbrir = row.locator(".btn-op-abrir");
  await expect(btnAbrir).toBeEnabled();
  await expect(btnAbrir).not.toContainText("BLOQUEADO");

  // 3. Abrir el proyecto
  await btnAbrir.click();
  await page.waitForTimeout(200);
  await expect(page.locator("#operaciones-view-detail")).toBeVisible();

  // 4. Ir al Paso 4 (Documentos) y verificar carga y descarga
  await page.locator("#op-step-indicator-4").click();
  await page.waitForTimeout(200);

  // Probar guardado y restauración de documento mediante DocStorage
  await page.evaluate(async () => {
    const dummyBase64 = "data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrCjEgMCBvYmoKPDwKL1RpdGxlIChEb2N1bWVudG8gT2ZpY2lhbCkKL1Byb2R1Y2VyIChSb2RpcGFjaykKPj4KZW5kb2JqCg==";
    const docData = {
      uploaded: true,
      fileName: "Factura_Oficial_179.pdf",
      fileSize: 1024,
      fileType: "application/pdf",
      dataUrl: dummyBase64,
      uploadedAt: new Date().toISOString()
    };
    const p = window.getActiveOperacionesProject();
    p.documentos['factura1'] = docData;
    await window.DocStorage.saveDoc(p, 'factura1', docData);
    window.renderDocumentosStatus(p);
  });
  await page.waitForTimeout(200);

  // El badge debe mostrar Factura_Oficial_179.pdf y botón Ver / Descargar
  const badge = page.locator("#doc-badge-factura1");
  await expect(badge).toContainText("Factura_Oficial_179.pdf");
  const viewBtn = page.locator("button.doc-btn-view");
  await expect(viewBtn).toBeVisible();

  // 5. Probar que viewDocItem ejecuta la descarga sin errores
  let downloadedFileName = '';
  page.on('download', download => {
    downloadedFileName = download.suggestedFilename();
  });
  await page.evaluate(() => {
    window.viewDocItem('factura1');
  });
  await page.waitForTimeout(200);
});

test("13. Persistencia de nombre de perfil y restauración sin bloqueo al refrescar expediente en edición", async ({ page }) => {
  await openAppAsAdmin(page);

  // 1. Probar guardado de Mi Perfil y persistencia ante sesión
  await page.evaluate(async () => {
    const editNameInput = document.getElementById("myprofile-edit-name");
    const editPhoneInput = document.getElementById("myprofile-edit-phone");
    if (editNameInput) editNameInput.value = "Roberto Miranda Salazar";
    if (editPhoneInput) editPhoneInput.value = "3141234567";

    const fakeEvent = { preventDefault: () => {} };
    await window.handleSaveMyProfile(fakeEvent);
  });
  await page.waitForTimeout(200);

  // Comprobar que appState y localStorage guardaron el nuevo nombre
  const savedName = await page.evaluate(() => window.appState.currentUser?.nombre);
  expect(savedName).toBe("Roberto Miranda Salazar");
  const storedLocalName = await page.evaluate(() => localStorage.getItem("rp_custom_user_nombre"));
  expect(storedLocalName).toBe("Roberto Miranda Salazar");

  // Simular inicio de sesión / recarga de sesión remota
  await page.evaluate(async () => {
    await window.handleUserSession({
      id: 'fb_user_zalazar_123',
      email: 'zalazardemiranda@gmail.com'
    });
  });
  await page.waitForTimeout(200);

  // El nombre NO debe revertirse a 'zalazardemiranda', debe permanecer 'Roberto Miranda Salazar'
  const restoredName = await page.evaluate(() => window.appState.currentUser?.nombre);
  expect(restoredName).toBe("Roberto Miranda Salazar");

  // 2. Probar edición de expediente y recarga (refresh)
  await page.evaluate(() => {
    window.switchAdminFicha('operaciones');
    const testProj = {
      id: 'RDP2610777-K',
      numProyecto: 'RDP2610777-K',
      consecutivo: 'RDP2610777-K',
      numConsecutivo: 'RDP2610777-K',
      fechaInicio: '2026-10-14',
      numFactura: 'FE-777',
      cliente: 'CLIENTE TEST REFRESH',
      generado: true,
      tipoProyecto: 'servicio_local',
      contenedores: []
    };
    window.appState.operacionesProyectos = [testProj];
    localStorage.setItem('rp_operaciones_proyectos', JSON.stringify([testProj]));
    window.renderOperaciones();
    window.openOperacionesDetail('RDP2610777-K');
    window.startEditingOperacionesProject();
    window.goToOperacionesStep(2);
  });
  await page.waitForTimeout(200);

  // Verificar que esté en modo edición y en paso 2
  const isEditingBefore = await page.evaluate(() => window.appState.isEditingOperacionesDetail);
  expect(isEditingBefore).toBe(true);
  const storedEditing = await page.evaluate(() => sessionStorage.getItem('rp_active_operaciones_editing'));
  expect(storedEditing).toBe('true');
  const storedStep = await page.evaluate(() => sessionStorage.getItem('rp_active_operaciones_step'));
  expect(storedStep).toBe('2');

  // Simular refresco de página: re-renderOperaciones() con sessionStorage intacto
  await page.evaluate(() => {
    // Cerrar visualmente el pane para simular reload antes de que el script corra
    const detailPane = document.getElementById("operaciones-view-detail");
    const listPane = document.getElementById("operaciones-view-list");
    if (detailPane) detailPane.style.display = "none";
    if (listPane) listPane.style.display = "block";
    window.appState._hasRestoredActiveProjectOnLoad = false;
    window.renderOperaciones();
  });
  await page.waitForTimeout(300);

  // Verificar que el usuario sigue adentro del proyecto en detalle y en modo edición
  await expect(page.locator("#operaciones-view-detail")).toBeVisible();
  const isEditingAfter = await page.evaluate(() => window.appState.isEditingOperacionesDetail);
  expect(isEditingAfter).toBe(true);
});

test("15. Consecutivo: El usuario que da clic primero a Editar mantiene preferencia absoluta y no se bloquea si otro usuario edita después", async ({ page }) => {
  await openAppAsAdmin(page);

  // 1. Iniciar edición de Consecutivo como usuario local
  await page.evaluate(() => {
    window.startEditingConsecutivo();
  });
  await page.waitForTimeout(200);

  // Comprobar que está en modo edición
  const isEditing = await page.evaluate(() => window.appState.isEditingConsecutivo);
  expect(isEditing).toBe(true);
  const myLock = await page.evaluate(() => window.appState.consecutivoLockedBy);
  expect(myLock).toBeTruthy();
  const myTs = myLock.timestamp;

  const btnEdit = page.locator("#btn-edit-consecutivo");
  const btnSave = page.locator("#btn-save-consecutivo");
  const banner = page.locator("#consecutivo-lock-banner");

  await expect(btnEdit).toContainText("Editando...");
  await expect(btnSave).toBeEnabled();
  await expect(banner).toBeHidden();

  // 2. Simular llegada de broadcast de otro usuario que dio clic DESPUÉS (timestamp mayor)
  await page.evaluate((ts) => {
    const channel = window.chatRealtimeChannel;
    const broadcastHandlers = channel?._broadcastHandlers?.['consecutivo_lock_update'] || [];
    const payload = {
      payload: {
        isLocked: true,
        userId: 'other-late-user',
        userName: 'Maria Perez',
        timestamp: ts + 1000
      }
    };
    broadcastHandlers.forEach(fn => fn(payload));
  }, myTs);
  await page.waitForTimeout(200);

  // El usuario que dio clic PRIMERO debe seguir editando sin ser expulsado ni bloqueado
  const isStillEditing = await page.evaluate(() => window.appState.isEditingConsecutivo);
  expect(isStillEditing).toBe(true);
  const currentLock = await page.evaluate(() => window.appState.consecutivoLockedBy);
  expect(currentLock.userId).not.toBe('other-late-user');

  await expect(btnEdit).toContainText("Editando...");
  await expect(btnSave).toBeEnabled();
  await expect(banner).toBeHidden();

  // 3. Al dar clic en Guardar, se libera el bloqueo y los cambios se persisten
  await btnSave.click();
  await page.waitForTimeout(300);

  const isEditingFinished = await page.evaluate(() => window.appState.isEditingConsecutivo);
  expect(isEditingFinished).toBe(false);
  const lockAfterSave = await page.evaluate(() => window.appState.consecutivoLockedBy);
  expect(lockAfterSave).toBeNull();
  await expect(btnEdit).toContainText("Editar");
  await expect(btnSave).toBeDisabled();
});



