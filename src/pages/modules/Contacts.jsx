/**
 * contacts.jsx
 *
 * Role-aware Contact Management module. Reads / writes through the
 * frontend service layer (which persists to localStorage), so the entire
 * page works locally with no backend.
 *
 * Roles:
 *  - Super Admin → sees all organisations; has Organisation filter and
 *    column.
 *  - Business Admin / Marketing Manager / Viewer → scoped to their tenant.
 *  - Individual User → scoped to their own workspace.
 *  - Viewer → read-only (no Add / Import / Edit / Delete / bulk buttons).
 *
 * Marketing Manager only deletes when contactPermissions.delete is true.
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Contact as ContactIcon,
  Download,
  Plus,
  Upload,
  Users,
  UserCheck,
  UserMinus,
  AlertTriangle,
  ShieldAlert,
  Layers,
  MessageCircle,
  CalendarPlus,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Toast from '../../components/ui/Toast.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import ContactTable from '../../components/contacts/contact-table.jsx';
import ContactFormModal from '../../components/contacts/contact-form-modal.jsx';
import ImportContactsModal from '../../components/contacts/import-contacts-modal.jsx';
import ContactFilterBar from '../../components/contacts/contact-filter-bar.jsx';
import TagManager from '../../components/contacts/tag-manager.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../config/roles.js';
import { CONTACT_STATUSES } from '../../config/contact-fields.js';
import {
  canCreate,
  canEdit,
  canDelete,
  canExport,
  canImport,
  canBulkDelete,
  canManageTags,
  canResubscribe,
  canSeeAllOrganisations,
  filterByTenant,
} from '../../config/contact-permissions.js';
import {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
  bulkDeleteContacts,
  addTagToContacts,
  removeTagFromContacts,
  unsubscribeContacts,
  exportContacts,
  downloadCsv,
  getTags,
  getSegments,
  getContactStats,
} from '../../services/contact-service.js';

const DEFAULT_FILTERS = {
  q: '',
  status: '',
  source: '',
  tag: '',
  segment: '',
  whatsappOptInStatus: '',
  organisationName: '',
  from: '',
  to: '',
};

// Marketing Manager toggle: in a real product this comes from the role
// admin screen. For local testing, set to false so Delete buttons hide.
const CONTACT_PERMISSIONS = { delete: false, resubscribe: false };

export default function Contacts() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    status: searchParams.get('status') || '',
  }));
  const [tick, setTick] = useState(0);
  const [toast, setToast] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editing, setEditing] = useState(null);
  const [tagging, setTagging] = useState(null);
  const [bulkTagOpen, setBulkTagOpen] = useState(false);
  const [bulkTagMode, setBulkTagMode] = useState('add'); // 'add' | 'remove'
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [unsubscribeTarget, setUnsubscribeTarget] = useState(null);

  const tenantId = user?.tenantId;
  const organisationName = user?.tenantId === 'platform' ? 'Platform' : '';

  const allowSeeAllOrgs = canSeeAllOrganisations(role);
  const allowCreate = canCreate(role);
  const allowEdit = canEdit(role);
  const allowDelete = canDelete(role, undefined, CONTACT_PERMISSIONS);
  const allowExport = canExport(role);
  const allowImport = canImport(role);
  const allowBulkDelete = canBulkDelete(role, CONTACT_PERMISSIONS);
  const allowManageTags = canManageTags(role);
  const allowResubscribe = canResubscribe(role, CONTACT_PERMISSIONS);

  /* ---------------------- Data load (re-runs on tick) --------------------- */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allContacts = useMemo(() => getContacts({}), [tick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tags = useMemo(() => getTags(), [tick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const segments = useMemo(() => getSegments(), [tick]);

  const tenantScopedContacts = useMemo(
    () => filterByTenant(role, allContacts, tenantId),
    [role, allContacts, tenantId]
  );

  const filtered = useMemo(() => {
    let next = tenantScopedContacts.slice();
    const q = (filters.q || '').toLowerCase().trim();
    if (filters.status) next = next.filter((c) => c.status === filters.status);
    if (filters.source) next = next.filter((c) => c.source === filters.source);
    if (filters.tag) next = next.filter((c) => (c.tags || []).includes(filters.tag));
    if (filters.segment) next = next.filter((c) => (c.segments || []).includes(filters.segment));
    if (filters.whatsappOptInStatus) {
      next = next.filter((c) => c.whatsappOptInStatus === filters.whatsappOptInStatus);
    }
    if (filters.organisationName && allowSeeAllOrgs) {
      next = next.filter((c) => c.organisationName === filters.organisationName);
    }
    if (filters.from) {
      const t = new Date(filters.from).getTime();
      next = next.filter((c) => new Date(c.createdAt).getTime() >= t);
    }
    if (filters.to) {
      const t = new Date(filters.to).getTime() + 24 * 3600 * 1000;
      next = next.filter((c) => new Date(c.createdAt).getTime() <= t);
    }
    if (q) {
      next = next.filter((c) => {
        const hay = [
          c.fullName,
          c.emailId,
          c.contactNumber,
          c.city,
          c.source,
          c.organisationName,
          (c.tags || []).join(' '),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(q);
      });
    }
    return next;
  }, [tenantScopedContacts, filters, allowSeeAllOrgs]);

  const stats = useMemo(() => getContactStats(tenantScopedContacts), [tenantScopedContacts]);

  const organisationOptions = useMemo(() => {
    if (!allowSeeAllOrgs) return [];
    return Array.from(
      new Set(allContacts.map((c) => c.organisationName).filter(Boolean))
    );
  }, [allContacts, allowSeeAllOrgs]);

  const tagOptions = useMemo(
    () =>
      Array.from(
        new Set([
          ...tags.map((t) => t.name),
          ...tenantScopedContacts.flatMap((c) => c.tags || []),
        ])
      ),
    [tags, tenantScopedContacts]
  );
  const segmentOptions = useMemo(
    () =>
      Array.from(
        new Set([
          ...segments.map((s) => s.name),
          ...tenantScopedContacts.flatMap((c) => c.segments || []),
        ])
      ),
    [segments, tenantScopedContacts]
  );

  function refresh() {
    setTick((t) => t + 1);
  }

  function showToast(type, message) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3200);
  }

  /* ---------------------- KPI clicks set status filter -------------------- */
  function setStatusFilter(status) {
    setFilters((p) => ({ ...p, status }));
  }

  function setWhatsappFilter() {
    setFilters((p) => ({ ...p, whatsappOptInStatus: 'opted_in' }));
  }

  function setNewThisMonth() {
    const d = new Date();
    d.setDate(1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setFilters((p) => ({ ...p, from: `${yyyy}-${mm}-${dd}`, to: '' }));
  }

  function clearFilters() {
    setFilters(DEFAULT_FILTERS);
    setSearchParams({});
  }

  /* ------------------------------ Handlers ------------------------------ */
  function handleCreateSubmit(payload) {
    createContact(payload, { tenantId, organisationName });
    refresh();
    setShowCreate(false);
    showToast('success', 'Contact created successfully.');
  }

  function handleEditSubmit(payload) {
    updateContact(editing.id, payload);
    refresh();
    setEditing(null);
    showToast('success', 'Contact updated successfully.');
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteContact(deleteTarget.id);
    setDeleteTarget(null);
    setSelectedIds((ids) => ids.filter((id) => id !== deleteTarget.id));
    refresh();
    showToast('success', 'Contact deleted successfully.');
  }

  function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    bulkDeleteContacts(selectedIds);
    setBulkDeleteOpen(false);
    setSelectedIds([]);
    refresh();
    showToast('success', 'Contacts deleted successfully.');
  }

  function handleAddTag({ tagName }) {
    if (!tagging || !tagName) return;
    addTagToContacts([tagging.id], tagName);
    setTagging(null);
    refresh();
    showToast('success', 'Tag added successfully.');
  }

  function handleBulkTag({ tagName }) {
    if (!tagName || selectedIds.length === 0) return;
    if (bulkTagMode === 'add') {
      addTagToContacts(selectedIds, tagName);
      showToast('success', 'Tag added successfully.');
    } else {
      removeTagFromContacts(selectedIds, tagName);
      showToast('success', 'Tag removed successfully.');
    }
    setBulkTagOpen(false);
    refresh();
  }

  function handleUnsubscribeOne() {
    if (!unsubscribeTarget) return;
    unsubscribeContacts([unsubscribeTarget.id], 'Unsubscribed by admin');
    setUnsubscribeTarget(null);
    refresh();
    showToast('success', 'Contact unsubscribed successfully.');
  }

  function handleBulkUnsubscribe() {
    if (selectedIds.length === 0) return;
    unsubscribeContacts(selectedIds, 'Bulk unsubscribe');
    setSelectedIds([]);
    refresh();
    showToast('success', 'Contacts unsubscribed successfully.');
  }

  function handleExport() {
    const params = {};
    if (role !== ROLES.SUPER_ADMIN) params.tenantId = tenantId;
    if (filters.status) params.status = filters.status;
    if (filters.source) params.source = filters.source;
    if (filters.tag) params.tag = filters.tag;
    if (filters.segment) params.segment = filters.segment;
    if (filters.whatsappOptInStatus) params.whatsappOptInStatus = filters.whatsappOptInStatus;
    if (filters.organisationName && allowSeeAllOrgs) {
      params.organisationName = filters.organisationName;
    }
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    if (filters.q) params.q = filters.q;
    const csv = exportContacts(params);
    downloadCsv(`mailwave-contacts-${Date.now()}.csv`, csv);
    showToast('success', 'Contacts exported successfully.');
  }

  function handleBulkExport() {
    if (selectedIds.length === 0) return;
    const subset = filtered.filter((c) => selectedIds.includes(c.id));
    const head = 'SR. No.,Full Name,Email ID,Contact Number,Tags,Source,Status,Engagement Score';
    const body = subset
      .map(
        (c, i) =>
          `${i + 1},"${c.fullName}","${c.emailId}","${c.contactNumber || ''}","${(c.tags || []).join('|')}","${c.source || ''}","${c.status}",${c.engagementScore}`
      )
      .join('\n');
    downloadCsv(`mailwave-contacts-bulk-${Date.now()}.csv`, `${head}\n${body}`);
    showToast('success', 'Contacts exported successfully.');
  }

  useEffect(() => {
    const status = searchParams.get('status');
    if (status) setFilters((p) => ({ ...p, status }));
  }, [searchParams]);

  const isViewer = role === ROLES.VIEWER;

  /* ------------------------------ KPI cards ----------------------------- */
  const kpis = [
    {
      label: 'Total Contacts',
      value: stats.total.toLocaleString(),
      icon: Users,
      tone: 'from-indigo-500 to-blue-500',
      onClick: () => setStatusFilter(''),
    },
    {
      label: 'Subscribed',
      value: stats.subscribed.toLocaleString(),
      icon: UserCheck,
      tone: 'from-emerald-500 to-teal-500',
      onClick: () => setStatusFilter(CONTACT_STATUSES.SUBSCRIBED),
    },
    {
      label: 'Unsubscribed',
      value: stats.unsubscribed.toLocaleString(),
      icon: UserMinus,
      tone: 'from-rose-500 to-orange-500',
      onClick: () => setStatusFilter(CONTACT_STATUSES.UNSUBSCRIBED),
    },
    {
      label: 'Bounced',
      value: stats.bounced.toLocaleString(),
      icon: AlertTriangle,
      tone: 'from-amber-500 to-yellow-500',
      onClick: () => setStatusFilter(CONTACT_STATUSES.BOUNCED),
    },
    {
      label: 'New This Month',
      value: stats.newThisMonth.toLocaleString(),
      icon: CalendarPlus,
      tone: 'from-fuchsia-500 to-pink-500',
      onClick: setNewThisMonth,
    },
    {
      label: 'Active Segments',
      value: stats.segmentsCount.toLocaleString(),
      icon: Layers,
      tone: 'from-cyan-500 to-blue-500',
      onClick: () => navigate('/app/contacts/segments'),
    },
    {
      label: 'Invalid Contacts',
      value: stats.invalid.toLocaleString(),
      icon: ShieldAlert,
      tone: 'from-slate-500 to-slate-700',
      onClick: () => setStatusFilter(CONTACT_STATUSES.INVALID),
    },
    {
      label: 'WhatsApp Opted In',
      value: stats.whatsappOptedIn.toLocaleString(),
      icon: MessageCircle,
      tone: 'from-emerald-500 to-cyan-500',
      onClick: setWhatsappFilter,
    },
  ];

  const headerActions = (
    <>
      {allowExport && (
        <Button variant="ghost" onClick={handleExport}>
          <Download className="h-4 w-4" /> Export
        </Button>
      )}
      {allowImport && (
        <Button variant="outline" onClick={() => setShowImport(true)}>
          <Upload className="h-4 w-4" /> Import Contacts
        </Button>
      )}
      {allowCreate && (
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> Add Contact
        </Button>
      )}
    </>
  );

  const bulkBar = selectedIds.length > 0 && (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 dark:border-indigo-500/30 dark:bg-indigo-500/10">
      <Badge tone="indigo">{selectedIds.length} selected</Badge>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        {allowManageTags && (
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setBulkTagMode('add');
                setBulkTagOpen(true);
              }}
            >
              Add Tag
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setBulkTagMode('remove');
                setBulkTagOpen(true);
              }}
            >
              Remove Tag
            </Button>
          </>
        )}
        <Button variant="ghost" onClick={handleBulkExport}>
          Export
        </Button>
        {!isViewer && (
          <Button variant="ghost" onClick={handleBulkUnsubscribe}>
            Unsubscribe
          </Button>
        )}
        {allowBulkDelete && (
          <Button variant="danger" onClick={() => setBulkDeleteOpen(true)}>
            Delete
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contacts"
        description="Manage subscribers, tags, segments and engagement history."
        icon={ContactIcon}
        eyebrow={isViewer ? 'Read only' : undefined}
        actions={headerActions}
      />

      {isViewer && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <Badge tone="amber" className="mr-2">
            Read only
          </Badge>
          Your role can view and export contacts but cannot create, edit or
          delete records.
        </div>
      )}

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <button
            key={k.label}
            type="button"
            onClick={k.onClick}
            className="cursor-pointer text-left"
          >
            <StatCard
              Icon={k.icon}
              label={k.label}
              value={k.value}
              tone={k.tone}
              delay={i * 0.04}
            />
          </button>
        ))}
      </div>

      <ContactFilterBar
        filters={filters}
        onChange={setFilters}
        onReset={clearFilters}
        tagOptions={tagOptions}
        segmentOptions={segmentOptions}
        organisationOptions={organisationOptions}
        showOrganisationFilter={allowSeeAllOrgs}
      />

      <ContactTable
        contacts={filtered}
        role={role}
        canEdit={allowEdit && !isViewer}
        canDelete={allowDelete && !isViewer}
        canBulkDelete={allowBulkDelete && !isViewer}
        canManageTags={allowManageTags && !isViewer}
        canResubscribe={allowResubscribe && !isViewer}
        showOrganisation={allowSeeAllOrgs}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onView={(c) => navigate(`/app/contacts/${c.id}`)}
        onEdit={(c) => setEditing(c)}
        onDelete={(c) => setDeleteTarget(c)}
        onAddTag={(c) => setTagging(c)}
        onUnsubscribe={(c) => setUnsubscribeTarget(c)}
        onInlineUpdated={refresh}
        toastSink={showToast}
        bulkBar={bulkBar}
      />

      <ContactFormModal
        open={showCreate}
        mode="create"
        tenantId={tenantId}
        organisationName={organisationName}
        onCancel={() => setShowCreate(false)}
        onSubmit={handleCreateSubmit}
      />

      <ContactFormModal
        open={Boolean(editing)}
        mode="edit"
        initial={editing}
        tenantId={tenantId}
        organisationName={organisationName}
        onCancel={() => setEditing(null)}
        onSubmit={handleEditSubmit}
      />

      <ImportContactsModal
        open={showImport}
        tenantId={tenantId}
        organisationName={organisationName}
        onCancel={() => setShowImport(false)}
        onCompleted={() => {
          setShowImport(false);
          refresh();
          showToast('success', 'Contacts imported successfully.');
        }}
      />

      <TagManager
        open={Boolean(tagging)}
        mode="attach"
        existingTags={tags}
        onCancel={() => setTagging(null)}
        onSubmit={handleAddTag}
      />

      <TagManager
        open={bulkTagOpen}
        mode="attach"
        existingTags={tags}
        onCancel={() => setBulkTagOpen(false)}
        onSubmit={handleBulkTag}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete contact"
        description={
          deleteTarget
            ? `Are you sure you want to delete contact ${deleteTarget.fullName}?`
            : ''
        }
        confirmLabel="Delete"
        variant="danger"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <ConfirmModal
        open={bulkDeleteOpen}
        title="Delete selected contacts"
        description={`Are you sure you want to delete ${selectedIds.length} selected contacts?`}
        confirmLabel="Delete"
        variant="danger"
        onCancel={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
      />

      <ConfirmModal
        open={Boolean(unsubscribeTarget)}
        title="Unsubscribe contact"
        description={
          unsubscribeTarget
            ? `Are you sure you want to unsubscribe ${unsubscribeTarget.fullName}?`
            : ''
        }
        confirmLabel="Unsubscribe"
        variant="danger"
        onCancel={() => setUnsubscribeTarget(null)}
        onConfirm={handleUnsubscribeOne}
      />
    </div>
  );
}
