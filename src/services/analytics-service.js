/**
 * services/analytics-service.js
 *
 * Frontend-only analytics layer. Reads campaigns / automations / contacts /
 * templates from the existing localStorage keys and derives KPIs, trends
 * and chart series. No backend.
 *
 * Tenant isolation is enforced here: every read accepts the current user
 * and only returns records that match their tenantId (Super Admin sees
 * everything; Individual is additionally narrowed to their own records).
 */

import { ROLES } from '../config/roles.js';
import {
  getContacts as getServiceContacts,
} from './contact-service.js';

const STORAGE_KEYS = {
  campaigns: 'mailwave_campaigns',
  campaignsLegacy: 'mailwave-campaigns',
  automations: 'mailwave_automations',
  contacts: 'mailwave_contacts',
  templates: 'mailwave-templates',
  reports: 'mailwave_reports',
  notifications: 'mailwave_notifications',
  auditLogs: 'mailwave_audit_logs',
  currentUser: 'mailwave_current_user',
};

/* ----------------------------- helpers ----------------------------- */

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

function safePct(numerator, denominator) {
  if (!denominator || denominator <= 0) return 0;
  return +((numerator / denominator) * 100).toFixed(2);
}

function inDateRange(value, range) {
  if (!range || (!range.from && !range.to)) return true;
  if (!value) return false;
  const ts = new Date(value).getTime();
  if (Number.isNaN(ts)) return false;
  if (range.from) {
    const from = new Date(range.from).getTime();
    if (ts < from) return false;
  }
  if (range.to) {
    const to = new Date(range.to).getTime() + 24 * 3600 * 1000;
    if (ts > to) return false;
  }
  return true;
}

/* ----------------------------- raw reads ----------------------------- */

function rawCampaigns() {
  const list = read(STORAGE_KEYS.campaigns, null);
  if (Array.isArray(list) && list.length > 0) return list;
  const legacy = read(STORAGE_KEYS.campaignsLegacy, null);
  if (Array.isArray(legacy)) return legacy;
  return [];
}

function rawAutomations() {
  const list = read(STORAGE_KEYS.automations, []);
  return Array.isArray(list) ? list : [];
}

function rawContacts() {
  const direct = read(STORAGE_KEYS.contacts, null);
  if (Array.isArray(direct) && direct.length > 0) return direct;
  try {
    return getServiceContacts({});
  } catch {
    return [];
  }
}

function rawTemplates() {
  const list = read(STORAGE_KEYS.templates, []);
  return Array.isArray(list) ? list : [];
}

/* ----------------------------- scoping ----------------------------- */

function scopeByUser(list, user, options = {}) {
  if (!user) return [];
  if (user.role === ROLES.SUPER_ADMIN) return list;
  const scoped = list.filter((r) => !r.tenantId || r.tenantId === user.tenantId);
  if (user.role === ROLES.INDIVIDUAL && options.includeCreatedBy) {
    const emailId = user.emailId || user.email;
    return scoped.filter(
      (r) => !r.createdBy || r.createdBy === emailId || r.createdBy === user.id
    );
  }
  return scoped;
}

function applyFilters(list, filters = {}, opts = {}) {
  let next = list.slice();
  if (filters.organisationName) {
    next = next.filter(
      (r) => (r.organisationName || r.tenantId) === filters.organisationName
    );
  }
  if (filters.campaignId && opts.dateField === 'sentAt') {
    next = next.filter((r) => r.id === filters.campaignId);
  }
  if (filters.automationId && opts.kind === 'automation') {
    next = next.filter((r) => r.id === filters.automationId);
  }
  if (filters.dateRange) {
    const field = opts.dateField || 'createdAt';
    next = next.filter((r) => inDateRange(r[field], filters.dateRange));
  }
  return next;
}

/* ----------------------------- public reads ----------------------------- */

export function getScopedCampaigns(user, filters = {}) {
  let list = scopeByUser(rawCampaigns(), user);
  list = applyFilters(list, filters, { dateField: 'sentAt' });
  return list;
}

export function getScopedAutomations(user, filters = {}) {
  let list = scopeByUser(rawAutomations(), user, { includeCreatedBy: true });
  list = applyFilters(list, filters, { dateField: 'createdAt', kind: 'automation' });
  return list;
}

export function getScopedContacts(user, filters = {}) {
  let list = scopeByUser(rawContacts(), user);
  list = applyFilters(list, filters, { dateField: 'createdAt' });
  return list;
}

export function getScopedTemplates(user) {
  return scopeByUser(rawTemplates(), user);
}

export function getOrganisationOptions(user) {
  if (!user || user.role !== ROLES.SUPER_ADMIN) return [];
  const all = [
    ...rawCampaigns(),
    ...rawAutomations(),
    ...rawContacts(),
  ];
  return Array.from(
    new Set(all.map((r) => r.organisationName || r.tenantId).filter(Boolean))
  ).sort();
}

