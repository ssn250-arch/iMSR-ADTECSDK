import React from 'react';
import { Info, ChevronRight, X } from 'lucide-react';

export default function ToastNotification({ showToast, info, setShowToast, navigateTo }) {
  if (!showToast) return null;

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-8 md:top-8 md:w-[26rem] z-[150] animate-in slide-in-from-top-10 fade-in duration-500">
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-5 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] flex flex-col gap-3 border border-cyan-400/50 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-black/20">
           <div className="h-full bg-cyan-400 animate-progress"></div>
        </div>
        
        <div className="flex items-start gap-4">
          <div className="bg-white/20 p-2.5 rounded-xl shrink-0 mt-1">
            <Info className="animate-pulse" size={24} />
          </div>
          <div className="pr-6 mt-0.5">
            <h4 className="font-extrabold text-sm md:text-base tracking-tight mb-1">Kemas Kini Baharu!</h4>
            <p className="text-xs text-cyan-100 leading-relaxed font-medium">
              {info?.text || "Terdapat maklumat jadual, fail dokumen, atau pengumuman yang terkini."}
            </p>
          </div>
        </div>

        {info?.view && (
          <button 
            onClick={() => { navigateTo(info.view); setShowToast(false); }}
            className="w-full mt-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 active:scale-95"
            aria-label="Lihat bahagian kemas kini"
          >
            Lihat Bahagian {info.view.charAt(0).toUpperCase() + info.view.slice(1)} <ChevronRight size={14} />
          </button>
        )}

        <button 
          onClick={() => setShowToast(false)} 
          className="absolute top-4 right-4 text-cyan-200 hover:text-white transition-colors bg-black/10 hover:bg-black/30 p-1.5 rounded-full active:scale-90" 
          aria-label="Tutup notifikasi"
        >
          <X size={16}/>
        </button>
      </div>
    </div>
  );
}