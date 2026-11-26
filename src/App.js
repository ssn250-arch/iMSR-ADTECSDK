import React, { useState, useEffect, useRef, useCallback } from 'react';
import { doc, onSnapshot, setDoc, collection } from 'firebase/firestore';
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

// --- IMPORT KOMPONEN VIEWS (PAPARAN) ---
import HomeView from './components/views/HomeView';
import MemoView from './components/views/MemoView';
import AjkView from './components/views/AjkView';
import JadualView from './components/views/JadualView';
import PenutupView from './components/views/PenutupView';
import LayoutView from './components/views/LayoutView';
import LaguView from './components/views/LaguView';
// Nyah-komen baris di bawah jika IkrarView.js sudah ada dalam projek anda:
// import IkrarView from './components/views/IkrarView';

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

      /* 2026 Tech Grid + Radial Fade Mask */
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
  // --- STATES ---
  const [currentView, setCurrentView] = useState('home');
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

  // --- PWA ANDROID INSTALL STATES ---
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPwaBanner, setShowPwaBanner] = useState(false);

  // --- LOG IN SECURITY STATES ---
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);

  // --- DATA STATES ---
  const [lastUpdated, setLastUpdated] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [sesiKemasukan, setSesiKemasukan] = useState({ sesi: '2', tahun: '2026' });
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

  const hasCheckedUpdates = useRef(false);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  // --- LOGIK DETECT & PROMPT INSTALASI PWA (ANDROID TARGET) ---
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (/Android/i.test(navigator.userAgent)) {
        setShowPwaBanner(true);
      }
    };
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
    setCurrentView(view);
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
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

  // --- 1. FAST CORE DATA SYNC (Hanya muat turun teks utama semasa mula dibuka) ---
  useEffect(() => {
    const cachedData = localStorage.getItem('imsr_cached_data');
    if (cachedData) {
      try {
        const data = JSON.parse(cachedData);
        if (data.lastUpdated) setLastUpdated(data.lastUpdated);
        if (data.announcements) setAnnouncements(data.announcements);
        if (data.sesiKemasukan) setSesiKemasukan(data.sesiKemasukan);
        if (data.memoText !== undefined) setMemoText(data.memoText);
        if (data.ajkInduk) setAjkInduk(data.ajkInduk);
        if (data.biroList) setBiroList(data.biroList);
        if (data.penutupData) setPenutupData(data.penutupData);
        if (data.jadualData) {
          setJadualData(data.jadualData);
          setActiveJadualTab((prev) => prev || (data.jadualData.length > 0 ? data.jadualData[0].id : ''));
        }
        // Buka terus dari cache dengan pantas
        setTimeout(() => setIsAppReady(true), 350);
      } catch (e) {}
    }

    // Fallback keselamatan jika tiada internet / cache kosong
    const readyFallback = setTimeout(() => setIsAppReady(true), 1200);

    const unsubscribeUtama = onSnapshot(doc(db, 'msr', 'data_utama'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        localStorage.setItem('imsr_cached_data', JSON.stringify(data));
        if (data.lastUpdated) setLastUpdated(data.lastUpdated);
        if (data.latestUpdate) setLatestUpdateInfo(data.latestUpdate);

        if (data.announcements !== undefined) {
          setAnnouncements(data.announcements);
        } else if (data.announcement !== undefined) {
          setAnnouncements([{ id: 'legacy_1', text: data.announcement }]);
        }

        if (data.sesiKemasukan) setSesiKemasukan(data.sesiKemasukan);
        if (data.memoText !== undefined) setMemoText(data.memoText);
        if (data.ajkInduk) setAjkInduk(data.ajkInduk);
        if (data.biroList) setBiroList(data.biroList);
        if (data.penutupData) setPenutupData(data.penutupData);
        if (data.jadualData) {
          setJadualData(data.jadualData);
          setActiveJadualTab((prev) => prev || (data.jadualData.length > 0 ? data.jadualData[0].id : ''));
        }
      }
      setTimeout(() => setIsAppReady(true), 450);
    });

    return () => {
      clearTimeout(readyFallback);
      unsubscribeUtama();
    };
  }, []);

  // --- 2. LAZY FIREBASE LISTENERS (Muat turun fail Base64 berat HANYA bila modul dibuka) ---
  useEffect(() => {
    let unsub = null;

    if (currentView === 'memo') {
      unsub = onSnapshot(collection(db, 'msr_memos'), (snapshot) => {
        const memosArray = [];
        snapshot.forEach((d) => memosArray.push(d.data()));
        memosArray.sort((a, b) => a.id.localeCompare(b.id));
        setMemoList(memosArray);
      });
    } else if (currentView === 'layout') {
      unsub = onSnapshot(doc(db, 'msr', 'data_layout'), (docSnap) => {
        setLayoutList(docSnap.exists() && docSnap.data().layouts ? docSnap.data().layouts : []);
      });
    } else if (currentView === 'jadual') {
      unsub = onSnapshot(doc(db, 'msr', 'data_jadual_file'), (docSnap) => {
        if (docSnap.exists() && docSnap.data().fileData) {
          setJadualFile(docSnap.data().fileData);
          setJadualFileDate(docSnap.data().uploadDate);
        } else {
          setJadualFile(null);
          setJadualFileDate(null);
        }
      });
    } else if (currentView === 'penutup') {
      unsub = onSnapshot(doc(db, 'msr', 'data_penutup_file'), (docSnap) => {
        if (docSnap.exists() && docSnap.data().fileData) {
          setPenutupFile(docSnap.data().fileData);
          setPenutupFileDate(docSnap.data().uploadDate);
        } else {
          setPenutupFile(null);
          setPenutupFileDate(null);
        }
      });
    }

    return () => {
      if (unsub) unsub();
    };
  }, [currentView]);

  // --- SEMAK KEMAS KINI BAHARU UNTUK TOAST ---
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

  const saveToFirebaseWithOffline = useCallback(async (fieldsToUpdate) => {
    const payload = { ...fieldsToUpdate, lastUpdated: new Date().toISOString() };
    if (!navigator.onLine) {
      const pending = JSON.parse(localStorage.getItem('imsr_pending_updates') || '[]');
      pending.push({ timestamp: Date.now(), payload });
      localStorage.setItem('imsr_pending_updates', JSON.stringify(pending));
      setShowOfflineBanner(true);
      setTimeout(() => setShowOfflineBanner(false), 6000);
      return;
    }
    try {
      await setDoc(doc(db, 'msr', 'data_utama'), payload, { merge: true });
    } catch (error) {
      console.error(error);
    }
  }, []);

  // --- UPLOAD HANDLERS ---
  const handleDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const newMemo = {
          id: 'memo_' + Date.now(),
          name: file.name,
          url: ev.target.result,
          type: file.type.includes('pdf') ? 'pdf' : 'image',
          uploadDate: new Date().toISOString()
        };
        try {
          await setDoc(doc(db, 'msr_memos', newMemo.id), newMemo);
          saveToFirebaseWithOffline({ latestUpdate: { view: 'memo', text: 'Dokumen baharu dimuat naik.' } });
        } catch (error) {
          alert('RALAT: Gagal muat naik.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLayoutUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
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
        try {
          await setDoc(doc(db, 'msr', 'data_layout'), { layouts: [...layoutList, newLayout] });
          saveToFirebaseWithOffline({ latestUpdate: { view: 'layout', text: 'Pelan baharu ditambah.' } });
        } catch (error) {
          alert('Gagal muat naik pelan.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteLayout = async (idToDel) => {
    if (window.confirm('Padam pelan ini?')) {
      await setDoc(doc(db, 'msr', 'data_layout'), { layouts: layoutList.filter((l) => l.id !== idToDel) });
    }
  };

  const handleJadualFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        await setDoc(doc(db, 'msr', 'data_jadual_file'), {
          fileData: ev.target.result,
          uploadDate: new Date().toISOString()
        });
        saveToFirebaseWithOffline({ latestUpdate: { view: 'jadual', text: 'Tentatif Penuh dimuat naik.' } });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePenutupFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        await setDoc(doc(db, 'msr', 'data_penutup_file'), {
          fileData: ev.target.result,
          uploadDate: new Date().toISOString()
        });
        saveToFirebaseWithOffline({ latestUpdate: { view: 'penutup', text: 'Majlis Penutup penuh dimuat naik.' } });
      };
      reader.readAsDataURL(file);
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
            sesiKemasukan={sesiKemasukan}
            setSesiKemasukan={setSesiKemasukan}
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
      // Nyah-komen jika IkrarView.js sudah wujud:
      // case 'ikrar':
      //   return <IkrarView />;
      default:
        return <HomeView navigateTo={navigateTo} />;
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

      {/* MAIN CONTAINER DENGAN AMBIENT AURORA + TECH-GRID 2026 */}
      <div className="min-h-screen bg-[#f4f7fb] dark:bg-[#020617] font-sans text-slate-900 dark:text-slate-100 flex flex-col relative selection:bg-cyan-200 dark:selection:bg-cyan-900 overflow-x-hidden transition-colors duration-500">
        
        {/* Lapisan Latar Belakang 2026 (Fixed Ambient Mesh + Masked Tech Grid) */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0 tech-grid-2026"></div>
          <div className="absolute -top-32 left-1/4 w-[36rem] h-[36rem] bg-cyan-400/15 dark:bg-cyan-500/10 rounded-full blur-[130px] animate-float"></div>
          <div className="absolute top-1/3 -right-24 w-[32rem] h-[32rem] bg-indigo-500/10 dark:bg-blue-600/10 rounded-full blur-[140px] animate-float-delayed"></div>
          <div className="absolute -bottom-32 left-10 w-[28rem] h-[28rem] bg-emerald-400/10 dark:bg-teal-500/5 rounded-full blur-[130px]"></div>
        </div>

        {/* Banner Simpanan Offline */}
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

          <main className="flex-grow w-full">{renderView()}</main>

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
    </div>
  );
}