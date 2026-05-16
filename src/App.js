import React, { useState, useEffect, useRef, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase';

import { 
  FileText, Users, Map, Calendar, ExternalLink, Music, 
  ChevronLeft, ChevronDown, Home,
  Lock, LogOut, UploadCloud, Plus, Trash2, Edit3, Image as ImageIcon,
  Bell, Eye, EyeOff, ShieldCheck, AlertTriangle, Clock,
  Moon, Sun, Zap, Settings, Command, Award,
  Globe, Monitor, Shield
} from 'lucide-react';

// --- STYLES FOR SCROLLBAR & ANIMATIONS ---
const GlobalStyles = React.memo(() => (
  <style>
    {`
      .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; border-radius: 10px; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      .hide-scrollbar::-webkit-scrollbar { display: none; }
      .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      @keyframes float {
        0%, 100% { transform: translateY(0px) scale(1); }
        50% { transform: translateY(-15px) scale(1.05); }
      }
      .animate-float { animation: float 6s ease-in-out infinite; }
      .animate-float-delayed { animation: float 6s ease-in-out 3s infinite; }
    `}
  </style>
));

// --- HELPERS ---
const formatTime = (time24) => {
  if (!time24) return "";
  const [h, m] = time24.split(':');
  let hours = parseInt(h, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${m} ${ampm}`;
};

const formatTarikh = (dateString) => {
  if (!dateString) return "Sila Pilih Tarikh";
  const [y, m, d] = dateString.split('-');
  if (!y || !m || !d) return dateString;
  const date = new Date(y, m - 1, d);
  const days = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
  const months = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} (${days[date.getDay()]})`;
};

// --- NETWORK ANIMATION COMPONENT (OPTIMIZED ANTI-LAG) ---
const NetworkAnimation = React.memo(() => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.offsetWidth || window.innerWidth;
      canvas.height = canvas.parentElement.offsetHeight || 400;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const numParticles = Math.min(Math.floor((canvas.width * canvas.height) / 20000), 40); 
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 1.5 + 1
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 0.8;
      
      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          let p2 = particles[j];
          let dx = p.x - p2.x;
          let dy = p.y - p2.y;
          let dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.12 - dist / 900})`;
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 no-print" />;
});

// --- LIVE CLOCK COMPONENT ---
const LiveClock = React.memo(() => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const timeString = time.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const [timeNums, amPm] = timeString.split(' ');

  return (
    <div className="flex flex-col items-center justify-center my-3">
      <div className="flex items-baseline gap-1.5 font-mono font-black tracking-tighter text-3xl md:text-4xl text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
        {timeNums}
        <span className="text-base md:text-lg font-extrabold text-blue-300 tracking-widest drop-shadow-none">
          {amPm}
        </span>
      </div>
      <div className="flex items-center gap-1.5 mt-2 px-3 py-1 bg-white/10 rounded-full border border-white/20">
        <Clock size={12} className="animate-pulse text-yellow-300" />
        <span className="text-[9px] md:text-[10px] font-bold text-blue-100 uppercase tracking-[0.2em]">Waktu Tempatan</span>
      </div>
    </div>
  );
});

// --- MAIN APP COMPONENT ---
export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const inactivityTimer = useRef(null);

  // Data States
  const [announcement, setAnnouncement] = useState('');
  const [sesiKemasukan, setSesiKemasukan] = useState({ sesi: '2', tahun: '2026' });
  const [memoText, setMemoText] = useState('');
  
  // ---> PENTING: DITUKAR KEPADA ARRAY UNTUK BERBILANG DOKUMEN <---
  const [memoList, setMemoList] = useState([]); 

  const [ajkInduk, setAjkInduk] = useState([]);
  const [biroList, setBiroList] = useState([]);
  const [jadualData, setJadualData] = useState([]);
  const [penutupData, setPenutupData] = useState([]);
  const [layoutImage, setLayoutImage] = useState(null);

  const [activeJadualTab, setActiveJadualTab] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // --- FIREBASE FETCH DATA (REAL-TIME LISTENER) ---
  useEffect(() => {
    const docRef = doc(db, "msr", "data_utama");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.announcement !== undefined) setAnnouncement(data.announcement);
        if (data.sesiKemasukan) setSesiKemasukan(data.sesiKemasukan);
        if (data.memoText !== undefined) setMemoText(data.memoText);
        
        // Memuatkan senarai memo
        if (data.memoList !== undefined) setMemoList(data.memoList);
        
        if (data.ajkInduk) setAjkInduk(data.ajkInduk);
        if (data.biroList) setBiroList(data.biroList);
        if (data.penutupData) setPenutupData(data.penutupData);
        if (data.layoutImage !== undefined) setLayoutImage(data.layoutImage);
        if (data.jadualData) {
          setJadualData(data.jadualData);
          if (data.jadualData.length > 0 && !activeJadualTab) {
            setActiveJadualTab(data.jadualData[0].id);
          }
        }
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Firebase fetch error:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [activeJadualTab]);

  // --- OPTIMIZED SAVE LOGIC (ON BLUR ANTI-LAG) ---
  const saveToFirebase = useCallback(async (fieldsToUpdate) => {
    try {
      const docRef = doc(db, "msr", "data_utama");
      await setDoc(docRef, fieldsToUpdate, { merge: true });
    } catch (error) {
      console.error("Gagal mengemaskini pangkalan data:", error);
    }
  }, []);

  // --- THEME & SCROLL EFFECT ---
  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
    }
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => {
      const nextMode = !prev;
      localStorage.theme = nextMode ? 'dark' : 'light';
      return nextMode;
    });
  }, []);

  // --- SMOOTH NAVIGASI ---
  const navigateTo = useCallback((view) => {
    setShowFabMenu(false);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // --- SECURITY TRACKING ---
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (isAdmin) {
      inactivityTimer.current = setTimeout(() => {
        setIsAdmin(false);
        alert('Sesi ditamatkan secara automatik atas faktor keselamatan (15 minit tiada aktiviti).');
      }, 15 * 60 * 1000);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    window.addEventListener('mousemove', resetInactivityTimer, { passive: true });
    window.addEventListener('keypress', resetInactivityTimer, { passive: true });
    return () => {
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('keypress', resetInactivityTimer);
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [isAdmin, resetInactivityTimer]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (isLockedOut) return;
    if (loginForm.username === 'admin' && loginForm.password === 'abc@12345') {
      setIsAdmin(true);
      setShowLogin(false);
      setLoginForm({ username: '', password: '' });
      setLoginAttempts(0);
    } else {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      if (newAttempts >= 3) {
        setIsLockedOut(true);
        setTimeout(() => { setIsLockedOut(false); setLoginAttempts(0); }, 30000);
      } else {
        alert(`Log Masuk Gagal. Baki cubaan: ${3 - newAttempts}`);
      }
    }
  };

  // --- MUAT NAIK MEMO MULTI-FILE ---
  const handleDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64Data = ev.target.result;
        const fileType = file.type === 'application/pdf' ? 'pdf' : 'image';
        
        // Membina objek dokumen baharu
        const newMemo = {
          id: 'memo_' + Date.now(),
          name: file.name || "Dokumen MSR",
          url: base64Data,
          type: fileType
        };

        // Memasukkan dokumen baharu tanpa memadam yang lama
        setMemoList(prev => {
          const updatedList = [...prev, newMemo];
          saveToFirebase({ memoList: updatedList });
          return updatedList;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLayoutUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setLayoutImage(ev.target.result);
        saveToFirebase({ layoutImage: ev.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // --- REUSABLE COMPONENTS ---
  const ModernDropdown = ({ value, options, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-xs font-extrabold text-white transition-all backdrop-blur-md shadow-sm border border-white/20 focus:ring-2 focus:ring-white/50 outline-none"
        >
          {options.find(o => o.value === value)?.label || value}
          <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 min-w-[80px] max-h-48 overflow-y-auto custom-scrollbar bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[60] py-1.5">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm font-extrabold transition-colors ${value === opt.value ?
                'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-900/30' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const AccordionBiro = ({ biro }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="border border-slate-200 dark:border-slate-700 rounded-2xl mb-3 overflow-hidden bg-white dark:bg-slate-800 shadow-sm transition-all duration-300">
        <button 
          className="w-full px-5 py-4 text-left flex justify-between items-center bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base">{biro.nama}</span>
          <ChevronDown className={`text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} size={20} />
        </button>
        {isOpen && (
          <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
            <div className="mb-4">
              <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">Ketua Biro</span>
              <p className="text-slate-900 dark:text-slate-200 font-bold text-sm mt-2 ml-1">{biro.ketua}</p>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">Ahli Jawatankuasa</span>
              <ul className="list-disc pl-6 mt-2 space-y-1.5">
                {biro.ahli && biro.ahli.map((ahli, idx) => (
                  <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 font-medium">{ahli}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  };

  const SkeletonLoader = () => (
    <div className="p-4 max-w-5xl mx-auto pb-32 w-full space-y-6 mt-4">
      <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full animate-pulse"></div>
      <div className="flex gap-4">
         <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3 animate-pulse"></div>
         <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/4 animate-pulse"></div>
      </div>
    </div>
  );

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 flex flex-col relative selection:bg-blue-200 dark:selection:bg-blue-900">
        <GlobalStyles />

        {/* --- HEADER --- */}
        <header className={`sticky top-0 z-40 backdrop-blur-xl transition-all duration-200 ${
          isScrolled ? 'bg-white/90 dark:bg-slate-900/90 shadow-md border-b border-slate-200 dark:border-slate-800' : 'bg-white/50 dark:bg-slate-900/50 shadow-none border-b border-transparent'
        }`}>
          <div className={`max-w-6xl mx-auto px-4 flex items-center justify-between transition-all duration-200 ${isScrolled ? 'h-14 md:h-16' : 'h-16 md:h-20'}`}>
            <div className="flex items-center gap-3">
              {currentView !== 'home' && (
                <button onClick={() => navigateTo('home')} className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 active:scale-90">
                  <ChevronLeft size={24} />
                </button>
              )}
              <div className="flex items-center gap-2 md:gap-3">
                <img src="Logo ADTEC JTM 2025 Kampus Sandakan.png" alt="Logo" className={`w-auto object-contain bg-white/80 dark:bg-slate-800 rounded-lg ${isScrolled ? 'h-8 md:h-10 p-1' : 'h-10 md:h-12 p-1.5'}`} />
                <div>
                  <h1 className="font-extrabold tracking-tight text-base md:text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-blue-400 dark:to-indigo-300">iMSR ADTEC JTM</h1>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:block">KAMPUS Sandakan</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden sm:flex items-center gap-1 border-r border-slate-200 dark:border-slate-700 pr-4 mr-2">
                <a href="https://www.jtm.gov.my/etatatertib/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-emerald-600" title="eTATATERTIB"><Shield size={20} /></a>
                <a href="https://jims.jtm.gov.my/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-indigo-600" title="Sistem JIMS"><Monitor size={20} /></a>
                <a href="https://www.facebook.com/ilpsdk" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-blue-600" title="Facebook ILP Sandakan"><Globe size={20} /></a>
              </div>
              {isAdmin && <span className="hidden md:flex text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full border border-emerald-200"><ShieldCheck size={14}/> Sesi Admin</span>}
              <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-200/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300">{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
            </div>
          </div>
        </header>

        {/* --- LOGIN MODAL --- */}
        {showLogin && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl p-8 w-full max-w-sm border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-extrabold flex items-center gap-2"><Lock size={24} /> Akses Admin</h2>
                <button onClick={() => setShowLogin(false)} className="text-slate-400 hover:text-slate-600 p-2"><Plus className="rotate-45" size={24}/></button>
              </div>
              {isLockedOut ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl"><AlertTriangle size={24} /><p className="text-sm font-bold">Akaun dikunci 30 saat.</p></div>
              ) : (
                <form onSubmit={handleLogin} className="space-y-5">
                  <input type="text" required value={loginForm.username} onChange={(e) => setLoginForm({...loginForm, username: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border px-4 py-3 rounded-xl font-semibold text-slate-800 dark:text-white" placeholder="Nama Pengguna" />
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} required value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border pl-4 pr-12 py-3 rounded-xl font-semibold text-slate-800 dark:text-white" placeholder="Kata Laluan" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                  </div>
                  <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg">Sahkan Log Masuk</button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-grow w-full">
          {isLoading ? <SkeletonLoader /> : (
            <div className="animate-in fade-in duration-150">
              
              {/* VIEW: HOME */}
              {currentView === 'home' && (
                <div className="p-4 max-w-5xl mx-auto pb-32 space-y-5">
                  {/* BANNER */}
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-3">
                    <span className="text-amber-600 font-bold shrink-0 flex items-center gap-1"><Bell size={20}/> PENGUMUMAN:</span>
                    {isAdmin ? (
                      <div className="w-full flex items-center relative">
                        <input value={announcement} onChange={e => setAnnouncement(e.target.value)} onBlur={() => saveToFirebase({ announcement })} className="w-full pl-4 pr-16 py-2 border rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none" />
                        <button onClick={() => saveToFirebase({ announcement })} className="absolute right-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">Simpan</button>
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 break-words">{announcement}</p>
                    )}
                  </div>

                  {/* HERO */}
                  <div className="bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 dark:from-slate-800 dark:via-blue-950 dark:to-black rounded-[2rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden group">
                    <NetworkAnimation />
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div className="max-w-lg space-y-4">
                        <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
                          <Zap size={14} className="text-yellow-400" />
                          {isAdmin ? (
                            <div className="flex items-center gap-2 text-xs">
                              <span>Sesi:</span>
                              <ModernDropdown value={sesiKemasukan.sesi} options={[{ label: '1', value: '1' }, { label: '2', value: '2' }]} onChange={(val) => { const updated = { ...sesiKemasukan, sesi: val }; setSesiKemasukan(updated); saveToFirebase({ sesiKemasukan: updated }); }} />
                              <ModernDropdown value={sesiKemasukan.tahun} options={[...Array(10)].map((_, i) => { const year = (2025 + i).toString(); return { label: year, value: year }; })} onChange={(val) => { const updated = { ...sesiKemasukan, tahun: val }; setSesiKemasukan(updated); saveToFirebase({ sesiKemasukan: updated }); }} />
                            </div>
                          ) : (
                            <span className="text-xs font-bold uppercase tracking-widest text-blue-50">Kemasukan {sesiKemasukan.sesi}/{sesiKemasukan.tahun}</span>
                          )}
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg">Minggu Silaturahim</h2>
                        <p className="text-blue-100 dark:text-blue-200/80 text-lg font-medium">Kolej Teknologi Termaju (ADTEC) Jabatan Tenaga Manusia Kampus Sandakan</p>
                      </div>
                      <div className="flex justify-end hidden md:flex relative z-10 no-print">
                         <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-[2rem] text-center w-full max-w-xs">
                           <LiveClock />
                           <div className="mt-5 pt-4 border-t border-white/10 text-sm font-semibold text-blue-50">{formatTarikh(new Date().toISOString().split('T')[0])}</div>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* CARDS GRID */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 pt-4">
                    {[
                      { id: 'memo', icon: FileText, title: 'Memo Lantikan', desc: 'Surat rasmi', color: 'blue' },
                      { id: 'ajk', icon: Users, title: 'Senarai AJK', desc: 'Jawatankuasa & biro', color: 'emerald' },
                      { id: 'jadual', icon: Calendar, title: 'Jadual MSR', desc: 'Tentatif program', color: 'orange' },
                      { id: 'penutup', icon: Award, title: 'Majlis Penutup', desc: 'Tentatif majlis', color: 'rose' },
                      { id: 'layout', icon: Map, title: 'Pelan Daftar', desc: 'Layout dewan', color: 'purple' },
                      { id: 'lagu', icon: Music, title: 'Lagu Korporat', desc: 'Lirik rasmi JTM', color: 'pink' }
                    ].map((item) => (
                      <button key={item.id} onClick={() => navigateTo(item.id)} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-200/60 dark:border-slate-700/50 flex flex-col items-center justify-center text-center gap-3 hover:shadow-xl transition-all group active:scale-95">
                        <div className={`bg-${item.color}-50 dark:bg-${item.color}-900/30 p-4 rounded-[1.5rem] text-${item.color}-600 dark:text-${item.color}-400 group-hover:scale-105 transition-transform`}>
                          <item.icon size={32} strokeWidth={2} />
                        </div>
                        <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm md:text-base">{item.title}</h3>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* VIEW: MEMO (SENARAI BANYAK MEMO & ANTI-LAG) */}
              {currentView === 'memo' && (
                <div className="p-4 max-w-4xl mx-auto pb-32 space-y-6">
                  <div className="bg-white dark:bg-slate-800 rounded-[2rem] border p-6 md:p-8 shadow-sm">
                    <h3 className="text-2xl font-extrabold mb-4 flex items-center gap-2">
                      <FileText size={24} className="text-blue-600" /> Dokumen & Surat Memo MSR
                    </h3>

                    {/* Ruang Muat Naik Admin */}
                    {isAdmin && (
                      <div className="mb-6 p-6 border-2 border-dashed rounded-3xl text-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <label className="cursor-pointer flex flex-col items-center">
                          <UploadCloud size={32} className="text-blue-500 animate-pulse" />
                          <span className="text-sm font-bold mt-2">Muat Naik Fail Memo Baharu</span>
                          <span className="text-xs text-slate-400 mt-1">Sokongan: PDF / Imej (Boleh muat naik lebih daripada satu dokumen)</span>
                          <input type="file" accept="application/pdf, image/*" className="hidden" onChange={handleDocumentUpload} />
                        </label>
                      </div>
                    )}

                    {/* Tiada Dokumen State */}
                    {memoList.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 font-medium bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                        <FileText size={48} className="mx-auto mb-3 opacity-30" />
                        <p className="text-lg font-bold text-slate-500">Tiada dokumen yang dimuat naik buat masa ini.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {memoList.map((memo, index) => (
                          <div key={memo.id} className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 md:p-5 bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div className="flex items-center gap-3 w-full">
                                <span className="bg-blue-600 text-white text-sm font-black px-3 py-1 rounded-xl shadow-sm">{index + 1}</span>
                                <div className="overflow-hidden">
                                  <p className="text-base font-bold text-slate-800 dark:text-slate-200 truncate" title={memo.name}>{memo.name}</p>
                                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{memo.type === 'pdf' ? 'Dokumen PDF' : 'Fail Imej'}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                {/* Butang Papar Dokumen Sahaja (Tidak dipaparkan secara langsung pada kad untuk jimat memori & elak lag) */}
                                <button 
                                  onClick={() => {
                                    const windowPenuh = window.open();
                                    if (windowPenuh) {
                                      windowPenuh.document.write(
                                        `<html style="margin:0;padding:0;background:#333;"><head><title>${memo.name}</title></head>` +
                                        `<body style="margin:0;padding:0;display:flex;justify-content:center;">` +
                                        (memo.type === 'pdf' 
                                          ? `<iframe src="${memo.url}" style="width:100%; height:100vh; border:none; margin:0; padding:0; background:#fff;"></iframe>`
                                          : `<img src="${memo.url}" style="max-width:100%; max-height:100vh; object-fit:contain; background:#fff;" />`) +
                                        `</body></html>`
                                      );
                                      windowPenuh.document.close();
                                    } else {
                                      alert("Sila benarkan 'Pop-up' untuk melihat dokumen.");
                                    }
                                  }} 
                                  className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-800/60 px-4 py-2.5 rounded-xl transition-all flex-1 sm:flex-none whitespace-nowrap"
                                >
                                  <ExternalLink size={16} /> Lihat Dokumen
                                </button>

                                {isAdmin && (
                                  <button 
                                    onClick={() => {
                                      if(window.confirm("Adakah anda pasti mahu memadam dokumen ini?")) {
                                        const updated = memoList.filter(m => m.id !== memo.id);
                                        setMemoList(updated);
                                        saveToFirebase({ memoList: updated });
                                      }
                                    }} 
                                    className="text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 p-2.5 rounded-xl transition-colors"
                                    title="Padam Dokumen"
                                  >
                                    <Trash2 size={16}/>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Teks Manual Alternatif Jika Tiada Dokumen */}
                    {memoList.length === 0 && !isAdmin && memoText && (
                      <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 mt-6 border border-slate-200 dark:border-slate-700">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{memoText}</p>
                      </div>
                    )}

                    {isAdmin && memoList.length === 0 && (
                      <div className="mt-8">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block flex items-center gap-2"><Edit3 size={14}/> Teks Memo Alternatif (Jika Tiada Dokumen PDF/Imej Disediakan)</label>
                        <textarea value={memoText} onChange={e => setMemoText(e.target.value)} onBlur={() => saveToFirebase({ memoText })} className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:border-blue-500 outline-none" rows={6}/>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* VIEW: AJK */}
              {currentView === 'ajk' && (
                <div className="p-4 max-w-4xl mx-auto pb-32 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-extrabold text-2xl">Jawatankuasa Induk</h3>
                    {isAdmin && (
                      <button onClick={() => { const newAjk = [...ajkInduk, { peranan: "Peranan Baru", nama: "Nama Baru" }]; setAjkInduk(newAjk); saveToFirebase({ ajkInduk: newAjk }); }} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs">+ Tambah</button>
                    )}
                  </div>
                  <div className="bg-white dark:bg-slate-800 border p-6 rounded-3xl space-y-4">
                    {ajkInduk.map((ajk, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row gap-2 border-b pb-3 last:border-0">
                        {isAdmin ? (
                          <>
                            <input value={ajk.peranan} onChange={e => { const newAjk = [...ajkInduk]; newAjk[idx].peranan = e.target.value; setAjkInduk(newAjk); }} onBlur={() => saveToFirebase({ ajkInduk })} className="border p-2 rounded-lg text-sm dark:bg-slate-900" />
                            <input value={ajk.nama} onChange={e => { const newAjk = [...ajkInduk]; newAjk[idx].nama = e.target.value; setAjkInduk(newAjk); }} onBlur={() => saveToFirebase({ ajkInduk })} className="border p-2 rounded-lg text-sm w-full dark:bg-slate-900" />
                            <button onClick={() => { const newAjk = ajkInduk.filter((_, i) => i !== idx); setAjkInduk(newAjk); saveToFirebase({ ajkInduk: newAjk }); }} className="text-red-500"><Trash2 size={18}/></button>
                          </>
                        ) : (
                          <>
                            <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400 w-1/3 uppercase">{ajk.peranan}</span>
                            <span className="text-sm font-bold w-2/3 whitespace-pre-line">{ajk.nama}</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <h3 className="font-extrabold text-2xl">Biro Pelaksana</h3>
                    {isAdmin && (
                      <button onClick={() => { const newBiro = [...biroList, { nama: "Biro Baru", ketua: "Ketua Biro", ahli: [] }]; setBiroList(newBiro); saveToFirebase({ biroList: newBiro }); }} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-xs">+ Tambah Biro</button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {biroList.map((biro, idx) => (
                      isAdmin ? (
                        <div key={idx} className="bg-white dark:bg-slate-800 border p-4 rounded-2xl relative space-y-2">
                          <button onClick={() => { const newBiro = biroList.filter((_, i) => i !== idx); setBiroList(newBiro); saveToFirebase({ biroList: newBiro }); }} className="absolute top-4 right-4 text-red-500"><Trash2 size={18}/></button>
                          <input value={biro.nama} onChange={e => { const newBiro = [...biroList]; newBiro[idx].nama = e.target.value; setBiroList(newBiro); }} onBlur={() => saveToFirebase({ biroList })} className="border p-2 rounded-xl text-sm w-4/5 font-bold dark:bg-slate-900" />
                          <input value={biro.ketua} onChange={e => { const newBiro = [...biroList]; newBiro[idx].ketua = e.target.value; setBiroList(newBiro); }} onBlur={() => saveToFirebase({ biroList })} className="border p-2 rounded-xl text-sm w-full dark:bg-slate-900" placeholder="Ketua Biro" />
                          <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl">
                            <div className="flex justify-between text-xs font-bold mb-2"><span>Ahli:</span><button onClick={() => { const newBiro = [...biroList]; if(!newBiro[idx].ahli) newBiro[idx].ahli=[]; newBiro[idx].ahli.push("Ahli Baru"); setBiroList(newBiro); }} className="text-blue-500">+ Tambah Ahli</button></div>
                            {biro.ahli && biro.ahli.map((ahli, aIdx) => (
                              <div key={aIdx} className="flex gap-2 mt-1">
                                <input value={ahli} onChange={e => { const newBiro = [...biroList]; newBiro[idx].ahli[aIdx] = e.target.value; setBiroList(newBiro); }} onBlur={() => saveToFirebase({ biroList })} className="border p-1 rounded text-xs w-full bg-white dark:bg-slate-800" />
                                <button onClick={() => { const newBiro = [...biroList]; newBiro[idx].ahli = newBiro[idx].ahli.filter((_, i) => i !== aIdx); setBiroList(newBiro); saveToFirebase({ biroList: newBiro }); }} className="text-red-400 text-xs">Buang</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <AccordionBiro key={idx} biro={biro} />
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* VIEW: JADUAL */}
              {currentView === 'jadual' && (
                <div className="p-4 max-w-4xl mx-auto pb-32">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-extrabold text-2xl">Tentatif Terperinci</h3>
                    {isAdmin && (
                      <button onClick={() => { const newId = 'd' + Date.now(); const today = new Date().toISOString().split('T')[0]; const updated = [...jadualData, { id: newId, tarikh: today, slots: [] }]; setJadualData(updated); setActiveJadualTab(newId); saveToFirebase({ jadualData: updated }); }} className="bg-orange-500 text-white px-4 py-2 rounded-xl font-bold text-xs">+ Tambah Hari</button>
                    )}
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-6 border-b">
                    {jadualData.map((hari) => (
                      <button key={hari.id} onClick={() => setActiveJadualTab(hari.id)} className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 ${activeJadualTab === hari.id ? 'bg-orange-500 text-white' : 'bg-white dark:bg-slate-800 border'}`}>
                        {formatTarikh(hari.tarikh)}
                      </button>
                    ))}
                  </div>
                  {jadualData.map((hari) => {
                    if (hari.id !== activeJadualTab) return null;
                    return (
                      <div key={hari.id} className="space-y-4">
                        {isAdmin && (
                          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border flex gap-4 items-center">
                            <input type="date" value={hari.tarikh} onChange={e => { const updated = jadualData.map(d => d.id === hari.id ? { ...d, tarikh: e.target.value } : d); setJadualData(updated); saveToFirebase({ jadualData: updated }); }} className="border p-2 rounded-lg text-sm dark:bg-slate-900" />
                            <button onClick={() => { const updated = jadualData.map(d => d.id === hari.id ? { ...d, slots: [...d.slots, { id: 's' + Date.now(), startTime: "08:00", endTime: "09:00", aktiviti: "Aktiviti Baru" }] } : d); setJadualData(updated); saveToFirebase({ jadualData: updated }); }} className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-2 rounded-lg">+ Tambah Slot</button>
                            <button onClick={() => { const updated = jadualData.filter(h => h.id !== hari.id); setJadualData(updated); if(updated.length > 0) setActiveJadualTab(updated[0].id); saveToFirebase({ jadualData: updated }); }} className="text-red-500 text-xs ml-auto">Padam Hari</button>
                          </div>
                        )}
                        <div className="border-l-4 border-orange-200 pl-6 space-y-4">
                          {hari.slots && hari.slots.map((slot) => (
                            <div key={slot.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border relative">
                              {isAdmin ? (
                                <div className="space-y-2">
                                  <button onClick={() => { const updated = jadualData.map(d => d.id === hari.id ? { ...d, slots: d.slots.filter(s => s.id !== slot.id) } : d); setJadualData(updated); saveToFirebase({ jadualData: updated }); }} className="absolute top-4 right-4 text-red-500"><Trash2 size={16}/></button>
                                  <div className="flex gap-2"><input type="time" value={slot.startTime} onChange={e => { const updated = jadualData.map(d => d.id === hari.id ? { ...d, slots: d.slots.map(s => s.id === slot.id ? { ...s, startTime: e.target.value } : s) } : d); setJadualData(updated); }} onBlur={() => saveToFirebase({ jadualData })} className="border p-1 rounded text-xs dark:bg-slate-900" /><input type="time" value={slot.endTime} onChange={e => { const updated = jadualData.map(d => d.id === hari.id ? { ...d, slots: d.slots.map(s => s.id === slot.id ? { ...s, endTime: e.target.value } : s) } : d); setJadualData(updated); }} onBlur={() => saveToFirebase({ jadualData })} className="border p-1 rounded text-xs dark:bg-slate-900" /></div>
                                  <input value={slot.aktiviti} onChange={e => { const updated = jadualData.map(d => d.id === hari.id ? { ...d, slots: d.slots.map(s => s.id === slot.id ? { ...s, aktiviti: e.target.value } : s) } : d); setJadualData(updated); }} onBlur={() => saveToFirebase({ jadualData })} className="border p-2 rounded-lg text-sm w-full bg-slate-50 dark:bg-slate-900" />
                                </div>
                              ) : (
                                <>
                                  <div className="text-xs font-bold text-orange-600 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded inline-flex items-center gap-1"><Clock size={12}/>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</div>
                                  <h4 className="text-base font-bold mt-2">{slot.aktiviti}</h4>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* VIEW: PENUTUP */}
              {currentView === 'penutup' && (
                <div className="p-4 max-w-4xl mx-auto pb-32 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-extrabold text-2xl">Majlis Penutup</h3>
                    {isAdmin && (
                      <button onClick={() => { const updated = [...penutupData, { id: 'p' + Date.now(), time: "08:00", aktiviti: "Aktiviti Baru" }]; setPenutupData(updated); saveToFirebase({ penutupData: updated }); }} className="bg-rose-500 text-white px-4 py-2 rounded-xl font-bold text-xs">+ Tambah Slot</button>
                    )}
                  </div>
                  <div className="border-l-4 border-rose-200 pl-6 space-y-4">
                    {penutupData.map((slot) => (
                      <div key={slot.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border relative">
                        {isAdmin ? (
                          <div className="space-y-2">
                            <button onClick={() => { const updated = penutupData.filter(s => s.id !== slot.id); setPenutupData(updated); saveToFirebase({ penutupData: updated }); }} className="absolute top-4 right-4 text-red-500"><Trash2 size={16}/></button>
                            <input type="time" value={slot.time} onChange={e => { const updated = penutupData.map(s => s.id === slot.id ? { ...s, time: e.target.value } : s); setPenutupData(updated); }} onBlur={() => saveToFirebase({ penutupData })} className="border p-1 rounded text-xs dark:bg-slate-900" />
                            <input value={slot.aktiviti} onChange={e => { const updated = penutupData.map(s => s.id === slot.id ? { ...s, aktiviti: e.target.value } : s); setPenutupData(updated); }} onBlur={() => saveToFirebase({ penutupData })} className="border p-2 rounded-lg text-sm w-full bg-slate-50 dark:bg-slate-900" />
                          </div>
                        ) : (
                          <>
                            <div className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/30 px-2 py-1 rounded inline-flex items-center gap-1"><Clock size={12}/>{formatTime(slot.time)}</div>
                            <h4 className="text-base font-bold mt-2">{slot.aktiviti}</h4>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VIEW: LAYOUT */}
              {currentView === 'layout' && (
                <div className="p-4 max-w-4xl mx-auto pb-32 text-center">
                  <div className="bg-white dark:bg-slate-800 rounded-[2rem] border p-8">
                    <h3 className="text-2xl font-extrabold mb-2">Pelan Pendaftaran</h3>
                    <p className="text-slate-500 text-sm mb-6">Sila rujuk pelan susun atur dewan pendaftaran.</p>
                    <div className="relative border-2 border-dashed bg-slate-50 dark:bg-slate-900 rounded-2xl min-h-[300px] flex items-center justify-center overflow-hidden group p-4">
                      {layoutImage ? (
                        <img src={layoutImage} alt="Pelan" className="w-full h-auto max-h-[600px] object-contain rounded-xl" />
                      ) : (
                        <div className="text-slate-400 flex flex-col items-center gap-2"><ImageIcon size={48} /><p className="text-sm font-bold">Tiada pelan dimuat naik</p></div>
                      )}
                      {isAdmin && (
                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity backdrop-blur-sm">
                          <span className="bg-white text-xs font-bold px-4 py-2 rounded-lg shadow-xl">Muat Naik Imej Pelan Baru</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleLayoutUpload} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW: LAGU */}
              {currentView === 'lagu' && (
                <div className="p-4 max-w-2xl mx-auto pb-32 text-center">
                  <div className="bg-white dark:bg-slate-800 rounded-[2rem] border p-8 space-y-6">
                    <Music size={48} className="mx-auto text-pink-500" />
                    <h3 className="text-2xl font-extrabold">LAGU KORPORAT JTM</h3>
                    <div className="space-y-4 text-sm leading-relaxed italic text-slate-700 dark:text-slate-300 font-medium">
                      <p>Peneraju Pembangun<br/>Tenaga Mahir Negara<br/>Jabatan Tenaga Manusia</p>
                      <p>Kami Cekal Berhemah<br/>Khidmat Cekal Berkualiti<br/>Menjadi Amanat Semua</p>
                      <div className="bg-pink-50/50 dark:bg-slate-900 p-6 rounded-2xl not-italic font-bold border border-pink-100">
                        <span className="text-[10px] uppercase text-pink-500 block mb-2 font-black">[ Korus ]</span>
                        Mendukung Misi Bersama<br/>Membangun Sumber Manusia<br/>Itulah Janji Pada Negara<br/>Malaysia Berjaya
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </main>

        {/* --- FOOTER --- */}
        <footer className="bg-slate-100 dark:bg-slate-900 text-slate-400 py-6 text-center text-[11px] font-bold mt-auto pb-24 md:pb-6 border-t">
          <p>Hak Cipta Terpelihara &copy; 2026 Kolej Teknologi Termaju (ADTEC) Kampus Sandakan.</p>
        </footer>

        {/* --- BOTTOM NAV (MOBILE) --- */}
        <nav className="md:hidden fixed bottom-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t flex justify-around items-center py-2 z-40">
          {[
            { id: 'home', icon: Home, label: 'Utama' },
            { id: 'memo', icon: FileText, label: 'Memo' },
            { id: 'ajk', icon: Users, label: 'AJK' },
            { id: 'jadual', icon: Calendar, label: 'Jadual' },
            { id: 'penutup', icon: Award, label: 'Penutup' }
          ].map((item) => (
            <button key={item.id} onClick={() => navigateTo(item.id)} className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-bold ${currentView === item.id ? 'text-blue-600' : 'text-slate-400'}`}>
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* --- FAB QUICK ACTION BUTTON --- */}
        <div className="fixed bottom-24 md:bottom-6 right-6 z-50 flex flex-col items-end gap-2">
           {showFabMenu && (
             <div className="bg-white dark:bg-slate-800 border p-2 rounded-2xl shadow-xl flex flex-col gap-1 text-xs font-bold w-40 animate-in slide-in-from-bottom-2">
                <a href="https://www.jtm.gov.my/etatatertib" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">eTATATERTIB</a>
                <a href="https://jims.jtm.gov.my/" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Sistem JIMS</a>
                <button onClick={toggleTheme} className="p-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Tema: {isDarkMode ? 'Cerah' : 'Gelap'}</button>
                <div className="h-px bg-slate-200 my-1"></div>
                {isAdmin ? (
                  <button onClick={() => { setIsAdmin(false); setShowFabMenu(false); }} className="p-2 text-left text-red-500 hover:bg-red-50 rounded-lg">Log Keluar</button>
                ) : (
                  <button onClick={() => { setShowLogin(true); setShowFabMenu(false); }} className="p-2 text-left text-blue-500 hover:bg-blue-50 rounded-lg">Akses Admin</button>
                )}
             </div>
           )}
           <button onClick={() => setShowFabMenu(!showFabMenu)} className="bg-slate-800 dark:bg-blue-600 text-white p-3.5 rounded-full shadow-lg"><Command size={24} /></button>
        </div>

      </div>
    </div>
  );
}