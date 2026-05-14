/**
 * app-table.jsx
 *
 * Central reusable table for the entire Mailwave project. Reads column,
 * mobile and pagination configuration from the central files in
 * src/config so any change made there propagates to every module table.
 *
 * Responsive contract (matches src/utils/table-utils.js):
 *   - Mobile / tablet (viewport < 1024px) → card grid.
 *   - Laptop / desktop / large desktop → ALWAYS the table layout. Wide
 *     tables fit by dropping lower-priority columns and using compact
 *     padding + truncation; we never fall back to cards on desktop/laptop.
 *   - displayMode="cards" or "table" still lets a caller force a layout,
 *     but module pages should leave it as "auto".
 *
 * Other behaviour:
 *   - Inline edit on hover with validation, save / cancel, dropdown that
 *     auto-flips upward when there is no space below.
 *   - Action column with tooltips, role permission gating and
 *     destructive confirmation hooks (callers wire up ConfirmModal).
 *   - Central search, filters (slot) and pagination.
 *   - Persists inline edits to localStorage via table-service.js so the
 *     module page can simply read them back through applyTableOverrides.
 *
 * The component is backward compatible with the older `{ key, label,
 * render }` column shape used by ModulePage / DataTable, so dropping it
 * into existing module pages requires no caller changes.
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { actionColumnLabel } from '../../config/labels.js';
import { TABLE_CONFIG } from '../../config/table-config.js';
import { getTableConfig } from '../../config/table-columns.js';
import { handleInlineUpdate } from '../../services/table-service.js';
import { ROLES } from '../../config/roles.js';
import { isReadOnly as isRoleReadOnly } from '../../utils/permissions.js';
import { isColumnVisible, getBreakpoint } from '../../config/table-responsive-config.js';
import {
  shouldRenderCards,
} from '../../utils/table-utils.js';

import TableFilterBar from './table-filter-bar.jsx';
import TablePagination from './table-pagination.jsx';
import AppTableRow from './app-table-row.jsx';
import AppTableCard from './app-table-card.jsx';

import '../../styles/table-responsive.css';

// Legacy module pages set `priority: 1..4`. The central registry uses
// the string priority names (critical / high / medium / low). Normalise
// numbers so isColumnVisible() handles both shapes.
const NUMERIC_PRIORITY_MAP = {
  1: 'critical',
  2: 'high',
  3: 'medium',
  4: 'low',
};

function normalisePriority(p) {
  if (typeof p === 'number') return NUMERIC_PRIORITY_MAP[p] || 'medium';
  if (typeof p === 'string') return p;
  return TABLE_CONFIG.columns.defaultPriority || 'medium';
}

function ensurePriorityDefaults(column) {
  return {
    truncate: column.truncate ?? TABLE_CONFIG.columns.truncate,
    ...column,
    priority: normalisePriority(column.priority),
  };
}

/**
 * Merge provided columns with the central registry columns by key. The
 * provided column wins for visible bits (label / render / value / order),
 * but inline edit metadata (editable / editType / options / validator)
 * and column hints (priority / width / truncate / tooltip / type /
 * searchable / sortable) come through from the registry so a page that
 * only overrides `render` still gets dropdown edit behaviour for status
 * etc.
 */
function mergeColumnsWithRegistry(provided, registry) {
  if (!provided || provided.length === 0) return [];
  if (!registry || registry.length === 0) return provided;
  const byKey = new Map(registry.map((c) => [c.key, c]));
  return provided.map((c) => {
    const base = byKey.get(c.key);
    if (!base) return c;
    const merged = { ...base, ...c };
    // Carry inline edit hints from registry when the page didn't supply
    // explicit overrides — these are easy to forget.
    for (const k of [
      'editable',
      'editType',
      'options',
      'validator',
      'sortable',
      'searchable',
      'truncate',
      'tooltip',
      'priority',
      'type',
      'badgeMap',
    ]) {
      if (merged[k] === undefined && base[k] !== undefined) merged[k] = base[k];
    }
    return merged;
  });
}

function defaultSearchMatch(row, query, columns, explicitKeys) {
  if (!query) return true;
  const q = query.toLowerCase();
  const keys = explicitKeys?.length
    ? explicitKeys
    : columns.filter((c) => c.searchable !== false).map((c) => c.key);
  return keys.some((key) => {
    const value = row[key];
    if (value === null || value === undefined) return false;
    if (Array.isArray(value)) return value.join(' ').toLowerCase().includes(q);
    return String(value).toLowerCase().includes(q);
  });
}

function getViewportWidth() {
  if (typeof window === 'undefined') return 0;
  return window.innerWidth || 0;
}

