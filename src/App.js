import React, { useState, useEffect, useRef, useCallback, useTransition } from 'react';
import { doc, onSnapshot, setDoc, collection, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// --- IMPORT DARI UTILS ---
import { handleDownloadBlob, senaraiStaf } from './utils/helpers';

// --- IMPORT KOMPONEN UI & LAYOUT ---
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import BottomNav from './components/layout/BottomNav';
import FabMenu from './components/layout/FabMenu';
import ToastNotification from './components/ui/ToastNotification';
import ImageModal from './components/ui/ImageModal';
import SplashScreen from './components/ui/SplashScreen';
import LoginModal from './components/ui/LoginModal';
import PwaInstallBanner from './components/ui/PwaInstallBanner';
import IosInstallBanner from './components/ui/IosInstallBanner';

// --- IMPORT KOMPONEN VIEWS (PAPARAN) ---
import HomeView from './components/views/HomeView';
import MemoView from './components/views/MemoView';
import AjkView from './components/views/AjkView';
import JadualView from './components/views/JadualView';
import PenutupView from './components/views/PenutupView';
import LayoutView from './components/views/LayoutView';
import LaguView from './components/views/LaguView';
import IkrarView from './components/views/IkrarView';

// --- HELPER KUNCI SESI ---
const normalizeSession = (s) => ({
  sesi: String(s?.sesi || '2').trim(),
  tahun: String(s?.tahun || '2026').trim()
});

const getSessionKey = (s) => {
  const norm = normalizeSession(s);
  return `${norm.sesi}_${norm.tahun}`;
};

const sortSessionsDesc = (list = []) => {
  const map = new Map();
  list.forEach((item) => {
    if (!item || !item.sesi || !item.tahun) return;
    const norm = normalizeSession(item);
    map.set(getSessionKey(norm), norm);
  });
  return Array.from(map.values()).sort((a, b) => {
    const yearDiff = Number(b.tahun) - Number(a.tahun);
    if (yearDiff !== 0) return yearDiff;
    return Number(b.sesi) - Number(a.sesi);
  });
};

// --- INDEXEDDB HELPER MENGIKUT SESI ---
const DB_NAME = 'imsr_files_db_v2';
const STORE_NAME = 'session_files';

const openFilesDB = () =>
  new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('IndexedDB tidak disokong'));
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const database = e.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

const saveSessionFileToIDB = async (key, value) => {
  try {
    const database = await openFilesDB();
    const tx = database.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(value, key);
  } catch (e) {}
};

