import React, { useState, useEffect, useRef } from 'react';
// Import Firebase Firestore
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase'; // Pastikan laluan (path) ke fail firebase.js anda adalah betul

import { 
  FileText, Users, Map, Calendar, ExternalLink, Music, 
  ChevronLeft, ChevronDown, ChevronUp, Home,
  Lock, LogOut, UploadCloud, Plus, Trash2, Edit3, Image as ImageIcon,
  Bell, Eye, EyeOff, ShieldCheck, AlertTriangle, Clock,
  Moon, Sun, Menu, LayoutGrid, Zap, Settings, Command, Award,
  Globe, Monitor, Shield
} from 'lucide-react';

// --- STYLES FOR SCROLLBAR & ANIMATIONS ---
const GlobalStyles = () => (
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
);

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

// --- DATA AWALAN (FALLBACK / JIKA FIREBASE KOSONG) ---
const initialAjkInduk = [
  { peranan: "Pengerusi", nama: "CIK NORASHSIKIN BINTI MOHD ARSAD" },
  { peranan: "Naib Pengerusi", nama: "Ts. NURZHARFAN BIN RAFEI BUI" },
  { peranan: "Setiausaha", nama: "EN MOHD FAIZ FATHULLAH BIN ALI HASSAN" },
  { peranan: "Bendahari", nama: "CIK NORASHIKIN BINTI ARIFFIN (K)\nPN NORHADZLA BINTI ABD HALIM" }
];

const initialBiroList = [
  { nama: "Biro Kebajikan, Disiplin & Keselamatan", ketua: "EN MUHAIDI BIN MOHAMAD (K)", ahli: ["PN HASLINDA BINTI BOHARI", "EN JAMLUDIN BINTI ASSAT", "EN BILLY ANAK REJAP", "PENGAWAL KESELAMATAN"] },
  { nama: "Biro Seranta & Protokol", ketua: "EN JAIKOL BIN UDAR (K)", ahli: ["PN ROSHAYATI BINTI MOHAMMAD", "PN ASRIYANI BINTI SERAILA", "PN ASLINAH BINTI ALDAN"] }
];

const initialJadual = [
  {
    id: 'd1', tarikh: "2026-07-06",
    slots: [
      { id: 's11', startTime: "08:00", endTime: "12:30", aktiviti: "Taklimat Bersama Fasilitator & Persiapan Hari Pendaftaran" },
      { id: 's12', startTime: "12:30", endTime: "14:00", aktiviti: "Rehat / Solat / Makan Tengah Hari" },
      { id: 's13', startTime: "14:00", endTime: "16:00", aktiviti: "Persiapan Hari Pendaftaran (Sambungan)" }
    ]
  },
  {
    id: 'd2', tarikh: "2026-07-07",
    slots: [
      { id: 's21', startTime: "04:00", endTime: "06:30", aktiviti: "Pengurusan Diri, Solat Subuh & Kuliah Subuh" },
      { id: 's22', startTime: "06:30", endTime: "07:30", aktiviti: "Sarapan Pagi" },
      { id: 's23', startTime: "08:00", endTime: "09:30", aktiviti: "Taklimat Keselamatan (NIOSH)" }
    ]
  }
];

const initialPenutup = [
  { id: 'p1', time: "08:00", aktiviti: "Ketibaan Pelajar Baharu & Staf di Dewan Besar" },
  { id: 'p2', time: "08:30", aktiviti: "Ketibaan Tetamu Kehormat & Pengarah" },
  { id: 'p3', time: "08:45", aktiviti: "Nyanyian Lagu Negaraku, Sabah Tanah Airku & Lagu JTM" },
  { id: 'p4', time: "09:00", aktiviti: "Bacaan Doa" },
  { id: 'p5', time: "09:10", aktiviti: "Ucapan Wakil Pelajar Baharu" },
  { id: 'p6', time: "09:30", aktiviti: "Ucapan Perasmian Penutupan MSR oleh Pengarah" },
  { id: 'p7', time: "10:00", aktiviti: "Penyampaian Sijil, Hadiah (Kumpulan Terbaik) & Cenderahati" },
  { id: 'p8', time: "10:30", aktiviti: "Persembahan Multimedia & Sesi Bergambar" },
  { id: 'p9', time: "11:00", aktiviti: "Jamuan Ringan & Bersurai" },
];

const initialMemoText = `Rujukan: ILPSDK/600-2/4 JLD.6 (44)\nTarikh: 11 MEI 2026\n\nPERKARA: PELANTIKAN AHLI JAWATANKUASA MINGGU SILATURAHIM (MSR) SESI 2/2026 ADTEC JTM KAMPUS SANDAKAN\n\nDengan hormatnya saya merujuk kepada perkara di atas.\n\n2. Sukacita dimaklumkan bahawa pihak institut dengan ini melantik tuan/puan sebagai Ahli Jawatankuasa Minggu Silaturahim (MSR) Sesi 2/2026 ADTEC JTM Kampus Sandakan yang akan dilaksanakan pada 6 hingga 10 Julai 2026.\n\n3. Sehubungan dengan itu, pihak institut amat berharap agar tuan/puan dapat memberikan komitmen yang tinggi.\n\nSekian terima kasih.`;

