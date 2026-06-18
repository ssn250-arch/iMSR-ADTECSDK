import React from 'react';

export default function SplashScreen({ isAppReady }) {
  return (
    <div className={`fixed inset-0 z-[999] bg-[#020817] flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${isAppReady ? 'opacity-0 pointer-events-none scale-105 blur-sm' : 'opacity-100 scale-100 blur-none'}`}>
      <div className="absolute inset-0 tech-grid opacity-20"></div>
      <div className="relative flex flex-col items-center">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 md:w-40 md:h-40 bg-cyan-600/40 blur-[50px] rounded-full animate-pulse"></div>
         <img src="Logo ADTEC JTM 2025 Kampus Sandakan.png" alt="Logo ADTEC" className="w-20 md:w-28 relative z-10 drop-shadow-2xl animate-float" />
         <h1 className="mt-6 text-xl md:text-2xl font-black tracking-tight text-white relative z-10 drop-shadow-lg">
           iMSR <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">ADTEC JTM</span>
         </h1>
         <span className="text-cyan-400/80 text-[9px] md:text-[10px] font-bold tracking-[0.3em] uppercase mt-1.5 relative z-10">Kampus Sandakan</span>
         
         <div className="mt-8 w-40 h-1 bg-slate-800 rounded-full overflow-hidden relative z-10 shadow-inner">
           <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 w-1/2 animate-slide rounded-full"></div>
         </div>
         <p className="mt-3 text-[11px] font-semibold text-slate-500 animate-pulse tracking-wider">Memuatkan Sistem...</p>
      </div>
    </div>
  );
}