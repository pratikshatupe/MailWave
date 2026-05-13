/**
 * app-table-card.jsx
 *
 * Mobile-friendly card view of a row. Reads the mobile config supplied to
 * AppTable (title, subtitle, badge, detail keys, action keys) so the same
 * component is reused for every module table.
 */

import InlineEditCell from './inline-edit-cell.jsx';
import TableActions from './table-actions.jsx';
import { renderDefaultCell } from './app-table-row.jsx';

function findColumn(columns, key) {
  return columns.find((c) => c.key === key) || null;
}

export default function AppTableCard({
  row,
  rowKey,
  columns,
  mobile,
  inlineEdit,
  isViewer,
  actions,
  actionHandlers,
  actionPermissions,
}) {
  if (!row || !mobile) return null;

  const titleColumn = findColumn(columns, mobile.mobileTitleKey);
  const subtitleColumn = mobile.mobileSubtitleKey ? findColumn(columns, mobile.mobileSubtitleKey) : null;
  const badgeColumn = mobile.mobileBadgeKey ? findColumn(columns, mobile.mobileBadgeKey) : null;

  const allDetailKeys = mobile.mobileDetailKeys || [];
  const primaryKeys = allDetailKeys.slice(0, 4);
  const moreKeys = allDetailKeys.slice(4);

  const titleValue = titleColumn ? row[titleColumn.key] : null;
  const subtitleValue = subtitleColumn ? row[subtitleColumn.key] : null;

  return (
    <article className="app-table-mobile-card">
      <header className="card-header">
        <div className="min-w-0 flex-1">
          <div className="card-title">{titleValue || '—'}</div>
          {subtitleColumn && subtitleValue && (
            <div className="card-subtitle">{subtitleValue}</div>
          )}
        </div>
        {badgeColumn && row[badgeColumn.key] && (
          <div>{renderDefaultCell(row[badgeColumn.key], { ...badgeColumn, type: 'badge' }, row)}</div>
        )}
      </header>

      {primaryKeys.length > 0 && (
        <dl className="card-details">
          {primaryKeys.map((key) => {
            const col = findColumn(columns, key);
            if (!col) return null;
            const value = row[col.key];
            return (
              <div key={key}>
                <dt>{col.label}</dt>
                <dd>
                  {col.editable && inlineEdit?.onSave ? (
                    <InlineEditCell
                      value={value}
                      column={col}
                      rowId={row[rowKey]}
                      disabled={isViewer || inlineEdit.disabled}
                      onSave={inlineEdit.onSave}
                      renderDisplay={() => renderDefaultCell(value, col, row)}
                    />
                  ) : (
                    renderDefaultCell(value, col, row)
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      )}

      {moreKeys.length > 0 && (
        <details className="app-table-more-details">
          <summary>More Details</summary>
          <dl className="card-details mt-2">
            {moreKeys.map((key) => {
              const col = findColumn(columns, key);
              if (!col) return null;
              const value = row[col.key];
              return (
                <div key={key}>
                  <dt>{col.label}</dt>
                  <dd>{renderDefaultCell(value, col, row)}</dd>
                </div>
              );
            })}
          </dl>
        </details>
      )}

      {actions && actions.length > 0 && (
        <div className="app-table-card-actions">
          <TableActions
            row={row}
            actions={actions}
            handlers={actionHandlers}
            permissions={actionPermissions}
          />
        </div>
      )}
    </article>
  );
}
