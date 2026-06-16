import React from 'react';
import { Cpu, Award } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full relative z-30 mt-auto bg-gradient-to-b from-transparent to-slate-100/60 dark:to-[#03091e]/30 border-t border-slate-200/40 dark:border-slate-800/40 pt-10 pb-28 md:pb-10 backdrop-blur-sm">
      
      {/* Pantulan Cahaya Neon Lembut di Bahagian Bawah Skrin */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-16 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center gap-5">
        
        {/* Slogan Eksklusif TVET (Moden & Profesional) */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur opacity-15 group-hover:opacity-20 transition-opacity duration-500"></div>
          <h4 className="relative bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent text-[11px] md:text-xs font-black tracking-[0.25em] uppercase px-6 py-2 rounded-full border border-slate-200/80 dark:border-slate-800/60 bg-white/70 dark:bg-slate-950/40 shadow-sm transition-all duration-300">
            Empowering Skills, Igniting Futures
          </h4>
        </div>

        {/* Lencana Rangkaian Institusi */}
        <div className="flex items-center gap-3 text-slate-400 dark:text-slate-600 text-[10px] font-black uppercase tracking-wider">
          <span className="flex items-center gap-1"><Cpu size={12} className="text-cyan-500/70" /> TVET Malaysia</span>
          <span className="text-slate-300 dark:text-slate-800">•</span>
          <span className="flex items-center gap-1"><Award size={12} className="text-blue-500/70" /> JTM Network</span>
        </div>

        {/* Informasi Struktur Kolej & Kementerian */}
        <div className="flex flex-col items-center gap-0.5">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 tracking-wide">
            Kolej Teknologi Termaju (ADTEC) Sandakan
          </p>
          <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Jabatan Tenaga Manusia • Kementerian Sumber Manusia
          </p>
        </div>

        {/* Hak Cipta & Nama Sistem */}
        <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-600 tracking-wide mt-1">
          Hak Cipta Terpelihara &copy; {new Date().getFullYear()} • iMSR ADTEC Sandakan
        </p>

      </div>
    </footer>
  );
}