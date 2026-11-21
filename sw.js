const CACHE = "sovyatnya-202611211310";
const SHELL = ["./", "./index.html", "./app.js", "./manifest.webmanifest", "./icon-180.png", "./icon-192.png", "./icon-512.png", "./Gogol.woff2", "./owl-body.webp", "./owl-wing-l.webp", "./owl-wing-r.webp", "./owl-eyes-closed.webp", "./grow-egg.webp", "./grow-crack.webp", "./grow-hatch.webp", "./grow-hatch-c.webp", "./grow-chick.webp", "./grow-chick-c.webp", "./grow-owlet.webp", "./grow-owlet-c.webp", "./PTMono-cyr.woff2", "./PTMono-lat.woff2"];
const OPTIONAL = ["./owly-config.js"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL).then(() => Promise.all(OPTIONAL.map((u) => c.add(u).catch(() => {})))))); self.skipWaiting(); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE && k.startsWith("sovyatnya-") ).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === location.origin && url.pathname.startsWith("/api/")) return;
  if (/googleapis\.com|firebaseio\.com|firebaseapp\.com|gstatic\.com\/firebasejs/.test(url.host + url.pathname) && !/fonts\./.test(url.host)) return; // Firebase traffic: never cache // sync API: never cache
  // app files: network first (get updates), cache when offline
  if (url.origin === location.origin) {
    e.respondWith(fetch(req, { cache: "no-cache" }).then((r) => { const cp = r.clone(); if (r.ok) caches.open(CACHE).then((c) => c.put(req, cp)); return r; }).catch(() => caches.match(req, { ignoreSearch: true }).then((m) => m || caches.match("./index.html"))));
    return;
  }
  // fonts and cover images: cache first
  if (/fonts\.(googleapis|gstatic)\.com|covers\.openlibrary\.org|books\.google\.|googleusercontent\.com/.test(url.host)) {
    e.respondWith(caches.open("sovyatnya-assets").then((c) => c.match(req).then((m) => m || fetch(req).then((r) => { if (r.ok || r.type === "opaque") c.put(req, r.clone()); return r; }))));
  }
});
