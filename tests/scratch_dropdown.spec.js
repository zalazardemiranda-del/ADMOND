const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const supabaseUmd = fs.readFileSync(
  path.resolve(__dirname, "..", "node_modules", "@supabase", "supabase-js", "dist", "umd", "supabase.js"),
  "utf8"
);

test("probar apertura del menu desplegable de asignacion de tareas", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(e.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") console.log("Browser error:", msg.text());
  });

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

  await page.goto("/");
  await page.waitForFunction(() => window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.client, null, { timeout: 15000 });
  await page.waitForTimeout(1000);

  // Simular sesión iniciada y pestaña tareas activa
  await page.evaluate(() => {
    const overlay = document.getElementById("global-login-overlay");
    if (overlay) overlay.style.display = "none";
    appState.currentUser = {
      id: "test-user-1",
      nombre: "Roberto Miranda",
      email: "zalazardemiranda@gmail.com",
      rol: "gerente"
    };
    appState.currentRole = "gerente";
    window.switchTab("tasks");
  });

  await page.waitForTimeout(500);

  // Click en el input de asignacion
  console.log("Clicking task-assignee input...");
  await page.click("#task-assignee");
  await page.waitForTimeout(500);

  await page.screenshot({ path: "test_dropdown_open.png" });

  const dropdownInfo = await page.evaluate(() => {
    const el = document.getElementById("task-assignee-dropdown");
    const input = document.getElementById("task-assignee");
    if (!el) return { found: false };
    const style = window.getComputedStyle(el);
    return {
      found: true,
      className: el.className,
      isOpen: el.classList.contains("open"),
      display: style.display,
      visibility: style.visibility,
      zIndex: style.zIndex,
      opacity: style.opacity,
      offsetHeight: el.offsetHeight,
      innerHTML: el.innerHTML,
      childrenCount: el.children.length,
      assignees: typeof window.getAvailableAssignees === "function" ? window.getAvailableAssignees() : "not a func"
    };
  });

  console.log("Dropdown Info:", JSON.stringify(dropdownInfo, null, 2));
  console.log("Page Errors:", pageErrors);
});
