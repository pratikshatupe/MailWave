/**
 * template-list.jsx
 *
 * Templates listing — table on desktop, card grid on mobile / tablet.
 * Uses the central AppTable so search, pagination, responsive switching,
 * actions and dark mode behave exactly like every other module table in
 * the project.
 */

import { useMemo } from 'react';
import AppTable from '../ui/app-table.jsx';
import Badge from '../ui/Badge.jsx';
import { TEMPLATE_CATEGORIES, EDITOR_MODES } from '../../services/template-service.js';

const STATUS_TONE = {
  draft: 'slate',
  published: 'emerald',
  archived: 'rose',
};

const CATEGORY_LABEL = TEMPLATE_CATEGORIES.reduce((acc, c) => {
  acc[c.value] = c.label;
  return acc;
}, {});

const EDITOR_LABEL = EDITOR_MODES.reduce((acc, e) => {
  acc[e.value] = e.label;
  return acc;
}, {});

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function TemplateList({
  templates = [],
  role,
  canCreate,
  canEdit,
  canDelete,
  canPublish,
  canArchive,
  isReadOnly,
  onPreview,
  onEdit,
  onDuplicate,
  onDelete,
  onPublish,
  onArchive,
  topBar,
  filters,
  emptyMessage,
}) {
  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: 'Template',
        priority: 'critical',
        render: (row) => (
          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => onPreview?.(row)}
              className="cursor-pointer text-left font-semibold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-300"
            >
              {row.name || 'Untitled template'}
            </button>
            {row.description && (
              <span className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                {row.description}
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'subject',
        label: 'Subject',
        priority: 'high',
        truncate: true,
        render: (row) => (
          <span className="truncate text-sm text-slate-600 dark:text-slate-300">
            {row.subject || '—'}
          </span>
        ),
      },
      {
        key: 'category',
        label: 'Category',
        priority: 'high',
        render: (row) => (
          <Badge tone="indigo">
            {CATEGORY_LABEL[row.category] || row.category || '—'}
          </Badge>
        ),
      },
      {
        key: 'editorMode',
        label: 'Editor',
        priority: 'medium',
        render: (row) => (
          <Badge tone="slate">
            {EDITOR_LABEL[row.editorMode] || row.editorMode || '—'}
          </Badge>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        priority: 'high',
        render: (row) => (
          <Badge tone={STATUS_TONE[row.status] || 'slate'}>
            {row.status || 'draft'}
          </Badge>
        ),
      },
      {
        key: 'mergeTags',
        label: 'Tags',
        priority: 'medium',
        render: (row) => (
          <span className="text-xs text-slate-600 dark:text-slate-300">
            {(row.mergeTags || []).length}
          </span>
        ),
      },
      {
        key: 'updatedAt',
        label: 'Updated',
        priority: 'medium',
        render: (row) => (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {formatDate(row.updatedAt || row.createdAt)}
          </span>
        ),
      },
    ],
    [onPreview]
  );

  const actions = useMemo(() => {
    const list = ['view'];
    if (canEdit && !isReadOnly) list.push('edit');
    if (canCreate && !isReadOnly) list.push('duplicate');
    if (canPublish && !isReadOnly) list.push('publish');
    if (canArchive && !isReadOnly) list.push('archive');
    if (canDelete && !isReadOnly) list.push('delete');
    return list;
  }, [canEdit, canCreate, canDelete, canPublish, canArchive, isReadOnly]);

  const actionHandlers = {
    view: (row) => onPreview?.(row),
    edit: (row) => onEdit?.(row),
    duplicate: (row) => onDuplicate?.(row),
    delete: (row) => onDelete?.(row),
    publish: (row) => onPublish?.(row),
    archive: (row) => onArchive?.(row),
  };

  return (
    <AppTable
      columns={columns}
      rows={templates}
      rowKey="id"
      role={role}
      actions={actions}
      actionHandlers={actionHandlers}
      mobileConfig={{
        mobileTitleKey: 'name',
        mobileSubtitleKey: 'subject',
        mobileBadgeKey: 'status',
        mobileDetailKeys: ['category', 'editorMode', 'updatedAt'],
        mobileActionKeys: actions,
      }}
      searchable={false}
      pageable
      defaultPageSize={10}
      filters={filters}
      topBar={topBar}
      empty={emptyMessage}
    />
  );
}
