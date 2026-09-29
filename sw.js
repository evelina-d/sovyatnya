const CACHE = "sovyatnya-202609291309";
const SHELL = ["./", "./index.html", "./app.js", "./manifest.webmanifest", "./icon-180.png", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE && k.startsWith("sovyatnya-") ).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // app files: network first (get updates), cache when offline
  if (url.origin === location.origin) {
    e.respondWith(fetch(req).then((r) => { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); return r; }).catch(() => caches.match(req).then((m) => m || caches.match("./index.html"))));
    return;
  }
  // fonts and cover images: cache first
  if (/fonts\.(googleapis|gstatic)\.com|covers\.openlibrary\.org|books\.google\.|googleusercontent\.com/.test(url.host)) {
    e.respondWith(caches.open("sovyatnya-assets").then((c) => c.match(req).then((m) => m || fetch(req).then((r) => { if (r.ok || r.type === "opaque") c.put(req, r.clone()); return r; }))));
  }
});
