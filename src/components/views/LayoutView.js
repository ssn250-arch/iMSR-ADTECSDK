import React from 'react';
import { Map, UploadCloud, ExternalLink, Download, Trash2, FileText } from 'lucide-react';

export default function LayoutView({
  isAdmin,
  layoutList = [],
  handleLayoutUpload,
  handleDeleteLayout,
  setViewingMemo,
  handleDownloadBlob
}) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-28">
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-2xl bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400">
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Pelan &amp; Susun Atur Pendaftaran
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Rujukan aliran pergerakan, lokasi kaunter pendaftaran dan pelan dewan/asrama
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className="mb-6 border-2 border-dashed border-cyan-200 dark:border-cyan-800/60 bg-cyan-50/40 dark:bg-slate-800/40 hover:bg-cyan-50 dark:hover:bg-slate-800/70 transition-colors rounded-2xl p-6 text-center">
            <label className="cursor-pointer flex flex-col items-center">
              <UploadCloud size={32} className="text-cyan-500 mb-2" />
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Muat Naik Pelan / Gambar Baharu (Boleh Pilih Banyak)
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1.5 bg-white dark:bg-slate-800 px-3 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                Sokongan: Imej (Auto-Mampat) / PDF (~750KB/fail)
              </span>
              <input
                type="file"
                multiple
                accept="application/pdf,image/*"
                className="hidden"
                onChange={handleLayoutUpload}
                aria-label="Muat naik fail pelan"
              />
            </label>
          </div>
        )}

        {layoutList.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm font-medium">
            Tiada pelan pendaftaran dimuat naik bagi sesi ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {layoutList.map((layout, idx) => (
              <div
                key={layout.id || idx}
                className="group rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 shadow-sm hover:shadow-md transition-all flex flex-col"
              >
                <div
                  onClick={() => setViewingMemo(layout)}
                  className="cursor-pointer relative h-52 bg-slate-200/70 dark:bg-slate-900 flex items-center justify-center overflow-hidden"
                >
                  {layout.type === 'pdf' ? (
                    <div className="flex flex-col items-center gap-2 text-red-500">
                      <FileText size={44} />
                      <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300">
                        Dokumen PDF
                      </span>
                    </div>
                  ) : (
                    <img
                      src={layout.url}
                      alt={layout.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>

                <div className="p-4 flex items-center justify-between gap-2 mt-auto">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {layout.name}
                    </p>
                    <span className="text-[10px] font-bold uppercase text-cyan-600 dark:text-cyan-400">
                      {layout.type === 'pdf' ? 'Fail PDF' : 'Imej Pelan'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setViewingMemo(layout)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-50 text-cyan-700 hover:bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800 transition"
                    >
                      <ExternalLink size={13} />
                      Lihat
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadBlob(
                          layout.url,
                          `${layout.name}.${layout.type === 'pdf' ? 'pdf' : 'jpg'}`
                        )
                      }
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition"
                    >
                      <Download size={13} />
                    </button>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDeleteLayout(layout.id)}
                        className="p-1.5 rounded-xl text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition"
                        aria-label="Padam pelan"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}