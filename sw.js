// offline cache – version 1.104
const C = 'fmtcrm-1.104';
const PC = 'fmtcrm-pdf-6.2.108';   // PDF engine – kept across app updates, only replaced when the engine version changes
const PDF = ['./pdfjs-6.2.108.min.js', './pdfjs-6.2.108.worker.min.js'];
const FILES = ['./', './index.html', './manifest.webmanifest', './icon2-192.png', './icon2-512.png', './icon2-mask-512.png', './icon2-180.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES))
  .then(() => caches.open(PC)).then(c => Promise.all(PDF.map(f => c.match(f).then(h => h || c.add(f).catch(() => { })))))
  .then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C && k !== PC).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (u.searchParams.has('code') || u.searchParams.has('error')) return; // OneDrive sign-in return
  if (/\/pdfjs-[^/]+\.js$/.test(u.pathname)) { e.respondWith(caches.open(PC).then(c => c.match(e.request, { ignoreSearch: true }).then(h => h || fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; })))); return; }   // PDF engine: from the phone, no download
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
});
