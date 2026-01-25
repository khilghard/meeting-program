const js = require("@eslint/js");
const importPlugin = require("eslint-plugin-import");
const prettierConfig = require("eslint-config-prettier");

module.exports = [

  // ------------------------------------------------------------
  // Browser JS (main.js, qr.js, app.js)
  // ------------------------------------------------------------
  {
    files: ["js/**/*.js"],
    ignores: ["server.js", "../service-worker.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        fetch: "readonly",
        URLSearchParams: "readonly",
        console: "readonly",
        requestAnimationFrame: "readonly",
        setTimeout: "readonly",
        jsQR: "readonly"
      }
    },
    plugins: {
      import: importPlugin
    },
    rules: {
      ...js.configs.recommended.rules,
      ...importPlugin.configs.recommended.rules,
      ...prettierConfig.rules,

      indent: ["error", 2],
      semi: ["error", "always"],
      quotes: ["error", "double"],
      "no-unused-vars": ["warn"],
      "no-undef": ["error"]
    }
  },

  // ------------------------------------------------------------
  // Service Worker
  // ------------------------------------------------------------
  {
    files: ["service-worker.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        self: "readonly",
        caches: "readonly",
        fetch: "readonly",
        console: "readonly"
      }
    },
    rules: {
      indent: ["error", 2],
      semi: ["error", "always"],
      quotes: ["error", "double"]
    }
  },

  // ------------------------------------------------------------
  // Node server
  // ------------------------------------------------------------
  {
    files: ["server.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        __dirname: "readonly",
        console: "readonly",
        process: "readonly"
      }
    },
    rules: {
      indent: ["error", 2],
      semi: ["error", "always"],
      quotes: ["error", "double"]
    }
  }
];
