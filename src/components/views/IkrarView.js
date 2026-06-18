import React from 'react';
import { ScrollText, ShieldCheck, Scale, Award, Star, GraduationCap, Upload, FileDown, Eye } from 'lucide-react';

export default function IkrarView({ isAdmin, ikrarFile, handleIkrarFileUpload, setViewingMemo }) {
  return (
    <div className="px-4 lg:px-8 max-w-4xl mx-auto pb-32 pt-6 animate-in slide-in-from-bottom-8 duration-700 fade-in">
      
      {/* PANEL KAWALAN PDF (Admin Upload & User Download) */}
      <div className="mb-8 flex flex-col md:flex-row items-center justify-center gap-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 shadow-sm">
        {isAdmin && (
          <label className="relative overflow-hidden cursor-pointer bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-transform active:scale-95 shadow-md">
            <Upload size={16} className="text-rose-400" /> Muat Naik PDF Ikrar
            <input type="file" accept=".pdf,image/*" onChange={handleIkrarFileUpload} className="hidden" />
          </label>
        )}
        
        {ikrarFile ? (
          <button 
            onClick={() => setViewingMemo({ url: ikrarFile, name: 'Ikrar Pelajar.pdf', type: ikrarFile.startsWith('data:application/pdf') ? 'pdf' : 'image' })} 
            className="bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-transform hover:scale-105 active:scale-95"
          >
            <Eye size={16} /> Papar PDF Ikrar
          </button>
        ) : (
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 italic">Tiada fail PDF dimuat naik.</span>
        )}
      </div>

      {/* Header Dokumen Rasmi */}
      <div className="text-center mb-10 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-rose-500/20 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-rose-500/10 to-orange-500/10 rounded-full border border-rose-500/20 text-rose-500 mb-5 shadow-[0_0_30px_rgba(244,63,94,0.15)] relative z-10">
          <ScrollText size={40} strokeWidth={1.5} />
        </div>
        <h2 className="text-xs md:text-sm font-black tracking-[0.3em] text-slate-500 dark:text-slate-400 uppercase mb-2">
          Kolej Teknologi Termaju (ADTEC) <br className="md:hidden"/> Kampus Sandakan
        </h2>
        <h1 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tight drop-shadow-md">
          Lafaz <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">Ikrar Pelajar</span>
        </h1>
      </div>

      {/* Kad Dokumen Ikrar */}
      <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-[2.5rem] shadow-2xl overflow-hidden p-6 md:p-12">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-rose-500/20 to-transparent rounded-bl-[100px] pointer-events-none"></div>
        
        <div className="relative z-10">
          <p className="text-center text-sm md:text-lg font-bold text-slate-700 dark:text-slate-300 leading-relaxed mb-8 md:mb-12">
            Kami pelajar-pelajar <span className="text-rose-600 dark:text-rose-400 font-black">ADTEC JTM Kampus Sandakan</span> berikrar dan berjanji dengan sepenuh hati:
          </p>

          <div className="space-y-6 md:space-y-8">
            <div className="flex gap-4 items-start group">
              <div className="shrink-0 p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-200 dark:border-rose-500/20 group-hover:scale-110 transition-transform shadow-sm">
                <Scale size={24} />
              </div>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed pt-1">
                Akan <strong className="text-slate-800 dark:text-slate-200">patuh kepada semua peraturan</strong> yang termaktub dalam buku tatatertib pelajar Jabatan Tenaga Manusia, Kementerian Sumber Manusia Malaysia[cite: 1];
              </p>
            </div>

            <div className="flex gap-4 items-start group">
              <div className="shrink-0 p-3 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 rounded-2xl border border-orange-200 dark:border-orange-500/20 group-hover:scale-110 transition-transform shadow-sm">
                <ShieldCheck size={24} />
              </div>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed pt-1">
                Dan <strong className="text-slate-800 dark:text-slate-200">arahan-arahan yang ditetapkan</strong> oleh pihak institut dari semasa ke semasa[cite: 1];
              </p>
            </div>

            <div className="flex gap-4 items-start group">
              <div className="shrink-0 p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-200 dark:border-amber-500/20 group-hover:scale-110 transition-transform shadow-sm">
                <Award size={24} />
              </div>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed pt-1">
                Akan <strong className="text-slate-800 dark:text-slate-200">menghormati dan mematuhi</strong> semua bimbingan serta arahan daripada pegawai dan kakitangan institut[cite: 1]; dan
              </p>
            </div>

            <div className="flex gap-4 items-start group">
              <div className="shrink-0 p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 group-hover:scale-110 transition-transform shadow-sm">
                <GraduationCap size={24} />
              </div>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed pt-1">
                Akan mengikuti latihan dengan penuh minat, tekun dan berusaha sehingga <strong className="text-slate-800 dark:text-slate-200">mencapai kejayaan selaras dengan wawasan negara</strong>[cite: 1].
              </p>
            </div>
          </div>

          <hr className="my-10 border-slate-200 dark:border-slate-800" />

          {/* Slogan Kampus */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center gap-2 text-[10px] md:text-xs font-black tracking-widest text-rose-500 uppercase mb-3">
              <Star size={12} className="animate-pulse"/> Slogan Kampus <Star size={12} className="animate-pulse"/>
            </div>
            <h3 className="text-lg md:text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-snug">
              "Memperkasa Kemahiran,<br className="hidden md:block"/> Menyemarakkan Masa Hadapan"[cite: 1]
            </h3>
          </div>

        </div>
      </div>
    </div>
  );
}