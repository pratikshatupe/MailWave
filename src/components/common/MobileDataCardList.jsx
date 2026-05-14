import { Pencil, Trash2 } from 'lucide-react';

/**
 * MobileDataCardList
 *
 * Card layout used on small screens by SelectableDataTable. Each card
 * exposes the row checkbox, Sr. No., key/value lines for every column,
 * and optional edit/delete buttons (gated by permissions at the caller).
 */
export default function MobileDataCardList({
  rows = [],
  columns = [],
  rowKey = (r) => r.id,
  selectedIds = [],
  onToggleRow,
  startIndex = 0,
  canEdit = false,
  canDelete = false,
  onEdit,
  onDelete,
  emptyMessage = 'No records found.',
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400 md:hidden">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3 md:hidden">
      {rows.map((row, i) => {
        const id = rowKey(row);
        const checked = selectedIds.includes(id);
        return (
          <div
            key={id}
            className={`rounded-2xl border bg-white p-4 shadow-sm transition dark:bg-slate-900 ${
              checked
                ? 'border-indigo-300 ring-1 ring-indigo-200 dark:border-indigo-500/50 dark:ring-indigo-500/20'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggleRow?.(id)}
                className="mt-1 h-4 w-4 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800"
                aria-label="Select row"
              />
              <span className="inline-flex h-6 min-w-[1.75rem] items-center justify-center rounded-full bg-slate-100 px-2 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {startIndex + i + 1}
              </span>
              <div className="flex-1 space-y-1.5 text-sm">
                {columns.map((col) => (
                  <div key={col.key} className="flex flex-wrap items-baseline gap-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {col.header}
                    </span>
                    <span className="text-slate-700 dark:text-slate-200">
                      {col.render ? col.render(row) : formatCell(row, col)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {(canEdit || canDelete) && (
              <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                {canEdit && onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(row)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                )}
                {canDelete && onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(row)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function formatCell(row, column) {
  if (typeof column.value === 'function') return column.value(row);
  const v = row[column.key];
  if (v === null || v === undefined || v === '') return '—';
  if (Array.isArray(v)) return v.join(', ');
  return String(v);
}
