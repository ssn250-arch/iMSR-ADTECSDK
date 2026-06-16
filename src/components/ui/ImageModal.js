import React from 'react';
import { FileText, Download, X } from 'lucide-react';
import { formatDateTime } from '../../utils/helpers'; // Pastikan path ini tepat dengan kedudukan fail helpers.js

export default function ImageModal({ viewingMemo, setViewingMemo, blobUrl, handleDownloadBlob }) {
  if (!viewingMemo) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex flex-col animate-in fade-in zoom-in-[0.98] duration-300">
      {/* Header Modal */}
      <div className="flex justify-between items-center p-3 md:p-4 bg-[#020817] border-b border-slate-800 text-white shadow-lg z-10">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="bg-cyan-500/20 p-2 rounded-lg text-cyan-400 shrink-0">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm md:text-base truncate max-w-[180px] md:max-w-xl">{viewingMemo.name}</h3>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">
                {viewingMemo.type === 'pdf' ? 'Dokumen PDF' : 'Fail Imej'}
              </span>
              {viewingMemo.uploadDate && (
                <span className="text-[9px] font-bold text-slate-500">| {formatDateTime(viewingMemo.uploadDate)}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <button 
            onClick={() => handleDownloadBlob(viewingMemo.url, viewingMemo.name)} 
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold text-xs transition-colors shadow-sm active:scale-95"
            title="Muat Turun Dokumen"
            aria-label="Muat turun dokumen"
          >
            <Download size={16} /> Muat Turun
          </button>
          <button 
            onClick={() => setViewingMemo(null)} 
            className="p-2 bg-slate-800 hover:bg-red-500 hover:text-white text-slate-300 rounded-lg transition-all shadow-sm active:scale-90 ml-1"
            title="Tutup Paparan"
            aria-label="Tutup paparan dokumen"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      
      {/* Kandungan Imej/PDF */}
      <div className="flex-1 w-full h-full p-4 md:p-6 overflow-hidden flex justify-center items-center">
        {blobUrl ? (
          viewingMemo.type === 'pdf' ? (
            <iframe src={blobUrl} className="w-full h-full bg-white rounded-xl shadow-2xl border border-slate-700" title={viewingMemo.name} />
          ) : (
            <img src={blobUrl} alt={viewingMemo.name} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-slate-700 bg-slate-800" />
          )
        ) : (
          <div className="flex flex-col items-center gap-3 text-white animate-pulse">
            <div className="w-10 h-10 border-[3px] border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-bold tracking-widest uppercase text-[10px] text-slate-400">Memproses Dokumen...</span>
          </div>
        )}
      </div>
    </div>
  );
}