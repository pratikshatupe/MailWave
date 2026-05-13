/**
 * app-table.jsx
 *
 * Central reusable table for the entire Mailwave project. Reads column,
 * mobile and pagination configuration from the central files in
 * src/config so any change made there propagates to every module table.
 *
 * Features:
 *   - displayMode="auto" (default) measures the wrapper with
 *     ResizeObserver and switches to a card grid the moment the visible
 *     columns can no longer fit — so the same table behaves correctly
 *     on a 1366px screen with the sidebar open.
 *   - displayMode="table" or "cards" lets a caller force a layout.
 *   - Mobile and tablet always render cards. Laptops below 1440px with
 *     more than seven visible columns render cards too.
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
import {
  computeRequiredTableWidth,
  shouldRenderCards,
} from '../../utils/table-utils.js';

import TableFilterBar from './table-filter-bar.jsx';
import TablePagination from './table-pagination.jsx';
import AppTableRow from './app-table-row.jsx';
import AppTableCard from './app-table-card.jsx';

import '../../styles/table-responsive.css';

function ensurePriorityDefaults(column) {
  return {
    priority: column.priority || TABLE_CONFIG.columns.defaultPriority,
    truncate: column.truncate ?? TABLE_CONFIG.columns.truncate,
    ...column,
  };
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
    return provided.map(ensurePriorityDefaults);
  }, [columnsProp, registry]);

  // Drop the action column if it's defined in legacy form ({ key: 'actions' })
  // so we can render it through the central TableActions instead.
  const visibleColumns = useMemo(
    () => baseColumns.filter((c) => c.key !== 'actions'),
    [baseColumns]
  );

  const mobile = mobileConfig || registry?.mobile || {
    mobileTitleKey: visibleColumns[0]?.key,
    mobileSubtitleKey: visibleColumns[1]?.key,
    mobileDetailKeys: visibleColumns.slice(2).map((c) => c.key),
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
  const [containerWidth, setContainerWidth] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(getViewportWidth());

  useLayoutEffect(() => {
    if (typeof window === 'undefined' || !wrapperRef.current) return undefined;
    const el = wrapperRef.current;
    setContainerWidth(el.getBoundingClientRect().width);
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = entry.contentRect?.width || entry.target?.getBoundingClientRect().width || 0;
      setContainerWidth(w);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    function onResize() {
      setViewportWidth(getViewportWidth());
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const requiredWidth = useMemo(
    () =>
      computeRequiredTableWidth(visibleColumns, {
        includeSelection: selectable,
        includeSerial: showSerial,
        actionsCount: resolvedActions.length,
      }),
    [visibleColumns, selectable, showSerial, resolvedActions.length]
  );

  const renderAsCards = useMemo(
    () =>
      shouldRenderCards({
        containerWidth,
        viewportWidth,
        requiredWidth,
        visibleColumns,
        displayMode,
      }),
    [containerWidth, viewportWidth, requiredWidth, visibleColumns, displayMode]
  );

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
      defaultSearchMatch(row, query, visibleColumns, resolvedSearchKeys)
    );
  }, [effectiveRows, query, searchable, visibleColumns, resolvedSearchKeys]);

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
        const col = visibleColumns.find((c) => c.key === columnKey);
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
    [tableKey, onInlineUpdate, isViewer, inlineEditDisabled, visibleColumns]
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
                columns={visibleColumns}
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
              <table className="app-table">
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
                    {visibleColumns.map((c) => (
                      <th
                        key={c.key}
                        style={c.width ? { width: c.width } : undefined}
                      >
                        {c.label}
                      </th>
                    ))}
                    {resolvedActions.length > 0 && (
                      <th className="app-table-actions" style={{ minWidth: 120 }}>
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
                      columns={visibleColumns}
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
