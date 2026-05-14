import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { COUNTRY_CODES, getCountryByCode } from '../../config/country-codes.js';

/**
 * CountryCodeSelect
 *
 * Searchable country/dial-code picker. Stores ISO code (e.g. "IN") and
 * exposes the matched country object via onChange so callers can update
 * timezone in tandem.
 *
 * Usage:
 *   <CountryCodeSelect
 *     value={countryCode}
 *     onChange={(code, country) => {
 *       setCountryCode(code);
 *       setTimezone(country?.timezone);
 *     }}
 *   />
 */
export default function CountryCodeSelect({
  value,
  onChange,
  disabled = false,
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);
  const inputRef = useRef(null);

  const selected = useMemo(() => getCountryByCode(value), [value]);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRY_CODES;
    return COUNTRY_CODES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q) ||
        c.dial.replace('+', '').includes(q.replace('+', '')) ||
        c.code.toLowerCase() === q
    );
  }, [query]);

  function pick(country) {
    onChange?.(country.code, country);
    setOpen(false);
    setQuery('');
  }

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className="inline-flex w-full cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected ? (
          <>
            <span className="text-base leading-none">{selected.flag}</span>
            <span className="font-semibold">{selected.dial}</span>
            <span className="hidden truncate text-slate-500 dark:text-slate-400 sm:inline">
              {selected.name}
            </span>
          </>
        ) : (
          <span className="text-slate-400">Select country</span>
        )}
        <ChevronDown className="ml-auto h-4 w-4 text-slate-400" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-2 max-h-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2 dark:border-slate-800">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country or dial code"
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
            />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {results.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                No matches.
              </div>
            ) : (
              results.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => pick(c)}
                  className={`flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-slate-50 dark:hover:bg-slate-800 ${
                    c.code === value ? 'bg-indigo-50/60 dark:bg-indigo-500/10' : ''
                  }`}
                >
                  <span className="text-base leading-none">{c.flag}</span>
                  <span className="flex-1 truncate text-slate-700 dark:text-slate-200">
                    {c.name}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {c.dial}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
