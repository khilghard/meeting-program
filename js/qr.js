// ------------------------------------------------------------
// QR Scanner Module
// ------------------------------------------------------------

let qrStream = null;
let lastScanTime = 0;

const qrSection = document.getElementById("qr-scanner");
const video = document.getElementById("qr-video");
const canvas = document.getElementById("qr-canvas");
const output = document.getElementById("qr-output");
const ctx = canvas.getContext("2d");

// ------------------------------------------------------------
// Safari Detection
// ------------------------------------------------------------
function isSafari() {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes("safari") && !ua.includes("chrome") && !ua.includes("android");
}

function showSafariCameraHelp() {
  alert(
    "Safari may have blocked camera access.\n\n" +
    "To enable it:\n" +
    "1. Open Settings\n" +
    "2. Scroll down and tap Safari\n" +
    "3. Tap Camera\n" +
    "4. Choose 'Allow'\n\n" +
    "Then return to the app and try again."
  );
}

// ------------------------------------------------------------
// URL Validation
// ------------------------------------------------------------
function isValidSheetUrl(url) {
  return (
    typeof url === "string" &&
    url.startsWith("https://docs.google.com/spreadsheets/")
  );
}

// ------------------------------------------------------------
// Public API
// ------------------------------------------------------------
export function showScanner() {
  qrSection.hidden = false;
  startQRScanner();

  // Scroll into view once camera metadata is ready
  video.onloadedmetadata = () => {
    qrSection.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Switch the action button to "Cancel"
  const actionBtn = document.getElementById("qr-action-btn");
  actionBtn.textContent = "Cancel";
  actionBtn.onclick = () => hideScanner();
}

export function hideScanner() {
  qrSection.hidden = true;
  stopQRScanner();

  const actionBtn = document.getElementById("qr-action-btn");
  const storedUrl = localStorage.getItem("sheetUrl");

  if (!storedUrl) {
    actionBtn.textContent = "Scan Program QR Code";
  } else {
    actionBtn.textContent = "Scan a Different Program";
  }

  actionBtn.onclick = () => showScanner();
}

// ------------------------------------------------------------
// Start camera + scanning loop
// ------------------------------------------------------------
async function startQRScanner() {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      output.textContent = "Camera access is not available in this browser.";
      return;
    }

    qrStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }
    });

    video.srcObject = qrStream;
    video.setAttribute("playsinline", true); // Required for iOS Safari
    video.play();

    requestAnimationFrame(scanFrame);

  } catch (err) {
    console.error("Camera error:", err);

    if (isSafari() && (err.name === "NotAllowedError" || err.name === "NotReadableError")) {
      showSafariCameraHelp();
      return;
    }

    output.textContent = "Camera access denied or unavailable.";
  }
}

// ------------------------------------------------------------
// Stop camera
// ------------------------------------------------------------
function stopQRScanner() {
  if (qrStream) {
    qrStream.getTracks().forEach(t => t.stop());
    qrStream = null;
  }
}

// ------------------------------------------------------------
// Scan loop
// ------------------------------------------------------------
function scanFrame(timestamp) {
  if (!qrStream) return;

  // Limit scanning to ~6–7 fps
  if (timestamp - lastScanTime < 150) {
    requestAnimationFrame(scanFrame);
    return;
  }
  lastScanTime = timestamp;

  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);

    if (code) {
      const scanned = code.data.trim();

      if (isValidSheetUrl(scanned)) {
        stopQRScanner();
        handleScannedUrl(scanned);
        return;
      }

      // Invalid → keep scanning
      output.textContent = "Invalid QR code. Please scan a program QR code.";
    }
  }

  requestAnimationFrame(scanFrame);
}

// ------------------------------------------------------------
// Handle scanned URL
// ------------------------------------------------------------
function handleScannedUrl(url) {
  output.textContent = "Scanned URL: " + url;

  // Persist until next scan
  localStorage.setItem("sheetUrl", url);

  // Reload app to load the program
  location.reload();
}
