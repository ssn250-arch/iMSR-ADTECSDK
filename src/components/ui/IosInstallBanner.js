import React from 'react';
import { X, Share, PlusSquare, Smartphone } from 'lucide-react';

export default function IosInstallBanner({ show, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 md:bottom-24 md:left-auto md:right-6 md:w-96 z-[180] animate-in slide-in-from-bottom-10 duration-500">
      <div className="bg-gradient-to-r from-slate-900 via-[#1e113a] to-slate-900 border border-purple-500/40 p-5 rounded-2xl shadow-[0_10px_30px_rgba(168,85,247,0.2)] flex flex-col gap-3 relative overflow-hidden backdrop-blur-xl">
        
        {/* Kesan Cahaya Latar Belakang (Tema Ungu Apple) */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-start gap-3">
          <div className="bg-purple-500/10 p-2.5 rounded-xl text-purple-400 shrink-0 border border-purple-500/20">
            <Smartphone size={22} className="animate-pulse" />
          </div>
          <div className="pr-6">
            <h4 className="font-black text-xs md:text-sm text-white tracking-tight">Pengguna iPhone / Safari?</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed font-medium mt-0.5">
              Pasang iMSR terus ke skrin utama iPhone anda dengan langkah mudah ini:
            </p>
          </div>
        </div>

        {/* Langkah Panduan Visual */}
        <div className="bg-black/30 border border-white/5 rounded-xl p-3 space-y-2.5 text-slate-300 text-[11px] font-semibold">
          <div className="flex items-center gap-2.5">
            <span className="bg-purple-600 text-white w-5 h-5 rounded-md flex items-center justify-center font-black text-[10px]">1</span>
            <span className="flex items-center gap-1">
              Ketik butang <strong>Kongsi (Share)</strong> <Share size={14} className="text-purple-400 inline" /> di bawah skrin Safari.
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="bg-purple-600 text-white w-5 h-5 rounded-md flex items-center justify-center font-black text-[10px]">2</span>
            <span className="flex items-center gap-1">
              Skrol ke bawah dan pilih <strong>Add to Home Screen</strong> <PlusSquare size={14} className="text-purple-400 inline" />.
            </span>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs py-2 rounded-xl transition-colors text-center"
        >
          Faham, Tutup Panduan
        </button>

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