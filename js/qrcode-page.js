/* global QRCode */
/**
 * qrcode-page.js
 * QR Code Generator page logic
 * Browser-based equivalent of generate-qr.js
 */

import { DEFAULT_URL } from "./config/defaultUrl.js";

const DPI = 300;
let debounceTimer = null;

function extractSheetId(url) {
  const patterns = [
    /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
    /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)\/edit/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function convertToCsvUrl(url) {
  const sheetId = extractSheetId(url);
  if (!sheetId) throw new Error("Could not extract Google Sheets ID from URL");
  if (url.includes("/gviz/tq") && url.includes("tqx=out:csv")) return url;
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
}

function buildProgramUrl(websiteUrl, csvUrl, forceUpdate, nocache) {
  const trimmedWebsite = websiteUrl.replace(/\/$/, "");
  const params = new URLSearchParams();
  if (csvUrl) params.set("url", csvUrl);
  if (forceUpdate) params.set("forceUpdate", "true");
  if (nocache) params.set("nocache", "true");
  const queryString = params.toString();
  return `${trimmedWebsite}${queryString ? "?" + queryString : ""}`;
}

function getInputs() {
  return {
    sheetUrl: document.getElementById("qrcode-sheet-url").value.trim(),
    websiteUrl: document.getElementById("qrcode-website-url").value.trim(),
    forceUpdate: document.getElementById("qrcode-force-update").checked,
    nocache: document.getElementById("qrcode-nocache").checked,
    printSize: Number(document.getElementById("qrcode-print-size").value),
    pixelSize: Number(document.getElementById("qrcode-pixel-size").value),
    fgColor: document.getElementById("qrcode-fg-color").value,
    bgColor: document.getElementById("qrcode-bg-color").value,
    margin: Number(document.getElementById("qrcode-margin").value)
  };
}

function getProgramUrl(inputs) {
  let csvUrl = null;
  if (inputs.sheetUrl) {
    try {
      if (inputs.sheetUrl.includes("gviz/tq")) {
        csvUrl = inputs.sheetUrl;
      } else {
        csvUrl = convertToCsvUrl(inputs.sheetUrl);
      }
    } catch {
      return null;
    }
  }
  return buildProgramUrl(inputs.websiteUrl || DEFAULT_URL, csvUrl, inputs.forceUpdate, inputs.nocache);
}

function showStatus(message, type) {
  const el = document.getElementById("qrcode-status");
  el.textContent = message;
  el.className = `qrcode-status qrcode-status--${type}`;
  el.hidden = false;
  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(() => {
    el.hidden = true;
  }, 3000);
}

function generateQR() {
  const inputs = getInputs();
  const programUrl = getProgramUrl(inputs);
  const urlPreview = document.getElementById("qrcode-url-preview");
  const outputSection = document.getElementById("qrcode-output");
  const canvas = document.getElementById("qrcode-canvas");

  if (!programUrl) {
    urlPreview.textContent = "Enter a Google Sheets URL to generate a QR code";
    outputSection.hidden = false;
    return;
  }

  urlPreview.textContent = programUrl;
  outputSection.hidden = false;

  if (typeof QRCode === "undefined") {
    urlPreview.textContent = "QR Code library not loaded. Please refresh the page.";
    console.error("[QRCode] QRCode global is undefined — vendor script may not have loaded");
    return;
  }

  QRCode.toCanvas(canvas, programUrl, {
    width: inputs.pixelSize,
    margin: inputs.margin,
    color: {
      dark: inputs.fgColor,
      light: inputs.bgColor
    }
  }, (error) => {
    if (error) {
      console.error("[QRCode] Generation error:", error);
      showStatus("Error generating QR code: " + error.message, "error");
    }
  });
}

function debouncedGenerate() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(generateQR, 300);
}

function downloadPng() {
  const canvas = document.getElementById("qrcode-canvas");
  if (!canvas) return;

  canvas.toBlob((blob) => {
    if (!blob) {
      showStatus("Failed to create image", "error");
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "program-qr.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showStatus("Downloaded program-qr.png", "success");
  }, "image/png");
}

function copyUrl() {
  const urlPreview = document.getElementById("qrcode-url-preview");
  const url = urlPreview.textContent;
  if (!url || url.startsWith("Enter")) return;

  navigator.clipboard.writeText(url).then(() => {
    showStatus("URL copied to clipboard", "success");
  }).catch(() => {
    showStatus("Failed to copy URL", "error");
  });
}

function updatePrintSize() {
  const printSize = Number(document.getElementById("qrcode-print-size").value);
  document.getElementById("qrcode-pixel-size").value = printSize * DPI;
}

function initTheme() {
  const toggleBtn = document.getElementById("qrcode-theme-toggle");
  if (!toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    const current = document.documentElement.dataset.theme;
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("userPreference_theme", next);
  });
}

function init() {
  console.log("[QRPage] init called");
  document.getElementById("qrcode-website-url").value = DEFAULT_URL;
  initTheme();

  const generateBtn = document.getElementById("qrcode-generate-btn");
  console.log("[QRPage] generateBtn found:", !!generateBtn);
  generateBtn.addEventListener("click", () => {
    console.log("[QRPage] Generate button clicked");
    generateQR();
  });
  document.getElementById("qrcode-download-btn").addEventListener("click", downloadPng);
  document.getElementById("qrcode-copy-url-btn").addEventListener("click", copyUrl);
  document.getElementById("qrcode-print-size").addEventListener("change", updatePrintSize);

  const inputs = document.querySelectorAll(
    "#qrcode-sheet-url, #qrcode-website-url, #qrcode-force-update, #qrcode-nocache, #qrcode-pixel-size, #qrcode-fg-color, #qrcode-bg-color, #qrcode-margin"
  );
  inputs.forEach((input) => {
    input.addEventListener("input", debouncedGenerate);
  });

  console.log("[QRPage] Initialized. QRCode available:", typeof QRCode !== "undefined");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
