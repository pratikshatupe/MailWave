/**
 * contact-filter-bar.jsx
 *
 * Filter strip used on the Contacts page. Each select stays in sync with
 * the parent's `filters` object; the parent owns state so it can also
 * combine the filters with search, KPI clicks, etc.
 */

import { Filter, RefreshCcw } from 'lucide-react';
import SearchField from '../ui/SearchField.jsx';
import SelectField from '../ui/SelectField.jsx';
import Button from '../ui/Button.jsx';
import {
  CONTACT_STATUS_OPTIONS,
  CONTACT_SOURCE_OPTIONS,
  WHATSAPP_OPT_IN_OPTIONS,
} from '../../config/contact-fields.js';

export default function ContactFilterBar({
  filters,
  onChange,
  onReset,
  tagOptions = [],
  segmentOptions = [],
  organisationOptions = [],
  showOrganisationFilter = false,
}) {
  function set(name, value) {
    onChange?.({ ...filters, [name]: value });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        <Filter className="h-4 w-4" /> Filters
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <SearchField
          value={filters.q || ''}
          onChange={(e) => set('q', e.target.value)}
          placeholder="Search by name, email, tag…"
          className="col-span-full sm:col-span-2"
        />
        <SelectField
          name="status"
          label="Status"
          placeholder="All statuses"
          value={filters.status || ''}
          onChange={(e) => set('status', e.target.value)}
          options={[{ value: '', label: 'All statuses' }, ...CONTACT_STATUS_OPTIONS]}
        />
        <SelectField
          name="source"
          label="Source"
          placeholder="All sources"
          value={filters.source || ''}
          onChange={(e) => set('source', e.target.value)}
          options={[{ value: '', label: 'All sources' }, ...CONTACT_SOURCE_OPTIONS]}
        />
        <SelectField
          name="tag"
          label="Tag"
          placeholder="All tags"
          value={filters.tag || ''}
          onChange={(e) => set('tag', e.target.value)}
          options={[
            { value: '', label: 'All tags' },
            ...tagOptions.map((t) => ({ value: t, label: t })),
          ]}
        />
        <SelectField
          name="segment"
          label="Segment"
          placeholder="All segments"
          value={filters.segment || ''}
          onChange={(e) => set('segment', e.target.value)}
          options={[
            { value: '', label: 'All segments' },
            ...segmentOptions.map((s) => ({ value: s, label: s })),
          ]}
        />
        <SelectField
          name="whatsappOptInStatus"
          label="WhatsApp Opt-In"
          placeholder="All"
          value={filters.whatsappOptInStatus || ''}
          onChange={(e) => set('whatsappOptInStatus', e.target.value)}
          options={[{ value: '', label: 'All' }, ...WHATSAPP_OPT_IN_OPTIONS]}
        />
        {showOrganisationFilter && (
          <SelectField
            name="organisationName"
            label="Organisation"
            placeholder="All organisations"
            value={filters.organisationName || ''}
            onChange={(e) => set('organisationName', e.target.value)}
            options={[
              { value: '', label: 'All organisations' },
              ...organisationOptions.map((o) => ({ value: o, label: o })),
            ]}
          />
        )}
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Created from
          </span>
          <input
            type="date"
            value={filters.from || ''}
            onChange={(e) => set('from', e.target.value)}
            className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Created to
          </span>
          <input
            type="date"
            value={filters.to || ''}
            onChange={(e) => set('to', e.target.value)}
            className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>
      </div>
      <div className="mt-3 flex justify-end">
        <Button variant="ghost" onClick={onReset}>
          <RefreshCcw className="h-4 w-4" /> Clear filters
        </Button>
      </div>
    </div>
  );
}