// --- NETWORK ANIMATION COMPONENT ---
const NetworkAnimation = () => {
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
      const numParticles = Math.floor((canvas.width * canvas.height) / 12000); 
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          radius: Math.random() * 2 + 1
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 1;
      
      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          let p2 = particles[j];
          let dx = p.x - p2.x;
          let dy = p.y - p2.y;
          let dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 - dist / 800})`;
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
};

// --- LIVE CLOCK COMPONENT ---
const LiveClock = () => {
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
};

// --- MAIN APP COMPONENT ---
export default function App() {
  // Navigation, Theme & Auth State
  const [currentView, setCurrentView] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Ditetapkan ke true untuk pemuatan awal dari Firebase
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  
  // Security States
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const inactivityTimer = useRef(null);

  // Data States (Kandungan dipautkan ke Firebase)
  const [announcement, setAnnouncement] = useState('');
  const [sesiKemasukan, setSesiKemasukan] = useState({ sesi: '2', tahun: '2026' });
  const [memoText, setMemoText] = useState('');
  const [memoFileUrl, setMemoFileUrl] = useState(null);
  const [memoFileType, setMemoFileType] = useState(null);
  const [ajkInduk, setAjkInduk] = useState([]);
  const [biroList, setBiroList] = useState([]);
  const [jadualData, setJadualData] = useState([]);
  const [penutupData, setPenutupData] = useState([]);
  const [layoutImage, setLayoutImage] = useState(null);

  // UI States
  const [activeJadualTab, setActiveJadualTab] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // --- INTEGRASI FIREBASE: PENGAMBILAN DATA REAL-TIME ---
  useEffect(() => {
    const docRef = doc(db, "msr", "data_utama");

    // Mendengar sebarang perubahan data dalam dokumen Firestore secara langsung
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.announcement !== undefined) setAnnouncement(data.announcement);
        if (data.sesiKemasukan) setSesiKemasukan(data.sesiKemasukan);
        if (data.memoText !== undefined) setMemoText(data.memoText);
        if (data.memoFileUrl !== undefined) setMemoFileUrl(data.memoFileUrl);
        if (data.memoFileType !== undefined) setMemoFileType(data.memoFileType);
        if (data.ajkInduk) setAjkInduk(data.ajkInduk);
        if (data.biroList) setBiroList(data.biroList);
        if (data.penutupData) setPenutupData(data.penutupData);
        if (data.layoutImage !== undefined) setLayoutImage(data.layoutImage);
        if (data.jadualData) {
          setJadualData(data.jadualData);
          // Set tab jadual yang aktif jika belum ditetapkan
          if (data.jadualData.length > 0 && !activeJadualTab) {
            setActiveJadualTab(data.jadualData[0].id);
          }
        }
      } else {
        // Jika pangkalan data masih kosong, hantar data awalan (initial data) ke Firestore
        const defaultData = {
          announcement: '🌟 Hari Pendaftaran Pelajar Baharu bermula 6 Julai 2026 jam 9:00 Pagi. Sila lapor diri di Dewan Besar ADTEC Sandakan.',
          sesiKemasukan: { sesi: '2', tahun: '2026' },
          memoText: initialMemoText,
          memoFileUrl: null,
          memoFileType: null,
          ajkInduk: initialAjkInduk,
          biroList: initialBiroList,
          jadualData: initialJadual,
          penutupData: initialPenutup,
          layoutImage: null
        };
        setDoc(docRef, defaultData);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Ralat Firebase:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [activeJadualTab]);

  // --- INTEGRASI FIREBASE: FUNGSI SIMPAN DATA ---
  const saveToFirebase = async (fieldsToUpdate) => {
    try {
      const docRef = doc(db, "msr", "data_utama");
      await setDoc(docRef, fieldsToUpdate, { merge: true });
    } catch (error) {
      console.error("Gagal mengemas kini Firebase:", error);
    }
  };

  // --- THEME & SCROLL EFFECT ---
  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
    }
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.theme = !isDarkMode ? 'dark' : 'light';
  };

  const navigateTo = useCallback((view) => {
    // 1. Tutup menu FAB jika terbuka 
    setShowFabMenu(false); 
    
    // 2. Tukar skrin serta-merta tanpa paksa loading skeleton
    setCurrentView(view); 
    
    // 3. Lompat ke atas halaman dengan lancar
    window.scrollTo({ top: 0, behavior: 'auto' }); 
  }, []);

  // --- SECURITY LOGIC ---
  const resetInactivityTimer = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (isAdmin) {
      inactivityTimer.current = setTimeout(() => {
        setIsAdmin(false);
        alert('Sesi ditamatkan secara automatik atas faktor keselamatan (15 minit tiada aktiviti).');
      }, 15 * 60 * 1000);
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keypress', resetInactivityTimer);
    return () => {
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('keypress', resetInactivityTimer);
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [isAdmin]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (isLockedOut) return;
    if (loginForm.username === 'admin' && loginForm.password === 'abc@12345') {
      setIsAdmin(true);
      setShowLogin(false);
      setLoginForm({ username: '', password: '' });
      setLoginAttempts(0);
      resetInactivityTimer();
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
      
      if (file.type === 'application/pdf') {
        // Tukar PDF kepada Base64 String supaya serasi dengan GitHub Pages
        reader.onload = (ev) => {
          const base64Data = ev.target.result;
          setMemoFileUrl(base64Data);
          setMemoFileType('pdf');
          saveToFirebase({ memoFileUrl: base64Data, memoFileType: 'pdf' });
        };
        reader.readAsDataURL(file);
        
      } else if (file.type.startsWith('image/')) {
        // Kekalkan logik imej sedia ada (Base64)
        reader.onload = (ev) => {
          const base64Data = ev.target.result;
          setMemoFileUrl(base64Data);
          setMemoFileType('image');
          saveToFirebase({ memoFileUrl: base64Data, memoFileType: 'image' });
        };
        reader.readAsDataURL(file);
      }
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
          <div className="absolute top-full left-0 mt-2 min-w-[80px] max-h-48 overflow-y-auto custom-scrollbar bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[60] py-1.5 animate-in slide-in-from-top-2 zoom-in-95 origin-top">
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
          <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-2 fade-in duration-200 bg-white dark:bg-slate-800/50">
            <div className="mb-4">
              <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">Ketua Biro</span>
              <p className="text-slate-900 dark:text-slate-200 font-bold text-sm mt-2 ml-1">{biro.getua || biro.ketua}</p>
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
    <div className="p-4 max-w-5xl mx-auto pb-32 w-full animate-pulse space-y-6 mt-4">
      <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full"></div>
      <div className="flex gap-4">
         <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3"></div>
         <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/4"></div>
      </div>
      <div className="space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 flex flex-col relative transition-colors duration-500 selection:bg-blue-200 dark:selection:bg-blue-900">
        <GlobalStyles />

        {/* --- TOP HEADER --- */}
        <header className={`sticky top-0 z-40 backdrop-blur-xl transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/90 dark:bg-slate-900/90 shadow-md shadow-slate-200/50 dark:shadow-slate-900/50 border-b border-slate-200 dark:border-slate-800' 
            : 'bg-white/50 dark:bg-slate-900/50 shadow-none border-b border-transparent'
        }`}>
          <div className={`max-w-6xl mx-auto px-4 flex items-center justify-between transition-all duration-300 ${
            isScrolled ? 'h-14 md:h-16' : 'h-16 md:h-20'
          }`}>
            <div className="flex items-center gap-3">
              {currentView !== 'home' && (
                <button onClick={() => navigateTo('home')} className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-all active:scale-90">
                  <ChevronLeft size={24} />
                </button>
              )}
              
              <div className="flex items-center gap-2 md:gap-3">
                <img 
                  src="Logo ADTEC JTM 2025 Kampus Sandakan.png" 
                  alt="Logo ADTEC" 
                  className={`w-auto object-contain drop-shadow-sm bg-white/80 dark:bg-slate-800 rounded-lg transition-all duration-300 ${
                    isScrolled ? 'h-8 md:h-10 p-1' : 'h-10 md:h-12 p-1.5'
                  }`} 
                />
                <div className="flex flex-col justify-center">
                  <h1 className={`font-extrabold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-blue-400 dark:to-indigo-300 transition-all duration-300 ${
                    isScrolled ? 'text-base md:text-lg' : 'text-lg md:text-xl'
                  }`}>
                    iMSR ADTEC JTM
                  </h1>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:block mt-0.5">KAMPUS Sandakan</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden sm:flex items-center gap-1 border-r border-slate-200 dark:border-slate-700 pr-2 md:pr-4 mr-1 md:mr-2">
                <a href="https://www.jtm.gov.my/etatatertib/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors" title="eTATATERTIB">
                  <Shield size={20} />
                </a>
                <a href="https://jims.jtm.gov.my/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors" title="Sistem JIMS">
                  <Monitor size={20} />
                </a>
                <a href="https://www.facebook.com/ilpsdk" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors" title="Facebook ILP Sandakan">
                  <Globe size={20} />
                </a>
              </div>

              {isAdmin && (
                <span className="hidden md:flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
                  <ShieldCheck size={14}/> Sesi Admin
                </span>
              )}
              <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-200/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all active:scale-90">
                 {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </header>

        {/* --- LOGIN MODAL --- */}
        {showLogin && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-[2rem] shadow-2xl p-8 w-full max-w-sm animate-in zoom-in-95 duration-300 border border-white/20 dark:border-slate-700">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-extrabold flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl">
                     <Lock size={24} />
                  </div>
                  Akses Admin
                </h2>
                <button onClick={() => setShowLogin(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors active:scale-90"><Plus className="rotate-45" size={24}/></button>
              </div>

              {isLockedOut ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 p-4 rounded-2xl flex items-start gap-3 mb-4">
                  <AlertTriangle size={24} className="shrink-0" />
                  <p className="text-sm font-bold leading-tight">Akaun dikunci. Sila cuba lagi selepas 30 saat.</p>
                </div>
              ) : (
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nama Pengguna</label>
                    <input type="text" required value={loginForm.username} onChange={(e) => setLoginForm({...loginForm, username: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl focus:ring-0 focus:border-blue-500 outline-none transition-all font-semibold text-slate-800 dark:text-white" placeholder="Username" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Kata Laluan</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} required value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 pl-4 pr-12 py-3 rounded-xl focus:ring-0 focus:border-blue-500 outline-none transition-all font-semibold text-slate-800 dark:text-white" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors active:scale-90">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl active:scale-95 transition-all shadow-lg shadow-blue-600/30">
                    Sahkan Log Masuk
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-grow w-full">
          {isLoading ? <SkeletonLoader /> : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
              
              {/* VIEW: HOME */}
              {currentView === 'home' && (
                <div className="p-4 max-w-5xl mx-auto pb-32 space-y-5">
                  {/* ANNOUNCEMENT BANNER */}
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-3">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold shrink-0">
                      <Bell className="animate-bounce" size={20}/>
                      <span className="uppercase text-sm tracking-wider">Pengumuman:</span>
                    </div>
                    {isAdmin ? (
                      <div className="w-full flex items-center relative">
                        <Edit3 size={16} className="absolute left-3 text-amber-500" />
                        <input 
                          value={announcement} 
                          onChange={e => {
                            setAnnouncement(e.target.value);
                            saveToFirebase({ announcement: e.target.value });
                          }} 
                          className="w-full pl-9 pr-3 py-2 border border-amber-300 dark:border-amber-700 rounded-lg text-sm font-semibold text-amber-900 dark:text-amber-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                        />
                      </div>
                    ) : (
                      <div className="w-full overflow-hidden">
                         <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 leading-snug break-words">
                           {announcement}
                         </p>
                      </div>
                    )}
                  </div>

                  {/* HERO SECTION */}
                  <div className="bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 dark:from-slate-800 dark:via-blue-950 dark:to-black rounded-[2rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden group">
                    <NetworkAnimation />
                    <div className="absolute top-0 right-10 w-64 h-64 bg-blue-500/30 dark:bg-blue-600/20 rounded-full blur-3xl animate-float z-0 pointer-events-none"></div>
                    <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-indigo-500/30 dark:bg-purple-600/20 rounded-full blur-3xl animate-float-delayed z-0 pointer-events-none"></div>
            
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div className="max-w-lg space-y-4">
                        <div className="inline-flex items-center gap-2 bg-white/10 dark:bg-black/30 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-inner">
                          <Zap size={14} className="text-yellow-400 animate-pulse" />
                          {isAdmin ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-widest text-blue-50">Kemasukan</span>
                              <ModernDropdown 
                                value={sesiKemasukan.sesi}
                                options={[
                                  { label: '1', value: '1' },
                                  { label: '2', value: '2' }
                                ]}
                                onChange={(val) => {
                                  const updated = { ...sesiKemasukan, sesi: val };
                                  setSesiKemasukan(updated);
                                  saveToFirebase({ sesiKemasukan: updated });
                                }}
                              />
                              <span className="text-xs font-bold text-blue-50 opacity-50">/</span>
                              <ModernDropdown 
                                value={sesiKemasukan.tahun}
                                options={[...Array(2100 - 2024 + 1)].map((_, i) => {
                                  const year = (2024 + i).toString();
                                  return { label: year, value: year };
                                })}
                                onChange={(val) => {
                                  const updated = { ...sesiKemasukan, tahun: val };
                                  setSesiKemasukan(updated);
                                  saveToFirebase({ sesiKemasukan: updated });
                                }}
                              />
                            </div>
                          ) : (
                            <span className="text-xs font-bold uppercase tracking-widest text-blue-50">
                              Kemasukan {sesiKemasukan.sesi}/{sesiKemasukan.tahun}
                            </span>
                          )}
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight drop-shadow-lg">
                           Minggu Silaturahim
                        </h2>
                        <p className="text-blue-100 dark:text-blue-200/80 text-lg md:text-xl font-medium opacity-90 max-w-md">
                           Kolej Teknologi Termaju (ADTEC) Jabatan Tenaga Manusia Kampus Sandakan
                        </p>
                      </div>
                      
                      <div className="flex justify-end hidden md:flex relative z-10 no-print">
                         <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] text-center w-full max-w-xs transform group-hover:scale-105 transition-transform duration-500 relative">
                           <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mb-1 opacity-80">Paparan Masa</p>
                           <LiveClock />
                           <div className="mt-5 pt-4 border-t border-white/10">
                             <p className="text-sm font-semibold opacity-90 text-blue-50 tracking-wide">{formatTarikh(new Date().toISOString().split('T')[0])}</p>
                           </div>
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
                      <button 
                        key={item.id} onClick={() => navigateTo(item.id)} 
                        className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-200/60 dark:border-slate-700/50 flex flex-col items-center justify-center text-center gap-3 hover:-translate-y-2 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 group active:scale-95"
                      >
                        <div className={`bg-${item.color}-50 dark:bg-${item.color}-900/30 p-4 md:p-5 rounded-[1.5rem] text-${item.color}-600 dark:text-${item.color}-400 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm`}>
                          <item.icon size={32} strokeWidth={2} />
                        </div>
                        <div>
                           <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm md:text-base leading-tight">{item.title}</h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold hidden sm:block mt-1 uppercase tracking-wider">{item.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* VIEW: MEMO */}
              {memoFileType === 'pdf' ? (
  <div className="flex flex-col">
     <iframe src={memoFileUrl} title="Memo PDF" className="w-full h-[600px] md:h-[800px] bg-white dark:bg-slate-800" />
     <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 text-center flex flex-wrap justify-center gap-3">
       
       {/* Butang 1: Paparan Penuh */}
       <button 
         onClick={() => {
           const newWindow = window.open();
           if (newWindow) {
             newWindow.document.write(
               `<html style="margin:0;padding:0;"><head><title>Paparan Penuh Memo MSR</title></head>` +
               `<body style="margin:0;padding:0;">` +
               `<iframe src="${memoFileUrl}" style="width:100%; height:100vh; border:none; margin:0; padding:0;"></iframe>` +
               `</body></html>`
             );
             newWindow.document.close();
           } else {
             alert("Sila benarkan 'Pop-up' pada pelayar web anda untuk melihat dokumen.");
          }
         }} 
         className="inline-flex items-center gap-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
       >
         <ExternalLink size={18} /> Buka Paparan Penuh
       </button>

       {/* Butang Baru: Muat Turun Fail PDF Sebenar */}
       <button 
         onClick={() => {
           try {
             // 1. Cipta pautan muat turun halimunan
             const downloadLink = document.createElement('a');
             downloadLink.href = memoFileUrl;
             
             // 2. Berikan nama fail fizikal semasa di-download
             downloadLink.download = 'Memo_Minggu_Silaturahim_ADTECSDK.pdf';
             
             // 3. Cetus aksi muat turun
             document.body.appendChild(downloadLink);
             downloadLink.click();
             document.body.removeChild(downloadLink);
           } catch (error) {
             alert("Gagal memuat turun fail. Sila cuba lagi.");
           }
         }} 
         className="inline-flex items-center gap-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
       >
         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
           <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path>
           <polyline points="7 10 12 15 17 10"></polyline>
           <line x1="12" y1="15" x2="12" y2="3"></line>
         </svg>
         Muat Turun PDF
       </button>

     </div>
  </div>
) : (
  <img src={memoFileUrl} alt="Memo Lantikan" className="w-full h-auto object-contain" />
)}

              {/* VIEW: AJK */}
              {currentView === 'ajk' && (
                 <div className="p-4 max-w-4xl mx-auto pb-32">
                  {/* Induk Section */}
                  <div className="flex justify-between items-end mb-5 px-2">
                    <h3 className="font-extrabold text-2xl text-slate-800 dark:text-white tracking-tight">Jawatankuasa Induk</h3>
                     {isAdmin && (
                      <button onClick={() => {
                        const newAjk = [...ajkInduk, { peranan: "Peranan Baru", nama: "Nama Baru" }];
                        setAjkInduk(newAjk);
                        saveToFirebase({ ajkInduk: newAjk });
                      }} className="text-sm bg-blue-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-bold hover:bg-blue-700 shadow-md transition-all active:scale-95">
                        <Plus size={18}/> <span className="hidden sm:inline">Tambah Induk</span>
                     </button>
                    )}
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8 mb-10 transition-colors">
                    <div className="space-y-4">
                       {ajkInduk.map((ajk, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-4 last:border-0 last:pb-0">
                          {isAdmin ? (
                            <>
                              <input value={ajk.peranan} onChange={e => { 
                                const newAjk = [...ajkInduk]; 
                                newAjk[idx].peranan = e.target.value; 
                                setAjkInduk(newAjk); 
                                saveToFirebase({ ajkInduk: newAjk });
                              }} className="px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-sm w-full sm:w-1/3 font-bold uppercase bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:border-blue-500" />
                              <input value={ajk.nama} onChange={e => { 
                                const newAjk = [...ajkInduk]; 
                                newAjk[idx].nama = e.target.value; 
                                setAjkInduk(newAjk); 
                                saveToFirebase({ ajkInduk: newAjk });
                              }} className="px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-sm w-full font-bold bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:border-blue-500" />
                              <button onClick={() => {
                                const newAjk = ajkInduk.filter((_, i) => i !== idx);
                                setAjkInduk(newAjk);
                                saveToFirebase({ ajkInduk: newAjk });
                              }} className="text-red-500 p-3 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors"><Trash2 size={20}/></button>
                            </>
                          ) : (
                            <>
                               <span className="text-xs sm:text-sm font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest sm:w-1/3">{ajk.peranan}</span>
                              <span className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100 sm:w-2/3 whitespace-pre-line">{ajk.nama}</span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                   {/* Biro Section */}
                  <div className="flex justify-between items-end mb-5 px-2">
                    <h3 className="font-extrabold text-2xl text-slate-800 dark:text-white tracking-tight">Biro Pelaksana</h3>
                    {isAdmin && (
                       <button onClick={() => {
                        const newBiro = [...biroList, { nama: "Biro Baru", ketua: "Ketua", ahli: [] }];
                        setBiroList(newBiro);
                        saveToFirebase({ biroList: newBiro });
                      }} className="text-sm bg-emerald-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-bold hover:bg-emerald-700 shadow-md transition-all active:scale-95">
                        <Plus size={18}/> <span className="hidden sm:inline">Tambah Biro</span>
                      </button>
                    )}
                  </div>

                  {isAdmin ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {biroList.map((biro, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] overflow-hidden shadow-sm p-6 relative transition-colors">
                            <button onClick={() => {
                              const newBiro = biroList.filter((_, i) => i !== idx);
                              setBiroList(newBiro);
                              saveToFirebase({ biroList: newBiro });
                            }} className="absolute top-5 right-5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-xl transition-colors"><Trash2 size={20}/></button>
                          
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nama Biro</label>
                           <input value={biro.nama} onChange={e => { 
                             const newBiro = [...biroList]; 
                             newBiro[idx].nama = e.target.value; 
                             setBiroList(newBiro); 
                             saveToFirebase({ biroList: newBiro });
                           }} className="w-[85%] px-4 py-2.5 mb-4 border-2 border-slate-100 dark:border-slate-700 rounded-xl font-extrabold text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:border-blue-500" />
                          
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Ketua Biro</label>
                          <input value={biro.ketua} onChange={e => { 
                            const newBiro = [...biroList];
                            newBiro[idx].ketua = e.target.value; 
                            setBiroList(newBiro); 
                            saveToFirebase({ biroList: newBiro });
                          }} className="w-full px-4 py-2.5 mb-5 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-sm font-bold bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:border-blue-500" />
                          
                          <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700">
                             <div className="flex justify-between items-center mb-4">
                              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Senarai Ahli</span>
                              <button onClick={() => { 
                                const newBiro = [...biroList];
                                if(!newBiro[idx].ahli) newBiro[idx].ahli = [];
                                newBiro[idx].ahli.push("Ahli Baru"); 
                                setBiroList(newBiro); 
                                saveToFirebase({ biroList: newBiro });
                              }} className="text-xs bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg flex items-center gap-1 font-bold shadow-sm hover:scale-105 active:scale-95 transition-all"><Plus size={14}/> Tambah</button>
                            </div>
                            <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                               {biro.ahli && biro.ahli.map((ahli, aIdx) => (
                                <div key={aIdx} className="flex gap-2">
                                  <input value={ahli} onChange={e => { 
                                    const newBiro = [...biroList]; 
                                    newBiro[idx].ahli[aIdx] = e.target.value; 
                                    setBiroList(newBiro); 
                                    saveToFirebase({ biroList: newBiro });
                                  }} className="flex-1 px-3 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-blue-500" />
                                  <button onClick={() => { 
                                    const newBiro = [...biroList];
                                    newBiro[idx].ahli = newBiro[idx].ahli.filter((_, i) => i !== aIdx); 
                                    setBiroList(newBiro); 
                                    saveToFirebase({ biroList: newBiro });
                                  }} className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 px-3 rounded-xl transition-colors"><Trash2 size={18}/></button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                   ) : (
                    <div className="space-y-4">
                      {biroList.map((biro, idx) => (
                        <AccordionBiro key={`biro-${idx}`} biro={biro} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* VIEW: JADUAL */}
               {currentView === 'jadual' && (
                <div className="p-4 max-w-4xl mx-auto pb-32 flex flex-col min-h-screen md:min-h-[calc(100vh-100px)]">
                  <div className="flex justify-between items-end mb-6 px-2 shrink-0">
                    <div>
                        <h3 className="font-extrabold text-2xl text-slate-800 dark:text-white tracking-tight">Tentatif Terperinci</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Garis masa aktiviti MSR.</p>
                    </div>
                    {isAdmin && (
                        <button onClick={() => {
                         const newId = 'd' + Date.now();
                         const today = new Date().toISOString().split('T')[0];
                         const updatedJadual = [...jadualData, { id: newId, tarikh: today, slots: [] }];
                         setJadualData(updatedJadual);
                         setActiveJadualTab(newId);
                         saveToFirebase({ jadualData: updatedJadual });
                       }} className="text-sm bg-orange-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-bold hover:bg-orange-600 shadow-md transition-all active:scale-95 shrink-0">
                         <Plus size={18}/> <span className="hidden sm:inline">Tambah Hari</span>
                       </button>
                    )}
                   </div>

                  {/* Tabs Selector */}
                  <div className="sticky top-[64px] md:top-[80px] z-30 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-md py-4 mb-4 flex overflow-x-auto gap-3 px-2 snap-x hide-scrollbar shrink-0 border-b border-slate-200 dark:border-slate-800 transition-colors">
                    {jadualData.map((hari) => (
                       <button
                        key={hari.id}
                        onClick={() => setActiveJadualTab(hari.id)}
                        className={`snap-start shrink-0 px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 ${
                           activeJadualTab === hari.id 
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-105' 
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {formatTarikh(hari.tarikh)}
                      </button>
                    ))}
                  </div>

                  {/* Timeline Slots */}
                   <div className="flex-grow px-2 pb-6 pt-2">
                    {jadualData.map((hari) => {
                      if (hari.id !== activeJadualTab) return null;
                      
                       return (
                        <div key={hari.id} className="animate-in fade-in slide-in-from-right-8 duration-300">
                          {isAdmin && (
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-orange-200 dark:border-orange-900/50 mb-10 flex flex-col sm:flex-row gap-5 items-center justify-between sticky top-[150px] z-20 transition-colors">
                              <div className="w-full">
                                <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Tetapan Tarikh Tab</label>
                                 <input 
                                  type="date"
                                  value={hari.tarikh} 
                                  onChange={e => {
                                    const updated = jadualData.map(d => d.id === hari.id ? { ...d, tarikh: e.target.value } : d);
                                    setJadualData(updated);
                                    saveToFirebase({ jadualData: updated });
                                  }}
                                  className="w-full px-4 py-3 border-2 border-slate-100 dark:border-slate-700 rounded-xl font-extrabold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900 focus:border-orange-500 outline-none transition-colors" 
                                />
                               </div>
                              <div className="flex gap-3 w-full sm:w-auto mt-2 sm:mt-0 shrink-0">
                                <button onClick={() => {
                                  const updated = jadualData.map(d => d.id === hari.id ? { ...d, slots: [...d.slots, { id: 's' + Date.now(), startTime: "08:00", endTime: "09:00", aktiviti: "Aktiviti Baru" }] } : d);
                                  setJadualData(updated);
                                  saveToFirebase({ jadualData: updated });
                                }} className="flex-1 sm:flex-none bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 px-5 py-3 rounded-xl text-sm font-bold active:scale-95 transition-transform shadow-sm">
                                  + Slot Masa
                                </button>
                                 <button onClick={() => {
                                  const updated = jadualData.filter(h => h.id !== hari.id);
                                  setJadualData(updated);
                                  if (updated.length > 0) setActiveJadualTab(updated[0].id);
                                  saveToFirebase({ jadualData: updated });
                                }} className="flex-1 sm:flex-none bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-5 py-3 rounded-xl text-sm font-bold active:scale-95 transition-transform shadow-sm border border-red-100 dark:border-red-900/30">
                                  Padam Hari
                                </button>
                               </div>
                            </div>
                          )}

                           {hari.slots.length === 0 ? (
                            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-dashed border-slate-300 dark:border-slate-600 transition-colors">
                              <Calendar className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={56} />
                               <p className="text-slate-500 dark:text-slate-400 font-bold">Tiada slot jadual untuk hari ini.</p>
                            </div>
                          ) : (
                             <div className="relative border-l-4 border-orange-200 dark:border-orange-900/50 ml-4 md:ml-8 space-y-8">
                              {hari.slots.map((slot) => (
                                <div key={slot.id} className="relative pl-8 md:pl-12 group">
                                   <div className="absolute -left-[12px] top-6 h-5 w-5 rounded-full border-[4px] border-slate-100 dark:border-slate-900 bg-orange-500 shadow-md z-10 group-hover:scale-150 group-hover:bg-orange-400 transition-transform duration-300"></div>
                                  
                                  {isAdmin ? (
                                    <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-700 relative group-hover:border-orange-400 dark:group-hover:border-orange-600 transition-colors">
                                      <button onClick={() => {
                                        const updated = jadualData.map(d => d.id === hari.id ? { ...d, slots: d.slots.filter(s => s.id !== slot.id) } : d);
                                        setJadualData(updated);
                                        saveToFirebase({ jadualData: updated });
                                      }} className="absolute top-5 right-5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-xl transition-colors"><Trash2 size={20}/></button>
                                      
                                      <div className="mb-4 pr-12 grid grid-cols-2 gap-4">
                                         <div>
                                          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Masa Mula</label>
                                           <input type="time" value={slot.startTime} onChange={e => {
                                             const updated = jadualData.map(d => d.id === hari.id ? { ...d, slots: d.slots.map(s => s.id === slot.id ? { ...s, startTime: e.target.value } : s) } : d);
                                             setJadualData(updated);
                                             saveToFirebase({ jadualData: updated });
                                           }} className="w-full px-4 py-2.5 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-sm font-bold text-orange-600 dark:text-orange-400 bg-slate-50 dark:bg-slate-900 focus:border-orange-500 outline-none" />
                                        </div>
                                         <div>
                                          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Masa Tamat</label>
                                             <input type="time" value={slot.endTime} onChange={e => {
                                               const updated = jadualData.map(d => d.id === hari.id ? { ...d, slots: d.slots.map(s => s.id === slot.id ? { ...s, endTime: e.target.value } : s) } : d);
                                               setJadualData(updated);
                                               saveToFirebase({ jadualData: updated });
                                             }} className="w-full px-4 py-2.5 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-sm font-bold text-orange-600 dark:text-orange-400 bg-slate-50 dark:bg-slate-900 focus:border-orange-500 outline-none" />
                                        </div>
                                      </div>
                                      <textarea value={slot.aktiviti} onChange={e => {
                                        const updated = jadualData.map(d => d.id === hari.id ? { ...d, slots: d.slots.map(s => s.id === slot.id ? { ...s, aktiviti: e.target.value } : s) } : d);
                                        setJadualData(updated);
                                        saveToFirebase({ jadualData: updated });
                                      }} className="w-full px-5 py-4 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-sm md:text-base font-semibold focus:border-orange-500 outline-none text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900 custom-scrollbar" rows={3} placeholder="Keterangan Aktiviti..." />
                                    </div>
                                   ) : (
                                    <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
                                       <div className="flex items-center text-orange-700 dark:text-orange-300 text-xs md:text-sm font-extrabold bg-orange-50 dark:bg-orange-900/30 inline-flex px-4 py-2 rounded-xl border border-orange-100 dark:border-orange-800/50 mb-4 tracking-widest shadow-sm">
                                        <Clock size={16} className="mr-2" /> 
                                         {formatTime(slot.startTime)} {slot.endTime ? ` - ${formatTime(slot.endTime)}` : ''}
                                      </div>
                                      <h4 className="text-lg md:text-xl font-extrabold text-slate-800 dark:text-slate-100 leading-snug">{slot.aktiviti}</h4>
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
                <div className="p-4 max-w-4xl mx-auto pb-32 flex flex-col min-h-screen md:min-h-[calc(100vh-100px)]">
                  <div className="flex justify-between items-end mb-6 px-2 shrink-0">
                    <div>
                      <h3 className="font-extrabold text-2xl text-slate-800 dark:text-white tracking-tight">Majlis Penutup</h3>
                       <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Tentatif rasmi majlis perasmian penutupan MSR.</p>
                    </div>
                    {isAdmin && (
                       <button onClick={() => {
                         const updated = [...penutupData, { id: 'p' + Date.now(), time: "08:00", aktiviti: "Aktiviti Baru" }];
                         setPenutupData(updated);
                         saveToFirebase({ penutupData: updated });
                       }} className="text-sm bg-rose-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-bold hover:bg-rose-600 shadow-md transition-all active:scale-95 shrink-0">
                         <Plus size={18}/> <span className="hidden sm:inline">Tambah Slot</span>
                       </button>
                    )}
                  </div>

                   <div className="flex-grow px-2 pb-6 pt-2">
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-300">
                      {penutupData.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-dashed border-slate-300 dark:border-slate-600 transition-colors">
                          <Award className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={56} />
                          <p className="text-slate-500 dark:text-slate-400 font-bold">Tiada slot tentatif penutup.</p>
                         </div>
                      ) : (
                        <div className="relative border-l-4 border-rose-200 dark:border-rose-900/50 ml-4 md:ml-8 space-y-8">
                           {penutupData.map((slot) => (
                            <div key={slot.id} className="relative pl-8 md:pl-12 group">
                               <div className="absolute -left-[12px] top-6 h-5 w-5 rounded-full border-[4px] border-slate-100 dark:border-slate-900 bg-rose-500 shadow-md z-10 group-hover:scale-150 group-hover:bg-rose-400 transition-transform duration-300"></div>
                              
                              {isAdmin ? (
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-700 relative group-hover:border-rose-400 dark:group-hover:border-rose-600 transition-colors">
                                  <button onClick={() => {
                                    const updated = penutupData.filter(s => s.id !== slot.id);
                                    setPenutupData(updated);
                                    saveToFirebase({ penutupData: updated });
                                  }} className="absolute top-5 right-5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-xl transition-colors"><Trash2 size={20}/></button>
                                  
                                  <div className="mb-4 pr-12">
                                     <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Masa</label>
                                    <input type="time" value={slot.time} onChange={e => {
                                      const updated = penutupData.map(s => s.id === slot.id ? { ...s, time: e.target.value } : s);
                                      setPenutupData(updated);
                                      saveToFirebase({ penutupData: updated });
                                    }} className="w-full sm:w-1/2 px-4 py-2.5 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-sm font-bold text-rose-600 dark:text-rose-400 bg-slate-50 dark:bg-slate-900 focus:border-rose-500 outline-none" />
                               </div>
                                  <textarea value={slot.aktiviti} onChange={e => {
                                    const updated = penutupData.map(s => s.id === slot.id ? { ...s, aktiviti: e.target.value } : s);
                                    setPenutupData(updated);
                                    saveToFirebase({ penutupData: updated });
                                  }} className="w-full px-5 py-4 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-sm md:text-base font-semibold focus:border-rose-500 outline-none text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900 custom-scrollbar" rows={2} placeholder="Keterangan Aktiviti..." />
                                </div>
                              ) : (
                                 <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-700 hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
                                  <div className="flex items-center text-rose-700 dark:text-rose-300 text-xs md:text-sm font-extrabold bg-rose-50 dark:bg-rose-900/30 inline-flex px-4 py-2 rounded-xl border border-rose-100 dark:border-rose-800/50 mb-4 tracking-widest shadow-sm">
                                     <Clock size={16} className="mr-2" /> 
                                    {formatTime(slot.time)}
                                   </div>
                                  <h4 className="text-lg md:text-xl font-extrabold text-slate-800 dark:text-slate-100 leading-snug">{slot.aktiviti}</h4>
                                </div>
                               )}
                            </div>
                          ))}
                        </div>
                       )}
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW: LAYOUT */}
               {currentView === 'layout' && (
                <div className="p-4 max-w-4xl mx-auto pb-32 text-center">
                  <div className="bg-white dark:bg-slate-800 rounded-[3rem] shadow-sm border border-slate-200 dark:border-slate-700 p-8 md:p-12 transition-colors">
                    <div className="bg-purple-50 dark:bg-purple-900/30 w-24 h-24 mx-auto rounded-[2rem] flex items-center justify-center mb-6 transform rotate-3 shadow-inner border border-purple-100 dark:border-purple-800/50">
                       <Map size={48} className="text-purple-600 dark:text-purple-400 -rotate-3" />
                    </div>
                    <h3 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white mb-3 tracking-tight">Pelan Pendaftaran</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-10 text-base font-medium">Sila rujuk pelan layout dewan bagi melancarkan pergerakan anda.</p>
                    
                    <div className="relative w-full min-h-[400px] md:min-h-[600px] bg-slate-50 dark:bg-slate-900 rounded-[2rem] border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center p-4 overflow-hidden mb-8 group transition-all hover:border-purple-400 dark:hover:border-purple-500">
                      {layoutImage ? (
                        <img src={layoutImage} alt="Layout Pendaftaran" className="w-full h-auto max-h-[800px] object-contain rounded-2xl shadow-sm" />
                      ) : (
                        <div className="text-slate-400 dark:text-slate-600 flex flex-col items-center gap-4 p-10">
                            <ImageIcon size={72} strokeWidth={1} />
                          <p className="text-base font-bold">Tiada imej pelan dimuat naik</p>
                        </div>
                      )}
                       
                      {isAdmin && (
                        <label className="absolute inset-0 bg-slate-900/50 dark:bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity duration-300 backdrop-blur-sm z-10 rounded-[2rem]">
                            <div className="bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-400 px-8 py-4 rounded-2xl font-extrabold text-sm shadow-2xl flex items-center gap-3 transform hover:scale-110 active:scale-95 transition-transform border border-white/20">
                            <UploadCloud size={24}/> Muat Naik Pelan (PNG / JPG)
                          </div>
                           <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleLayoutUpload} />
                        </label>
                      )}
                    </div>
                </div>
                </div>
              )}

              {/* VIEW: LAGU */}
              {currentView === 'lagu' && (
                <div className="p-4 max-w-2xl mx-auto pb-32 text-center">
                    <div className="bg-white dark:bg-slate-800 rounded-[3rem] shadow-xl border border-slate-200 dark:border-slate-700 p-8 md:p-16 relative overflow-hidden transition-colors">
                    <div className="absolute -top-20 -right-20 w-72 h-72 bg-pink-100 dark:bg-pink-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten opacity-60 blur-3xl animate-float"></div>
                    <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-100 dark:bg-purple-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten opacity-60 blur-3xl animate-float-delayed"></div>
                    
                    <Music size={72} className="mx-auto text-pink-500 dark:text-pink-400 mb-8 relative z-10 animate-bounce duration-[3000ms]" />
                    <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-2 relative z-10 tracking-tight drop-shadow-sm">LAGU KORPORAT</h3>
                       <h4 className="text-sm md:text-base font-extrabold text-pink-600 dark:text-pink-400 mb-12 tracking-[0.2em] uppercase relative z-10">Jabatan Tenaga Manusia</h4>
                    
                    <div className="space-y-10 text-slate-700 dark:text-slate-300 font-bold leading-relaxed text-lg md:text-2xl italic relative z-10">
                      <p>Peneraju Pembangun<br/>Tenaga Mahir Negara<br/>Jabatan Tenaga Manusia</p>
                       <p>Kami Cekal Berhemah<br/>Khidmat Cekal Berkualiti<br/>Menjadi Amanat Semua</p>
                      <p>Malaysia Terus Terbilang<br/>Di-Mata Dunia</p>
                      <div className="font-extrabold text-pink-900 dark:text-pink-100 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-10 rounded-[2.5rem] not-italic shadow-[0_8px_32px_0_rgba(236,72,153,0.1)] border border-pink-200 dark:border-pink-800/50">
                          <span className="text-xs uppercase tracking-[0.3em] text-pink-500 dark:text-pink-400 mb-5 block bg-pink-50 dark:bg-pink-900/30 inline-block px-4 py-1.5 rounded-full border border-pink-200 dark:border-pink-800/50">Korus</span>
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
        <footer className="bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 py-8 text-center text-[10px] md:text-xs font-bold mt-auto relative z-30 pb-24 md:pb-8 transition-colors">
          <p>Hak Cipta Terpelihara &copy; 2026 Kolej Teknologi Termaju (ADTEC) Jabatan Tenaga Manusia Kampus Sandakan.</p>
        </footer>

        {/* --- BOTTOM NAVIGATION (MOBILE ONLY) --- */}
        <nav className="md:hidden fixed bottom-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 flex justify-around items-center pt-2 pb-safe-bottom pb-4 z-40 transition-colors">
          {[
            { id: 'home', icon: Home, label: 'Utama' },
            { id: 'memo', icon: FileText, label: 'Memo' },
            { id: 'ajk', icon: Users, label: 'AJK' },
            { id: 'jadual', icon: Calendar, label: 'Jadual' },
            { id: 'penutup', icon: Award, label: 'Penutup' }
          ].map((item) => (
             <button 
              key={item.id} 
              onClick={() => navigateTo(item.id)}
              className={`flex flex-col items-center gap-1 p-2 min-w-[64px] transition-all ${currentView === item.id ?
              'text-blue-600 dark:text-blue-400 transform -translate-y-1' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              <div className={`${currentView === item.id ? 'bg-blue-100 dark:bg-blue-900/40 p-1.5 rounded-xl' : 'p-1.5'}`}>
                <item.icon size={22} strokeWidth={currentView === item.id ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-bold ${currentView === item.id ? 'opacity-100' : 'opacity-70'}`}>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* --- QUICK ACTION BUTTON (FAB) --- */}
        <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 flex flex-col items-end gap-3">
           {showFabMenu && (
             <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg border border-slate-200 dark:border-slate-700 p-2 rounded-3xl shadow-2xl flex flex-col gap-2 animate-in slide-in-from-bottom-5 zoom-in-90 duration-200 origin-bottom-right mb-2">
                <a href="https://www.jtm.gov.my/etatatertib" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-2xl transition-colors text-sm font-bold text-slate-700 dark:text-slate-200">
                  <div className="bg-slate-800 text-white p-1.5 rounded-lg"><ExternalLink size={16}/></div> eTATATERTIB
                </a>
                <a href="https://jims.jtm.gov.my/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-2xl transition-colors text-sm font-bold text-slate-700 dark:text-slate-200">
                  <div className="bg-indigo-600 text-white p-1.5 rounded-lg"><Monitor size={16}/></div> Sistem JIMS
                </a>
                <a href="https://www.facebook.com/ilpsdk" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-2xl transition-colors text-sm font-bold text-slate-700 dark:text-slate-200">
                    <div className="bg-blue-600 text-white p-1.5 rounded-lg"><Globe size={16}/></div> Facebook
                </a>
                <button onClick={toggleTheme} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-2xl transition-colors text-sm font-bold text-slate-700 dark:text-slate-200 w-full text-left">
                  <div className="bg-amber-100 dark:bg-indigo-900/50 text-amber-600 dark:text-indigo-400 p-1.5 rounded-lg">
                     {isDarkMode ? <Sun size={16}/> : <Moon size={16}/>}
                  </div> 
                  Tema {isDarkMode ? 'Cerah' : 'Gelap'}
                </button>
                <div className="h-px bg-slate-200 dark:bg-slate-700 mx-2 my-1"></div>
                {isAdmin ? (
                  <button onClick={() => { setIsAdmin(false); setShowFabMenu(false); }} className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-colors text-sm font-bold text-red-600 dark:text-red-400 w-full text-left">
                    <div className="bg-red-100 dark:bg-red-900/50 p-1.5 rounded-lg"><LogOut size={16}/></div> Log Keluar
                  </button>
                ) : (
                  <button onClick={() => { setShowLogin(true); setShowFabMenu(false); }} className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-2xl transition-colors text-sm font-bold text-blue-600 dark:text-blue-400 w-full text-left">
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-1.5 rounded-lg"><Settings size={16}/></div> Log Masuk Admin
                  </button>
                )}
             </div>
           )}
           <button 
              onClick={() => setShowFabMenu(!showFabMenu)}
              className="bg-slate-800 dark:bg-blue-600 text-white p-4 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:bg-slate-900 dark:hover:bg-blue-500 hover:scale-105 active:scale-90 transition-all duration-300 focus:outline-none flex items-center justify-center border border-slate-700 dark:border-blue-500"
            >
              {showFabMenu ? <Plus size={28} className="rotate-45 transition-transform" /> : <Command size={28} className="transition-transform" />}
           </button>
        </div>

      </div>
    </div>
  );
}