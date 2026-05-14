/**
 * automation-analytics.jsx
 *
 * Simulated analytics view for a single automation. Reads metrics from the
 * service (locally seeded / generated when an automation is activated).
 */

import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BarChart3,
  Workflow,
  Mail,
  MousePointerClick,
  CheckCircle2,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../config/roles.js';
import { getAutomationAnalytics } from '../../services/automation-service.js';

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function AutomationAnalytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const analytics = useMemo(() => getAutomationAnalytics(id), [id]);

  useEffect(() => {
    if (!analytics) return;
    if (
      role !== ROLES.SUPER_ADMIN &&
      analytics.automation.tenantId !== user?.tenantId
    ) {
      navigate('/app/automations', { replace: true });
    }
  }, [analytics, role, user, navigate]);

  if (!analytics) {
    return (
      <div className="space-y-6">
        <PageHeader title="Automation Analytics" icon={BarChart3} />
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          Automation not found.
          <div className="mt-4">
            <Button onClick={() => navigate('/app/automations')}>Back to list</Button>
          </div>
        </div>
      </div>
    );
  }

  const { automation, audience, metrics, activity } = analytics;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${automation.automationName} — Analytics`}
        description="Simulated open / click metrics and audience funnel."
        icon={BarChart3}
        eyebrow={automation.status}
        actions={
          <Button variant="ghost" onClick={() => navigate(`/app/automations/${automation.id}`)}>
            Back to automation
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard Icon={Workflow} label="Contacts Entered" value={metrics.entered.toLocaleString()} tone="from-indigo-500 to-blue-500" />
        <StatCard Icon={Mail} label="Emails Sent" value={metrics.emailsSent.toLocaleString()} tone="from-fuchsia-500 to-pink-500" />
        <StatCard Icon={BarChart3} label="Open Rate" value={`${metrics.openRate}%`} tone="from-emerald-500 to-teal-500" />
        <StatCard Icon={MousePointerClick} label="Click Rate" value={`${metrics.clickRate}%`} tone="from-amber-500 to-orange-500" />
        <StatCard Icon={CheckCircle2} label="Completed" value={metrics.completed.toLocaleString()} tone="from-cyan-500 to-blue-500" />
        <StatCard Icon={Mail} label="Opened" value={metrics.opened.toLocaleString()} tone="from-violet-500 to-fuchsia-500" />
        <StatCard Icon={MousePointerClick} label="Clicked" value={metrics.clicked.toLocaleString()} tone="from-rose-500 to-orange-500" />
        <StatCard Icon={Workflow} label="Final Audience" value={audience.finalAudience.toLocaleString()} tone="from-slate-500 to-slate-700" />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Audience funnel</h2>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <Funnel label="Total" value={audience.total} tone="slate" />
          <Funnel label="Eligible" value={audience.eligible} tone="emerald" />
          <Funnel label="Excluded" value={audience.excluded} tone="rose" />
          <Funnel label="Final" value={audience.finalAudience} tone="indigo" />
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Activity timeline</h2>
        {activity.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No activity yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {activity.map((a, idx) => (
              <li
                key={`${a.label}-${idx}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-800/40"
              >
                <span className="font-medium text-slate-800 dark:text-slate-100">{a.label}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {formatDate(a.at)} · {a.actor}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Funnel({ label, value, tone }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/30">
      <Badge tone={tone}>{label}</Badge>
      <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{value.toLocaleString()}</p>
    </div>
  );
}
