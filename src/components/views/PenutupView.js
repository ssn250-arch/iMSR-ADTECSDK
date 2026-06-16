import React from 'react';
import { GraduationCap, Plus, UploadCloud, FileText, Image as ImageIcon, Eye, Clock, ExternalLink, Download, Trash2, Award } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { formatTime, formatDateTime } from '../../utils/helpers';

export default function PenutupView({ isAdmin, penutupData, setPenutupData, penutupFile, penutupFileDate, setPenutupFile, handlePenutupFileUpload, setViewingMemo, handleDownloadBlob, saveToFirebaseWithOffline }) {
  return (
    <div className="p-4 max-w-4xl mx-auto pb-32">
      <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl text-indigo-600 dark:text-indigo-400">
              <GraduationCap size={24} strokeWidth={2.5}/>
            </div>
            <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-800 dark:text-white">Majlis Penutup</h3>
          </div>
          {isAdmin && (
            <button onClick={() => { const updated = [...penutupData, { id: 'p' + Date.now(), time: "08:00", aktiviti: "Aktiviti Baru" }]; setPenutupData(updated); saveToFirebaseWithOffline({ penutupData: updated }); }} className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-xs transition-colors active:scale-95 shadow-sm flex items-center gap-1.5"><Plus size={14}/> <span className="hidden sm:inline">Tambah Slot</span></button>
          )}
        </div>

        {isAdmin && !penutupFile && (
          <div className="mb-6 p-6 border-2 border-dashed border-indigo-200 dark:border-indigo-800/50 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
            <label className="cursor-pointer flex flex-col items-center">
              <UploadCloud size={32} className="text-indigo-500 mb-2 animate-pulse" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Muat Naik Fail Majlis Penutup</span>
              <span className="text-[10px] font-medium text-slate-500 mt-1 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md shadow-sm">Sokongan: PDF / Imej</span>
              <input type="file" accept="application/pdf, image/*" className="hidden" onChange={handlePenutupFileUpload} />
            </label>
          </div>
        )}

        {penutupFile && (
          <div className="mb-6 w-full flex flex-col gap-4">
            <div className="block sm:hidden w-full bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center gap-4">
               {penutupFile.includes('application/pdf') ? <FileText size={48} className="text-rose-500" /> : (
                 <div className="w-full relative cursor-pointer group overflow-hidden rounded-xl h-48 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center" onClick={() => setViewingMemo({ url: penutupFile, name: "Majlis_Penutup", type: "image", uploadDate: penutupFileDate })}>
                   <img src={penutupFile} alt="Thumbnail Majlis Penutup" className="w-full h-full object-cover group-active:scale-105 transition-transform duration-300" />
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-active:opacity-100 transition-opacity"><span className="text-white text-xs font-bold flex items-center gap-1"><Eye size={16}/> Lihat Penuh</span></div>
                 </div>
               )}
               <div className="space-y-1 text-center w-full mt-2">
                 <p className="text-sm font-black text-slate-800 dark:text-slate-200">Dokumen Atur Cara Majlis Penutup</p>
                 <div className="flex flex-col items-center gap-1.5"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{penutupFile.includes('application/pdf') ? 'Format PDF' : 'Format Imej'}</p>{penutupFileDate && <p className="text-[9px] font-bold text-slate-400"><Clock size={10} className="inline mr-1"/>{formatDateTime(penutupFileDate)}</p>}</div>
               </div>
               <div className="flex w-full gap-2 mt-1">
                 <button onClick={() => setViewingMemo({ url: penutupFile, name: "Majlis_Penutup", type: penutupFile.includes('application/pdf') ? 'pdf' : 'image', uploadDate: penutupFileDate })} className="flex-1 inline-flex items-center justify-center gap-2 text-xs font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-800/60 px-2 py-3 rounded-xl shadow-sm transition-all active:scale-95"><ExternalLink size={16} /> Lihat</button>
                 <button onClick={() => handleDownloadBlob(penutupFile, penutupFile.includes('application/pdf') ? 'Majlis_Penutup.pdf' : 'Majlis_Penutup.jpg')} className="flex-[2] inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2 py-3 rounded-xl shadow-md transition-all active:scale-95"><Download size={16} /> Muat Turun</button>
               </div>
               {isAdmin && <button onClick={async () => { if(window.confirm("Padam fail penutup ini?")) { setPenutupFile(null); try { await setDoc(doc(db, "msr", "data_penutup_file"), { fileData: null, uploadDate: null }); saveToFirebaseWithOffline({ latestUpdate: { view: 'penutup', text: 'Fail Majlis Penutup penuh telah dipadam.' } }); } catch(err){} } }} className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 px-4 py-3 rounded-xl transition-all active:scale-95"><Trash2 size={16} /> Padam Rekod</button>}
            </div>
            <div className="hidden sm:flex p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex-row items-center justify-between gap-4">
               <div className="flex items-center gap-3 w-full">
                  <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl cursor-pointer hover:scale-105 transition-transform" onClick={() => setViewingMemo({ url: penutupFile, name: "Majlis_Penutup", type: penutupFile.includes('application/pdf') ? 'pdf' : 'image', uploadDate: penutupFileDate })}>
                     {penutupFile.includes('application/pdf') ? <FileText size={24} className="text-indigo-600 dark:text-indigo-400" /> : <ImageIcon size={24} className="text-indigo-600 dark:text-indigo-400" />}
                  </div>
                  <div>
                     <p className="text-sm font-bold text-slate-800 dark:text-slate-200 cursor-pointer hover:underline" onClick={() => setViewingMemo({ url: penutupFile, name: "Majlis_Penutup", type: penutupFile.includes('application/pdf') ? 'pdf' : 'image', uploadDate: penutupFileDate })}>Dokumen Atur Cara Majlis Penutup</p>
                     {penutupFileDate && <p className="text-[9px] font-bold text-slate-500 mt-0.5"><Clock size={10} className="inline mr-1"/>{formatDateTime(penutupFileDate)}</p>}
                  </div>
               </div>
               <div className="flex items-center gap-2 w-auto justify-end">
                  <button onClick={() => setViewingMemo({ url: penutupFile, name: "Majlis_Penutup", type: penutupFile.includes('application/pdf') ? 'pdf' : 'image', uploadDate: penutupFileDate })} className="flex-none flex items-center justify-center gap-1.5 text-[11px] font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-800/60 px-4 py-2 rounded-xl transition-all active:scale-95"><ExternalLink size={14}/> Lihat</button>
                  <button onClick={() => handleDownloadBlob(penutupFile, penutupFile.includes('application/pdf') ? 'Majlis_Penutup.pdf' : 'Majlis_Penutup.jpg')} className="flex-none flex items-center justify-center gap-1.5 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl transition-all active:scale-95 shadow-sm"><Download size={14}/> Muat Turun</button>
                  {isAdmin && <button onClick={async () => { if(window.confirm("Padam fail penutup ini?")) { setPenutupFile(null); try { await setDoc(doc(db, "msr", "data_penutup_file"), { fileData: null, uploadDate: null }); saveToFirebaseWithOffline({ latestUpdate: { view: 'penutup', text: 'Fail Majlis Penutup penuh telah dipadam.' } }); } catch(err){} } }} className="text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 p-2 rounded-xl transition-colors shrink-0 active:scale-90"><Trash2 size={16}/></button>}
               </div>
            </div>
          </div>
        )}
        
        {(!penutupData || penutupData.length === 0) ? (
          <div className="text-center py-12 text-slate-400 font-medium bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700">
            <GraduationCap size={40} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm font-bold text-slate-500">Tiada atur cara majlis buat masa ini.</p>
          </div>
        ) : (
          <div className="relative border-l-[3px] border-indigo-200 dark:border-indigo-800/50 ml-3 md:ml-6 space-y-5 mt-6">
            {penutupData.map((slot) => (
              <div key={slot.id} className="relative pl-6 md:pl-8 group">
                <div className="absolute -left-[11px] top-4 h-5 w-5 rounded-full border-[4px] border-white dark:border-slate-800 bg-indigo-500 shadow-md z-10 group-hover:scale-125 transition-transform duration-300"></div>
                {isAdmin ? (
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 relative shadow-sm transition-shadow">
                    <button onClick={() => { const updated = penutupData.filter(s => s.id !== slot.id); setPenutupData(updated); saveToFirebaseWithOffline({ penutupData: updated }); }} className="absolute top-4 right-4 text-red-400 hover:text-red-600 bg-red-50 dark:bg-red-900/20 p-1.5 rounded-lg transition-colors"><Trash2 size={16}/></button>
                    <div className="mb-3 pr-10 w-1/2">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Masa</label>
                      <input type="time" value={slot.time} onChange={e => { const updated = penutupData.map(s => s.id === slot.id ? { ...s, time: e.target.value } : s); setPenutupData(updated); }} onBlur={() => saveToFirebaseWithOffline({ penutupData })} className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-xs font-black text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 transition-colors focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <textarea value={slot.aktiviti} onChange={e => { const updated = penutupData.map(s => s.id === slot.id ? { ...s, aktiviti: e.target.value } : s); setPenutupData(updated); }} onBlur={() => saveToFirebaseWithOffline({ penutupData })} className="w-full border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-white transition-colors outline-none focus:ring-2 focus:ring-indigo-500 custom-scrollbar" rows={2} placeholder="Keterangan Aktiviti..." />
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] md:text-xs font-black tracking-wider shadow-sm mb-2">
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
  );
}