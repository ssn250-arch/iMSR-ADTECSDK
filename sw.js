const CACHE_NAME = 'imsr-pwa-cache-v7';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Pasang Service Worker dan simpan cache asas
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Pintas (Intercept) permintaan rangkaian untuk kelajuan
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Pulangkan cache jika ada, jika tidak, muat turun dari internet
        return response || fetch(event.request);
      })
  );
});

// Buang cache lama apabila ada kemas kini
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});