const getSessionFileFromIDB = async (key) => {
  try {
    const database = await openFilesDB();
    return new Promise((resolve) => {
      const tx = database.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
};

const GlobalStyles = React.memo(() => (
  <style>
    {`
      .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; border-radius: 10px; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      .hide-scrollbar::-webkit-scrollbar { display: none; }
      .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

      .tech-grid-2026 {
        background-image:
          linear-gradient(to right, rgba(148, 163, 184, 0.14) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(148, 163, 184, 0.14) 1px, transparent 1px);
        background-size: 36px 36px;
        -webkit-mask-image: radial-gradient(ellipse 85% 65% at 50% 15%, #000 35%, transparent 90%);
        mask-image: radial-gradient(ellipse 85% 65% at 50% 15%, #000 35%, transparent 90%);
      }
      .dark .tech-grid-2026 {
        background-image:
          linear-gradient(to right, rgba(34, 211, 238, 0.07) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(34, 211, 238, 0.07) 1px, transparent 1px);
      }

      @keyframes float { 0%, 100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-10px) scale(1.03); } }
      .animate-float { animation: float 7s ease-in-out infinite; }
      .animate-float-delayed { animation: float 8s ease-in-out 3.5s infinite; }
      @keyframes slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
      .animate-slide { animation: slide 1.5s ease-in-out infinite; }
      @keyframes progress { 0% { width: 100%; } 100% { width: 0%; } }
      .animate-progress { animation: progress 15s linear forwards; }
    `}
  </style>
));

export default function App() {
  // --- NAVIGATION & UI STATES ---
  const [currentView, setCurrentView] = useState('home');
  const [isPending, startTransition] = useTransition();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [viewingMemo, setViewingMemo] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [latestUpdateInfo, setLatestUpdateInfo] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // --- PWA ANDROID & IOS STATES ---
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPwaBanner, setShowPwaBanner] = useState(false);
  const [showIosBanner, setShowIosBanner] = useState(false);

  // --- LOGIN SECURITY STATES ---
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);

  // --- MULTI-SESI & ARKIB STATES ---
  const [activeSession, setActiveSession] = useState({ sesi: '2', tahun: '2026' });
  const [viewingSession, setViewingSession] = useState({ sesi: '2', tahun: '2026' });
  const [sessionsList, setSessionsList] = useState([{ sesi: '2', tahun: '2026' }]);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [legacySessionKey, setLegacySessionKey] = useState('2_2026');

  // --- DATA STATES MENGIKUT SESI YANG SEDANG DILIHAT ---
  const [lastUpdated, setLastUpdated] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [tarikhPenutup, setTarikhPenutup] = useState('');
  const [memoText, setMemoText] = useState('');
  const [memoList, setMemoList] = useState([]);
  const [ajkInduk, setAjkInduk] = useState([]);
  const [biroList, setBiroList] = useState([]);
  const [jadualData, setJadualData] = useState([]);
  const [penutupData, setPenutupData] = useState([]);
  const [layoutList, setLayoutList] = useState([]);
  const [activeJadualTab, setActiveJadualTab] = useState('');
  const [jadualFile, setJadualFile] = useState(null);
  const [jadualFileDate, setJadualFileDate] = useState(null);
  const [penutupFile, setPenutupFile] = useState(null);
  const [penutupFileDate, setPenutupFileDate] = useState(null);
  const [ikrarFile, setIkrarFile] = useState(null);
  const [ikrarFileDate, setIkrarFileDate] = useState(null);

  const hasCheckedUpdates = useRef(false);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  const currentKey = getSessionKey(viewingSession);
  const activeKey = getSessionKey(activeSession);
  const isViewingArchive = currentKey !== activeKey;

  // --- PWA DETECT ---
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (/Android/i.test(navigator.userAgent)) {
        setShowPwaBanner(true);
      }
    };

    const isIos = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isStandalone = window.navigator.standalone === true;
    if (isIos && !isStandalone && !sessionStorage.getItem('imsr_ios_banner_dismissed')) {
      setShowIosBanner(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPwaClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowPwaBanner(false);
  };

  // --- CONTROLS ---
  useEffect(() => {
    document.body.style.overflow = !isAppReady ? 'hidden' : 'unset';
  }, [isAppReady]);

  useEffect(() => {
    if (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      setIsDarkMode(true);
    }
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigateTo = useCallback((view) => {
    setShowFabMenu(false);
    startTransition(() => {
      setCurrentView(view);
    });
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => {
      const nextMode = !prev;
      localStorage.theme = nextMode ? 'dark' : 'light';
      return nextMode;
    });
  }, []);

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
        setTimeout(() => {
          setIsLockedOut(false);
          setLoginAttempts(0);
        }, 30000);
      } else {
        alert(`Log Masuk Gagal. Baki cubaan: ${3 - newAttempts}`);
      }
    }
  };

  // --- 1. KONFIGURASI SESI AKTIF & SENARAI ARKIB (msr/config_sesi) ---
  useEffect(() => {
    try {
      const cachedMeta = localStorage.getItem('imsr_meta_config');
      if (cachedMeta) {
        const meta = JSON.parse(cachedMeta);
        if (meta.activeSession) {
          const normActive = normalizeSession(meta.activeSession);
          setActiveSession(normActive);
          setViewingSession(normActive);
        }
        if (Array.isArray(meta.sessionsList) && meta.sessionsList.length > 0) {
          setSessionsList(sortSessionsDesc(meta.sessionsList));
        }
      }
    } catch (e) {}

    const unsubConfig = onSnapshot(doc(db, 'msr', 'config_sesi'), async (snap) => {
      if (snap.exists()) {
        const cfg = snap.data();
        const normActive = normalizeSession(cfg.activeSession || { sesi: '2', tahun: '2026' });
        const sortedList = sortSessionsDesc([
          normActive,
          ...(Array.isArray(cfg.sessionsList) ? cfg.sessionsList : []),
          { sesi: '2', tahun: '2026' }
        ]);

        setActiveSession(normActive);
        setSessionsList(sortedList);
        localStorage.setItem(
          'imsr_meta_config',
          JSON.stringify({ activeSession: normActive, sessionsList: sortedList })
        );

        setViewingSession((prev) => (!isConfigLoaded ? normActive : prev));
        setIsConfigLoaded(true);
      } else {
        // Fallback kepada data_utama sedia ada jika config_sesi belum wujud
        try {
          const legacySnap = await getDoc(doc(db, 'msr', 'data_utama'));
          const baseSession = legacySnap.exists() && legacySnap.data()?.sesiKemasukan
            ? normalizeSession(legacySnap.data().sesiKemasukan)
            : { sesi: '2', tahun: '2026' };
          const baseKey = getSessionKey(baseSession);
          setLegacySessionKey(baseKey);
          setActiveSession(baseSession);
          setViewingSession(baseSession);
          setSessionsList(sortSessionsDesc([baseSession, { sesi: '2', tahun: '2026' }]));
          if (navigator.onLine) {
            await setDoc(
              doc(db, 'msr', 'config_sesi'),
              { activeSession: baseSession, sessionsList: sortSessionsDesc([baseSession, { sesi: '2', tahun: '2026' }]) },
              { merge: true }
            );
          }
        } catch (e) {}
        setIsConfigLoaded(true);
      }
    });

    return () => unsubConfig();
  }, [isConfigLoaded]);

  // --- FUNGSI ADMIN: TUKAR / BUKA SESI RASMI TERKINI ---
  const handleSetOfficialSession = useCallback(
    async (newSessionInput) => {
      const normNew = normalizeSession(newSessionInput);
      if (!normNew.sesi || !normNew.tahun) return;

      const updatedList = sortSessionsDesc([...sessionsList, activeSession, normNew]);
      setActiveSession(normNew);
      setViewingSession(normNew);
      setSessionsList(updatedList);
      localStorage.setItem(
        'imsr_meta_config',
        JSON.stringify({ activeSession: normNew, sessionsList: updatedList })
      );

      const newKey = getSessionKey(normNew);
      if (navigator.onLine) {
        try {
          await setDoc(
            doc(db, 'msr', 'config_sesi'),
            {
              activeSession: normNew,
              sessionsList: updatedList,
              updatedAt: new Date().toISOString()
            },
            { merge: true }
          );

          // Pastikan dokumen sesi baharu wujud supaya sedia untuk diurus
          const targetRef = doc(db, 'msr', `data_utama_${newKey}`);
          const targetSnap = await getDoc(targetRef);
          if (!targetSnap.exists()) {
            await setDoc(
              targetRef,
              {
                sesiKemasukan: normNew,
                announcements: [],
                memoText: '',
                tarikhPenutup: '',
                lastUpdated: new Date().toISOString()
              },
              { merge: true }
            );
          }
        } catch (err) {
          console.error('Ralat menukar sesi aktif:', err);
        }
      }
    },
    [activeSession, sessionsList]
  );

  // --- FUNGSI PENGGUNA / PENGAJAR: LIHAT SESI ARKIB ATAU KEMBALI KE TERKINI ---
  const handleSelectViewingSession = useCallback((sessionObj) => {
    const norm = normalizeSession(sessionObj);
    setViewingSession(norm);
  }, []);

  const handleReturnToActiveSession = useCallback(() => {
    setViewingSession(normalizeSession(activeSession));
  }, [activeSession]);

  // --- 2. MUAT DATA MENGIKUT SESI YANG SEDANG DILIHAT (viewingSession) ---
  useEffect(() => {
    let isCancelled = false;
    const isOriginalLegacySession = currentKey === legacySessionKey || currentKey === '2_2026';

    const applyMainData = (data, cacheKey) => {
      if (!data || isCancelled) return;
      try {
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (e) {}

      if (data.lastUpdated) setLastUpdated(data.lastUpdated);
      if (data.latestUpdate) setLatestUpdateInfo(data.latestUpdate);
      setTarikhPenutup(data.tarikhPenutup !== undefined ? data.tarikhPenutup : '');

      if (data.announcements !== undefined) {
        setAnnouncements(Array.isArray(data.announcements) ? data.announcements : []);
      } else if (data.announcement !== undefined) {
        setAnnouncements(data.announcement ? [{ id: 'legacy_1', text: data.announcement }] : []);
      } else {
        setAnnouncements([]);
      }

      setMemoText(data.memoText !== undefined ? data.memoText : '');
      setAjkInduk(Array.isArray(data.ajkInduk) ? data.ajkInduk : []);
      setBiroList(Array.isArray(data.biroList) ? data.biroList : []);
      setPenutupData(Array.isArray(data.penutupData) ? data.penutupData : []);

      const jadualArr = Array.isArray(data.jadualData) ? data.jadualData : [];
      setJadualData(jadualArr);
      setActiveJadualTab(jadualArr.length > 0 ? jadualArr[0].id : '');
    };

    // Kosongkan paparan sementara sebelum memuatkan cache/Firestore sesi ini
    setAnnouncements([]);
    setTarikhPenutup('');
    setMemoText('');
    setMemoList([]);
    setAjkInduk([]);
    setBiroList([]);
    setJadualData([]);
    setPenutupData([]);
    setLayoutList([]);
    setActiveJadualTab('');
    setJadualFile(null);
    setJadualFileDate(null);
    setPenutupFile(null);
    setPenutupFileDate(null);
    setIkrarFile(null);
    setIkrarFileDate(null);

    const mainCacheKey = `imsr_cached_data_${currentKey}`;
    const cachedMain = localStorage.getItem(mainCacheKey);
    if (cachedMain) {
      try {
        applyMainData(JSON.parse(cachedMain), mainCacheKey);
      } catch (e) {}
    }

    // Muatkan fail & senarai dokumen dari IndexedDB mengikut sesi
    (async () => {
      const [idbJadual, idbPenutup, idbIkrar, idbLayout, idbMemos] = await Promise.all([
        getSessionFileFromIDB(`jadualFile_${currentKey}`),
        getSessionFileFromIDB(`penutupFile_${currentKey}`),
        getSessionFileFromIDB(`ikrarFile_${currentKey}`),
        getSessionFileFromIDB(`layoutList_${currentKey}`),
        getSessionFileFromIDB(`memoList_${currentKey}`)
      ]);

      if (isCancelled) return;
      if (idbJadual) {
        setJadualFile(idbJadual.fileData || null);
        setJadualFileDate(idbJadual.uploadDate || null);
      }
      if (idbPenutup) {
        setPenutupFile(idbPenutup.fileData || null);
        setPenutupFileDate(idbPenutup.uploadDate || null);
      }
      if (idbIkrar) {
        setIkrarFile(idbIkrar.fileData || null);
        setIkrarFileDate(idbIkrar.uploadDate || null);
      }
      if (Array.isArray(idbLayout)) setLayoutList(idbLayout);
      if (Array.isArray(idbMemos)) setMemoList(idbMemos);
    })();

    const safetyTimer = setTimeout(() => {
      if (!isCancelled) setIsAppReady(true);
    }, 1500);

    // Listener Data Utama Sesi
    const unsubMain = onSnapshot(doc(db, 'msr', `data_utama_${currentKey}`), async (snap) => {
      if (isCancelled) return;
      if (snap.exists()) {
        applyMainData(snap.data(), mainCacheKey);
        setIsAppReady(true);
        clearTimeout(safetyTimer);
      } else if (isOriginalLegacySession) {
        // Tarik data lama asal jika sesi asal belum mempunyai dokumen berasingan
        const legacySnap = await getDoc(doc(db, 'msr', 'data_utama'));
        if (!isCancelled && legacySnap.exists()) {
          const legacyData = legacySnap.data();
          applyMainData(legacyData, mainCacheKey);
          if (navigator.onLine) {
            setDoc(doc(db, 'msr', `data_utama_${currentKey}`), legacyData, { merge: true }).catch(() => {});
          }
        }
        if (!isCancelled) {
          setIsAppReady(true);
          clearTimeout(safetyTimer);
        }
      } else {
        setIsAppReady(true);
        clearTimeout(safetyTimer);
      }
    });

    // Listener Memo Sesi
    const unsubMemos = onSnapshot(doc(db, 'msr', `data_memos_${currentKey}`), async (snap) => {
      if (isCancelled) return;
      if (snap.exists() && Array.isArray(snap.data().items)) {
        const sorted = [...snap.data().items].sort((a, b) => String(a.id).localeCompare(String(b.id)));
        setMemoList(sorted);
        saveSessionFileToIDB(`memoList_${currentKey}`, sorted);
      } else if (isOriginalLegacySession) {
        const legacyColSnap = await getDoc(doc(db, 'msr', `data_memos_${currentKey}`));
        if (!legacyColSnap.exists()) {
          // Baca koleksi asal msr_memos untuk sesi asal
          const { getDocs } = await import('firebase/firestore');
          const colSnap = await getDocs(collection(db, 'msr_memos'));
          const arr = [];
          colSnap.forEach((d) => arr.push(d.data()));
          arr.sort((a, b) => String(a.id).localeCompare(String(b.id)));
          if (!isCancelled && arr.length > 0) {
            setMemoList(arr);
            saveSessionFileToIDB(`memoList_${currentKey}`, arr);
          }
        }
      }
    });

    // Listener Pelan (Layout) Sesi
    const unsubLayout = onSnapshot(doc(db, 'msr', `data_layout_${currentKey}`), async (snap) => {
      if (isCancelled) return;
      if (snap.exists() && Array.isArray(snap.data().layouts)) {
        const list = snap.data().layouts;
        setLayoutList(list);
        saveSessionFileToIDB(`layoutList_${currentKey}`, list);
      } else if (isOriginalLegacySession) {
        const legacyLayoutSnap = await getDoc(doc(db, 'msr', 'data_layout'));
        if (!isCancelled && legacyLayoutSnap.exists() && Array.isArray(legacyLayoutSnap.data().layouts)) {
          const list = legacyLayoutSnap.data().layouts;
          setLayoutList(list);
          saveSessionFileToIDB(`layoutList_${currentKey}`, list);
        }
      }
    });

    // Listener Fail Jadual Sesi
    const unsubJadualFile = onSnapshot(doc(db, 'msr', `data_jadual_file_${currentKey}`), async (snap) => {
      if (isCancelled) return;
      if (snap.exists() && snap.data().fileData) {
        const payload = { fileData: snap.data().fileData, uploadDate: snap.data().uploadDate || null };
        setJadualFile(payload.fileData);
        setJadualFileDate(payload.uploadDate);
        saveSessionFileToIDB(`jadualFile_${currentKey}`, payload);
      } else if (isOriginalLegacySession) {
        const legacySnap = await getDoc(doc(db, 'msr', 'data_jadual_file'));
        if (!isCancelled && legacySnap.exists() && legacySnap.data().fileData) {
          const payload = { fileData: legacySnap.data().fileData, uploadDate: legacySnap.data().uploadDate || null };
          setJadualFile(payload.fileData);
          setJadualFileDate(payload.uploadDate);
          saveSessionFileToIDB(`jadualFile_${currentKey}`, payload);
        }
      }
    });

    // Listener Fail Majlis Penutup Sesi
    const unsubPenutupFile = onSnapshot(doc(db, 'msr', `data_penutup_file_${currentKey}`), async (snap) => {
      if (isCancelled) return;
      if (snap.exists() && snap.data().fileData) {
        const payload = { fileData: snap.data().fileData, uploadDate: snap.data().uploadDate || null };
        setPenutupFile(payload.fileData);
        setPenutupFileDate(payload.uploadDate);
        saveSessionFileToIDB(`penutupFile_${currentKey}`, payload);
      } else if (isOriginalLegacySession) {
        const legacySnap = await getDoc(doc(db, 'msr', 'data_penutup_file'));
        if (!isCancelled && legacySnap.exists() && legacySnap.data().fileData) {
          const payload = { fileData: legacySnap.data().fileData, uploadDate: legacySnap.data().uploadDate || null };
          setPenutupFile(payload.fileData);
          setPenutupFileDate(payload.uploadDate);
          saveSessionFileToIDB(`penutupFile_${currentKey}`, payload);
        }
      }
    });

    // Listener Fail Ikrar Pelajar Sesi
    const unsubIkrarFile = onSnapshot(doc(db, 'msr', `data_ikrar_file_${currentKey}`), async (snap) => {
      if (isCancelled) return;
      if (snap.exists() && snap.data().fileData) {
        const payload = { fileData: snap.data().fileData, uploadDate: snap.data().uploadDate || null };
        setIkrarFile(payload.fileData);
        setIkrarFileDate(payload.uploadDate);
        saveSessionFileToIDB(`ikrarFile_${currentKey}`, payload);
      } else if (isOriginalLegacySession) {
        const legacySnap = await getDoc(doc(db, 'msr', 'data_ikrar_file'));
        if (!isCancelled && legacySnap.exists() && legacySnap.data().fileData) {
          const payload = { fileData: legacySnap.data().fileData, uploadDate: legacySnap.data().uploadDate || null };
          setIkrarFile(payload.fileData);
          setIkrarFileDate(payload.uploadDate);
          saveSessionFileToIDB(`ikrarFile_${currentKey}`, payload);
        }
      }
    });

    return () => {
      isCancelled = true;
      clearTimeout(safetyTimer);
      unsubMain();
      unsubMemos();
      unsubLayout();
      unsubJadualFile();
      unsubPenutupFile();
      unsubIkrarFile();
    };
  }, [currentKey, legacySessionKey]);

  // --- TOAST KEMAS KINI ---
  useEffect(() => {
    if (isAppReady && lastUpdated && !hasCheckedUpdates.current) {
      const lastVisit = localStorage.getItem('imsr_last_visit');
      if (!lastVisit || new Date(lastUpdated) > new Date(lastVisit)) {
        setTimeout(() => setShowToast(true), 1200);
        setTimeout(() => setShowToast(false), 16200);
      }
      localStorage.setItem('imsr_last_visit', new Date().toISOString());
      hasCheckedUpdates.current = true;
    }
  }, [isAppReady, lastUpdated]);

  // --- SIMPAN DATA UTAMA MENGIKUT SESI YANG SEDANG DILIHAT ---
  const saveToFirebaseWithOffline = useCallback(
    async (fieldsToUpdate) => {
      const payload = {
        ...fieldsToUpdate,
        sesiKemasukan: normalizeSession(viewingSession),
        lastUpdated: new Date().toISOString()
      };

      const cacheKey = `imsr_cached_data_${currentKey}`;
      try {
        const existingCache = JSON.parse(localStorage.getItem(cacheKey) || '{}');
        localStorage.setItem(cacheKey, JSON.stringify({ ...existingCache, ...payload }));
      } catch (e) {}

      if (!navigator.onLine) {
        const pending = JSON.parse(localStorage.getItem('imsr_pending_updates') || '[]');
        pending.push({ timestamp: Date.now(), sessionKey: currentKey, payload });
        localStorage.setItem('imsr_pending_updates', JSON.stringify(pending));
        setShowOfflineBanner(true);
        setTimeout(() => setShowOfflineBanner(false), 6000);
        return;
      }

      try {
        await setDoc(doc(db, 'msr', `data_utama_${currentKey}`), payload, { merge: true });
        if (currentKey === activeKey) {
          await setDoc(doc(db, 'msr', 'data_utama'), payload, { merge: true });
        }
      } catch (error) {
        console.error(error);
      }
    },
    [currentKey, activeKey, viewingSession]
  );

  // --- UPLOAD & DELETE HANDLERS MENGIKUT SESI ---
  const handleDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const newMemo = {
        id: 'memo_' + Date.now(),
        name: file.name,
        url: ev.target.result,
        type: file.type.includes('pdf') ? 'pdf' : 'image',
        uploadDate: new Date().toISOString()
      };
      const updatedMemos = [...memoList, newMemo];
      setMemoList(updatedMemos);
      saveSessionFileToIDB(`memoList_${currentKey}`, updatedMemos);
      try {
        await setDoc(doc(db, 'msr', `data_memos_${currentKey}`), { items: updatedMemos }, { merge: true });
        if (currentKey === '2_2026' || currentKey === legacySessionKey) {
          await setDoc(doc(db, 'msr_memos', newMemo.id), newMemo);
        }
        saveToFirebaseWithOffline({ latestUpdate: { view: 'memo', text: 'Dokumen baharu dimuat naik.' } });
      } catch (error) {
        alert('RALAT: Gagal muat naik.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLayoutUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const customName = window.prompt('Nama Pelan:', file.name.split('.')[0]);
      const newLayout = {
        id: 'layout_' + Date.now(),
        url: ev.target.result,
        name: customName || `Pelan_${Date.now()}`,
        type: file.type.includes('pdf') ? 'pdf' : 'image',
        uploadDate: new Date().toISOString()
      };
      const updatedLayouts = [...layoutList, newLayout];
      setLayoutList(updatedLayouts);
      saveSessionFileToIDB(`layoutList_${currentKey}`, updatedLayouts);
      try {
        await setDoc(doc(db, 'msr', `data_layout_${currentKey}`), { layouts: updatedLayouts });
        saveToFirebaseWithOffline({ latestUpdate: { view: 'layout', text: 'Pelan baharu ditambah.' } });
      } catch (error) {
        alert('Gagal muat naik pelan.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteLayout = async (idToDel) => {
    if (window.confirm('Padam pelan ini?')) {
      const updatedLayouts = layoutList.filter((l) => l.id !== idToDel);
      setLayoutList(updatedLayouts);
      saveSessionFileToIDB(`layoutList_${currentKey}`, updatedLayouts);
      await setDoc(doc(db, 'msr', `data_layout_${currentKey}`), { layouts: updatedLayouts });
    }
  };

  const handleJadualFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const uploadDate = new Date().toISOString();
      setJadualFile(ev.target.result);
      setJadualFileDate(uploadDate);
      saveSessionFileToIDB(`jadualFile_${currentKey}`, { fileData: ev.target.result, uploadDate });
      await setDoc(doc(db, 'msr', `data_jadual_file_${currentKey}`), {
        fileData: ev.target.result,
        uploadDate
      });
      saveToFirebaseWithOffline({ latestUpdate: { view: 'jadual', text: 'Tentatif Penuh dimuat naik.' } });
    };
    reader.readAsDataURL(file);
  };

  const handlePenutupFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const uploadDate = new Date().toISOString();
      setPenutupFile(ev.target.result);
      setPenutupFileDate(uploadDate);
      saveSessionFileToIDB(`penutupFile_${currentKey}`, { fileData: ev.target.result, uploadDate });
      await setDoc(doc(db, 'msr', `data_penutup_file_${currentKey}`), {
        fileData: ev.target.result,
        uploadDate
      });
      saveToFirebaseWithOffline({ latestUpdate: { view: 'penutup', text: 'Majlis Penutup penuh dimuat naik.' } });
    };
    reader.readAsDataURL(file);
  };

  const handleIkrarFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const uploadDate = new Date().toISOString();
      try {
        setIkrarFile(ev.target.result);
        setIkrarFileDate(uploadDate);
        saveSessionFileToIDB(`ikrarFile_${currentKey}`, { fileData: ev.target.result, uploadDate });
        await setDoc(doc(db, 'msr', `data_ikrar_file_${currentKey}`), {
          fileData: ev.target.result,
          uploadDate
        });
        saveToFirebaseWithOffline({
          latestUpdate: { view: 'ikrar', text: 'Dokumen Lafaz Ikrar Pelajar dikemas kini.' }
        });
      } catch (error) {
        alert('Gagal muat naik dokumen ikrar (pastikan saiz fail bawah 900KB).');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteIkrarFile = async () => {
    if (window.confirm('Padam dokumen rasmi ikrar ini?')) {
      setIkrarFile(null);
      setIkrarFileDate(null);
      saveSessionFileToIDB(`ikrarFile_${currentKey}`, null);
      await setDoc(doc(db, 'msr', `data_ikrar_file_${currentKey}`), { fileData: null, uploadDate: null });
    }
  };

  // --- RENDERING ROUTER ---
  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomeView
            isAdmin={isAdmin}
            announcements={announcements}
            setAnnouncements={setAnnouncements}
            saveToFirebaseWithOffline={saveToFirebaseWithOffline}
            sesiKemasukan={viewingSession}
            setSesiKemasukan={handleSelectViewingSession}
            activeSession={activeSession}
            viewingSession={viewingSession}
            sessionsList={sessionsList}
            isViewingArchive={isViewingArchive}
            onSelectViewingSession={handleSelectViewingSession}
            onReturnToActiveSession={handleReturnToActiveSession}
            onSetOfficialSession={handleSetOfficialSession}
            tarikhPenutup={tarikhPenutup}
            setTarikhPenutup={setTarikhPenutup}
            navigateTo={navigateTo}
            jadualData={jadualData}
            ajkInduk={ajkInduk}
            biroList={biroList}
            penutupData={penutupData}
          />
        );
      case 'memo':
        return (
          <MemoView
            isAdmin={isAdmin}
            memoList={memoList}
            handleDocumentUpload={handleDocumentUpload}
            setViewingMemo={setViewingMemo}
            handleDownloadBlob={handleDownloadBlob}
            memoText={memoText}
            setMemoText={setMemoText}
            saveToFirebaseWithOffline={saveToFirebaseWithOffline}
          />
        );
      case 'ajk':
        return (
          <AjkView
            isAdmin={isAdmin}
            ajkInduk={ajkInduk}
            setAjkInduk={setAjkInduk}
            biroList={biroList}
            setBiroList={setBiroList}
            saveToFirebaseWithOffline={saveToFirebaseWithOffline}
          />
        );
      case 'jadual':
        return (
          <JadualView
            isAdmin={isAdmin}
            jadualData={jadualData}
            setJadualData={setJadualData}
            activeJadualTab={activeJadualTab}
            setActiveJadualTab={setActiveJadualTab}
            jadualFile={jadualFile}
            jadualFileDate={jadualFileDate}
            setJadualFile={setJadualFile}
            handleJadualFileUpload={handleJadualFileUpload}
            setViewingMemo={setViewingMemo}
            handleDownloadBlob={handleDownloadBlob}
            saveToFirebaseWithOffline={saveToFirebaseWithOffline}
          />
        );
      case 'penutup':
        return (
          <PenutupView
            isAdmin={isAdmin}
            penutupData={penutupData}
            setPenutupData={setPenutupData}
            penutupFile={penutupFile}
            penutupFileDate={penutupFileDate}
            setPenutupFile={setPenutupFile}
            handlePenutupFileUpload={handlePenutupFileUpload}
            setViewingMemo={setViewingMemo}
            handleDownloadBlob={handleDownloadBlob}
            saveToFirebaseWithOffline={saveToFirebaseWithOffline}
          />
        );
      case 'layout':
        return (
          <LayoutView
            isAdmin={isAdmin}
            layoutList={layoutList}
            handleLayoutUpload={handleLayoutUpload}
            handleDeleteLayout={handleDeleteLayout}
            setViewingMemo={setViewingMemo}
            handleDownloadBlob={handleDownloadBlob}
          />
        );
      case 'lagu':
        return <LaguView />;
      case 'ikrar':
        return (
          <IkrarView
            isAdmin={isAdmin}
            ikrarFile={ikrarFile}
            ikrarFileDate={ikrarFileDate}
            handleIkrarFileUpload={handleIkrarFileUpload}
            handleDeleteIkrarFile={handleDeleteIkrarFile}
            setViewingMemo={setViewingMemo}
            handleDownloadBlob={handleDownloadBlob}
            navigateTo={navigateTo}
          />
        );
      default:
        return (
          <HomeView
            isAdmin={isAdmin}
            announcements={announcements}
            setAnnouncements={setAnnouncements}
            saveToFirebaseWithOffline={saveToFirebaseWithOffline}
            sesiKemasukan={viewingSession}
            setSesiKemasukan={handleSelectViewingSession}
            activeSession={activeSession}
            viewingSession={viewingSession}
            sessionsList={sessionsList}
            isViewingArchive={isViewingArchive}
            onSelectViewingSession={handleSelectViewingSession}
            onReturnToActiveSession={handleReturnToActiveSession}
            onSetOfficialSession={handleSetOfficialSession}
            tarikhPenutup={tarikhPenutup}
            setTarikhPenutup={setTarikhPenutup}
            navigateTo={navigateTo}
            jadualData={jadualData}
            ajkInduk={ajkInduk}
            biroList={biroList}
            penutupData={penutupData}
          />
        );
    }
  };

  useEffect(() => {
    if (viewingMemo) {
      try {
        const parts = viewingMemo.url.split(';');
        const mime = parts[0].split(':')[1];
        const raw = window.atob(parts[1].split(',')[1]);
        const uInt8Array = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; ++i) {
          uInt8Array[i] = raw.charCodeAt(i);
        }
        const blob = new Blob([uInt8Array], { type: mime });
        setBlobUrl(window.URL.createObjectURL(blob));
      } catch (e) {
        setBlobUrl(viewingMemo.url);
      }
    } else if (blobUrl) {
      window.URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
    }
  }, [viewingMemo]);

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <GlobalStyles />
      <datalist id="senarai-staf">
        {senaraiStaf.map((staf, i) => (
          <option key={i} value={staf} />
        ))}
      </datalist>

      <SplashScreen isAppReady={isAppReady} />
      <ToastNotification
        showToast={showToast}
        info={latestUpdateInfo}
        setShowToast={setShowToast}
        navigateTo={navigateTo}
      />

      <div className="min-h-screen bg-[#f4f7fb] dark:bg-[#020617] font-sans text-slate-900 dark:text-slate-100 flex flex-col relative selection:bg-cyan-200 dark:selection:bg-cyan-900 overflow-x-hidden transition-colors duration-500">
        {/* Lapisan Latar Belakang 2026 */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0 tech-grid-2026"></div>
          <div className="absolute -top-32 left-1/4 w-[36rem] h-[36rem] bg-cyan-400/15 dark:bg-cyan-500/10 rounded-full blur-[130px] animate-float"></div>
          <div className="absolute top-1/3 -right-24 w-[32rem] h-[32rem] bg-indigo-500/10 dark:bg-blue-600/10 rounded-full blur-[140px] animate-float-delayed"></div>
          <div className="absolute -bottom-32 left-10 w-[28rem] h-[28rem] bg-emerald-400/10 dark:bg-teal-500/5 rounded-full blur-[130px]"></div>
        </div>

        {showOfflineBanner && (
          <div className="relative z-50 bg-amber-500 text-slate-950 text-xs font-bold text-center py-2 px-4 shadow-md">
            Mod Luar Talian: Perubahan disimpan secara tempatan dan akan disegerakkan apabila internet kembali.
          </div>
        )}

        <div className="relative z-10 flex flex-col min-h-screen">
          <Header
            currentView={currentView}
            navigateTo={navigateTo}
            isAdmin={isAdmin}
            toggleTheme={toggleTheme}
            isDarkMode={isDarkMode}
            isScrolled={isScrolled}
          />

          {/* Banner Mod Arkib Apabila Pengguna / Pengajar Menyemak Sesi Lepas */}
          {isViewingArchive && (
            <div className="max-w-6xl w-full mx-auto px-4 lg:px-8 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs font-semibold backdrop-blur-md">
                <span>
                  Sedang menyemak rekod arkib: <strong>Sesi {viewingSession.sesi} / {viewingSession.tahun}</strong>{' '}
                  (Sesi Terkini: Sesi {activeSession.sesi} / {activeSession.tahun})
                </span>
                <button
                  type="button"
                  onClick={handleReturnToActiveSession}
                  className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition"
                >
                  Kembali ke Sesi Terkini
                </button>
              </div>
            </div>
          )}

          <main
            className={`flex-grow w-full transition-all duration-300 ease-in-out ${
              isPending ? 'opacity-40 blur-sm scale-[0.98]' : 'opacity-100 blur-0 scale-100'
            }`}
          >
            {renderView()}
          </main>

          <Footer />
        </div>

        <BottomNav currentView={currentView} navigateTo={navigateTo} />
        <FabMenu
          showFabMenu={showFabMenu}
          setShowFabMenu={setShowFabMenu}
          isAdmin={isAdmin}
          setIsAdmin={setIsAdmin}
          toggleTheme={toggleTheme}
          isDarkMode={isDarkMode}
          setShowLogin={setShowLogin}
        />
      </div>

      {viewingMemo && (
        <ImageModal
          viewingMemo={viewingMemo}
          setViewingMemo={setViewingMemo}
          blobUrl={blobUrl}
          handleDownloadBlob={handleDownloadBlob}
        />
      )}

      <LoginModal
        showLogin={showLogin}
        setShowLogin={setShowLogin}
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        handleLogin={handleLogin}
        isLockedOut={isLockedOut}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
      />

      <PwaInstallBanner
        show={showPwaBanner}
        onInstall={handleInstallPwaClick}
        onClose={() => setShowPwaBanner(false)}
      />

      <IosInstallBanner
        show={showIosBanner}
        onClose={() => {
          setShowIosBanner(false);
          sessionStorage.setItem('imsr_ios_banner_dismissed', 'true');
        }}
      />
    </div>
  );
}