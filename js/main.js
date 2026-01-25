import { showScanner } from "./qr.js";

// ------------------------------------------------------------
// 1. Fetch CSV from a dynamic Google Sheets URL
// ------------------------------------------------------------
async function fetchSheet(sheetUrl) {
  if (!sheetUrl) {
    console.warn("No sheet URL provided. Program will not load.");
    return null;
  }

  // Normalize URL to ensure CSV export
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
// 2. Parse CSV into a simple key/value object
// ------------------------------------------------------------
function parseCSV(csv) {
  const lines = csv.trim().split("\n");
  const rows = [];

  lines.slice(1).forEach(line => {
    const [key, value] = line.split(",").map(x => x.trim().replace(/^"|"$/g, ""));
    if (!key) return;

    rows.push({
      key,
      value: (value || "").trim().replace(/~/g, ",")
    });
  });

  return rows;
}

// ------------------------------------------------------------
// 3. Detect dynamic keys
// ------------------------------------------------------------
function detectType(key) {
  if (/^speaker\d+$/i.test(key)) return "speaker";
  if (/^intermediatehymn\d+$/i.test(key)) return "intermediateHymn";
  return key;
}

// ------------------------------------------------------------
// 4. RENDERERS
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

  div.innerHTML = `
    <div class="leader-of-dots hymn-row">
      <span class="label">${leaderSplit.name}</span>
      <span class="dots"></span>
      <span class="value-on-right">${leaderSplit.position}</span>
    </div>
    <div class="hymn-title">${leaderSplit.phone}</div>
  `;

  container.appendChild(div);
}

function renderGeneralStatementWithLink(value) {
  const container = document.getElementById("main-program");
  const div = document.createElement("div");

  const [text, url] = value.split("|").map(s => s.trim());

  // Fix URL (add https:// if missing)
  const safeUrl = url.startsWith("http") ? url : `https://${url}`;

  const html = text.replace(
    "<LINK>",
    `<a href="${safeUrl}" target="_blank" class="general-link">${url}</a>`
  );

  div.innerHTML = `
    <div class="general-statement">${html}</div>
  `;

  container.appendChild(div);
}


function renderGeneralStatement(value) {
  const container = document.getElementById("main-program");
  const div = document.createElement("div");

  div.innerHTML = `
    <div class="general-statement">${value}</div>
  `;

  container.appendChild(div);
}

function renderLink(value) {
  const container = document.getElementById("main-program");
  const div = document.createElement("div");
  div.className='link-center';
  const [text, url] = value.split("|").map(s => s.trim());

  // Fix URL (add https:// if missing)
  const safeUrl = url.startsWith("http") ? url : `https://${url}`;
  div.innerHTML = `<a href="${safeUrl}" target="_blank">${text}</a>`;

  container.appendChild(div);
}

function renderLinkWithSpace(value) {
  const container = document.getElementById("main-program");
  const div = document.createElement("div");
  div.className = "link-with-space";

  const [text, url, imgLink] = value.split("|").map(s => s.trim());

  const safeUrl = url.startsWith("http") ? url : `https://${url}`;

  const imgHTML =
    imgLink && imgLink.toUpperCase() !== "NONE"
      ? `<img src="${imgLink}" class="link-icon" role="presentation">`
      : "";

  div.innerHTML = `
    <div class="link-with-space-inner">
      ${imgHTML}
      <a href="${safeUrl}" target="_blank">${text.replace("<IMG>", "").trim()}</a>
    </div>
  `;

  container.appendChild(div);
}

function appendRow(label, value, id) {
  const container = document.getElementById("main-program");
  const div = document.createElement("div");
  div.id = id;
  div.innerHTML = `
    <div class="leader-of-dots">
      <span class="label">${label}</span>
      <span class="dots"></span>
      <span class="value-on-right">${value}</span>
    </div>
  `;
  container.appendChild(div);
}

function appendRowHymn(label, value, id) {
  const container = document.getElementById("main-program");
  const div = document.createElement("div");
  div.id = id;

  const { number, title } = splitHymn(value);

  div.innerHTML = `
    <div class="leader-of-dots hymn-row">
      <span class="label">${label}</span>
      <span class="dots"></span>
      <span class="value-on-right">${number}</span>
    </div>
    <div class="hymn-title">${title}</div>
  `;

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
    position: parts[2] || ""
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
  hr.setAttribute('data-content', value);
  container.appendChild(hr);
}

// ------------------------------------------------------------
// 5. Map CSV keys → renderer functions
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
// 6. Main render loop
// ------------------------------------------------------------
function renderProgram(row) {
  row.forEach(({ key, value }) => {
    if (!value || value.trim() === "") {
      // still allow horizontalLine with empty value
      if (key.toLowerCase() === "horizontalline") {
        renderers.horizontalLine();
      }
      return;
    }

    const type = detectType(key);
    const renderer = renderers[type];

    if (renderer) renderer(value);
  });
}

// ------------------------------------------------------------
// 7. Initialize
// ------------------------------------------------------------
async function init() {
  document.getElementById("main-program").innerHTML = "";

  const params = new URLSearchParams(window.location.search);
  let sheetUrl = params.get("url") || localStorage.getItem("sheetUrl");

  const actionBtn = document.getElementById("qr-action-btn");

  // Button always visible, but text changes
  if (!sheetUrl) {
    actionBtn.textContent = "Scan Program QR Code";
    actionBtn.onclick = () => showScanner();
  } else {
    actionBtn.textContent = "Use New QR Code";
    actionBtn.onclick = () => showScanner();
  }

  const header = document.getElementById("program-header");
  if (!sheetUrl) {
    // No URL yet → hide header
    header.classList.add("hidden");
  } else {
    // Valid URL → show header
    header.classList.remove("hidden");
  }

  // No URL → stop here
  if (!sheetUrl) {
    console.log("No URL found. Waiting for QR scan.");
    return;
  }

  // Persist URL
  localStorage.setItem("sheetUrl", sheetUrl);

  // Load program
  const row = await fetchSheet(sheetUrl);
  if (row) renderProgram(row);
}

init();
