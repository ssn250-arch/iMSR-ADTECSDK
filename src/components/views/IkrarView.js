import React from 'react';
import { ScrollText, ShieldCheck, Scale, Award, Star, GraduationCap, Upload, Eye } from 'lucide-react';

export default function IkrarView({ isAdmin, ikrarFile, handleIkrarFileUpload, setViewingMemo }) {
  return (
    <div className="px-4 lg:px-8 max-w-3xl mx-auto pb-32 pt-6 animate-in slide-in-from-bottom-8 duration-700 fade-in">
      
      {/* PANEL KAWALAN DOKUMEN */}
      <div className="mb-8 flex flex-col md:flex-row items-center justify-center gap-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 shadow-sm relative z-20">
        {isAdmin && (
          <label className="relative overflow-hidden cursor-pointer bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-transform active:scale-95 shadow-md">
            <Upload size={16} className="text-rose-400" /> Muat Naik Dokumen Ikrar
            <input type="file" accept=".pdf, .png, .jpg, .jpeg" onChange={handleIkrarFileUpload} className="hidden" />
          </label>
        )}
        
        {ikrarFile ? (
          <button 
            onClick={() => {
              const isPdf = ikrarFile.startsWith('data:application/pdf');
              setViewingMemo({ url: ikrarFile, name: isPdf ? 'Ikrar_Pelajar.pdf' : 'Ikrar_Pelajar.jpg', type: isPdf ? 'pdf' : 'image' });
            }} 
            className="bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-transform hover:scale-105 active:scale-95"
          >
            <Eye size={16} /> Papar Dokumen Ikrar
          </button>
        ) : (
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 italic">Tiada fail dokumen rasmi dimuat naik.</span>
        )}
      </div>

      {/* HEADER DOKUMEN RASMI */}
      <div className="text-center mb-10 relative z-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-rose-500/20 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-rose-500/10 to-orange-500/10 rounded-full border border-rose-500/20 text-rose-500 mb-5 shadow-[0_0_30px_rgba(244,63,94,0.15)] relative z-10">
          <ScrollText size={40} strokeWidth={1.5} />
        </div>
        <h2 className="text-xs md:text-sm font-black tracking-[0.3em] text-slate-500 dark:text-slate-400 uppercase mb-2">
          ADTEC JTM Kampus Sandakan
        </h2>
        <h1 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tight drop-shadow-md">
          Lafaz <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">Ikrar Pelajar</span>
        </h1>
      </div>

      {/* KAD DOKUMEN IKRAR (CLEAN & MODERN) */}
      <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/60 dark:border-slate-800/60 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(244,63,94,0.08)] overflow-hidden p-6 md:p-12 group">
        
        {/* --- LAYER 1: CLEAN TECH BACKGROUND --- */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2.5rem]">
          {/* Dot Matrix Pattern yang sangat pudar dan bersih */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(244 63 94) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          
          {/* Soft Glowing Orbs (Sudut Atas & Bawah) */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-[80px]"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-[80px]"></div>
          
          {/* Subtle Hover Border Glow */}
          <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-transparent via-rose-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        </div>
        
        {/* --- LAYER 2: KANDUNGAN TEKS IKRAR --- */}
        <div className="relative z-10">
          <p className="text-center text-sm md:text-[17px] font-semibold text-slate-700 dark:text-slate-300 leading-relaxed mb-10 md:mb-12">
            Kami pelajar-pelajar <br className="md:hidden"/>
            <span className="text-rose-600 dark:text-rose-400 font-black relative inline-block mx-1">
              ADTEC JTM Kampus Sandakan
              <span className="absolute -bottom-1.5 left-0 w-full h-[3px] bg-rose-500/20 rounded-full"></span>
            </span> 
            <br className="md:hidden"/> berikrar dan berjanji dengan sepenuh hati:
          </p>

          <div className="space-y-7 md:space-y-8">
            
            {/* Poin 1 */}
            <div className="flex gap-4 md:gap-5 items-start">
              <div className="shrink-0 p-3.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-[1.1rem] border border-rose-100 dark:border-rose-500/20 shadow-sm transition-transform hover:scale-105">
                <Scale size={22} strokeWidth={2} />
              </div>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed pt-1.5">
                Akan <strong className="text-slate-800 dark:text-slate-200">patuh kepada semua peraturan</strong> yang termaktub dalam buku tatatertib pelajar Jabatan Tenaga Manusia, Kementerian Sumber Manusia Malaysia;
              </p>
            </div>

            {/* Poin 2 */}
            <div className="flex gap-4 md:gap-5 items-start">
              <div className="shrink-0 p-3.5 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 rounded-[1.1rem] border border-orange-100 dark:border-orange-500/20 shadow-sm transition-transform hover:scale-105">
                <ShieldCheck size={22} strokeWidth={2} />
              </div>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed pt-1.5">
                Dan <strong className="text-slate-800 dark:text-slate-200">arahan-arahan yang ditetapkan</strong> oleh pihak institut dari semasa ke semasa;
              </p>
            </div>

            {/* Poin 3 */}
            <div className="flex gap-4 md:gap-5 items-start">
              <div className="shrink-0 p-3.5 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-[1.1rem] border border-amber-100 dark:border-amber-500/20 shadow-sm transition-transform hover:scale-105">
                <Award size={22} strokeWidth={2} />
              </div>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed pt-1.5">
                Akan <strong className="text-slate-800 dark:text-slate-200">menghormati dan mematuhi</strong> semua bimbingan serta arahan daripada pegawai dan kakitangan institut; dan
              </p>
            </div>

            {/* Poin 4 (Teks Dikemas Kini) */}
            <div className="flex gap-4 md:gap-5 items-start">
              <div className="shrink-0 p-3.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-[1.1rem] border border-emerald-100 dark:border-emerald-500/20 shadow-sm transition-transform hover:scale-105">
                <GraduationCap size={22} strokeWidth={2} />
              </div>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed pt-1.5">
                Akan mengikuti latihan dengan penuh minat, tekun dan berusaha sehingga <strong className="text-slate-800 dark:text-slate-200">mencapai kejayaan selaras dengan wawasan negara dan slogan kampus iaitu:</strong>
              </p>
            </div>
            
          </div>

          {/* Garisan Pemisah Lembut */}
          <div className="my-10 flex justify-center">
            <div className="w-2/3 h-[1px] bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent"></div>
          </div>

          {/* SLOGAN KAMPUS */}
          <div className="text-center relative z-10 animate-in fade-in zoom-in duration-700 delay-300">
            <div className="inline-flex items-center justify-center gap-2 text-[10px] md:text-xs font-black tracking-widest text-rose-500 uppercase mb-4 bg-rose-50 dark:bg-rose-500/10 px-5 py-2 rounded-full border border-rose-200 dark:border-rose-500/20 shadow-sm">
              <Star size={13} className="animate-pulse"/> SLOGAN KAMPUS <Star size={13} className="animate-pulse"/>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-snug drop-shadow-sm">
              "Memperkasa Kemahiran,<br className="hidden md:block"/> Menyemarakkan Masa Hadapan"
            </h3>
          </div>

        </div>
      </div>
    </div>
  );
}