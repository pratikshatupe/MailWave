/**
 * campaign-audience-step.jsx
 *
 * Step 2: pick the audience. The wizard owns the form values; this
 * component simply renders the choices and reports recipient counts via
 * the central service so unsubscribed / bounced / complained contacts
 * are excluded automatically.
 */

import { useEffect, useMemo, useState } from 'react';
import { Users, Filter, ListChecks, Upload, Search as SearchIcon } from 'lucide-react';
import {
  AUDIENCE_TYPES,
  AUDIENCE_TYPE_LABELS,
} from '../../config/campaign-status.js';
import {
  getContactsForTenant,
  getSegmentsForTenant,
  getEligibleRecipients,
} from '../../services/campaign-service.js';

const OPTIONS = [
  { value: AUDIENCE_TYPES.ALL_CONTACTS, label: AUDIENCE_TYPE_LABELS[AUDIENCE_TYPES.ALL_CONTACTS], icon: Users, hint: 'Send to every subscribed contact in your workspace.' },
  { value: AUDIENCE_TYPES.SEGMENT, label: AUDIENCE_TYPE_LABELS[AUDIENCE_TYPES.SEGMENT], icon: Filter, hint: 'Target contacts who match a saved segment.' },
  { value: AUDIENCE_TYPES.SELECTED_CONTACTS, label: AUDIENCE_TYPE_LABELS[AUDIENCE_TYPES.SELECTED_CONTACTS], icon: ListChecks, hint: 'Hand-pick the contacts to include.' },
  { value: AUDIENCE_TYPES.UPLOAD_LIST, label: AUDIENCE_TYPE_LABELS[AUDIENCE_TYPES.UPLOAD_LIST], icon: Upload, hint: 'Upload a fresh list — coming soon.' },
];

export default function CampaignAudienceStep({ values, errors, tenantId, onChange, onValidate }) {
  const [query, setQuery] = useState('');

  const contacts = useMemo(() => getContactsForTenant(tenantId), [tenantId]);
  const segments = useMemo(() => getSegmentsForTenant(tenantId), [tenantId]);

  const counts = useMemo(
    () =>
      getEligibleRecipients({
        tenantId,
        audienceType: values.audienceType,
        selectedSegmentId: values.selectedSegmentId,
        selectedContactIds: values.selectedContactIds,
        excludedContactIds: values.excludedContactIds,
      }),
    [
      tenantId,
      values.audienceType,
      values.selectedSegmentId,
      values.selectedContactIds,
      values.excludedContactIds,
    ]
  );

  useEffect(() => {
    if (counts.finalRecipients > 0) onValidate?.('audienceType', '');
  }, [counts.finalRecipients, onValidate]);

  function pickAudience(value) {
    onChange?.('audienceType', value);
    if (value !== AUDIENCE_TYPES.SEGMENT) {
      onChange?.('selectedSegmentId', null);
      onChange?.('selectedSegmentName', '');
    }
    if (value !== AUDIENCE_TYPES.SELECTED_CONTACTS) {
      onChange?.('selectedContactIds', []);
    }
  }

  function toggleContact(id) {
    const set = new Set(values.selectedContactIds || []);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    onChange?.('selectedContactIds', Array.from(set));
  }

  const filteredContacts = useMemo(() => {
    if (!query.trim()) return contacts;
    const q = query.toLowerCase();
    return contacts.filter((c) =>
      [c.fullName, c.emailId, c.organisationName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [contacts, query]);

  const showSegmentPicker = values.audienceType === AUDIENCE_TYPES.SEGMENT;
  const showContactsPicker = values.audienceType === AUDIENCE_TYPES.SELECTED_CONTACTS;
  const showUploadPlaceholder = values.audienceType === AUDIENCE_TYPES.UPLOAD_LIST;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {OPTIONS.map((o) => {
          const active = values.audienceType === o.value;
          const Icon = o.icon;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => pickAudience(o.value)}
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
              <div className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">{o.hint}</div>
            </button>
          );
        })}
      </div>

      {errors.audienceType && (
        <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{errors.audienceType}</p>
      )}

      {showSegmentPicker && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Segment
            <span className="required-marker text-rose-600 dark:text-rose-400">*</span>
          </label>
          {segments.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No segments found. Create a segment from the Segments module.
            </p>
          ) : (
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              value={values.selectedSegmentId || ''}
              onChange={(e) => {
                const id = e.target.value;
                const segment = segments.find((s) => s.id === id);
                onChange?.('selectedSegmentId', id || null);
                onChange?.('selectedSegmentName', segment?.name || '');
              }}
            >
              <option value="">Select a segment</option>
              {segments.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
          {errors.selectedSegmentId && (
            <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
              {errors.selectedSegmentId}
            </p>
          )}
        </div>
      )}

      {showContactsPicker && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                Pick contacts
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {(values.selectedContactIds || []).length} selected of {contacts.length}
              </div>
            </div>
            <div className="relative w-full max-w-xs">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search contacts"
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
            {filteredContacts.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No contacts match your search.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredContacts.map((c) => {
                  const checked = (values.selectedContactIds || []).includes(c.id);
                  return (
                    <li key={c.id} className="flex items-center justify-between gap-3 px-3 py-2">
                      <label className="flex flex-1 cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          checked={checked}
                          onChange={() => toggleContact(c.id)}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-slate-900 dark:text-white">
                            {c.fullName || c.emailId}
                          </div>
                          <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {c.emailId}
                          </div>
                        </div>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      {showUploadPlaceholder && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-900">
          <Upload className="mx-auto h-6 w-6 text-slate-400" />
          <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            Upload List is coming soon.
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            For now, please import contacts from the Contacts module and pick them here.
          </p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryTile label="Total Contacts" value={counts.total} />
        <SummaryTile label="Eligible" value={counts.eligible} accent="emerald" />
        <SummaryTile label="Excluded" value={counts.excluded} accent="rose" />
        <SummaryTile label="Final Recipients" value={counts.finalRecipients} accent="indigo" />
      </div>
    </div>
  );
}

function SummaryTile({ label, value, accent = 'slate' }) {
  const palette = {
    slate: 'text-slate-900 dark:text-white',
    emerald: 'text-emerald-600 dark:text-emerald-300',
    rose: 'text-rose-600 dark:text-rose-300',
    indigo: 'text-indigo-600 dark:text-indigo-300',
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className={`mt-1 text-2xl font-extrabold ${palette[accent]}`}>
        {Number(value || 0).toLocaleString()}
      </div>
    </div>
  );
}
