// Configuración de ESLint: detecta bugs reales (no estilo) en el JS del sistema.
const globals = require("globals");

module.exports = [
  {
    ignores: ["node_modules/**", "*.min.js", "test-results/**", "playwright-report/**"],
  },
  {
    files: ["app.js", "schema.js", "supabase_config.js", "consecutivo_data.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "script",
      globals: {
        ...globals.browser,
        supabase: "readonly",
        Chart: "readonly",
        CONSECUTIVO_DATA: "writable",
        initSchemaEngine: "readonly",
        renderSchemaView: "readonly",
        switchAdminSubTab: "readonly",
        renderProveedoresTable: "readonly",
        renderConsecutivoTable: "readonly",
        showStatusMessage: "readonly",
        isAccidentalEmptyProject: "readonly",
        hasProjectData: "readonly",
        showCustomNotification: "readonly",
      },
    },
    rules: {
      "no-undef": "error",
      "no-dupe-keys": "error",
      "no-dupe-else-if": "error",
      "no-duplicate-case": "error",
      "no-unreachable": "error",
      "no-unsafe-finally": "error",
      "no-unsafe-optional-chaining": "error",
      "no-redeclare": "error",
      "no-func-assign": "error",
      "no-self-assign": "error",
      "no-cond-assign": "error",
      "no-const-assign": "error",
      "no-use-before-define": ["warn", { functions: false, variables: true }],
      "no-unused-vars": ["warn", { args: "none", caughtErrors: "none" }],
      "no-empty": ["warn", { allowEmptyCatch: true }],
      "no-constant-condition": "warn",
      "no-prototype-builtins": "warn",
      "eqeqeq": ["warn", "smart"],
    },
  },
];