/**
 * AppTable
 *
 * @param tableKey            optional key (e.g. 'contacts') used to pull
 *                            column + mobile config from table-columns.js.
 * @param columns             optional explicit column array; falls back to
 *                            the registry config for tableKey.
 * @param rows                array of row objects.
 * @param rowKey              property used as the React key (default 'id').
 * @param role                current user role for permission gating.
 * @param actions             ordered action keys for the actions column.
 * @param actionHandlers      handler functions keyed by action key.
 * @param actionPermissions   booleans keyed by action key.
 * @param onInlineUpdate      (rowId, columnKey, value) => optional override
 *                            of the default localStorage persist + parent
 *                            update flow. Return { ok, error } from inside
 *                            to surface field errors.
 * @param displayMode         'auto' | 'table' | 'cards' — defaults to auto.
 * @param filters             JSX slot for the desktop / drawer filter row.
 * @param rightSlot           JSX rendered to the right of the filter bar.
 * @param topBar              JSX rendered above the table (e.g. bulk bar).
 * @param mobileConfig        explicit mobile config override.
 * @param searchable / searchKeys / searchPlaceholder
 * @param pageable
 * @param defaultPageSize
 * @param selectable          shows checkbox column + delegates selection.
 * @param selectedIds / onSelectionChange
 * @param showSerial          true to render an auto-incrementing SR. No.
 * @param empty               custom empty-state message.
 * @param className           wrapper className.
 */
