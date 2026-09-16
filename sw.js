// Service worker: network-first for all same-origin GETs, with a cache fallback
// for offline. This keeps the app fresh after every deploy (no stale HTML/JS,
// no manual cache-bust ritual) while still working offline from the last-seen
// copy. Cross-origin requests (Supabase, fonts) pass straight through.
// Escape hatch if it ever misbehaves: the in-app "↻ Reset cache" button
// unregisters this worker and clears caches.
const CACHE = "kitchen-archive-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  if (new URL(req.url).origin !== location.origin) return; // Supabase, fonts, etc.
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200 && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((cached) => cached || (req.mode === "navigate" ? caches.match("./index.html") : undefined)))
  );
});
