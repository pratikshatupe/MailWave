/**
 * contact-tags.jsx
 *
 * Manage contact tags: create, edit colour, delete. The tag list is
 * stored in localStorage via the contact service.
 */

import { useMemo, useState } from 'react';
import { Tags, Plus } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Toast from '../../components/ui/Toast.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import TagManager from '../../components/contacts/tag-manager.jsx';
import AppTable from '../../components/ui/app-table.jsx';
import { LABELS } from '../../config/labels.js';
import { TAG_COLOURS } from '../../config/contact-fields.js';
import { COLUMN_PRIORITY } from '../../config/table-responsive-config.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  canManageTags,
  filterByTenant,
} from '../../config/contact-permissions.js';
import {
  getTags,
  createTag,
  updateTag,
  deleteTag,
  countContactsForTag,
  getContacts,
} from '../../services/contact-service.js';

function colourHex(value) {
  return TAG_COLOURS.find((c) => c.value === value)?.hex || '#6366f1';
}

export default function ContactTags() {
  const { role, user } = useAuth();
  const [tick, setTick] = useState(0);
  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const allowManage = canManageTags(role);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tags = useMemo(() => getTags(), [tick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allContacts = useMemo(() => getContacts({}), [tick]);
  const scoped = useMemo(
    () => filterByTenant(role, allContacts, user?.tenantId),
    [role, allContacts, user?.tenantId]
  );
  const counts = useMemo(() => {
    const map = {};
    scoped.forEach((c) => {
      (c.tags || []).forEach((t) => {
        map[t] = (map[t] || 0) + 1;
      });
    });
    return map;
  }, [scoped]);

  const tagRows = useMemo(
    () =>
      tags.map((t) => ({
        ...t,
        contactsCount: counts[t.name] || countContactsForTag(t.name, user?.tenantId),
      })),
    [tags, counts, user?.tenantId]
  );

  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: 'Tag Name',
        priority: COLUMN_PRIORITY.CRITICAL,
        searchable: true,
        render: (row) => (
          <div className="min-w-0">
            <Badge tone="indigo">{row.name}</Badge>
            {row.description && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {row.description}
              </p>
            )}
          </div>
        ),
      },
      {
        key: 'colour',
        label: 'Colour',
        priority: COLUMN_PRIORITY.MEDIUM,
        render: (row) => (
          <span className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <span
              className="inline-block h-4 w-4 rounded-full border border-slate-200 dark:border-slate-700"
              style={{ backgroundColor: colourHex(row.colour) }}
            />
            <span className="capitalize">{row.colour || '—'}</span>
          </span>
        ),
      },
      {
        key: 'contactsCount',
        label: 'Contacts Count',
        priority: COLUMN_PRIORITY.HIGH,
        width: '140px',
      },
      {
        key: 'createdAt',
        label: LABELS.createdAt,
        type: 'date',
        priority: COLUMN_PRIORITY.LOW,
        width: '120px',
      },
    ],
    []
  );

  const mobileConfig = useMemo(
    () => ({
      mobileTitleKey: 'name',
      mobileSubtitleKey: 'colour',
      mobileDetailKeys: ['contactsCount', 'createdAt'],
      mobileActionKeys: allowManage ? ['edit', 'delete'] : [],
    }),
    [allowManage]
  );

  function refresh() {
    setTick((t) => t + 1);
  }
  function showToast(type, message) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3200);
  }

  function handleCreate(payload) {
    createTag(payload);
    setOpenCreate(false);
    refresh();
    showToast('success', 'Tag created successfully.');
  }

  function handleEdit(payload) {
    if (!editing) return;
    updateTag(editing.id, payload);
    setEditing(null);
    refresh();
    showToast('success', 'Tag updated successfully.');
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteTag(deleteTarget.id);
    setDeleteTarget(null);
    refresh();
    showToast('success', 'Tag deleted successfully.');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tags"
        description="Group contacts with reusable tags and colours."
        icon={Tags}
        actions={
          allowManage && (
            <Button onClick={() => setOpenCreate(true)}>
              <Plus className="h-4 w-4" /> Create Tag
            </Button>
          )
        }
      />

      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      <AppTable
        tableKey="contactTags"
        rows={tagRows}
        rowKey="id"
        role={role}
        showSerial
        columns={columns}
        mobileConfig={mobileConfig}
        actions={allowManage ? ['edit', 'delete'] : []}
        actionHandlers={{
          edit: (row) => setEditing(row),
          delete: (row) => setDeleteTarget(row),
        }}
        empty="No tags yet."
      />

      <TagManager
        open={openCreate}
        mode="create"
        existingTags={tags}
        onCancel={() => setOpenCreate(false)}
        onSubmit={handleCreate}
      />
      <TagManager
        open={Boolean(editing)}
        mode="edit"
        initial={editing}
        existingTags={tags}
        onCancel={() => setEditing(null)}
        onSubmit={handleEdit}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete tag"
        description={
          deleteTarget ? `Are you sure you want to delete tag "${deleteTarget.name}"?` : ''
        }
        confirmLabel="Delete"
        variant="danger"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
