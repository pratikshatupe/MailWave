/**
 * SelectField
 *
 * Dropdown with chevron that flips when open. Long lists (>=8) get an
 * inline search box.
 */

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check, Search as SearchIcon } from 'lucide-react';
import { FORM_FIELDS } from '../../config/formFields.js';

export default function SelectField({
  field,
  name,
  label,
  options = [],
  value,
  onChange,
  onValidate,
  validator,
  placeholder,
  required,
  error,
  disabled,
  icon,
  className = '',
}) {
  const config = field ? FORM_FIELDS[field] : null;
  const resolvedName = name || config?.name;
  const resolvedLabel = label ?? config?.label;
  const resolvedPlaceholder = placeholder ?? config?.placeholder ?? 'Select an option';
  const resolvedRequired = required ?? config?.required ?? false;
  const Icon = icon ?? config?.icon;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (!wrapperRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const showSearch = options.length >= 8;
  const filtered = showSearch
    ? options.filter((o) =>
        String(o.label ?? o.value)
          .toLowerCase()
          .includes(query.toLowerCase())
      )
    : options;
  const selectedLabel =
    options.find((o) => o.value === value)?.label ?? '';

  return (
    <div className={`w-full ${className}`} ref={wrapperRef}>
      {resolvedLabel && (
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
          {resolvedLabel}
          {resolvedRequired && <span className="text-rose-600 dark:text-rose-400">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
          className={`flex w-full items-center justify-between gap-2 rounded-xl border bg-white px-4 py-3 text-left text-sm shadow-sm transition dark:bg-slate-900 ${
            Icon ? 'pl-10' : ''
          } ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100 dark:border-rose-500/50'
              : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700'
          } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-600'}`}
        >
          {Icon && (
            <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          )}
          <span className={`flex-1 truncate ${selectedLabel ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}>
            {selectedLabel || resolvedPlaceholder}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-700 dark:bg-slate-900">
            {showSearch && (
              <div className="border-b border-slate-100 p-2 dark:border-slate-800">
                <div className="relative">
                  <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    autoFocus
                  />
                </div>
              </div>
            )}
            <ul role="listbox" className="max-h-60 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-sm text-slate-500">No options.</li>
              ) : (
                filtered.map((o) => {
                  const isSel = o.value === value;
                  return (
                    <li
                      key={o.value}
                      role="option"
                      aria-selected={isSel}
                      onClick={() => {
                        onChange?.({ target: { name: resolvedName, value: o.value } });
                        setOpen(false);
                        setQuery('');
                        if (typeof validator === 'function' && typeof onValidate === 'function') {
                          onValidate(resolvedName, validator(o.value) || '');
                        }
                      }}
                      className={`flex cursor-pointer items-center justify-between px-3 py-2 text-sm transition hover:bg-indigo-50 dark:hover:bg-indigo-500/10 ${
                        isSel ? 'bg-indigo-50/60 font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <span className="truncate">{o.label ?? o.value}</span>
                      {isSel && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>
      )}
    </div>
  );
}
