/**
 * Analytics.jsx
 *
 * Main Analytics overview. Reads campaigns / automations / contacts from
 * localStorage scoped to the current user and renders KPIs, charts and
 * top / low performing campaigns.
 *
 * Same page serves every role. Visible data + Organisation filter +
 * Export button switch based on currentUser.role and currentUser.tenantId.
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Download,
  Mail,
  CheckCircle2,
  MousePointerClick,
  AlertTriangle,
  UserMinus,
  Percent,
  Activity,
  Workflow,
  Users,
  CalendarPlus,
  ArrowRight,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Toast from '../../components/ui/Toast.jsx';
import AnalyticsFilterBar from '../../components/analytics/analytics-filter-bar.jsx';
import AnalyticsKpiGrid from '../../components/analytics/analytics-kpi-grid.jsx';
import PerformanceTrendChart from '../../components/analytics/performance-trend-chart.jsx';
import CampaignComparisonChart from '../../components/analytics/campaign-comparison-chart.jsx';
import AutomationPerformanceChart from '../../components/analytics/automation-performance-chart.jsx';
import ContactGrowthChart from '../../components/analytics/contact-growth-chart.jsx';
import EngagementBreakdownChart from '../../components/analytics/engagement-breakdown-chart.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../config/roles.js';
import { MODULE_KEYS } from '../../config/modules.js';
import { canExport } from '../../config/permissions.js';
import {
  getAnalyticsOverview,
  getEmailPerformanceTrend,
  getCampaignComparisonSeries,
  getAutomationPerformanceSeries,
  getContactGrowth,
  getEngagementBreakdown,
  getTopCampaigns,
  getLowPerformingCampaigns,
  getScopedCampaigns,
  getScopedAutomations,
  getOrganisationOptions,
  exportAnalyticsCsv,
} from '../../services/analytics-service.js';

const DEFAULT_FILTERS = {
  dateRange: { from: '', to: '' },
  campaignId: '',
  automationId: '',
  reportType: '',
  organisationName: '',
};

export default function Analytics() {
  const { user, role } = useAuth();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [toast, setToast] = useState(null);

  const isSuperAdmin = role === ROLES.SUPER_ADMIN;
  const allowExport = canExport(role, MODULE_KEYS.ANALYTICS);

  const campaigns = useMemo(
    () => getScopedCampaigns(user, { organisationName: filters.organisationName }),
    [user, filters.organisationName]
  );
  const automations = useMemo(
    () => getScopedAutomations(user, { organisationName: filters.organisationName }),
    [user, filters.organisationName]
  );
  const organisations = useMemo(() => getOrganisationOptions(user), [user]);

  const overview = useMemo(() => getAnalyticsOverview(user, filters), [user, filters]);
  const trend = useMemo(() => getEmailPerformanceTrend(user, filters), [user, filters]);
  const comparison = useMemo(() => getCampaignComparisonSeries(user, filters), [user, filters]);
  const automationSeries = useMemo(() => getAutomationPerformanceSeries(user, filters), [user, filters]);
  const contactGrowth = useMemo(() => getContactGrowth(user, filters), [user, filters]);
  const engagement = useMemo(() => getEngagementBreakdown(user, filters), [user, filters]);
  const topCampaigns = useMemo(() => getTopCampaigns(user, filters), [user, filters]);
  const lowCampaigns = useMemo(() => getLowPerformingCampaigns(user, filters), [user, filters]);

  function showToast(type, message) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3200);
  }

  function handleExport() {
    if (!allowExport) {
      showToast('error', 'Your role cannot export analytics.');
      return;
    }
    try {
      exportAnalyticsCsv(user, filters);
      showToast('success', 'Analytics exported successfully.');
    } catch (err) {
      showToast('error', err?.message || 'Failed to export analytics.');
    }
  }

  const kpis = [
    { label: 'Total Emails Sent', value: overview.totalEmailsSent, icon: Mail, tone: 'from-indigo-500 to-blue-500' },
    { label: 'Delivered', value: overview.delivered, icon: CheckCircle2, tone: 'from-emerald-500 to-teal-500' },
    { label: 'Opened', value: overview.opened, icon: Activity, tone: 'from-cyan-500 to-blue-500' },
    { label: 'Clicked', value: overview.clicked, icon: MousePointerClick, tone: 'from-fuchsia-500 to-pink-500' },
    { label: 'Bounced', value: overview.bounced, icon: AlertTriangle, tone: 'from-amber-500 to-orange-500' },
    { label: 'Unsubscribed', value: overview.unsubscribed, icon: UserMinus, tone: 'from-rose-500 to-red-500' },
    { label: 'Open Rate', value: `${overview.openRate}%`, icon: Percent, tone: 'from-emerald-500 to-cyan-500' },
    { label: 'Click Rate', value: `${overview.clickRate}%`, icon: Percent, tone: 'from-fuchsia-500 to-purple-500' },
    { label: 'Bounce Rate', value: `${overview.bounceRate}%`, icon: Percent, tone: 'from-amber-500 to-rose-500' },
    { label: 'Unsubscribe Rate', value: `${overview.unsubscribeRate}%`, icon: Percent, tone: 'from-slate-500 to-slate-700' },
    { label: 'Active Campaigns', value: overview.activeCampaigns, icon: Mail, tone: 'from-violet-500 to-fuchsia-500' },
    { label: 'Active Automations', value: overview.activeAutomations, icon: Workflow, tone: 'from-indigo-500 to-fuchsia-500' },
    { label: 'Total Contacts', value: overview.totalContacts, icon: Users, tone: 'from-blue-500 to-cyan-500' },
    { label: 'New Contacts This Month', value: overview.newContactsThisMonth, icon: CalendarPlus, tone: 'from-pink-500 to-rose-500' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Track campaign, automation and contact performance."
        icon={BarChart3}
        eyebrow="Insights"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {allowExport && (
              <Button variant="ghost" onClick={handleExport}>
                <Download className="h-4 w-4" /> Export Analytics
              </Button>
            )}
          </div>
        }
      />

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <AnalyticsFilterBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
        campaigns={campaigns}
        automations={automations}
        organisations={organisations}
        showOrganisation={isSuperAdmin}
      />

      <AnalyticsKpiGrid kpis={kpis} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PerformanceTrendChart data={trend} />
        </div>
        <EngagementBreakdownChart data={engagement} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CampaignComparisonChart data={comparison} />
        <AutomationPerformanceChart data={automationSeries} />
      </div>

      <ContactGrowthChart data={contactGrowth} />

      <div className="grid gap-4 lg:grid-cols-2">
        <CampaignSubsection
          title="Top Campaigns"
          hint="Highest open rate"
          rows={topCampaigns}
          emptyMessage="No campaign analytics found."
          tone="emerald"
        />
        <CampaignSubsection
          title="Low Performing Campaigns"
          hint="Lowest open rate (with sends)"
          rows={lowCampaigns}
          emptyMessage="No campaign analytics found."
          tone="rose"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          to="/app/analytics/campaigns"
          className="group flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft transition hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Drill down</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Campaign Analytics</p>
          </div>
          <ArrowRight className="h-4 w-4 text-indigo-500 transition group-hover:translate-x-0.5" />
        </Link>
        <Link
          to="/app/analytics/automations"
          className="group flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft transition hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Drill down</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Automation Analytics</p>
          </div>
          <ArrowRight className="h-4 w-4 text-indigo-500 transition group-hover:translate-x-0.5" />
        </Link>
        <Link
          to="/app/analytics/contacts"
          className="group flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft transition hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Drill down</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Contact Analytics</p>
          </div>
          <ArrowRight className="h-4 w-4 text-indigo-500 transition group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

function CampaignSubsection({ title, hint, rows, emptyMessage, tone }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
        </div>
      </div>
      {rows.length === 0 ? (
        <div className="grid h-32 place-items-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {emptyMessage}
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-800/40"
            >
              <div className="min-w-0 flex-1">
                <Link
                  to={`/app/campaigns/${r.id}`}
                  className="block truncate font-medium text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-300"
                >
                  {r.campaignName}
                </Link>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Sent {r.sent.toLocaleString()} · Delivered {r.delivered.toLocaleString()}
                </div>
              </div>
              <Badge tone={tone}>{r.openRate}% open</Badge>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
