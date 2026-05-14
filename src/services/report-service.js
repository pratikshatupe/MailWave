/**
 * services/report-service.js
 *
 * Frontend-only report layer. Reports persist to mailwave_reports. Each
 * report stores its computed rows so reopening the details page is fast
 * and the export can run without a backend.
 *
 * Report status:
 *   Ready  → generated successfully, has rows
 *   Failed → generation threw (kept for transparency)
 */

import { ROLES } from '../config/roles.js';
import {
  getScopedCampaigns,
  getScopedAutomations,
  getScopedContacts,
  getScopedTemplates,
  rowsToCsv,
  pushAuditLog,
  pushNotification,
} from './analytics-service.js';

const STORAGE_KEYS = {
  reports: 'mailwave_reports',
};

export const REPORT_TYPES = [
  'Campaign Performance',
  'Automation Performance',
  'Contact Engagement',
  'Email Deliverability',
  'Bounce Report',
  'Unsubscribe Report',
  'Usage Report',
  'Tenant Summary',
];

export const REPORT_STATUS = {
  READY: 'Ready',
  FAILED: 'Failed',
};

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
    /* ignore */
  }
}

function newId() {
  return `rep-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function safePct(num, den) {
  if (!den || den <= 0) return 0;
  return +((num / den) * 100).toFixed(2);
}

/* ----------------------------- CRUD ----------------------------- */

function rawReports() {
  const list = read(STORAGE_KEYS.reports, []);
  return Array.isArray(list) ? list : [];
}

function applyReportFilters(list, params = {}, user) {
  let next = list.slice();
  if (params.tenantId) {
    next = next.filter((r) => r.tenantId === params.tenantId);
  }
  if (params.status) {
    next = next.filter((r) => r.status === params.status);
  }
  if (params.reportType) {
    next = next.filter((r) => r.reportType === params.reportType);
  }
  if (user?.role === ROLES.INDIVIDUAL) {
    const emailId = user.emailId || user.email;
    next = next.filter(
      (r) => r.createdBy === emailId || r.createdBy === user.id
    );
  }
  return next;
}

export function getReports(params = {}) {
  const user = params.user;
  let list = rawReports();
  if (user && user.role !== ROLES.SUPER_ADMIN) {
    list = list.filter((r) => !r.tenantId || r.tenantId === user.tenantId);
  }
  return applyReportFilters(list, params, user);
}

export function getReportById(id) {
  if (!id) return null;
  return rawReports().find((r) => r.id === id) || null;
}

export function deleteReport(id) {
  const list = rawReports();
  const target = list.find((r) => r.id === id);
  const next = list.filter((r) => r.id !== id);
  write(STORAGE_KEYS.reports, next);
  if (target) {
    pushAuditLog('report.delete', {
      tenantId: target.tenantId,
      actor: target.createdBy,
      entity: 'report',
      entityName: target.reportName,
    });
  }
  return next.length !== list.length;
}

/* ----------------------------- Generators ----------------------------- */

function fmtDateTime(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString();
}

export function generateCampaignPerformanceReport(user, filters = {}) {
  const campaigns = getScopedCampaigns(user, filters);
  let pool = campaigns;
  if (filters.campaignId) {
    pool = pool.filter((c) => c.id === filters.campaignId);
  }
  const rows = pool.map((c) => {
    const m = c.metrics || {};
    return {
      campaignName: c.campaignName,
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
      sentAt: fmtDateTime(c.sentAt || c.createdAt),
    };
  });
  const summary = rows.reduce(
    (acc, r) => {
      acc.sent += r.sent;
      acc.delivered += r.delivered;
      acc.opened += r.opened;
      acc.clicked += r.clicked;
      return acc;
    },
    { sent: 0, delivered: 0, opened: 0, clicked: 0 }
  );
  summary.openRate = safePct(summary.opened, summary.delivered);
  summary.clickRate = safePct(summary.clicked, summary.delivered);
  return { rows, summary };
}

export function generateAutomationPerformanceReport(user, filters = {}) {
  const automations = getScopedAutomations(user, filters);
  let pool = automations;
  if (filters.automationId) {
    pool = pool.filter((a) => a.id === filters.automationId);
  }
  const rows = pool.map((a) => {
    const m = a.metrics || {};
    return {
      automationName: a.automationName,
      status: a.status,
      trigger: a.triggerType,
      entered: m.entered || 0,
      emailsSent: m.emailsSent || 0,
      opened: m.opened || 0,
      clicked: m.clicked || 0,
      completed: m.completed || 0,
      openRate: m.openRate ?? safePct(m.opened, m.emailsSent),
      clickRate: m.clickRate ?? safePct(m.clicked, m.emailsSent),
    };
  });
  const summary = rows.reduce(
    (acc, r) => {
      acc.entered += r.entered;
      acc.emailsSent += r.emailsSent;
      acc.opened += r.opened;
      acc.clicked += r.clicked;
      acc.completed += r.completed;
      return acc;
    },
    { entered: 0, emailsSent: 0, opened: 0, clicked: 0, completed: 0 }
  );
  summary.openRate = safePct(summary.opened, summary.emailsSent);
  summary.clickRate = safePct(summary.clicked, summary.emailsSent);
  return { rows, summary };
}

export function generateContactEngagementReport(user, filters = {}) {
  let contacts = getScopedContacts(user, filters);
  if (filters.segmentId) {
    contacts = contacts.filter((c) =>
      (c.segments || []).includes(filters.segmentId)
    );
  }
  const rows = contacts.map((c) => ({
    fullName: c.fullName,
    emailId: c.emailId,
    contactNumber: c.contactNumber,
    status: c.status,
    tags: (c.tags || []).join(', '),
    source: c.source || '',
    engagementScore: c.engagementScore ?? 0,
    createdAt: fmtDateTime(c.createdAt),
    lastActivityAt: fmtDateTime(c.lastActivityAt || c.updatedAt),
  }));
  const summary = {
    contacts: rows.length,
    subscribed: rows.filter((r) => r.status === 'subscribed').length,
    unsubscribed: rows.filter((r) => r.status === 'unsubscribed').length,
    averageEngagement:
      rows.length === 0
        ? 0
        : +(rows.reduce((s, r) => s + (r.engagementScore || 0), 0) / rows.length).toFixed(1),
  };
  return { rows, summary };
}

export function generateDeliverabilityReport(user, filters = {}) {
  const campaigns = getScopedCampaigns(user, filters);
  const rows = campaigns.map((c) => {
    const m = c.metrics || {};
    return {
      campaignName: c.campaignName,
      sent: m.sent || 0,
      delivered: m.delivered || 0,
      bounced: m.bounced || 0,
      bounceRate: m.bounceRate ?? safePct(m.bounced, m.sent),
      unsubscribed: m.unsubscribed || 0,
      unsubscribeRate: safePct(m.unsubscribed, m.delivered),
    };
  });
  const summary = rows.reduce(
    (acc, r) => {
      acc.sent += r.sent;
      acc.delivered += r.delivered;
      acc.bounced += r.bounced;
      acc.unsubscribed += r.unsubscribed;
      return acc;
    },
    { sent: 0, delivered: 0, bounced: 0, unsubscribed: 0 }
  );
  summary.bounceRate = safePct(summary.bounced, summary.sent);
  summary.unsubscribeRate = safePct(summary.unsubscribed, summary.delivered);
  return { rows, summary };
}

export function generateBounceReport(user, filters = {}) {
  const campaigns = getScopedCampaigns(user, filters);
  const contacts = getScopedContacts(user, filters);
  const campRows = campaigns
    .filter((c) => (c.metrics?.bounced || 0) > 0)
    .map((c) => ({
      kind: 'Campaign',
      name: c.campaignName,
      detail: c.subjectLine || '',
      sent: c.metrics?.sent || 0,
      bounced: c.metrics?.bounced || 0,
      bounceRate: c.metrics?.bounceRate ?? safePct(c.metrics?.bounced, c.metrics?.sent),
    }));
  const contactRows = contacts
    .filter((c) => c.status === 'bounced')
    .map((c) => ({
      kind: 'Contact',
      name: c.fullName,
      detail: c.emailId,
      sent: 0,
      bounced: 1,
      bounceRate: 0,
    }));
  const rows = [...campRows, ...contactRows];
  const summary = {
    bouncedCampaigns: campRows.length,
    bouncedContacts: contactRows.length,
    totalBounced: rows.length,
  };
  return { rows, summary };
}

export function generateUnsubscribeReport(user, filters = {}) {
  const campaigns = getScopedCampaigns(user, filters);
  const contacts = getScopedContacts(user, filters);
  const campRows = campaigns
    .filter((c) => (c.metrics?.unsubscribed || 0) > 0)
    .map((c) => ({
      kind: 'Campaign',
      name: c.campaignName,
      detail: c.subjectLine || '',
      delivered: c.metrics?.delivered || 0,
      unsubscribed: c.metrics?.unsubscribed || 0,
      unsubscribeRate: safePct(c.metrics?.unsubscribed, c.metrics?.delivered),
    }));
  const contactRows = contacts
    .filter((c) => c.status === 'unsubscribed')
    .map((c) => ({
      kind: 'Contact',
      name: c.fullName,
      detail: c.emailId,
      delivered: 0,
      unsubscribed: 1,
      unsubscribeRate: 0,
    }));
  const rows = [...campRows, ...contactRows];
  const summary = {
    unsubscribedCampaigns: campRows.length,
    unsubscribedContacts: contactRows.length,
    total: rows.length,
  };
  return { rows, summary };
}

export function generateUsageReport(user, filters = {}) {
  const campaigns = getScopedCampaigns(user, filters);
  const automations = getScopedAutomations(user, filters);
  const contacts = getScopedContacts(user, filters);
  const templates = getScopedTemplates(user);
  const emailsSent =
    campaigns.reduce((s, c) => s + (c.metrics?.sent || 0), 0) +
    automations.reduce((s, a) => s + (a.metrics?.emailsSent || 0), 0);
  const rows = [
    { metric: 'Emails Sent', value: emailsSent },
    { metric: 'Campaigns Created', value: campaigns.length },
    { metric: 'Automations Active', value: automations.filter((a) => a.status === 'Active').length },
    { metric: 'Contacts Count', value: contacts.length },
    { metric: 'Templates Count', value: templates.length },
  ];
  const summary = {
    emailsSent,
    campaignsCreated: campaigns.length,
    automationsActive: automations.filter((a) => a.status === 'Active').length,
    contactsCount: contacts.length,
    templatesCount: templates.length,
  };
  return { rows, summary };
}

export function generateTenantSummaryReport(user, filters = {}) {
  if (user?.role !== ROLES.SUPER_ADMIN) {
    return { rows: [], summary: {}, error: 'Tenant Summary is only available to Super Admin.' };
  }
  const campaigns = getScopedCampaigns(user, filters);
  const automations = getScopedAutomations(user, filters);
  const contacts = getScopedContacts(user, filters);
  const groups = new Map();
  const ensure = (key) => {
    if (!groups.has(key)) {
      groups.set(key, {
        organisation: key,
        users: 0,
        contacts: 0,
        campaigns: 0,
        automations: 0,
        emailsSent: 0,
        opened: 0,
        clicked: 0,
        delivered: 0,
      });
    }
    return groups.get(key);
  };
  campaigns.forEach((c) => {
    const key = c.organisationName || c.tenantId || 'Unknown';
    const g = ensure(key);
    g.campaigns += 1;
    g.emailsSent += c.metrics?.sent || 0;
    g.opened += c.metrics?.opened || 0;
    g.clicked += c.metrics?.clicked || 0;
    g.delivered += c.metrics?.delivered || 0;
  });
  automations.forEach((a) => {
    const key = a.organisationName || a.tenantId || 'Unknown';
    const g = ensure(key);
    g.automations += 1;
    g.emailsSent += a.metrics?.emailsSent || 0;
    g.opened += a.metrics?.opened || 0;
    g.clicked += a.metrics?.clicked || 0;
  });
  contacts.forEach((c) => {
    const key = c.organisationName || c.tenantId || 'Unknown';
    const g = ensure(key);
    g.contacts += 1;
  });
  // Users count comes from local-auth records keyed by tenant.
  try {
    const users = read('mailwave_users', []);
    if (Array.isArray(users)) {
      users.forEach((u) => {
        const key = u.organisationName || u.tenantId || 'Unknown';
        const g = ensure(key);
        g.users += 1;
      });
    }
  } catch {
    /* ignore */
  }
  const rows = Array.from(groups.values()).map((g) => ({
    organisation: g.organisation,
    users: g.users,
    contacts: g.contacts,
    campaigns: g.campaigns,
    automations: g.automations,
    emailsSent: g.emailsSent,
    openRate: safePct(g.opened, g.delivered),
    clickRate: safePct(g.clicked, g.delivered),
  }));
  const summary = {
    organisations: rows.length,
    contacts: rows.reduce((s, r) => s + r.contacts, 0),
    campaigns: rows.reduce((s, r) => s + r.campaigns, 0),
    automations: rows.reduce((s, r) => s + r.automations, 0),
  };
  return { rows, summary };
}

function generateByType(type, user, filters) {
  switch (type) {
    case 'Campaign Performance':
      return generateCampaignPerformanceReport(user, filters);
    case 'Automation Performance':
      return generateAutomationPerformanceReport(user, filters);
    case 'Contact Engagement':
      return generateContactEngagementReport(user, filters);
    case 'Email Deliverability':
      return generateDeliverabilityReport(user, filters);
    case 'Bounce Report':
      return generateBounceReport(user, filters);
    case 'Unsubscribe Report':
      return generateUnsubscribeReport(user, filters);
    case 'Usage Report':
      return generateUsageReport(user, filters);
    case 'Tenant Summary':
      return generateTenantSummaryReport(user, filters);
    default:
      return { rows: [], summary: {} };
  }
}

/* ----------------------------- Create ----------------------------- */

export function createReport(payload, user) {
  const filters = {
    dateRange: payload.dateRange,
    campaignId: payload.campaignId,
    automationId: payload.automationId,
    segmentId: payload.segmentId,
    organisationName: payload.organisationName,
  };
  let result;
  let status = REPORT_STATUS.READY;
  try {
    result = generateByType(payload.reportType, user, filters);
    if (result?.error) {
      status = REPORT_STATUS.FAILED;
    }
  } catch (err) {
    result = { rows: [], summary: { error: err?.message } };
    status = REPORT_STATUS.FAILED;
  }
  const record = {
    id: newId(),
    tenantId: user?.tenantId || null,
    organisationName:
      user?.role === ROLES.SUPER_ADMIN
        ? payload.organisationName || 'Platform'
        : user?.organisationName || null,
    createdBy: user?.emailId || user?.email || 'system',
    reportName: (payload.reportName || '').trim(),
    reportType: payload.reportType,
    dateRange: payload.dateRange || { from: '', to: '' },
    campaignId: payload.campaignId || null,
    automationId: payload.automationId || null,
    segmentId: payload.segmentId || null,
    status,
    summary: result.summary || {},
    rows: result.rows || [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  const list = rawReports();
  list.unshift(record);
  write(STORAGE_KEYS.reports, list);
  pushAuditLog('report.create', {
    tenantId: record.tenantId,
    actor: record.createdBy,
    entity: 'report',
    entityName: record.reportName,
  });
  pushNotification({
    type: 'report-created',
    title: `Report ${record.reportName} created successfully.`,
    tenantId: record.tenantId,
    reportId: record.id,
  });
  return record;
}

/* ----------------------------- Export ----------------------------- */

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

function headersForReportType(reportType) {
  switch (reportType) {
    case 'Campaign Performance':
      return [
        { key: 'campaignName', label: 'Campaign Name' },
        { key: 'status', label: 'Status' },
        { key: 'recipients', label: 'Recipients' },
        { key: 'sent', label: 'Sent' },
        { key: 'delivered', label: 'Delivered' },
        { key: 'opened', label: 'Opened' },
        { key: 'clicked', label: 'Clicked' },
        { key: 'bounced', label: 'Bounced' },
        { key: 'unsubscribed', label: 'Unsubscribed' },
        { key: 'openRate', label: 'Open Rate %' },
        { key: 'clickRate', label: 'Click Rate %' },
        { key: 'sentAt', label: 'Sent At' },
      ];
    case 'Automation Performance':
      return [
        { key: 'automationName', label: 'Automation Name' },
        { key: 'status', label: 'Status' },
        { key: 'trigger', label: 'Trigger' },
        { key: 'entered', label: 'Entered' },
        { key: 'emailsSent', label: 'Emails Sent' },
        { key: 'opened', label: 'Opened' },
        { key: 'clicked', label: 'Clicked' },
        { key: 'completed', label: 'Completed' },
        { key: 'openRate', label: 'Open Rate %' },
        { key: 'clickRate', label: 'Click Rate %' },
      ];
    case 'Contact Engagement':
      return [
        { key: 'fullName', label: 'Full Name' },
        { key: 'emailId', label: 'Email ID' },
        { key: 'contactNumber', label: 'Contact Number' },
        { key: 'status', label: 'Status' },
        { key: 'tags', label: 'Tags' },
        { key: 'source', label: 'Source' },
        { key: 'engagementScore', label: 'Engagement Score' },
        { key: 'createdAt', label: 'Created At' },
        { key: 'lastActivityAt', label: 'Last Activity' },
      ];
    case 'Email Deliverability':
      return [
        { key: 'campaignName', label: 'Campaign Name' },
        { key: 'sent', label: 'Sent' },
        { key: 'delivered', label: 'Delivered' },
        { key: 'bounced', label: 'Bounced' },
        { key: 'bounceRate', label: 'Bounce Rate %' },
        { key: 'unsubscribed', label: 'Unsubscribed' },
        { key: 'unsubscribeRate', label: 'Unsubscribe Rate %' },
      ];
    case 'Bounce Report':
      return [
        { key: 'kind', label: 'Kind' },
        { key: 'name', label: 'Name' },
        { key: 'detail', label: 'Detail' },
        { key: 'sent', label: 'Sent' },
        { key: 'bounced', label: 'Bounced' },
        { key: 'bounceRate', label: 'Bounce Rate %' },
      ];
    case 'Unsubscribe Report':
      return [
        { key: 'kind', label: 'Kind' },
        { key: 'name', label: 'Name' },
        { key: 'detail', label: 'Detail' },
        { key: 'delivered', label: 'Delivered' },
        { key: 'unsubscribed', label: 'Unsubscribed' },
        { key: 'unsubscribeRate', label: 'Unsubscribe Rate %' },
      ];
    case 'Usage Report':
      return [
        { key: 'metric', label: 'Metric' },
        { key: 'value', label: 'Value' },
      ];
    case 'Tenant Summary':
      return [
        { key: 'organisation', label: 'Organisation' },
        { key: 'users', label: 'Users' },
        { key: 'contacts', label: 'Contacts' },
        { key: 'campaigns', label: 'Campaigns' },
        { key: 'automations', label: 'Automations' },
        { key: 'emailsSent', label: 'Emails Sent' },
        { key: 'openRate', label: 'Open Rate %' },
        { key: 'clickRate', label: 'Click Rate %' },
      ];
    default:
      return [];
  }
}

export function getReportHeaders(reportType) {
  return headersForReportType(reportType);
}

export function exportReportCsv(id) {
  const report = getReportById(id);
  if (!report) return { ok: false, error: 'Report not found.' };
  const headers = headersForReportType(report.reportType);
  const csv = rowsToCsv(headers, report.rows || []);
  const today = new Date().toISOString().slice(0, 10);
  const slug = (report.reportType || 'report').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  downloadCsv(`mailwave-report-${slug}-${today}.csv`, csv);
  pushAuditLog('report.export', {
    tenantId: report.tenantId,
    actor: report.createdBy,
    entity: 'report',
    entityName: report.reportName,
  });
  pushNotification({
    type: 'report-exported',
    title: `Report ${report.reportName} exported successfully.`,
    tenantId: report.tenantId,
    reportId: report.id,
  });
  return { ok: true, count: (report.rows || []).length };
}

/**
 * PDF export. No PDF library is bundled, so this returns a not-available
 * signal the UI can show as a placeholder.
 */
export function exportReportPdf(id) {
  const report = getReportById(id);
  if (!report) return { ok: false, error: 'Report not found.' };
  return {
    ok: false,
    available: false,
    error: 'PDF export is not available in local mode.',
  };
}

export default {
  REPORT_TYPES,
  REPORT_STATUS,
  getReports,
  getReportById,
  createReport,
  deleteReport,
  exportReportCsv,
  exportReportPdf,
  getReportHeaders,
  generateCampaignPerformanceReport,
  generateAutomationPerformanceReport,
  generateContactEngagementReport,
  generateDeliverabilityReport,
  generateBounceReport,
  generateUnsubscribeReport,
  generateUsageReport,
  generateTenantSummaryReport,
};
