import React, { useState, useEffect, useRef, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase';

import { 
  FileText, Users, Map, Calendar, ExternalLink, Music, 
  ChevronLeft, ChevronDown, Home, Download,
  Lock, LogOut, UploadCloud, Plus, Trash2, Edit3, Image as ImageIcon,
  Bell, Eye, EyeOff, ShieldCheck, AlertTriangle, Clock,
  Moon, Sun, Zap, Settings, Command, Award,
  Globe, Monitor, Shield, X
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
        50% { transform: translateY(-12px) scale(1.03); }
      }
      .animate-float { animation: float 6s ease-in-out infinite; }
      .animate-float-delayed { animation: float 6s ease-in-out 3s infinite; }
      @keyframes slide {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(200%); }
      }
      .animate-slide { animation: slide 1.5s ease-in-out infinite; }
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

// --- FUNGSI MUAT TURUN PDF UNTUK MOBILE (BLOB CONVERSION) ---
const handleDownloadBlob = (base64Url, fileName) => {
  try {
    const parts = base64Url.split(';');
    const mime = parts[0].split(':')[1];
    const raw = window.atob(parts[1].split(',')[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    const blob = new Blob([uInt8Array], { type: mime });
    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = fileName || 'Dokumen_MSR';
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    }, 200);
  } catch (error) {
    console.error("Ralat Muat Turun: ", error);
    alert("Maaf, ralat berlaku semasa memuat turun fail. Sila cuba lagi.");
  }
};

