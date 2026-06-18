import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// --- KONFIGURASI PWA SERVICE WORKER ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('PWA Service Worker Berjaya Didaftarkan: ', reg.scope);
      })
      .catch((err) => {
        console.log('PWA Registration Gagal: ', err);
      });
  });

  // --- KOD BARU: FUNGSI AUTO-UPDATE SEMASA APP TERBUKA ---
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      console.log('[PWA] Kemas kini sistem dikesan! Memuat semula aplikasi secara automatik...');
      window.location.reload(); // Paksa app refresh sendiri bila dapat kod baru dari pelayan
      refreshing = true;
    }
  });
}