/**
 * app-table-row.jsx
 *
 * Render a single table row. Uses InlineEditCell for any column flagged
 * `editable`. Renders an Actions column at the end when actions are
 * supplied. Every cell respects column priority, truncation and tooltip
 * settings.
 */

import Badge from './Badge.jsx';
import InlineEditCell from './inline-edit-cell.jsx';
import TableActions from './table-actions.jsx';
import { getBadgeTone } from '../../config/table-columns.js';

function formatDateValue(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function renderDefaultCell(value, column, row) {
  if (typeof column.render === 'function') {
    return column.render(row);
  }
  if (column.type === 'date') {
    return <span>{formatDateValue(value)}</span>;
  }
  if (column.type === 'badge') {
    if (value === null || value === undefined || value === '') return <span>—</span>;
    const tone = column.badgeMap?.[value] || getBadgeTone(value);
    return <Badge tone={tone}>{column.formatBadgeLabel ? column.formatBadgeLabel(value) : String(value)}</Badge>;
  }
  if (column.type === 'tags') {
    const list = Array.isArray(value) ? value : [];
    if (list.length === 0) return <span className="text-xs text-slate-400">—</span>;
    return (
      <span className="flex flex-wrap gap-1">
        {list.map((t) => (
          <Badge key={t} tone={column.tagTone || 'indigo'}>
            {t}
          </Badge>
        ))}
      </span>
    );
  }
  if (value === null || value === undefined || value === '') return <span>—</span>;
  if (column.truncate) {
    return (
      <span
        className="table-truncate"
        data-tooltip={column.tooltip ? String(value) : undefined}
      >
        {value}
      </span>
    );
  }
  return <span>{value}</span>;
}

export default function AppTableRow({
  row,
  rowKey,
  index,
  start,
  columns,
  inlineEdit,
  isViewer,
  actions,
  actionHandlers,
  actionPermissions,
  selectable,
  selected,
  onSelectChange,
  showSerial = false,
}) {
  return (
    <tr className="app-table-row">
      {selectable && (
        <td className="app-table-cell" style={{ width: 44 }}>
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelectChange?.(row[rowKey], e.target.checked)}
            aria-label={`Select row ${index + 1}`}
            className="h-4 w-4 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
        </td>
      )}
      {showSerial && (
        <td className="app-table-cell" style={{ width: 64 }}>
          {start + index + 1}.
        </td>
      )}
      {columns.map((column) => {
        // SR. No. column renders the running index when no explicit
        // render is supplied — mock data does not carry an `srNo` field.
        if (column.key === 'srNo' && typeof column.render !== 'function') {
          return (
            <td
              key={column.key}
              className="app-table-cell"
              style={column.width ? { width: column.width } : undefined}
            >
              {start + index + 1}.
            </td>
          );
        }
        const value = row[column.key];
        const display = renderDefaultCell(value, column, row);

        if (column.editable && inlineEdit?.onSave) {
          return (
            <td
              key={column.key}
              className={`app-table-cell ${column.truncate ? 'app-table-cell-truncate' : ''}`}
              style={column.width ? { width: column.width } : undefined}
            >
              <InlineEditCell
                value={value}
                column={column}
                rowId={row[rowKey]}
                row={row}
                disabled={isViewer || inlineEdit.disabled}
                onSave={inlineEdit.onSave}
                renderDisplay={() => display}
              />
            </td>
          );
        }

        return (
          <td
            key={column.key}
            className={`app-table-cell ${column.truncate ? 'app-table-cell-truncate' : ''}`}
            style={column.width ? { width: column.width } : undefined}
          >
            {display}
          </td>
        );
      })}
      {actions && actions.length > 0 && (
        <td className="app-table-cell app-table-actions" style={{ width: 110 }}>
          <TableActions
            row={row}
            actions={actions}
            handlers={actionHandlers}
            permissions={actionPermissions}
          />
        </td>
      )}
    </tr>
  );
}
