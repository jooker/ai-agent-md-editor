const CACHE_NAME = "agentforge-v3"; // Increment cache name to clear out old v2 cache
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.jpg",
  "/icon-512.jpg",
  "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
];

self.addEventListener("install", (e) => {
  self.skipWaiting(); // Force active immediately
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener("activate", (e) => {
  // Clear old cache versions
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  // Only handle GET requests
  if (e.request.method !== "GET") {
    return;
  }

  const url = new URL(e.request.url);
  
  // Bypass API requests from Service Worker interception
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Navigate/HTML requests: Network-First to guarantee latest code bundle
  if (e.request.mode === "navigate" || url.pathname === "/" || url.pathname.endsWith(".html")) {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          return response;
        })
        .catch(() => {
          return caches.match(e.request);
        })
    );
    return;
  }

  // Other assets: Cache-First, falling back to network and caching new resources
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request)
        .then((response) => {
          // Cache successful static asset responses
          if (response.status === 200 && (url.pathname.includes("/assets/") || url.pathname.includes("icon"))) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          }
          return response;
        })
        .catch(() => {
          // Return a fallback response when network fetch fails
          return new Response("Offline", { status: 503, statusText: "Service Unavailable" });
        });
    })
  );
});
