/**
 * services/contact-service.js
 *
 * Frontend-only service layer for the Contact Management module. All reads
 * and writes go through localStorage so the module is fully usable on
 * localhost with no backend. Each function below has the same signature
 * a future Axios-backed service will use, so swapping this implementation
 * is a single file change.
 *
 * Storage keys:
 *   mailwave-contacts          → contact records
 *   mailwave-contact-tags      → tag records
 *   mailwave-contact-segments  → segment records
 *   mailwave-contact-activity  → custom activity entries (in addition to
 *                                the auto-generated timeline)
 */

import {
  SAMPLE_CONTACTS,
  SAMPLE_TAGS_SEED,
  SAMPLE_SEGMENTS_SEED,
} from '../mock/contacts.js';
import { buildActivityForContact } from '../mock/contact-activity.js';
import {
  CONTACT_STATUSES,
  CONSENT_TRUE_VALUES,
  CONSENT_FALSE_VALUES,
  WHATSAPP_OPT_IN_STATUSES,
} from '../config/contact-fields.js';

const KEYS = {
  contacts: 'mailwave-contacts',
  tags: 'mailwave-contact-tags',
  segments: 'mailwave-contact-segments',
  activity: 'mailwave-contact-activity',
};

/* ------------------------------- helpers ------------------------------- */

function isBrowser() {
  return typeof window !== 'undefined' && !!window.localStorage;
}

function read(key, fallback) {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors – out of scope for the demo */
  }
}

function seed() {
  if (!isBrowser()) return;
  if (!window.localStorage.getItem(KEYS.contacts)) {
    write(KEYS.contacts, SAMPLE_CONTACTS);
  }
  if (!window.localStorage.getItem(KEYS.tags)) {
    write(KEYS.tags, SAMPLE_TAGS_SEED);
  }
  if (!window.localStorage.getItem(KEYS.segments)) {
    write(KEYS.segments, SAMPLE_SEGMENTS_SEED);
  }
  if (!window.localStorage.getItem(KEYS.activity)) {
    write(KEYS.activity, {});
  }
}

function rawContacts() {
  seed();
  return read(KEYS.contacts, []);
}

function rawTags() {
  seed();
  return read(KEYS.tags, []);
}

function rawSegments() {
  seed();
  return read(KEYS.segments, []);
}

function nowIso() {
  return new Date().toISOString();
}

function newId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

