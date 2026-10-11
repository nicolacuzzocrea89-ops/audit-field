// Audit Field: copia locale dell'app, così si apre anche senza rete.
const CACHE = 'audit-field-v3';
const FILES = ['./', 'index.html', 'docx.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(req, { ignoreSearch: true });
    const fresh = fetch(req).then(res => { if(res && res.ok) cache.put(req, res.clone()); return res; }).catch(() => null);
    return cached || (await fresh) || new Response('Audit Field non disponibile senza rete: aprila una volta con la connessione attiva.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }));
});
