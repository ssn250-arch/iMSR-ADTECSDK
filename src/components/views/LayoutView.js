import React from 'react';
import { MapPinned, UploadCloud, FileText, Image as ImageIcon, Eye, Clock, ExternalLink, Download, Trash2 } from 'lucide-react';
import { formatDateTime } from '../../utils/helpers';

export default function LayoutView({ isAdmin, layoutList, handleLayoutUpload, handleDeleteLayout, setViewingMemo, handleDownloadBlob }) {
  return (
    <div className="p-4 max-w-4xl mx-auto pb-32 text-center">
      <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700 p-6 md:p-10 shadow-xl text-center">
        <div className="bg-sky-100 dark:bg-sky-900/50 w-16 h-16 md:w-20 md:h-20 mx-auto rounded-[1.5rem] flex items-center justify-center mb-5 transform rotate-3 shadow-inner border border-sky-200 dark:border-sky-800/50">
          <MapPinned size={36} className="text-sky-600 dark:text-sky-400 -rotate-3" />
        </div>
        <h3 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Pelan Pendaftaran</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm md:text-base font-medium">Panduan susun atur dewan bagi melancarkan pergerakan.</p>
        
        {isAdmin && (
          <div className="mb-6 p-6 border-2 border-dashed border-sky-200 dark:border-sky-800/50 rounded-2xl bg-sky-50/50 dark:bg-sky-900/10 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors">
            <label className="cursor-pointer flex flex-col items-center">
              <UploadCloud size={32} className="text-sky-500 mb-2 animate-pulse" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Muat Naik Fail Pelan Baharu</span>
              <span className="text-[10px] font-medium text-slate-500 mt-1 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md shadow-sm">Sokongan: PDF / Imej</span>
              <input type="file" accept="application/pdf, image/*" className="hidden" onChange={handleLayoutUpload} aria-label="Muat naik pelan" />
            </label>
          </div>
        )}

        {layoutList.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-[1.5rem] min-h-[200px] flex flex-col items-center justify-center p-4">
            <ImageIcon size={48} className="text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm font-bold text-slate-500">Tiada fail pelan dimuat naik.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 mt-6 w-full text-left">
            {layoutList.map(layout => (
              <div key={layout.id} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col group hover:shadow-md transition-all">
                 <div className="w-full relative cursor-pointer overflow-hidden rounded-xl h-48 mb-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 flex items-center justify-center" onClick={() => setViewingMemo({ url: layout.url, name: layout.name, type: layout.type, uploadDate: layout.uploadDate })}>
                    {layout.type === 'pdf' ? <FileText size={64} className="text-sky-500 opacity-80 group-hover:scale-110 transition-transform duration-300" /> : <img src={layout.url} alt={layout.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"><span className="text-white text-sm font-bold flex items-center gap-2"><Eye size={18}/> Lihat Penuh</span></div>
                 </div>
                 <div className="flex-1 px-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1" title={layout.name}>{layout.name}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[9px] font-black text-sky-600 bg-sky-100 dark:text-sky-300 dark:bg-sky-900/40 px-1.5 py-0.5 rounded uppercase">{layout.type === 'pdf' ? 'PDF' : 'IMEJ'}</span>
                      {layout.uploadDate && <span className="text-[9px] font-bold text-slate-500"><Clock size={10} className="inline mr-1"/>{formatDateTime(layout.uploadDate)}</span>}
                    </div>
                 </div>
                 <div className="flex w-full gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/50">
                    <button onClick={() => setViewingMemo({ url: layout.url, name: layout.name, type: layout.type, uploadDate: layout.uploadDate })} className="flex-1 inline-flex items-center justify-center gap-1.5 text-[11px] font-bold text-sky-700 bg-sky-100 hover:bg-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:hover:bg-sky-800/60 px-2 py-2.5 rounded-xl transition-all active:scale-95"><ExternalLink size={14}/> Lihat</button>
                    <button onClick={() => handleDownloadBlob(layout.url, layout.name)} className="flex-[1.5] inline-flex items-center justify-center gap-1.5 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2 py-2.5 rounded-xl shadow-sm transition-all active:scale-95"><Download size={14}/> Muat Turun</button>
                    {isAdmin && <button onClick={() => handleDeleteLayout(layout.id)} className="bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 p-2.5 rounded-xl transition-colors active:scale-90" aria-label="Padam pelan"><Trash2 size={16}/></button>}
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}