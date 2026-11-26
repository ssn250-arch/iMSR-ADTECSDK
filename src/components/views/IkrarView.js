import React from 'react';
import {
  ScrollText,
  ShieldCheck,
  Scale,
  Award,
  Star,
  GraduationCap,
  Upload,
  Eye,
  Download,
  Trash2,
  ArrowLeft
} from 'lucide-react';

const IKRAR_ITEMS = [
  {
    num: '01',
    icon: Scale,
    iconStyle:
      'bg-amber-500/12 dark:bg-amber-400/10 text-amber-600 dark:text-amber-300 ring-1 ring-amber-500/25',
    content: (
      <>
        Akan <strong className="font-extrabold text-slate-900 dark:text-white">patuh kepada semua peraturan</strong> yang termaktub dalam buku tatatertib pelajar Jabatan Tenaga Manusia, Kementerian Sumber Manusia Malaysia;
      </>
    )
  },
  {
    num: '02',
    icon: ShieldCheck,
    iconStyle:
      'bg-cyan-500/12 dark:bg-cyan-400/10 text-cyan-600 dark:text-cyan-300 ring-1 ring-cyan-500/25',
    content: (
      <>
        Dan <strong className="font-extrabold text-slate-900 dark:text-white">arahan-arahan yang ditetapkan</strong> oleh pihak institut dari semasa ke semasa;
      </>
    )
  },
  {
    num: '03',
    icon: Award,
    iconStyle:
      'bg-indigo-500/12 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-300 ring-1 ring-indigo-500/25',
    content: (
      <>
        Akan <strong className="font-extrabold text-slate-900 dark:text-white">menghormati dan mematuhi</strong> semua bimbingan serta arahan daripada pegawai dan kakitangan institut; dan
      </>
    )
  },
  {
    num: '04',
    icon: GraduationCap,
    iconStyle:
      'bg-emerald-500/12 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-300 ring-1 ring-emerald-500/25',
    content: (
      <>
        Akan mengikuti latihan dengan penuh minat, tekun dan berusaha sehingga{' '}
        <strong className="font-extrabold text-slate-900 dark:text-white">
          mencapai kejayaan selaras dengan wawasan negara dan slogan kampus iaitu:
        </strong>
      </>
    )
  }
];

