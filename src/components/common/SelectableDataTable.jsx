import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Trash2 } from 'lucide-react';
import MobileDataCardList from './MobileDataCardList.jsx';

/**
 * SelectableDataTable
 *
 * Reusable data table for every module.
 *
 * Features:
 *   - Checkbox column (per row + select-all)
 *   - Sr. No. column
 *   - Sortable headers (asc → desc → none) for any column with sortable: true
 *   - Row edit / delete actions (permission-gated)
 *   - Desktop: table layout with horizontal scroll
 *   - Mobile (md:hidden): MobileDataCardList card view
 *   - Bottom repeated header when row count > 50 (helps after scrolling)
 *
 * Permissions are passed in as booleans — the host page derives them
 * from utils/permissions.js. The component never imports the role helper
 * directly, keeping it module-agnostic.
 *
 * Column shape:
 *   {
 *     key: 'fullName',          // required, must be unique
 *     header: 'Full Name',
 *     value?: (row) => any,     // optional accessor; defaults to row[key]
 *     render?: (row) => node,   // optional renderer; defaults to value
 *     sortable?: boolean,
 *     sortType?: 'string' | 'number' | 'date',
 *     className?: string,       // td/th wrapper class
 *     headerClassName?: string,
 *   }
 */
export default function SelectableDataTable({
  rows = [],
  columns = [],
  rowKey = (r) => r.id,
  selectedIds = [],
  onSelectionChange,
  canEdit = false,
  canDelete = false,
  onEdit,
  onDelete,
  rowActions, // optional render-prop for extra per-row controls
  initialSort = null, // { key, direction: 'asc' | 'desc' }
  emptyMessage = 'No records found.',
  bottomHeaderThreshold = 50,
  mobileCardColumns, // optional alternate columns for the mobile card view
  startIndex = 0, // 0-based sr.no offset (set by pagination)
}) {
  const [sort, setSort] = useState(initialSort);

  const sortedRows = useMemo(() => {
    if (!sort?.key) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    const dir = sort.direction === 'desc' ? -1 : 1;
    const get = (r) => (typeof col.value === 'function' ? col.value(r) : r[col.key]);
    const out = rows.slice().sort((a, b) => {
      const av = get(a);
      const bv = get(b);
      return compareValues(av, bv, col.sortType) * dir;
    });
    return out;
  }, [rows, sort, columns]);

  const allVisibleIds = sortedRows.map(rowKey);
  const allSelected = allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.includes(id));
  const someSelected = allVisibleIds.some((id) => selectedIds.includes(id));

  function toggleAll() {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange(selectedIds.filter((id) => !allVisibleIds.includes(id)));
    } else {
      const merged = Array.from(new Set([...selectedIds, ...allVisibleIds]));
      onSelectionChange(merged);
    }
  }

  function toggleRow(id) {
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) onSelectionChange(selectedIds.filter((x) => x !== id));
    else onSelectionChange([...selectedIds, id]);
  }

  function onHeaderSort(col) {
    if (!col.sortable) return;
    setSort((prev) => {
      if (!prev || prev.key !== col.key) return { key: col.key, direction: 'asc' };
      if (prev.direction === 'asc') return { key: col.key, direction: 'desc' };
      return null;
    });
  }

  const showActions = canEdit || canDelete || Boolean(rowActions);
  const showBottomHeader = sortedRows.length > bottomHeaderThreshold;

  return (
    <div>
      {/* Mobile card view */}
      <MobileDataCardList
        rows={sortedRows}
        columns={mobileCardColumns || columns}
        rowKey={rowKey}
        selectedIds={selectedIds}
        onToggleRow={toggleRow}
        startIndex={startIndex}
        canEdit={canEdit}
        canDelete={canDelete}
        onEdit={onEdit}
        onDelete={onDelete}
        emptyMessage={emptyMessage}
      />

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <TableHead
              columns={columns}
              showActions={showActions}
              allSelected={allSelected}
              someSelected={someSelected && !allSelected}
              onToggleAll={toggleAll}
              sort={sort}
              onHeaderSort={onHeaderSort}
            />
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 2 + (showActions ? 1 : 0)}
                    className="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                sortedRows.map((row, i) => {
                  const id = rowKey(row);
                  const checked = selectedIds.includes(id);
                  return (
                    <tr
                      key={id}
                      className={`transition ${
                        checked
                          ? 'bg-indigo-50/60 dark:bg-indigo-500/10'
                          : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="w-10 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleRow(id)}
                          className="h-4 w-4 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800"
                          aria-label="Select row"
                        />
                      </td>
                      <td className="w-12 px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {startIndex + i + 1}
                      </td>
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={`px-4 py-3 text-slate-700 dark:text-slate-200 ${col.className || ''}`}
                        >
                          {col.render
                            ? col.render(row)
                            : renderDefault(row, col)}
                        </td>
                      ))}
                      {showActions && (
                        <td className="w-28 px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {rowActions?.(row)}
                            {canEdit && onEdit && (
                              <button
                                type="button"
                                onClick={() => onEdit(row)}
                                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                                aria-label="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                            )}
                            {canDelete && onDelete && (
                              <button
                                type="button"
                                onClick={() => onDelete(row)}
                                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-rose-500 transition hover:bg-rose-50 hover:text-rose-700 dark:text-rose-300 dark:hover:bg-rose-500/10"
                                aria-label="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
            {showBottomHeader && sortedRows.length > 0 && (
              <TableHead
                as="tfoot"
                columns={columns}
                showActions={showActions}
                allSelected={allSelected}
                someSelected={someSelected && !allSelected}
                onToggleAll={toggleAll}
                sort={sort}
                onHeaderSort={onHeaderSort}
              />
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

function TableHead({
  columns,
  showActions,
  allSelected,
  someSelected,
  onToggleAll,
  sort,
  onHeaderSort,
  as = 'thead',
}) {
  const Wrap = as;
  return (
    <Wrap className="bg-slate-50 dark:bg-slate-800/60">
      <tr>
        <th scope="col" className="w-10 px-4 py-3 text-left">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = !allSelected && someSelected;
            }}
            onChange={onToggleAll}
            className="h-4 w-4 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800"
            aria-label="Select all visible rows"
          />
        </th>
        <th
          scope="col"
          className="w-12 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
        >
          Sr. No.
        </th>
        {columns.map((col) => {
          const active = sort?.key === col.key;
          const dir = active ? sort.direction : null;
          const Icon = !col.sortable ? null : dir === 'asc' ? ArrowUp : dir === 'desc' ? ArrowDown : ArrowUpDown;
          return (
            <th
              key={col.key}
              scope="col"
              className={`px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ${col.headerClassName || ''}`}
            >
              {col.sortable ? (
                <button
                  type="button"
                  onClick={() => onHeaderSort(col)}
                  className="inline-flex cursor-pointer items-center gap-1.5 text-left uppercase tracking-wider transition hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <span>{col.header}</span>
                  {Icon && (
                    <Icon
                      className={`h-3.5 w-3.5 ${active ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-400'}`}
                    />
                  )}
                </button>
              ) : (
                col.header
              )}
            </th>
          );
        })}
        {showActions && (
          <th
            scope="col"
            className="w-28 px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
          >
            Actions
          </th>
        )}
      </tr>
    </Wrap>
  );
}

function renderDefault(row, col) {
  const v = typeof col.value === 'function' ? col.value(row) : row[col.key];
  if (v === null || v === undefined || v === '') return '—';
  if (Array.isArray(v)) return v.join(', ');
  return String(v);
}

function compareValues(a, b, type) {
  if (a === b) return 0;
  if (a === null || a === undefined) return -1;
  if (b === null || b === undefined) return 1;
  switch (type) {
    case 'number':
      return Number(a) - Number(b);
    case 'date': {
      const at = new Date(a).getTime();
      const bt = new Date(b).getTime();
      return at - bt;
    }
    case 'string':
    default:
      return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
  }
}
