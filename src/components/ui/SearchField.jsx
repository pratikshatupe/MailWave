/**
 * SearchField
 *
 * Search input with a clear-icon inside the field. Clearing triggers
 * onChange('') so consumer state and any backing query refresh.
 */

import { Search as SearchIcon, X } from 'lucide-react';
import { TABLE } from '../../config/tableStandards.js';

export default function SearchField({
  value = '',
  onChange,
  placeholder = TABLE.search.placeholder,
  className = '',
  autoFocus = false,
  ...rest
}) {
  function clear() {
    onChange?.({ target: { value: '' } });
  }

  return (
    <div className={`relative w-full ${className}`}>
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20"
        {...rest}
      />
      {value && TABLE.search.showClearIcon && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
