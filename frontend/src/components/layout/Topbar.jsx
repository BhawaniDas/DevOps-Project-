import { useState } from 'react';
import { useDebounce } from '../../hooks';

export default function Topbar({ title, apiStatus, onNewTask, filter, setFilter }) {
  const [searchRaw, setSearchRaw] = useState('');

  // Update parent filter only after user stops typing
  const updateSearch = (val) => {
    setSearchRaw(val);
    setFilter((f) => ({ ...f, search: val }));
  };

  const statusDot = {
    connected: 'bg-emerald-500 shadow-[0_0_6px_#10b981]',
    error:     'bg-red-500',
    checking:  'bg-slate-500',
  };
  const statusText = {
    connected: 'Live',
    error:     'Error',
    checking:  '…',
  };

  return (
    <header className="flex items-center justify-between gap-4 px-7 py-3.5 border-b border-white/[0.07] bg-surface-950/60 backdrop-blur-xl flex-shrink-0 z-10">
      <h1 className="text-lg font-bold text-white tracking-tight">{title}</h1>

      <div className="flex items-center gap-3 flex-1 max-w-md mx-4">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-base pointer-events-none">⌕</span>
          <input
            className="input pl-9 py-1.5 text-sm"
            placeholder="Search tasks…"
            value={searchRaw}
            onChange={(e) => updateSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* API status */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/[0.07] text-[11px] font-semibold font-mono
          ${apiStatus === 'connected' ? 'text-emerald-400' : apiStatus === 'error' ? 'text-red-400' : 'text-slate-500'}`}>
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${statusDot[apiStatus] || statusDot.checking}`} />
          {statusText[apiStatus] || '…'}
        </div>

        <button className="btn-primary" onClick={onNewTask}>
          + Task
        </button>
      </div>
    </header>
  );
}
