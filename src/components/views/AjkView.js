import React, { useState } from 'react';
import { UserCog, Plus, X, Trash2, ChevronDown } from 'lucide-react';

const AccordionBiro = ({ biro, isOpen, onToggle }) => {
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl mb-3 overflow-hidden bg-white dark:bg-slate-800 shadow-sm transition-all duration-300">
      <button className="w-full px-4 py-3 text-left flex justify-between items-center bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors" onClick={onToggle}>
       <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{biro.nama}</span>
        <ChevronDown className={`text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-cyan-500' : ''}`} size={18} />
      </button>
      {isOpen && (
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="mb-3">
            <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider bg-cyan-50 dark:bg-cyan-900/30 px-2 py-0.5 rounded">Ketua Biro</span>
            <p className="text-slate-900 dark:text-slate-200 font-bold text-sm mt-1.5 ml-1">{biro.ketua}</p>
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">Ahli Jawatankuasa</span>
            <ul className="list-disc pl-5 mt-1.5 space-y-1">
              {biro.ahli && biro.ahli.map((ahli, idx) => (
                <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 font-medium">{ahli}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default function AjkView({ isAdmin, ajkInduk, setAjkInduk, biroList, setBiroList, saveToFirebaseWithOffline }) {
  const [openBiroIndex, setOpenBiroIndex] = useState(null);

  return (
    <div className="p-4 max-w-4xl mx-auto pb-32 space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700 p-6 shadow-xl mb-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl text-emerald-600 dark:text-emerald-400">
              <UserCog size={24} strokeWidth={2.5}/>
            </div>
            <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-800 dark:text-white">Jawatankuasa Induk</h3>
          </div>
          {isAdmin && (
            <button onClick={() => { const newAjk = [...ajkInduk, { peranan: "Peranan Baru", nama: "Nama Baru" }]; setAjkInduk(newAjk); saveToFirebaseWithOffline({ ajkInduk: newAjk, latestUpdate: { view: 'ajk', text: 'Senarai Jawatankuasa Induk MSR telah dikemas kini.' } }); }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-xs transition-colors active:scale-95 shadow-sm flex items-center gap-1.5"><Plus size={14}/> <span className="hidden sm:inline">Tambah Induk</span></button>
          )}
        </div>
        
        <div className="space-y-3">
          {ajkInduk.map((ajk, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row gap-3 border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl items-start shadow-sm">
              {isAdmin ? (
                <>
                  <input value={ajk.peranan} onChange={e => { const newAjk = [...ajkInduk]; newAjk[idx].peranan = e.target.value; setAjkInduk(newAjk); }} onBlur={() => saveToFirebaseWithOffline({ ajkInduk, latestUpdate: { view: 'ajk', text: 'Senarai Jawatankuasa Induk MSR telah dikemas kini.' } })} className="border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-xs w-full sm:w-1/3 bg-white dark:bg-slate-900 transition-colors font-bold uppercase focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Jawatan" />
                  <div className="w-full flex flex-col gap-1.5 relative">
                    {ajk.nama.split('\n').map((n, nIdx, arr) => (
                      <div key={nIdx} className="flex items-center gap-1.5 group">
                        {arr.length > 1 && nIdx === 0 && <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 text-[10px] px-1.5 py-1 rounded-md font-black shrink-0 shadow-sm" title="Ketua">K</span>}
                        <input list="senarai-staf" value={n} onChange={e => { const names = ajk.nama.split('\n'); names[nIdx] = e.target.value; const newAjk = [...ajkInduk]; newAjk[idx].nama = names.join('\n'); setAjkInduk(newAjk); }} onBlur={() => saveToFirebaseWithOffline({ ajkInduk, latestUpdate: { view: 'ajk', text: 'Senarai Jawatankuasa Induk MSR telah dikemas kini.' } })} className="border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-xs w-full bg-white dark:bg-slate-900 transition-colors focus:ring-2 focus:ring-emerald-500 outline-none" placeholder={arr.length > 1 && nIdx === 0 ? "Cari Nama Ketua" : "Cari Nama Pembantu"} />
                        {arr.length > 1 && <button onClick={() => { const names = ajk.nama.split('\n'); names.splice(nIdx, 1); const newAjk = [...ajkInduk]; newAjk[idx].nama = names.join('\n'); setAjkInduk(newAjk); saveToFirebaseWithOffline({ ajkInduk: newAjk }); }} className="text-red-400 hover:text-red-600 bg-red-50 dark:bg-red-900/20 p-1.5 rounded-md transition-colors"><X size={14}/></button>}
                      </div>
                    ))}
                    <button onClick={() => { const newAjk = [...ajkInduk]; newAjk[idx].nama += '\n'; setAjkInduk(newAjk); }} className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold self-start mt-0.5 hover:underline flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md transition-colors"><Plus size={12}/> Tambah Pembantu</button>
                  </div>
                  <button onClick={() => { const newAjk = ajkInduk.filter((_, i) => i !== idx); setAjkInduk(newAjk); saveToFirebaseWithOffline({ ajkInduk: newAjk }); }} className="text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 p-2 rounded-lg transition-colors shrink-0 self-start sm:self-auto"><Trash2 size={16}/></button>
                </>
              ) : (
                <>
                  <span className="text-[11px] md:text-xs font-black text-emerald-700 dark:text-emerald-400 sm:w-1/3 uppercase pt-1 tracking-wide">{ajk.peranan}</span>
                  <div className="w-full sm:w-2/3 flex flex-col gap-1.5">
                    {ajk.nama.split('\n').map((nama, nIdx, arr) => {
                      const text = nama.trim();
                      if (!text) return null;
                      const cleanName = text.replace(/\(K\)/gi, '').trim();
                      const validNamesCount = arr.filter(n => n.trim() !== '').length;
                      const isKetua = validNamesCount > 1 && nIdx === 0;
                      return (
                        <div key={nIdx} className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700 flex items-center gap-2 shadow-sm">
                          {isKetua && <span className="bg-gradient-to-br from-emerald-400 to-teal-600 text-white text-[9px] px-1.5 py-0.5 rounded font-black shrink-0 shadow-sm">KETUA</span>}
                          <span className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">{cleanName}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700 p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-800 dark:text-white">Biro Pelaksana</h3>
          {isAdmin && (
            <button onClick={() => { const newBiro = [...biroList, { nama: "Biro Baru", ketua: "", ahli: [] }]; setBiroList(newBiro); saveToFirebaseWithOffline({ biroList: newBiro }); }} className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl font-bold text-xs transition-colors active:scale-95 shadow-sm flex items-center gap-1.5"><Plus size={14}/> <span className="hidden sm:inline">Tambah Biro</span></button>
          )}
        </div>
        
        <div className="space-y-3">
          {biroList.map((biro, idx) => (
            isAdmin ? (
              <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl relative space-y-2.5 shadow-sm animate-in fade-in">
                <button onClick={() => { const newBiro = biroList.filter((_, i) => i !== idx); setBiroList(newBiro); saveToFirebaseWithOffline({ biroList: newBiro }); }} className="absolute top-4 right-4 text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 p-1.5 rounded-lg transition-colors"><Trash2 size={16}/></button>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Nama Biro</label>
                  <input value={biro.nama} onChange={e => { const newBiro = [...biroList]; newBiro[idx].nama = e.target.value; setBiroList(newBiro); }} onBlur={() => saveToFirebaseWithOffline({ biroList })} className="border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-sm w-[85%] font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-900 transition-colors focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="Masukkan nama biro..." />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Ketua Biro</label>
                  <input list="senarai-staf" value={biro.ketua} onChange={e => { const newBiro = [...biroList]; newBiro[idx].ketua = e.target.value; setBiroList(newBiro); }} onBlur={() => saveToFirebaseWithOffline({ biroList })} className="border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-xs w-full font-bold bg-white dark:bg-slate-900 transition-colors focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="Cari / Masukkan Nama Ketua Biro" />
                </div>
                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl mt-3 border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Senarai Ahli</span>
                    <button onClick={() => { const newBiro = [...biroList]; if(!newBiro[idx].ahli) newBiro[idx].ahli=[]; newBiro[idx].ahli.push(""); setBiroList(newBiro); }} className="text-cyan-600 hover:text-white bg-cyan-50 hover:bg-cyan-600 px-2 py-1 rounded-md text-[10px] font-bold transition-colors flex items-center gap-1"><Plus size={12}/> Tambah Ahli</button>
                  </div>
                  <div className="space-y-1.5">
                    {biro.ahli && biro.ahli.map((ahli, aIdx) => (
                      <div key={aIdx} className="flex gap-2 items-center">
                        <span className="text-[10px] font-bold text-slate-400 w-3">{aIdx + 1}.</span>
                        <input list="senarai-staf" value={ahli} onChange={e => { const newBiro = [...biroList]; newBiro[idx].ahli[aIdx] = e.target.value; setBiroList(newBiro); }} onBlur={() => saveToFirebaseWithOffline({ biroList })} className="border border-slate-200 dark:border-slate-700 p-2 rounded-md text-xs w-full bg-slate-50 dark:bg-slate-900 transition-colors focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="Cari / Masukkan Nama Ahli" />
                        <button onClick={() => { const newBiro = [...biroList]; newBiro[idx].ahli = newBiro[idx].ahli.filter((_, i) => i !== aIdx); setBiroList(newBiro); saveToFirebaseWithOffline({ biroList: newBiro }); }} className="text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 p-2 rounded-md transition-colors"><X size={14}/></button>
                      </div>
                    ))}
                    {(!biro.ahli || biro.ahli.length === 0) && <p className="text-[10px] text-slate-400 font-medium italic text-center py-1">Tiada ahli ditambah.</p>}
                  </div>
                </div>
              </div>
            ) : (
              <AccordionBiro key={idx} biro={biro} isOpen={openBiroIndex === idx} onToggle={() => setOpenBiroIndex(openBiroIndex === idx ? null : idx)} />
            )
          ))}
        </div>
      </div>
    </div>
  );
}