/**
 * Service worker minimal (Etapa 11 — PWA instalabilă).
 * Navigare: network-first cu fallback la shell-ul din cache (offline-friendly).
 * Suficient pentru criteriul de instalabilitate (manifest + SW cu handler fetch).
 */
const CACHE = "piata-v1";

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.add("/")));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).catch(() => caches.match("/")));
  }
});
