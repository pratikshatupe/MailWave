/**
 * table-pagination.jsx
 *
 * Central pagination control. Options come from TABLE_CONFIG so changing
 * the default page size or pager options here updates every table.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TABLE_CONFIG } from '../../config/table-config.js';

export default function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  className = '',
}) {
  if (!total) return null;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const from = start + 1;
  const to = Math.min(start + pageSize, total);

  const numbers = [];
  const maxNumbers = 5;
  const half = Math.floor(maxNumbers / 2);
  let lo = Math.max(1, safePage - half);
  let hi = Math.min(totalPages, lo + maxNumbers - 1);
  lo = Math.max(1, hi - maxNumbers + 1);
  for (let i = lo; i <= hi; i += 1) numbers.push(i);

  return (
    <div
      className={`flex flex-col items-center justify-between gap-3 sm:flex-row ${className}`}
    >
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>Rows per page</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
          className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          {TABLE_CONFIG.pagination.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <span className="hidden sm:inline">
          Showing {from} to {to} of {total}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange?.(Math.max(1, safePage - 1))}
          disabled={safePage === 1}
          className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Previous
        </button>

        {TABLE_CONFIG.pagination.showPageNumbers && numbers.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onPageChange?.(n)}
            className={`inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-lg border px-2 text-xs font-semibold transition ${
              n === safePage
                ? 'border-indigo-500 bg-indigo-600 text-white hover:bg-indigo-700'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            {n}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange?.(Math.min(totalPages, safePage + 1))}
          disabled={safePage === totalPages}
          className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
