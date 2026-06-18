import React, { useEffect, useState } from 'react';

export default function SplashScreen({ isAppReady }) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulasi pergerakan loading bar yang lancar
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return 90; // Tahan pada 90% selagi data belum sedia
        return prev + Math.floor(Math.random() * 15) + 5; 
      });
    }, 150);

    if (isAppReady) {
      setProgress(100);
      setTimeout(() => {
        setIsFadingOut(true);
      }, 500); // Beri masa untuk user tengok 100% sebelum hilang
    }

    return () => clearInterval(interval);
  }, [isAppReady]);

  if (isAppReady && isFadingOut) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#020817] transition-opacity duration-700 ${isAppReady && progress === 100 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      
      {/* Efek Cahaya Latar Belakang (Glowing Orbs) */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-600/20 blur-[100px] rounded-full pointer-events-none animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Kandungan Utama */}
      <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in-95 duration-1000">
        
        {/* Logo Glassmorphism */}
        <div className="bg-white/5 p-5 rounded-[2rem] backdrop-blur-md border border-white/10 shadow-[0_0_40px_rgba(6,182,212,0.15)] mb-8 transform transition-transform hover:scale-105">
          <img 
            src="/Logo ADTEC JTM 2025 Kampus Sandakan.png" 
            alt="Logo ADTEC" 
            className="w-24 h-24 md:w-28 md:h-28 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] animate-float"
          />
        </div>

        {/* Tipografi Moden */}
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2 drop-shadow-lg">
          iMSR <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">ADTEC</span>
        </h1>
        <h2 className="text-[10px] md:text-xs font-bold tracking-[0.4em] text-slate-400 uppercase mb-16 text-center">
          Kampus Sandakan
        </h2>

        {/* Progress Bar Gred Aplikasi */}
        <div className="w-64 md:w-72 max-w-[80vw] flex flex-col items-center gap-3">
          <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50 shadow-inner relative">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              {/* Kilatan cahaya di hujung bar loading */}
              <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-white/60 blur-[2px]"></div>
            </div>
          </div>
          <div className="flex justify-between w-full px-1">
            <p className="text-[9px] md:text-[10px] text-cyan-400/80 font-mono tracking-widest uppercase animate-pulse">
              Memuatkan Sistem...
            </p>
            <p className="text-[10px] text-slate-400 font-mono font-bold">
              {progress}%
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}