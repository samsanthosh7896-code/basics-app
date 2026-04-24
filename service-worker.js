/* ============================================================
   service-worker.js  —  Basics PWA  |  Cache-First Strategy
   Cache name: basics-v1
   ============================================================ */

const CACHE_NAME = 'basics-v1';

const PRECACHE_URLS = [
  './Basics.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './fonts/Fraunces-SemiBold.woff2',
  './fonts/Fraunces-Bold.woff2',
  './fonts/Fraunces-ExtraBold.woff2',
  './fonts/DMSans-Regular.woff2',
  './fonts/DMSans-Medium.woff2',
  './fonts/DMSans-SemiBold.woff2',
  './fonts/DMSans-Bold.woff2',
  './fonts/IBMPlexMono-Regular.woff2',
  './fonts/IBMPlexMono-Medium.woff2',
  './fonts/IBMPlexMono-SemiBold.woff2',
  './fonts/IBMPlexMono-Bold.woff2',
];

/* ── INSTALL: pre-cache all assets ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

/* ── ACTIVATE: purge old caches ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* ── FETCH: cache-first, network fallback ── */
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(networkResponse => {
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type === 'opaque'
        ) return networkResponse;

        const clone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return networkResponse;
      }).catch(() => caches.match('./Basics.html'));
    })
  );
});
