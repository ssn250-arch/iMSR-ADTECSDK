import React, { useState, useMemo } from 'react';
import {
  Bell,
  ArrowUpRight,
  FileSignature,
  UserCog,
  CalendarClock,
  GraduationCap,
  MapPinned,
  AudioLines,
  ShieldCheck,
  Cpu,
  Plus,
  X,
  Sparkles,
  CheckCircle2,
  Circle,
  Navigation,
  CalendarDays
} from 'lucide-react';
import NetworkAnimation from '../ui/NetworkAnimation';
import LiveClock from '../ui/LiveClock';
import { formatTarikh } from '../../utils/helpers';

// Kekalkan `true` untuk Bento Grid 7-Modul penuh (termasuk Ikrar Pelajar)
const ENABLE_IKRAR_CARD = true;

// Format pintar: tukar YYYY-MM-DD kepada "5 Jul 2026 (Ahad)", kekalkan teks biasa jika bukan tarikh ISO
const formatSmartLabel = (val) => {
  if (!val || typeof val !== 'string') return '';
  const trimmed = val.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return formatTarikh(trimmed);
  }
  return trimmed;
};

// Skema Warna Liquid Glass 2026 (Kontras ditingkatkan untuk skrin monitor laptop/desktop)
const cardThemes = {
  cyan: {
    iconWrap: 'bg-cyan-500/12 dark:bg-cyan-400/10 text-cyan-600 dark:text-cyan-300 ring-1 ring-cyan-500/25',
    badge: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/25',
    borderHover: 'hover:border-cyan-400/80 dark:hover:border-cyan-400/45',
    spotlight: 'rgba(6, 182, 212, 0.14)',
    accentGlow: 'from-cyan-500/[0.14] via-sky-500/[0.04] to-transparent'
  },
  sky: {
    iconWrap: 'bg-sky-500/12 dark:bg-sky-400/10 text-sky-600 dark:text-sky-300 ring-1 ring-sky-500/25',
    badge: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25',
    borderHover: 'hover:border-sky-400/80 dark:hover:border-sky-400/45',
    spotlight: 'rgba(14, 165, 233, 0.14)',
    accentGlow: 'from-sky-500/12 via-transparent to-transparent'
  },
  blue: {
    iconWrap: 'bg-blue-500/12 dark:bg-blue-400/10 text-blue-600 dark:text-blue-300 ring-1 ring-blue-500/25',
    badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25',
    borderHover: 'hover:border-blue-400/80 dark:hover:border-blue-400/45',
    spotlight: 'rgba(59, 130, 246, 0.14)',
    accentGlow: 'from-blue-500/12 via-transparent to-transparent'
  },
  emerald: {
    iconWrap: 'bg-emerald-500/12 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-300 ring-1 ring-emerald-500/25',
    badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
    borderHover: 'hover:border-emerald-400/80 dark:hover:border-emerald-400/45',
    spotlight: 'rgba(16, 185, 129, 0.14)',
    accentGlow: 'from-emerald-500/12 via-transparent to-transparent'
  },
  indigo: {
    iconWrap: 'bg-indigo-500/12 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-300 ring-1 ring-indigo-500/25',
    badge: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/25',
    borderHover: 'hover:border-indigo-400/80 dark:hover:border-indigo-400/45',
    spotlight: 'rgba(99, 102, 241, 0.14)',
    accentGlow: 'from-indigo-500/12 via-transparent to-transparent'
  },
  violet: {
    iconWrap: 'bg-violet-500/12 dark:bg-violet-400/10 text-violet-600 dark:text-violet-300 ring-1 ring-violet-500/25',
    badge: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/25',
    borderHover: 'hover:border-violet-400/80 dark:hover:border-violet-400/45',
    spotlight: 'rgba(139, 92, 246, 0.14)',
    accentGlow: 'from-violet-500/12 via-transparent to-transparent'
  },
  amber: {
    iconWrap: 'bg-amber-500/12 dark:bg-amber-400/10 text-amber-600 dark:text-amber-300 ring-1 ring-amber-500/25',
    badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25',
    borderHover: 'hover:border-amber-400/80 dark:hover:border-amber-400/45',
    spotlight: 'rgba(245, 158, 11, 0.14)',
    accentGlow: 'from-amber-500/[0.15] via-orange-500/[0.04] to-transparent'
  }
};

