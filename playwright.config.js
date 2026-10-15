const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  workers: process.env.CI ? 1 : undefined,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:4173",
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node tests/serve.js",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
  },
});
