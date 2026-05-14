/**
 * analytics-automations.jsx
 *
 * Per-automation analytics.
 */

import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, Download, Eye, Workflow } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Toast from '../../components/ui/Toast.jsx';
import AppTable from '../../components/ui/app-table.jsx';
import AnalyticsFilterBar from '../../components/analytics/analytics-filter-bar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../config/roles.js';
import { MODULE_KEYS } from '../../config/modules.js';
import { canExport } from '../../config/permissions.js';
import {
  getAutomationAnalytics,
  getScopedAutomations,
  getOrganisationOptions,
  rowsToCsv,
  pushAuditLog,
} from '../../services/analytics-service.js';

function fmtDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
}

const STATUS_TONE = {
  Draft: 'slate',
  Active: 'emerald',
  Paused: 'amber',
  Completed: 'indigo',
  Failed: 'rose',
};

const DEFAULT_FILTERS = {
  dateRange: { from: '', to: '' },
  campaignId: '',
  automationId: '',
  reportType: '',
  organisationName: '',
  q: '',
  status: '',
};

export default function AnalyticsAutomations() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [toast, setToast] = useState(null);

  const isSuperAdmin = role === ROLES.SUPER_ADMIN;
  const allowExport = canExport(role, MODULE_KEYS.ANALYTICS);

  const automations = useMemo(
    () => getScopedAutomations(user, { organisationName: filters.organisationName }),
    [user, filters.organisationName]
  );
  const organisations = useMemo(() => getOrganisationOptions(user), [user]);

  const rows = useMemo(() => {
    let list = getAutomationAnalytics(user, filters);
    if (filters.status) list = list.filter((r) => r.status === filters.status);
    if (filters.q.trim()) {
      const q = filters.q.toLowerCase();
      list = list.filter((r) =>
        [r.automationName, r.status, r.trigger, r.organisationName]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q)
      );
    }
    return list;
  }, [user, filters]);

  function showToast(type, message) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3200);
  }

  function handleExport() {
    if (!allowExport) {
      showToast('error', 'Your role cannot export automation analytics.');
      return;
    }
    const headers = [
      { key: 'automationName', label: 'Automation Name' },
      ...(isSuperAdmin ? [{ key: 'organisationName', label: 'Organisation' }] : []),
      { key: 'status', label: 'Status' },
      { key: 'trigger', label: 'Trigger' },
      { key: 'entered', label: 'Entered' },
      { key: 'emailsSent', label: 'Emails Sent' },
      { key: 'opened', label: 'Opened' },
      { key: 'clicked', label: 'Clicked' },
      { key: 'completed', label: 'Completed' },
      { key: 'openRate', label: 'Open Rate %' },
      { key: 'clickRate', label: 'Click Rate %' },
      { key: 'lastRunAt', label: 'Last Run', value: (r) => fmtDateTime(r.lastRunAt) },
    ];
    const csv = rowsToCsv(headers, rows);
    const today = new Date().toISOString().slice(0, 10);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mailwave-automation-analytics-${today}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    pushAuditLog('analytics.export', {
      tenantId: user?.tenantId,
      actor: user?.email || user?.emailId,
      entity: 'analytics-automations',
    });
    showToast('success', 'Automation analytics exported successfully.');
  }

  const columns = useMemo(() => {
    const base = [
      {
        key: 'automationName',
        label: 'Automation Name',
        priority: 1,
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
      { key: 'status', label: 'Status', priority: 1, render: (row) => <Badge tone={STATUS_TONE[row.status] || 'slate'}>{row.status}</Badge> },
      { key: 'trigger', label: 'Trigger', priority: 2, truncate: true },
      { key: 'entered', label: 'Entered', priority: 3, width: '100px', render: (r) => r.entered.toLocaleString() },
      { key: 'emailsSent', label: 'Emails Sent', priority: 3, width: '120px', render: (r) => r.emailsSent.toLocaleString() },
      { key: 'opened', label: 'Opened', priority: 3, width: '100px', render: (r) => r.opened.toLocaleString() },
      { key: 'clicked', label: 'Clicked', priority: 3, width: '100px', render: (r) => r.clicked.toLocaleString() },
      { key: 'completed', label: 'Completed', priority: 4, width: '110px', render: (r) => r.completed.toLocaleString() },
      { key: 'openRate', label: 'Open Rate', priority: 2, width: '110px', render: (r) => `${r.openRate}%` },
      { key: 'clickRate', label: 'Click Rate', priority: 2, width: '110px', render: (r) => `${r.clickRate}%` },
      { key: 'lastRunAt', label: 'Last Run', priority: 4, width: '160px', render: (r) => fmtDateTime(r.lastRunAt) },
      {
        key: '_actions',
        label: 'Actions',
        priority: 1,
        sortable: false,
        searchable: false,
        width: '160px',
        render: (row) => (
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={() => navigate(`/app/automations/${row.id}`)}
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              title="View Automation"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate(`/app/automations/${row.id}/analytics`)}
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              title="View Analytics"
            >
              <BarChart3 className="h-4 w-4" />
            </button>
            {allowExport && (
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                title="Export"
              >
                <Download className="h-4 w-4" />
              </button>
            )}
          </div>
        ),
      },
    ];
    if (isSuperAdmin) {
      base.splice(1, 0, {
        key: 'organisationName',
        label: 'Organisation',
        priority: 2,
        truncate: true,
        render: (row) => row.organisationName || '—',
      });
    }
    return base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin, allowExport, navigate]);

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
        {Object.keys(STATUS_TONE).map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automation Analytics"
        description="Performance for every automation in your workspace."
        icon={Workflow}
        eyebrow="Drill down"
        actions={
          <Button variant="ghost" onClick={() => navigate('/app/analytics')}>
            Back to overview
          </Button>
        }
      />

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <AnalyticsFilterBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
        campaigns={[]}
        automations={automations}
        organisations={organisations}
        showOrganisation={isSuperAdmin}
        showCampaign={false}
        showReportType={false}
      />

      <AppTable
        rows={rows}
        columns={columns}
        rowKey="id"
        role={role}
        module={MODULE_KEYS.ANALYTICS}
        searchable={false}
        showSerial
        actions={[]}
        filters={filtersBar}
        inlineEditDisabled
        mobileConfig={{
          mobileTitleKey: 'automationName',
          mobileSubtitleKey: 'trigger',
          mobileBadgeKey: 'status',
          mobileDetailKeys: isSuperAdmin
            ? ['organisationName', 'entered', 'emailsSent', 'opened', 'clicked', 'completed', 'openRate', 'clickRate', 'lastRunAt', '_actions']
            : ['entered', 'emailsSent', 'opened', 'clicked', 'completed', 'openRate', 'clickRate', 'lastRunAt', '_actions'],
          mobileActionKeys: [],
        }}
        empty="No automation analytics found."
      />
    </div>
  );
}
