/**
 * table-filter-bar.jsx
 *
 * Responsive filter row for AppTable. Renders a SearchField + any custom
 * filter slot. On mobile the filter slot collapses into a drawer that
 * opens via a Filters button so we never break the layout.
 */

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import SearchField from './SearchField.jsx';

export default function TableFilterBar({
  query,
  onQueryChange,
  searchPlaceholder,
  filters,
  filtersDrawerTitle = 'Filters',
  rightSlot,
  className = '',
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const hasFilters = Boolean(filters);

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      {(onQueryChange || hasFilters) && (
        <div className="flex w-full items-center gap-2 sm:w-auto sm:min-w-0 sm:flex-1">
          {onQueryChange && (
            <SearchField
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder={searchPlaceholder}
            />
          )}

          {hasFilters && (
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:hidden"
            >
              <Filter className="h-4 w-4" /> Filters
            </button>
          )}
        </div>
      )}

      {hasFilters && (
        <div className="hidden w-full flex-wrap items-center gap-2 sm:flex">
          {filters}
        </div>
      )}

      {rightSlot && <div className="flex items-center gap-2">{rightSlot}</div>}

      {hasFilters && drawerOpen && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-white p-4 dark:bg-slate-950 sm:hidden">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {filtersDrawerTitle}
            </h3>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Close filters"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex-1 overflow-y-auto">{filters}</div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="mt-3 inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