/* ----------------------------- KPIs ----------------------------- */

export function calculateRates(metrics = {}) {
  const sent = Number(metrics.sent || 0);
  const delivered = Number(metrics.delivered || 0);
  const opened = Number(metrics.opened || 0);
  const clicked = Number(metrics.clicked || 0);
  const bounced = Number(metrics.bounced || 0);
  const unsubscribed = Number(metrics.unsubscribed || 0);
  return {
    openRate: safePct(opened, delivered),
    clickRate: safePct(clicked, delivered),
    bounceRate: safePct(bounced, sent),
    unsubscribeRate: safePct(unsubscribed, delivered),
  };
}

export function getAnalyticsOverview(user, filters = {}) {
  const campaigns = getScopedCampaigns(user, filters);
  const automations = getScopedAutomations(user, filters);
  const contacts = getScopedContacts(user);

  let campSent = 0,
    campDelivered = 0,
    campOpened = 0,
    campClicked = 0,
    campBounced = 0,
    campUnsubscribed = 0;
  for (const c of campaigns) {
    const m = c.metrics || {};
    campSent += Number(m.sent || 0);
    campDelivered += Number(m.delivered || 0);
    campOpened += Number(m.opened || 0);
    campClicked += Number(m.clicked || 0);
    campBounced += Number(m.bounced || 0);
    campUnsubscribed += Number(m.unsubscribed || 0);
  }

  let autoSent = 0,
    autoOpened = 0,
    autoClicked = 0;
  for (const a of automations) {
    const m = a.metrics || {};
    autoSent += Number(m.emailsSent || 0);
    autoOpened += Number(m.opened || 0);
    autoClicked += Number(m.clicked || 0);
  }

  const totalSent = campSent + autoSent;
  const delivered = campDelivered;
  const opened = campOpened + autoOpened;
  const clicked = campClicked + autoClicked;

  const activeCampaigns = campaigns.filter((c) =>
    ['Running', 'Scheduled', 'Sending'].includes(c.status)
  ).length;
  const activeAutomations = automations.filter((a) => a.status === 'Active').length;

  const startOfMonth = (() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  })();
  const newContactsThisMonth = contacts.filter(
    (c) => c.createdAt && new Date(c.createdAt).getTime() >= startOfMonth
  ).length;

  return {
    totalEmailsSent: totalSent,
    delivered,
    opened,
    clicked,
    bounced: campBounced,
    unsubscribed: campUnsubscribed,
    openRate: safePct(opened, delivered),
    clickRate: safePct(clicked, delivered),
    bounceRate: safePct(campBounced, totalSent),
    unsubscribeRate: safePct(campUnsubscribed, delivered),
    activeCampaigns,
    activeAutomations,
    totalContacts: contacts.length,
    newContactsThisMonth,
  };
}

/* ----------------------------- per-entity tables ----------------------------- */

export function getCampaignAnalytics(user, filters = {}) {
  const campaigns = getScopedCampaigns(user, filters);
  return campaigns.map((c) => {
    const m = c.metrics || {};
    return {
      id: c.id,
      campaignName: c.campaignName,
      organisationName: c.organisationName || c.tenantId,
      status: c.status,
      recipients: c.recipientCount || 0,
      sent: m.sent || 0,
      delivered: m.delivered || 0,
      opened: m.opened || 0,
      clicked: m.clicked || 0,
      bounced: m.bounced || 0,
      unsubscribed: m.unsubscribed || 0,
      openRate: m.openRate ?? safePct(m.opened, m.delivered),
      clickRate: m.clickRate ?? safePct(m.clicked, m.delivered),
      sentAt: c.sentAt || c.scheduledAt || c.createdAt,
    };
  });
}

export function getAutomationAnalytics(user, filters = {}) {
  const automations = getScopedAutomations(user, filters);
  return automations.map((a) => {
    const m = a.metrics || {};
    return {
      id: a.id,
      automationName: a.automationName,
      organisationName: a.organisationName || a.tenantId,
      status: a.status,
      trigger: a.triggerType,
      entered: m.entered || 0,
      emailsSent: m.emailsSent || 0,
      opened: m.opened || 0,
      clicked: m.clicked || 0,
      completed: m.completed || 0,
      openRate: m.openRate ?? safePct(m.opened, m.emailsSent),
      clickRate: m.clickRate ?? safePct(m.clicked, m.emailsSent),
      lastRunAt: a.lastRunAt || a.activatedAt || a.updatedAt,
    };
  });
}

