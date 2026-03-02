const CACHE_NAME = "qr-scanner-v7";

self.addEventListener("install", (event) => {
  console.log("SW installing");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("SW activating");
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    }).catch((err) => {
      console.log("fetch error:", err);
    })
  );
});
