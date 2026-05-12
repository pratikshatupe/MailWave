import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getNavigationForRole } from '../../config/modules.js';
import { LABELS } from '../../config/labels.js';

export default function SearchDropdown() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const inputRef = useRef(null);

  const items = useMemo(() => getNavigationForRole(role), [role]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 8);
    return items.filter((i) => i.label.toLowerCase().includes(q));
  }, [items, query]);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function go(item) {
    navigate(item.to);
    setOpen(false);
    setQuery('');
  }

  return (
    <div className="relative w-full max-w-md" ref={ref}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results.length > 0) {
            e.preventDefault();
            go(results[0]);
          }
          if (e.key === 'Escape') setOpen(false);
        }}
        placeholder={`${LABELS.search} modules, pages…`}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-9 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 dark:focus:border-indigo-400 dark:focus:bg-slate-900 dark:focus:ring-indigo-500/20"
      />
      {query && (
        <button
          onClick={() => {
            setQuery('');
            inputRef.current?.focus();
          }}
          className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Clear"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-card dark:border-slate-700 dark:bg-slate-900">
          {results.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
              No matching page found
            </div>
          ) : (
            <>
              <div className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {query ? 'Results' : 'Quick navigation'}
              </div>
              <ul>
                {results.map((r) => {
                  const Icon = r.icon;
                  return (
                    <li key={r.to + r.label}>
                      <button
                        onClick={() => go(r)}
                        className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700 dark:text-slate-200 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
                      >
                        <Icon className="h-4 w-4 text-slate-400" />
                        <span className="flex-1 truncate">{r.label}</span>
                        <span className="hidden text-[10px] text-slate-400 sm:inline">
                          {r.to}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