// Komponen Kad Bento 2026 (Mobile/Tablet kekal asal, Desktop diselaraskan garisan tajuk & ketajaman kad)
function BentoCard({ item, onClick, isAdmin, tarikhPenutup, onTarikhPenutupChange }) {
  const [coords, setCoords] = useState({ x: 0, y: 0, active: false });
  const theme = cardThemes[item.color] || cardThemes.cyan;
  const Icon = item.icon;

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true
    });
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(item.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(item.id);
        }
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setCoords((prev) => ({ ...prev, active: false }))}
      className={`group relative cursor-pointer overflow-hidden text-left rounded-[2rem] p-6 md:p-7 transition-all duration-300
        bg-white/85 lg:bg-white/90 dark:bg-slate-900/60 backdrop-blur-2xl
        border border-slate-200/90 lg:border-slate-300/75 dark:border-slate-800/90
        ring-1 ring-inset ring-white/90 dark:ring-white/[0.06]
        shadow-[0_6px_24px_-6px_rgba(15,23,42,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.28)]
        hover:-translate-y-1 hover:shadow-[0_18px_38px_-10px_rgba(15,23,42,0.13)] dark:hover:shadow-2xl ${theme.borderHover}
        flex flex-col justify-between lg:justify-start min-h-[190px] lg:min-h-[218px]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500
        ${item.spanClass || ''}`}
      aria-label={`Buka modul ${item.title}`}
    >
      {/* Cursor Spotlight Glow */}
      <div
        className="pointer-events-none absolute -inset-px rounded-[2rem] transition-opacity duration-300"
        style={{
          opacity: coords.active ? 1 : 0,
          background: `radial-gradient(380px circle at ${coords.x}px ${coords.y}px, ${theme.spotlight}, transparent 70%)`
        }}
      />

      {/* Ambient Wash Lembut untuk Kad Featured (Span-2) */}
      {item.featured && (
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${theme.accentGlow} opacity-80`}
        />
      )}

      {/* Baris Atas: Ikon, Lencana Status & Anak Panah Serong */}
      <div className="relative z-10 flex items-start justify-between gap-3 w-full">
        <div className="flex items-center gap-3 flex-wrap">
          <div
            className={`p-3.5 rounded-2xl ${theme.iconWrap} shadow-sm transition-transform duration-300 group-hover:scale-105`}
          >
            <Icon size={22} strokeWidth={2} />
          </div>
          {item.badge && (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${theme.badge}`}
            >
              {item.pulse && (
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
              )}
              {item.badge}
            </span>
          )}
        </div>

        <div className="p-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:bg-white dark:group-hover:bg-slate-800 transition-all duration-300 shrink-0">
          <ArrowUpRight
            size={16}
            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </div>
      </div>

      {/* Blok Tajuk & Penerangan: Sejajar Mendatar pada Desktop (`lg:mt-6`) */}
      <div className="relative z-10 mt-6 lg:mt-6 w-full">
        <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight">
          {item.title}
        </h3>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed">
          {item.desc}
        </p>
      </div>

      {/* Micro-Preview Pill / Pilihan Tarikh Penutup ditolak kemas ke dasar kad (`lg:mt-auto`) */}
      {(item.metaPreview || (item.id === 'penutup' && (tarikhPenutup || isAdmin))) && (
        <div className="relative z-10 pt-3 lg:mt-auto lg:pt-4 flex flex-wrap items-center gap-2 w-full">
          {item.metaPreview && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100/95 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200/85 dark:border-slate-700/60">
              <Sparkles size={12} className="text-cyan-500 shrink-0" />
              <span className="truncate max-w-[260px] sm:max-w-md">{item.metaPreview}</span>
            </span>
          )}

          {item.id === 'penutup' && isAdmin && onTarikhPenutupChange && (
            <div
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-xl border border-indigo-500/25"
            >
              <CalendarDays size={12} className="shrink-0" />
              <input
                type="date"
                value={tarikhPenutup || ''}
                onChange={(e) => onTarikhPenutupChange(e.target.value)}
                className="bg-transparent outline-none text-[11px] font-bold cursor-pointer"
                aria-label="Pilih tarikh majlis penutup"
              />
            </div>
          )}

          {item.id === 'penutup' && !isAdmin && tarikhPenutup && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20">
              <CalendarDays size={12} className="shrink-0" />
              <span>{formatTarikh(tarikhPenutup)}</span>
            </span>
          )}
        </div>
      )}

      {/* Watermark Halus Pada Kad Featured */}
      {item.featured && (
        <div className="pointer-events-none absolute -right-6 -bottom-8 opacity-[0.05] dark:opacity-[0.04] transform -rotate-12 transition-transform duration-500 group-hover:rotate-0 group-hover:scale-105">
          <Icon size={150} strokeWidth={1.2} />
        </div>
      )}
    </div>
  );
}

