import React, { useState, useEffect, useRef, useCallback } from 'react';
import { doc, onSnapshot, setDoc, collection, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

import { 
  FileText, Users, Map, Calendar, ExternalLink, Music, 
  ChevronLeft, ChevronDown, Home, Download, ChevronRight,
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
        50% { transform: translateY(-8px) scale(1.02); }
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
  "Encik Abdul Hamid bin Sakmud @ Abdullah", "Puan Adiniah Binti Muhamad Radzai", "Puan Anamary binti Madyusah",
  "Encik Andrew Bin Arih", "Encik Anzari bin Mohd Daud", "Puan Aslinah binti Aldan", "Puan Asriyani binti Seraila",
  "Encik Azryzan bin Besri", "Encik Azwie bin Jafri", "Encik Billy Anak Rejap", "Encik Darman bin Daming",
  "Puan Enceng binti Saleng Jaga", "Cik Faten Farhana binti Wong", "Puan Haslinda binti Bohari", 
  "Encik Hazrudy bin Ahmad Nasaruddin", "Encik Ibrahim bin Lamusa", "Cik Isabella Francis Xavier", 
  "Encik Ismail Bin Muin", "Encik Jaikol bin Udar", "Encik Jamludin bin Assat", "Encik Japri Bin Patomdang",
  "Puan Juraini binti Sahid", "Encik Lynn Noell Ending", "Encik Mohamad Sali bin Saleh", "Encik Mohammad Nasir bin Awang",
  "Encik Mohd Faiz Fathullah bin Ali Hassan", "Encik Mohd Hafizul bin Ibrahim Apani", "Encik Mohd Hairi bin Mohd Shah",
  "Encik Mohd Hakimin Mohd Hussin", "Encik Mohd Nur Fitri bin Jamil", "Encik Mohd Shamin bin Ahmad",
  "Encik Muhaidi bin Mohamad", "Encik Muhammad Alinafiah bin Sabril", "Encik Muhalis bin Nonchi", 
  "Cik Nadzihah binti Ahmad", "Encik Nasri bin Kipple", "Puan Nazriati binti Nasib", "Encik Nazry bin Yusof",
  "Cik Norashikin Binti Ariffin", "Cik Norashsikin binti Mohd Arsad", "Puan Norhadzla binti Abd Halim", 
  "Cik Nur Syafiqah binti Arman", "Puan Nurulizaty binti Ibrahim", "Encik Omrei bin Okong", "Encik Peter Masawa",
  "Encik Richard Joanes", "Puan Roha binti Awang Latif", "Puan Rohana binti Ahmad", "Puan Roshayati binti Mohammad",
  "Puan Rusyieni @ Wendy Binti Payah", "Cik Sakinah binti Pitungut", "Puan Satria binti Murtala", 
  "Encik Shaharul bin Abu Talib", "Tc. Johannes Belili", "Tc. Mohd Radznan bin Malek", "Tc. Mohd Sabri bin Mohd Sarif",
  "Tc. Ng Vui Chien", "Tc. Silvester bin Lawai", "Ts. Joey Eriksen Teo", "Ts. Muhammad Haziq bin Hamzah",
  "Ts. Muhammad Hifzan bin Salimun", "Ts. Nurzharfan bin Rafei Bui", "Ts. Suhaidi bin Mustar", 
  "Ts. Syed Mohd Yusri bin Syed Yusoff", "Puan Zuliza binti Roslan"
];

// --- WARNA KAD MODEN ---
const cardStyles = {
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800/50', blob: 'bg-blue-500/10' },
  emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800/50', blob: 'bg-emerald-500/10' },
  orange: { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800/50', blob: 'bg-orange-500/10' },
  rose: { bg: 'bg-rose-100 dark:bg-rose-900/40', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800/50', blob: 'bg-rose-500/10' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800/50', blob: 'bg-purple-500/10' },
  pink: { bg: 'bg-pink-100 dark:bg-pink-900/40', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-800/50', blob: 'bg-pink-500/10' },
};

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
    <div className="flex flex-col items-center justify-center my-2">
      <div className="flex items-baseline gap-1 font-mono font-black tracking-tighter text-3xl md:text-4xl text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
        {timeNums}
        <span className="text-sm md:text-base font-extrabold text-blue-300 tracking-widest drop-shadow-none ml-1">
          {amPm}
        </span>
      </div>
      <div className="flex items-center gap-1.5 mt-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/20 backdrop-blur-md">
        <Clock size={10} className="animate-pulse text-yellow-300" />
        <span className="text-[9px] font-bold text-blue-100 uppercase tracking-[0.2em]">Waktu Tempatan</span>
      </div>
    </div>
  );
});

