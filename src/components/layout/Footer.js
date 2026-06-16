import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#f8fafc]/50 dark:bg-[#020817]/50 backdrop-blur-md border-t border-slate-200/50 dark:border-slate-800/50 py-8 md:py-10 mt-auto pb-28 md:pb-8 relative z-30">
      <div className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-4">
        
        {/* Tagline */}
        <h4 className="text-[11px] md:text-xs font-black tracking-[0.25em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400">
          Empowering Skills, Igniting Futures
        </h4>
        
        {/* Subtle Line */}
        <div className="w-8 h-[2px] bg-slate-300 dark:bg-slate-700 rounded-full"></div>
        
        {/* Copyright Text */}
        <div className="flex flex-col items-center gap-1.5 text-[9px] md:text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wide">
          <p>Hak Cipta Terpelihara &copy; {new Date().getFullYear()}</p>
          <p className="text-slate-600 dark:text-slate-300">Kolej Teknologi Termaju (ADTEC) Jabatan Tenaga Manusia Kampus Sandakan</p>
        </div>
      </div>
    </footer>
  );
}