function matchesQuery(contact, q) {
  if (!q) return true;
  const needle = q.toLowerCase();
  const hay = [
    contact.fullName,
    contact.emailId,
    contact.contactNumber,
    contact.city,
    contact.source,
    contact.organisationName,
    (contact.tags || []).join(' '),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return hay.includes(needle);
}

function applyFilters(list, params = {}) {
  let next = list.slice();
  if (params.tenantId) {
    next = next.filter((c) => c.tenantId === params.tenantId);
  }
  if (params.organisationName) {
    next = next.filter((c) => c.organisationName === params.organisationName);
  }
  if (params.status) {
    next = next.filter((c) => c.status === params.status);
  }
  if (params.source) {
    next = next.filter((c) => c.source === params.source);
  }
  if (params.tag) {
    next = next.filter((c) => (c.tags || []).includes(params.tag));
  }
  if (params.segment) {
    next = next.filter((c) => (c.segments || []).includes(params.segment));
  }
  if (params.whatsappOptInStatus) {
    next = next.filter((c) => c.whatsappOptInStatus === params.whatsappOptInStatus);
  }
  if (params.from) {
    const t = new Date(params.from).getTime();
    next = next.filter((c) => new Date(c.createdAt).getTime() >= t);
  }
  if (params.to) {
    const t = new Date(params.to).getTime() + 24 * 3600 * 1000;
    next = next.filter((c) => new Date(c.createdAt).getTime() <= t);
  }
  if (params.q) {
    next = next.filter((c) => matchesQuery(c, params.q));
  }
  return next;
}

/* ------------------------------ contacts ------------------------------ */

export function getContacts(params = {}) {
  const all = rawContacts();
  const filtered = applyFilters(all, params);
  return filtered.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getContactById(id) {
  return rawContacts().find((c) => c.id === id) || null;
}

export function existsEmail(emailId, tenantId, excludeId = null) {
  if (!emailId || !tenantId) return false;
  const list = rawContacts();
  const normalised = emailId.trim().toLowerCase();
  return list.some(
    (c) =>
      c.id !== excludeId &&
      c.tenantId === tenantId &&
      (c.emailId || '').toLowerCase() === normalised
  );
}

export function createContact(payload, context = {}) {
  const list = rawContacts();
  const tenantId = payload.tenantId || context.tenantId;
  const organisationName =
    payload.organisationName || context.organisationName || '';
  const next = {
    id: newId('c'),
    tenantId,
    organisationName,
    fullName: payload.fullName?.trim() || '',
    emailId: payload.emailId?.trim() || '',
    contactNumber: payload.contactNumber || '',
    country: payload.country || '',
    state: payload.state || '',
    city: payload.city || '',
    postalCode: payload.postalCode || '',
    tags: payload.tags || [],
    segments: payload.segments || [],
    source: payload.source || 'Manual',
    status: payload.status || CONTACT_STATUSES.SUBSCRIBED,
    emailConsent: Boolean(payload.emailConsent),
    whatsappConsent: Boolean(payload.whatsappConsent),
    whatsappOptInStatus: payload.whatsappOptInStatus || 'pending',
    engagementScore: 0,
    notes: payload.notes || '',
    unsubscribeReason: '',
    unsubscribedAt: null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    lastActivityAt: nowIso(),
  };
  list.push(next);
  write(KEYS.contacts, list);
  return next;
}

export function updateContact(id, payload) {
  const list = rawContacts();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const updated = {
    ...list[idx],
    ...payload,
    id,
    updatedAt: nowIso(),
  };
  list[idx] = updated;
  write(KEYS.contacts, list);
  return updated;
}

export function deleteContact(id) {
  const list = rawContacts();
  const next = list.filter((c) => c.id !== id);
  write(KEYS.contacts, next);
  return next.length !== list.length;
}

export function bulkDeleteContacts(ids = []) {
  const set = new Set(ids);
  const list = rawContacts();
  const next = list.filter((c) => !set.has(c.id));
  write(KEYS.contacts, next);
  return list.length - next.length;
}

export function bulkUpdateContacts(ids, patch) {
  const set = new Set(ids);
  const list = rawContacts();
  let count = 0;
  const next = list.map((c) => {
    if (!set.has(c.id)) return c;
    count += 1;
    return { ...c, ...patch, updatedAt: nowIso() };
  });
  write(KEYS.contacts, next);
  return count;
}

export function addTagToContacts(ids, tagName) {
  if (!tagName) return 0;
  const set = new Set(ids);
  const list = rawContacts();
  let count = 0;
  const next = list.map((c) => {
    if (!set.has(c.id)) return c;
    const tags = c.tags || [];
    if (tags.includes(tagName)) return c;
    count += 1;
    return { ...c, tags: [...tags, tagName], updatedAt: nowIso() };
  });
  write(KEYS.contacts, next);
  return count;
}

export function removeTagFromContacts(ids, tagName) {
  if (!tagName) return 0;
  const set = new Set(ids);
  const list = rawContacts();
  let count = 0;
  const next = list.map((c) => {
    if (!set.has(c.id)) return c;
    const tags = c.tags || [];
    if (!tags.includes(tagName)) return c;
    count += 1;
    return {
      ...c,
      tags: tags.filter((t) => t !== tagName),
      updatedAt: nowIso(),
    };
  });
  write(KEYS.contacts, next);
  return count;
}

export function unsubscribeContacts(ids, reason = 'Unsubscribed by admin') {
  const set = new Set(ids);
  const list = rawContacts();
  let count = 0;
  const next = list.map((c) => {
    if (!set.has(c.id)) return c;
    count += 1;
    return {
      ...c,
      status: CONTACT_STATUSES.UNSUBSCRIBED,
      emailConsent: false,
      unsubscribeReason: reason,
      unsubscribedAt: nowIso(),
      updatedAt: nowIso(),
    };
  });
  write(KEYS.contacts, next);
  return count;
}

export function resubscribeContact(id) {
  return updateContact(id, {
    status: CONTACT_STATUSES.SUBSCRIBED,
    emailConsent: true,
    unsubscribeReason: '',
    unsubscribedAt: null,
  });
}

/* ----------------------------- importing ----------------------------- */

/**
 * Parse CSV text into a 2D array. Handles quoted values with commas /
 * escaped quotes. Returns { header: [...], rows: [[...]] }.
 */
export function parseCsv(text) {
  const cleaned = String(text || '').replace(/\r\n?/g, '\n');
  const rows = [];
  let current = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < cleaned.length; i += 1) {
    const ch = cleaned[i];
    if (inQuotes) {
      if (ch === '"') {
        if (cleaned[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      current.push(cell);
      cell = '';
    } else if (ch === '\n') {
      current.push(cell);
      rows.push(current);
      current = [];
      cell = '';
    } else {
      cell += ch;
    }
  }
  if (cell.length > 0 || current.length > 0) {
    current.push(cell);
    rows.push(current);
  }
  const header = rows.shift() || [];
  const body = rows.filter((r) => r.some((v) => v && v.trim() !== ''));
  return { header: header.map((h) => h.trim()), rows: body };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ALLOWED_STATUSES = new Set([
  CONTACT_STATUSES.SUBSCRIBED,
  CONTACT_STATUSES.UNSUBSCRIBED,
  CONTACT_STATUSES.BOUNCED,
  CONTACT_STATUSES.COMPLAINED,
  'pending',
  CONTACT_STATUSES.INVALID,
]);

const ALLOWED_WHATSAPP_STATUSES = new Set([
  WHATSAPP_OPT_IN_STATUSES.OPTED_IN,
  WHATSAPP_OPT_IN_STATUSES.OPTED_OUT,
  WHATSAPP_OPT_IN_STATUSES.PENDING,
]);

/**
 * Parse a CSV cell into a boolean. Returns:
 *   { ok: true, value: boolean }      when the cell matches a known token
 *   { ok: false, value: undefined }   for anything else (caller reports error)
 *
 * An empty string maps to `false` so that omitting the column does not flag
 * every row as invalid.
 */
export function parseConsent(raw) {
  const s = String(raw ?? '').trim().toLowerCase();
  if (CONSENT_TRUE_VALUES.has(s)) return { ok: true, value: true };
  if (CONSENT_FALSE_VALUES.has(s)) return { ok: true, value: false };
  return { ok: false, value: undefined };
}

/**
 * Validate one mapped import row. Returns an array of structured errors:
 *   [{ field, reason }]
 *
 * The modal renders these in a table with Row / Field / Reason columns.
 * `importContacts` reads `.reason` on the first entry to mirror the legacy
 * error string into the summary.
 */
export function validateImportRow(row) {
  const errors = [];
  const push = (field, reason) => errors.push({ field, reason });

  if (!row.fullName || row.fullName.trim().length < 2) {
    push('fullName', 'Full Name is required.');
  } else if (!/^[A-Za-z ]+$/.test(row.fullName.trim())) {
    push('fullName', 'Full Name must contain only letters and spaces.');
  }

  if (!row.emailId || !EMAIL_RE.test(String(row.emailId).trim())) {
    push('emailId', 'Invalid Email ID.');
  }

  const whatsappConsent = row.whatsappConsent;
  const phoneProvided = Boolean(
    (row.contactNumber && String(row.contactNumber).trim()) ||
      (row.phone && String(row.phone).trim())
  );

  if (row.contactNumber) {
    const cn = String(row.contactNumber).trim().replace(/\D/g, '');
    if (cn.length < 6 || cn.length > 15) {
      push('contactNumber', 'Contact Number must be 6 to 15 digits.');
    } else if ((row.country || '').toLowerCase() === 'india' && !/^[6-9]\d{9}$/.test(cn)) {
      push('contactNumber', 'Indian numbers must be 10 digits starting with 6, 7, 8 or 9.');
    }
  }

  if (row.countryCode) {
    if (!/^\+?\d{1,4}$/.test(String(row.countryCode).trim())) {
      push('countryCode', 'Country Code must look like +91 or 91.');
    }
  }

  if (row.status) {
    if (!ALLOWED_STATUSES.has(String(row.status).trim().toLowerCase())) {
      push('status', `Status must be one of: ${[...ALLOWED_STATUSES].join(', ')}.`);
    }
  }

  if (row.emailConsent !== undefined && row.emailConsent !== '') {
    if (!parseConsent(row.emailConsent).ok) {
      push('emailConsent', 'Email Consent must be true or false.');
    }
  }
  let parsedWhatsappConsent = null;
  if (whatsappConsent !== undefined && whatsappConsent !== '') {
    parsedWhatsappConsent = parseConsent(whatsappConsent);
    if (!parsedWhatsappConsent.ok) {
      push('whatsappConsent', 'WhatsApp Consent must be true or false.');
    }
  }

  if (parsedWhatsappConsent?.ok && parsedWhatsappConsent.value && !phoneProvided) {
    push('phone', 'Phone is required when WhatsApp Consent is true.');
  }

  if (row.whatsappOptInStatus) {
    if (!ALLOWED_WHATSAPP_STATUSES.has(String(row.whatsappOptInStatus).trim().toLowerCase())) {
      push(
        'whatsappOptInStatus',
        `WhatsApp Opt-In Status must be one of: ${[...ALLOWED_WHATSAPP_STATUSES].join(', ')}.`
      );
    }
  }

  return errors;
}

/**
 * Import contacts from already-mapped rows.
 * @param rows            Array of plain objects keyed by contact field names.
 * @param duplicateMode   'skip' | 'update' | 'createNew'.
 * @param context         { tenantId, organisationName }.
 */
export function importContacts(rows = [], duplicateMode = 'skip', context = {}) {
  const list = rawContacts();
  const tenantId = context.tenantId;
  const organisationName = context.organisationName || '';
  const summary = {
    total: rows.length,
    valid: 0,
    invalid: 0,
    duplicates: 0,
    imported: 0,
    updated: 0,
    skipped: 0,
    failed: [],
  };
  rows.forEach((row, idx) => {
    const errors = validateImportRow(row);
    if (errors.length > 0) {
      summary.invalid += 1;
      summary.failed.push({
        row: idx + 1,
        emailId: row.emailId || '',
        field: errors[0].field,
        reason: errors[0].reason,
      });
      return;
    }
    summary.valid += 1;
    const dupIdx = list.findIndex(
      (c) =>
        c.tenantId === tenantId &&
        (c.emailId || '').toLowerCase() === row.emailId.trim().toLowerCase()
    );
    if (dupIdx !== -1) {
      summary.duplicates += 1;
      if (duplicateMode === 'skip') {
        summary.skipped += 1;
        return;
      }
      if (duplicateMode === 'update') {
        list[dupIdx] = {
          ...list[dupIdx],
          ...row,
          tenantId,
          organisationName: row.organisationName || organisationName || list[dupIdx].organisationName,
          updatedAt: nowIso(),
        };
        summary.updated += 1;
        return;
      }
      if (duplicateMode === 'createNew') {
        // fall through to push a new record below
      }
    }
    const emailConsentParsed = parseConsent(row.emailConsent);
    const whatsappConsentParsed = parseConsent(row.whatsappConsent);
    list.push({
      id: newId('c'),
      tenantId,
      organisationName: row.organisationName || row.company || organisationName || '',
      company: row.company || row.organisationName || '',
      jobTitle: row.jobTitle || '',
      fullName: row.fullName.trim(),
      emailId: row.emailId.trim(),
      contactNumber: row.contactNumber || row.phone || '',
      countryCode: row.countryCode || '',
      phone: row.phone || row.contactNumber || '',
      country: row.country || '',
      state: row.state || '',
      city: row.city || '',
      postalCode: row.postalCode || '',
      tags: row.tags
        ? Array.isArray(row.tags)
          ? row.tags
          : String(row.tags)
              .split(/[,;|]/)
              .map((t) => t.trim())
              .filter(Boolean)
        : [],
      segments: row.segments
        ? Array.isArray(row.segments)
          ? row.segments
          : String(row.segments)
              .split(/[,;|]/)
              .map((t) => t.trim())
              .filter(Boolean)
        : [],
      source: row.source || 'CSV Import',
      status: (row.status || CONTACT_STATUSES.SUBSCRIBED).toLowerCase(),
      emailConsent: emailConsentParsed.ok ? emailConsentParsed.value : true,
      whatsappConsent: whatsappConsentParsed.ok ? whatsappConsentParsed.value : false,
      whatsappOptInStatus: (row.whatsappOptInStatus || 'pending').toLowerCase(),
      engagementScore: 0,
      notes: row.notes || '',
      unsubscribeReason: '',
      unsubscribedAt: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      lastActivityAt: nowIso(),
    });
    summary.imported += 1;
  });
  write(KEYS.contacts, list);
  return summary;
}

/* ------------------------------ exporting ----------------------------- */

const EXPORT_FIELDS = [
  ['SR. No.', (_c, i) => i + 1],
  ['Organisation', (c) => c.organisationName || ''],
  ['Full Name', (c) => c.fullName],
  ['Email ID', (c) => c.emailId],
  ['Contact Number', (c) => c.contactNumber || ''],
  ['Country', (c) => c.country || ''],
  ['State', (c) => c.state || ''],
  ['City', (c) => c.city || ''],
  ['Postal Code', (c) => c.postalCode || ''],
  ['Tags', (c) => (c.tags || []).join('|')],
  ['Segments', (c) => (c.segments || []).join('|')],
  ['Source', (c) => c.source || ''],
  ['Status', (c) => c.status || ''],
  ['Email Consent', (c) => (c.emailConsent ? 'Yes' : 'No')],
  ['WhatsApp Consent', (c) => (c.whatsappConsent ? 'Yes' : 'No')],
  ['WhatsApp Opt-In Status', (c) => c.whatsappOptInStatus || ''],
  ['Engagement Score', (c) => c.engagementScore ?? ''],
  ['Created At', (c) => c.createdAt || ''],
];

function escapeCell(value) {
  const s = String(value ?? '');
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function exportContacts(params = {}) {
  const list = getContacts(params);
  const header = EXPORT_FIELDS.map(([h]) => h);
  const body = list.map((c, i) =>
    EXPORT_FIELDS.map(([, getter]) => escapeCell(getter(c, i))).join(',')
  );
  return [header.join(','), ...body].join('\n');
}

export function downloadCsv(filename, csv) {
  if (!isBrowser()) return;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/* ------------------------------ activity ------------------------------ */

export function getContactActivity(id) {
  const contact = getContactById(id);
  if (!contact) return [];
  const generated = buildActivityForContact(contact);
  const extra = read(KEYS.activity, {})[id] || [];
  return [...extra, ...generated].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );
}

export function logActivity(id, entry) {
  const map = read(KEYS.activity, {});
  const list = map[id] || [];
  list.unshift({
    id: newId('act'),
    occurredAt: nowIso(),
    ...entry,
  });
  map[id] = list;
  write(KEYS.activity, map);
}

/* -------------------------------- tags -------------------------------- */

export function getTags() {
  return rawTags();
}

export function createTag(payload) {
  const tags = rawTags();
  const next = {
    id: newId('tag'),
    name: (payload.name || '').trim(),
    colour: payload.colour || 'indigo',
    description: payload.description || '',
    createdAt: nowIso(),
  };
  tags.push(next);
  write(KEYS.tags, tags);
  return next;
}

export function updateTag(id, payload) {
  const tags = rawTags();
  const idx = tags.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  tags[idx] = { ...tags[idx], ...payload };
  write(KEYS.tags, tags);
  return tags[idx];
}

export function deleteTag(id) {
  const tags = rawTags();
  const next = tags.filter((t) => t.id !== id);
  write(KEYS.tags, next);
  return tags.length !== next.length;
}

export function tagExists(name, excludeId = null) {
  if (!name) return false;
  const lower = name.trim().toLowerCase();
  return rawTags().some(
    (t) => t.id !== excludeId && t.name.trim().toLowerCase() === lower
  );
}

export function countContactsForTag(tagName, tenantId) {
  return rawContacts().filter(
    (c) =>
      (tenantId ? c.tenantId === tenantId : true) &&
      (c.tags || []).includes(tagName)
  ).length;
}

/* ------------------------------ segments ------------------------------ */

export function getSegments() {
  return rawSegments();
}

export function createSegment(payload) {
  const list = rawSegments();
  const next = {
    id: newId('seg'),
    name: (payload.name || '').trim(),
    description: payload.description || '',
    rules: payload.rules || [],
    combinator: payload.combinator || 'AND',
    status: payload.status || 'active',
    createdAt: nowIso(),
  };
  list.push(next);
  write(KEYS.segments, list);
  return next;
}

export function updateSegment(id, payload) {
  const list = rawSegments();
  const idx = list.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...payload };
  write(KEYS.segments, list);
  return list[idx];
}

export function deleteSegment(id) {
  const list = rawSegments();
  const next = list.filter((s) => s.id !== id);
  write(KEYS.segments, next);
  return list.length !== next.length;
}

export function evaluateSegment(segment, scope = []) {
  if (!segment || !Array.isArray(segment.rules) || segment.rules.length === 0) {
    return [];
  }
  const combinator = segment.combinator === 'OR' ? 'OR' : 'AND';
  return scope.filter((contact) => {
    const results = segment.rules.map((rule) => evaluateRule(contact, rule));
    return combinator === 'AND'
      ? results.every(Boolean)
      : results.some(Boolean);
  });
}

function evaluateRule(contact, rule) {
  if (!rule || !rule.field) return true;
  const { field, operator, value } = rule;
  const fieldValue = field === 'tag'
    ? (contact.tags || [])
    : contact[field];
  switch (operator) {
    case 'equals':
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(value);
      }
      return String(fieldValue ?? '').toLowerCase() === String(value ?? '').toLowerCase();
    case 'not_equals':
      if (Array.isArray(fieldValue)) {
        return !fieldValue.includes(value);
      }
      return String(fieldValue ?? '').toLowerCase() !== String(value ?? '').toLowerCase();
    case 'contains':
      if (Array.isArray(fieldValue)) {
        return fieldValue.some((v) =>
          String(v).toLowerCase().includes(String(value || '').toLowerCase())
        );
      }
      return String(fieldValue ?? '')
        .toLowerCase()
        .includes(String(value || '').toLowerCase());
    case 'greater_than':
      return Number(fieldValue) > Number(value);
    case 'less_than':
      return Number(fieldValue) < Number(value);
    default:
      return false;
  }
}

export function previewSegmentCount(segment, scope) {
  return evaluateSegment(segment, scope).length;
}

/* ------------------------------- KPIs --------------------------------- */

export function getContactStats(scope) {
  const list = Array.isArray(scope) ? scope : getContacts();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthStartMs = monthStart.getTime();
  let subscribed = 0;
  let unsubscribed = 0;
  let bounced = 0;
  let invalid = 0;
  let newThisMonth = 0;
  let whatsappOptedIn = 0;
  list.forEach((c) => {
    if (c.status === CONTACT_STATUSES.SUBSCRIBED) subscribed += 1;
    if (c.status === CONTACT_STATUSES.UNSUBSCRIBED) unsubscribed += 1;
    if (c.status === CONTACT_STATUSES.BOUNCED) bounced += 1;
    if (c.status === CONTACT_STATUSES.INVALID) invalid += 1;
    if (c.whatsappOptInStatus === 'opted_in') whatsappOptedIn += 1;
    if (new Date(c.createdAt).getTime() >= monthStartMs) newThisMonth += 1;
  });
  return {
    total: list.length,
    subscribed,
    unsubscribed,
    bounced,
    invalid,
    newThisMonth,
    whatsappOptedIn,
    segmentsCount: getSegments().length,
  };
}

/* --------------------------- reset (testing) -------------------------- */

export function resetContactStorage() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(KEYS.contacts);
  window.localStorage.removeItem(KEYS.tags);
  window.localStorage.removeItem(KEYS.segments);
  window.localStorage.removeItem(KEYS.activity);
  seed();
}

export const STORAGE_KEYS = KEYS;

export default {
  getContacts,
  getContactById,
  existsEmail,
  createContact,
  updateContact,
  deleteContact,
  bulkDeleteContacts,
  bulkUpdateContacts,
  addTagToContacts,
  removeTagFromContacts,
  unsubscribeContacts,
  resubscribeContact,
  parseCsv,
  validateImportRow,
  importContacts,
  exportContacts,
  downloadCsv,
  getContactActivity,
  logActivity,
  getTags,
  createTag,
  updateTag,
  deleteTag,
  tagExists,
  countContactsForTag,
  getSegments,
  createSegment,
  updateSegment,
  deleteSegment,
  evaluateSegment,
  previewSegmentCount,
  getContactStats,
  resetContactStorage,
};
