/**
 * contact-table.jsx
 *
 * Thin wrapper around the central AppTable. Provides Contacts-specific
 * column overrides (Organisation column toggle, link to detail page,
 * status tone helpers) and wires inline-edit through the contact service.
 * All responsive, mobile-card, pagination, search and action behaviour
 * comes from AppTable so changing one file updates every table in the
 * product.
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import AppTable from '../ui/app-table.jsx';
import Badge from '../ui/Badge.jsx';
import { TABLE_COLUMNS } from '../../config/table-columns.js';
import {
  getStatusLabel,
  getStatusTone,
} from '../../config/contact-fields.js';
import { ROLES } from '../../config/roles.js';
import { updateContact } from '../../services/contact-service.js';

export default function ContactTable({
  contacts = [],
  role,
  canEdit = false,
  canDelete = false,
  canBulkDelete = false,
  canManageTags = false,
  canResubscribe = false,
  showOrganisation = false,
  selectedIds = [],
  onSelectionChange,
  onView,
  onEdit,
  onDelete,
  onAddTag,
  onUnsubscribe,
  onInlineUpdated,
  bulkBar,
  toastSink,
}) {
  const isViewer = role === ROLES.VIEWER;

  // Decorate the central column registry: render fullName as a link to
  // the detail page and use the contact-specific tone helpers for the
  // status badge.
  const columns = useMemo(() => {
    const registry = TABLE_COLUMNS.contacts.columns;
    return registry
      .filter((c) => (showOrganisation ? true : c.key !== 'organisationName'))
      .map((c) => {
        if (c.key === 'fullName') {
          return {
            ...c,
            render: (row) => (
              <Link
                to={`/app/contacts/${row.id}`}
                className="font-medium text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-300"
              >
                {row.fullName}
              </Link>
            ),
          };
        }
        if (c.key === 'status') {
          return {
            ...c,
            render: (row) => (
              <Badge tone={getStatusTone(row.status)}>
                {getStatusLabel(row.status)}
              </Badge>
            ),
          };
        }
        return c;
      });
  }, [showOrganisation]);

  const actions = useMemo(() => {
    const keys = ['view'];
    if (canEdit && !isViewer) keys.push('edit');
    if (canManageTags && !isViewer) keys.push('addTag');
    if (!isViewer || canResubscribe) keys.push('unsubscribe');
    if (canDelete && !isViewer) keys.push('delete');
    return keys;
  }, [canEdit, canDelete, canManageTags, canResubscribe, isViewer]);

  const actionHandlers = {
    view: (row) => onView?.(row),
    edit: (row) => onEdit?.(row),
    addTag: (row) => onAddTag?.(row),
    unsubscribe: (row) => onUnsubscribe?.(row),
    delete: (row) => onDelete?.(row),
  };

  function handleInline(rowId, columnKey, value) {
    const updated = updateContact(rowId, { [columnKey]: value });
    if (!updated) return { ok: false, error: 'Could not update contact.' };
    if (typeof toastSink === 'function') {
      toastSink('success', 'Contact updated successfully.');
    }
    if (typeof onInlineUpdated === 'function') onInlineUpdated();
    return { ok: true, value };
  }

  return (
    <AppTable
      tableKey="contacts"
      columns={columns}
      rows={contacts}
      rowKey="id"
      role={role}
      actions={actions}
      actionHandlers={actionHandlers}
      onInlineUpdate={handleInline}
      selectable={!isViewer && canBulkDelete}
      selectedIds={selectedIds}
      onSelectionChange={onSelectionChange}
      searchable={false}
      topBar={!isViewer && canBulkDelete ? bulkBar : null}
    />
  );
}
