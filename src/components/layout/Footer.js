import React from 'react';
import { Shield, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full relative z-30 mt-auto bg-gradient-to-b from-transparent to-slate-50/80 dark:to-[#03091e]/40 border-t border-slate-200/30 dark:border-slate-800/40 pt-10 pb-28 md:pb-10 backdrop-blur-sm">
      
      {/* Pantulan Cahaya Neon Lembut di Bahagian Bawah Skrin */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-16 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center text-center gap-5">
        
        {/* Lencana Identiti TVET / JTM */}
        <div className="flex items-center gap-4 text-slate-400 dark:text-slate-600 mb-1">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider">
            <Cpu size={13} className="text-cyan-500/70" />
            <span>TVET Institution</span>
          </div>
          <div className="w-1 h-1 bg-slate-300 dark:bg-slate-800 rounded-full"></div>
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider">
            <Shield size={13} className="text-blue-500/70" />
            <span>JTM Network</span>
          </div>
        </div>

        {/* Gaya Slogan Moden dengan Efek "Glow Pill" */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur opacity-15 group-hover:opacity-30 transition-opacity duration-500"></div>
          <h4 className="relative bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent text-[11px] md:text-xs font-black tracking-[0.3em] uppercase px-5 py-2 rounded-full border border-slate-200/60 dark:border-slate-800/50 bg-white/60 dark:bg-slate-950/40 shadow-sm transition-all duration-300">
            Empowering Skills, Igniting Futures
          </h4>
        </div>

        {/* Informasi Struktur Institusi (Hierarki Teks Profesional) */}
        <div className="flex flex-col items-center gap-1 mt-1">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 tracking-wide">
            Kolej Teknologi Termaju (ADTEC) Sandakan
          </p>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Jabatan Tenaga Manusia • Kementerian Sumber Manusia
          </p>
        </div>

        {/* Garis Pemisah Minimalis */}
        <div className="w-10 h-[1px] bg-slate-200 dark:bg-slate-800/60 mt-1"></div>

        {/* Hak Cipta & Pengenalan Sistem */}
        <p className="text-[9px] md:text-[10px] font-semibold text-slate-400 dark:text-slate-600 tracking-wide">
          Hak Cipta Terpelihara &copy; {new Date().getFullYear()} • Sistem Pengurusan Minggu Silaturahim (iMSR)
        </p>

      </div>
    </footer>
  );
}