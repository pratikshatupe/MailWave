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
  filters,
  rightSlot,
  tagOptions = [],
  segmentOptions = [],
  empty,
  toastSink,
}) {
  const isViewer = role === ROLES.VIEWER;

  const tagOptionList = useMemo(
    () => Array.from(new Set(tagOptions)).map((t) => ({ value: t, label: t })),
    [tagOptions]
  );
  const segmentOptionList = useMemo(
    () => Array.from(new Set(segmentOptions)).map((s) => ({ value: s, label: s })),
    [segmentOptions]
  );

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
        if (c.key === 'tags') {
          return { ...c, getOptions: () => tagOptionList };
        }
        if (c.key === 'segments') {
          return { ...c, getOptions: () => segmentOptionList };
        }
        return c;
      });
  }, [showOrganisation, tagOptionList, segmentOptionList]);

  // Row actions are intentionally limited to View + Delete across every
  // module. Edit, status change, tag change, unsubscribe etc. happen via
  // inline edit on the field itself (see inline-edit-cell.jsx) or from
  // the contact's detail page — keeping the action column compact and
  // consistent product-wide.
  const actions = useMemo(() => {
    const keys = ['view'];
    if (canDelete && !isViewer) keys.push('delete');
    return keys;
  }, [canDelete, isViewer]);

  const actionHandlers = {
    view: (row) => onView?.(row),
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
      filters={filters}
      rightSlot={rightSlot}
      topBar={!isViewer && canBulkDelete ? bulkBar : null}
      empty={empty}
    />
  );
}
