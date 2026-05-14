/**
 * analytics-contacts.jsx
 *
 * Contact analytics — KPI cards + per-contact table.
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserMinus,
  AlertTriangle,
  ShieldAlert,
  MessageCircle,
  CalendarPlus,
  Activity,
  Eye,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import AppTable from '../../components/ui/app-table.jsx';
import AnalyticsKpiGrid from '../../components/analytics/analytics-kpi-grid.jsx';
import AnalyticsFilterBar from '../../components/analytics/analytics-filter-bar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../config/roles.js';
import { MODULE_KEYS } from '../../config/modules.js';
import {
  getContactAnalytics,
  getOrganisationOptions,
} from '../../services/analytics-service.js';

function fmtDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

const STATUS_TONE = {
  subscribed: 'emerald',
  unsubscribed: 'rose',
  bounced: 'amber',
  complained: 'fuchsia',
  invalid: 'slate',
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

export default function AnalyticsContacts() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const isSuperAdmin = role === ROLES.SUPER_ADMIN;
  const organisations = useMemo(() => getOrganisationOptions(user), [user]);
  const { stats, rows: allRows } = useMemo(
    () => getContactAnalytics(user, filters),
    [user, filters]
  );

  const rows = useMemo(() => {
    let list = allRows.slice();
    if (filters.status) list = list.filter((r) => r.status === filters.status);
    if (filters.q.trim()) {
      const q = filters.q.toLowerCase();
      list = list.filter((r) =>
        [r.fullName, r.emailId, r.contactNumber, r.source, (r.tags || []).join(' ')]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q)
      );
    }
    return list;
  }, [allRows, filters]);

  const kpis = [
    { label: 'Total Contacts', value: stats.total, icon: Users, tone: 'from-indigo-500 to-blue-500' },
    { label: 'Subscribed Contacts', value: stats.subscribed, icon: UserCheck, tone: 'from-emerald-500 to-teal-500' },
    { label: 'Unsubscribed Contacts', value: stats.unsubscribed, icon: UserMinus, tone: 'from-rose-500 to-orange-500' },
    { label: 'Bounced Contacts', value: stats.bounced, icon: AlertTriangle, tone: 'from-amber-500 to-orange-500' },
    { label: 'Invalid Contacts', value: stats.invalid, icon: ShieldAlert, tone: 'from-slate-500 to-slate-700' },
    { label: 'WhatsApp Opted In', value: stats.whatsappOptedIn, icon: MessageCircle, tone: 'from-emerald-500 to-cyan-500' },
    { label: 'New Contacts This Month', value: stats.newThisMonth, icon: CalendarPlus, tone: 'from-fuchsia-500 to-pink-500' },
    { label: 'Average Engagement Score', value: stats.averageEngagement, icon: Activity, tone: 'from-violet-500 to-fuchsia-500' },
  ];

  const columns = useMemo(() => [
    {
      key: 'fullName',
      label: 'Full Name',
      priority: 1,
      truncate: true,
      render: (row) => (
        <button
          type="button"
          onClick={() => navigate(`/app/contacts/${row.id}`)}
          className="cursor-pointer text-left font-medium text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-300"
        >
          {row.fullName}
        </button>
      ),
    },
    { key: 'emailId', label: 'Email ID', priority: 1, truncate: true, tooltip: true },
    { key: 'contactNumber', label: 'Contact Number', priority: 3, width: '140px' },
    {
      key: 'status',
      label: 'Status',
      priority: 1,
      render: (row) => <Badge tone={STATUS_TONE[row.status] || 'slate'}>{row.status}</Badge>,
    },
    {
      key: 'tags',
      label: 'Tags',
      priority: 3,
      render: (row) => {
        const tags = row.tags || [];
        if (tags.length === 0) return <span className="text-xs text-slate-400">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((t) => (
              <span key={t} className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">{t}</span>
            ))}
            {tags.length > 3 && (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">+{tags.length - 3}</span>
            )}
          </div>
        );
      },
    },
    { key: 'source', label: 'Source', priority: 3, render: (r) => r.source || '—' },
    { key: 'engagementScore', label: 'Engagement Score', priority: 4, width: '140px' },
    { key: 'lastActivityAt', label: 'Last Activity', priority: 4, width: '140px', render: (r) => fmtDate(r.lastActivityAt) },
    {
      key: '_actions',
      label: 'Actions',
      priority: 1,
      sortable: false,
      searchable: false,
      width: '90px',
      render: (row) => (
        <button
          type="button"
          onClick={() => navigate(`/app/contacts/${row.id}`)}
          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          title="View Contact"
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [navigate]);

  const filtersBar = (
    <div className="grid w-full gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
      <input
        type="text"
        value={filters.q}
        onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
        placeholder="Search contacts…"
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      />
      <select
        value={filters.status}
        onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      >
        <option value="">All statuses</option>
        {['subscribed', 'unsubscribed', 'bounced', 'complained', 'invalid'].map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact Analytics"
        description="Engagement, source and growth of your contact base."
        icon={Users}
        eyebrow="Drill down"
        actions={
          <Button variant="ghost" onClick={() => navigate('/app/analytics')}>
            Back to overview
          </Button>
        }
      />

      <AnalyticsFilterBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
        campaigns={[]}
        automations={[]}
        organisations={organisations}
        showOrganisation={isSuperAdmin}
        showCampaign={false}
        showAutomation={false}
        showReportType={false}
      />

      <AnalyticsKpiGrid kpis={kpis} />

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
          mobileTitleKey: 'fullName',
          mobileSubtitleKey: 'emailId',
          mobileBadgeKey: 'status',
          mobileDetailKeys: ['contactNumber', 'tags', 'source', 'engagementScore', 'lastActivityAt', '_actions'],
          mobileActionKeys: [],
        }}
        empty="No contact analytics found."
      />
    </div>
  );
}
