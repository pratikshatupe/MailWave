/**
 * report-form-modal.jsx
 *
 * Self-contained form used by the report-create page. Renders inline (no
 * actual modal chrome) so it works on a dedicated route. Conditional
 * fields:
 *
 *   - Campaign Performance  → Campaign dropdown
 *   - Automation Performance → Automation dropdown
 *   - Contact Engagement     → Segment dropdown (if segments exist)
 *   - Tenant Summary         → Organisation dropdown (Super Admin only)
 *
 * All removed advanced fields (Custom SQL, Webhook, etc.) are simply not
 * rendered.
 */

import { useEffect, useMemo, useState } from 'react';
import Button from '../ui/Button.jsx';
import { REPORT_TYPES } from '../../services/report-service.js';
import { ROLES } from '../../config/roles.js';

const NAME_MAX = 100;

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

export function validateReportPayload(payload) {
  const errors = {};
  const name = (payload.reportName || '').trim();
  if (!name) errors.reportName = 'Report Name is required.';
  else if (name.length > NAME_MAX) errors.reportName = `Report Name maximum ${NAME_MAX} characters.`;
  if (!payload.reportType) errors.reportType = 'Report Type is required.';
  const range = payload.dateRange || {};
  if (isBlank(range.from) && isBlank(range.to)) {
    errors.dateRange = 'Date Range is required.';
  }
  return errors;
}

export default function ReportFormModal({
  initial,
  campaigns = [],
  automations = [],
  segments = [],
  organisations = [],
  role,
  onCancel,
  onSubmit,
  submitting = false,
}) {
  const isSuperAdmin = role === ROLES.SUPER_ADMIN;

  const [form, setForm] = useState(() => ({
    reportName: initial?.reportName || '',
    reportType: initial?.reportType || '',
    dateRange: initial?.dateRange || { from: '', to: '' },
    campaignId: initial?.campaignId || '',
    automationId: initial?.automationId || '',
    segmentId: initial?.segmentId || '',
    organisationName: initial?.organisationName || '',
  }));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initial) {
      setForm({
        reportName: initial.reportName || '',
        reportType: initial.reportType || '',
        dateRange: initial.dateRange || { from: '', to: '' },
        campaignId: initial.campaignId || '',
        automationId: initial.automationId || '',
        segmentId: initial.segmentId || '',
        organisationName: initial.organisationName || '',
      });
    }
  }, [initial]);

  const availableTypes = useMemo(
    () =>
      isSuperAdmin ? REPORT_TYPES : REPORT_TYPES.filter((t) => t !== 'Tenant Summary'),
    [isSuperAdmin]
  );

  function set(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function setRange(part, value) {
    setForm((prev) => ({ ...prev, dateRange: { ...(prev.dateRange || {}), [part]: value } }));
    setErrors((prev) => ({ ...prev, dateRange: undefined }));
  }

  function handleSubmit() {
    const next = validateReportPayload(form);
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    onSubmit?.(form);
  }

  const showCampaign = form.reportType === 'Campaign Performance';
  const showAutomation = form.reportType === 'Automation Performance';
  const showSegment = form.reportType === 'Contact Engagement' && segments.length > 0;
  const showOrganisation = form.reportType === 'Tenant Summary' && isSuperAdmin;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Report Name<span className="text-rose-500">*</span>
          </span>
          <input
            type="text"
            value={form.reportName}
            onChange={(e) => set('reportName', e.target.value)}
            maxLength={NAME_MAX}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          {errors.reportName && <p className="mt-1 text-xs text-rose-600">{errors.reportName}</p>}
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Report Type<span className="text-rose-500">*</span>
          </span>
          <select
            value={form.reportType}
            onChange={(e) => set('reportType', e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="">Select…</option>
            {availableTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {errors.reportType && <p className="mt-1 text-xs text-rose-600">{errors.reportType}</p>}
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Date Range From<span className="text-rose-500">*</span>
            </span>
            <input
              type="date"
              value={form.dateRange.from || ''}
              onChange={(e) => setRange('from', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Date Range To<span className="text-rose-500">*</span>
            </span>
            <input
              type="date"
              value={form.dateRange.to || ''}
              onChange={(e) => setRange('to', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>
          {errors.dateRange && (
            <p className="col-span-2 -mt-2 text-xs text-rose-600">{errors.dateRange}</p>
          )}
        </div>

        {showCampaign && (
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Campaign
            </span>
            <select
              value={form.campaignId || ''}
              onChange={(e) => set('campaignId', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="">All campaigns</option>
              {campaigns.map((c) => <option key={c.id} value={c.id}>{c.campaignName || c.name}</option>)}
            </select>
          </label>
        )}

        {showAutomation && (
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Automation
            </span>
            <select
              value={form.automationId || ''}
              onChange={(e) => set('automationId', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="">All automations</option>
              {automations.map((a) => <option key={a.id} value={a.id}>{a.automationName}</option>)}
            </select>
          </label>
        )}

        {showSegment && (
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Segment
            </span>
            <select
              value={form.segmentId || ''}
              onChange={(e) => set('segmentId', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="">All contacts</option>
              {segments.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        )}

        {showOrganisation && (
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Organisation
            </span>
            <select
              value={form.organisationName || ''}
              onChange={(e) => set('organisationName', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="">All organisations</option>
              {organisations.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={submitting}>Create Report</Button>
      </div>
    </div>
  );
}
