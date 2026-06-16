import React from 'react';
import { Home, CalendarClock, MapPinned, FileSignature } from 'lucide-react';

export default function BottomNav({ currentView, navigateTo }) {
  const navItems = [
    { id: 'home', icon: Home, label: 'Utama', ariaLabel: 'Laman utama' },
    { id: 'jadual', icon: CalendarClock, label: 'Jadual', ariaLabel: 'Jadual program' },
    { id: 'layout', icon: MapPinned, label: 'Pelan', ariaLabel: 'Pelan pendaftaran' },
    { id: 'memo', icon: FileSignature, label: 'Memo', ariaLabel: 'Dokumen memo' }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-white/95 dark:bg-[#020817]/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 flex items-center pt-1.5 pb-safe-bottom pb-3 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <div className="flex justify-around w-full px-2 gap-1">
        {navItems.map((item) => (
          <button 
            key={item.id} 
            onClick={() => navigateTo(item.id)} 
            className={`flex-1 flex flex-col items-center gap-0.5 p-1.5 text-[9px] font-black transition-all active:scale-90 ${currentView === item.id ? 'text-cyan-600 dark:text-cyan-400 -translate-y-1' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
            aria-label={item.ariaLabel}
          >
            <div className={`${currentView === item.id ? 'bg-cyan-100 dark:bg-cyan-900/40 p-1.5 rounded-xl shadow-sm border border-cyan-200 dark:border-cyan-800/50 mb-0.5' : 'p-0.5'}`}>
              <item.icon size={20} strokeWidth={currentView === item.id ? 2.5 : 2} />
            </div>
            <span className={`tracking-wide text-[10px] ${currentView === item.id ? 'opacity-100 font-black' : 'opacity-80'}`}>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}