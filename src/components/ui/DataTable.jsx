/**
 * DataTable
 *
 * Reads defaults from tableStandards.js so every table in the product
 * follows the same conventions:
 *  - Optional search field with clear icon.
 *  - Pagination options 10 / 20 / 50 / 100.
 *  - Record count display.
 *  - "No records found." empty state.
 *  - Text wrapping in columns.
 *  - Tooltipped action icons.
 *  - "Action" header when there is only one action, "Actions" when many.
 *
 * Backwards compatible: callers that only pass `columns` + `rows` still
 * work (search / pagination are auto-disabled when not needed).
 */

import { useMemo, useState } from 'react';
import { TABLE } from '../../config/tableStandards.js';
import { actionColumnLabel } from '../../config/labels.js';
import SearchField from './SearchField.jsx';

export default function DataTable({
  columns = [],
  rows = [],
  rowKey = 'id',
  empty,
  searchable = true,
  pageable = true,
  pageSize: pageSizeProp,
  actionsCount,
  className = '',
}) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(TABLE.pagination.defaultPage);
  const [pageSize, setPageSize] = useState(
    pageSizeProp || TABLE.pagination.defaultPageSize
  );

  // Patch the "actions" / "action" column header label if caller passed
  // `actionsCount`. Useful when row actions are rendered via a single column.
  const resolvedColumns = useMemo(() => {
    if (!actionsCount) return columns;
    return columns.map((c) =>
      c.key === 'actions'
        ? { ...c, label: actionColumnLabel(actionsCount) }
        : c
    );
  }, [columns, actionsCount]);

  const filtered = useMemo(() => {
    if (!searchable || !query) return rows;
    const q = query.toLowerCase();
    return rows.filter((row) =>
      resolvedColumns.some((c) => {
        const v = c.searchValue ? c.searchValue(row) : row[c.key];
        return String(v ?? '').toLowerCase().includes(q);
      })
    );
  }, [rows, query, resolvedColumns, searchable]);

  const totalRecords = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const paged = pageable ? filtered.slice(start, start + pageSize) : filtered;
  const showingFrom = totalRecords === 0 ? 0 : start + 1;
  const showingTo = Math.min(start + pageSize, totalRecords);

  return (
    <div className={`space-y-3 ${className}`}>
      {(searchable || pageable) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {searchable ? (
            <SearchField
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder={TABLE.search.placeholder}
              className="w-full sm:max-w-sm"
            />
          ) : (
            <span />
          )}
          {TABLE.pagination.showRecordCount && (
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {totalRecords === 0
                ? '0 records'
                : `Showing ${showingFrom}–${showingTo} of ${totalRecords}`}
            </div>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
        {paged.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
            {empty ||
              (query ? TABLE.empty.noSearchResultsMessage : TABLE.empty.noRecordsMessage)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
                <tr>
                  {resolvedColumns.map((c) => (
                    <th
                      key={c.key}
                      className={`px-5 py-3 ${c.align === 'right' ? 'text-right' : ''} ${
                        TABLE.columns.wrapText ? 'whitespace-normal' : 'whitespace-nowrap'
                      }`}
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paged.map((row) => (
                  <tr
                    key={row[rowKey] ?? Math.random()}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                  >
                    {resolvedColumns.map((c) => (
                      <td
                        key={c.key}
                        className={`px-5 py-3 ${c.align === 'right' ? 'text-right' : ''} ${
                          TABLE.columns.wrapText ? 'whitespace-normal break-words' : ''
                        } ${c.className || ''}`}
                      >
                        {c.render ? c.render(row) : row[c.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pageable && totalRecords > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Rows per page</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              {TABLE.pagination.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="inline-flex cursor-pointer items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Previous
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Page {safePage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="inline-flex cursor-pointer items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
