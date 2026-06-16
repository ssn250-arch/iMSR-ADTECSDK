import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const LiveClock = React.memo(() => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const [timeNums, amPm] = timeString.split(' ');

  return (
    <div className="flex flex-col items-center justify-center my-2">
      <div className="flex items-baseline gap-1 font-mono font-black tracking-tighter text-3xl md:text-4xl text-white drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">
        {timeNums}
        <span className="text-sm md:text-base font-extrabold text-cyan-300 tracking-widest drop-shadow-none ml-1">
          {amPm}
        </span>
      </div>
      <div className="flex items-center gap-1.5 mt-1.5 px-3 py-1 bg-white/5 rounded-full border border-cyan-400/20 backdrop-blur-md">
        <Clock size={10} className="animate-pulse text-cyan-300" />
        <span className="text-[9px] font-bold text-cyan-100 uppercase tracking-[0.2em]">Waktu Tempatan</span>
      </div>
    </div>
  );
});

export default LiveClock;