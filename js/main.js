// main.js
import { showScanner } from "./qr.js";
import { sanitizeEntry, isSafeUrl } from "./sanitize.js";

// ------------------------------------------------------------
// 1. Fetch CSV from a dynamic Google Sheets URL
// ------------------------------------------------------------
async function fetchSheet(sheetUrl) {
  if (!sheetUrl) {
    console.warn("No sheet URL provided. Program will not load.");
    return null;
  }

  let url = sheetUrl;
  if (!url.includes("tqx=out:csv")) {
    if (url.endsWith("/")) url = url.slice(0, -1);
    url = url + "/gviz/tq?tqx=out:csv";
  }

  const response = await fetch(url);
  const text = await response.text();
  return parseCSV(text);
}

// ------------------------------------------------------------
// 2. Parse CSV into an array of { key, value }
// ------------------------------------------------------------
function parseCSV(csv) {
  const lines = csv.trim().split("\n");
  const rows = [];

  // assume first line is header
  lines.slice(1).forEach(line => {
    const [rawKey, rawValue] = line
      .split(",")
      .map(x => x.trim().replace(/^"|"$/g, ""));

    const entry = sanitizeEntry(rawKey, rawValue);
    if (!entry) return;

    // replace ~ with comma (your existing behavior)
    entry.value = (entry.value || "").replace(/~/g, ",");

    rows.push(entry);
  });

  return rows;
}

// ------------------------------------------------------------
// 3. RENDERERS (DOM-safe, no innerHTML)
// ------------------------------------------------------------
function renderSpeaker(name) {
  appendRow("Speaker", name, "speaker");
}

function renderIntermediateHymn(name) {
  appendRowHymn("Intermediate Hymn", name, "intermediateHymn");
}

function renderOpeningHymn(name) {
  appendRowHymn("Opening Hymn", name, "openingHymn");
}

function renderClosingHymn(name) {
  appendRowHymn("Closing Hymn", name, "closingHymn");
}

function renderHymn(name) {
  appendRowHymn("Hymn", name, "hymn");
}

function renderSacramentHymn(name) {
  appendRowHymn("Sacrament Hymn", name, "sacramentHymn");
}

function renderOpeningPrayer(name) {
  appendRow("Invocation", name, "openingPrayer");
}

function renderClosingPrayer(name) {
  appendRow("Benediction", name, "closingPrayer");
}

function renderPresiding(name) {
  appendRow("Presiding", name, "presiding");
}

function renderConducting(name) {
  appendRow("Conducting", name, "conducting");
}

function renderMusicDirector(name) {
  appendRow("Music Director", name, "musicDirector");
}

function renderOrganist(name) {
  appendRow("Organist", name, "musicOrganist");
}

function renderLeader(value) {
  const container = document.getElementById("main-program");
  const div = document.createElement("div");

  const leaderSplit = splitLeadership(value);

  const row = document.createElement("div");
  row.className = "leader-of-dots hymn-row";

  const labelSpan = document.createElement("span");
  labelSpan.className = "label";
  labelSpan.textContent = leaderSplit.name;

  const dotsSpan = document.createElement("span");
  dotsSpan.className = "dots";

  const valueSpan = document.createElement("span");
  valueSpan.className = "value-on-right";
  valueSpan.textContent = leaderSplit.position;

  row.appendChild(labelSpan);
  row.appendChild(dotsSpan);
  row.appendChild(valueSpan);

  const phoneDiv = document.createElement("div");
  phoneDiv.className = "hymn-title";
  phoneDiv.textContent = leaderSplit.phone;

  div.appendChild(row);
  div.appendChild(phoneDiv);

  container.appendChild(div);
}

function renderGeneralStatementWithLink(value) {
  const container = document.getElementById("main-program");
  const div = document.createElement("div");

  const [textPart, urlPart] = value.split("|").map(s => s.trim());
  if (!textPart || !urlPart) return;

  const safeUrl = urlPart.startsWith("http") ? urlPart : `https://${urlPart}`;
  if (!isSafeUrl(safeUrl)) return;

  const wrapper = document.createElement("div");
  wrapper.className = "general-statement";

  // Split around <LINK> placeholder
  const parts = textPart.split("<LINK>");
  // text before link
  if (parts[0]) {
    wrapper.appendChild(document.createTextNode(parts[0]));
  }

  // link itself
  const link = document.createElement("a");
  link.href = safeUrl;
  link.target = "_blank";
  link.className = "general-link";
  link.textContent = urlPart;
  wrapper.appendChild(link);

  // text after link
  if (parts[1]) {
    wrapper.appendChild(document.createTextNode(parts[1]));
  }

  div.appendChild(wrapper);
  container.appendChild(div);
}

