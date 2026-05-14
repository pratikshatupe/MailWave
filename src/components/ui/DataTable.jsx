/**
 * DataTable
 *
 * Backward-compatible thin wrapper around the central AppTable. Older
 * module pages built before the AppTable system continue to work through
 * the same `columns / rows` API while inheriting the new responsive card
 * layout, central pagination and search field for free.
 *
 * For new code, prefer importing AppTable directly so you can also pass
 * `tableKey`, inline-edit handlers, mobile card config and action rules.
 *
 * The `module` prop is forwarded straight to AppTable so inline edit and
 * row write actions can be gated against the central permissions matrix.
 */

import AppTable from './app-table.jsx';

export default function DataTable({
  columns = [],
  rows = [],
  rowKey = 'id',
  empty,
  searchable = true,
  pageable = true,
  pageSize,
  actionsCount,
  className = '',
  tableKey,
  mobileConfig,
  actions,
  actionHandlers,
  actionPermissions,
  role,
  module,
  displayMode,
}) {
  // Legacy column shape: { key, label, render }. We let AppTable preserve
  // it as-is — the row renderer treats `column.render(row)` as the source
  // of truth when present.
  const resolvedColumns = columns.map((c) =>
    c.key === 'actions'
      ? { ...c, label: c.label || (actionsCount > 1 ? 'Actions' : 'Action') }
      : c
  );

  return (
    <AppTable
      tableKey={tableKey}
      columns={resolvedColumns}
      rows={rows}
      rowKey={rowKey}
      role={role}
      module={module}
      empty={empty}
      searchable={searchable}
      pageable={pageable}
      defaultPageSize={pageSize}
      mobileConfig={mobileConfig}
      actions={actions}
      actionHandlers={actionHandlers}
      actionPermissions={actionPermissions}
      displayMode={displayMode}
      className={className}
    />
  );
}
