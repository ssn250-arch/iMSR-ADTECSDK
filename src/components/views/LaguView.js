import React from 'react';
import { AudioLines } from 'lucide-react';

export default function LaguView() {
  return (
    <div className="p-4 max-w-2xl mx-auto pb-32 text-center">
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 p-6 md:p-12 space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-violet-500/20 rounded-full blur-[60px] pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-cyan-500/20 rounded-full blur-[60px] pointer-events-none"></div>
        
        <div className="relative z-10 bg-violet-100 dark:bg-violet-900/50 w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-violet-200 dark:border-violet-800/50">
          <AudioLines size={40} className="text-violet-500 dark:text-violet-400 animate-pulse duration-[3000ms]" />
        </div>
        
        <h3 className="text-2xl md:text-4xl font-black relative z-10 tracking-tight text-slate-800 dark:text-white">LAGU KORPORAT JTM</h3>
        
        <div className="space-y-5 text-sm md:text-lg leading-loose md:leading-loose italic text-slate-600 dark:text-slate-300 font-bold relative z-10 px-2 md:px-8 py-4">
          <p className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Peneraju Pembangun<br/>Tenaga Mahir Negara<br/>Jabatan Tenaga Manusia</p>
          <p className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Kami Cekal Berhemah<br/>Khidmat Cekal Berkualiti<br/>Menjadi Amanat Semua</p>
          
          <div className="bg-gradient-to-br from-violet-50 to-slate-50 dark:from-slate-900 dark:to-violet-950/30 p-6 rounded-[1.5rem] not-italic font-black border border-violet-200/50 shadow-sm mt-6 transform hover:scale-105 transition-transform duration-500">
            <span className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-violet-500 block mb-3">Korus</span>
            <p className="text-slate-800 dark:text-violet-100 text-base md:text-xl leading-relaxed">
              Mendukung Misi Bersama<br/>Membangun Sumber Manusia<br/>Itulah Janji Pada Negara<br/><span className="text-violet-600 dark:text-violet-400 text-lg md:text-2xl mt-1.5 block">Malaysia Berjaya</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}