// --- MAIN APP COMPONENT ---
export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
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

  useEffect(() => {
    if (!isAppReady) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isAppReady]);

  // --- FIREBASE FETCH DATA (STRUKTUR BAHARU: PECAHAN LIMIT 1MB) ---
  useEffect(() => {
    // 1. Fetch Main Data (Kecuali Imej & Fail PDF)
    const docRef = doc(db, "msr", "data_utama");
    const unsubscribeUtama = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.announcement !== undefined) setAnnouncement(data.announcement);
        if (data.sesiKemasukan) setSesiKemasukan(data.sesiKemasukan);
        if (data.memoText !== undefined) setMemoText(data.memoText);
        if (data.ajkInduk) setAjkInduk(data.ajkInduk);
        if (data.biroList) setBiroList(data.biroList);
        if (data.penutupData) setPenutupData(data.penutupData);
        if (data.jadualData) {
          setJadualData(data.jadualData);
          setActiveJadualTab(prev => prev || (data.jadualData.length > 0 ? data.jadualData[0].id : ''));
        }
      }
    }, (error) => console.error("Firebase fetch error:", error));

    // 2. Fetch Memos (Setiap memo kini diasingkan dalam failnya sendiri)
    const memosRef = collection(db, "msr_memos");
    const unsubscribeMemos = onSnapshot(memosRef, (snapshot) => {
      const memosArray = [];
      snapshot.forEach((doc) => memosArray.push(doc.data()));
      // Susun ikut id (id berasaskan Date.now())
      memosArray.sort((a, b) => a.id.localeCompare(b.id));
      setMemoList(memosArray);
    }, (error) => console.error("Ralat memo:", error));

    // 3. Fetch Layout Image (Diasingkan bagi menjimatkan had 1MB fail utama)
    const layoutRef = doc(db, "msr", "data_layout");
    const unsubscribeLayout = onSnapshot(layoutRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().layoutImage) {
        setLayoutImage(docSnap.data().layoutImage);
      } else {
        setLayoutImage(null);
      }
      setTimeout(() => { setIsAppReady(true); }, 1500); 
    }, (error) => {
      console.error("Ralat layout:", error);
      setTimeout(() => { setIsAppReady(true); }, 1500);
    });

    return () => {
      unsubscribeUtama();
      unsubscribeMemos();
      unsubscribeLayout();
    };
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
        setBlobUrl(viewingMemo.url); 
      }
    } else {
      if (blobUrl) {
        window.URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
    }
  }, [viewingMemo]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // --- MUAT NAIK FAIL MEMO BERASINGAN (PECAHAN LIMIT) ---
  const handleDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 800 * 1024) {
         alert("PERHATIAN: Saiz fail ini agak besar. Jika ia gagal dimuat naik, sila gunakan aplikasi pemampat PDF (compress PDF) terlebih dahulu.");
      }
      
      const reader = new FileReader();
      reader.onload = async (ev) => {
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

        try {
          await setDoc(doc(db, "msr_memos", newMemo.id), newMemo);
        } catch (error) {
          console.error(error);
          alert("RALAT: Gagal memuat naik fail. Saiz fail anda melebihi had pangkalan data (1MB). Sila kompres / kecilkan fail anda terlebih dahulu.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // --- MUAT NAIK PELAN BERASINGAN (PECAHAN LIMIT) ---
  const handleLayoutUpload = (e) => {
    const file = e.target.files[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      if (file.size > 800 * 1024) {
         alert("PERHATIAN: Saiz pelan ini agak besar. Jika gagal, sila kompres imej/PDF tersebut.");
      }
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          await setDoc(doc(db, "msr", "data_layout"), { layoutImage: ev.target.result });
        } catch (error) {
          console.error(error);
          alert("RALAT: Gagal memuat naik pelan. Saiz melebihi had (1MB). Sila kompres fail tersebut.");
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert("Sila muat naik fail berformat Imej atau PDF sahaja.");
    }
  };

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
          className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-[11px] font-extrabold text-white transition-all backdrop-blur-md shadow-sm border border-white/20 outline-none"
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
                className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${value === opt.value ? 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-900/30' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80'}`}
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
      <div className="border border-slate-200 dark:border-slate-700 rounded-xl mb-3 overflow-hidden bg-white dark:bg-slate-800 shadow-sm transition-all duration-300">
        <button 
          className="w-full px-4 py-3 text-left flex justify-between items-center bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          onClick={onToggle}
        >
          <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{biro.nama}</span>
          <ChevronDown className={`text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} size={18} />
        </button>
        {isOpen && (
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 animate-in slide-in-from-top-2 fade-in duration-200">
            <div className="mb-3">
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">Ketua Biro</span>
              <p className="text-slate-900 dark:text-slate-200 font-bold text-sm mt-1.5 ml-1">{biro.ketua}</p>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">Ahli Jawatankuasa</span>
              <ul className="list-disc pl-5 mt-1.5 space-y-1">
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

      {/* --- SPLASH SCREEN LOADING (DIKECILKAN SAIZ) --- */}
      <div className={`fixed inset-0 z-[999] bg-[#0f172a] flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${isAppReady ? 'opacity-0 pointer-events-none scale-105 blur-sm' : 'opacity-100 scale-100 blur-none'}`}>
        <div className="relative flex flex-col items-center">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 md:w-40 md:h-40 bg-blue-600/40 blur-[50px] rounded-full animate-pulse"></div>
           <img src="Logo ADTEC JTM 2025 Kampus Sandakan.png" alt="Logo ADTEC" className="w-20 md:w-28 relative z-10 drop-shadow-2xl animate-float" />
           <h1 className="mt-6 text-xl md:text-2xl font-black tracking-tight text-white relative z-10 drop-shadow-lg">
             iMSR <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">ADTEC JTM</span>
           </h1>
           <span className="text-slate-400 text-[9px] md:text-[10px] font-bold tracking-[0.3em] uppercase mt-1.5 relative z-10">Kampus Sandakan</span>
           
           <div className="mt-8 w-40 h-1 bg-slate-800 rounded-full overflow-hidden relative z-10 shadow-inner">
             <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 w-1/2 animate-slide rounded-full"></div>
           </div>
           <p className="mt-3 text-[11px] font-semibold text-slate-500 animate-pulse tracking-wider">Memuatkan Data...</p>
        </div>
      </div>

      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b1121] font-sans text-slate-900 dark:text-slate-100 flex flex-col relative selection:bg-blue-200 dark:selection:bg-blue-900 overflow-x-hidden transition-colors duration-500">
        <GlobalStyles />

        {/* --- HEADER --- */}
        <header className={`sticky top-0 z-40 backdrop-blur-2xl transition-all duration-300 ease-out ${
          isScrolled ? 'bg-white/80 dark:bg-slate-900/80 shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] border-b border-slate-200 dark:border-slate-800' : 'bg-transparent border-b border-transparent py-2'
        }`}>
          <div className={`max-w-6xl mx-auto px-4 lg:px-8 flex items-center justify-between transition-all duration-300 ease-out ${isScrolled ? 'h-14 md:h-16' : 'h-16 md:h-20'}`}>
            <div className="flex items-center gap-3">
              {currentView !== 'home' && (
                <button onClick={() => navigateTo('home')} className="p-2 -ml-2 rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-90 transition-all duration-200 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                  <ChevronLeft size={20} />
                </button>
              )}
              <div className="flex items-center gap-2.5 md:gap-3">
                <img src="Logo ADTEC JTM 2025 Kampus Sandakan.png" alt="Logo" className={`w-auto object-contain bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 transition-all duration-300 ${isScrolled ? 'h-8 md:h-10 p-1' : 'h-10 md:h-12 p-1.5'}`} />
                <div>
                  <h1 className="font-extrabold tracking-tight text-base md:text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-blue-400 dark:to-indigo-300">iMSR ADTEC JTM</h1>
                  <span className="text-[9px] md:text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] hidden sm:block transition-all">KAMPUS Sandakan</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden sm:flex items-center gap-2 border-r border-slate-200 dark:border-slate-700 pr-4 mr-2">
                <a href="https://www.jtm.gov.my/etatatertib/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-all" title="eTATATERTIB"><Shield size={18} /></a>
                <a href="https://jims.jtm.gov.my/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-all" title="Sistem JIMS"><Monitor size={18} /></a>
                <a href="https://www.facebook.com/ilpsdk" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all" title="Facebook ILP Sandakan"><CustomFacebookIcon size={18} /></a>
              </div>
              {isAdmin && <span className="hidden md:flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/50 transition-all shadow-sm"><ShieldCheck size={14}/> Mod Admin</span>}
              <button onClick={toggleTheme} className="p-2.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all active:scale-90 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-700">{isDarkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
            </div>
          </div>
        </header>

        {/* --- LOGIN MODAL --- */}
        {showLogin && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl p-6 md:p-8 w-full max-w-sm border border-slate-200 dark:border-slate-700 animate-in zoom-in-[0.95] fade-in duration-300 ease-out">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-extrabold flex items-center gap-2"><Lock size={20} className="text-blue-600" /> Akses Admin</h2>
                <button onClick={() => setShowLogin(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 dark:bg-slate-800 rounded-full p-1.5 transition-all active:scale-90"><X size={18}/></button>
              </div>
              {isLockedOut ? (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2 mb-4"><AlertTriangle size={20} /><p className="text-xs font-bold">Akaun dikunci 30 saat.</p></div>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <input type="text" required value={loginForm.username} onChange={(e) => setLoginForm({...loginForm, username: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-800 dark:text-white transition-all focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nama Pengguna" />
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} required value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border pl-4 pr-10 py-2.5 rounded-xl text-sm font-semibold text-slate-800 dark:text-white transition-all focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Kata Laluan" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
                  <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-xl text-sm shadow-lg active:scale-95 transition-transform duration-200">Sahkan Log Masuk</button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-grow w-full">
          <div key={currentView} className="animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out">
            
            {/* VIEW: HOME */}
            {currentView === 'home' && (
              <div className="px-4 lg:px-8 max-w-6xl mx-auto pb-32 pt-4">
                
                {/* HERO SECTION - Teks diubah sedikit kecil agar lebih kemas */}
                <div className="relative rounded-[2.5rem] bg-gradient-to-br from-[#0f172a] via-blue-950 to-indigo-950 overflow-hidden shadow-xl border border-slate-800/60 mb-8">
                  <NetworkAnimation />
                  <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/30 rounded-full blur-[120px] animate-float pointer-events-none"></div>
                  <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[120px] animate-float-delayed pointer-events-none"></div>

                  <div className="relative z-20 px-6 py-10 md:px-12 md:py-20 flex flex-col lg:flex-row items-center justify-between gap-10">
                    <div className="w-full lg:w-3/5 space-y-6 text-center lg:text-left">
                      
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-amber-300 text-xs font-medium w-full lg:w-auto text-left shadow-sm hover:bg-white/10 transition-colors duration-300">
                        <Bell className="animate-bounce shrink-0" size={16}/>
                        {isAdmin ? (
                          <div className="flex-1 flex items-center gap-2">
                            <input value={announcement} onChange={e => setAnnouncement(e.target.value)} onBlur={() => saveToFirebase({ announcement })} className="w-full bg-transparent border-b border-amber-500/50 outline-none text-white focus:border-amber-400 px-1 py-0.5" placeholder="Tulis pengumuman..." />
                          </div>
                        ) : (
                          <span className="truncate max-w-sm xl:max-w-md">{announcement || "Selamat Datang ke iMSR ADTEC Sandakan"}</span>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-[10px] md:text-xs font-black tracking-[0.2em] uppercase shadow-inner">
                          <Zap size={12} className="text-yellow-400"/>
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

                        <h1 className="text-4xl md:text-5xl lg:text-[4rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-50 to-blue-400 tracking-tight leading-[1.1] drop-shadow-sm">
                          Minggu<br/>Silaturahim
                        </h1>
                        <p className="text-sm md:text-base text-slate-300/90 font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed">
                          Portal rasmi pusat sehenti pendaftaran dan orientasi pelajar baharu Kolej Teknologi Termaju (ADTEC) Sandakan.
                        </p>
                      </div>
                    </div>

                    <div className="w-full lg:w-2/5 flex justify-center lg:justify-end">
                      <div className="relative w-full max-w-[18rem]">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur-2xl opacity-40 animate-pulse"></div>
                        <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 p-6 md:p-8 rounded-[2rem] shadow-xl text-center transform hover:scale-[1.02] transition-transform duration-500">
                           <p className="text-blue-200/80 text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Waktu Semasa</p>
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
                    { id: 'memo', icon: FileText, title: 'Memo Lantikan', desc: 'Rujukan surat rasmi', color: 'blue' },
                    { id: 'ajk', icon: Users, title: 'Senarai AJK', desc: 'Jawatankuasa & biro', color: 'emerald' },
                    { id: 'jadual', icon: Calendar, title: 'Jadual MSR', desc: 'Tentatif terperinci', color: 'orange' },
                    { id: 'penutup', icon: Award, title: 'Majlis Penutup', desc: 'Atur cara majlis', color: 'rose' },
                    { id: 'layout', icon: Map, title: 'Pelan Daftar', desc: 'Susun atur dewan', color: 'purple' },
                    { id: 'lagu', icon: Music, title: 'Lagu Korporat', desc: 'Lirik nyanyian JTM', color: 'pink' }
                  ].map((item) => (
                    <button 
                      key={item.id} 
                      onClick={() => navigateTo(item.id)} 
                      className="relative group overflow-hidden bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 text-left flex flex-col justify-between min-h-[180px] focus:outline-none"
                    >
                      <div className={`absolute -right-10 -top-10 w-32 h-32 ${cardStyles[item.color].blob} rounded-full blur-2xl group-hover:scale-150 group-hover:opacity-70 transition-all duration-700 ease-out`}></div>
                      <div className={`relative z-10 ${cardStyles[item.color].bg} p-3 rounded-xl w-fit ${cardStyles[item.color].text} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 border ${cardStyles[item.color].border} shadow-sm`}>
                        <item.icon size={26} strokeWidth={2} />
                      </div>
                      <div className="relative z-10 mt-6">
                        <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-white mb-1 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{item.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center">
                          {item.desc}
                          <ChevronRight size={14} className="opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-1 transition-all duration-300 text-blue-500 dark:text-blue-400" />
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW: MEMO */}
            {currentView === 'memo' && (
              <div className="p-4 max-w-4xl mx-auto pb-32 space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700 p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/50 rounded-xl text-blue-600 dark:text-blue-400">
                      <FileText size={24} strokeWidth={2.5}/>
                    </div>
                    <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-800 dark:text-white">Dokumen & Surat</h3>
                  </div>

                  {isAdmin && (
                    <div className="mb-6 p-6 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-2xl text-center bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                      <label className="cursor-pointer flex flex-col items-center">
                        <UploadCloud size={32} className="text-blue-500 mb-2 animate-pulse" />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Muat Naik Fail Memo Baharu</span>
                        <span className="text-[10px] font-medium text-slate-500 mt-1.5 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">Sokongan: PDF / Imej</span>
                        <input type="file" accept="application/pdf, image/*" className="hidden" onChange={handleDocumentUpload} />
                      </label>
                    </div>
                  )}

                  {memoList.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-[1.5rem] border border-slate-100 dark:border-slate-800">
                      <FileText size={48} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                      <p className="text-base font-bold text-slate-500 dark:text-slate-400">Tiada dokumen dijumpai.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {memoList.map((memo, index) => (
                        <div key={memo.id} className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 shadow-sm hover:shadow-md group">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            
                            <div className="flex items-start gap-3 w-full">
                              <span className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-md mt-0.5 shrink-0">{index + 1}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-200 break-words leading-tight">{memo.name}</p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="text-[9px] font-black text-slate-500 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded uppercase tracking-wider">{memo.type === 'pdf' ? 'Dokumen PDF' : 'Fail Imej'}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0 pt-2 sm:pt-0">
                              <button 
                                onClick={() => setViewingMemo(memo)} 
                                className="hidden sm:inline-flex items-center justify-center gap-1.5 text-[11px] font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-800/60 px-4 py-2 rounded-xl transition-all active:scale-95"
                              >
                                <ExternalLink size={14} /> Lihat
                              </button>

                              <button 
                                onClick={() => handleDownloadBlob(memo.url, memo.name)}
                                className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl transition-all active:scale-95 shadow-md"
                              >
                                <Download size={14} /> Muat Turun
                              </button>

                              {isAdmin && (
                                <button 
                                  onClick={async () => {
                                    if(window.confirm("Adakah anda pasti mahu memadam dokumen ini?")) {
                                      try {
                                        await deleteDoc(doc(db, "msr_memos", memo.id));
                                      } catch(err) {
                                        console.error(err);
                                        alert("Gagal memadam dokumen.");
                                      }
                                    }
                                  }} 
                                  className="text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 p-2 rounded-xl transition-colors shrink-0 active:scale-90"
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

                  {memoList.length === 0 && !isAdmin && memoText && (
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 mt-6 border border-slate-200 dark:border-slate-700 shadow-inner">
                      <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-medium">{memoText}</p>
                    </div>
                  )}

                  {isAdmin && memoList.length === 0 && (
                    <div className="mt-6 animate-in fade-in">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Edit3 size={12}/> Teks Manual (Jika tiada fail)</label>
                      <textarea value={memoText} onChange={e => setMemoText(e.target.value)} onBlur={() => saveToFirebase({ memoText })} className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:border-blue-500 outline-none transition-colors leading-relaxed" rows={6}/>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW: AJK */}
            {currentView === 'ajk' && (
              <div className="p-4 max-w-4xl mx-auto pb-32 space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700 p-6 shadow-xl mb-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl text-emerald-600 dark:text-emerald-400">
                        <Users size={24} strokeWidth={2.5}/>
                      </div>
                      <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-800 dark:text-white">Jawatankuasa Induk</h3>
                    </div>
                    {isAdmin && (
                      <button onClick={() => { const newAjk = [...ajkInduk, { peranan: "Peranan Baru", nama: "Nama Baru" }]; setAjkInduk(newAjk); saveToFirebase({ ajkInduk: newAjk }); }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-xs transition-colors active:scale-95 shadow-sm flex items-center gap-1.5"><Plus size={14}/> <span className="hidden sm:inline">Tambah Induk</span></button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {ajkInduk.map((ajk, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row gap-3 border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl items-start shadow-sm">
                        {isAdmin ? (
                          <>
                            <input 
                              value={ajk.peranan} 
                              onChange={e => { const newAjk = [...ajkInduk]; newAjk[idx].peranan = e.target.value; setAjkInduk(newAjk); }} 
                              onBlur={() => saveToFirebase({ ajkInduk })} 
                              className="border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-xs w-full sm:w-1/3 bg-white dark:bg-slate-900 transition-colors font-bold uppercase focus:ring-2 focus:ring-emerald-500 outline-none" 
                              placeholder="Jawatan"
                            />
                            <div className="w-full flex flex-col gap-1.5 relative">
                              {ajk.nama.split('\n').map((n, nIdx, arr) => (
                                <div key={nIdx} className="flex items-center gap-1.5 group">
                                  {arr.length > 1 && nIdx === 0 && (
                                    <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 text-[10px] px-1.5 py-1 rounded-md font-black shrink-0 shadow-sm" title="Ketua">K</span>
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
                                    className="border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-xs w-full bg-white dark:bg-slate-900 transition-colors focus:ring-2 focus:ring-emerald-500 outline-none" 
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
                                     }} className="text-red-400 hover:text-red-600 bg-red-50 dark:bg-red-900/20 p-1.5 rounded-md transition-colors">
                                         <X size={14}/>
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
                                className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold self-start mt-0.5 hover:underline flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md transition-colors"
                              >
                                <Plus size={12}/> Tambah Pembantu
                              </button>
                            </div>
                            <button 
                              onClick={() => { const newAjk = ajkInduk.filter((_, i) => i !== idx); setAjkInduk(newAjk); saveToFirebase({ ajkInduk: newAjk }); }} 
                              className="text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 p-2 rounded-lg transition-colors shrink-0 self-start sm:self-auto"
                            >
                              <Trash2 size={16}/>
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="text-[11px] md:text-xs font-black text-emerald-700 dark:text-emerald-400 sm:w-1/3 uppercase pt-1 tracking-wide">{ajk.peranan}</span>
                            <div className="w-full sm:w-2/3 flex flex-col gap-1.5">
                              {ajk.nama.split('\n').map((nama, nIdx, arr) => {
                                const text = nama.trim();
                                if (!text) return null;
                                const cleanName = text.replace(/\(K\)/gi, '').trim(); 
                                const validNamesCount = arr.filter(n => n.trim() !== '').length;
                                const isKetua = validNamesCount > 1 && nIdx === 0;
                                return (
                                  <div key={nIdx} className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700 flex items-center gap-2 shadow-sm">
                                    {isKetua && <span className="bg-gradient-to-br from-emerald-400 to-teal-600 text-white text-[9px] px-1.5 py-0.5 rounded font-black shrink-0 shadow-sm">KETUA</span>}
                                    <span className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">{cleanName}</span>
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

                <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700 p-6 shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-800 dark:text-white">Biro Pelaksana</h3>
                    {isAdmin && (
                      <button onClick={() => { const newBiro = [...biroList, { nama: "Biro Baru", ketua: "", ahli: [] }]; setBiroList(newBiro); saveToFirebase({ biroList: newBiro }); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-xs transition-colors active:scale-95 shadow-sm flex items-center gap-1.5"><Plus size={14}/> <span className="hidden sm:inline">Tambah Biro</span></button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {biroList.map((biro, idx) => (
                      isAdmin ? (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl relative space-y-2.5 shadow-sm animate-in fade-in">
                          <button onClick={() => { const newBiro = biroList.filter((_, i) => i !== idx); setBiroList(newBiro); saveToFirebase({ biroList: newBiro }); }} className="absolute top-4 right-4 text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 p-1.5 rounded-lg transition-colors"><Trash2 size={16}/></button>
                          <div>
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Nama Biro</label>
                            <input value={biro.nama} onChange={e => { const newBiro = [...biroList]; newBiro[idx].nama = e.target.value; setBiroList(newBiro); }} onBlur={() => saveToFirebase({ biroList })} className="border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-sm w-[85%] font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-900 transition-colors focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Masukkan nama biro..." />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Ketua Biro</label>
                            <input list="senarai-staf" value={biro.ketua} onChange={e => { const newBiro = [...biroList]; newBiro[idx].ketua = e.target.value; setBiroList(newBiro); }} onBlur={() => saveToFirebase({ biroList })} className="border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-xs w-full font-bold bg-white dark:bg-slate-900 transition-colors focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cari / Masukkan Nama Ketua Biro" />
                          </div>
                          <div className="bg-white dark:bg-slate-800 p-3 rounded-xl mt-3 border border-slate-100 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Senarai Ahli</span>
                              <button onClick={() => { const newBiro = [...biroList]; if(!newBiro[idx].ahli) newBiro[idx].ahli=[]; newBiro[idx].ahli.push(""); setBiroList(newBiro); }} className="text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 px-2 py-1 rounded-md text-[10px] font-bold transition-colors flex items-center gap-1"><Plus size={12}/> Tambah Ahli</button>
                            </div>
                            <div className="space-y-1.5">
                              {biro.ahli && biro.ahli.map((ahli, aIdx) => (
                                <div key={aIdx} className="flex gap-2 items-center">
                                  <span className="text-[10px] font-bold text-slate-400 w-3">{aIdx + 1}.</span>
                                  <input list="senarai-staf" value={ahli} onChange={e => { const newBiro = [...biroList]; newBiro[idx].ahli[aIdx] = e.target.value; setBiroList(newBiro); }} onBlur={() => saveToFirebase({ biroList })} className="border border-slate-200 dark:border-slate-700 p-2 rounded-md text-xs w-full bg-slate-50 dark:bg-slate-900 transition-colors focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cari / Masukkan Nama Ahli" />
                                  <button onClick={() => { const newBiro = [...biroList]; newBiro[idx].ahli = newBiro[idx].ahli.filter((_, i) => i !== aIdx); setBiroList(newBiro); saveToFirebase({ biroList: newBiro }); }} className="text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 p-2 rounded-md transition-colors"><X size={14}/></button>
                                </div>
                              ))}
                              {(!biro.ahli || biro.ahli.length === 0) && <p className="text-[10px] text-slate-400 font-medium italic text-center py-1">Tiada ahli ditambah.</p>}
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
                <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700 p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-orange-100 dark:bg-orange-900/50 rounded-xl text-orange-600 dark:text-orange-400">
                        <Calendar size={24} strokeWidth={2.5}/>
                      </div>
                      <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-800 dark:text-white">Tentatif Program</h3>
                    </div>
                    {isAdmin && (
                      <button onClick={() => { const newId = 'd' + Date.now(); const today = new Date().toISOString().split('T')[0]; const updated = [...jadualData, { id: newId, tarikh: today, slots: [] }]; setJadualData(updated); setActiveJadualTab(newId); saveToFirebase({ jadualData: updated }); }} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-bold text-xs transition-colors active:scale-95 shadow-sm flex items-center gap-1.5"><Plus size={14}/> <span className="hidden sm:inline">Tambah Hari</span></button>
                    )}
                  </div>
                  
                  <div className="flex gap-2.5 overflow-x-auto pb-3 mb-6 border-b border-slate-100 dark:border-slate-700 hide-scrollbar snap-x">
                    {jadualData.map((hari) => (
                      <button key={hari.id} onClick={() => setActiveJadualTab(hari.id)} className={`snap-start px-5 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all duration-300 ${activeJadualTab === hari.id ? 'bg-orange-500 text-white shadow-md scale-105' : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-orange-50 dark:hover:bg-slate-800'}`}>
                        {formatTarikh(hari.tarikh)}
                      </button>
                    ))}
                  </div>
                  
                  {jadualData.map((hari) => {
                    if (hari.id !== activeJadualTab) return null;
                    return (
                      <div key={hari.id} className="space-y-5 animate-in slide-in-from-right-4 duration-500 ease-out">
                        {isAdmin && (
                          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-wrap gap-3 items-center shadow-sm">
                            <div className="flex-1 min-w-[150px]">
                              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Tarikh Hari Ini</label>
                              <input type="date" value={hari.tarikh} onChange={e => { const updated = jadualData.map(d => d.id === hari.id ? { ...d, tarikh: e.target.value } : d); setJadualData(updated); saveToFirebase({ jadualData: updated }); }} className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 transition-colors focus:ring-2 focus:ring-orange-500 outline-none" />
                            </div>
                            <button onClick={() => { const updated = jadualData.map(d => d.id === hari.id ? { ...d, slots: [...d.slots, { id: 's' + Date.now(), startTime: "08:00", endTime: "09:00", aktiviti: "Aktiviti Baru" }] } : d); setJadualData(updated); saveToFirebase({ jadualData: updated }); }} className="bg-orange-100 hover:bg-orange-200 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 px-4 py-2.5 rounded-lg text-xs font-bold transition-colors mt-4 shadow-sm flex items-center gap-1.5"><Plus size={14}/> Tambah Slot</button>
                            <button onClick={() => { if(window.confirm("Padam keseluruhan jadual hari ini?")) { const updated = jadualData.filter(h => h.id !== hari.id); setJadualData(updated); if(updated.length > 0) setActiveJadualTab(updated[0].id); saveToFirebase({ jadualData: updated }); } }} className="text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors mt-4 ml-auto flex items-center gap-1.5 shadow-sm"><Trash2 size={14}/> Padam</button>
                          </div>
                        )}
                        
                        {(!hari.slots || hari.slots.length === 0) ? (
                          <div className="text-center py-10 text-slate-400 font-medium bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700">
                            <Calendar size={40} className="mx-auto mb-2 opacity-30" />
                            <p className="text-sm font-bold text-slate-500">Tiada aktiviti dijadualkan.</p>
                          </div>
                        ) : (
                          <div className="relative border-l-[3px] border-orange-200 dark:border-orange-800/50 ml-3 md:ml-6 space-y-6 mt-6">
                            {hari.slots.map((slot) => (
                              <div key={slot.id} className="relative pl-6 md:pl-8 group">
                                <div className="absolute -left-[11px] top-4 h-5 w-5 rounded-full border-[4px] border-white dark:border-slate-800 bg-orange-500 shadow-sm z-10 group-hover:scale-125 transition-transform duration-300"></div>
                                
                                {isAdmin ? (
                                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-[1.5rem] border border-slate-200 dark:border-slate-700 relative shadow-sm transition-shadow">
                                    <button onClick={() => { const updated = jadualData.map(d => d.id === hari.id ? { ...d, slots: d.slots.filter(s => s.id !== slot.id) } : d); setJadualData(updated); saveToFirebase({ jadualData: updated }); }} className="absolute top-4 right-4 text-red-400 hover:text-red-600 bg-red-50 dark:bg-red-900/20 p-1.5 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                    <div className="flex gap-3 mb-3 pr-10">
                                      <div className="flex-1">
                                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Mula</label>
                                        <input type="time" value={slot.startTime} onChange={e => { const updated = jadualData.map(d => d.id === hari.id ? { ...d, slots: d.slots.map(s => s.id === slot.id ? { ...s, startTime: e.target.value } : s) } : d); setJadualData(updated); }} onBlur={() => saveToFirebase({ jadualData })} className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-xs font-black text-orange-600 dark:text-orange-400 bg-white dark:bg-slate-800 transition-colors focus:ring-2 focus:ring-orange-500 outline-none" />
                                      </div>
                                      <div className="flex-1">
                                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Tamat</label>
                                        <input type="time" value={slot.endTime} onChange={e => { const updated = jadualData.map(d => d.id === hari.id ? { ...d, slots: d.slots.map(s => s.id === slot.id ? { ...s, endTime: e.target.value } : s) } : d); setJadualData(updated); }} onBlur={() => saveToFirebase({ jadualData })} className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-xs font-black text-orange-600 dark:text-orange-400 bg-white dark:bg-slate-800 transition-colors focus:ring-2 focus:ring-orange-500 outline-none" />
                                      </div>
                                    </div>
                                    <textarea value={slot.aktiviti} onChange={e => { const updated = jadualData.map(d => d.id === hari.id ? { ...d, slots: d.slots.map(s => s.id === slot.id ? { ...s, aktiviti: e.target.value } : s) } : d); setJadualData(updated); }} onBlur={() => saveToFirebase({ jadualData })} className="w-full border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-white transition-colors outline-none focus:ring-2 focus:ring-orange-500 custom-scrollbar" rows={2} placeholder="Keterangan Aktiviti..." />
                                  </div>
                                ) : (
                                  <div className="bg-white dark:bg-slate-800/80 p-4 md:p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] md:text-xs font-black tracking-wider shadow-sm mb-2">
                                      <Clock size={12}/>
                                      {formatTime(slot.startTime)} {slot.endTime && <span><span className="opacity-60 mx-1">➜</span> {formatTime(slot.endTime)}</span>}
                                    </div>
                                    <h4 className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 leading-snug">{slot.aktiviti}</h4>
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
                <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700 p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-rose-100 dark:bg-rose-900/50 rounded-xl text-rose-600 dark:text-rose-400">
                        <Award size={24} strokeWidth={2.5}/>
                      </div>
                      <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-800 dark:text-white">Majlis Penutup</h3>
                    </div>
                    {isAdmin && (
                      <button onClick={() => { const updated = [...penutupData, { id: 'p' + Date.now(), time: "08:00", aktiviti: "Aktiviti Baru" }]; setPenutupData(updated); saveToFirebase({ penutupData: updated }); }} className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl font-bold text-xs transition-colors active:scale-95 shadow-sm flex items-center gap-1.5"><Plus size={14}/> <span className="hidden sm:inline">Tambah Slot</span></button>
                    )}
                  </div>
                  
                  {(!penutupData || penutupData.length === 0) ? (
                    <div className="text-center py-12 text-slate-400 font-medium bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700">
                      <Award size={40} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm font-bold text-slate-500">Tiada atur cara majlis buat masa ini.</p>
                    </div>
                  ) : (
                    <div className="relative border-l-[3px] border-rose-200 dark:border-rose-800/50 ml-3 md:ml-6 space-y-5 mt-6">
                      {penutupData.map((slot) => (
                        <div key={slot.id} className="relative pl-6 md:pl-8 group">
                          <div className="absolute -left-[11px] top-4 h-5 w-5 rounded-full border-[4px] border-white dark:border-slate-800 bg-rose-500 shadow-md z-10 group-hover:scale-125 transition-transform duration-300"></div>
                          
                          {isAdmin ? (
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 relative shadow-sm transition-shadow">
                              <button onClick={() => { const updated = penutupData.filter(s => s.id !== slot.id); setPenutupData(updated); saveToFirebase({ penutupData: updated }); }} className="absolute top-4 right-4 text-red-400 hover:text-red-600 bg-red-50 dark:bg-red-900/20 p-1.5 rounded-lg transition-colors"><Trash2 size={16}/></button>
                              <div className="mb-3 pr-10 w-1/2">
                                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Masa</label>
                                <input type="time" value={slot.time} onChange={e => { const updated = penutupData.map(s => s.id === slot.id ? { ...s, time: e.target.value } : s); setPenutupData(updated); }} onBlur={() => saveToFirebase({ penutupData })} className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-xs font-black text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-800 transition-colors focus:ring-2 focus:ring-rose-500 outline-none" />
                              </div>
                              <textarea value={slot.aktiviti} onChange={e => { const updated = penutupData.map(s => s.id === slot.id ? { ...s, aktiviti: e.target.value } : s); setPenutupData(updated); }} onBlur={() => saveToFirebase({ penutupData })} className="w-full border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-white transition-colors outline-none focus:ring-2 focus:ring-rose-500 custom-scrollbar" rows={2} placeholder="Keterangan Aktiviti..." />
                            </div>
                          ) : (
                            <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] md:text-xs font-black tracking-wider shadow-sm mb-2">
                                <Clock size={12}/> {formatTime(slot.time)}
                              </div>
                              <h4 className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 leading-snug">{slot.aktiviti}</h4>
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
                <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700 p-6 md:p-10 shadow-xl text-center">
                  <div className="bg-purple-100 dark:bg-purple-900/50 w-16 h-16 md:w-20 md:h-20 mx-auto rounded-[1.5rem] flex items-center justify-center mb-5 transform rotate-3 shadow-inner border border-purple-200 dark:border-purple-800/50">
                    <Map size={36} className="text-purple-600 dark:text-purple-400 -rotate-3" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Pelan Pendaftaran</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm md:text-base font-medium">Panduan susun atur dewan bagi melancarkan pergerakan.</p>
                  
                  {isAdmin && !layoutImage && (
                    <div className="mb-5 p-6 border-2 border-dashed border-purple-200 dark:border-purple-800/50 rounded-2xl bg-purple-50/50 dark:bg-purple-900/10 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                      <label className="cursor-pointer flex flex-col items-center">
                        <UploadCloud size={32} className="text-purple-500 mb-2 animate-pulse" />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Muat Naik Fail Pelan Baharu</span>
                        <span className="text-[10px] font-medium text-slate-500 mt-1 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md shadow-sm">Sokongan: PDF / Imej</span>
                        <input type="file" accept="application/pdf, image/*" className="hidden" onChange={handleLayoutUpload} />
                      </label>
                    </div>
                  )}

                  <div className={`relative ${layoutImage ? '' : 'border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-[1.5rem] min-h-[250px] flex items-center justify-center p-4'}`}>
                    {layoutImage ? (
                      <div className="w-full flex flex-col gap-5">
                        
                        {/* MOBILE VIEW: HANYA BUTANG MUAT TURUN */}
                        <div className="block sm:hidden w-full bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center gap-4">
                           {layoutImage.includes('application/pdf') ? <FileText size={48} className="text-purple-500" /> : <ImageIcon size={48} className="text-purple-500" />}
                           <div className="space-y-1">
                             <p className="text-sm font-black text-slate-800 dark:text-slate-200">Dokumen Pelan Pendaftaran</p>
                             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{layoutImage.includes('application/pdf') ? 'Format PDF' : 'Format Imej'}</p>
                           </div>
                           <button 
                             onClick={() => handleDownloadBlob(layoutImage, layoutImage.includes('application/pdf') ? 'Pelan_Pendaftaran.pdf' : 'Pelan_Pendaftaran.jpg')}
                             className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 px-4 py-3 rounded-xl shadow-md transition-all active:scale-95 mt-1"
                           >
                             <Download size={16} /> Muat Turun ke Peranti
                           </button>
                           {isAdmin && (
                             <button 
                               onClick={async () => { 
                                 if(window.confirm("Padam pelan ini?")){ 
                                    setLayoutImage(null); 
                                    try {
                                      await setDoc(doc(db, "msr", "data_layout"), { layoutImage: null }); 
                                    } catch(err){}
                                 } 
                               }}
                               className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 px-4 py-3 rounded-xl transition-all active:scale-95"
                             >
                               <Trash2 size={16} /> Padam Rekod Pelan
                             </button>
                           )}
                        </div>

                        {/* DESKTOP/TABLET VIEW: PREVIEW + BUTANG */}
                        <div className="hidden sm:flex flex-col gap-4">
                          <div className="border-[3px] border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-lg relative group">
                            {layoutImage.includes('application/pdf') ? (
                              <iframe src={layoutImage} className="w-full h-[500px] md:h-[600px]" title="Pelan Pendaftaran" />
                            ) : (
                              <div className="p-3 bg-slate-100 dark:bg-slate-900/50">
                                 <img src={layoutImage} alt="Pelan Pendaftaran" className="w-full h-auto max-h-[600px] object-contain rounded-xl shadow-sm bg-white dark:bg-slate-800" />
                              </div>
                            )}
                            
                            {isAdmin && (
                              <label className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity backdrop-blur-sm duration-300 z-10">
                                <UploadCloud size={40} className="text-white mb-3 animate-bounce"/>
                                <span className="bg-purple-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xl hover:scale-105 transition-transform">Gantikan Fail Pelan</span>
                                <input type="file" accept="application/pdf, image/*" className="hidden" onChange={handleLayoutUpload} />
                              </label>
                            )}
                          </div>

                          <div className="flex justify-end gap-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <button 
                              onClick={() => handleDownloadBlob(layoutImage, layoutImage.includes('application/pdf') ? 'Pelan_Pendaftaran.pdf' : 'Pelan_Pendaftaran.jpg')}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 rounded-lg shadow-sm transition-all active:scale-95"
                            >
                              <Download size={16} /> Muat Turun Fail
                            </button>
                            {isAdmin && (
                              <button 
                                onClick={async () => { 
                                 if(window.confirm("Padam pelan ini?")){ 
                                    setLayoutImage(null); 
                                    try {
                                      await setDoc(doc(db, "msr", "data_layout"), { layoutImage: null }); 
                                    } catch(err){}
                                 } 
                                }}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 px-5 py-2.5 rounded-lg transition-all active:scale-95"
                              >
                                <Trash2 size={16} /> Padam
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-400 flex flex-col items-center gap-2">
                        <ImageIcon size={48} className="opacity-50" />
                        <p className="text-sm font-bold text-slate-500">Tiada fail pelan dimuat naik.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: LAGU */}
            {currentView === 'lagu' && (
              <div className="p-4 max-w-2xl mx-auto pb-32 text-center">
                <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 p-6 md:p-12 space-y-6 shadow-xl relative overflow-hidden">
                  <div className="absolute -top-16 -right-16 w-48 h-48 bg-pink-500/20 rounded-full blur-[60px] pointer-events-none"></div>
                  <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-rose-500/20 rounded-full blur-[60px] pointer-events-none"></div>
                  
                  <div className="relative z-10 bg-pink-100 dark:bg-pink-900/50 w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-pink-200 dark:border-pink-800/50">
                    <Music size={40} className="text-pink-500 dark:text-pink-400 animate-pulse duration-[3000ms]" />
                  </div>
                  
                  <h3 className="text-2xl md:text-4xl font-black relative z-10 tracking-tight text-slate-800 dark:text-white">LAGU KORPORAT JTM</h3>
                  
                  <div className="space-y-5 text-sm md:text-lg leading-loose md:leading-loose italic text-slate-600 dark:text-slate-300 font-bold relative z-10 px-2 md:px-8 py-4">
                    <p className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">Peneraju Pembangun<br/>Tenaga Mahir Negara<br/>Jabatan Tenaga Manusia</p>
                    <p className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">Kami Cekal Berhemah<br/>Khidmat Cekal Berkualiti<br/>Menjadi Amanat Semua</p>
                    
                    <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-slate-900 dark:to-pink-950/30 p-6 rounded-[1.5rem] not-italic font-black border border-pink-200/50 shadow-sm mt-6 transform hover:scale-105 transition-transform duration-500">
                      <span className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-pink-500 block mb-3">Korus</span>
                      <p className="text-slate-800 dark:text-pink-100 text-base md:text-xl leading-relaxed">
                        Mendukung Misi Bersama<br/>Membangun Sumber Manusia<br/>Itulah Janji Pada Negara<br/><span className="text-pink-600 dark:text-pink-400 text-lg md:text-2xl mt-1.5 block">Malaysia Berjaya</span>
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
            <div className="flex justify-between items-center p-3 md:p-4 bg-[#0f172a] border-b border-slate-800 text-white shadow-lg z-10">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400 shrink-0">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm md:text-base truncate max-w-xl">{viewingMemo.name}</h3>
                  <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">{viewingMemo.type === 'pdf' ? 'Dokumen PDF' : 'Fail Imej'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <button 
                  onClick={() => handleDownloadBlob(viewingMemo.url, viewingMemo.name)} 
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold text-xs transition-colors shadow-sm active:scale-95"
                  title="Muat Turun Dokumen"
                >
                  <Download size={16} /> Muat Turun
                </button>
                <button 
                  onClick={() => setViewingMemo(null)} 
                  className="p-2 bg-slate-800 hover:bg-red-500 hover:text-white text-slate-300 rounded-lg transition-all shadow-sm active:scale-90 ml-1"
                  title="Tutup Paparan"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 w-full h-full p-4 md:p-6 overflow-hidden flex justify-center items-center">
              {blobUrl ? (
                viewingMemo.type === 'pdf' ? (
                  <iframe src={blobUrl} className="w-full h-full bg-white rounded-xl shadow-2xl border border-slate-700" title={viewingMemo.name} />
                ) : (
                  <img src={blobUrl} alt={viewingMemo.name} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-slate-700 bg-slate-800" />
                )
              ) : (
                <div className="flex flex-col items-center gap-3 text-white animate-pulse">
                  <div className="w-10 h-10 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-bold tracking-widest uppercase text-[10px] text-slate-400">Memproses Dokumen...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- FOOTER --- */}
        <footer className="bg-[#f8fafc] dark:bg-[#0b1121] text-slate-400 py-6 text-center text-[10px] font-bold mt-auto pb-24 md:pb-6 border-t border-slate-200 dark:border-slate-800/50 relative z-30">
          <p>Hak Cipta Terpelihara &copy; 2026 Kolej Teknologi Termaju (ADTEC) Kampus Sandakan.</p>
        </footer>

        {/* --- BOTTOM NAV (MOBILE) --- */}
        <nav className="md:hidden fixed bottom-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 flex justify-around items-center pt-1.5 pb-safe-bottom pb-3 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          {[
            { id: 'home', icon: Home, label: 'Utama' },
            { id: 'memo', icon: FileText, label: 'Memo' },
            { id: 'ajk', icon: Users, label: 'AJK' },
            { id: 'jadual', icon: Calendar, label: 'Jadual' },
            { id: 'penutup', icon: Award, label: 'Penutup' }
          ].map((item) => (
            <button key={item.id} onClick={() => navigateTo(item.id)} className={`flex flex-col items-center gap-1 p-1.5 w-[20%] text-[9px] font-black transition-all active:scale-90 ${currentView === item.id ? 'text-blue-600 dark:text-blue-400 -translate-y-1.5' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
              <div className={`${currentView === item.id ? 'bg-blue-100 dark:bg-blue-900/40 p-2 rounded-xl shadow-sm border border-blue-200 dark:border-blue-800/50 mb-0.5' : 'p-1'}`}>
                <item.icon size={20} strokeWidth={currentView === item.id ? 2.5 : 2} />
              </div>
              <span className={`tracking-wide ${currentView === item.id ? 'opacity-100' : 'opacity-80'}`}>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* --- FAB QUICK ACTION BUTTON (MODERNIZED & ANIMATED) --- */}
        <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-50 flex flex-col items-end gap-2">
           {showFabMenu && (
             <div className="bg-white/85 dark:bg-slate-800/85 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl flex flex-col gap-1.5 text-xs font-bold w-44 animate-in slide-in-from-bottom-4 zoom-in-90 duration-200 ease-out origin-bottom-right rounded-2xl p-2 mb-2">
                <a href="https://www.jtm.gov.my/etatatertib" target="_blank" rel="noopener noreferrer" className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-2">
                  <Shield size={14} className="text-slate-400"/> eTATATERTIB
                </a>
                <a href="https://jims.jtm.gov.my/" target="_blank" rel="noopener noreferrer" className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-2">
                  <Monitor size={14} className="text-slate-400"/> Sistem JIMS
                </a>
                <button onClick={toggleTheme} className="p-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-2">
                  {isDarkMode ? <Sun size={14} className="text-slate-400"/> : <Moon size={14} className="text-slate-400"/>} 
                  Tema: {isDarkMode ? 'Cerah' : 'Gelap'}
                </button>
                <div className="h-px bg-slate-200/50 dark:bg-slate-700/50 my-1 mx-2"></div>
                {isAdmin ? (
                  <button onClick={() => { setIsAdmin(false); setShowFabMenu(false); }} className="flex items-center gap-2 p-3 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors"><LogOut size={16} /> Log Keluar Sesi</button>
                ) : (
                  <button onClick={() => { setShowLogin(true); setShowFabMenu(false); }} className="flex items-center gap-2 p-3 text-left text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors"><Lock size={16} /> Log Masuk Admin</button>
                )}
             </div>
           )}
           <button onClick={() => setShowFabMenu(!showFabMenu)} className="bg-slate-800 dark:bg-blue-600 text-white p-3.5 md:p-4 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-90 transition-all duration-300 focus:outline-none flex items-center justify-center border border-slate-700 dark:border-blue-500 relative group">
             <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
             <div className="relative w-5 h-5 flex items-center justify-center">
               <Command size={20} className={`absolute transition-all duration-300 ease-out ${showFabMenu ? '-rotate-90 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'}`} />
               <X size={20} className={`absolute transition-all duration-300 ease-out ${showFabMenu ? 'rotate-0 opacity-100 scale-100' : 'rotate-90 opacity-0 scale-50'}`} />
             </div>
           </button>
        </div>

      </div>
    </div>
  );
}