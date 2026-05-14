/**
 * Automations.jsx
 *
 * Role-aware Automation Workflow list page.
 *
 * One page handles every role — visible records, KPI numbers, action
 * buttons, inline edit and bulk actions all come from the central
 * permission matrix + the currently logged in user's tenantId.
 *
 *   - Super Admin sees every tenant + Organisation filter. No write
 *     actions. Inline edit disabled.
 *   - Business Admin / Marketing Manager / Individual: tenant-scoped
 *     create / edit / duplicate / activate / pause / resume / analytics.
 *     Delete only if `canDelete("automations")`.
 *   - Viewer / Analyst: view + analytics only.
 *   - Individual: same as the other tenant roles but always scoped to
 *     their own workspace AND only their own automations.
 *
 * KPIs are clickable to filter status.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Workflow,
  Plus,
  BarChart3,
  FileEdit,
  Activity,
  PauseCircle,
  CheckCircle2,
  AlertOctagon,
  Mail,
  MousePointerClick,
} from 'lucide-react';

import PageHeader from '../../components/ui/PageHeader.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Toast from '../../components/ui/Toast.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import AppTable from '../../components/ui/app-table.jsx';
import BulkActionBar from '../../components/common/BulkActionBar.jsx';
import ConfirmBulkDeleteModal from '../../components/common/ConfirmBulkDeleteModal.jsx';

import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../config/roles.js';
import { MODULE_KEYS } from '../../config/modules.js';
import {
  canCreate,
  canDelete,
  isReadOnly,
} from '../../config/permissions.js';

import {
  getAutomationsForUser,
  deleteAutomation,
  bulkDeleteAutomations,
  duplicateAutomation,
  activateAutomation,
  pauseAutomation,
  resumeAutomation,
  getAutomationStats,
  AUTOMATION_STATUS,
  AUTOMATION_STATUS_LIST,
  TRIGGER_TYPES,
  AUDIENCE_TYPES,
} from '../../services/automation-service.js';

function fmtDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

const STATUS_TONE = {
  Draft: 'slate',
  Active: 'emerald',
  Paused: 'amber',
  Completed: 'indigo',
  Failed: 'rose',
};

const DEFAULT_FILTERS = {
  q: '',
  status: '',
  triggerType: '',
  audienceType: '',
  organisationName: '',
};

export default function Automations() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [tick, setTick] = useState(0);
  const [toast, setToast] = useState(null);
  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    status: searchParams.get('status') || '',
  }));
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  useEffect(() => {
    const status = searchParams.get('status');
    if (status) setFilters((p) => ({ ...p, status }));
  }, [searchParams]);

  const isSuperAdmin = role === ROLES.SUPER_ADMIN;
  const isViewer = role === ROLES.VIEWER;
  const readOnly = isSuperAdmin || isViewer || isReadOnly(role, MODULE_KEYS.AUTOMATIONS);
  const allowCreate = !isSuperAdmin && !isViewer && canCreate(role, MODULE_KEYS.AUTOMATIONS);
  const allowDeleteAction = !isSuperAdmin && !isViewer && canDelete(role, MODULE_KEYS.AUTOMATIONS);
  const allowBulkDelete = allowDeleteAction;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const scopedAutomations = useMemo(() => getAutomationsForUser(user, {}), [user, tick]);

  const organisationOptions = useMemo(() => {
    if (!isSuperAdmin) return [];
    return Array.from(new Set(scopedAutomations.map((a) => a.organisationName || a.tenantId).filter(Boolean)));
  }, [scopedAutomations, isSuperAdmin]);

  const filtered = useMemo(() => {
    let list = scopedAutomations.slice();
    if (filters.status) list = list.filter((a) => a.status === filters.status);
    if (filters.triggerType) list = list.filter((a) => a.triggerType === filters.triggerType);
    if (filters.audienceType) list = list.filter((a) => a.audienceType === filters.audienceType);
    if (filters.organisationName && isSuperAdmin) {
      list = list.filter((a) => (a.organisationName || a.tenantId) === filters.organisationName);
    }
    const q = (filters.q || '').toLowerCase().trim();
    if (q) {
      list = list.filter((a) => {
        const hay = [a.automationName, a.description, a.triggerType, a.audienceType, a.status]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(q);
      });
    }
    return list;
  }, [scopedAutomations, filters, isSuperAdmin]);

  const stats = useMemo(() => getAutomationStats(scopedAutomations), [scopedAutomations]);

  function refresh() {
    setTick((t) => t + 1);
  }

  function showToast(type, message) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3200);
  }

  function setStatusFilter(status) {
    setFilters((p) => ({ ...p, status }));
  }

  function clearFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  function handleAction(key, row) {
    if (key === 'view') {
      navigate(`/app/automations/${row.id}`);
      return;
    }
    if (key === 'analytics') {
      navigate(`/app/automations/${row.id}/analytics`);
      return;
    }
    if (key === 'edit') {
      navigate(`/app/automations/${row.id}/edit`);
      return;
    }
    if (key === 'duplicate') {
      const copy = duplicateAutomation(row.id);
      refresh();
      if (copy) showToast('success', 'Automation duplicated.');
      return;
    }
    if (key === 'activate') {
      try {
        activateAutomation(row.id);
        refresh();
        showToast('success', 'Automation activated successfully.');
      } catch (err) {
        showToast('error', err?.message || 'Could not activate automation.');
      }
      return;
    }
    if (key === 'pause') {
      pauseAutomation(row.id);
      refresh();
      showToast('success', 'Automation paused.');
      return;
    }
    if (key === 'resume') {
      resumeAutomation(row.id);
      refresh();
      showToast('success', 'Automation resumed.');
      return;
    }
    if (key === 'delete') {
      setDeleteTarget(row);
    }
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteAutomation(deleteTarget.id);
    setDeleteTarget(null);
    setSelectedIds((ids) => ids.filter((id) => id !== deleteTarget.id));
    refresh();
    showToast('success', 'Automation deleted.');
  }

  function confirmBulkDelete() {
    if (selectedIds.length === 0) return;
    const removed = bulkDeleteAutomations(selectedIds);
    setBulkDeleteOpen(false);
    setSelectedIds([]);
    refresh();
    showToast(
      'success',
      removed === 1 ? '1 automation deleted.' : `${removed} automations deleted.`
    );
  }

  /* ----------------------------- KPI cards ----------------------------- */

  const kpis = [
    { label: 'Total Automations', value: stats.total, icon: Workflow, tone: 'from-indigo-500 to-blue-500', onClick: () => setStatusFilter('') },
    { label: 'Active Automations', value: stats.active, icon: Activity, tone: 'from-emerald-500 to-teal-500', onClick: () => setStatusFilter(AUTOMATION_STATUS.ACTIVE) },
    { label: 'Draft Automations', value: stats.draft, icon: FileEdit, tone: 'from-slate-500 to-slate-700', onClick: () => setStatusFilter(AUTOMATION_STATUS.DRAFT) },
    { label: 'Paused Automations', value: stats.paused, icon: PauseCircle, tone: 'from-amber-500 to-orange-500', onClick: () => setStatusFilter(AUTOMATION_STATUS.PAUSED) },
    { label: 'Contacts Entered', value: stats.contactsEntered, icon: CheckCircle2, tone: 'from-fuchsia-500 to-pink-500', onClick: () => setStatusFilter('') },
    { label: 'Emails Sent', value: stats.emailsSent, icon: Mail, tone: 'from-cyan-500 to-blue-500', onClick: () => setStatusFilter('') },
    { label: 'Open Rate', value: `${stats.openRate}%`, icon: BarChart3, tone: 'from-violet-500 to-fuchsia-500', onClick: () => setStatusFilter('') },
    { label: 'Click Rate', value: `${stats.clickRate}%`, icon: MousePointerClick, tone: 'from-rose-500 to-orange-500', onClick: () => setStatusFilter('') },
  ];

  /* ----------------------------- Columns ----------------------------- */

  const columns = useMemo(() => {
    const base = [
      {
        key: 'automationName',
        label: 'Automation Name',
        priority: 1,
        searchable: true,
        truncate: true,
        render: (row) => (
          <Link
            to={`/app/automations/${row.id}`}
            className="font-medium text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-300"
          >
            {row.automationName}
          </Link>
        ),
      },
      {
        key: 'triggerType',
        label: 'Trigger',
        priority: 2,
        render: (row) => (
          <div>
            <div className="text-sm text-slate-700 dark:text-slate-200">{row.triggerType}</div>
            {row.triggerValue && (
              <div className="text-xs text-slate-500 dark:text-slate-400">{String(row.triggerValue)}</div>
            )}
          </div>
        ),
      },
      { key: 'audienceType', label: 'Audience', priority: 3 },
      {
        key: '_steps',
        label: 'Steps',
        priority: 4,
        width: '90px',
        render: (row) => (row.workflowSteps || []).length,
      },
      {
        key: 'status',
        label: 'Status',
        priority: 1,
        render: (row) => <Badge tone={STATUS_TONE[row.status] || 'slate'}>{row.status}</Badge>,
      },
      {
        key: '_entered',
        label: 'Entered',
        priority: 4,
        width: '110px',
        render: (row) => (row.metrics?.entered || 0).toLocaleString(),
      },
      {
        key: '_openRate',
        label: 'Open Rate',
        priority: 4,
        width: '110px',
        render: (row) => `${row.metrics?.openRate || 0}%`,
      },
      {
        key: '_clickRate',
        label: 'Click Rate',
        priority: 4,
        width: '110px',
        render: (row) => `${row.metrics?.clickRate || 0}%`,
      },
      {
        key: 'createdAt',
        label: 'Created At',
        priority: 4,
        width: '140px',
        render: (row) => fmtDate(row.createdAt),
      },
    ];
    if (isSuperAdmin) {
      base.splice(1, 0, {
        key: 'organisationName',
        label: 'Organisation',
        priority: 2,
        truncate: true,
        render: (row) => row.organisationName || row.tenantId || '—',
      });
    }
    return base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, isSuperAdmin]);

  const selectedRows = useMemo(
    () => filtered.filter((a) => selectedIds.includes(a.id)),
    [filtered, selectedIds]
  );

  const filtersBar = (
    <div className="grid w-full gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
      <input
        type="text"
        value={filters.q}
        onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
        placeholder="Search automations…"
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      />
      <select
        value={filters.status}
        onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      >
        <option value="">All statuses</option>
        {AUTOMATION_STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <select
        value={filters.triggerType}
        onChange={(e) => setFilters((p) => ({ ...p, triggerType: e.target.value }))}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      >
        <option value="">All triggers</option>
        {TRIGGER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <select
        value={filters.audienceType}
        onChange={(e) => setFilters((p) => ({ ...p, audienceType: e.target.value }))}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      >
        <option value="">All audiences</option>
        {AUDIENCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      {isSuperAdmin && (
        <select
          value={filters.organisationName}
          onChange={(e) => setFilters((p) => ({ ...p, organisationName: e.target.value }))}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          <option value="">All organisations</option>
          {organisationOptions.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      )}
      <Button variant="ghost" onClick={clearFilters} className="w-full">Clear filters</Button>
    </div>
  );

  const bulkBar = allowBulkDelete && selectedRows.length > 0 ? (
    <BulkActionBar
      selectedRows={selectedRows}
      filteredRows={filtered}
      columns={[]}
      moduleName="automations"
      entity="automations"
      canDelete={allowBulkDelete}
      canExport={false}
      onBulkDelete={() => setBulkDeleteOpen(true)}
      onClearSelection={() => setSelectedIds([])}
    />
  ) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automations"
        description="Send the right email at the right moment — without you lifting a finger."
        icon={Workflow}
        eyebrow={readOnly ? 'Read only' : undefined}
        actions={
          <>
            {allowCreate && (
              <Button onClick={() => navigate('/app/automations/create')}>
                <Plus className="h-4 w-4" /> Create Automation
              </Button>
            )}
          </>
        }
      />

      {readOnly && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <Badge tone="amber" className="mr-2">Read only</Badge>
          {isSuperAdmin
            ? 'Tenant operational data is view-only. Filter by Organisation to inspect each tenant.'
            : 'Your role can view automations and analytics but cannot create, edit, activate or delete records.'}
        </div>
      )}

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {kpis.map((k) => (
          <button key={k.label} type="button" onClick={k.onClick} className="cursor-pointer text-left">
            <StatCard
              Icon={k.icon}
              label={k.label}
              value={typeof k.value === 'number' ? k.value.toLocaleString() : k.value}
              tone={k.tone}
            />
          </button>
        ))}
      </div>

      <AppTable
        tableKey="automations"
        rows={filtered}
        columns={columns}
        rowKey="id"
        role={role}
        module={MODULE_KEYS.AUTOMATIONS}
        searchable={false}
        displayMode="auto"
        showSerial
        actions={['view', 'delete']}
        actionHandlers={{
          view: (row) => handleAction('view', row),
          delete: (row) => handleAction('delete', row),
        }}
        actionPermissions={{
          view: true,
          delete: allowDeleteAction,
        }}
        filters={filtersBar}
        inlineEditDisabled={readOnly}
        selectable={allowBulkDelete}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        topBar={bulkBar}
        mobileConfig={{
          mobileTitleKey: 'automationName',
          mobileSubtitleKey: 'triggerType',
          mobileBadgeKey: 'status',
          mobileDetailKeys: isSuperAdmin
            ? ['organisationName', 'audienceType', '_steps', '_entered', '_openRate', '_clickRate', 'createdAt']
            : ['audienceType', '_steps', '_entered', '_openRate', '_clickRate', 'createdAt'],
          mobileActionKeys: ['view', 'delete'],
        }}
        empty={
          filtered.length === 0 && scopedAutomations.length === 0
            ? 'No automations yet. Create your first one to get started.'
            : 'No automations match your filters.'
        }
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete automation"
        description={deleteTarget ? `Delete ${deleteTarget.automationName}? This cannot be undone.` : ''}
        confirmLabel="Delete"
        variant="danger"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      <ConfirmBulkDeleteModal
        open={bulkDeleteOpen}
        count={selectedIds.length}
        entity="automations"
        onCancel={() => setBulkDeleteOpen(false)}
        onConfirm={confirmBulkDelete}
      />
    </div>
  );
}