// --- ICON FACEBOOK MANUAL ---
const CustomFacebookIcon = React.memo(({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
));

// --- SENARAI STAF (AUTOCOMPLETE) ---
const senaraiStaf = [
  "Encik Abdul Hamid bin Sakmud @ Abdullah",
  "Puan Adiniah Binti Muhamad Radzai",
  "Puan Anamary binti Madyusah",
  "Encik Andrew Bin Arih",
  "Encik Anzari bin Mohd Daud",
  "Puan Aslinah binti Aldan",
  "Puan Asriyani binti Seraila",
  "Encik Azryzan bin Besri",
  "Encik Azwie bin Jafri",
  "Encik Billy Anak Rejap",
  "Encik Darman bin Daming",
  "Puan Enceng binti Saleng Jaga",
  "Cik Faten Farhana binti Wong",
  "Puan Haslinda binti Bohari",
  "Encik Hazrudy bin Ahmad Nasaruddin",
  "Encik Ibrahim bin Lamusa",
  "Cik Isabella Francis Xavier",
  "Encik Ismail Bin Muin",
  "Encik Jaikol bin Udar",
  "Encik Jamludin bin Assat",
  "Encik Japri Bin Patomdang",
  "Puan Juraini binti Sahid",
  "Encik Lynn Noell Ending",
  "Encik Mohamad Sali bin Saleh",
  "Encik Mohammad Nasir bin Awang",
  "Encik Mohd Faiz Fathullah bin Ali Hassan",
  "Encik Mohd Hafizul bin Ibrahim Apani",
  "Encik Mohd Hairi bin Mohd Shah",
  "Encik Mohd Hakimin Mohd Hussin",
  "Encik Mohd Nur Fitri bin Jamil",
  "Encik Mohd Shamin bin Ahmad",
  "Encik Muhaidi bin Mohamad",
  "Encik Muhammad Alinafiah bin Sabril",
  "Encik Muhalis bin Nonchi",
  "Cik Nadzihah binti Ahmad",
  "Encik Nasri bin Kipple",
  "Puan Nazriati binti Nasib",
  "Encik Nazry bin Yusof",
  "Cik Norashikin Binti Ariffin",
  "Cik Norashsikin binti Mohd Arsad",
  "Puan Norhadzla binti Abd Halim",
  "Cik Nur Syafiqah binti Arman",
  "Puan Nurulizaty binti Ibrahim",
  "Encik Omrei bin Okong",
  "Encik Peter Masawa",
  "Encik Richard Joanes",
  "Puan Roha binti Awang Latif",
  "Puan Rohana binti Ahmad",
  "Puan Roshayati binti Mohammad",
  "Puan Rusyieni @ Wendy Binti Payah",
  "Cik Sakinah binti Pitungut",
  "Puan Satria binti Murtala",
  "Encik Shaharul bin Abu Talib",
  "Tc. Johannes Belili",
  "Tc. Mohd Radznan bin Malek",
  "Tc. Mohd Sabri bin Mohd Sarif",
  "Tc. Ng Vui Chien",
  "Tc. Silvester bin Lawai",
  "Ts. Joey Eriksen Teo",
  "Ts. Muhammad Haziq bin Hamzah",
  "Ts. Muhammad Hifzan bin Salimun",
  "Ts. Nurzharfan bin Rafei Bui",
  "Ts. Suhaidi bin Mustar",
  "Ts. Syed Mohd Yusri bin Syed Yusoff",
  "Puan Zuliza binti Roslan"
];

// --- NETWORK ANIMATION COMPONENT ---
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
  
  // STATE BAHARU: KAWALAN SPLASH SCREEN (MENGGANTIKAN SKELETON LOADER)
  const [isAppReady, setIsAppReady] = useState(false);
  
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const inactivityTimer = useRef(null);

  const [openBiroIndex, setOpenBiroIndex] = useState(null);

  // States Paparan Dokumen Penuh (In-App Modal)
  const [viewingMemo, setViewingMemo] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);

  // Data States
  const [announcement, setAnnouncement] = useState('');
  const [sesiKemasukan, setSesiKemasukan] = useState({ sesi: '2', tahun: '2026' });
  const [memoText, setMemoText] = useState('');
  const [memoList, setMemoList] = useState([]); 
  const [ajkInduk, setAjkInduk] = useState([]);
  const [biroList, setBiroList] = useState([]);
  const [jadualData, setJadualData] = useState([]);
  const [penutupData, setPenutupData] = useState([]);
  const [layoutImage, setLayoutImage] = useState(null);

  const [activeJadualTab, setActiveJadualTab] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // Mencegah scroll semasa Splash Screen aktif
  useEffect(() => {
    if (!isAppReady) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isAppReady]);

  // --- FIREBASE FETCH DATA DENGAN ANIMASI LOADING ---
  useEffect(() => {
    const docRef = doc(db, "msr", "data_utama");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.announcement !== undefined) setAnnouncement(data.announcement);
        if (data.sesiKemasukan) setSesiKemasukan(data.sesiKemasukan);
        if (data.memoText !== undefined) setMemoText(data.memoText);
        if (data.memoList !== undefined) setMemoList(data.memoList);
        if (data.ajkInduk) setAjkInduk(data.ajkInduk);
        if (data.biroList) setBiroList(data.biroList);
        if (data.penutupData) setPenutupData(data.penutupData);
        if (data.layoutImage !== undefined) setLayoutImage(data.layoutImage);
        if (data.jadualData) {
          setJadualData(data.jadualData);
          setActiveJadualTab(prev => prev || (data.jadualData.length > 0 ? data.jadualData[0].id : ''));
        }
      }
      
      // Berikan masa 1.5 saat untuk mempamerkan animasi Splash Screen 
      // sambil React merender komponen utama di latar belakang tanpa lag.
      setTimeout(() => {
        setIsAppReady(true);
      }, 1500); 

    }, (error) => {
      console.error("Firebase fetch error:", error);
      setTimeout(() => { setIsAppReady(true); }, 1500);
    });

    return () => unsubscribe();
  }, []);

  const saveToFirebase = useCallback(async (fieldsToUpdate) => {
    try {
      const docRef = doc(db, "msr", "data_utama");
      await setDoc(docRef, fieldsToUpdate, { merge: true });
    } catch (error) {
      console.error("Gagal mengemaskini pangkalan data:", error);
    }
  }, []);

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

  const navigateTo = useCallback((view) => {
    setShowFabMenu(false);
    setCurrentView(view);
    setOpenBiroIndex(null); 
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    });
  }, []);

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

  const handleDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64Data = ev.target.result;
        const fileType = file.type === 'application/pdf' ? 'pdf' : 'image';
        let ext = file.name.split('.').pop() || (fileType === 'pdf' ? 'pdf' : 'jpg');
        let defaultName = `Dokumen_MSR.${ext}`;
        const newMemo = {
          id: 'memo_' + Date.now(),
          name: file.name || defaultName,
          url: base64Data,
          type: fileType
        };
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

  // --- PENUKAR MEMORI BLOB UNTUK PAPARAN MODAL ---
  useEffect(() => {
    if (viewingMemo) {
      try {
        const parts = viewingMemo.url.split(';');
        const mime = parts[0].split(':')[1];
        const raw = window.atob(parts[1].split(',')[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);
        for (let i = 0; i < rawLength; ++i) {
          uInt8Array[i] = raw.charCodeAt(i);
        }
        const blob = new Blob([uInt8Array], { type: mime });
        const url = window.URL.createObjectURL(blob);
        setBlobUrl(url);
      } catch (e) {
        console.error("Gagal menjana paparan ringan:", e);
        setBlobUrl(viewingMemo.url); 
      }
    } else {
      if (blobUrl) {
        window.URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
    }
  }, [viewingMemo]); // eslint-disable-line react-hooks/exhaustive-deps

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
          <div className="absolute top-full left-0 mt-2 min-w-[80px] max-h-48 overflow-y-auto custom-scrollbar bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[60] py-1.5 animate-in slide-in-from-top-2">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm font-extrabold transition-colors ${value === opt.value ? 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-900/30' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const AccordionBiro = ({ biro, isOpen, onToggle }) => {
    return (
      <div className="border border-slate-200 dark:border-slate-700 rounded-2xl mb-3 overflow-hidden bg-white dark:bg-slate-800 shadow-sm transition-all duration-300">
        <button 
          className="w-full px-5 py-4 text-left flex justify-between items-center bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          onClick={onToggle}
        >
          <span className="font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base">{biro.nama}</span>
          <ChevronDown className={`text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} size={20} />
        </button>
        {isOpen && (
          <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 animate-in slide-in-from-top-2 fade-in duration-200">
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

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      {/* DATALIST UNTUK AUTOCOMPLETE NAMA STAF */}
      <datalist id="senarai-staf">
        {senaraiStaf.map((staf, i) => (
          <option key={i} value={staf} />
        ))}
      </datalist>

      {/* --- SPLASH SCREEN LOADING (MODERN) --- */}
      <div className={`fixed inset-0 z-[999] bg-[#0f172a] flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${isAppReady ? 'opacity-0 pointer-events-none scale-105 blur-sm' : 'opacity-100 scale-100 blur-none'}`}>
        <div className="relative flex flex-col items-center">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-48 md:h-48 bg-blue-600/40 blur-[50px] rounded-full animate-pulse"></div>
           <img src="Logo ADTEC JTM 2025 Kampus Sandakan.png" alt="Logo ADTEC" className="w-24 md:w-32 relative z-10 drop-shadow-2xl animate-float" />
           <h1 className="mt-8 text-2xl md:text-3xl font-black tracking-tight text-white relative z-10 drop-shadow-lg">
             iMSR <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">ADTEC JTM</span>
           </h1>
           <span className="text-slate-400 text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase mt-2 relative z-10">Kampus Sandakan</span>
           
           <div className="mt-10 w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden relative z-10 shadow-inner">
             <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 w-1/2 animate-slide rounded-full"></div>
           </div>
           <p className="mt-4 text-xs font-semibold text-slate-500 animate-pulse tracking-wider">Memuatkan Data...</p>
        </div>
      </div>

      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b1121] font-sans text-slate-900 dark:text-slate-100 flex flex-col relative selection:bg-blue-200 dark:selection:bg-blue-900 overflow-x-hidden transition-colors duration-500">
        <GlobalStyles />

        {/* --- HEADER --- */}
        <header className={`sticky top-0 z-40 backdrop-blur-2xl transition-all duration-300 ease-out ${
          isScrolled ? 'bg-white/80 dark:bg-slate-900/80 shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] border-b border-slate-200 dark:border-slate-800' : 'bg-transparent border-b border-transparent py-2'
        }`}>
          <div className={`max-w-6xl mx-auto px-4 lg:px-8 flex items-center justify-between transition-all duration-300 ease-out ${isScrolled ? 'h-16 md:h-18' : 'h-20 md:h-24'}`}>
            <div className="flex items-center gap-4">
              {currentView !== 'home' && (
                <button onClick={() => navigateTo('home')} className="p-2 -ml-2 rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-90 transition-all duration-200 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                  <ChevronLeft size={24} />
                </button>
              )}
              <div className="flex items-center gap-3 md:gap-4">
                <img src="Logo ADTEC JTM 2025 Kampus Sandakan.png" alt="Logo" className={`w-auto object-contain bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all duration-300 ${isScrolled ? 'h-10 md:h-12 p-1.5' : 'h-12 md:h-14 p-2'}`} />
                <div>
                  <h1 className="font-extrabold tracking-tight text-lg md:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-blue-400 dark:to-indigo-300">iMSR ADTEC JTM</h1>
                  <span className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] hidden sm:block transition-all">KAMPUS Sandakan</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 md:gap-5">
              <div className="hidden sm:flex items-center gap-2 border-r border-slate-200 dark:border-slate-700 pr-5 mr-2">
                <a href="https://www.jtm.gov.my/etatatertib/" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-all" title="eTATATERTIB"><Shield size={20} /></a>
                <a href="https://jims.jtm.gov.my/" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-all" title="Sistem JIMS"><Monitor size={20} /></a>
                <a href="https://www.facebook.com/ilpsdk" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all" title="Facebook ILP Sandakan"><CustomFacebookIcon size={20} /></a>
              </div>
              {isAdmin && <span className="hidden md:flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-800/50 transition-all shadow-sm"><ShieldCheck size={16}/> Mod Admin</span>}
              <button onClick={toggleTheme} className="p-3 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all active:scale-90 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-700">{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
            </div>
          </div>
        </header>

        {/* --- LOGIN MODAL --- */}
        {showLogin && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl p-8 w-full max-w-sm border border-slate-200 dark:border-slate-700 animate-in zoom-in-[0.95] fade-in duration-300 ease-out">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-extrabold flex items-center gap-2"><Lock size={24} className="text-blue-600" /> Akses Admin</h2>
                <button onClick={() => setShowLogin(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 dark:bg-slate-800 rounded-full p-2 transition-all active:scale-90"><X size={20}/></button>
              </div>
              {isLockedOut ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3"><AlertTriangle size={24} /><p className="text-sm font-bold">Akaun dikunci 30 saat.</p></div>
              ) : (
                <form onSubmit={handleLogin} className="space-y-5">
                  <input type="text" required value={loginForm.username} onChange={(e) => setLoginForm({...loginForm, username: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border px-4 py-3 rounded-xl font-semibold text-slate-800 dark:text-white transition-all focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nama Pengguna" />
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} required value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border pl-4 pr-12 py-3 rounded-xl font-semibold text-slate-800 dark:text-white transition-all focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Kata Laluan" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                  </div>
                  <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-95 transition-transform duration-200">Sahkan Log Masuk</button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-grow w-full">
          {/* Key 'currentView' di sini akan 'force' React memainkan semula animasi fade-in apabila menu ditukar, mengelakkan kesan *abrupt*/ }
          <div key={currentView} className="animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out">
            
            {/* VIEW: HOME */}
            {currentView === 'home' && (
              <div className="px-4 lg:px-8 max-w-7xl mx-auto pb-32 pt-4">
                <div className="relative rounded-[3rem] bg-gradient-to-br from-[#0f172a] via-blue-950 to-indigo-950 overflow-hidden shadow-2xl border border-slate-800/60 mb-10">
                  <NetworkAnimation />
                  <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/30 rounded-full blur-[120px] animate-float pointer-events-none"></div>
                  <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[120px] animate-float-delayed pointer-events-none"></div>

                  <div className="relative z-20 px-6 py-12 md:px-16 md:py-24 lg:py-28 flex flex-col lg:flex-row items-center justify-between gap-12">
                    <div className="w-full lg:w-3/5 space-y-8 text-center lg:text-left">
                      <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-amber-300 text-sm font-medium w-full lg:w-auto text-left shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:bg-white/10 transition-colors duration-300">
                        <Bell className="animate-bounce shrink-0" size={18}/>
                        {isAdmin ? (
                          <div className="flex-1 flex items-center gap-2">
                            <input value={announcement} onChange={e => setAnnouncement(e.target.value)} onBlur={() => saveToFirebase({ announcement })} className="w-full bg-transparent border-b border-amber-500/50 outline-none text-white focus:border-amber-400 px-1 py-0.5" placeholder="Tulis pengumuman..." />
                          </div>
                        ) : (
                          <span className="truncate max-w-md xl:max-w-xl">{announcement || "Selamat Datang ke iMSR ADTEC Sandakan"}</span>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-black tracking-[0.2em] uppercase shadow-inner">
                          <Zap size={14} className="text-yellow-400"/>
                          {isAdmin ? (
                            <div className="flex items-center gap-2">
                              <span>Sesi:</span>
                              <ModernDropdown value={sesiKemasukan.sesi} options={[{ label: '1', value: '1' }, { label: '2', value: '2' }]} onChange={(val) => { const updated = { ...sesiKemasukan, sesi: val }; setSesiKemasukan(updated); saveToFirebase({ sesiKemasukan: updated }); }} />
                              <ModernDropdown value={sesiKemasukan.tahun} options={[...Array(10)].map((_, i) => { const year = (2025 + i).toString(); return { label: year, value: year }; })} onChange={(val) => { const updated = { ...sesiKemasukan, tahun: val }; setSesiKemasukan(updated); saveToFirebase({ sesiKemasukan: updated }); }} />
                            </div>
                          ) : (
                            <span>Kemasukan {sesiKemasukan.sesi} / {sesiKemasukan.tahun}</span>
                          )}
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-50 to-blue-400 tracking-tight leading-[1.1] drop-shadow-sm">
                          Minggu<br/>Silaturahim
                        </h1>
                        <p className="text-base md:text-xl text-slate-300/90 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                          Portal rasmi pusat sehenti pendaftaran dan orientasi pelajar baharu Kolej Teknologi Termaju (ADTEC) Sandakan.
                        </p>
                      </div>
                    </div>

                    <div className="w-full lg:w-2/5 flex justify-center lg:justify-end">
                      <div className="relative w-full max-w-sm">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3rem] blur-2xl opacity-40 animate-pulse"></div>
                        <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 p-8 md:p-10 rounded-[3rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] text-center transform hover:scale-[1.02] transition-transform duration-500">
                           <p className="text-blue-200/80 text-xs font-bold uppercase tracking-[0.3em] mb-2">Waktu Semasa</p>
                           <LiveClock />
                           <div className="mt-8 pt-6 border-t border-white/10">
                             <p className="text-sm md:text-base font-semibold text-white tracking-wide">{formatTarikh(new Date().toISOString().split('T')[0])}</p>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 pt-4">
                  {[
                    { id: 'memo', icon: FileText, title: 'Memo Lantikan', desc: 'Surat rasmi', color: 'blue' },
                    { id: 'ajk', icon: Users, title: 'Senarai AJK', desc: 'Jawatankuasa & biro', color: 'emerald' },
                    { id: 'jadual', icon: Calendar, title: 'Jadual MSR', desc: 'Tentatif program', color: 'orange' },
                    { id: 'penutup', icon: Award, title: 'Majlis Penutup', desc: 'Tentatif majlis', color: 'rose' },
                    { id: 'layout', icon: Map, title: 'Pelan Daftar', desc: 'Layout dewan', color: 'purple' },
                    { id: 'lagu', icon: Music, title: 'Lagu Korporat', desc: 'Lirik rasmi JTM', color: 'pink' }
                  ].map((item) => (
                    <button 
                      key={item.id} 
                      onClick={() => navigateTo(item.id)} 
                      className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-200/60 dark:border-slate-700/50 flex flex-col items-center justify-center text-center gap-3 hover:-translate-y-1.5 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 ease-out group active:scale-[0.97]"
                    >
                      <div className={`bg-${item.color}-50 dark:bg-${item.color}-900/30 p-4 rounded-[1.5rem] text-${item.color}-600 dark:text-${item.color}-400 group-hover:scale-110 transition-transform duration-300`}>
                        <item.icon size={32} strokeWidth={2} />
                      </div>
                      <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm md:text-base">{item.title}</h3>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW: MEMO */}
            {currentView === 'memo' && (
              <div className="p-4 max-w-4xl mx-auto pb-32 space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 p-6 md:p-10 shadow-xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-2xl text-blue-600 dark:text-blue-400">
                      <FileText size={28} strokeWidth={2.5}/>
                    </div>
                    <h3 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">Dokumen & Surat</h3>
                  </div>

                  {isAdmin && (
                    <div className="mb-8 p-8 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-3xl text-center bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                      <label className="cursor-pointer flex flex-col items-center">
                        <UploadCloud size={40} className="text-blue-500 mb-3 animate-pulse" />
                        <span className="text-base font-bold text-slate-700 dark:text-slate-200">Muat Naik Fail Memo Baharu</span>
                        <span className="text-xs font-medium text-slate-500 mt-2 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">Sokongan: PDF / Imej</span>
                        <input type="file" accept="application/pdf, image/*" className="hidden" onChange={handleDocumentUpload} />
                      </label>
                    </div>
                  )}

                  {memoList.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                      <FileText size={64} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                      <p className="text-xl font-bold text-slate-500 dark:text-slate-400">Tiada dokumen dijumpai.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {memoList.map((memo, index) => (
                        <div key={memo.id} className="border border-slate-200 dark:border-slate-700 rounded-3xl p-5 md:p-6 bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 shadow-sm hover:shadow-xl group">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
                            
                            <div className="flex items-start gap-4 w-full">
                              <span className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-black px-4 py-2 rounded-2xl shadow-md mt-0.5 shrink-0">{index + 1}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-200 break-words leading-tight">{memo.name}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-[10px] font-black text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-md uppercase tracking-wider">{memo.type === 'pdf' ? 'Dokumen PDF' : 'Fail Imej'}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 w-full sm:w-auto justify-end mt-2 sm:mt-0 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-200 dark:border-slate-700">
                              <button 
                                onClick={() => setViewingMemo(memo)} 
                                className="hidden sm:inline-flex items-center justify-center gap-2 text-sm font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-800/60 px-5 py-3 rounded-xl transition-all active:scale-95"
                              >
                                <ExternalLink size={18} /> Lihat
                              </button>

                              <button 
                                onClick={() => handleDownloadBlob(memo.url, memo.name)}
                                className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-3 rounded-xl transition-all active:scale-95 shadow-md"
                              >
                                <Download size={18} /> Muat Turun
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
                                  className="text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 p-3 rounded-xl transition-colors shrink-0 active:scale-90"
                                >
                                  <Trash2 size={18}/>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {memoList.length === 0 && !isAdmin && memoText && (
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 mt-6 border border-slate-200 dark:border-slate-700 shadow-inner">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-medium">{memoText}</p>
                    </div>
                  )}

                  {isAdmin && memoList.length === 0 && (
                    <div className="mt-8 animate-in fade-in">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2"><Edit3 size={14}/> Teks Manual (Jika tiada fail PDF/Imej)</label>
                      <textarea value={memoText} onChange={e => setMemoText(e.target.value)} onBlur={() => saveToFirebase({ memoText })} className="w-full p-5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900 text-sm focus:border-blue-500 outline-none transition-colors leading-relaxed" rows={6}/>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW: AJK */}
            {currentView === 'ajk' && (
              <div className="p-4 max-w-4xl mx-auto pb-32 space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 p-6 md:p-10 shadow-xl mb-8">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl text-emerald-600 dark:text-emerald-400">
                        <Users size={28} strokeWidth={2.5}/>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black tracking-tight text-slate-800 dark:text-white">Jawatankuasa Induk</h3>
                    </div>
                    {isAdmin && (
                      <button onClick={() => { const newAjk = [...ajkInduk, { peranan: "Peranan Baru", nama: "Nama Baru" }]; setAjkInduk(newAjk); saveToFirebase({ ajkInduk: newAjk }); }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors active:scale-95 shadow-md flex items-center gap-2"><Plus size={16}/> <span className="hidden sm:inline">Tambah Induk</span></button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {ajkInduk.map((ajk, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row gap-4 border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl items-start shadow-sm hover:shadow-md transition-shadow">
                        {isAdmin ? (
                          <>
                            <input 
                              value={ajk.peranan} 
                              onChange={e => { const newAjk = [...ajkInduk]; newAjk[idx].peranan = e.target.value; setAjkInduk(newAjk); }} 
                              onBlur={() => saveToFirebase({ ajkInduk })} 
                              className="border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm w-full sm:w-1/3 bg-white dark:bg-slate-900 transition-colors font-bold uppercase focus:ring-2 focus:ring-emerald-500 outline-none" 
                              placeholder="Jawatan"
                            />
                            
                            <div className="w-full flex flex-col gap-2 relative">
                              {ajk.nama.split('\n').map((n, nIdx, arr) => (
                                <div key={nIdx} className="flex items-center gap-2 group">
                                  {arr.length > 1 && nIdx === 0 && (
                                    <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 text-xs px-2 py-1.5 rounded-lg font-black shrink-0 shadow-sm" title="Ketua">K</span>
                                  )}
                                  <input 
                                    list="senarai-staf"
                                    value={n} 
                                    onChange={e => { 
                                      const names = ajk.nama.split('\n');
                                      names[nIdx] = e.target.value;
                                      const newAjk = [...ajkInduk]; 
                                      newAjk[idx].nama = names.join('\n'); 
                                      setAjkInduk(newAjk); 
                                    }} 
                                    onBlur={() => saveToFirebase({ ajkInduk })} 
                                    className="border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm w-full bg-white dark:bg-slate-900 transition-colors focus:ring-2 focus:ring-emerald-500 outline-none" 
                                    placeholder={arr.length > 1 && nIdx === 0 ? "Cari Nama Ketua" : "Cari Nama Pembantu"}
                                  />
                                  {arr.length > 1 && (
                                     <button onClick={() => {
                                         const names = ajk.nama.split('\n');
                                         names.splice(nIdx, 1);
                                         const newAjk = [...ajkInduk];
                                         newAjk[idx].nama = names.join('\n');
                                         setAjkInduk(newAjk);
                                         saveToFirebase({ ajkInduk: newAjk });
                                     }} className="text-red-400 hover:text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg transition-colors">
                                         <X size={18}/>
                                     </button>
                                  )}
                                </div>
                              ))}
                              <button 
                                onClick={() => {
                                   const newAjk = [...ajkInduk];
                                   newAjk[idx].nama += '\n';
                                   setAjkInduk(newAjk);
                                }}
                                className="text-xs text-emerald-600 dark:text-emerald-400 font-bold self-start mt-1 hover:underline flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                <Plus size={14}/> Tambah Pembantu
                              </button>
                            </div>

                            <button 
                              onClick={() => { const newAjk = ajkInduk.filter((_, i) => i !== idx); setAjkInduk(newAjk); saveToFirebase({ ajkInduk: newAjk }); }} 
                              className="text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 p-3 rounded-xl transition-colors shrink-0 self-start sm:self-auto"
                              title="Padam Induk"
                            >
                              <Trash2 size={20}/>
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 sm:w-1/3 uppercase pt-1 tracking-wide">{ajk.peranan}</span>
                            <div className="w-full sm:w-2/3 flex flex-col gap-2">
                              {ajk.nama.split('\n').map((nama, nIdx, arr) => {
                                const text = nama.trim();
                                if (!text) return null;
                                
                                const cleanName = text.replace(/\(K\)/gi, '').trim(); 
                                const validNamesCount = arr.filter(n => n.trim() !== '').length;
                                const isKetua = validNamesCount > 1 && nIdx === 0;
                                
                                return (
                                  <div key={nIdx} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 flex items-start gap-3 shadow-sm">
                                    {isKetua && <span className="bg-gradient-to-br from-emerald-400 to-teal-600 text-white text-[10px] px-2 py-0.5 rounded-md font-black shrink-0 mt-0.5 shadow-sm">KETUA</span>}
                                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">{cleanName}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 p-6 md:p-10 shadow-xl">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl md:text-3xl font-black tracking-tight text-slate-800 dark:text-white">Biro Pelaksana</h3>
                    {isAdmin && (
                      <button onClick={() => { const newBiro = [...biroList, { nama: "Biro Baru", ketua: "", ahli: [] }]; setBiroList(newBiro); saveToFirebase({ biroList: newBiro }); }} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors active:scale-95 shadow-md flex items-center gap-2"><Plus size={16}/> <span className="hidden sm:inline">Tambah Biro</span></button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {biroList.map((biro, idx) => (
                      isAdmin ? (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 p-6 rounded-3xl relative space-y-3 shadow-sm animate-in fade-in">
                          <button onClick={() => { const newBiro = biroList.filter((_, i) => i !== idx); setBiroList(newBiro); saveToFirebase({ biroList: newBiro }); }} className="absolute top-6 right-6 text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 p-2 rounded-xl transition-colors"><Trash2 size={18}/></button>
                          
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Nama Biro</label>
                            <input value={biro.nama} onChange={e => { const newBiro = [...biroList]; newBiro[idx].nama = e.target.value; setBiroList(newBiro); }} onBlur={() => saveToFirebase({ biroList })} className="border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-base w-[85%] font-black text-slate-800 dark:text-white bg-white dark:bg-slate-900 transition-colors focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Masukkan nama biro..." />
                          </div>
                          
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Ketua Biro</label>
                            <input list="senarai-staf" value={biro.ketua} onChange={e => { const newBiro = [...biroList]; newBiro[idx].ketua = e.target.value; setBiroList(newBiro); }} onBlur={() => saveToFirebase({ biroList })} className="border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm w-full font-bold bg-white dark:bg-slate-900 transition-colors focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cari / Masukkan Nama Ketua Biro" />
                          </div>
                          
                          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl mt-4 border border-slate-100 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Senarai Ahli</span>
                              <button onClick={() => { const newBiro = [...biroList]; if(!newBiro[idx].ahli) newBiro[idx].ahli=[]; newBiro[idx].ahli.push(""); setBiroList(newBiro); }} className="text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"><Plus size={14}/> Tambah Ahli</button>
                            </div>
                            <div className="space-y-2">
                              {biro.ahli && biro.ahli.map((ahli, aIdx) => (
                                <div key={aIdx} className="flex gap-2 items-center">
                                  <span className="text-xs font-bold text-slate-400 w-4">{aIdx + 1}.</span>
                                  <input list="senarai-staf" value={ahli} onChange={e => { const newBiro = [...biroList]; newBiro[idx].ahli[aIdx] = e.target.value; setBiroList(newBiro); }} onBlur={() => saveToFirebase({ biroList })} className="border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-sm w-full bg-slate-50 dark:bg-slate-900 transition-colors focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cari / Masukkan Nama Ahli" />
                                  <button onClick={() => { const newBiro = [...biroList]; newBiro[idx].ahli = newBiro[idx].ahli.filter((_, i) => i !== aIdx); setBiroList(newBiro); saveToFirebase({ biroList: newBiro }); }} className="text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 p-2.5 rounded-lg transition-colors"><X size={16}/></button>
                                </div>
                              ))}
                              {(!biro.ahli || biro.ahli.length === 0) && <p className="text-xs text-slate-400 font-medium italic text-center py-2">Tiada ahli ditambah.</p>}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <AccordionBiro 
                          key={idx} 
                          biro={biro} 
                          isOpen={openBiroIndex === idx} 
                          onToggle={() => setOpenBiroIndex(openBiroIndex === idx ? null : idx)} 
                        />
                      )
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: JADUAL */}
            {currentView === 'jadual' && (
              <div className="p-4 max-w-4xl mx-auto pb-32">
                <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 p-6 md:p-10 shadow-xl">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-2xl text-orange-600 dark:text-orange-400">
                        <Calendar size={28} strokeWidth={2.5}/>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black tracking-tight text-slate-800 dark:text-white">Tentatif Program</h3>
                    </div>
                    {isAdmin && (
                      <button onClick={() => { const newId = 'd' + Date.now(); const today = new Date().toISOString().split('T')[0]; const updated = [...jadualData, { id: newId, tarikh: today, slots: [] }]; setJadualData(updated); setActiveJadualTab(newId); saveToFirebase({ jadualData: updated }); }} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors active:scale-95 shadow-md flex items-center gap-2"><Plus size={16}/> <span className="hidden sm:inline">Tambah Hari</span></button>
                    )}
                  </div>
                  
                  <div className="flex gap-3 overflow-x-auto pb-4 mb-8 border-b border-slate-100 dark:border-slate-700 hide-scrollbar snap-x">
                    {jadualData.map((hari) => (
                      <button key={hari.id} onClick={() => setActiveJadualTab(hari.id)} className={`snap-start px-6 py-3 rounded-2xl text-sm font-black shrink-0 transition-all duration-300 ${activeJadualTab === hari.id ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-105' : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-orange-50 dark:hover:bg-slate-800'}`}>
                        {formatTarikh(hari.tarikh)}
                      </button>
                    ))}
                  </div>
                  
                  {jadualData.map((hari) => {
                    if (hari.id !== activeJadualTab) return null;
                    return (
                      <div key={hari.id} className="space-y-6 animate-in slide-in-from-right-4 duration-500 ease-out">
                        {isAdmin && (
                          <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 items-center shadow-sm">
                            <div className="flex-1 min-w-[200px]">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Tarikh Hari Ini</label>
                              <input type="date" value={hari.tarikh} onChange={e => { const updated = jadualData.map(d => d.id === hari.id ? { ...d, tarikh: e.target.value } : d); setJadualData(updated); saveToFirebase({ jadualData: updated }); }} className="w-full border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm font-bold bg-white dark:bg-slate-800 transition-colors focus:ring-2 focus:ring-orange-500 outline-none" />
                            </div>
                            <button onClick={() => { const updated = jadualData.map(d => d.id === hari.id ? { ...d, slots: [...d.slots, { id: 's' + Date.now(), startTime: "08:00", endTime: "09:00", aktiviti: "Aktiviti Baru" }] } : d); setJadualData(updated); saveToFirebase({ jadualData: updated }); }} className="bg-orange-100 hover:bg-orange-200 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 px-5 py-3 rounded-xl text-sm font-bold transition-colors mt-5 shadow-sm flex items-center gap-2"><Plus size={16}/> Tambah Slot Masa</button>
                            <button onClick={() => { if(window.confirm("Padam keseluruhan jadual hari ini?")) { const updated = jadualData.filter(h => h.id !== hari.id); setJadualData(updated); if(updated.length > 0) setActiveJadualTab(updated[0].id); saveToFirebase({ jadualData: updated }); } }} className="text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 px-4 py-3 rounded-xl text-sm font-bold transition-colors mt-5 ml-auto flex items-center gap-2 shadow-sm"><Trash2 size={16}/> Padam Hari</button>
                          </div>
                        )}
                        
                        {(!hari.slots || hari.slots.length === 0) ? (
                          <div className="text-center py-12 text-slate-400 font-medium bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                            <Calendar size={48} className="mx-auto mb-3 opacity-30" />
                            <p className="text-lg font-bold text-slate-500">Tiada aktiviti dijadualkan.</p>
                          </div>
                        ) : (
                          <div className="relative border-l-4 border-orange-200 dark:border-orange-800/50 ml-4 md:ml-8 space-y-8 mt-8">
                            {hari.slots.map((slot) => (
                              <div key={slot.id} className="relative pl-8 md:pl-10 group">
                                <div className="absolute -left-[14px] top-5 h-6 w-6 rounded-full border-[5px] border-white dark:border-slate-800 bg-orange-500 shadow-md z-10 group-hover:scale-125 transition-transform duration-300"></div>
                                
                                {isAdmin ? (
                                  <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 relative shadow-sm transition-shadow">
                                    <button onClick={() => { const updated = jadualData.map(d => d.id === hari.id ? { ...d, slots: d.slots.filter(s => s.id !== slot.id) } : d); setJadualData(updated); saveToFirebase({ jadualData: updated }); }} className="absolute top-5 right-5 text-red-400 hover:text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded-xl transition-colors"><Trash2 size={18}/></button>
                                    <div className="flex gap-4 mb-4 pr-12">
                                      <div className="flex-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Masa Mula</label>
                                        <input type="time" value={slot.startTime} onChange={e => { const updated = jadualData.map(d => d.id === hari.id ? { ...d, slots: d.slots.map(s => s.id === slot.id ? { ...s, startTime: e.target.value } : s) } : d); setJadualData(updated); }} onBlur={() => saveToFirebase({ jadualData })} className="w-full border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm font-black text-orange-600 dark:text-orange-400 bg-white dark:bg-slate-800 transition-colors focus:ring-2 focus:ring-orange-500 outline-none" />
                                      </div>
                                      <div className="flex-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Masa Tamat</label>
                                        <input type="time" value={slot.endTime} onChange={e => { const updated = jadualData.map(d => d.id === hari.id ? { ...d, slots: d.slots.map(s => s.id === slot.id ? { ...s, endTime: e.target.value } : s) } : d); setJadualData(updated); }} onBlur={() => saveToFirebase({ jadualData })} className="w-full border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm font-black text-orange-600 dark:text-orange-400 bg-white dark:bg-slate-800 transition-colors focus:ring-2 focus:ring-orange-500 outline-none" />
                                      </div>
                                    </div>
                                    <textarea value={slot.aktiviti} onChange={e => { const updated = jadualData.map(d => d.id === hari.id ? { ...d, slots: d.slots.map(s => s.id === slot.id ? { ...s, aktiviti: e.target.value } : s) } : d); setJadualData(updated); }} onBlur={() => saveToFirebase({ jadualData })} className="w-full border border-slate-200 dark:border-slate-700 p-4 rounded-xl text-base font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-white transition-colors outline-none focus:ring-2 focus:ring-orange-500 custom-scrollbar" rows={2} placeholder="Keterangan Aktiviti..." />
                                  </div>
                                ) : (
                                  <div className="bg-white dark:bg-slate-800/80 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs md:text-sm font-black tracking-wider shadow-sm mb-3">
                                      <Clock size={14}/>
                                      {formatTime(slot.startTime)} {slot.endTime && <span><span className="opacity-60 mx-1">➜</span> {formatTime(slot.endTime)}</span>}
                                    </div>
                                    <h4 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 leading-snug">{slot.aktiviti}</h4>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW: PENUTUP */}
            {currentView === 'penutup' && (
              <div className="p-4 max-w-4xl mx-auto pb-32">
                <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 p-6 md:p-10 shadow-xl">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-rose-100 dark:bg-rose-900/50 rounded-2xl text-rose-600 dark:text-rose-400">
                        <Award size={28} strokeWidth={2.5}/>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black tracking-tight text-slate-800 dark:text-white">Majlis Penutup</h3>
                    </div>
                    {isAdmin && (
                      <button onClick={() => { const updated = [...penutupData, { id: 'p' + Date.now(), time: "08:00", aktiviti: "Aktiviti Baru" }]; setPenutupData(updated); saveToFirebase({ penutupData: updated }); }} className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors active:scale-95 shadow-md flex items-center gap-2"><Plus size={16}/> <span className="hidden sm:inline">Tambah Slot</span></button>
                    )}
                  </div>
                  
                  {(!penutupData || penutupData.length === 0) ? (
                    <div className="text-center py-12 text-slate-400 font-medium bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                      <Award size={48} className="mx-auto mb-3 opacity-30" />
                      <p className="text-lg font-bold text-slate-500">Tiada atur cara majlis buat masa ini.</p>
                    </div>
                  ) : (
                    <div className="relative border-l-4 border-rose-200 dark:border-rose-800/50 ml-4 md:ml-8 space-y-6 mt-8">
                      {penutupData.map((slot) => (
                        <div key={slot.id} className="relative pl-8 md:pl-10 group">
                          <div className="absolute -left-[14px] top-5 h-6 w-6 rounded-full border-[5px] border-white dark:border-slate-800 bg-rose-500 shadow-md z-10 group-hover:scale-125 transition-transform duration-300"></div>
                          
                          {isAdmin ? (
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 relative shadow-sm transition-shadow">
                              <button onClick={() => { const updated = penutupData.filter(s => s.id !== slot.id); setPenutupData(updated); saveToFirebase({ penutupData: updated }); }} className="absolute top-5 right-5 text-red-400 hover:text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded-xl transition-colors"><Trash2 size={18}/></button>
                              <div className="mb-4 pr-12 w-1/2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Masa</label>
                                <input type="time" value={slot.time} onChange={e => { const updated = penutupData.map(s => s.id === slot.id ? { ...s, time: e.target.value } : s); setPenutupData(updated); }} onBlur={() => saveToFirebase({ penutupData })} className="w-full border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm font-black text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-800 transition-colors focus:ring-2 focus:ring-rose-500 outline-none" />
                              </div>
                              <textarea value={slot.aktiviti} onChange={e => { const updated = penutupData.map(s => s.id === slot.id ? { ...s, aktiviti: e.target.value } : s); setPenutupData(updated); }} onBlur={() => saveToFirebase({ penutupData })} className="w-full border border-slate-200 dark:border-slate-700 p-4 rounded-xl text-base font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-white transition-colors outline-none focus:ring-2 focus:ring-rose-500 custom-scrollbar" rows={2} placeholder="Keterangan Aktiviti..." />
                            </div>
                          ) : (
                            <div className="bg-white dark:bg-slate-800/80 p-5 md:p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-sm font-black tracking-wider shadow-sm mb-2">
                                <Clock size={16}/> {formatTime(slot.time)}
                              </div>
                              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-snug">{slot.aktiviti}</h4>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW: LAYOUT */}
            {currentView === 'layout' && (
              <div className="p-4 max-w-4xl mx-auto pb-32 text-center">
                <div className="bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-200 dark:border-slate-700 p-8 md:p-12 shadow-xl text-center">
                  <div className="bg-purple-100 dark:bg-purple-900/50 w-24 h-24 mx-auto rounded-[2rem] flex items-center justify-center mb-6 transform rotate-3 shadow-inner border border-purple-200 dark:border-purple-800/50">
                    <Map size={48} className="text-purple-600 dark:text-purple-400 -rotate-3" />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">Pelan Pendaftaran</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-10 text-base font-medium">Panduan susun atur dewan bagi melancarkan pergerakan anda.</p>
                  
                  {isAdmin && !layoutImage && (
                    <div className="mb-6 p-8 border-2 border-dashed border-purple-200 dark:border-purple-800/50 rounded-3xl bg-purple-50/50 dark:bg-purple-900/10 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                      <label className="cursor-pointer flex flex-col items-center">
                        <UploadCloud size={40} className="text-purple-500 mb-3 animate-pulse" />
                        <span className="text-base font-bold text-slate-700 dark:text-slate-200">Muat Naik Fail Pelan Baharu</span>
                        <span className="text-xs font-medium text-slate-500 mt-2 bg-white dark:bg-slate-800 px-3 py-1 rounded-full shadow-sm">Sokongan: PDF / Imej</span>
                        <input type="file" accept="application/pdf, image/*" className="hidden" onChange={handleLayoutUpload} />
                      </label>
                    </div>
                  )}

                  <div className={`relative ${layoutImage ? '' : 'border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] min-h-[300px] flex items-center justify-center p-4'}`}>
                    {layoutImage ? (
                      <div className="w-full flex flex-col gap-6">
                        
                        {/* MOBILE VIEW: HANYA BUTANG MUAT TURUN */}
                        <div className="block sm:hidden w-full bg-slate-50 dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center gap-5">
                           {layoutImage.includes('application/pdf') ? <FileText size={64} className="text-purple-500" /> : <ImageIcon size={64} className="text-purple-500" />}
                           <div className="space-y-1">
                             <p className="text-base font-black text-slate-800 dark:text-slate-200">Dokumen Pelan Pendaftaran</p>
                             <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{layoutImage.includes('application/pdf') ? 'Format PDF' : 'Format Imej'}</p>
                           </div>
                           <button 
                             onClick={() => handleDownloadBlob(layoutImage, layoutImage.includes('application/pdf') ? 'Pelan_Pendaftaran.pdf' : 'Pelan_Pendaftaran.jpg')}
                             className="w-full inline-flex items-center justify-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 px-5 py-4 rounded-2xl shadow-lg transition-all active:scale-95 mt-2"
                           >
                             <Download size={20} /> Muat Turun ke Peranti
                           </button>
                           {isAdmin && (
                             <button 
                               onClick={() => { if(window.confirm("Padam pelan ini?")){ setLayoutImage(null); saveToFirebase({ layoutImage: null }); } }}
                               className="w-full inline-flex items-center justify-center gap-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 px-5 py-4 rounded-2xl transition-all active:scale-95"
                             >
                               <Trash2 size={20} /> Padam Rekod Pelan
                             </button>
                           )}
                        </div>

                        {/* DESKTOP/TABLET VIEW: PREVIEW + BUTANG */}
                        <div className="hidden sm:flex flex-col gap-5">
                          <div className="border-4 border-slate-100 dark:border-slate-700 rounded-3xl overflow-hidden bg-white dark:bg-slate-900 shadow-xl relative group">
                            {layoutImage.includes('application/pdf') ? (
                              <iframe src={layoutImage} className="w-full h-[600px] md:h-[800px]" title="Pelan Pendaftaran" />
                            ) : (
                              <div className="p-4 bg-slate-100 dark:bg-slate-900/50">
                                 <img src={layoutImage} alt="Pelan Pendaftaran" className="w-full h-auto max-h-[800px] object-contain rounded-2xl shadow-sm bg-white dark:bg-slate-800" />
                              </div>
                            )}
                            
                            {isAdmin && (
                              <label className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity backdrop-blur-sm duration-300 z-10">
                                <UploadCloud size={48} className="text-white mb-4 animate-bounce"/>
                                <span className="bg-purple-600 text-white text-sm font-bold px-6 py-3 rounded-2xl shadow-2xl hover:scale-105 transition-transform">Gantikan Fail Pelan</span>
                                <input type="file" accept="application/pdf, image/*" className="hidden" onChange={handleLayoutUpload} />
                              </label>
                            )}
                          </div>

                          <div className="flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-3xl border border-slate-200 dark:border-slate-700">
                            <button 
                              onClick={() => handleDownloadBlob(layoutImage, layoutImage.includes('application/pdf') ? 'Pelan_Pendaftaran.pdf' : 'Pelan_Pendaftaran.jpg')}
                              className="inline-flex items-center gap-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-xl shadow-md transition-all active:scale-95"
                            >
                              <Download size={18} /> Muat Turun Fail
                            </button>
                            {isAdmin && (
                              <button 
                                onClick={() => { if(window.confirm("Padam pelan ini?")){ setLayoutImage(null); saveToFirebase({ layoutImage: null }); } }}
                                className="inline-flex items-center gap-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 px-6 py-3 rounded-xl transition-all active:scale-95"
                              >
                                <Trash2 size={18} /> Padam
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-400 flex flex-col items-center gap-3">
                        <ImageIcon size={64} className="opacity-50" />
                        <p className="text-base font-bold text-slate-500">Tiada fail pelan dimuat naik.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: LAGU */}
            {currentView === 'lagu' && (
              <div className="p-4 max-w-3xl mx-auto pb-32 text-center">
                <div className="bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-200 dark:border-slate-700 p-8 md:p-16 space-y-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute -top-20 -right-20 w-64 h-64 bg-pink-500/20 rounded-full blur-[80px] pointer-events-none"></div>
                  <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-rose-500/20 rounded-full blur-[80px] pointer-events-none"></div>
                  
                  <div className="relative z-10 bg-pink-100 dark:bg-pink-900/50 w-24 h-24 mx-auto rounded-3xl flex items-center justify-center mb-8 shadow-inner border border-pink-200 dark:border-pink-800/50">
                    <Music size={48} className="text-pink-500 dark:text-pink-400 animate-pulse duration-[3000ms]" />
                  </div>
                  
                  <h3 className="text-3xl md:text-5xl font-black relative z-10 tracking-tight text-slate-800 dark:text-white">LAGU KORPORAT JTM</h3>
                  
                  <div className="space-y-6 text-base md:text-xl leading-loose md:leading-loose italic text-slate-600 dark:text-slate-300 font-bold relative z-10 px-4 md:px-10 py-6">
                    <p className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">Peneraju Pembangun<br/>Tenaga Mahir Negara<br/>Jabatan Tenaga Manusia</p>
                    <p className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">Kami Cekal Berhemah<br/>Khidmat Cekal Berkualiti<br/>Menjadi Amanat Semua</p>
                    
                    <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-slate-900 dark:to-pink-950/30 p-8 rounded-[2rem] not-italic font-black border border-pink-200/50 shadow-sm mt-8 transform hover:scale-105 transition-transform duration-500">
                      <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-pink-500 block mb-4">Korus</span>
                      <p className="text-slate-800 dark:text-pink-100 text-lg md:text-2xl leading-relaxed">
                        Mendukung Misi Bersama<br/>Membangun Sumber Manusia<br/>Itulah Janji Pada Negara<br/><span className="text-pink-600 dark:text-pink-400 text-xl md:text-3xl mt-2 block">Malaysia Berjaya</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>

        {/* --- IN-APP MODAL UNTUK PAPARAN MEMO PENUH --- */}
        {viewingMemo && (
          <div className="hidden sm:flex fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex-col animate-in fade-in zoom-in-[0.98] duration-300">
            <div className="flex justify-between items-center p-4 md:p-5 bg-[#0f172a] border-b border-slate-800 text-white shadow-lg z-10">
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="bg-blue-500/20 p-2 rounded-xl text-blue-400 shrink-0">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-base md:text-lg truncate max-w-2xl">{viewingMemo.name}</h3>
                  <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">{viewingMemo.type === 'pdf' ? 'Dokumen PDF' : 'Fail Imej'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <button 
                  onClick={() => handleDownloadBlob(viewingMemo.url, viewingMemo.name)} 
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-sm transition-colors shadow-lg active:scale-95"
                  title="Muat Turun Dokumen"
                >
                  <Download size={18} /> Muat Turun
                </button>
                <button 
                  onClick={() => setViewingMemo(null)} 
                  className="p-2.5 bg-slate-800 hover:bg-red-500 hover:text-white text-slate-300 rounded-xl transition-all shadow-lg active:scale-90 ml-2"
                  title="Tutup Paparan"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 w-full h-full p-6 md:p-8 overflow-hidden flex justify-center items-center">
              {blobUrl ? (
                viewingMemo.type === 'pdf' ? (
                  <iframe src={blobUrl} className="w-full h-full bg-white rounded-2xl shadow-2xl border border-slate-700" title={viewingMemo.name} />
                ) : (
                  <img src={blobUrl} alt={viewingMemo.name} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-slate-700 bg-slate-800" />
                )
              ) : (
                <div className="flex flex-col items-center gap-4 text-white animate-pulse">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-bold tracking-widest uppercase text-xs text-slate-400">Memproses Dokumen...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- FOOTER --- */}
        <footer className="bg-[#f8fafc] dark:bg-[#0b1121] text-slate-400 py-8 text-center text-[10px] md:text-xs font-bold mt-auto pb-24 md:pb-8 border-t border-slate-200 dark:border-slate-800/50 relative z-30">
          <p>Hak Cipta Terpelihara &copy; 2026 Kolej Teknologi Termaju (ADTEC) Kampus Sandakan.</p>
        </footer>

        {/* --- BOTTOM NAV (MOBILE) --- */}
        <nav className="md:hidden fixed bottom-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 flex justify-around items-center pt-2 pb-safe-bottom pb-4 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          {[
            { id: 'home', icon: Home, label: 'Utama' },
            { id: 'memo', icon: FileText, label: 'Memo' },
            { id: 'ajk', icon: Users, label: 'AJK' },
            { id: 'jadual', icon: Calendar, label: 'Jadual' },
            { id: 'penutup', icon: Award, label: 'Penutup' }
          ].map((item) => (
            <button key={item.id} onClick={() => navigateTo(item.id)} className={`flex flex-col items-center gap-1 p-2 w-[20%] text-[10px] font-black transition-all active:scale-90 ${currentView === item.id ? 'text-blue-600 dark:text-blue-400 -translate-y-2' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
              <div className={`${currentView === item.id ? 'bg-blue-100 dark:bg-blue-900/40 p-2.5 rounded-2xl shadow-sm border border-blue-200 dark:border-blue-800/50 mb-1' : 'p-1.5'}`}>
                <item.icon size={22} strokeWidth={currentView === item.id ? 2.5 : 2} />
              </div>
              <span className={`tracking-wide ${currentView === item.id ? 'opacity-100' : 'opacity-80'}`}>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* --- FAB QUICK ACTION BUTTON (MODERNIZED & ANIMATED) --- */}
        <div className="fixed bottom-28 md:bottom-8 right-5 md:right-8 z-50 flex flex-col items-end gap-3">
           {showFabMenu && (
             <div className="bg-white/85 dark:bg-slate-800/85 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl flex flex-col gap-2 text-xs font-bold w-48 animate-in slide-in-from-bottom-4 zoom-in-90 duration-200 ease-out origin-bottom-right rounded-[1.5rem] p-2.5 mb-2">
                <a href="https://www.jtm.gov.my/etatatertib" target="_blank" rel="noopener noreferrer" className="p-3.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-3">
                  <Shield size={16} className="text-slate-400"/> eTATATERTIB
                </a>
                <a href="https://jims.jtm.gov.my/" target="_blank" rel="noopener noreferrer" className="p-3.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-3">
                  <Monitor size={16} className="text-slate-400"/> Sistem JIMS
                </a>
                <button onClick={toggleTheme} className="p-3.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-3">
                  {isDarkMode ? <Sun size={16} className="text-slate-400"/> : <Moon size={16} className="text-slate-400"/>} 
                  Tema: {isDarkMode ? 'Cerah' : 'Gelap'}
                </button>
                <div className="h-px bg-slate-200/50 dark:bg-slate-700/50 my-1 mx-2"></div>
                {isAdmin ? (
                  <button onClick={() => { setIsAdmin(false); setShowFabMenu(false); }} className="flex items-center gap-3 p-3.5 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors"><LogOut size={18} /> Log Keluar Sesi</button>
                ) : (
                  <button onClick={() => { setShowLogin(true); setShowFabMenu(false); }} className="flex items-center gap-3 p-3.5 text-left text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors"><Lock size={18} /> Log Masuk Admin</button>
                )}
             </div>
           )}
           <button onClick={() => setShowFabMenu(!showFabMenu)} className="bg-slate-800 dark:bg-blue-600 text-white p-4 md:p-5 rounded-full shadow-[0_12px_32px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-90 transition-all duration-300 focus:outline-none flex items-center justify-center border border-slate-700 dark:border-blue-500 relative group">
             <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
             <div className="relative w-6 h-6 flex items-center justify-center">
               <Command size={24} className={`absolute transition-all duration-300 ease-out ${showFabMenu ? '-rotate-90 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'}`} />
               <X size={24} className={`absolute transition-all duration-300 ease-out ${showFabMenu ? 'rotate-0 opacity-100 scale-100' : 'rotate-90 opacity-0 scale-50'}`} />
             </div>
           </button>
        </div>

      </div>
    </div>
  );
}