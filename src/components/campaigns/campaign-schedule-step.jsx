/**
 * campaign-schedule-step.jsx
 *
 * Step 4: choose how / when the campaign goes out. Validates that the
 * chosen date / time is in the future when "Schedule Later" is picked.
 */

import { useEffect } from 'react';
import { CalendarClock, FileEdit, Send, ClipboardCheck } from 'lucide-react';
import { SCHEDULE_OPTIONS } from '../../config/campaign-status.js';

const OPTIONS = [
  { value: SCHEDULE_OPTIONS.DRAFT, label: 'Save as Draft', hint: 'Keep this campaign as a draft and send later.', icon: FileEdit },
  { value: SCHEDULE_OPTIONS.SEND_NOW, label: 'Send Now', hint: 'Send this campaign immediately to all recipients.', icon: Send },
  { value: SCHEDULE_OPTIONS.SCHEDULE_LATER, label: 'Schedule Later', hint: 'Pick a date and time to send.', icon: CalendarClock },
];

function nowLocalIsoMinutes() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 16);
}

function formatDateForDisplay(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${dd}/${mm}/${yyyy} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
}

export default function CampaignScheduleStep({
  values,
  errors,
  showApproval,
  onChange,
  onValidate,
}) {
  useEffect(() => {
    if (values.scheduleOption !== SCHEDULE_OPTIONS.SCHEDULE_LATER) {
      onValidate?.('scheduledAt', '');
    }
  }, [values.scheduleOption, onValidate]);

  function pick(value) {
    onChange?.('scheduleOption', value);
  }

  function handleSchedule(e) {
    const value = e.target.value;
    onChange?.('scheduledAt', value);
    if (!value) {
      onValidate?.('scheduledAt', 'Schedule date and time are required.');
      return;
    }
    const t = new Date(value).getTime();
    if (Number.isNaN(t)) {
      onValidate?.('scheduledAt', 'Enter a valid date and time.');
      return;
    }
    if (t <= Date.now()) {
      onValidate?.('scheduledAt', 'Schedule date must be in the future.');
      return;
    }
    onValidate?.('scheduledAt', '');
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {OPTIONS.map((o) => {
          const active = values.scheduleOption === o.value;
          const Icon = o.icon;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => pick(o.value)}
              className={`flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition ${
                active
                  ? 'border-indigo-300 bg-gradient-to-br from-indigo-500/10 via-fuchsia-500/5 to-cyan-500/5 ring-1 ring-indigo-300 dark:border-indigo-500/40 dark:from-indigo-500/15 dark:via-fuchsia-500/10 dark:to-cyan-500/10 dark:ring-indigo-500/40'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
              }`}
            >
              <span
                className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${
                  active
                    ? 'bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-glow'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">{o.label}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">{o.hint}</div>
            </button>
          );
        })}
      </div>

      {showApproval && (
        <label
          className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
            values.scheduleOption === SCHEDULE_OPTIONS.SUBMIT_FOR_APPROVAL
              ? 'border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10'
              : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
          }`}
        >
          <input
            type="radio"
            className="mt-1 h-4 w-4 cursor-pointer border-slate-300 text-amber-600 focus:ring-amber-500"
            checked={values.scheduleOption === SCHEDULE_OPTIONS.SUBMIT_FOR_APPROVAL}
            onChange={() => pick(SCHEDULE_OPTIONS.SUBMIT_FOR_APPROVAL)}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <ClipboardCheck className="h-4 w-4 text-amber-600 dark:text-amber-300" />
              Submit for Approval
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              Your campaign will be sent for approval before it is scheduled or delivered.
            </p>
          </div>
        </label>
      )}

      {values.scheduleOption === SCHEDULE_OPTIONS.SCHEDULE_LATER && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Schedule date and time
            <span className="required-marker text-rose-600 dark:text-rose-400">*</span>
          </label>
          <input
            type="datetime-local"
            min={nowLocalIsoMinutes()}
            value={values.scheduledAt || ''}
            onChange={handleSchedule}
            className={`w-full rounded-xl border bg-white px-3 py-3 text-sm text-slate-800 transition focus:outline-none focus:ring-4 dark:bg-slate-900 dark:text-white ${
              errors.scheduledAt
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100 dark:border-rose-500/50'
                : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 dark:border-slate-700'
            }`}
          />
          {values.scheduledAt && !errors.scheduledAt && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Will send on {formatDateForDisplay(values.scheduledAt)}.
            </p>
          )}
          {errors.scheduledAt && (
            <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
              {errors.scheduledAt}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export { formatDateForDisplay };
