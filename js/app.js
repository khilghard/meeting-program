// Select the video element
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const output = document.getElementById("output");
const context = canvas.getContext("2d");

// Access the device camera and stream to video element
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
  .then(stream => {
    video.srcObject = stream;
    video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
    video.play();
    requestAnimationFrame(tick);
  });

function tick() {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.hidden = false;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    if (code) {
      output.textContent = `QR Code Data: ${code.data}`;
      // Draw the bounding box around the QR code
      drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
      drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
      drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
      drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");
    } else {
      output.textContent = "No QR code detected.";
    }
  }
  requestAnimationFrame(tick);
}

function drawLine(begin, end, color) {
  context.beginPath();
  context.moveTo(begin.x, begin.y);
  context.lineTo(end.x, end.y);
  context.lineWidth = 4;
  context.strokeStyle = color;
  context.stroke();
}

function showUpdateNotification() {
  const updateNotification = document.getElementById("update-notification");
  updateNotification.hidden = false;
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register('/meeting-program/service-worker.js')
    .then(registration => {
      console.log("Service Worker registered with scope:", registration.scope);

      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        installingWorker.onstatechange = () => {
          if (installingWorker.state === "installed") {
            if (navigator.serviceWorker.controller) {
              console.log("New content is available; please refresh.");
              showUpdateNotification();
            } else {
              console.log("Content is cached for offline use.");
            }
          }
        };
      };
    })
    .catch(error => {
      console.log("Service Worker registration failed:", error);
    });
}
