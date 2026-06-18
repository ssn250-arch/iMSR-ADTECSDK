import React from 'react';
import { Bell, Zap, ChevronRight, FileSignature, UserCog, CalendarClock, GraduationCap, MapPinned, AudioLines, Cpu, Plus, X, HandHeart } from 'lucide-react';
import NetworkAnimation from '../ui/NetworkAnimation';
import LiveClock from '../ui/LiveClock';
import { formatTarikh } from '../../utils/helpers';

const cardStyles = {
  blue: { iconBg: 'bg-blue-50 dark:bg-blue-950/40', iconText: 'text-blue-600 dark:text-blue-400', iconBorder: 'border-blue-200/60 dark:border-blue-500/30', glow: 'hover:border-blue-400 dark:hover:border-blue-500/50 hover:shadow-[0_12px_40px_rgba(59,130,246,0.15)]', watermark: 'text-blue-500/[0.08] dark:text-blue-400/[0.06]' },
  emerald: { iconBg: 'bg-emerald-50 dark:bg-emerald-950/40', iconText: 'text-emerald-600 dark:text-emerald-400', iconBorder: 'border-emerald-200/60 dark:border-emerald-500/30', glow: 'hover:border-emerald-400 dark:hover:border-emerald-500/50 hover:shadow-[0_12px_40px_rgba(16,185,129,0.15)]', watermark: 'text-emerald-500/[0.08] dark:text-emerald-400/[0.06]' },
  cyan: { iconBg: 'bg-cyan-50 dark:bg-cyan-950/40', iconText: 'text-cyan-600 dark:text-cyan-400', iconBorder: 'border-cyan-200/60 dark:border-cyan-500/30', glow: 'hover:border-cyan-400 dark:hover:border-cyan-500/50 hover:shadow-[0_12px_40px_rgba(6,182,212,0.15)]', watermark: 'text-cyan-500/[0.08] dark:text-cyan-400/[0.06]' },
  indigo: { iconBg: 'bg-indigo-50 dark:bg-indigo-950/40', iconText: 'text-indigo-600 dark:text-indigo-400', iconBorder: 'border-indigo-200/60 dark:border-indigo-500/30', glow: 'hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:shadow-[0_12px_40px_rgba(99,102,241,0.15)]', watermark: 'text-indigo-500/[0.08] dark:text-indigo-400/[0.06]' },
  sky: { iconBg: 'bg-sky-50 dark:bg-sky-950/40', iconText: 'text-sky-600 dark:text-sky-400', iconBorder: 'border-sky-200/60 dark:border-sky-500/30', glow: 'hover:border-sky-400 dark:hover:border-sky-500/50 hover:shadow-[0_12px_40px_rgba(14,165,233,0.15)]', watermark: 'text-sky-500/[0.08] dark:text-sky-400/[0.06]' },
  violet: { iconBg: 'bg-violet-50 dark:bg-violet-950/40', iconText: 'text-violet-600 dark:text-violet-400', iconBorder: 'border-violet-200/60 dark:border-violet-500/30', glow: 'hover:border-violet-400 dark:hover:border-violet-500/50 hover:shadow-[0_12px_40px_rgba(139,92,246,0.15)]', watermark: 'text-violet-500/[0.08] dark:text-violet-400/[0.06]' },
  rose: { iconBg: 'bg-rose-50 dark:bg-rose-950/40', iconText: 'text-rose-600 dark:text-rose-400', iconBorder: 'border-rose-200/60 dark:border-rose-500/30', glow: 'hover:border-rose-400 dark:hover:border-rose-500/50 hover:shadow-[0_12px_40px_rgba(225,29,72,0.15)]', watermark: 'text-rose-500/[0.08] dark:text-rose-400/[0.06]' }
};

