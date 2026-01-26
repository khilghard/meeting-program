import { describe, test, expect, beforeEach, vi } from "vitest";

// Prevent init() from auto-running during tests
window.__VITEST__ = true;

// Mock sanitize.js
vi.mock("../js/sanitize.js", () => ({
    sanitizeEntry: vi.fn((key, value) => ({ key, value })),
    isSafeUrl: vi.fn((url) => url.startsWith("http"))
}));

// Mock qr.js
vi.mock("../js/qr.js", () => ({
    showScanner: vi.fn()
}));

// Import main.js AFTER mocks
import * as Main from "../js/main.js";

const {
    splitHymn,
    splitLeadership,
    appendRow,
    appendRowHymn,
    renderSpeaker,
    renderLeader,
    renderGeneralStatementWithLink,
    renderGeneralStatement,
    renderLink,
    renderLinkWithSpace,
    renderProgram,
    init,
    fetchSheet,
    parseCSV,
    renderers
} = Main;

// ------------------------------------------------------------
// 4. Global beforeEach — DOM, mocks, fetch, URL, localStorage
// ------------------------------------------------------------
beforeEach(() => {
    document.body.innerHTML = `
    <div id="main-program"></div>
    <button id="qr-action-btn"></button>
    <div id="program-header"></div>
    <div id="unitname"></div>
    <div id="unitaddress"></div>
    <div id="date"></div>
  `;

    vi.clearAllMocks();
    global.fetch = vi.fn();
    localStorage.clear();

    delete window.location;
    window.location = new URL("https://example.com/");
});

// ------------------------------------------------------------
// 5. TESTS
// ------------------------------------------------------------

// ---------- splitHymn ----------
describe("splitHymn()", () => {
    test("parses hymn number and title", () => {
        expect(splitHymn("#12 Be Still")).toEqual({
            number: "#12",
            title: "Be Still"
        });
    });

    test("handles missing title", () => {
        expect(splitHymn("45")).toEqual({
            number: "45",
            title: ""
        });
    });
});

// ---------- splitLeadership ----------
describe("splitLeadership()", () => {
    test("splits name, phone, and position", () => {
        expect(splitLeadership("John Doe | 555-1234 | Bishop")).toEqual({
            name: "John Doe",
            phone: "555-1234",
            position: "Bishop"
        });
    });
});

// ---------- appendRow ----------
describe("appendRow()", () => {
    test("creates a labeled row", () => {
        appendRow("Speaker", "Alice", "speaker");

        const row = document.querySelector("#speaker .leader-of-dots");
        expect(row).not.toBeNull();
        expect(row.querySelector(".label").textContent).toBe("Speaker");
        expect(row.querySelector(".value-on-right").textContent).toBe("Alice");
    });
});

// ---------- appendRowHymn ----------
describe("appendRowHymn()", () => {
    test("renders hymn number and title", () => {
        appendRowHymn("Opening Hymn", "#12 Be Still", "openingHymn");

        const div = document.querySelector("#openingHymn");
        expect(div.querySelector(".value-on-right").textContent).toBe("#12");
        expect(div.querySelector(".hymn-title").textContent).toBe("Be Still");
    });
});

// ---------- renderSpeaker ----------
describe("renderSpeaker()", () => {
    test("renders a speaker row", () => {
        renderSpeaker("Alice");
        expect(document.querySelector("#speaker .value-on-right").textContent).toBe("Alice");
    });
});

// ---------- renderLeader ----------
describe("renderLeader()", () => {
    test("renders leader with name, phone, and position", () => {
        renderLeader("John Doe | 555-1234 | Bishop");

        const div = document.querySelector("#main-program > div");
        expect(div.querySelector(".label").textContent).toBe("John Doe");
        expect(div.querySelector(".hymn-title").textContent).toBe("555-1234");
        expect(div.querySelector(".value-on-right").textContent).toBe("Bishop");
    });
});

// ---------- renderGeneralStatementWithLink ----------
describe("renderGeneralStatementWithLink()", () => {
    test("renders text with clickable link", () => {
        renderGeneralStatementWithLink("Visit <LINK> our site | example.com");

        const link = document.querySelector(".general-link");
        expect(link.href).toBe("https://example.com/");
        expect(link.textContent).toBe("example.com");
    });
});

// ---------- renderGeneralStatement ----------
describe("renderGeneralStatement()", () => {
    test("renders plain text", () => {
        renderGeneralStatement("Hello world");
        expect(document.querySelector(".general-statement").textContent).toBe("Hello world");
    });
});

// ---------- renderLink ----------
describe("renderLink()", () => {
    test("renders centered link", () => {
        renderLink("Click here | example.com");

        const a = document.querySelector(".link-center a");
        expect(a.href).toBe("https://example.com/");
        expect(a.textContent).toBe("Click here");
    });
});

// ---------- renderLinkWithSpace ----------
describe("renderLinkWithSpace()", () => {
    test("renders link with optional image", () => {
        renderLinkWithSpace("Library <IMG> | example.com | https://img.com/icon.png");

        expect(document.querySelector(".link-icon")).not.toBeNull();
        expect(document.querySelector(".link-with-space a").href).toBe("https://example.com/");
    });
});

// ---------- renderProgram ----------
describe("renderProgram()", () => {
    test("calls correct renderer", () => {
        const spy = vi.spyOn(renderers, "speaker");
        renderProgram([{ key: "speaker", value: "Alice" }]);
        expect(spy).toHaveBeenCalledWith("Alice");
    });

    test("skips empty values but renders horizontalLine", () => {
        const spy = vi.spyOn(renderers, "horizontalLine");
        renderProgram([
            { key: "speaker", value: "" },
            { key: "horizontalLine", value: "" }
        ]);
        expect(spy).toHaveBeenCalledWith("");
    });
});

// ---------- fetchSheet ----------
describe("fetchSheet()", () => {
    test("returns null when no URL", async () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => { });
        expect(await fetchSheet("")).toBeNull();
        expect(warn).toHaveBeenCalled();
    });
});

// ---------- parseCSV ----------
describe("parseCSV()", () => {
    test("parses CSV", () => {
        const csv = "key,value\nspeaker,Alice";
        expect(parseCSV(csv)).toEqual([{ key: "speaker", value: "Alice" }]);
    });
});
