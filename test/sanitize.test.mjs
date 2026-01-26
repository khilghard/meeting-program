import { sanitizeValue, sanitizeEntry, isSafeUrl } from "../js/sanitize.js";

function assert(name, condition) {
  if (!condition) {
    console.error("❌ FAIL:", name);
  } else {
    console.log("✅ PASS:", name);
  }
}

test("Strip HTML tags", () => {
  expect(sanitizeValue("<b>bold</b>")).toBe("bold");
});

test("Allow normal text", () => {
  expect(sanitizeValue("Hello World")).toBe("Hello World");
});

test("Allow LINK placeholder", () => {
  expect(sanitizeValue("See <LINK> here")).toBe("See <LINK> here");
});

test("Allow IMG placeholder", () => {
  expect(sanitizeValue("<IMG> Gospel Library")).toBe("<IMG> Gospel Library");
});

test("Block script tag", () => {
  expect(sanitizeValue("<script>alert(1)</script>")).toBe("");
});

test("Valid URL https", () => {
  expect(isSafeUrl("https://example.com")).toBe(true);
});

test("Valid URL http", () => {
  expect(isSafeUrl("http://example.com")).toBe(true);
});

test("Block javascript URL", () => {
  expect(isSafeUrl("javascript:alert(1)")).toBe(false);
});

test("Allowed key unitName", () => {
  const entry = sanitizeEntry("unitName", "My Ward");
  expect(entry.key).toBe("unitName");
});

test("Dynamic speaker key", () => {
  const entry = sanitizeEntry("speaker1", "John Doe");
  expect(entry.key).toBe("speaker");
});

test("Unknown key blocked", () => {
  const entry = sanitizeEntry("evilKey", "test");
  expect(entry).toBe(null);
});
