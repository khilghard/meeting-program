// Prevent init() from auto-running during tests
globalThis.window = globalThis.window || {};
window.__VITEST__ = true;
