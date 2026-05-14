import { Trash2 } from 'lucide-react';
import ExportDropdown from './ExportDropdown.jsx';

/**
 * BulkActionBar
 *
 * Compact selection-aware action bar. Renders nothing when nothing is
 * selected. Hosts Export (with format dropdown), Delete, and any
 * `extraActions` the host page wants.
 *
 * The host page owns selection state and supplies:
 *   - selectedRows: actual row objects (not just ids)
 *   - filteredRows: current filtered set (used by ExportDropdown when
 *     nothing is selected — but BulkActionBar itself only renders when
 *     selection is non-empty)
 *   - columns: ExportDropdown column descriptors
 *   - moduleName: filename slug + title
 *   - onBulkDelete: callback (host should open ConfirmBulkDeleteModal)
 *
 * Permission gating:
 *   - canDelete=false hides Delete
 *   - canExport=false hides Export
 */
export default function BulkActionBar({
  selectedRows = [],
  filteredRows = [],
  columns = [],
  moduleName,
  entity = 'records',
  canDelete = false,
  canExport = false,
  onBulkDelete,
  onClearSelection,
  onExported,
  extraActions,
  className = '',
}) {
  const count = selectedRows.length;
  if (count === 0) return null;

  return (
    <div
      className={`flex flex-wrap items-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 dark:border-indigo-500/30 dark:bg-indigo-500/10 ${className}`}
    >
      <span className="inline-flex items-center rounded-full bg-indigo-600/10 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
        {count} selected
      </span>
      {onClearSelection && (
        <button
          type="button"
          onClick={onClearSelection}
          className="text-xs font-medium text-slate-500 underline-offset-2 transition hover:text-slate-700 hover:underline dark:text-slate-400 dark:hover:text-slate-200"
        >
          Clear
        </button>
      )}

      <div className="ml-auto flex flex-wrap items-center gap-2">
        {extraActions}

        {canExport && (
          <ExportDropdown
            selectedRows={selectedRows}
            filteredRows={filteredRows}
            columns={columns}
            moduleName={moduleName}
            onExported={onExported}
            label="Export selected"
          />
        )}

        {canDelete && (
          <button
            type="button"
            onClick={onBulkDelete}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
          >
            <Trash2 className="h-4 w-4" />
            Delete {count} {entity}
          </button>
        )}
      </div>
    </div>
  );
}
