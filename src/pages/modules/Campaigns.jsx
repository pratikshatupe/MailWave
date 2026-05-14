/**
 * Campaigns.jsx
 *
 * Campaign Management list page. Role-aware. Tenant-isolated. Reads /
 * writes through services/campaign-service.js (which persists to
 * localStorage), so the entire module works locally with no backend.
 *
 * Behaviour summary:
 *   - Super Admin sees every tenant + Organisation filter + Export. No
 *     create / edit / delete / send actions.
 *   - Business Admin / Marketing Manager / Individual see their own
 *     tenant scope and can manage their campaigns.
 *   - Viewer / Analyst sees only View / Analytics on each row.
 *
 * KPIs are clickable and act as status filters.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mail,
  Plus,
  Download,
  Send,
  CalendarClock,
  FileEdit,
  Activity,
  Pause,
  AlertOctagon,
  Percent,
  ClipboardCheck,
  Search as SearchIcon,
  X,
} from 'lucide-react';

import PageHeader from '../../components/ui/PageHeader.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Toast from '../../components/ui/Toast.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import AppTable from '../../components/ui/app-table.jsx';
import CampaignStatusBadge from '../../components/campaigns/campaign-status-badge.jsx';

import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../config/roles.js';
import {
  CAMPAIGN_STATUSES,
  CAMPAIGN_STATUS_LIST,
  CAMPAIGN_TYPE_LIST,
  ACTION_KEYS,
} from '../../config/campaign-status.js';
import { canDelete, canExport, canCreate } from '../../config/permissions.js';
import { MODULE_KEYS } from '../../config/modules.js';

import {
  getCampaignsForUser,
  deleteCampaign,
  duplicateCampaign,
  sendCampaignNow,
  pauseCampaign,
  resumeCampaign,
  cancelCampaign,
  approveCampaign,
  rejectCampaign,
  retryCampaign,
  getTemplatesForTenant,
  getSegmentsForTenant,
  getCampaignStats,
} from '../../services/campaign-service.js';

function fmtDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function audienceLabel(c) {
  if (c.audienceType === 'segment') return c.selectedSegmentName || 'Segment';
  if (c.audienceType === 'selected_contacts') return 'Selected Contacts';
  if (c.audienceType === 'upload_list') return 'Uploaded List';
  return 'All Contacts';
}

function downloadCsv(filename, csv) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

function toCsv(list, isSuperAdmin) {
  const headers = [
    'SR. No.',
    'Campaign Name',
    'Type',
    'Subject Line',
    'Audience',
    'Recipients',
    'Template',
    'Status',
    'Open Rate',
    'Click Rate',
    'Scheduled At',
    'Created At',
  ];
  if (isSuperAdmin) headers.push('Organisation');
  const escape = (v) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = list.map((c, i) => {
    const row = [
      i + 1,
      c.campaignName,
      c.campaignType,
      c.subjectLine,
      audienceLabel(c),
      c.recipientCount,
      c.templateName,
      c.status,
      `${c.metrics?.openRate || 0}%`,
      `${c.metrics?.clickRate || 0}%`,
      fmtDate(c.scheduledAt),
      fmtDate(c.createdAt),
    ];
    if (isSuperAdmin) row.push(c.organisationName || c.tenantId || '');
    return row.map(escape).join(',');
  });
  return [headers.join(','), ...lines].join('\n');
}

const DEFAULT_FILTERS = {
  q: '',
  status: '',
  campaignType: '',
  templateId: '',
  segmentId: '',
  organisationName: '',
  from: '',
  to: '',
};

const APPROVAL_WORKFLOW_KEY = 'mailwave_approval_workflow_enabled';
function getApprovalWorkflowEnabled() {
  try {
    return window.localStorage.getItem(APPROVAL_WORKFLOW_KEY) === 'true';
  } catch {
    return false;
  }
}

export default function Campaigns() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [tick, setTick] = useState(0);
  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    status: searchParams.get('status') || '',
  }));
  const [toast, setToast] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [approvalTarget, setApprovalTarget] = useState(null);
  const [rejectComment, setRejectComment] = useState('');

  useEffect(() => {
    const status = searchParams.get('status');
    if (status) setFilters((p) => ({ ...p, status }));
  }, [searchParams]);

  const tenantId = user?.tenantId;
  const isSuperAdmin = role === ROLES.SUPER_ADMIN;
  const isViewer = role === ROLES.VIEWER;
  const isMarketingManager = role === ROLES.MARKETING_MANAGER;

  const allowCreate = !isSuperAdmin && !isViewer && canCreate(role, MODULE_KEYS.CAMPAIGNS);
  const allowExport = canExport(role, MODULE_KEYS.CAMPAIGNS);
  const allowDeleteOption = canDelete(role, MODULE_KEYS.CAMPAIGNS);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const approvalWorkflowEnabled = useMemo(() => getApprovalWorkflowEnabled(), [tick]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allForUser = useMemo(() => getCampaignsForUser(user, {}), [user, tick]);

  // Individual users only see their own campaigns inside the tenant.
  const baseScoped = useMemo(() => {
    if (role === ROLES.INDIVIDUAL) {
      const emailId = user?.email || user?.emailId;
      return allForUser.filter(
        (c) => !c.createdBy || c.createdBy === emailId || c.createdBy === user?.id
      );
    }
    return allForUser;
  }, [allForUser, role, user]);

  const organisationOptions = useMemo(() => {
    if (!isSuperAdmin) return [];
    return Array.from(
      new Set(baseScoped.map((c) => c.organisationName).filter(Boolean))
    );
  }, [baseScoped, isSuperAdmin]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const templates = useMemo(() => getTemplatesForTenant(tenantId), [tenantId, tick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const segments = useMemo(() => getSegmentsForTenant(tenantId), [tenantId, tick]);

  const filtered = useMemo(() => {
    let next = baseScoped.slice();
    if (filters.status) next = next.filter((c) => c.status === filters.status);
    if (filters.campaignType) next = next.filter((c) => c.campaignType === filters.campaignType);
    if (filters.templateId) next = next.filter((c) => c.templateId === filters.templateId);
    if (filters.segmentId) next = next.filter((c) => c.selectedSegmentId === filters.segmentId);
    if (filters.organisationName && isSuperAdmin) {
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
    if (filters.q.trim()) {
      const q = filters.q.toLowerCase();
      next = next.filter((c) => {
        const hay = [
          c.campaignName,
          c.subjectLine,
          c.senderName,
          c.senderEmailId,
          c.templateName,
          c.selectedSegmentName,
          c.status,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(q);
      });
    }
    return next;
  }, [baseScoped, filters, isSuperAdmin]);

  const stats = useMemo(() => getCampaignStats(baseScoped), [baseScoped]);

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

  /* --------------------------- Action handlers --------------------------- */

  function handleExport() {
    if (filtered.length === 0) {
      showToast('error', 'Nothing to export.');
      return;
    }
    const csv = toCsv(filtered, isSuperAdmin);
    downloadCsv(`campaigns-${Date.now()}.csv`, csv);
    showToast('success', 'Campaigns exported successfully.');
  }

  async function handleAction(key, c) {
    if (key === ACTION_KEYS.VIEW) {
      navigate(`/app/campaigns/${c.id}`);
      return;
    }
    if (key === ACTION_KEYS.EDIT) {
      navigate(`/app/campaigns/${c.id}/edit`);
      return;
    }
    if (key === ACTION_KEYS.ANALYTICS) {
      navigate(`/app/campaigns/${c.id}/analytics`);
      return;
    }
    if (key === ACTION_KEYS.DUPLICATE) {
      const copy = duplicateCampaign(c.id);
      refresh();
      if (copy) showToast('success', 'Campaign duplicated successfully.');
      return;
    }
    if (key === ACTION_KEYS.SEND_NOW) {
      try {
        await sendCampaignNow(c.id);
        refresh();
        showToast('success', 'Campaign sent successfully.');
      } catch {
        showToast('error', 'Failed to send campaign.');
      }
      refresh();
      return;
    }
    if (key === ACTION_KEYS.SCHEDULE) {
      navigate(`/app/campaigns/${c.id}/edit`);
      return;
    }
    if (key === ACTION_KEYS.PAUSE) {
      pauseCampaign(c.id);
      refresh();
      showToast('success', 'Campaign paused successfully.');
      return;
    }
    if (key === ACTION_KEYS.RESUME) {
      const result = resumeCampaign(c.id);
      if (result instanceof Promise) {
        await result;
      }
      refresh();
      showToast('success', 'Campaign resumed successfully.');
      return;
    }
    if (key === ACTION_KEYS.CANCEL) {
      cancelCampaign(c.id);
      refresh();
      showToast('success', 'Campaign cancelled successfully.');
      return;
    }
    if (key === ACTION_KEYS.DELETE) {
      setDeleteTarget(c);
      return;
    }
    if (key === ACTION_KEYS.RETRY) {
      retryCampaign(c.id);
      refresh();
      showToast('success', 'Campaign moved back to Draft. Update and retry.');
      return;
    }
    if (key === ACTION_KEYS.APPROVE) {
      approveCampaign(c.id, '', user?.email || user?.emailId);
      refresh();
      showToast('success', 'Campaign approved successfully.');
      return;
    }
    if (key === ACTION_KEYS.REJECT) {
      setApprovalTarget(c);
    }
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteCampaign(deleteTarget.id);
    setDeleteTarget(null);
    refresh();
    showToast('success', 'Campaign deleted successfully.');
  }

  function confirmReject() {
    if (!approvalTarget) return;
    rejectCampaign(approvalTarget.id, rejectComment || '', user?.email || user?.emailId);
    setApprovalTarget(null);
    setRejectComment('');
    refresh();
    showToast('success', 'Campaign rejected successfully.');
  }

  /* --------------------------------- KPIs -------------------------------- */

  const kpis = [
    { label: 'Total Campaigns', value: stats.total, icon: Mail, tone: 'from-indigo-500 to-blue-500', onClick: () => setStatusFilter('') },
    { label: 'Draft Campaigns', value: stats.draft, icon: FileEdit, tone: 'from-slate-500 to-slate-700', onClick: () => setStatusFilter(CAMPAIGN_STATUSES.DRAFT) },
    { label: 'Scheduled Campaigns', value: stats.scheduled, icon: CalendarClock, tone: 'from-cyan-500 to-blue-500', onClick: () => setStatusFilter(CAMPAIGN_STATUSES.SCHEDULED) },
    { label: 'Sent Campaigns', value: stats.sent, icon: Send, tone: 'from-emerald-500 to-teal-500', onClick: () => setStatusFilter(CAMPAIGN_STATUSES.SENT) },
    { label: 'Running Campaigns', value: stats.running, icon: Activity, tone: 'from-fuchsia-500 to-pink-500', onClick: () => setStatusFilter(CAMPAIGN_STATUSES.SENDING) },
    { label: 'Paused Campaigns', value: stats.paused, icon: Pause, tone: 'from-amber-500 to-orange-500', onClick: () => setStatusFilter(CAMPAIGN_STATUSES.PAUSED) },
    { label: 'Failed Campaigns', value: stats.failed, icon: AlertOctagon, tone: 'from-rose-500 to-red-500', onClick: () => setStatusFilter(CAMPAIGN_STATUSES.FAILED) },
    { label: 'Average Open Rate', value: `${stats.avgOpenRate}%`, icon: Percent, tone: 'from-fuchsia-500 to-purple-500', onClick: () => setStatusFilter('') },
    { label: 'Average Click Rate', value: `${stats.avgClickRate}%`, icon: Percent, tone: 'from-indigo-500 to-fuchsia-500', onClick: () => setStatusFilter('') },
  ];

  /* --------------------------------- Table ------------------------------- */

  const columns = useMemo(() => {
    const base = [
      {
        key: 'campaignName',
        label: 'Campaign Name',
        priority: 1,
        searchable: true,
        truncate: true,
        render: (row) => (
          <Link
            to={`/app/campaigns/${row.id}`}
            className="font-medium text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-300"
          >
            {row.campaignName}
          </Link>
        ),
      },
      {
        key: 'campaignType',
        label: 'Type',
        priority: 3,
        render: (row) => <Badge tone="indigo">{row.campaignType}</Badge>,
      },
      {
        key: 'subjectLine',
        label: 'Subject Line',
        priority: 4,
        truncate: true,
        tooltip: true,
      },
      {
        key: '_audience',
        label: 'Audience',
        priority: 3,
        render: (row) => audienceLabel(row),
      },
      {
        key: 'recipientCount',
        label: 'Recipients',
        priority: 4,
        width: '110px',
        render: (row) => (row.recipientCount || 0).toLocaleString(),
      },
      {
        key: 'templateName',
        label: 'Template',
        priority: 4,
        truncate: true,
        render: (row) => row.templateName || '—',
      },
      {
        key: 'status',
        label: 'Status',
        priority: 1,
        render: (row) => <CampaignStatusBadge status={row.status} />,
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
        key: 'scheduledAt',
        label: 'Scheduled At',
        priority: 4,
        width: '170px',
        render: (row) => fmtDate(row.scheduledAt),
      },
      {
        key: 'createdAt',
        label: 'Created At',
        priority: 4,
        width: '170px',
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
  }, [isSuperAdmin, role, allowDeleteOption]);

  const filtersBar = (
    <div className="grid w-full gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
      <div className="relative w-full">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={filters.q}
          onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
          placeholder="Search campaigns…"
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-9 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        {filters.q && (
          <button
            type="button"
            onClick={() => setFilters((p) => ({ ...p, q: '' }))}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <FilterSelect
        value={filters.status}
        onChange={(v) => setFilters((p) => ({ ...p, status: v }))}
        placeholder="All statuses"
        options={CAMPAIGN_STATUS_LIST.map((v) => ({ value: v, label: v }))}
      />
      <FilterSelect
        value={filters.campaignType}
        onChange={(v) => setFilters((p) => ({ ...p, campaignType: v }))}
        placeholder="All types"
        options={CAMPAIGN_TYPE_LIST.map((v) => ({ value: v, label: v }))}
      />
      <FilterSelect
        value={filters.templateId}
        onChange={(v) => setFilters((p) => ({ ...p, templateId: v }))}
        placeholder="All templates"
        options={templates.map((t) => ({ value: t.id, label: t.name }))}
      />
      <FilterSelect
        value={filters.segmentId}
        onChange={(v) => setFilters((p) => ({ ...p, segmentId: v }))}
        placeholder="All segments"
        options={segments.map((s) => ({ value: s.id, label: s.name }))}
      />
      {isSuperAdmin && (
        <FilterSelect
          value={filters.organisationName}
          onChange={(v) => setFilters((p) => ({ ...p, organisationName: v }))}
          placeholder="All organisations"
          options={organisationOptions.map((o) => ({ value: o, label: o }))}
        />
      )}
      <input
        type="date"
        value={filters.from}
        onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      />
      <input
        type="date"
        value={filters.to}
        onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      />
      <Button variant="ghost" onClick={clearFilters} type="button" className="w-full">
        Clear filters
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaigns"
        description="Create, schedule and track email campaigns."
        icon={Mail}
        eyebrow={isViewer ? 'Read only' : undefined}
        actions={
          <>
            {allowExport && (
              <Button variant="ghost" onClick={handleExport} type="button">
                <Download className="h-4 w-4" /> Export
              </Button>
            )}
            {allowCreate && (
              <Button onClick={() => navigate('/app/campaigns/create')} type="button">
                <Plus className="h-4 w-4" /> Create Campaign
              </Button>
            )}
          </>
        }
      />

      {isViewer && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <Badge tone="amber" className="mr-2">Read only</Badge>
          Your role can view campaigns and analytics but cannot create, edit, send or delete records.
        </div>
      )}

      {isSuperAdmin && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200">
          <Badge tone="indigo" className="mr-2">Super Admin</Badge>
          Tenant operational data is view-only. Filter by Organisation to inspect each tenant.
        </div>
      )}

      {isMarketingManager && approvalWorkflowEnabled && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <Badge tone="amber" className="mr-2">
            <ClipboardCheck className="h-3 w-3" /> Approval Workflow
          </Badge>
          Your campaigns will be sent for approval before they are scheduled or delivered.
        </div>
      )}

      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {kpis.map((k) => (
          <button
            key={k.label}
            type="button"
            onClick={k.onClick}
            className="cursor-pointer text-left"
          >
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
        tableKey="campaigns"
        rows={filtered}
        columns={columns}
        rowKey="id"
        role={role}
        module={MODULE_KEYS.CAMPAIGNS}
        searchable={false}
        displayMode="auto"
        showSerial
        actions={['view', 'delete']}
        actionHandlers={{
          view: (row) => handleAction(ACTION_KEYS.VIEW, row),
          delete: (row) => handleAction(ACTION_KEYS.DELETE, row),
        }}
        actionPermissions={{
          view: true,
          delete: allowDeleteOption && !isViewer && !isSuperAdmin,
        }}
        filters={filtersBar}
        inlineEditDisabled
        mobileConfig={{
          mobileTitleKey: 'campaignName',
          mobileSubtitleKey: 'subjectLine',
          mobileBadgeKey: 'status',
          mobileDetailKeys: isSuperAdmin
            ? ['organisationName', 'campaignType', 'recipientCount', 'templateName', '_openRate', '_clickRate', 'scheduledAt', 'createdAt']
            : ['campaignType', 'recipientCount', 'templateName', '_openRate', '_clickRate', 'scheduledAt', 'createdAt'],
          mobileActionKeys: ['view', 'delete'],
        }}
        empty={
          filtered.length === 0 && baseScoped.length === 0
            ? 'No campaigns yet. Create your first campaign to get started.'
            : 'No campaigns match your filters.'
        }
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete campaign"
        description={
          deleteTarget
            ? `Are you sure you want to delete campaign ${deleteTarget.campaignName}?`
            : ''
        }
        confirmLabel="Delete"
        variant="danger"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      <ConfirmModal
        open={Boolean(approvalTarget)}
        title="Reject campaign"
        description={
          approvalTarget
            ? `Reject ${approvalTarget.campaignName}? It will move back to Draft.`
            : ''
        }
        confirmLabel="Reject"
        variant="danger"
        onCancel={() => {
          setApprovalTarget(null);
          setRejectComment('');
        }}
        onConfirm={confirmReject}
      />
    </div>
  );
}

function FilterSelect({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
