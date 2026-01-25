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
// Public API
// ------------------------------------------------------------
export function showScanner() {
  qrSection.hidden = false;
  startQRScanner();

  // When the camera is ready, THEN scroll
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
    qrStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }
    });

    video.srcObject = qrStream;
    video.setAttribute("playsinline", true);
    video.play();

    requestAnimationFrame(scanFrame);
  } catch {
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

  // Only scan every 150ms (≈ 6–7 fps)
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
      stopQRScanner(); // stops camera + loop
      handleScannedUrl(code.data.trim());
      return;
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
  location.reload();
}
