import React from 'react';
import { Bell, Zap, ChevronRight, FileSignature, UserCog, CalendarClock, GraduationCap, MapPinned, AudioLines, Cpu } from 'lucide-react';
import NetworkAnimation from '../ui/NetworkAnimation';
import LiveClock from '../ui/LiveClock';
import { formatTarikh } from '../../utils/helpers';

// Skema Warna Kad
const cardStyles = {
  blue: { iconText: 'text-blue-600 dark:text-blue-400', iconBorder: 'border-blue-200 dark:border-blue-500/20', glow: 'group-hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] dark:group-hover:shadow-[0_8px_30px_rgba(59,130,246,0.2)]', topLine: 'from-transparent via-blue-500 to-transparent', hoverBg: 'group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10' },
  emerald: { iconText: 'text-emerald-600 dark:text-emerald-400', iconBorder: 'border-emerald-200 dark:border-emerald-500/20', glow: 'group-hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)] dark:group-hover:shadow-[0_8px_30px_rgba(16,185,129,0.2)]', topLine: 'from-transparent via-emerald-500 to-transparent', hoverBg: 'group-hover:bg-emerald-50/50 dark:group-hover:bg-emerald-900/10' },
  cyan: { iconText: 'text-cyan-600 dark:text-cyan-400', iconBorder: 'border-cyan-200 dark:border-cyan-500/20', glow: 'group-hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)] dark:group-hover:shadow-[0_8px_30px_rgba(6,182,212,0.2)]', topLine: 'from-transparent via-cyan-500 to-transparent', hoverBg: 'group-hover:bg-cyan-50/50 dark:group-hover:bg-cyan-900/10' },
  indigo: { iconText: 'text-indigo-600 dark:text-indigo-400', iconBorder: 'border-indigo-200 dark:border-indigo-500/20', glow: 'group-hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)] dark:group-hover:shadow-[0_8px_30px_rgba(99,102,241,0.2)]', topLine: 'from-transparent via-indigo-500 to-transparent', hoverBg: 'group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-900/10' },
  sky: { iconText: 'text-sky-600 dark:text-sky-400', iconBorder: 'border-sky-200 dark:border-sky-500/20', glow: 'group-hover:shadow-[0_8px_30px_rgba(14,165,233,0.15)] dark:group-hover:shadow-[0_8px_30px_rgba(14,165,233,0.2)]', topLine: 'from-transparent via-sky-500 to-transparent', hoverBg: 'group-hover:bg-sky-50/50 dark:group-hover:bg-sky-900/10' },
  violet: { iconText: 'text-violet-600 dark:text-violet-400', iconBorder: 'border-violet-200 dark:border-violet-500/20', glow: 'group-hover:shadow-[0_8px_30px_rgba(139,92,246,0.15)] dark:group-hover:shadow-[0_8px_30px_rgba(139,92,246,0.2)]', topLine: 'from-transparent via-violet-500 to-transparent', hoverBg: 'group-hover:bg-violet-50/50 dark:group-hover:bg-violet-900/10' }
};

