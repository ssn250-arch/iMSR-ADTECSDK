// --- NOTA ADMIN: Tukar nama versi cache di bawah (Cth: v1 -> v2 -> v3) setiap kali ada update besar pada GUI ---
const CACHE_NAME = 'imsr-cache-v7'; 

const urlsToCache = [
  '/',
  '/index.html',
  '/Logo ADTEC JTM 2025 Kampus Sandakan.png'
];

// 1. Peristiwa Install (Memasang SW Baru)
self.addEventListener('install', (event) => {
  // PAKSA service worker baru untuk mengambil alih sistem serta-merta tanpa perlu tunggu user tutup app
  self.skipWaiting(); 
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// 2. Peristiwa Activate (Kunci Penyelesaian Isu Kau!)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          // Jika sistem jumpa folder cache versi lama (Cth: imsr-cache-v1), PADAMKAN IA SAKAN-SAKAN!
          if (cache !== CACHE_NAME) {
            console.log('[PWA] Memadam cache versi lama yang lapuk:', cache);
            return caches.delete(cache); 
          }
        })
      );
    }).then(() => {
      // Paksa semua tab/aplikasi PWA yang sedang aktif untuk guna kod terbaharu sekarang juga
      return self.clients.claim(); 
    })
  );
});

// 3. Peristiwa Fetch (Ambil Data)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    // Cuba ambil versi paling baharu dari internet dahulu (Network First)
    fetch(event.request).catch(() => {
      // Jika pelajar tiada internet (Offline), barulah bagi fail dalam memori telefon
      return caches.match(event.request);
    })
  );
});