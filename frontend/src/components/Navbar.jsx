import React from 'react';
import { Landmark, PlusCircle, FileCode, ShieldCheck, RefreshCw } from 'lucide-react';

const Navbar = ({ onOpenPostModal, onRefresh, loading }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                SmartLedger
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                GAAP Core Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Real-Time Double-Entry Ledger & Risk Analytics
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-400 text-xs font-medium transition"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>OpenAPI Docs</span>
          </a>

          <button
            onClick={onOpenPostModal}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-4 py-1.5 rounded-lg text-xs transition shadow-lg shadow-cyan-500/25 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Transaction</span>
          </button>
        </div>

      </div>
    </header>
  );
};

export default Navbar;