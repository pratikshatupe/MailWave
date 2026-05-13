/**
 * contact-segments.jsx
 *
 * Manage segments (saved filters) for the Contact module. Create / edit /
 * delete segments backed by the local service layer.
 */

import { useMemo, useState } from 'react';
import {
  Filter,
  Plus,
  X,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Toast from '../../components/ui/Toast.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import InputField from '../../components/ui/InputField.jsx';
import TextAreaField from '../../components/ui/TextAreaField.jsx';
import SelectField from '../../components/ui/SelectField.jsx';
import SegmentBuilder from '../../components/contacts/segment-builder.jsx';
import AppTable from '../../components/ui/app-table.jsx';
import { LABELS } from '../../config/labels.js';
import { COLUMN_PRIORITY } from '../../config/table-responsive-config.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  canManageSegments,
  filterByTenant,
} from '../../config/contact-permissions.js';
import {
  getSegments,
  createSegment,
  updateSegment,
  deleteSegment,
  getContacts,
  evaluateSegment,
} from '../../services/contact-service.js';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
];

const EMPTY_FORM = {
  name: '',
  description: '',
  rules: [{ field: 'status', operator: 'equals', value: 'subscribed' }],
  combinator: 'AND',
  status: 'active',
};

export default function ContactSegments() {
  const { user, role } = useAuth();
  const [tick, setTick] = useState(0);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const allowManage = canManageSegments(role);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const segments = useMemo(() => getSegments(), [tick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allContacts = useMemo(() => getContacts({}), [tick]);
  const scope = useMemo(
    () => filterByTenant(role, allContacts, user?.tenantId),
    [role, allContacts, user?.tenantId]
  );

  function refresh() {
    setTick((t) => t + 1);
  }
  function showToast(type, message) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3200);
  }

  function openCreate() {
    setEditing({ mode: 'create' });
    setForm(EMPTY_FORM);
    setErrors({});
  }

  function openEdit(segment) {
    setEditing({ mode: 'edit', id: segment.id });
    setForm({
      name: segment.name || '',
      description: segment.description || '',
      rules: segment.rules?.length
        ? segment.rules
        : [{ field: 'status', operator: 'equals', value: 'subscribed' }],
      combinator: segment.combinator || 'AND',
      status: segment.status || 'active',
    });
    setErrors({});
  }

  function closeModal() {
    setEditing(null);
    setErrors({});
  }

  function setField(name, value) {
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = 'Segment Name is required.';
    if (form.rules.length === 0) next.rules = 'Add at least one rule.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    if (editing.mode === 'create') {
      createSegment(form);
      showToast('success', 'Segment created successfully.');
    } else {
      updateSegment(editing.id, form);
      showToast('success', 'Segment updated successfully.');
    }
    refresh();
    closeModal();
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteSegment(deleteTarget.id);
    setDeleteTarget(null);
    refresh();
    showToast('success', 'Segment deleted successfully.');
  }

  const previewCount = useMemo(() => {
    if (!editing) return undefined;
    return evaluateSegment(form, scope).length;
  }, [editing, form, scope]);

  const segmentRows = useMemo(
    () =>
      segments.map((s) => ({
        ...s,
        contactsCount: evaluateSegment(s, scope).length,
        rulesDisplay: (s.rules || [])
          .map((r) => `${r.field} ${r.operator} ${r.value || '—'}`)
          .join('  •  '),
      })),
    [segments, scope]
  );

  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: 'Segment Name',
        priority: COLUMN_PRIORITY.CRITICAL,
        searchable: true,
        truncate: true,
        render: (row) => (
          <div className="min-w-0">
            <div className="font-semibold text-slate-900 dark:text-white">{row.name}</div>
            {row.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400">{row.description}</p>
            )}
          </div>
        ),
      },
      {
        key: 'rulesDisplay',
        label: 'Rules',
        priority: COLUMN_PRIORITY.MEDIUM,
        truncate: true,
        tooltip: true,
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
      {
        key: 'status',
        label: LABELS.status,
        priority: COLUMN_PRIORITY.HIGH,
        render: (row) => (
          <Badge
            tone={
              row.status === 'active'
                ? 'emerald'
                : row.status === 'draft'
                ? 'amber'
                : 'slate'
            }
          >
            {row.status || 'active'}
          </Badge>
        ),
      },
    ],
    []
  );

  const mobileConfig = useMemo(
    () => ({
      mobileTitleKey: 'name',
      mobileSubtitleKey: 'rulesDisplay',
      mobileBadgeKey: 'status',
      mobileDetailKeys: ['contactsCount', 'createdAt'],
      mobileActionKeys: allowManage ? ['edit', 'delete'] : [],
    }),
    [allowManage]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Segments"
        description="Create dynamic groups of contacts based on rules and attributes."
        icon={Filter}
        actions={
          allowManage && (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Create Segment
            </Button>
          )
        }
      />

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <AppTable
        tableKey="contactSegments"
        rows={segmentRows}
        rowKey="id"
        role={role}
        showSerial
        columns={columns}
        mobileConfig={mobileConfig}
        actions={allowManage ? ['edit', 'delete'] : []}
        actionHandlers={{
          edit: (row) => openEdit(row),
          delete: (row) => setDeleteTarget(row),
        }}
        empty="No segments yet."
      />

      {editing && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 py-6">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={closeModal}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-700 dark:bg-slate-900"
          >
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {editing.mode === 'edit' ? 'Edit Segment' : 'Create Segment'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </header>
            <form onSubmit={handleSubmit} className="space-y-4 p-6" noValidate>
              <InputField
                name="name"
                label="Segment Name"
                placeholder="Enter Segment Name"
                required
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                error={errors.name}
              />
              <TextAreaField
                name="description"
                label="Description"
                placeholder="Optional description"
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                maxLength={300}
              />
              <SegmentBuilder
                rules={form.rules}
                combinator={form.combinator}
                onChange={(next) =>
                  setForm((p) => ({
                    ...p,
                    rules: next.rules,
                    combinator: next.combinator,
                  }))
                }
                previewCount={previewCount}
              />
              {errors.rules && (
                <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                  {errors.rules}
                </p>
              )}
              <SelectField
                name="status"
                label="Status"
                value={form.status}
                onChange={(e) => setField('status', e.target.value)}
                options={STATUS_OPTIONS}
              />
              <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end dark:border-slate-800">
                <Button type="button" variant="ghost" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editing.mode === 'edit' ? 'Update Segment' : 'Create Segment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete segment"
        description={
          deleteTarget
            ? `Are you sure you want to delete segment "${deleteTarget.name}"?`
            : ''
        }
        confirmLabel="Delete"
        variant="danger"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
