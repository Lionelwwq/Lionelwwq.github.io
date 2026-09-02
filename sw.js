// Bump this on EVERY static-file change or returning visitors keep the old page.
const CACHE_NAME = 'lionel-portfolio-v4-2026-09-02';
// Only same-origin files the shell needs to paint. Cross-origin assets (the
// unpkg ionicons module, Google Fonts) are deliberately NOT precached: a single
// failed request rejects cache.addAll() and the whole install aborts, which is
// how an "offline-capable" PWA ends up with no cache at all. 2026-09-02 audit.
const ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/manifest.json',
    '/selfie.png',
    '/selfie2.png',
    '/favicon-16x16.png',
    '/favicon-32x32.png',
    '/apple-touch-icon.png',
    '/404.html',
    '/erp-login-preview.png',
    '/erp-tearsheets-preview.png',
    '/videomaker-preview.png',
    '/amaxleather-preview.png',
    '/aurora-preview.png',
    '/standardinstall-preview.png',
    '/Lionel_Wang_Resume.pdf'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        // addAll() is all-or-nothing: one 404 aborts the whole install. Add each
        // file individually so a missing asset costs that file, not the cache.
        caches.open(CACHE_NAME).then(cache =>
            Promise.all(ASSETS.map(url => cache.add(url).catch(() => null)))
        )
    );
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then(cached => cached || fetch(e.request))
    );
});
