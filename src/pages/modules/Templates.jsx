/**
 * Templates.jsx
 *
 * Templates module — fully role-aware. Drives three internal views from a
 * single page component so the existing sidebar route (/app/templates) is
 * preserved:
 *   - 'list'    → table / card listing with filters
 *   - 'builder' → create or edit
 *   - 'preview' → modal opened from any view
 *
 * Driven by URL search params (?view=builder&id=...) so deep links such
 * as /app/templates?view=builder&id=tpl-… work, without adding new route
 * entries to AppRoutes.jsx (which would risk breaking sidebar config).
 *
 * Role gating uses the central permission helpers exclusively — no
 * hardcoded role logic in this file.
 */

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  LayoutTemplate,
  FileEdit,
  Archive as ArchiveIcon,
  CheckCircle2,
  Plus,
  Filter,
  Library,
  FolderOpen,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Toast from '../../components/ui/Toast.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import SearchField from '../../components/ui/SearchField.jsx';
import SelectField from '../../components/ui/SelectField.jsx';
import TemplateList from '../../components/templates/template-list.jsx';
import TemplateBuilder from '../../components/templates/template-builder.jsx';
import TemplatePreviewModal from '../../components/templates/template-preview-modal.jsx';
import TemplateFormModal from '../../components/templates/template-form-modal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { MODULE_KEYS } from '../../config/modules.js';
import {
  canView,
  canCreate,
  canEdit,
  canDelete,
  canManage,
  isReadOnly,
} from '../../utils/permissions.js';
import {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
  publishTemplate,
  archiveTemplate,
  TEMPLATE_STATUS,
  TEMPLATE_CATEGORIES,
  EDITOR_MODES,
  STATUS_OPTIONS,
  defaultBlocksForNewTemplate,
} from '../../services/template-service.js';

const MODULE = MODULE_KEYS.TEMPLATES;

const DEFAULT_FILTERS = {
  q: '',
  status: '',
  category: '',
  editorMode: '',
};

const TAB_MINE = 'mine';
const TAB_GALLERY = 'gallery';