function renderGeneralStatement(value) {
  const container = document.getElementById("main-program");
  const div = document.createElement("div");
  div.className = "general-statement";
  div.textContent = value;
  container.appendChild(div);
}

function renderLink(value) {
  const container = document.getElementById("main-program");
  const div = document.createElement("div");
  div.className = "link-center";

  const [text, url] = value.split("|").map(s => s.trim());
  if (!text || !url) return;

  const safeUrl = url.startsWith("http") ? url : `https://${url}`;
  if (!isSafeUrl(safeUrl)) return;

  const a = document.createElement("a");
  a.href = safeUrl;
  a.target = "_blank";
  a.textContent = text;

  div.appendChild(a);
  container.appendChild(div);
}

function renderLinkWithSpace(value) {
  const container = document.getElementById("main-program");
  const div = document.createElement("div");
  div.className = "link-with-space";

  const [textRaw, urlRaw, imgLinkRaw] = value.split("|").map(s => s.trim());
  if (!textRaw || !urlRaw) return;

  const safeUrl = urlRaw.startsWith("http") ? urlRaw : `https://${urlRaw}`;
  if (!isSafeUrl(safeUrl)) return;

  const text = textRaw.replace("<IMG>", "").trim();

  const inner = document.createElement("div");
  inner.className = "link-with-space-inner";

  if (imgLinkRaw && imgLinkRaw.toUpperCase() !== "NONE" && isSafeUrl(imgLinkRaw)) {
    const img = document.createElement("img");
    img.src = imgLinkRaw;
    img.className = "link-icon";
    img.setAttribute("role", "presentation");
    inner.appendChild(img);
  }

  const a = document.createElement("a");
  a.href = safeUrl;
  a.target = "_blank";
  a.textContent = text;

  inner.appendChild(a);
  div.appendChild(inner);
  container.appendChild(div);
}

function appendRow(label, value, id) {
  const container = document.getElementById("main-program");
  const div = document.createElement("div");
  div.id = id;

  const row = document.createElement("div");
  row.className = "leader-of-dots";

  const labelSpan = document.createElement("span");
  labelSpan.className = "label";
  labelSpan.textContent = label;

  const dotsSpan = document.createElement("span");
  dotsSpan.className = "dots";

  const valueSpan = document.createElement("span");
  valueSpan.className = "value-on-right";
  valueSpan.textContent = value;

  row.appendChild(labelSpan);
  row.appendChild(dotsSpan);
  row.appendChild(valueSpan);

  div.appendChild(row);
  container.appendChild(div);
}

function appendRowHymn(label, value, id) {
  const container = document.getElementById("main-program");
  const div = document.createElement("div");
  div.id = id;

  const { number, title } = splitHymn(value);

  const row = document.createElement("div");
  row.className = "leader-of-dots hymn-row";

  const labelSpan = document.createElement("span");
  labelSpan.className = "label";
  labelSpan.textContent = label;

  const dotsSpan = document.createElement("span");
  dotsSpan.className = "dots";

  const valueSpan = document.createElement("span");
  valueSpan.className = "value-on-right";
  valueSpan.textContent = number;

  row.appendChild(labelSpan);
  row.appendChild(dotsSpan);
  row.appendChild(valueSpan);

  const titleDiv = document.createElement("div");
  titleDiv.className = "hymn-title";
  titleDiv.textContent = title;

  div.appendChild(row);
  div.appendChild(titleDiv);

  container.appendChild(div);
}

