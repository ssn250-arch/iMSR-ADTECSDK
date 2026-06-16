import React from 'react';
import { CalendarClock, Plus, UploadCloud, FileText, Image as ImageIcon, Eye, Clock, ExternalLink, Download, Trash2 } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { formatTarikh, formatTime, formatDateTime } from '../../utils/helpers';

export default function JadualView({ isAdmin, jadualData, setJadualData, activeJadualTab, setActiveJadualTab, jadualFile, jadualFileDate, setJadualFile, handleJadualFileUpload, setViewingMemo, handleDownloadBlob, saveToFirebaseWithOffline }) {
  return (
    <div className="p-4 max-w-4xl mx-auto pb-32">
      <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-100 dark:bg-cyan-900/50 rounded-xl text-cyan-600 dark:text-cyan-400">
              <CalendarClock size={24} strokeWidth={2.5}/>
            </div>
            <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-800 dark:text-white">Tentatif Program</h3>
          </div>
          {isAdmin && (
            <button onClick={() => { const newId = 'd' + Date.now(); const today = new Date().toISOString().split('T')[0]; const updated = [...jadualData, { id: newId, tarikh: today, slots: [] }]; setJadualData(updated); setActiveJadualTab(newId); saveToFirebaseWithOffline({ jadualData: updated, latestUpdate: { view: 'jadual', text: 'Jadual Tentatif Program telah dikemas kini.' } }); }} className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-xl font-bold text-xs transition-colors active:scale-95 shadow-sm flex items-center gap-1.5"><Plus size={14}/> <span className="hidden sm:inline">Tambah Hari</span></button>
          )}
        </div>

        {isAdmin && !jadualFile && (
          <div className="mb-6 p-6 border-2 border-dashed border-cyan-200 dark:border-cyan-800/50 rounded-2xl bg-cyan-50/50 dark:bg-cyan-900/10 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors">
            <label className="cursor-pointer flex flex-col items-center">
              <UploadCloud size={32} className="text-cyan-500 mb-2 animate-pulse" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Muat Naik Fail Tentatif Penuh</span>
              <span className="text-[10px] font-medium text-slate-500 mt-1 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md shadow-sm">Sokongan: PDF / Imej</span>
              <input type="file" accept="application/pdf, image/*" className="hidden" onChange={handleJadualFileUpload} />
            </label>
          </div>
        )}

        {jadualFile && (
          <div className="mb-6 w-full flex flex-col gap-4">
            <div className="block sm:hidden w-full bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center gap-4">
               {jadualFile.includes('application/pdf') ? <FileText size={48} className="text-cyan-500" /> : (
                 <div className="w-full relative cursor-pointer group overflow-hidden rounded-xl h-48 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center" onClick={() => setViewingMemo({ url: jadualFile, name: "Tentatif_Penuh", type: "image", uploadDate: jadualFileDate })}>
                   <img src={jadualFile} alt="Thumbnail Tentatif" className="w-full h-full object-cover group-active:scale-105 transition-transform duration-300" />
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-active:opacity-100 transition-opacity"><span className="text-white text-xs font-bold flex items-center gap-1"><Eye size={16}/> Lihat Penuh</span></div>
                 </div>
               )}
               <div className="space-y-1 text-center w-full mt-2">
                 <p className="text-sm font-black text-slate-800 dark:text-slate-200">Jadual Keseluruhan Program</p>
                 <div className="flex flex-col items-center gap-1.5"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{jadualFile.includes('application/pdf') ? 'Format PDF' : 'Format Imej'}</p>{jadualFileDate && <p className="text-[9px] font-bold text-slate-400"><Clock size={10} className="inline mr-1"/>{formatDateTime(jadualFileDate)}</p>}</div>
               </div>
               <div className="flex w-full gap-2 mt-1">
                 <button onClick={() => setViewingMemo({ url: jadualFile, name: "Tentatif_Penuh", type: jadualFile.includes('application/pdf') ? 'pdf' : 'image', uploadDate: jadualFileDate })} className="flex-1 inline-flex items-center justify-center gap-2 text-xs font-bold text-cyan-700 bg-cyan-100 hover:bg-cyan-200 dark:bg-cyan-900/40 dark:text-cyan-300 dark:hover:bg-cyan-800/60 px-2 py-3 rounded-xl shadow-sm transition-all active:scale-95"><ExternalLink size={16} /> Lihat</button>
                 <button onClick={() => handleDownloadBlob(jadualFile, jadualFile.includes('application/pdf') ? 'Tentatif_Program.pdf' : 'Tentatif_Program.jpg')} className="flex-[2] inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2 py-3 rounded-xl shadow-md transition-all active:scale-95"><Download size={16} /> Muat Turun</button>
               </div>
               {isAdmin && <button onClick={async () => { if(window.confirm("Padam fail tentatif ini?")) { setJadualFile(null); try { await setDoc(doc(db, "msr", "data_jadual_file"), { fileData: null, uploadDate: null }); saveToFirebaseWithOffline({ latestUpdate: { view: 'jadual', text: 'Fail Tentatif Program penuh telah dipadam.' } }); } catch(err){} } }} className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 px-4 py-3 rounded-xl transition-all active:scale-95"><Trash2 size={16} /> Padam Rekod</button>}
            </div>
            
            <div className="hidden sm:flex p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex-row items-center justify-between gap-4">
               <div className="flex items-center gap-3 w-full">
                  <div className="p-2.5 bg-cyan-100 dark:bg-cyan-900/40 rounded-xl cursor-pointer hover:scale-105 transition-transform" onClick={() => setViewingMemo({ url: jadualFile, name: "Tentatif_Penuh", type: jadualFile.includes('application/pdf') ? 'pdf' : 'image', uploadDate: jadualFileDate })}>
                     {jadualFile.includes('application/pdf') ? <FileText size={24} className="text-cyan-600 dark:text-cyan-400" /> : <ImageIcon size={24} className="text-cyan-600 dark:text-cyan-400" />}
                  </div>
                  <div>
                     <p className="text-sm font-bold text-slate-800 dark:text-slate-200 cursor-pointer hover:underline" onClick={() => setViewingMemo({ url: jadualFile, name: "Tentatif_Penuh", type: jadualFile.includes('application/pdf') ? 'pdf' : 'image', uploadDate: jadualFileDate })}>Jadual Keseluruhan Program</p>
                     {jadualFileDate && <p className="text-[9px] font-bold text-slate-500 mt-0.5"><Clock size={10} className="inline mr-1"/>{formatDateTime(jadualFileDate)}</p>}
                  </div>
               </div>
               <div className="flex items-center gap-2 w-auto justify-end">
                  <button onClick={() => setViewingMemo({ url: jadualFile, name: "Tentatif_Penuh", type: jadualFile.includes('application/pdf') ? 'pdf' : 'image', uploadDate: jadualFileDate })} className="flex-none flex items-center justify-center gap-1.5 text-[11px] font-bold text-cyan-700 bg-cyan-100 hover:bg-cyan-200 dark:bg-cyan-900/40 dark:text-cyan-300 dark:hover:bg-cyan-800/60 px-4 py-2 rounded-xl transition-all active:scale-95"><ExternalLink size={14}/> Lihat</button>
                  <button onClick={() => handleDownloadBlob(jadualFile, jadualFile.includes('application/pdf') ? 'Tentatif_Program.pdf' : 'Tentatif_Program.jpg')} className="flex-none flex items-center justify-center gap-1.5 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl transition-all active:scale-95 shadow-sm"><Download size={14}/> Muat Turun</button>
                  {isAdmin && <button onClick={async () => { if(window.confirm("Padam fail tentatif ini?")) { setJadualFile(null); try { await setDoc(doc(db, "msr", "data_jadual_file"), { fileData: null, uploadDate: null }); saveToFirebaseWithOffline({ latestUpdate: { view: 'jadual', text: 'Fail Tentatif Program penuh telah dipadam.' } }); } catch(err){} } }} className="text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 p-2 rounded-xl transition-colors shrink-0 active:scale-90"><Trash2 size={16}/></button>}
               </div>
            </div>
          </div>
        )}
        
        <div className="flex gap-2.5 overflow-x-auto pb-3 mb-6 border-b border-slate-100 dark:border-slate-700 hide-scrollbar snap-x">
          {jadualData.map((hari) => (
            <button key={hari.id} onClick={() => setActiveJadualTab(hari.id)} className={`snap-start px-5 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all duration-300 ${activeJadualTab === hari.id ? 'bg-cyan-500 text-white shadow-md scale-105' : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-cyan-50 dark:hover:bg-slate-800'}`}>
               {formatTarikh(hari.tarikh)}
            </button>
          ))}
        </div>
        
         {jadualData.map((hari) => {
          if (hari.id !== activeJadualTab) return null;
          return (
            <div key={hari.id} className="space-y-5 animate-in slide-in-from-right-4 duration-500 ease-out">
              {isAdmin && (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-wrap gap-3 items-center shadow-sm">
                  <div className="flex-1 min-w-[150px]">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Tarikh Hari Ini</label>
                    <input type="date" value={hari.tarikh} onChange={e => { const updated = jadualData.map(d => d.id === hari.id ? { ...d, tarikh: e.target.value } : d); setJadualData(updated); saveToFirebaseWithOffline({ jadualData: updated }); }} className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 transition-colors focus:ring-2 focus:ring-cyan-500 outline-none" />
                  </div>
                   <button onClick={() => { const updated = jadualData.map(d => d.id === hari.id ? { ...d, slots: [...d.slots, { id: 's' + Date.now(), startTime: "08:00", endTime: "09:00", aktiviti: "Aktiviti Baru" }] } : d); setJadualData(updated); saveToFirebaseWithOffline({ jadualData: updated }); }} className="bg-cyan-100 hover:bg-cyan-200 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 px-4 py-2.5 rounded-lg text-xs font-bold transition-colors mt-4 shadow-sm flex items-center gap-1.5"><Plus size={14}/> Tambah Slot</button>
                  <button onClick={() => { if(window.confirm("Padam keseluruhan jadual hari ini?")) { const updated = jadualData.filter(h => h.id !== hari.id); setJadualData(updated); if(updated.length > 0) setActiveJadualTab(updated[0].id); saveToFirebaseWithOffline({ jadualData: updated }); } }} className="text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors mt-4 ml-auto flex items-center gap-1.5 shadow-sm"><Trash2 size={14}/> Padam</button>
                </div>
              )}
              
              {(!hari.slots || hari.slots.length === 0) ? (
                <div className="text-center py-10 text-slate-400 font-medium bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700">
                  <CalendarClock size={40} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-bold text-slate-500">Tiada aktiviti dijadualkan.</p>
                </div>
              ) : (
                <div className="relative border-l-[3px] border-cyan-200 dark:border-cyan-800/50 ml-3 md:ml-6 space-y-6 mt-6">
                  {hari.slots.map((slot) => (
                    <div key={slot.id} className="relative pl-6 md:pl-8 group">
                      <div className="absolute -left-[11px] top-4 h-5 w-5 rounded-full border-[4px] border-white dark:border-slate-800 bg-cyan-500 shadow-sm z-10 group-hover:scale-125 transition-transform duration-300"></div>
                      
                      {isAdmin ? (
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-[1.5rem] border border-slate-200 dark:border-slate-700 relative shadow-sm transition-shadow">
                          <button onClick={() => { const updated = jadualData.map(d => d.id === hari.id ? { ...d, slots: d.slots.filter(s => s.id !== slot.id) } : d); setJadualData(updated); saveToFirebaseWithOffline({ jadualData: updated }); }} className="absolute top-4 right-4 text-red-400 hover:text-red-600 bg-red-50 dark:bg-red-900/20 p-1.5 rounded-lg transition-colors"><Trash2 size={16}/></button>
                          <div className="flex gap-3 mb-3 pr-10">
                            <div className="flex-1">
                              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Mula</label>
                              <input type="time" value={slot.startTime} onChange={e => { const updated = jadualData.map(d => d.id === hari.id ? { ...d, slots: d.slots.map(s => s.id === slot.id ? { ...s, startTime: e.target.value } : s) } : d); setJadualData(updated); }} onBlur={() => saveToFirebaseWithOffline({ jadualData })} className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-xs font-black text-cyan-600 dark:text-cyan-400 bg-white dark:bg-slate-800 transition-colors focus:ring-2 focus:ring-cyan-500 outline-none" />
                            </div>
                            <div className="flex-1">
                              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Tamat</label>
                              <input type="time" value={slot.endTime} onChange={e => { const updated = jadualData.map(d => d.id === hari.id ? { ...d, slots: d.slots.map(s => s.id === slot.id ? { ...s, endTime: e.target.value } : s) } : d); setJadualData(updated); }} onBlur={() => saveToFirebaseWithOffline({ jadualData })} className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-xs font-black text-cyan-600 dark:text-cyan-400 bg-white dark:bg-slate-800 transition-colors focus:ring-2 focus:ring-cyan-500 outline-none" />
                            </div>
                          </div>
                          <textarea value={slot.aktiviti} onChange={e => { const updated = jadualData.map(d => d.id === hari.id ? { ...d, slots: d.slots.map(s => s.id === slot.id ? { ...s, aktiviti: e.target.value } : s) } : d); setJadualData(updated); }} onBlur={() => saveToFirebaseWithOffline({ jadualData })} className="w-full border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-white transition-colors outline-none focus:ring-2 focus:ring-cyan-500 custom-scrollbar" rows={2} placeholder="Keterangan Aktiviti..." />
                        </div>
                      ) : (
                        <div className="bg-white dark:bg-slate-800/80 p-4 md:p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[10px] md:text-xs font-black tracking-wider shadow-sm mb-2">
                            <Clock size={12}/> {formatTime(slot.startTime)} {slot.endTime && <span><span className="opacity-60 mx-1">➜</span> {formatTime(slot.endTime)}</span>}
                          </div>
                          <h4 className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 leading-snug">{slot.aktiviti}</h4>
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
  );
}