import React from 'react';
import { Shield, Monitor, Sun, Moon, LogOut, Lock, Command, X } from 'lucide-react';

export default function FabMenu({ 
  showFabMenu, setShowFabMenu, isAdmin, setIsAdmin, toggleTheme, isDarkMode, setShowLogin 
}) {
  return (
    <div className="fixed bottom-28 md:bottom-8 right-4 md:right-6 z-50 flex flex-col items-end gap-2">
      {showFabMenu && (
        <div className="bg-white/85 dark:bg-slate-800/85 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl flex flex-col gap-1.5 text-xs font-bold w-44 animate-in slide-in-from-bottom-4 zoom-in-90 duration-200 ease-out origin-bottom-right rounded-2xl p-2 mb-2">
          <a href="https://www.jtm.gov.my/etatatertib" target="_blank" rel="noopener noreferrer" className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-2" aria-label="eTATATERTIB">
            <Shield size={14} className="text-slate-400"/> eTATATERTIB
          </a>
          <a href="https://jims.jtm.gov.my/" target="_blank" rel="noopener noreferrer" className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-2" aria-label="Sistem JIMS">
            <Monitor size={14} className="text-slate-400"/> Sistem JIMS
          </a>
          <button onClick={toggleTheme} className="p-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-2" aria-label="Tukar tema">
            {isDarkMode ? <Sun size={14} className="text-slate-400"/> : <Moon size={14} className="text-slate-400"/>} 
            Tema: {isDarkMode ? 'Cerah' : 'Gelap'}
          </button>
          
          <div className="h-px bg-slate-200/50 dark:bg-slate-700/50 my-1 mx-2"></div>
          
          {isAdmin ? (
            <button onClick={() => { setIsAdmin(false); setShowFabMenu(false); }} className="flex items-center gap-2 p-3 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors" aria-label="Log keluar">
              <LogOut size={16} /> Log Keluar Sesi
            </button>
          ) : (
            <button onClick={() => { setShowLogin(true); setShowFabMenu(false); }} className="flex items-center gap-2 p-3 text-left text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 rounded-xl transition-colors" aria-label="Log masuk admin">
              <Lock size={16} /> Log Masuk Admin
            </button>
          )}
        </div>
      )}

      <button onClick={() => setShowFabMenu(!showFabMenu)} className="bg-slate-800 dark:bg-cyan-600 text-white p-3.5 md:p-4 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-90 transition-all duration-300 focus:outline-none flex items-center justify-center border border-slate-700 dark:border-cyan-500 relative group" aria-label="Menu tindakan pantas">
        <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
        <div className="relative w-5 h-5 flex items-center justify-center">
          <Command size={20} className={`absolute transition-all duration-300 ease-out ${showFabMenu ? '-rotate-90 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'}`} />
          <X size={20} className={`absolute transition-all duration-300 ease-out ${showFabMenu ? 'rotate-0 opacity-100 scale-100' : 'rotate-90 opacity-0 scale-50'}`} />
        </div>
      </button>
    </div>
  );
}