function splitHymn(value) {
  const match = value.match(/^(#?\d+)\s*(.*)$/);
  if (!match) return { number: "", title: value };
  return { number: match[1], title: match[2] };
}

function splitLeadership(value) {
  const parts = value.split("|").map(p => p.trim());
  return {
    name: parts[0] || "",
    phone: parts[1] || "",
    position: parts[2] || "",
  };
}

function renderUnitName(name) {
  document.getElementById("unitname").textContent = name;
}

function renderUnitAddress(name) {
  document.getElementById("unitaddress").textContent = name;
}

function renderDate(name) {
  document.getElementById("date").textContent = name;
}

function renderLineBreak(value) {
  const container = document.getElementById("main-program");
  const hr = document.createElement("hr");
  hr.className = "hr-text";
  if (value) {
    hr.setAttribute("data-content", value);
  }
  container.appendChild(hr);
}

// ------------------------------------------------------------
// 4. Map keys → renderer functions
// ------------------------------------------------------------
const renderers = {
  unitName: renderUnitName,
  unitAddress: renderUnitAddress,
  date: renderDate,
  presiding: renderPresiding,
  conducting: renderConducting,
  hymn: renderHymn,
  openingHymn: renderOpeningHymn,
  openingPrayer: renderOpeningPrayer,
  sacramentHymn: renderSacramentHymn,
  speaker: renderSpeaker,
  intermediateHymn: renderIntermediateHymn,
  closingHymn: renderClosingHymn,
  closingPrayer: renderClosingPrayer,
  musicDirector: renderMusicDirector,
  musicOrganist: renderOrganist,
  horizontalLine: renderLineBreak,
  leader: renderLeader,
  generalStatementWithLink: renderGeneralStatementWithLink,
  generalStatement: renderGeneralStatement,
  link: renderLink,
  linkWithSpace: renderLinkWithSpace,
};

// ------------------------------------------------------------
// 5. Main render loop
// ------------------------------------------------------------
function renderProgram(rows) {
  rows.forEach(({ key, value }) => {
    if (!value || value.trim() === "") {
      if (key.toLowerCase() === "horizontalline") {
        renderers.horizontalLine("");
      }
      return;
    }

    const renderer = renderers[key];
    if (renderer) renderer(value);
  });
}

// ------------------------------------------------------------
// 6. UI FUNCTIONS
// ------------------------------------------------------------

function fetchWithTimeout(url, ms) {
  return Promise.race([
    fetch(url).then(r => {
      if (!r.ok) throw new Error("Network error");
      return r.text();
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms)
    )
  ]);
}

function showOfflineBanner() {
  const banner = document.getElementById("offline-banner");
  banner.classList.add("visible");

  // Auto-hide after 4 seconds
  setTimeout(() => {
    banner.classList.remove("visible");
  }, 4000);
}

function handleVersionVisibility() {
  const versionEl = document.getElementById("app-version");

  const scrollY = window.scrollY;
  const viewportHeight = window.innerHeight;
  const fullHeight = document.body.scrollHeight;

  const distanceFromBottom = fullHeight - (scrollY + viewportHeight);

  if (distanceFromBottom < 150) {
    versionEl.classList.add("visible");
  } else {
    versionEl.classList.remove("visible");
  }
}

// ------------------------------------------------------------
// 7. Initialize
// ------------------------------------------------------------
async function init() {
  const main = document.getElementById("main-program");
  main.classList.add("loading");

  try {
    const params = new URLSearchParams(window.location.search);
    let sheetUrl = params.get("url") || localStorage.getItem("sheetUrl");

    const actionBtn = document.getElementById("qr-action-btn");
    const header = document.getElementById("program-header");
    const reloadBtn = document.getElementById("reload-btn");

    if (!sheetUrl) {
      actionBtn.textContent = "Scan Program QR Code";
      actionBtn.onclick = () => showScanner();
      header.classList.add("hidden");
      reloadBtn.classList.add("hidden");
      return;
    }

    actionBtn.textContent = "Use New QR Code";
    actionBtn.onclick = () => showScanner();
    header.classList.remove("hidden");
    reloadBtn.classList.remove("hidden");
    reloadBtn.onclick = () => init();

    localStorage.setItem("sheetUrl", sheetUrl);

    try {
      const csv = await fetchWithTimeout(sheetUrl, 4000);
      const rows = parseCSV(csv);

      localStorage.setItem("lastProgramData", JSON.stringify(rows));

      main.innerHTML = "";
      renderProgram(rows);
      updateTimestamp();
    } catch (err) {
      console.warn("Failed to fetch sheet:", err);

      const cached = localStorage.getItem("lastProgramData");
      if (cached) {
        main.innerHTML = "";
        renderProgram(JSON.parse(cached));
        updateTimestamp();
        showOfflineBanner();
      } else {
        main.textContent =
          "Unable to load program and no cached version is available.";
      }
    }
  } finally {
    main.classList.remove("loading");
    handleVersionVisibility(); // recalc after every init run
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

if (typeof window !== "undefined" && !window.__VITEST__) {
  window.addEventListener("scroll", handleVersionVisibility);
  window.addEventListener("resize", handleVersionVisibility);

  window.addEventListener("online", () => {
    document.getElementById("offline-banner").classList.remove("visible");
  });

  document.getElementById("main-program").classList.add("loading");

  // after renderProgram(...)
  document.getElementById("main-program").classList.remove("loading");

  // Run once on load
  handleVersionVisibility();

  init();
}

export {
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
  renderLineBreak,
  renderDate,
  renderUnitAddress,
  renderUnitName,
  renderers
};