export default function AppTable({
  tableKey,
  columns: columnsProp,
  rows = [],
  rowKey = 'id',
  role,
  module,
  actions,
  actionHandlers = {},
  actionPermissions = {},
  onInlineUpdate,
  inlineEditDisabled,
  displayMode = 'auto',
  filters,
  rightSlot,
  topBar,
  mobileConfig,
  searchable = TABLE_CONFIG.search.enabled,
  searchKeys,
  searchPlaceholder,
  pageable = true,
  defaultPageSize = TABLE_CONFIG.pagination.defaultPageSize,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  showSerial = false,
  empty,
  className = '',
}) {
  const registry = tableKey ? getTableConfig(tableKey) : null;

  const baseColumns = useMemo(() => {
    const provided = columnsProp || registry?.columns || [];
    const merged =
      columnsProp && registry?.columns
        ? mergeColumnsWithRegistry(columnsProp, registry.columns)
        : provided;
    return merged.map(ensurePriorityDefaults);
  }, [columnsProp, registry]);

  // Drop the action column if it's defined in legacy form ({ key: 'actions' })
  // so we can render it through the central TableActions instead.
  const allColumns = useMemo(
    () => baseColumns.filter((c) => c.key !== 'actions'),
    [baseColumns]
  );

  const mobile = mobileConfig || registry?.mobile || {
    mobileTitleKey: allColumns[0]?.key,
    mobileSubtitleKey: allColumns[1]?.key,
    mobileDetailKeys: allColumns.slice(2).map((c) => c.key),
    mobileActionKeys: actions || [],
  };

  const resolvedActions = actions || mobile.mobileActionKeys || [];
  const resolvedSearchKeys = searchKeys || registry?.search?.keys;
  const resolvedSearchPlaceholder =
    searchPlaceholder || registry?.search?.placeholder || TABLE_CONFIG.search.placeholder;

  const [query, setQuery] = useState('');
  const [page, setPage] = useState(TABLE_CONFIG.pagination.defaultPage);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [localOverrides, setLocalOverrides] = useState({});

  /* ----------------------- Responsive layout decision --------------------- */

  const wrapperRef = useRef(null);
  const [viewportWidth, setViewportWidth] = useState(getViewportWidth());

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    function onResize() {
      setViewportWidth(getViewportWidth());
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Cards only when the viewport is true mobile/tablet. Desktop and
  // laptop always render the table — no container-width fallback.
  const renderAsCards = useMemo(
    () =>
      shouldRenderCards({
        viewportWidth,
        displayMode,
      }),
    [viewportWidth, displayMode]
  );

  // On desktop/laptop, hide lower-priority columns to keep the table
  // compact and avoid horizontal scroll. Cards (mobile/tablet) still see
  // every column — low-priority ones go in the "More Details" accordion.
  const tableColumns = useMemo(() => {
    if (renderAsCards) return allColumns;
    const bp = getBreakpoint(viewportWidth || 0);
    const filtered = allColumns.filter((c) => isColumnVisible(c, bp));
    // Fail-safe: never strip the table empty just because no priorities
    // matched (e.g. legacy column shape with no priority). Fall back to
    // showing every column when filtering removes everything.
    return filtered.length > 0 ? filtered : allColumns;
  }, [renderAsCards, allColumns, viewportWidth]);

  /* --------------------------------- Data --------------------------------- */

  useEffect(() => {
    setLocalOverrides({});
  }, [tableKey]);

  const effectiveRows = useMemo(() => {
    if (Object.keys(localOverrides).length === 0) return rows;
    return rows.map((row) => {
      const patch = localOverrides[row[rowKey]];
      return patch ? { ...row, ...patch } : row;
    });
  }, [rows, localOverrides, rowKey]);

  const filtered = useMemo(() => {
    if (!searchable || !query) return effectiveRows;
    return effectiveRows.filter((row) =>
      defaultSearchMatch(row, query, allColumns, resolvedSearchKeys)
    );
  }, [effectiveRows, query, searchable, allColumns, resolvedSearchKeys]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const paged = pageable ? filtered.slice(start, start + pageSize) : filtered;

  // A role is "read-only" on this table when its only granted actions
  // are view and/or export. Inline edit, dropdown edit and write actions
  // are suppressed for those roles — not just Viewer.
  const moduleReadOnly = module ? isRoleReadOnly(role, module) : false;
  const isViewer = role === ROLES.VIEWER || moduleReadOnly;

  const inlineEdit = useMemo(
    () => ({
      disabled: inlineEditDisabled || isViewer,
      onSave: (rowId, columnKey, value) => {
        const col = allColumns.find((c) => c.key === columnKey);
        // If the parent supplied its own handler, defer to it (it can run
        // validation, hit a service, or refuse the update).
        if (typeof onInlineUpdate === 'function') {
          const r = onInlineUpdate(rowId, columnKey, value, col);
          if (r && r.ok === false) return r;
          if (r && r.ok === true) {
            setLocalOverrides((prev) => ({
              ...prev,
              [rowId]: { ...(prev[rowId] || {}), [columnKey]: value },
            }));
            return r;
          }
        }
        // Default: persist to localStorage via table-service.
        if (!tableKey) return { ok: true, value };
        const persisted = handleInlineUpdate(tableKey, rowId, columnKey, value);
        if (persisted.ok) {
          setLocalOverrides((prev) => ({
            ...prev,
            [rowId]: { ...(prev[rowId] || {}), [columnKey]: value },
          }));
        }
        return persisted;
      },
    }),
    [tableKey, onInlineUpdate, isViewer, inlineEditDisabled, allColumns]
  );

  const noResults = paged.length === 0;
  const emptyMessage =
    empty ||
    (query ? TABLE_CONFIG.empty.noSearchResults : TABLE_CONFIG.empty.noRecords);

  const dataModeAttr = renderAsCards ? 'cards' : 'table';

  return (
    <div
      ref={wrapperRef}
      className={`app-table-wrapper ${className}`}
      data-display-mode={dataModeAttr}
    >
      {(searchable || filters || rightSlot) && (
        <TableFilterBar
          query={query}
          onQueryChange={searchable ? (v) => { setQuery(v); setPage(1); } : undefined}
          searchPlaceholder={resolvedSearchPlaceholder}
          filters={filters}
          rightSlot={rightSlot}
        />
      )}

      {topBar}

      {renderAsCards ? (
        <div className="app-table-mobile app-table-card-grid">
          {noResults ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              {emptyMessage}
            </div>
          ) : (
            paged.map((row, index) => (
              <AppTableCard
                key={row[rowKey] ?? `card-${index}`}
                row={row}
                rowKey={rowKey}
                columns={allColumns}
                mobile={mobile}
                inlineEdit={inlineEdit}
                isViewer={isViewer}
                actions={resolvedActions}
                actionHandlers={actionHandlers}
                actionPermissions={actionPermissions}
              />
            ))
          )}
        </div>
      ) : (
        <div className="app-table-shell app-table-desktop">
          {noResults ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
              {emptyMessage}
            </div>
          ) : (
            <div className="app-table-scroll">
              <table className="app-table table-fixed border-collapse w-full">
                <thead className="app-table-header">
                  <tr>
                    {selectable && (
                      <th style={{ width: 44 }}>
                        <input
                          type="checkbox"
                          aria-label="Select all on page"
                          className="h-4 w-4 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          checked={paged.length > 0 && paged.every((r) => selectedIds.includes(r[rowKey]))}
                          onChange={(e) => {
                            if (!onSelectionChange) return;
                            const ids = paged.map((r) => r[rowKey]);
                            if (e.target.checked) {
                              onSelectionChange(Array.from(new Set([...selectedIds, ...ids])));
                            } else {
                              onSelectionChange(selectedIds.filter((id) => !ids.includes(id)));
                            }
                          }}
                        />
                      </th>
                    )}
                    {showSerial && (
                      <th style={{ width: 64 }}>{TABLE_CONFIG.columns.serialNumberLabel}</th>
                    )}
                    {tableColumns.map((c) => (
                      <th
                        key={c.key}
                        style={c.width ? { width: c.width } : undefined}
                      >
                        {c.label}
                      </th>
                    ))}
                    {resolvedActions.length > 0 && (
                      <th className="app-table-actions" style={{ width: 110 }}>
                        {actionColumnLabel(resolvedActions.length)}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paged.map((row, index) => (
                    <AppTableRow
                      key={row[rowKey] ?? `row-${index}`}
                      row={row}
                      rowKey={rowKey}
                      index={index}
                      start={start}
                      columns={tableColumns}
                      inlineEdit={inlineEdit}
                      isViewer={isViewer}
                      actions={resolvedActions}
                      actionHandlers={actionHandlers}
                      actionPermissions={actionPermissions}
                      selectable={selectable}
                      selected={selectedIds.includes(row[rowKey])}
                      onSelectChange={(id, checked) => {
                        if (!onSelectionChange) return;
                        onSelectionChange(
                          checked
                            ? Array.from(new Set([...selectedIds, id]))
                            : selectedIds.filter((x) => x !== id)
                        );
                      }}
                      showSerial={showSerial}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {pageable && total > 0 && (
        <TablePagination
          page={safePage}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(1);
          }}
        />
      )}
    </div>
  );
}
