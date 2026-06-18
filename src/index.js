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

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('PWA Service Worker Berjaya Didaftarkan');
        
        // KOD BARU: Cek update secara automatik bila pengguna masuk semula ke aplikasi
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            console.log('[PWA] Aplikasi aktif semula, menyemak kemas kini...');
            reg.update(); // Minta SW semak dengan server GitHub
          }
        });
      })
      .catch((err) => console.log('PWA Registration Gagal: ', err));
  });

  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      console.log('[PWA] Kemas kini dipasang! Memuat semula...');
      window.location.reload(); 
      refreshing = true;
    }
  });
}