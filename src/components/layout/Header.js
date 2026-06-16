import React from 'react';
import { ChevronLeft, Shield, Monitor, ShieldCheck, Sun, Moon } from 'lucide-react';

// Ikon kustom Facebook
const CustomFacebookIcon = React.memo(({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
));

export default function Header({ currentView, navigateTo, isAdmin, toggleTheme, isDarkMode, isScrolled }) {
  return (
    <header className={`sticky top-0 z-40 backdrop-blur-2xl transition-all duration-300 ease-out ${
      isScrolled ? 'bg-white/80 dark:bg-slate-900/80 shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] border-b border-slate-200 dark:border-slate-800' : 'bg-transparent border-b border-transparent py-2'
    }`}>
      <div className={`max-w-6xl mx-auto px-4 lg:px-8 flex items-center justify-between transition-all duration-300 ease-out ${isScrolled ? 'h-14 md:h-16' : 'h-16 md:h-20'}`}>
        <div className="flex items-center gap-4">
          {currentView !== 'home' && (
            <button onClick={() => navigateTo('home')} className="p-2 -ml-2 rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-90 transition-all duration-200 shadow-sm border border-slate-200/50 dark:border-slate-700/50" aria-label="Kembali ke laman utama">
              <ChevronLeft size={20} />
            </button>
          )}
          <button onClick={() => navigateTo('home')} className="flex items-center gap-2.5 md:gap-3 text-left focus:outline-none hover:opacity-80 transition-opacity active:scale-95" aria-label="Laman utama">
            <img src="Logo ADTEC JTM 2025 Kampus Sandakan.png" alt="Logo ADTEC" className={`w-auto object-contain bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 transition-all duration-300 ${isScrolled ? 'h-8 md:h-10 p-1' : 'h-10 md:h-12 p-1.5'}`} />
            <div>
              <h1 className="font-extrabold tracking-tight text-base md:text-xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400">iMSR ADTEC JTM</h1>
              <span className="text-[9px] md:text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] hidden sm:block transition-all">KAMPUS Sandakan</span>
            </div>
          </button>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex items-center gap-2 border-r border-slate-200 dark:border-slate-700 pr-4 mr-2">
            <a href="https://www.jtm.gov.my/etatatertib/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-all" title="eTATATERTIB" aria-label="eTATATERTIB"><Shield size={18} /></a>
            <a href="https://jims.jtm.gov.my/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-slate-800 transition-all" title="Sistem JIMS" aria-label="Sistem JIMS"><Monitor size={18} /></a>
            <a href="https://www.facebook.com/ilpsdk" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all" title="Facebook ILP Sandakan" aria-label="Facebook ILP Sandakan"><CustomFacebookIcon size={18} /></a>
          </div>
          {isAdmin && <span className="hidden md:flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/50 transition-all shadow-sm"><ShieldCheck size={14}/> Mod Admin</span>}
          <button onClick={toggleTheme} className="p-2.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all active:scale-90 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-700" aria-label="Tukar tema gelap/terang">{isDarkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
        </div>
      </div>
    </header>
  );
}