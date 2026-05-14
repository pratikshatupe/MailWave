/**
 * analytics-filter-bar.jsx
 *
 * Shared filter strip used on every analytics page. Only the spec'd
 * fields appear — Date Range, Campaign, Automation, Report Type and
 * Organisation (Super Admin only).
 */

import { Filter, RotateCcw } from 'lucide-react';
import Button from '../ui/Button.jsx';
import { REPORT_TYPES } from '../../services/report-service.js';

export default function AnalyticsFilterBar({
  filters,
  onChange,
  onReset,
  campaigns = [],
  automations = [],
  organisations = [],
  showOrganisation = false,
  showCampaign = true,
  showAutomation = true,
  showReportType = true,
  className = '',
}) {
  function set(name, value) {
    onChange?.({ ...filters, [name]: value });
  }

  function setRange(part, value) {
    onChange?.({
      ...filters,
      dateRange: { ...(filters.dateRange || {}), [part]: value },
    });
  }

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        <Filter className="h-4 w-4" /> Filters
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Date Range From
          </span>
          <input
            type="date"
            value={filters.dateRange?.from || ''}
            onChange={(e) => setRange('from', e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Date Range To
          </span>
          <input
            type="date"
            value={filters.dateRange?.to || ''}
            onChange={(e) => setRange('to', e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>
        {showCampaign && (
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Campaign
            </span>
            <select
              value={filters.campaignId || ''}
              onChange={(e) => set('campaignId', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="">All campaigns</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>{c.campaignName || c.name}</option>
              ))}
            </select>
          </label>
        )}
        {showAutomation && (
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Automation
            </span>
            <select
              value={filters.automationId || ''}
              onChange={(e) => set('automationId', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="">All automations</option>
              {automations.map((a) => (
                <option key={a.id} value={a.id}>{a.automationName}</option>
              ))}
            </select>
          </label>
        )}
        {showReportType && (
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Report Type
            </span>
            <select
              value={filters.reportType || ''}
              onChange={(e) => set('reportType', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="">All types</option>
              {REPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
        )}
        {showOrganisation && (
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Organisation
            </span>
            <select
              value={filters.organisationName || ''}
              onChange={(e) => set('organisationName', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="">All organisations</option>
              {organisations.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
        )}
      </div>
      <div className="mt-3 flex justify-end">
        <Button variant="ghost" onClick={onReset}>
          <RotateCcw className="h-4 w-4" /> Clear Filters
        </Button>
      </div>
    </div>
  );
}