export default function HomeView({ isAdmin, announcement, setAnnouncement, saveToFirebaseWithOffline, sesiKemasukan, setSesiKemasukan, navigateTo }) {
  return (
    <div className="px-4 lg:px-8 max-w-6xl mx-auto pb-32 pt-4">
      {/* HERO SECTION TECH THEME */}
      <div className="relative rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-[#0a192f] to-[#020c1b] overflow-hidden shadow-2xl border border-cyan-900/30 mb-8">
        <NetworkAnimation />
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/20 rounded-full blur-[120px] animate-float pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-float-delayed pointer-events-none"></div>

        <div className="relative z-20 px-6 py-10 md:px-12 md:py-20 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="w-full lg:w-3/5 space-y-6 text-center lg:text-left">
            
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 px-5 py-3 md:py-2.5 rounded-2xl md:rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-amber-300 text-sm font-medium w-full text-left shadow-sm hover:bg-white/10 transition-colors duration-300">
              <Bell className="animate-bounce shrink-0 mt-0.5 md:mt-0" size={18}/>
              {isAdmin ? (
                <div className="flex-1 flex items-center gap-2 w-full">
                  <input value={announcement} onChange={e => setAnnouncement(e.target.value)} onBlur={() => saveToFirebaseWithOffline({ announcement, latestUpdate: { view: 'home', text: 'Teks pengumuman portal telah dikemas kini.' } })} className="w-full bg-transparent border-b border-amber-500/50 outline-none text-white focus:border-amber-400 px-1 py-0.5" placeholder="Tulis pengumuman..." aria-label="Teks pengumuman" />
                </div>
              ) : (
                <span className="flex-1 whitespace-normal break-words leading-relaxed">{announcement || "Selamat Datang ke iMSR ADTEC Sandakan"}</span>
              )}
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 text-[10px] md:text-xs font-black tracking-[0.2em] uppercase shadow-inner">
                <Cpu size={12} className="text-cyan-400"/>
                {isAdmin ? (
                  <div className="flex items-center gap-2">
                    <span>Sesi:</span>
                    <select value={sesiKemasukan.sesi} onChange={(e) => { const updated = { ...sesiKemasukan, sesi: e.target.value }; setSesiKemasukan(updated); saveToFirebaseWithOffline({ sesiKemasukan: updated }); }} className="bg-transparent outline-none text-white font-bold border-b border-cyan-400/50">
                      <option value="1">1</option><option value="2">2</option>
                    </select>
                    <span>/</span>
                    <select value={sesiKemasukan.tahun} onChange={(e) => { const updated = { ...sesiKemasukan, tahun: e.target.value }; setSesiKemasukan(updated); saveToFirebaseWithOffline({ sesiKemasukan: updated }); }} className="bg-transparent outline-none text-white font-bold border-b border-cyan-400/50">
                      {[...Array(10)].map((_, i) => { const year = (2025 + i).toString(); return <option key={year} value={year}>{year}</option>; })}
                    </select>
                  </div>
                ) : (
                  <span>Kemasukan {sesiKemasukan.sesi} / {sesiKemasukan.tahun}</span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-[4rem] font-black text-white tracking-tight leading-[1.1] drop-shadow-lg">
                Minggu<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Silaturahim</span>
              </h1>
              <p className="text-sm md:text-base text-slate-300/90 font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Portal rasmi Pendaftaran dan Minggu Silaturahim Pelajar (MSR) baharu ADTEC JTM Kampus Sandakan.
              </p>
            </div>
          </div>

          <div className="w-full lg:w-2/5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[18rem]">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-[2rem] blur-2xl opacity-40 animate-pulse"></div>
              <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 p-6 md:p-8 rounded-[2rem] shadow-xl text-center transform hover:scale-[1.02] transition-transform duration-500">
                 <p className="text-cyan-200/80 text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Waktu Semasa</p>
                 <LiveClock />
                 <div className="mt-6 pt-4 border-t border-white/10">
                   <p className="text-xs md:text-sm font-semibold text-white tracking-wide">{formatTarikh(new Date().toISOString().split('T')[0])}</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {[
          { id: 'memo', icon: FileSignature, title: 'Memo Lantikan', desc: 'Rujukan surat rasmi', color: 'blue' },
          { id: 'ajk', icon: UserCog, title: 'Senarai AJK', desc: 'Jawatankuasa & biro', color: 'emerald' },
          { id: 'jadual', icon: CalendarClock, title: 'Jadual MSR', desc: 'Tentatif terperinci', color: 'cyan' },
          { id: 'penutup', icon: GraduationCap, title: 'Majlis Penutup', desc: 'Atur cara majlis', color: 'indigo' },
          { id: 'layout', icon: MapPinned, title: 'Pelan Daftar', desc: 'Susun atur dewan', color: 'sky' },
          { id: 'lagu', icon: AudioLines, title: 'Lagu Korporat', desc: 'Lirik nyanyian JTM', color: 'violet' }
        ].map((item) => (
          <button 
            key={item.id} 
            onClick={() => navigateTo(item.id)} 
            className={`relative group overflow-hidden bg-white/80 dark:bg-[#0a1526]/80 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] border border-slate-200/80 dark:border-slate-800/80 shadow-lg hover:-translate-y-2 ${cardStyles[item.color].glow} ${cardStyles[item.color].hoverBg} transition-all duration-500 text-left flex flex-col justify-between min-h-[190px] focus:outline-none`}
            aria-label={`Buka bahagian ${item.title}`}
          >
            <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r ${cardStyles[item.color].topLine} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

            <div className="flex justify-between items-start relative z-10 w-full">
              <div className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border ${cardStyles[item.color].iconBorder} shadow-sm group-hover:scale-110 transition-transform duration-500 ease-out`}>
                <item.icon size={28} strokeWidth={1.5} className={cardStyles[item.color].iconText} />
              </div>
              
              <div className={`p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300`}>
                <ChevronRight size={16} className={cardStyles[item.color].iconText} />
              </div>
            </div>

            <div className="relative z-10 mt-8">
              <h3 className={`text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 mb-1 tracking-tight group-hover:${cardStyles[item.color].iconText} transition-colors duration-300`}>{item.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}