const CACHE_NAME = "celotasks-v1";
const OFFLINE_URL = "/offline";

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
  "/",
  "/offline",
  "/dashboard",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Skip cross-origin requests (wallet RPCs, Privy, etc.)
  if (url.origin !== self.location.origin) return;

  // Network-first for navigation (HTML pages) — fall back to offline page
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Cache-first for static assets (images, fonts, icons)
  if (
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|woff2?|ttf)$/)
  ) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) => cached ?? fetch(event.request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          return res;
        })
      )
    );
    return;
  }

  // Stale-while-revalidate for Next.js JS/CSS chunks
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const network = fetch(event.request)
          .then((res) => {
            if (res.ok) {
              caches.open(CACHE_NAME).then((c) => c.put(event.request, res.clone()));
            }
            return res;
          })
          .catch(() => cached);
        return cached ?? network;
      })
    );
  }
});
