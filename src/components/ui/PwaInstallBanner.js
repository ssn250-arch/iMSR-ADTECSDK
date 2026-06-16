import React from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export default function PwaInstallBanner({ show, onInstall, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 md:bottom-24 md:left-auto md:right-6 md:w-96 z-[180] animate-in slide-in-from-bottom-10 duration-500">
      <div className="bg-gradient-to-r from-slate-900 via-[#0b1b3d] to-slate-900 border border-cyan-500/40 p-4 rounded-2xl shadow-[0_10px_30px_rgba(34,211,238,0.2)] flex flex-col gap-3 relative overflow-hidden backdrop-blur-xl">
        
        {/* Kesan Cahaya Latar Belakang Banner */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-start gap-3">
          <div className="bg-cyan-500/10 p-2.5 rounded-xl text-cyan-400 shrink-0 border border-cyan-500/20">
            <Smartphone size={22} className="animate-pulse" />
          </div>
          <div className="pr-6">
            <h4 className="font-black text-xs md:text-sm text-white tracking-tight">Pasang Aplikasi iMSR!</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed font-medium mt-0.5">
              Akses sistem dengan lebih pantas, jimat data internet, & terus dari skrin utama Android anda.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full mt-1">
          <button 
            onClick={onInstall}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-slate-950 dark:text-white font-black text-xs py-2.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Download size={14} /> Pasang Sekarang
          </button>
          <button 
            onClick={onClose}
            className="px-3 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-colors"
          >
            Nanti
          </button>
        </div>

        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1 rounded-full"
          aria-label="Tutup Banner"
        >
          <X size={14}/>
        </button>
      </div>
    </div>
  );
}