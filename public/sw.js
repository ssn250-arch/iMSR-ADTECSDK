const CACHE_NAME = 'imsr-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/Logo ADTEC JTM 2025 Kampus Sandakan.png'
];

// Pasang Service Worker & Simpan Cache Asas
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Strategi Ambil Data (Network First, Tukar ke Cache Jika Offline)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});