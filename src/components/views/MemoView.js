import React from 'react';
import { FileText, UploadCloud, ExternalLink, Download, Trash2, Clock, Save } from 'lucide-react';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

export default function MemoView({
  isAdmin,
  memoList = [],
  handleDocumentUpload,
  handleDeleteMemo,
  setViewingMemo,
  handleDownloadBlob,
  memoText,
  setMemoText,
  saveToFirebaseWithOffline
}) {
  const formatDate = (isoStr) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) + ` (${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })})`;
    } catch {
      return '';
    }
  };

  const onRemoveMemo = async (memo) => {
    if (handleDeleteMemo) {
      await handleDeleteMemo(memo);
      return;
    }
    if (window.confirm(`Padam dokumen "${memo.name}"?`)) {
      await deleteDoc(doc(db, 'msr_memos', memo.id));
      saveToFirebaseWithOffline({
        latestUpdate: { view: 'memo', text: 'Satu dokumen memo telah dipadam.' }
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28 space-y-6">
      {/* KAD DOKUMEN & SURAT */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <FileText size={22} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Dokumen &amp; Surat
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Senarai surat lantikan, memo dalaman dan rujukan rasmi MSR
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className="mb-6 border-2 border-dashed border-blue-200 dark:border-blue-800/60 bg-blue-50/50 dark:bg-slate-800/40 hover:bg-blue-50 dark:hover:bg-slate-800/70 transition-colors rounded-2xl p-6 text-center">
            <label className="cursor-pointer flex flex-col items-center">
              <UploadCloud size={32} className="text-blue-500 mb-2" />
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Muat Naik Fail Memo Baharu (Boleh Pilih Banyak)
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1.5 bg-white dark:bg-slate-800 px-3 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                Sokongan: PDF (~750KB/fail) / Imej (Auto-Mampat)
              </span>
              <input
                type="file"
                multiple
                accept="application/pdf,image/*"
                className="hidden"
                onChange={handleDocumentUpload}
                aria-label="Muat naik fail memo"
              />
            </label>
          </div>
        )}

        {memoList.length === 0 ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-sm font-medium">
            Tiada dokumen atau surat dimuat naik bagi sesi ini.
          </div>
        ) : (
          <div className="space-y-3">
            {memoList.map((memo, idx) => (
              <div
                key={memo.id || idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-extrabold flex items-center justify-center shrink-0 shadow-sm">
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {memo.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        {memo.type === 'pdf' ? 'DOKUMEN PDF' : 'IMEJ'}
                      </span>
                      {memo.uploadDate && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <Clock size={11} />
                          {formatDate(memo.uploadDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewingMemo(memo)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 border border-blue-200/60 dark:border-blue-800 transition"
                  >
                    <ExternalLink size={13} />
                    Lihat
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadBlob(memo.url, memo.name)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm transition"
                  >
                    <Download size={13} />
                    Muat Turun
                  </button>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => onRemoveMemo(memo)}
                      className="text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 p-2 rounded-xl transition-colors shrink-0 active:scale-90"
                      aria-label="Padam dokumen"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CATATAN / NOTA MEMO TAMBAHAN */}
      {(isAdmin || (memoText && memoText.trim() !== '')) && (
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xl">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-3">
            Catatan &amp; Makluman Rasmi
          </h3>
          {isAdmin ? (
            <div className="space-y-3">
              <textarea
                rows={4}
                value={memoText}
                onChange={(e) => setMemoText(e.target.value)}
                placeholder="Tulis catatan tambahan atau rujukan surat di sini..."
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() =>
                  saveToFirebaseWithOffline({
                    memoText,
                    latestUpdate: { view: 'memo', text: 'Catatan dokumen dikemas kini.' }
                  })
                }
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition"
              >
                <Save size={14} />
                Simpan Catatan
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
              {memoText}
            </p>
          )}
        </div>
      )}
    </div>
  );
}