export default function Templates() {
  const { role } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const view = searchParams.get('view') || 'list';
  const activeId = searchParams.get('id');
  const tabParam = searchParams.get('tab');
  const tab = tabParam === TAB_GALLERY ? TAB_GALLERY : TAB_MINE;

  /* -------------------------- Permission helpers -------------------------- */

  const allowView = canView(role, MODULE);
  const allowCreate = canCreate(role, MODULE);
  const allowEdit = canEdit(role, MODULE);
  const allowDelete = canDelete(role, MODULE);
  const allowManage = canManage(role, MODULE);
  const allowPublishOrArchive = allowEdit || allowManage;
  const readOnly = isReadOnly(role, MODULE);

  /* ------------------------------- State -------------------------------- */

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);
  const [toast, setToast] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [previewTarget, setPreviewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [publishTarget, setPublishTarget] = useState(null);
  const [newOpen, setNewOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  /* --------------------------- Data load -------------------------------- */

  useEffect(() => {
    if (!allowView) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    const params = { gallery: tab === TAB_GALLERY };
    getTemplates(params)
      .then((list) => {
        if (cancelled) return;
        setTemplates(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || 'Failed to load templates.');
        setTemplates([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [allowView, tab, tick]);

  // Load active template when entering builder mode with an id.
  useEffect(() => {
    if (view !== 'builder' || !activeId) {
      setActiveTemplate(null);
      return undefined;
    }
    let cancelled = false;
    getTemplateById(activeId).then((tpl) => {
      if (!cancelled) setActiveTemplate(tpl);
    });
    return () => {
      cancelled = true;
    };
  }, [view, activeId, tick]);

  function refresh() {
    setTick((t) => t + 1);
  }

  function showToast(type, message) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3200);
  }

  function setTab(next) {
    const sp = new URLSearchParams(searchParams);
    if (next === TAB_GALLERY) sp.set('tab', TAB_GALLERY);
    else sp.delete('tab');
    setSearchParams(sp, { replace: true });
  }

  function openList() {
    const sp = new URLSearchParams(searchParams);
    sp.delete('view');
    sp.delete('id');
    setSearchParams(sp);
  }

  function openBuilder(id) {
    const sp = new URLSearchParams(searchParams);
    sp.set('view', 'builder');
    if (id) sp.set('id', id);
    else sp.delete('id');
    setSearchParams(sp);
  }

  /* --------------------------- Filtered list ---------------------------- */

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return templates.filter((t) => {
      if (filters.status && t.status !== filters.status) return false;
      if (filters.category && t.category !== filters.category) return false;
      if (filters.editorMode && t.editorMode !== filters.editorMode) return false;
      if (q) {
        const hay = [t.name, t.subject, t.description, t.previewText]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [templates, filters]);

  /* -------------------------------- KPIs -------------------------------- */

  const kpis = useMemo(() => {
    const total = templates.length;
    const drafts = templates.filter((t) => t.status === TEMPLATE_STATUS.DRAFT).length;
    const published = templates.filter(
      (t) => t.status === TEMPLATE_STATUS.PUBLISHED
    ).length;
    const archived = templates.filter(
      (t) => t.status === TEMPLATE_STATUS.ARCHIVED
    ).length;
    return [
      {
        label: tab === TAB_GALLERY ? 'Gallery templates' : 'My templates',
        value: total,
        icon: LayoutTemplate,
        tone: 'from-indigo-500 to-blue-500',
        onClick: () => setFilters(DEFAULT_FILTERS),
      },
      {
        label: 'Drafts',
        value: drafts,
        icon: FileEdit,
        tone: 'from-amber-500 to-orange-500',
        onClick: () =>
          setFilters((p) => ({ ...p, status: TEMPLATE_STATUS.DRAFT })),
      },
      {
        label: 'Published',
        value: published,
        icon: CheckCircle2,
        tone: 'from-emerald-500 to-teal-500',
        onClick: () =>
          setFilters((p) => ({ ...p, status: TEMPLATE_STATUS.PUBLISHED })),
      },
      {
        label: 'Archived',
        value: archived,
        icon: ArchiveIcon,
        tone: 'from-slate-500 to-slate-700',
        onClick: () =>
          setFilters((p) => ({ ...p, status: TEMPLATE_STATUS.ARCHIVED })),
      },
    ];
  }, [templates, tab]);

  /* -------------------------- Action handlers --------------------------- */

  async function handleCreateMeta(meta) {
    setSaving(true);
    try {
      const payload = {
        ...meta,
        status: TEMPLATE_STATUS.DRAFT,
        blocks:
          meta.editorMode === 'drag_drop'
            ? defaultBlocksForNewTemplate(meta.category)
            : [],
        htmlContent: '',
        textContent: '',
      };
      const created = await createTemplate(payload);
      setNewOpen(false);
      showToast('success', 'Template created. Open the builder to design it.');
      refresh();
      openBuilder(created.id);
    } catch (err) {
      showToast('error', err?.message || 'Failed to create template.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSave(kind, payload) {
    setSaving(true);
    try {
      let result;
      if (activeId) {
        result = await updateTemplate(activeId, payload);
        if (kind === 'publish' && result?.status !== TEMPLATE_STATUS.PUBLISHED) {
          await publishTemplate(activeId);
        }
      } else {
        result = await createTemplate(payload);
        if (kind === 'publish') await publishTemplate(result.id);
      }
      showToast(
        'success',
        kind === 'publish'
          ? 'Template published successfully.'
          : 'Template saved successfully.'
      );
      refresh();
      openList();
    } catch (err) {
      showToast('error', err?.message || 'Failed to save template.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDuplicate(row) {
    try {
      await duplicateTemplate(row.id);
      showToast('success', 'Template duplicated successfully.');
      refresh();
    } catch (err) {
      showToast('error', err?.message || 'Failed to duplicate template.');
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    try {
      await deleteTemplate(deleteTarget.id);
      setDeleteTarget(null);
      showToast('success', 'Template deleted successfully.');
      refresh();
    } catch (err) {
      showToast('error', err?.message || 'Failed to delete template.');
    }
  }

  async function handleArchiveConfirm() {
    if (!archiveTarget) return;
    try {
      await archiveTemplate(archiveTarget.id);
      setArchiveTarget(null);
      showToast('success', 'Template archived successfully.');
      refresh();
    } catch (err) {
      showToast('error', err?.message || 'Failed to archive template.');
    }
  }

  async function handlePublishConfirm() {
    if (!publishTarget) return;
    try {
      await publishTemplate(publishTarget.id);
      setPublishTarget(null);
      showToast('success', 'Template published successfully.');
      refresh();
    } catch (err) {
      showToast('error', err?.message || 'Failed to publish template.');
    }
  }

  /* ------------------------------ Render -------------------------------- */

  if (!allowView) {
    return null;
  }

  // BUILDER VIEW
  if (view === 'builder') {
    if (!allowCreate && !allowEdit) {
      return (
        <div className="space-y-4">
          <PageHeader
            title="Templates"
            description="You do not have permission to edit templates."
            icon={LayoutTemplate}
            eyebrow="Read only"
          />
          <EmptyState
            title="Builder unavailable"
            description="Your role can preview templates but cannot create or edit them."
            action={<Button onClick={openList}>Back to list</Button>}
          />
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
        <TemplateBuilder
          initial={activeTemplate || undefined}
          isEditing={Boolean(activeId)}
          readOnly={!(allowEdit || allowCreate)}
          saving={saving}
          onCancel={openList}
          onSaveDraft={(payload) => {
            // Preserve existing status when editing — Save Draft on a
            // published template keeps it published.
            const status =
              activeTemplate?.status === TEMPLATE_STATUS.PUBLISHED
                ? TEMPLATE_STATUS.PUBLISHED
                : payload.status || TEMPLATE_STATUS.DRAFT;
            handleSave('draft', { ...payload, status });
          }}
          onSavePublish={(payload) => {
            // Show confirm before publishing to avoid accidental sends.
            setPublishTarget({
              id: activeId,
              ...payload,
              __pendingPayload: payload,
            });
          }}
          onPreview={(payload) => setPreviewTarget({ ...payload, id: activeId })}
        />

        <ConfirmModal
          open={Boolean(publishTarget)}
          title="Publish template"
          description="Publishing makes this template available for campaigns. You can still edit it after publishing."
          confirmLabel="Publish"
          variant="primary"
          loading={saving}
          onCancel={() => setPublishTarget(null)}
          onConfirm={() => {
            const pending = publishTarget?.__pendingPayload;
            setPublishTarget(null);
            handleSave('publish', {
              ...pending,
              status: TEMPLATE_STATUS.PUBLISHED,
            });
          }}
        />

        <TemplatePreviewModal
          open={Boolean(previewTarget)}
          template={previewTarget}
          onClose={() => setPreviewTarget(null)}
        />
      </div>
    );
  }

  // LIST VIEW
  const headerActions = (
    <>
      {allowCreate && (
        <Button onClick={() => setNewOpen(true)}>
          <Plus className="h-4 w-4" /> New template
        </Button>
      )}
    </>
  );

  const tabsBar = (
    <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 text-sm font-semibold shadow-soft dark:border-slate-700 dark:bg-slate-900">
      <button
        type="button"
        onClick={() => setTab(TAB_MINE)}
        className={`inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 transition ${
          tab === TAB_MINE
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
        }`}
      >
        <FolderOpen className="h-4 w-4" /> My templates
      </button>
      <button
        type="button"
        onClick={() => setTab(TAB_GALLERY)}
        className={`inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 transition ${
          tab === TAB_GALLERY
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
        }`}
      >
        <Library className="h-4 w-4" /> Template gallery
      </button>
    </div>
  );

  const filterBar = (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        <Filter className="h-4 w-4" /> Filters
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <SearchField
          value={filters.q}
          onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
          placeholder="Search name, subject, description…"
          className="col-span-full sm:col-span-2"
        />
        <SelectField
          name="status"
          label="Status"
          placeholder="All statuses"
          value={filters.status}
          onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
          options={[{ value: '', label: 'All statuses' }, ...STATUS_OPTIONS]}
        />
        <SelectField
          name="category"
          label="Category"
          placeholder="All categories"
          value={filters.category}
          onChange={(e) =>
            setFilters((p) => ({ ...p, category: e.target.value }))
          }
          options={[
            { value: '', label: 'All categories' },
            ...TEMPLATE_CATEGORIES,
          ]}
        />
        <SelectField
          name="editorMode"
          label="Editor"
          placeholder="All modes"
          value={filters.editorMode}
          onChange={(e) =>
            setFilters((p) => ({ ...p, editorMode: e.target.value }))
          }
          options={[{ value: '', label: 'All modes' }, ...EDITOR_MODES]}
        />
      </div>
    </div>
  );

  const showEmptyCreate =
    !loading && !error && filtered.length === 0 && tab === TAB_MINE;
  const showEmptyGallery =
    !loading && !error && filtered.length === 0 && tab === TAB_GALLERY;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Templates"
        description="Reusable, on-brand email layouts you can drop into any campaign or automation."
        icon={LayoutTemplate}
        eyebrow={readOnly ? 'Read only' : undefined}
        actions={headerActions}
      />

      {readOnly && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <Badge tone="amber" className="mr-2">
            Read only
          </Badge>
          Your role can view and preview templates but cannot create, edit or
          delete them.
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

      {tabsBar}

      {filterBar}

      {error && (
        <Toast
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>
      ) : showEmptyCreate ? (
        <EmptyState
          icon={LayoutTemplate}
          title="No templates yet"
          description={
            allowCreate
              ? 'Create your first template to get started — start from scratch or browse the gallery.'
              : 'You do not have any templates yet.'
          }
          action={
            allowCreate ? (
              <Button onClick={() => setNewOpen(true)}>
                <Plus className="h-4 w-4" /> New template
              </Button>
            ) : null
          }
        />
      ) : showEmptyGallery ? (
        <EmptyState
          icon={Library}
          title="Gallery is empty"
          description="No published gallery templates match your filters."
        />
      ) : (
        <TemplateList
          templates={filtered}
          role={role}
          canCreate={allowCreate && !readOnly}
          canEdit={allowEdit && !readOnly}
          canDelete={allowDelete && !readOnly}
          canPublish={allowPublishOrArchive && !readOnly}
          canArchive={allowPublishOrArchive && !readOnly}
          isReadOnly={readOnly}
          onPreview={(row) => setPreviewTarget(row)}
          onEdit={(row) => openBuilder(row.id)}
          onDuplicate={(row) => handleDuplicate(row)}
          onDelete={(row) => setDeleteTarget(row)}
          onPublish={(row) => setPublishTarget({ id: row.id })}
          onArchive={(row) => setArchiveTarget(row)}
          emptyMessage="No templates match your filters."
        />
      )}

      <TemplateFormModal
        open={newOpen}
        onCancel={() => setNewOpen(false)}
        onSubmit={handleCreateMeta}
      />

      <TemplatePreviewModal
        open={Boolean(previewTarget)}
        template={previewTarget}
        onClose={() => setPreviewTarget(null)}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete template"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        variant="danger"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />

      <ConfirmModal
        open={Boolean(archiveTarget)}
        title="Archive template"
        description={
          archiveTarget
            ? `Archive "${archiveTarget.name}"? It will be hidden from active lists but you can restore it later.`
            : ''
        }
        confirmLabel="Archive"
        variant="primary"
        onCancel={() => setArchiveTarget(null)}
        onConfirm={handleArchiveConfirm}
      />

      <ConfirmModal
        open={Boolean(publishTarget) && !publishTarget?.__pendingPayload}
        title="Publish template"
        description="Publishing makes this template available for campaigns. You can still edit it after publishing."
        confirmLabel="Publish"
        variant="primary"
        onCancel={() => setPublishTarget(null)}
        onConfirm={handlePublishConfirm}
      />
    </div>
  );
}