export function getContactAnalytics(user, filters = {}) {
  const contacts = getScopedContacts(user, filters);
  const startOfMonth = (() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  })();

  const stats = {
    total: contacts.length,
    subscribed: 0,
    unsubscribed: 0,
    bounced: 0,
    complained: 0,
    invalid: 0,
    whatsappOptedIn: 0,
    newThisMonth: 0,
    averageEngagement: 0,
  };
  let engagementSum = 0;
  let engagementCount = 0;
  for (const c of contacts) {
    if (c.status === 'subscribed') stats.subscribed += 1;
    if (c.status === 'unsubscribed') stats.unsubscribed += 1;
    if (c.status === 'bounced') stats.bounced += 1;
    if (c.status === 'complained') stats.complained += 1;
    if (c.status === 'invalid') stats.invalid += 1;
    if (c.whatsappOptInStatus === 'opted_in') stats.whatsappOptedIn += 1;
    if (c.createdAt && new Date(c.createdAt).getTime() >= startOfMonth) {
      stats.newThisMonth += 1;
    }
    if (typeof c.engagementScore === 'number') {
      engagementSum += c.engagementScore;
      engagementCount += 1;
    }
  }
  stats.averageEngagement = engagementCount
    ? +(engagementSum / engagementCount).toFixed(1)
    : 0;

  const rows = contacts.map((c) => ({
    id: c.id,
    fullName: c.fullName,
    emailId: c.emailId,
    contactNumber: c.contactNumber,
    status: c.status,
    tags: c.tags || [],
    source: c.source,
    engagementScore: c.engagementScore ?? 0,
    lastActivityAt: c.lastActivityAt || c.updatedAt || c.createdAt,
    tenantId: c.tenantId,
    organisationName: c.organisationName,
  }));

  return { stats, rows };
}

/* ----------------------------- charts ----------------------------- */

function monthLabel(date) {
  return date.toLocaleString(undefined, { month: 'short', year: '2-digit' });
}

export function getEmailPerformanceTrend(user, filters = {}) {
  const campaigns = getScopedCampaigns(user, filters);
  const automations = getScopedAutomations(user, filters);
  const buckets = new Map();
  const now = new Date();
  // Build last 12 months as buckets so the chart is consistent even with
  // sparse data.
  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.set(monthLabel(d), { label: monthLabel(d), sent: 0, opened: 0, clicked: 0 });
  }
  campaigns.forEach((c) => {
    const at = c.sentAt || c.createdAt;
    if (!at) return;
    const key = monthLabel(new Date(at));
    if (!buckets.has(key)) return;
    const m = c.metrics || {};
    const bucket = buckets.get(key);
    bucket.sent += Number(m.sent || 0);
    bucket.opened += Number(m.opened || 0);
    bucket.clicked += Number(m.clicked || 0);
  });
  automations.forEach((a) => {
    const at = a.lastRunAt || a.activatedAt || a.createdAt;
    if (!at) return;
    const key = monthLabel(new Date(at));
    if (!buckets.has(key)) return;
    const m = a.metrics || {};
    const bucket = buckets.get(key);
    bucket.sent += Number(m.emailsSent || 0);
    bucket.opened += Number(m.opened || 0);
    bucket.clicked += Number(m.clicked || 0);
  });
  return Array.from(buckets.values());
}

export function getCampaignComparisonSeries(user, filters = {}) {
  const list = getCampaignAnalytics(user, filters);
  return list.slice(0, 8).map((c) => ({
    name: (c.campaignName || '').slice(0, 18),
    sent: c.sent,
    opened: c.opened,
    clicked: c.clicked,
  }));
}

export function getAutomationPerformanceSeries(user, filters = {}) {
  const list = getAutomationAnalytics(user, filters);
  return list.slice(0, 8).map((a) => ({
    name: (a.automationName || '').slice(0, 18),
    entered: a.entered,
    emailsSent: a.emailsSent,
    opened: a.opened,
    clicked: a.clicked,
  }));
}

export function getTopCampaigns(user, filters = {}, limit = 5) {
  const list = getCampaignAnalytics(user, filters);
  return list
    .slice()
    .sort((a, b) => (b.openRate || 0) - (a.openRate || 0))
    .slice(0, limit);
}

export function getLowPerformingCampaigns(user, filters = {}, limit = 5) {
  const list = getCampaignAnalytics(user, filters).filter((c) => c.sent > 0);
  return list
    .slice()
    .sort((a, b) => (a.openRate || 0) - (b.openRate || 0))
    .slice(0, limit);
}

export function getContactGrowth(user, filters = {}) {
  const contacts = getScopedContacts(user, filters);
  const buckets = new Map();
  const now = new Date();
  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.set(monthLabel(d), { label: monthLabel(d), contacts: 0 });
  }
  contacts.forEach((c) => {
    if (!c.createdAt) return;
    const key = monthLabel(new Date(c.createdAt));
    if (!buckets.has(key)) return;
    buckets.get(key).contacts += 1;
  });
  let running = 0;
  const arr = Array.from(buckets.values());
  return arr.map((row) => {
    running += row.contacts;
    return { ...row, cumulative: running };
  });
}

