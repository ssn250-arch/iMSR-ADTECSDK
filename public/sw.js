// --- NAIKKAN VERSI INI SEBELUM DEPLOY (Cth: v11) ---
const CACHE_NAME = 'imsr-cache-v11'; 

const urlsToCache = [
  '/',
  '/index.html',
  '/logo.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Paksa aktif serta-merta!
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) return caches.delete(cache);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// STRATEGI SWR (Stale-While-Revalidate) - Loading 0 Saat!
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Simpan versi terbaharu dalam cache secara senyap-senyap
        if (networkResponse.ok) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      }).catch(() => cachedResponse); // Jika offline, guna cache

      return cachedResponse || fetchPromise; // Pulangkan cache dahulu jika ada, jika tak tunggu network
    })
  );
});