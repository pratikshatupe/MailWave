/**
 * contact-profile-card.jsx
 *
 * Header card for the Contact Details page. Shows identity, location,
 * tags, segments, and quick stats. Used inside contact-details.jsx and
 * reusable wherever a contact summary is needed.
 */

import {
  Mail,
  Phone,
  MapPin,
  Building2,
  Star,
  CalendarDays,
} from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import {
  getStatusTone,
  getStatusLabel,
  getWhatsappLabel,
  getWhatsappTone,
} from '../../config/contact-fields.js';

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function initials(name) {
  if (!name) return 'C';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '')).toUpperCase();
}

export default function ContactProfileCard({ contact, showOrganisation = false }) {
  if (!contact) return null;
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-500/5 via-fuchsia-500/5 to-cyan-500/5 p-6 shadow-soft dark:border-slate-800 dark:from-indigo-500/10 dark:via-fuchsia-500/10 dark:to-cyan-500/10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-lg font-bold text-white shadow-glow">
            {initials(contact.fullName)}
          </div>
          <div className="min-w-0">
            <h2 className="break-words text-xl font-bold text-slate-900 dark:text-white">
              {contact.fullName}
            </h2>
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Mail className="h-4 w-4 text-indigo-500" />
              <span className="break-all">{contact.emailId}</span>
            </p>
            {contact.contactNumber && (
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Phone className="h-4 w-4 text-indigo-500" />
                {contact.contactNumber}
              </p>
            )}
            {(contact.city || contact.country) && (
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <MapPin className="h-4 w-4 text-indigo-500" />
                {[contact.city, contact.state, contact.country]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}
            {showOrganisation && contact.organisationName && (
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Building2 className="h-4 w-4 text-indigo-500" />
                {contact.organisationName}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <Badge tone={getStatusTone(contact.status)}>
            {getStatusLabel(contact.status)}
          </Badge>
          <Badge tone={getWhatsappTone(contact.whatsappOptInStatus)}>
            WhatsApp: {getWhatsappLabel(contact.whatsappOptInStatus)}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <Star className="h-3.5 w-3.5 text-amber-500" />
            Engagement Score {contact.engagementScore ?? 0}
          </div>
        </div>
      </div>

      <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Source
          </dt>
          <dd className="mt-1 text-slate-800 dark:text-slate-100">
            {contact.source || '—'}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Email Consent
          </dt>
          <dd className="mt-1 text-slate-800 dark:text-slate-100">
            {contact.emailConsent ? 'Granted' : 'Not granted'}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            WhatsApp Consent
          </dt>
          <dd className="mt-1 text-slate-800 dark:text-slate-100">
            {contact.whatsappConsent ? 'Granted' : 'Not granted'}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <CalendarDays className="inline h-3 w-3" /> Created At
          </dt>
          <dd className="mt-1 text-slate-800 dark:text-slate-100">
            {formatDate(contact.createdAt)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <CalendarDays className="inline h-3 w-3" /> Updated At
          </dt>
          <dd className="mt-1 text-slate-800 dark:text-slate-100">
            {formatDate(contact.updatedAt)}
          </dd>
        </div>
        <div className="sm:col-span-2 lg:col-span-2">
          <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Tags
          </dt>
          <dd className="mt-1 flex flex-wrap gap-1">
            {(contact.tags || []).length === 0 ? (
              <span className="text-slate-500 dark:text-slate-400">—</span>
            ) : (
              (contact.tags || []).map((t) => (
                <Badge key={t} tone="indigo">
                  {t}
                </Badge>
              ))
            )}
          </dd>
        </div>
        <div className="sm:col-span-2 lg:col-span-2">
          <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Segments
          </dt>
          <dd className="mt-1 flex flex-wrap gap-1">
            {(contact.segments || []).length === 0 ? (
              <span className="text-slate-500 dark:text-slate-400">—</span>
            ) : (
              (contact.segments || []).map((s) => (
                <Badge key={s} tone="fuchsia">
                  {s}
                </Badge>
              ))
            )}
          </dd>
        </div>
      </dl>
    </article>
  );
}