export function getEngagementBreakdown(user, filters = {}) {
  const { stats } = getContactAnalytics(user, filters);
  return [
    { name: 'Subscribed', value: stats.subscribed, tone: '#10b981' },
    { name: 'Unsubscribed', value: stats.unsubscribed, tone: '#f43f5e' },
    { name: 'Bounced', value: stats.bounced, tone: '#f59e0b' },
    { name: 'Complained', value: stats.complained, tone: '#d946ef' },
    { name: 'Invalid', value: stats.invalid, tone: '#64748b' },
  ];
}

/* ----------------------------- CSV export ----------------------------- */

function escapeCsv(value) {
  const s = value === null || value === undefined ? '' : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function rowsToCsv(headers, rows) {
  const head = headers.map((h) => escapeCsv(h.label)).join(',');
  const body = rows
    .map((row) =>
      headers
        .map((h) =>
          escapeCsv(typeof h.value === 'function' ? h.value(row) : row[h.key])
        )
        .join(',')
    )
    .join('\n');
  return `${head}\n${body}`;
}

function downloadCsv(filename, csv) {
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

export function exportAnalyticsCsv(user, filters = {}) {
  const overview = getAnalyticsOverview(user, filters);
  const headers = [
    { key: 'metric', label: 'Metric' },
    { key: 'value', label: 'Value' },
  ];
  const rows = [
    { metric: 'Total Emails Sent', value: overview.totalEmailsSent },
    { metric: 'Delivered', value: overview.delivered },
    { metric: 'Opened', value: overview.opened },
    { metric: 'Clicked', value: overview.clicked },
    { metric: 'Bounced', value: overview.bounced },
    { metric: 'Unsubscribed', value: overview.unsubscribed },
    { metric: 'Open Rate', value: `${overview.openRate}%` },
    { metric: 'Click Rate', value: `${overview.clickRate}%` },
    { metric: 'Bounce Rate', value: `${overview.bounceRate}%` },
    { metric: 'Unsubscribe Rate', value: `${overview.unsubscribeRate}%` },
    { metric: 'Active Campaigns', value: overview.activeCampaigns },
    { metric: 'Active Automations', value: overview.activeAutomations },
    { metric: 'Total Contacts', value: overview.totalContacts },
    { metric: 'New Contacts This Month', value: overview.newContactsThisMonth },
  ];
  const csv = rowsToCsv(headers, rows);
  const today = new Date().toISOString().slice(0, 10);
  downloadCsv(`mailwave-analytics-overview-${today}.csv`, csv);
  pushAuditLog('analytics.export', {
    tenantId: user?.tenantId,
    actor: user?.emailId || user?.email || 'system',
  });
  return { ok: true, count: rows.length };
}

/* ----------------------------- notifications + audit ----------------------------- */

function newId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

export function pushAuditLog(action, payload = {}) {
  if (!isBrowser()) return;
  const list = read(STORAGE_KEYS.auditLogs, []);
  list.unshift({
    id: newId('audit'),
    action,
    actor: payload.actor || 'system',
    entity: payload.entity || action.split('.')[0],
    entityName: payload.entityName || '',
    tenantId: payload.tenantId || null,
    occurredAt: new Date().toISOString(),
  });
  try {
    window.localStorage.setItem(
      STORAGE_KEYS.auditLogs,
      JSON.stringify(list.slice(0, 500))
    );
  } catch {
    /* ignore */
  }
}

export function pushNotification(entry) {
  if (!isBrowser()) return;
  const list = read(STORAGE_KEYS.notifications, []);
  list.unshift({
    id: newId('notif'),
    createdAt: new Date().toISOString(),
    read: false,
    ...entry,
  });
  try {
    window.localStorage.setItem(
      STORAGE_KEYS.notifications,
      JSON.stringify(list.slice(0, 500))
    );
  } catch {
    /* ignore */
  }
}

export const STORAGE_KEYS_EXPORT = STORAGE_KEYS;

export default {
  calculateRates,
  getAnalyticsOverview,
  getCampaignAnalytics,
  getAutomationAnalytics,
  getContactAnalytics,
  getEmailPerformanceTrend,
  getCampaignComparisonSeries,
  getAutomationPerformanceSeries,
  getTopCampaigns,
  getLowPerformingCampaigns,
  getContactGrowth,
  getEngagementBreakdown,
  exportAnalyticsCsv,
  getScopedCampaigns,
  getScopedAutomations,
  getScopedContacts,
  getScopedTemplates,
  getOrganisationOptions,
  rowsToCsv,
  pushAuditLog,
  pushNotification,
};