const DEFAULT_CHECKLIST = [
  { id: 'ic', label: 'Salinan Kad Pengenalan & Surat Tawaran' },
  { id: 'sijil', label: 'Sijil Akademik / SPM Asal & Salinan' },
  { id: 'borang', label: 'Borang Pendaftaran & Pemeriksaan Kesihatan' },
  { id: 'pakaian', label: 'Pakaian Kemas Mengikut Etika MSR' }
];

export default function HomeView({
  isAdmin,
  announcements = [],
  setAnnouncements,
  saveToFirebaseWithOffline,
  sesiKemasukan = { sesi: '2', tahun: '2026' },
  setSesiKemasukan,
  tarikhPenutup = '',
  setTarikhPenutup,
  navigateTo,
  jadualData = [],
  ajkInduk = [],
  biroList = [],
  penutupData = []
}) {
  // Senarai Semak Interaktif Pelajar (Disimpan dalam localStorage peranti)
  const [checkedItems, setCheckedItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('imsr_student_checklist') || '{}');
    } catch {
      return {};
    }
  });

  const toggleCheck = (id) => {
    setCheckedItems((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem('imsr_student_checklist', JSON.stringify(next));
      return next;
    });
  };

  const handleTarikhPenutupUpdate = (newDate) => {
    if (setTarikhPenutup) setTarikhPenutup(newDate);
    if (saveToFirebaseWithOffline) {
      saveToFirebaseWithOffline({
        tarikhPenutup: newDate,
        latestUpdate: {
          view: 'penutup',
          text: 'Tarikh Majlis Penutup telah dikemas kini.'
        }
      });
    }
  };

  const compiledText =
    announcements && announcements.length > 0
      ? announcements.map((a) => a.text.trim()).filter(Boolean).join('   •   ')
      : 'Selamat Datang ke Portal iMSR ADTEC JTM Kampus Sandakan. Sila rujuk modul Jadual MSR dan Pelan Daftar untuk panduan penuh.';

  // Kiraan Ringkas Data Live & Format Tarikh Kemas (Contoh: "5 Jul 2026 (Ahad)")
  const totalDays = jadualData?.length || 0;
  const rawFirstDay = jadualData?.[0]?.tarikh || jadualData?.[0]?.hari || null;
  const formattedFirstDay = rawFirstDay ? formatSmartLabel(rawFirstDay) : null;
  const totalAjkGroup = (ajkInduk?.length ? 1 : 0) + (biroList?.length || 0);

  const moduleCards = useMemo(() => {
    const baseCards = [
      {
        id: 'jadual',
        icon: CalendarClock,
        title: 'Jadual MSR',
        desc: 'Tentatif penuh aktiviti harian, masa berkumpul, lokasi slot & muat turun jadual rasmi.',
        color: 'cyan',
        featured: true,
        pulse: true,
        badge: totalDays > 0 ? `${totalDays} Hari Program` : 'Tentatif Utama',
        metaPreview: formattedFirstDay
          ? `Slot tersedia bermula: ${formattedFirstDay}`
          : 'Klik untuk semak susunan aktiviti harian pelajar',
        spanClass: 'sm:col-span-2 lg:col-span-2'
      },
      {
        id: 'layout',
        icon: MapPinned,
        title: 'Pelan Daftar',
        desc: 'Panduan aliran kaunter pendaftaran, dewan & lokasi kemasukan.',
        color: 'sky',
        badge: 'Peta & Aliran',
        spanClass: 'col-span-1'
      },
      {
        id: 'memo',
        icon: FileSignature,
        title: 'Memo Lantikan',
        desc: 'Rujukan surat pelantikan rasmi & dokumen edaran dalaman.',
        color: 'blue',
        badge: 'Rasmi',
        spanClass: 'col-span-1'
      },
      {
        id: 'ajk',
        icon: UserCog,
        title: 'Senarai AJK',
        desc: 'Struktur jawatankuasa induk & pembahagian tugas biro pelaksana.',
        color: 'emerald',
        badge: totalAjkGroup > 0 ? `${biroList.length} Biro Aktif` : 'Jawatankuasa',
        spanClass: 'col-span-1'
      },
      {
        id: 'penutup',
        icon: GraduationCap,
        title: 'Majlis Penutup',
        desc: 'Atur cara protokol & tentatif perasmian penutupan MSR.',
        color: 'indigo',
        badge: penutupData?.length ? `${penutupData.length} Atur Cara` : 'Protokol',
        spanClass: 'col-span-1'
      },
      {
        id: 'lagu',
        icon: AudioLines,
        title: 'Lirik Nyanyian',
        desc: 'Senarai lirik lagu rasmi Negaraku, Sabah Tanah Airku & korporat JTM.',
        color: 'violet',
        badge: 'Audio & Lirik',
        spanClass: ENABLE_IKRAR_CARD ? 'col-span-1' : 'sm:col-span-2 lg:col-span-2'
      }
    ];

    if (ENABLE_IKRAR_CARD) {
      baseCards.push({
        id: 'ikrar',
        icon: ShieldCheck,
        title: 'Ikrar Pelajar',
        desc: 'Lafaz ikrar rasmi pelajar baharu ADTEC JTM Kampus Sandakan sempena Minggu Silaturahim.',
        color: 'amber',
        featured: true,
        badge: 'Wajib Lafaz',
        metaPreview: 'Bacaan ikrar beramai-ramai semasa sesi taklimat & majlis rasmi',
        spanClass: 'sm:col-span-1 lg:col-span-2'
      });
    }

    return baseCards;
  }, [totalDays, formattedFirstDay, totalAjkGroup, biroList?.length, penutupData?.length]);

  const completedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div className="px-4 lg:px-8 max-w-6xl mx-auto pb-32 pt-4">
      {/* Animasi Marquee Info Kilat + Edge Fade Mask Lembut */}
      <style>{`
        @keyframes seamlessMarquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .tech-marquee-track {
          display: flex;
          width: max-content;
          animation: seamlessMarquee 14s linear infinite;
          will-change: transform;
        }
        @media (min-width: 640px) { .tech-marquee-track { animation-duration: 20s; } }
        @media (min-width: 1024px) { .tech-marquee-track { animation-duration: 25s; } }
        .tech-marquee-track:hover { animation-play-state: paused; }

        .marquee-fade-mask {
          -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 22px, #000 calc(100% - 22px), transparent 100%);
          mask-image: linear-gradient(to right, transparent 0%, #000 22px, #000 calc(100% - 22px), transparent 100%);
        }
      `}</style>

      {/* HERO SECTION 2026 */}
      <section className="relative rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-[#08172e] to-[#030b18] overflow-hidden shadow-[0_20px_60px_-15px_rgba(2,8,23,0.7)] border border-cyan-500/20 ring-1 ring-inset ring-white/10 mb-8">
        <NetworkAnimation />
        <div className="absolute top-[-25%] left-[-10%] w-[55%] h-[55%] bg-cyan-500/20 rounded-full blur-[130px] animate-float pointer-events-none" />
        <div className="absolute bottom-[-25%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[130px] animate-float-delayed pointer-events-none" />

        <div className="relative z-20 px-6 py-8 md:px-12 md:py-14 flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-10">
          <div className="w-full lg:w-3/5 space-y-6 text-center lg:text-left">
            
            {/* BOARD INFO KILAT DENGAN EDGE FADE MASK */}
            <div
              className={`flex ${
                isAdmin ? 'flex-col items-start gap-4' : 'items-center gap-3'
              } px-3.5 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-400/25 backdrop-blur-md text-amber-300 text-xs md:text-sm font-semibold w-full overflow-hidden`}
            >
              <span className="flex items-center gap-1.5 bg-amber-400 text-slate-950 px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider shrink-0 uppercase shadow-sm">
                <Bell size={12} className="shrink-0 animate-bounce" />
                INFO KILAT {isAdmin && `(${announcements.length})`}
              </span>

              <div
                className={`flex-1 overflow-hidden relative w-full flex items-center ${
                  !isAdmin ? 'marquee-fade-mask' : ''
                }`}
              >
                {isAdmin ? (
                  <div className="w-full flex flex-col gap-2">
                    {announcements.map((item, index) => (
                      <div
                        key={item.id || index}
                        className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 p-1.5 rounded-xl w-full"
                      >
                        <span className="text-[10px] font-mono text-slate-400 px-1.5">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          value={item.text}
                          onChange={(e) => {
                            const updated = [...announcements];
                            updated[index].text = e.target.value;
                            setAnnouncements(updated);
                          }}
                          onBlur={() =>
                            saveToFirebaseWithOffline({
                              announcements,
                              latestUpdate: {
                                view: 'home',
                                text: 'Senarai maklumat hebahan utama telah dikemas kini.'
                              }
                            })
                          }
                          className="flex-1 bg-transparent border-none outline-none text-white text-xs md:text-sm"
                          placeholder="Tulis pengumuman kilat di sini..."
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = announcements.filter((_, i) => i !== index);
                            setAnnouncements(updated);
                            saveToFirebaseWithOffline({
                              announcements: updated,
                              latestUpdate: {
                                view: 'home',
                                text: 'Satu rekod maklumat hebahan telah dipadam.'
                              }
                            });
                          }}
                          className="text-red-400 hover:text-red-300 p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setAnnouncements([
                          ...announcements,
                          { id: 'ann_' + Date.now(), text: '' }
                        ])
                      }
                      className="text-[11px] bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-1.5 rounded-xl font-black tracking-wide mt-1 self-start flex items-center gap-1 shadow"
                    >
                      <Plus size={12} /> Tambah Hebahan Baru
                    </button>
                  </div>
                ) : (
                  <div className="tech-marquee-track font-semibold text-amber-200/95 tracking-wide gap-12 whitespace-nowrap pl-2">
                    <div className="flex items-center gap-3 shrink-0 whitespace-nowrap">
                      <span>{compiledText}</span>
                      <span className="text-amber-400/60 font-black shrink-0 ml-4">•</span>
                    </div>
                    <div
                      className="flex items-center gap-3 shrink-0 whitespace-nowrap"
                      aria-hidden="true"
                    >
                      <span>{compiledText}</span>
                      <span className="text-amber-400/60 font-black shrink-0 ml-4">•</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* TAJUK HERO & LENCANA SESI */}
            <div className="space-y-3.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-200 text-[11px] font-black tracking-[0.18em] uppercase">
                <Cpu size={13} className="text-cyan-400" />
                {isAdmin ? (
                  <div className="flex items-center gap-2">
                    <span>Sesi:</span>
                    <select
                      value={sesiKemasukan.sesi}
                      onChange={(e) => {
                        const updated = { ...sesiKemasukan, sesi: e.target.value };
                        setSesiKemasukan(updated);
                        saveToFirebaseWithOffline({ sesiKemasukan: updated });
                      }}
                      className="bg-transparent outline-none text-white font-bold border-b border-cyan-400/50"
                    >
                      <option value="1" className="text-slate-950">1</option>
                      <option value="2" className="text-slate-950">2</option>
                    </select>
                    <span>/</span>
                    <select
                      value={sesiKemasukan.tahun}
                      onChange={(e) => {
                        const updated = { ...sesiKemasukan, tahun: e.target.value };
                        setSesiKemasukan(updated);
                        saveToFirebaseWithOffline({ sesiKemasukan: updated });
                      }}
                      className="bg-transparent outline-none text-white font-bold border-b border-cyan-400/50"
                    >
                      {[...Array(10)].map((_, i) => {
                        const year = (2025 + i).toString();
                        return (
                          <option key={year} value={year} className="text-slate-950">
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                ) : (
                  <span>Kemasukan Sesi {sesiKemasukan.sesi} / {sesiKemasukan.tahun}</span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-[3.75rem] font-black text-white tracking-tight leading-[1.08]">
                Minggu{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500">
                  Silaturahim
                </span>
              </h1>

              <p className="text-sm md:text-base text-slate-300/90 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Hab digital sehenti pendaftaran, jadual orientasi, dan maklumat operasi pelajar baharu ADTEC JTM Kampus Sandakan.
              </p>
            </div>

            {/* QUICK ACTION BUTTONS */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
              <button
                type="button"
                onClick={() => navigateTo('jadual')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs md:text-sm shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:-translate-y-0.5"
              >
                <CalendarClock size={16} />
                <span>Semak Jadual Hari Ini</span>
              </button>

              <button
                type="button"
                onClick={() => navigateTo('layout')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs md:text-sm backdrop-blur-md transition-all duration-200"
              >
                <MapPinned size={16} className="text-cyan-300" />
                <span>Pelan Kaunter Daftar</span>
              </button>

              <a
                href="https://maps.google.com/?q=ADTEC+Sandakan"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-700/80 text-slate-200 font-semibold text-xs md:text-sm transition-all duration-200"
              >
                <Navigation size={14} className="text-emerald-400" />
                <span>Lokasi Kampus</span>
              </a>
            </div>
          </div>

          {/* WIDGET JAM MASA NYATA GLASS 2026 */}
          <div className="w-full lg:w-2/5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[19rem]">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/30 to-blue-600/30 rounded-[2.2rem] blur-2xl pointer-events-none" />
              <div className="relative bg-white/[0.08] backdrop-blur-2xl border border-white/20 ring-1 ring-inset ring-white/10 p-6 md:p-8 rounded-[2.2rem] shadow-2xl text-center">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/15 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold uppercase tracking-widest mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Sistem Aktif
                </div>
                <LiveClock />
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-xs md:text-sm font-semibold text-slate-100">
                  <CalendarClock size={14} className="text-cyan-400" />
                  <span>{formatTarikh(new Date().toISOString().split('T')[0])}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HEADER SEKSYEN MODUL */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <h2 className="text-base md:text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Modul Utama Portal
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Pilih modul di bawah untuk akses pantas dokumen dan maklumat MSR
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-slate-200/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-300/60 dark:border-slate-700/60">
          {moduleCards.length} Modul Tersedia
        </span>
      </div>

      {/* BENTO GRID 2026 */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-8">
        {moduleCards.map((item) => (
          <BentoCard
            key={item.id}
            item={item}
            onClick={navigateTo}
            isAdmin={isAdmin}
            tarikhPenutup={tarikhPenutup}
            onTarikhPenutupChange={handleTarikhPenutupUpdate}
          />
        ))}
      </section>

      {/* WIDGET PERSEDIAAN PANTAS PELAJAR BAHARU */}
      <section className="rounded-[2rem] bg-white/85 lg:bg-white/90 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/90 lg:border-slate-300/75 dark:border-slate-800/90 ring-1 ring-inset ring-white/90 dark:ring-white/[0.06] p-6 md:p-7 shadow-[0_6px_24px_-6px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm md:text-base font-black text-slate-900 dark:text-white">
              Senarai Semak Pantas Hari Pendaftaran
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tandakan persediaan anda (disimpan secara automatik pada peranti ini)
            </p>
          </div>
          <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-extrabold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/25">
            {completedCount} / {DEFAULT_CHECKLIST.length} Selesai
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DEFAULT_CHECKLIST.map((item) => {
            const done = !!checkedItems[item.id];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleCheck(item.id)}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all duration-200 ${
                  done
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                    : 'bg-slate-50/90 dark:bg-slate-800/40 border-slate-200/85 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-cyan-400/60'
                }`}
              >
                {done ? (
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                ) : (
                  <Circle size={18} className="text-slate-400 shrink-0" />
                )}
                <span className={`text-xs md:text-sm font-semibold ${done ? 'line-through opacity-80' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}