export default function IkrarView({
  isAdmin,
  ikrarFile,
  ikrarFileDate,
  handleIkrarFileUpload,
  handleDeleteIkrarFile,
  setViewingMemo,
  handleDownloadBlob,
  navigateTo
}) {
  const isPdf = ikrarFile && ikrarFile.startsWith('data:application/pdf');
  const fileName = isPdf ? 'Lafaz_Ikrar_Pelajar_ADTEC.pdf' : 'Lafaz_Ikrar_Pelajar_ADTEC.jpg';

  return (
    <div className="px-4 lg:px-8 max-w-4xl mx-auto pb-32 pt-4">
      {/* Bar Navigasi Atas */}
      {navigateTo && (
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold
              bg-white/75 dark:bg-slate-900/60 backdrop-blur-xl
              border border-slate-200/80 dark:border-slate-800
              text-slate-700 dark:text-slate-300 hover:border-amber-400/60 transition-all shadow-sm"
          >
            <ArrowLeft size={15} />
            <span>Kembali ke Utama</span>
          </button>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
            <ShieldCheck size={13} />
            Dokumen Rasmi MSR
          </span>
        </div>
      )}

      {/* Header Tajuk Utama */}
      <div className="text-center mb-8 relative">
        <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-amber-500/12 dark:bg-amber-400/10 border border-amber-500/25 text-amber-600 dark:text-amber-300 mb-4 shadow-sm">
          <ScrollText size={34} strokeWidth={1.8} />
        </div>
        <p className="text-[11px] md:text-xs font-black tracking-[0.25em] text-slate-500 dark:text-slate-400 uppercase mb-2">
          ADTEC JTM Kampus Sandakan
        </p>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Lafaz{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500">
            Ikrar Pelajar
          </span>
        </h1>
      </div>

      {/* Panel Kawalan Dokumen Rasmi (Hanya muncul jika Admin ATAU jika fail rasmi memang wujud) */}
      {(isAdmin || ikrarFile) && (
        <div className="mb-7 rounded-2xl bg-white/75 dark:bg-slate-900/65 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/90 ring-1 ring-inset ring-white/80 dark:ring-white/[0.06] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="text-center sm:text-left">
            <p className="text-xs md:text-sm font-extrabold text-slate-800 dark:text-slate-100">
              {ikrarFile ? 'Salinan Dokumen Lafaz Ikrar Tersedia' : 'Panel Muat Naik Dokumen Ikrar (Admin)'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {ikrarFile
                ? 'Buka paparan penuh atau muat turun salinan rasmi ke peranti anda.'
                : 'Muat naik fail PDF, PNG atau JPG (disarankan saiz bawah 900KB).'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 shrink-0">
            {isAdmin && (
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all shadow-sm">
                <Upload size={14} className="text-amber-400" />
                <span>{ikrarFile ? 'Tukar Fail' : 'Muat Naik Fail'}</span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleIkrarFileUpload}
                  className="hidden"
                />
              </label>
            )}

            {ikrarFile && setViewingMemo && (
              <button
                type="button"
                onClick={() =>
                  setViewingMemo({
                    url: ikrarFile,
                    name: fileName,
                    type: isPdf ? 'pdf' : 'image',
                    uploadDate: ikrarFileDate
                  })
                }
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all"
              >
                <Eye size={15} />
                <span>Papar</span>
              </button>
            )}

            {ikrarFile && handleDownloadBlob && (
              <button
                type="button"
                onClick={() => handleDownloadBlob(ikrarFile, fileName)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-500/12 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 font-bold text-xs transition-all"
              >
                <Download size={14} />
                <span>Muat Turun</span>
              </button>
            )}

            {isAdmin && ikrarFile && handleDeleteIkrarFile && (
              <button
                type="button"
                onClick={handleDeleteIkrarFile}
                className="inline-flex items-center p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 transition-all"
                title="Padam dokumen ikrar"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Kad Utama Lafaz Ikrar — Liquid Glass 2026 */}
      <div className="relative rounded-[2.2rem] bg-white/80 dark:bg-slate-900/65 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/90 ring-1 ring-inset ring-white/80 dark:ring-white/[0.06] shadow-[0_16px_50px_-12px_rgba(15,23,42,0.08)] dark:shadow-[0_16px_50px_-12px_rgba(0,0,0,0.45)] overflow-hidden p-6 sm:p-8 md:p-12">
        {/* Latar Belakang Halus */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div
            className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05]"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }}
          />
          <div className="absolute -top-28 -right-28 w-72 h-72 bg-amber-500/15 dark:bg-amber-500/10 rounded-full blur-[90px]" />
          <div className="absolute -bottom-28 -left-28 w-72 h-72 bg-rose-500/10 dark:bg-cyan-500/10 rounded-full blur-[90px]" />
        </div>

        <div className="relative z-10">
          {/* Pembuka Lafaz */}
          <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
            <p className="text-sm sm:text-base md:text-lg font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
              Kami pelajar-pelajar{' '}
              <span className="font-black text-amber-600 dark:text-amber-400 underline decoration-amber-500/35 decoration-2 underline-offset-4">
                ADTEC JTM Kampus Sandakan
              </span>{' '}
              berikrar dan berjanji dengan sepenuh hati:
            </p>
          </div>

          {/* Senarai 4 Teras Ikrar */}
          <div className="space-y-4 md:space-y-5">
            {IKRAR_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.num}
                  className="flex items-start gap-3.5 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/45 border border-slate-200/70 dark:border-slate-800 transition-colors hover:border-amber-400/40"
                >
                  <div className={`shrink-0 p-3 rounded-xl ${item.iconStyle}`}>
                    <Icon size={20} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="inline-block text-[10px] font-black tracking-widest uppercase text-slate-400 dark:text-slate-500 mb-1">
                      Teras {item.num}
                    </span>
                    <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pemisah */}
          <div className="my-8 md:my-10 flex justify-center">
            <div className="w-2/3 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent" />
          </div>

          {/* Kotak Slogan Kampus */}
          <div className="text-center rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 p-6 md:p-8">
            <div className="inline-flex items-center justify-center gap-2 text-[10px] md:text-xs font-black tracking-[0.2em] text-amber-600 dark:text-amber-400 uppercase mb-3">
              <Star size={13} className="animate-pulse" />
              <span>Slogan Kampus</span>
              <Star size={13} className="animate-pulse" />
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
              &ldquo;Memperkasa Kemahiran, Menyemarakkan Masa Hadapan&rdquo;
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}