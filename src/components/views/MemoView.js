import React from 'react';
import { FileSignature, UploadCloud, FileText, Clock, ExternalLink, Download, Trash2, Edit3 } from 'lucide-react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { formatDateTime } from '../../utils/helpers';

export default function MemoView({ isAdmin, memoList, handleDocumentUpload, setViewingMemo, handleDownloadBlob, memoText, setMemoText, saveToFirebaseWithOffline }) {
  return (
    <div className="p-4 max-w-4xl mx-auto pb-32 space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700 p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-blue-100 dark:bg-blue-900/50 rounded-xl text-blue-600 dark:text-blue-400">
            <FileSignature size={24} strokeWidth={2.5}/>
          </div>
          <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-800 dark:text-white">Dokumen & Surat</h3>
        </div>

        {isAdmin && (
          <div className="mb-6 p-6 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-2xl text-center bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            <label className="cursor-pointer flex flex-col items-center">
              <UploadCloud size={32} className="text-blue-500 mb-2 animate-pulse" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Muat Naik Fail Memo Baharu</span>
              <span className="text-[10px] font-medium text-slate-500 mt-1.5 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">Sokongan: PDF / Imej</span>
              <input type="file" accept="application/pdf, image/*" className="hidden" onChange={handleDocumentUpload} aria-label="Muat naik fail memo" />
            </label>
          </div>
        )}

        {memoList.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-[1.5rem] border border-slate-100 dark:border-slate-800">
            <FileSignature size={48} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
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
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="text-[9px] font-black text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/40 px-1.5 py-0.5 rounded uppercase tracking-wider">{memo.type === 'pdf' ? 'Dokumen PDF' : 'Fail Imej'}</span>
                        {memo.uploadDate && (
                          <span className="text-[9px] font-bold text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm"><Clock size={10}/> {formatDateTime(memo.uploadDate)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0 pt-2 sm:pt-0">
                    <button onClick={() => setViewingMemo(memo)} className="hidden sm:inline-flex items-center justify-center gap-1.5 text-[11px] font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-800/60 px-4 py-2 rounded-xl transition-all active:scale-95"><ExternalLink size={14} /> Lihat</button>
                    <button onClick={() => handleDownloadBlob(memo.url, memo.name)} className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl transition-all active:scale-95 shadow-md"><Download size={14} /> Muat Turun</button>
                    {isAdmin && (
                      <button onClick={async () => { if(window.confirm("Adakah anda pasti mahu memadam dokumen ini?")) { try { await deleteDoc(doc(db, "msr_memos", memo.id)); saveToFirebaseWithOffline({ latestUpdate: { view: 'memo', text: `Satu dokumen memo telah dipadam.` } }); } catch(err) { alert("Gagal memadam dokumen."); } } }} className="text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 p-2 rounded-xl transition-colors shrink-0 active:scale-90"><Trash2 size={16}/></button>
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
            <textarea value={memoText} onChange={e => setMemoText(e.target.value)} onBlur={() => saveToFirebaseWithOffline({ memoText, latestUpdate: { view: 'memo', text: 'Teks rasmi dokumen memo telah dikemas kini.' } })} className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:border-cyan-500 outline-none transition-colors leading-relaxed" rows={6} aria-label="Teks manual memo"/>
          </div>
        )}
      </div>
    </div>
  );
}