export default function HomeView({ isAdmin, announcements, setAnnouncements, saveToFirebaseWithOffline, sesiKemasukan, setSesiKemasukan, tarikhPenutup, setTarikhPenutup, navigateTo }) {
  
  const compiledText = announcements && announcements.length > 0 ? announcements.map(a => a.text.trim()).filter(Boolean).join("   •   ") : "Selamat Datang ke Portal iMSR ADTEC JTM Kampus Sandakan. Sila rujuk dokumen jadual dan pelan pendaftaran.";

  return (
    <div className="px-4 lg:px-8 max-w-6xl mx-auto pb-32 pt-4">
      {/* --- CSS KHAS UNTUK ANIMASI MODEN --- */}
      <style>{`
        @keyframes seamlessMarquee { 0% { transform: translate3d(0, 0, 0); } 100% { transform: translate3d(-50%, 0, 0); } }
        .tech-marquee-track { display: flex; width: max-content; animation: seamlessMarquee 14s linear infinite; will-change: transform; }
        @media (min-width: 768px) { .tech-marquee-track { animation-duration: 20s; } }
        @media (min-width: 1024px) { .tech-marquee-track { animation-duration: 25s; } }
        .tech-marquee-track:hover { animation-play-state: paused; }
        
        /* Animasi Gradient Bernafas pada Tajuk */
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 4s ease infinite;
        }

        /* Animasi Cahaya Melintas (Shimmer) */
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* HERO SECTION TECH THEME (Dengan animasi Slide-in yang Lembut) */}
      <div className="relative rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-[#0a192f] to-[#020c1b] overflow-hidden shadow-2xl border border-cyan-900/30 mb-8 py-2 md:py-6 animate-in slide-in-from-bottom-6 duration-1000 fade-in">
        <NetworkAnimation />
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none animate-float"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-float-delayed"></div>

        <div className="relative z-20 px-6 py-8 md:px-12 md:py-16 flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-10">
          <div className="w-full lg:w-3/5 space-y-5 text-center lg:text-left">
            
            <div className={`flex ${isAdmin ? 'flex-col items-start gap-4' : 'items-center gap-3'} px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-md text-amber-400 text-xs md:text-sm font-semibold w-full overflow-hidden shadow-inner`}>
              <span className="flex items-center gap-1.5 bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider shrink-0 uppercase relative z-10"><Bell size={12} className="shrink-0 animate-bounce" /> INFO {isAdmin && `(${announcements.length})`}</span>
              <div className="flex-1 overflow-hidden relative w-full flex items-center">
                {isAdmin ? (
                  <div className="w-full flex flex-col gap-2 animate-in fade-in duration-200">
                    {announcements.map((item, index) => (
                      <div key={item.id || index} className="flex items-center gap-2 bg-slate-950/40 border border-slate-800 p-1.5 rounded-lg w-full">
                        <span className="text-[10px] font-mono text-slate-500 px-1.5">{index + 1}</span>
                        <input type="text" value={item.text} onChange={e => { const updated = [...announcements]; updated[index].text = e.target.value; setAnnouncements(updated); }} onBlur={() => saveToFirebaseWithOffline({ announcements, latestUpdate: { view: 'home', text: 'Hebahan dikemas kini.' } })} className="flex-1 bg-transparent border-none outline-none text-white text-xs md:text-sm" placeholder="Tulis pengumuman kilat di sini..." />
                        <button onClick={() => { const updated = announcements.filter((_, i) => i !== index); setAnnouncements(updated); saveToFirebaseWithOffline({ announcements: updated }); }} className="text-red-400 hover:text-red-500 p-1 bg-red-500/10 hover:bg-red-500/20 rounded"><X size={13} /></button>
                      </div>
                    ))}
                    <button onClick={() => setAnnouncements([...announcements, { id: 'ann_' + Date.now(), text: '' }])} className="text-[11px] bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-lg font-black tracking-wide mt-1 self-start flex items-center gap-1 shadow"><Plus size={12} /> Tambah Hebahan</button>
                  </div>
                ) : (
                  <div className="tech-marquee-track font-bold text-amber-300/90 tracking-wide gap-12 whitespace-nowrap">
                    <div className="flex items-center gap-3 shrink-0 whitespace-nowrap"><span>{compiledText}</span><span className="text-amber-500/60 font-black shrink-0 ml-4">•</span></div>
                    <div className="flex items-center gap-3 shrink-0 whitespace-nowrap" aria-hidden="true"><span>{compiledText}</span><span className="text-amber-500/60 font-black shrink-0 ml-4">•</span></div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 text-[10px] md:text-xs font-black tracking-[0.2em] uppercase shadow-inner">
                <Cpu size={12} className="text-cyan-400"/>
                {isAdmin ? (
                  <div className="flex items-center gap-2"><span>Sesi:</span>
                    <select value={sesiKemasukan.sesi} onChange={(e) => { const updated = { ...sesiKemasukan, sesi: e.target.value }; setSesiKemasukan(updated); saveToFirebaseWithOffline({ sesiKemasukan: updated }); }} className="bg-transparent outline-none text-white font-bold border-b border-cyan-400/50"><option value="1" className="text-slate-950">1</option><option value="2" className="text-slate-950">2</option></select> / 
                    <select value={sesiKemasukan.tahun} onChange={(e) => { const updated = { ...sesiKemasukan, tahun: e.target.value }; setSesiKemasukan(updated); saveToFirebaseWithOffline({ sesiKemasukan: updated }); }} className="bg-transparent outline-none text-white font-bold border-b border-cyan-400/50">{[...Array(10)].map((_, i) => <option key={i} value={2025 + i} className="text-slate-950">{2025 + i}</option>)}</select>
                  </div>
                ) : ( <span>Kemasukan {sesiKemasukan.sesi} / {sesiKemasukan.tahun}</span> )}
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-[4rem] font-black text-white tracking-tight leading-[1.1] drop-shadow-lg">
                Minggu<br/>
                {/* Teks dengan animasi warna bernafas */}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 animate-gradient-x inline-block">
                  Silaturahim
                </span>
              </h1>
              <p className="text-sm md:text-base text-slate-300/90 font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed">Portal rasmi Pendaftaran dan Minggu Silaturahim Pelajar (MSR) baharu ADTEC JTM Kampus Sandakan.</p>
            </div>
          </div>

          <div className="w-full lg:w-2/5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[18rem]">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-[2rem] blur-2xl opacity-40 animate-pulse"></div>
              <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 p-6 md:p-8 rounded-[2rem] shadow-xl text-center transform hover:scale-[1.02] transition-transform duration-500">
                 <p className="text-cyan-200/80 text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Waktu Semasa</p>
                 <LiveClock />
                 <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center gap-1.5 text-xs md:text-sm font-semibold text-white tracking-wide"><CalendarClock size={14} className="text-cyan-400" /><span>{formatTarikh(new Date().toISOString().split('T')[0])}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GRID KAD MENU - Animasi Staggered (Masuk Bertingkat) & Shimmer Sweep */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[
          { id: 'memo', icon: FileSignature, title: 'Memo Lantikan', desc: 'Rujukan surat pelantikan rasmi', color: 'blue' },
          { id: 'ajk', icon: UserCog, title: 'Senarai AJK', desc: 'Struktur jawatankuasa & biro pelaksana', color: 'emerald' },
          { id: 'jadual', icon: CalendarClock, title: 'Jadual MSR', desc: 'Tentatif program & aktiviti harian terperinci', color: 'cyan' },
          { id: 'penutup', icon: GraduationCap, title: 'Majlis Penutup', desc: 'Atur cara & protokol majlis penutupan rasmi', color: 'indigo' },
          { id: 'layout', icon: MapPinned, title: 'Pelan Daftar', desc: 'Panduan susun atur kaunter & pelan dewan', color: 'sky' },
          { id: 'lagu', icon: AudioLines, title: 'Lirik Nyanyian', desc: 'Nyanyian lagu korporat & aspirasi JTM', color: 'violet' },
          { id: 'ikrar', icon: HandHeart, title: 'Ikrar Pelajar', desc: 'Lafaz ikrar rasmi pelajar baharu', color: 'rose' } 
        ].map((item, index) => {
          const style = cardStyles[item.color];
          return (
            <button 
              key={item.id} 
              onClick={() => navigateTo(item.id)} 
              // Tambah stail inline untuk delay animasi (staggered effect)
              style={{ animationFillMode: 'both', animationDelay: `${index * 120}ms` }}
              className={`relative group overflow-hidden bg-white/90 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-[2rem] border border-slate-200/70 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:-translate-y-2 ${style.glow} transition-all duration-500 text-left flex flex-col justify-between min-h-[175px] focus:outline-none animate-in fade-in slide-in-from-bottom-8`} 
              aria-label={`Buka bahagian ${item.title}`}
            >
              
              {/* SHIMMER EFFECT (Cahaya Kilat melintas bila Hover) */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent group-hover:animate-[shimmer_1.2s_ease-in-out_infinite] pointer-events-none z-20"></div>

              <div className={`absolute -right-6 -bottom-10 pointer-events-none transform rotate-12 transition-all duration-700 ease-out group-hover:rotate-6 group-hover:scale-110 ${style.watermark}`}>
                <item.icon size={150} strokeWidth={1} />
              </div>

              <div className="flex justify-between items-center relative z-10 w-full">
                <div className={`p-3.5 rounded-2xl border ${style.iconBg} ${style.iconBorder} shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}><item.icon size={22} strokeWidth={2} className={style.iconText} /></div>
                <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 shadow-sm opacity-60 group-hover:opacity-100 group-hover:translate-x-1 group-hover:bg-white dark:group-hover:bg-slate-700 transition-all duration-300`}><ChevronRight size={14} className={style.iconText} /></div>
              </div>

              <div className="relative z-10 mt-6 w-full transform transition-transform duration-500 group-hover:translate-x-1">
                <h3 className="text-base md:text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight transition-colors duration-300">{item.title}</h3>
                
                {/* TARIKH MAJLIS PENUTUP (Boleh Select Oleh Admin) */}
                {item.id === 'penutup' && (isAdmin || tarikhPenutup) ? (
                  <div className="mt-3 w-full" onClick={(e) => { if(isAdmin) { e.preventDefault(); e.stopPropagation(); } }}>
                    {isAdmin ? (
                      <div className="flex flex-col gap-1 w-full bg-indigo-50/50 dark:bg-indigo-900/20 p-2 rounded-xl border border-indigo-200 dark:border-indigo-500/30">
                        <label className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest pl-1">Pilih Tarikh:</label>
                        <input 
                          type="date" 
                          value={tarikhPenutup || ''} 
                          onChange={e => setTarikhPenutup(e.target.value)} 
                          onBlur={() => saveToFirebaseWithOffline({ tarikhPenutup, latestUpdate: { view: 'home', text: 'Tarikh Majlis Penutup dikemas kini.' } })} 
                          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-xs font-bold px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 w-full cursor-pointer shadow-sm" 
                        />
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-indigo-400/50 hover:scale-105 transition-transform duration-300 mt-1">
                        <CalendarClock size={14} className="animate-pulse" />
                        <span className="text-[11px] font-bold tracking-wide">{formatTarikh(tarikhPenutup)}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-1 line-clamp-1 leading-relaxed">{item.desc}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}