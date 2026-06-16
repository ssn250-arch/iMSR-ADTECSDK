import React from 'react';
import { Lock, X, Eye, EyeOff, AlertTriangle } from 'lucide-react';

export default function LoginModal({ 
  showLogin, setShowLogin, loginForm, setLoginForm, handleLogin, isLockedOut, showPassword, setShowPassword 
}) {
  if (!showLogin) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl p-6 md:p-8 w-full max-w-sm border border-slate-200 dark:border-slate-700 animate-in zoom-in-[0.95] duration-200 ease-out">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-extrabold flex items-center gap-2 text-slate-800 dark:text-white">
            <Lock size={20} className="text-cyan-600" /> Akses Admin
          </h2>
          <button 
            onClick={() => setShowLogin(false)} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-full p-1.5 transition-all active:scale-90"
          >
            <X size={18}/>
          </button>
        </div>
        
        {/* Amaran Akaun Dikunci */}
        {isLockedOut ? (
          <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-3 rounded-xl flex items-center gap-2 mb-4">
            <AlertTriangle size={20} />
            <p className="text-xs font-bold">Akaun dikunci 30 saat akibat ralat berulang.</p>
          </div>
        ) : (
          /* Borang Log Masuk */
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="text" 
              required 
              value={loginForm.username} 
              onChange={(e) => setLoginForm({...loginForm, username: e.target.value})} 
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-800 dark:text-white transition-all focus:ring-2 focus:ring-cyan-500 outline-none" 
              placeholder="Nama Pengguna" 
            />
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                value={loginForm.password} 
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} 
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-4 pr-10 py-2.5 rounded-xl text-sm font-semibold text-slate-800 dark:text-white transition-all focus:ring-2 focus:ring-cyan-500 outline-none" 
                placeholder="Kata Laluan" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-3 rounded-xl text-sm shadow-lg active:scale-95 transition-transform duration-200"
            >
              Sahkan Log Masuk
            </button>
          </form>
        )}
      </div>
    </div>
  );
}