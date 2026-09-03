// Bump this on EVERY static-file change or returning visitors keep the old page.
const CACHE_NAME = 'lionel-portfolio-v14-2026-09-03';
// Only same-origin files the shell needs to paint. Cross-origin assets (the
// unpkg ionicons module, Google Fonts) are deliberately NOT precached: a single
// failed request rejects cache.addAll() and the whole install aborts, which is
// how an "offline-capable" PWA ends up with no cache at all. 2026-09-02 audit.
const ASSETS = [
    '/',
    '/index.html',
    // versioned to match the <link> in the page: a stale entry for the
    // old URL can never satisfy a request for the new one
    '/style.css?v=13',
    '/manifest.json',
    '/selfie.png',
    '/selfie2.png',
    '/favicon-16x16.png',
    '/favicon-32x32.png',
    '/apple-touch-icon.png',
    '/404.html',
    '/erp-login-preview.png',
    '/amaxleather-preview.png',
    '/aurora-preview.png',
    '/standardinstall-preview.png',
    '/Lionel_Wang_Resume.pdf'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        // addAll() is all-or-nothing: one 404 aborts the whole install. Add each
        // file individually so a missing asset costs that file, not the cache.
        // cache: 'reload' bypasses the browser's own HTTP cache while filling
        // ours. Without it a version bump populated the NEW cache with the OLD
        // bytes still sitting in the HTTP cache, and visitors kept seeing the
        // previous deploy however many times they reloaded. 2026-09-02 review.
        caches.open(CACHE_NAME).then(cache =>
            Promise.all(ASSETS.map(url =>
                cache.add(new Request(url, { cache: 'reload' })).catch(() => null)
            ))
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

// Page loads go to the network first and fall back to the cache, so a deploy is
// visible on the next reload instead of whenever the cache happens to turn over.
// Everything else stays cache-first, which is what makes the page paint instantly
// and still work offline.
self.addEventListener('fetch', (e) => {
    if (e.request.mode === 'navigate') {
        e.respondWith(
            fetch(e.request)
                .then((res) => {
                    const copy = res.clone();
                    caches.open(CACHE_NAME).then(c => c.put(e.request, copy)).catch(() => {});
                    return res;
                })
                .catch(() => caches.match(e.request).then(r => r || caches.match('/')))
        );
        return;
    }
    e.respondWith(
        caches.match(e.request).then(cached => cached || fetch(e.request))
    );
});
