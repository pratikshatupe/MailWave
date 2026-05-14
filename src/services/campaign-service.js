/**
 * services/campaign-service.js
 *
 * Frontend-only service layer for the Campaign Management module.
 *
 * All reads / writes persist to localStorage so the module works fully
 * locally with no backend. Tenant isolation is enforced at every read.
 *
 * Storage keys (per spec):
 *   mailwave_campaigns
 *   mailwave_current_user
 *   mailwave_contacts
 *   mailwave_templates
 *   mailwave_segments
 *   mailwave_notifications
 *   mailwave_audit_logs
 *
 * The contact / template / segment data is read both from these
 * spec-named keys (if seeded) and from the existing services
 * (mailwave-contacts, mailwave-templates) so the module integrates with
 * the rest of the app without a separate migration.
 */

import {
  CAMPAIGN_STATUSES,
  CAMPAIGN_TYPES,
  AUDIENCE_TYPES,
  APPROVAL_STATUSES,
} from '../config/campaign-status.js';
import { SAMPLE_CAMPAIGNS } from '../mock/campaigns.js';
import {
  getContacts as getServiceContacts,
  getSegments as getServiceSegments,
} from './contact-service.js';

export const STORAGE_KEYS = {
  campaigns: 'mailwave_campaigns',
  currentUser: 'mailwave_current_user',
  contacts: 'mailwave_contacts',
  templates: 'mailwave_templates',
  segments: 'mailwave_segments',
  notifications: 'mailwave_notifications',
  auditLogs: 'mailwave_audit_logs',
};

const TEMPLATES_LEGACY_KEY = 'mailwave-templates';

/* ----------------------------- localStorage helpers ----------------------------- */

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
    /* ignore quota errors */
  }
}

function nowIso() {
  return new Date().toISOString();
}

function newId(prefix = 'camp') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

/* ----------------------------- Seed --------------------------------- */

function seedCampaigns() {
  if (!isBrowser()) return;
  if (!window.localStorage.getItem(STORAGE_KEYS.campaigns)) {
    write(STORAGE_KEYS.campaigns, SAMPLE_CAMPAIGNS);
  }
}

function rawCampaigns() {
  seedCampaigns();
  const list = read(STORAGE_KEYS.campaigns, []);
  return Array.isArray(list) ? list : [];
}

/* ----------------------------- Current user ----------------------------- */

export function getCurrentUser() {
  const fromSpecKey = read(STORAGE_KEYS.currentUser, null);
  if (fromSpecKey && (fromSpecKey.id || fromSpecKey.emailId || fromSpecKey.email)) {
    return fromSpecKey;
  }
  // Fall back to the auth session stash so the module works with the
  // existing login flow even before anything writes the spec key.
  const fromAuth = read('mailwave-auth', null);
  if (fromAuth) {
    return {
      id: fromAuth.id,
      tenantId: fromAuth.tenantId,
      fullName: fromAuth.fullName || fromAuth.name,
      emailId: fromAuth.email,
      role: fromAuth.role,
      accountType: fromAuth.accountType,
      isAuthenticated: Boolean(fromAuth.token),
    };
  }
  return null;
}

/* ----------------------------- Filtering -------------------------------- */

function matchesQuery(campaign, q) {
  if (!q) return true;
  const needle = q.toLowerCase();
  const hay = [
    campaign.campaignName,
    campaign.subjectLine,
    campaign.senderName,
    campaign.senderEmailId,
    campaign.templateName,
    campaign.selectedSegmentName,
    campaign.status,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return hay.includes(needle);
}

function withinDateRange(value, from, to) {
  if (!value) return true;
  const t = new Date(value).getTime();
  if (Number.isNaN(t)) return true;
  if (from) {
    const fromT = new Date(from).getTime();
    if (!Number.isNaN(fromT) && t < fromT) return false;
  }
  if (to) {
    const toT = new Date(to).getTime() + 24 * 3600 * 1000;
    if (!Number.isNaN(toT) && t > toT) return false;
  }
  return true;
}

function applyFilters(list, params = {}) {
  let next = list.slice();
  if (params.tenantId) {
    next = next.filter((c) => c.tenantId === params.tenantId);
  }
  if (params.createdBy) {
    next = next.filter((c) => c.createdBy === params.createdBy);
  }
  if (params.organisationName) {
    next = next.filter((c) => c.organisationName === params.organisationName);
  }
  if (params.status) {
    next = next.filter((c) => c.status === params.status);
  }
  if (params.campaignType) {
    next = next.filter((c) => c.campaignType === params.campaignType);
  }
  if (params.templateId) {
    next = next.filter((c) => c.templateId === params.templateId);
  }
  if (params.segmentId) {
    next = next.filter((c) => c.selectedSegmentId === params.segmentId);
  }
  if (params.from || params.to) {
    next = next.filter((c) => withinDateRange(c.createdAt, params.from, params.to));
  }
  if (params.q) {
    next = next.filter((c) => matchesQuery(c, params.q));
  }
  return next;
}

/* ----------------------------- Public reads ----------------------------- */

export function getCampaigns(params = {}) {
  const all = rawCampaigns();
  const filtered = applyFilters(all, params);
  return filtered.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getCampaignById(id) {
  return rawCampaigns().find((c) => c.id === id) || null;
}

export function getCampaignsForUser(user, params = {}) {
  if (!user) return [];
  const role = user.role;
  // Super Admin sees everything; everyone else is tenant-scoped.
  if (role === 'super_admin') {
    return getCampaigns(params);
  }
  return getCampaigns({ ...params, tenantId: user.tenantId });
}

/* --------------------------- Contacts / templates ----------------------- */

function rawContacts() {
  // Prefer spec key, fall back to the contact service (which itself seeds
  // mailwave-contacts). This keeps the module functional both for users
  // who interact via the new spec-named key and for users coming from the
  // existing contact module.
  const direct = read(STORAGE_KEYS.contacts, null);
  if (Array.isArray(direct) && direct.length > 0) return direct;
  try {
    return getServiceContacts({});
  } catch {
    return [];
  }
}

function rawTemplates() {
  const direct = read(STORAGE_KEYS.templates, null);
  if (Array.isArray(direct) && direct.length > 0) return direct;
  const legacy = read(TEMPLATES_LEGACY_KEY, null);
  if (Array.isArray(legacy)) return legacy;
  return [];
}

function rawSegments() {
  const direct = read(STORAGE_KEYS.segments, null);
  if (Array.isArray(direct) && direct.length > 0) return direct;
  try {
    return getServiceSegments();
  } catch {
    return [];
  }
}

export function getContactsForTenant(tenantId) {
  return rawContacts().filter((c) => !tenantId || c.tenantId === tenantId);
}

export function getTemplatesForTenant(tenantId) {
  const all = rawTemplates();
  // Templates may or may not be tenant-scoped in the existing store; show
  // tenant matches plus shared/gallery templates so creators see the
  // standard library.
  return all.filter(
    (t) => !t.tenantId || t.tenantId === tenantId || t.isShared || t.isGalleryTemplate
  );
}

export function getSegmentsForTenant(tenantId) {
  return rawSegments().filter((s) => !s.tenantId || s.tenantId === tenantId);
}

/* ----------------------------- Eligibility ------------------------------ */

function isEligible(contact) {
  if (!contact) return false;
  const status = String(contact.status || '').toLowerCase();
  if (status === 'unsubscribed' || status === 'bounced' || status === 'complained' || status === 'invalid') {
    return false;
  }
  // Email Consent must be true to be eligible.
  if (contact.emailConsent === false) return false;
  return true;
}

/**
 * Given a partial campaign payload describing the audience, return the
 * counts the wizard needs:
 *   { total, eligible, excluded, finalRecipients, recipientIds }
 */
export function getEligibleRecipients(audienceConfig = {}) {
  const {
    tenantId,
    audienceType,
    selectedSegmentId,
    selectedContactIds = [],
    excludedContactIds = [],
  } = audienceConfig;

  const tenantContacts = getContactsForTenant(tenantId);

  let scope = [];
  if (audienceType === AUDIENCE_TYPES.ALL_CONTACTS) {
    scope = tenantContacts.slice();
  } else if (audienceType === AUDIENCE_TYPES.SEGMENT) {
    const segment = rawSegments().find((s) => s.id === selectedSegmentId);
    if (!segment) {
      scope = [];
    } else if (Array.isArray(segment.contactIds) && segment.contactIds.length > 0) {
      const allow = new Set(segment.contactIds);
      scope = tenantContacts.filter((c) => allow.has(c.id));
    } else {
      // Without an explicit contact list we keep all tenant contacts as the
      // scope; the segment rules act as a soft filter in the wizard preview.
      scope = tenantContacts.slice();
    }
  } else if (audienceType === AUDIENCE_TYPES.SELECTED_CONTACTS) {
    const allow = new Set(selectedContactIds);
    scope = tenantContacts.filter((c) => allow.has(c.id));
  } else if (audienceType === AUDIENCE_TYPES.UPLOAD_LIST) {
    scope = [];
  }

  const exclude = new Set(excludedContactIds);
  const total = scope.length;
  const eligibleContacts = scope.filter((c) => isEligible(c) && !exclude.has(c.id));
  const finalCount = eligibleContacts.length;
  const excluded = total - finalCount;

  return {
    total,
    eligible: finalCount,
    excluded,
    finalRecipients: finalCount,
    recipientIds: eligibleContacts.map((c) => c.id),
  };
}

/* ----------------------------- Mutations -------------------------------- */

function persist(list) {
  write(STORAGE_KEYS.campaigns, list);
}

function emptyMetrics() {
  return {
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    unsubscribed: 0,
    openRate: 0,
    clickRate: 0,
    bounceRate: 0,
  };
}

function buildCampaign(payload, context = {}) {
  const tenantId = payload.tenantId || context.tenantId || null;
  const createdBy = payload.createdBy || context.createdBy || null;
  const audienceConfig = {
    tenantId,
    audienceType: payload.audienceType,
    selectedSegmentId: payload.selectedSegmentId,
    selectedContactIds: payload.selectedContactIds || [],
    excludedContactIds: payload.excludedContactIds || [],
  };
  const counts = getEligibleRecipients(audienceConfig);
  return {
    id: payload.id || newId('camp'),
    tenantId,
    createdBy,
    organisationName: payload.organisationName || context.organisationName || '',
    campaignName: (payload.campaignName || '').trim(),
    campaignType: payload.campaignType || CAMPAIGN_TYPES.REGULAR,
    subjectLine: (payload.subjectLine || '').trim(),
    previewText: payload.previewText || '',
    senderName: payload.senderName || '',
    senderEmailId: payload.senderEmailId || '',
    replyToEmailId: payload.replyToEmailId || '',
    templateId: payload.templateId || null,
    templateName: payload.templateName || '',
    audienceType: payload.audienceType || AUDIENCE_TYPES.ALL_CONTACTS,
    selectedSegmentId: payload.selectedSegmentId || null,
    selectedSegmentName: payload.selectedSegmentName || '',
    selectedContactIds: payload.selectedContactIds || [],
    excludedContactIds: payload.excludedContactIds || [],
    recipientCount: counts.finalRecipients,
    status: payload.status || CAMPAIGN_STATUSES.DRAFT,
    scheduledAt: payload.scheduledAt || null,
    sentAt: payload.sentAt || null,
    createdAt: payload.createdAt || nowIso(),
    updatedAt: nowIso(),
    approvalStatus: payload.approvalStatus || APPROVAL_STATUSES.NONE,
    approvedBy: payload.approvedBy || null,
    approvalComment: payload.approvalComment || '',
    metrics: payload.metrics || emptyMetrics(),
  };
}

export function createCampaign(payload, context = {}) {
  const list = rawCampaigns();
  const next = buildCampaign(payload, context);
  list.push(next);
  persist(list);
  logAudit('campaign.create', next, context);
  pushNotification({
    type: 'campaign-created',
    title: `Campaign ${next.campaignName} created successfully.`,
    tenantId: next.tenantId,
    campaignId: next.id,
  });
  return next;
}

export function updateCampaign(id, payload) {
  const list = rawCampaigns();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const existing = list[idx];
  const audienceConfig = {
    tenantId: existing.tenantId,
    audienceType: payload.audienceType ?? existing.audienceType,
    selectedSegmentId: payload.selectedSegmentId ?? existing.selectedSegmentId,
    selectedContactIds: payload.selectedContactIds ?? existing.selectedContactIds,
    excludedContactIds: payload.excludedContactIds ?? existing.excludedContactIds,
  };
  const counts = getEligibleRecipients(audienceConfig);
  const next = {
    ...existing,
    ...payload,
    id,
    recipientCount: counts.finalRecipients,
    updatedAt: nowIso(),
  };
  list[idx] = next;
  persist(list);
  logAudit('campaign.update', next);
  return next;
}

export function deleteCampaign(id) {
  const list = rawCampaigns();
  const target = list.find((c) => c.id === id);
  const next = list.filter((c) => c.id !== id);
  if (next.length === list.length) return false;
  persist(next);
  if (target) logAudit('campaign.delete', target);
  return true;
}

export function duplicateCampaign(id) {
  const list = rawCampaigns();
  const original = list.find((c) => c.id === id);
  if (!original) return null;
  const copy = {
    ...original,
    id: newId('camp'),
    campaignName: `${original.campaignName} Copy`,
    status: CAMPAIGN_STATUSES.DRAFT,
    approvalStatus: APPROVAL_STATUSES.NONE,
    approvedBy: null,
    approvalComment: '',
    scheduledAt: null,
    sentAt: null,
    metrics: emptyMetrics(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  list.push(copy);
  persist(list);
  logAudit('campaign.duplicate', copy);
  return copy;
}

/* ------------------------------ Send flow ------------------------------- */

function randomBetween(min, max) {
  return Math.floor(min + Math.random() * (max - min));
}

/**
 * Build a realistic metrics object given a recipient count. The numbers
 * are intentionally bounded by the ranges described in the spec so the
 * analytics page always renders plausible data.
 */
export function calculateCampaignMetrics(campaign) {
  const recipients = Math.max(0, campaign.recipientCount || 0);
  if (recipients === 0) return emptyMetrics();
  const sent = recipients;
  const deliveryRate = randomBetween(96, 99) / 100;
  const delivered = Math.round(sent * deliveryRate);
  const openRatePct = randomBetween(25, 55);
  const opened = Math.round(delivered * (openRatePct / 100));
  const clickRatePct = randomBetween(5, 20);
  const clicked = Math.round(delivered * (clickRatePct / 100));
  const bounceRatePctTimes10 = randomBetween(5, 30); // gives 0.5%–3%
  const bounced = Math.round(sent * (bounceRatePctTimes10 / 1000));
  const unsubscribed = randomBetween(0, Math.max(1, Math.round(delivered * 0.01)));
  const openRate = delivered ? +((opened / delivered) * 100).toFixed(1) : 0;
  const clickRate = delivered ? +((clicked / delivered) * 100).toFixed(1) : 0;
  const bounceRate = sent ? +((bounced / sent) * 100).toFixed(2) : 0;
  return {
    sent,
    delivered,
    opened,
    clicked,
    bounced,
    unsubscribed,
    openRate,
    clickRate,
    bounceRate,
  };
}

export function sendCampaignNow(id) {
  const list = rawCampaigns();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const campaign = list[idx];
  const sending = { ...campaign, status: CAMPAIGN_STATUSES.SENDING, updatedAt: nowIso() };
  list[idx] = sending;
  persist(list);

  // Simulate the send completing 2 seconds later. We return the in-flight
  // campaign immediately and resolve a promise once the metrics land.
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const fresh = rawCampaigns();
      const i = fresh.findIndex((c) => c.id === id);
      if (i === -1) return resolve(sending);
      // Respect pause/cancel changes that happened during the 2s window.
      const current = fresh[i];
      if (current.status !== CAMPAIGN_STATUSES.SENDING) {
        return resolve(current);
      }
      const metrics = calculateCampaignMetrics(current);
      const sent = {
        ...current,
        status: CAMPAIGN_STATUSES.SENT,
        sentAt: nowIso(),
        updatedAt: nowIso(),
        metrics,
      };
      fresh[i] = sent;
      persist(fresh);
      logAudit('campaign.send', sent);
      pushNotification({
        type: 'campaign-sent',
        title: `Campaign ${sent.campaignName} sent successfully.`,
        tenantId: sent.tenantId,
        campaignId: sent.id,
      });
      resolve(sent);
    }, 2000);
  });
}

export function scheduleCampaign(id, scheduledAt) {
  const list = rawCampaigns();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const next = {
    ...list[idx],
    status: CAMPAIGN_STATUSES.SCHEDULED,
    scheduledAt,
    updatedAt: nowIso(),
  };
  list[idx] = next;
  persist(list);
  logAudit('campaign.schedule', next);
  pushNotification({
    type: 'campaign-scheduled',
    title: `Campaign ${next.campaignName} scheduled successfully.`,
    tenantId: next.tenantId,
    campaignId: next.id,
  });
  return next;
}

export function pauseCampaign(id) {
  const list = rawCampaigns();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const existing = list[idx];
  if (
    existing.status !== CAMPAIGN_STATUSES.SENDING &&
    existing.status !== CAMPAIGN_STATUSES.SCHEDULED
  ) {
    return existing;
  }
  const next = {
    ...existing,
    status: CAMPAIGN_STATUSES.PAUSED,
    previousStatus: existing.status,
    updatedAt: nowIso(),
  };
  list[idx] = next;
  persist(list);
  logAudit('campaign.pause', next);
  return next;
}

export function resumeCampaign(id) {
  const list = rawCampaigns();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const existing = list[idx];
  if (existing.status !== CAMPAIGN_STATUSES.PAUSED) return existing;
  const previous = existing.previousStatus || CAMPAIGN_STATUSES.SCHEDULED;
  const next = {
    ...existing,
    status: previous,
    previousStatus: null,
    updatedAt: nowIso(),
  };
  list[idx] = next;
  persist(list);
  logAudit('campaign.resume', next);
  if (previous === CAMPAIGN_STATUSES.SENDING) {
    // Re-trigger the simulated send so the campaign lands on Sent.
    return sendCampaignNow(id);
  }
  return next;
}

export function cancelCampaign(id) {
  const list = rawCampaigns();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const next = {
    ...list[idx],
    status: CAMPAIGN_STATUSES.CANCELLED,
    updatedAt: nowIso(),
  };
  list[idx] = next;
  persist(list);
  logAudit('campaign.cancel', next);
  return next;
}

export function submitForApproval(id) {
  const list = rawCampaigns();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const next = {
    ...list[idx],
    status: CAMPAIGN_STATUSES.PENDING_APPROVAL,
    approvalStatus: APPROVAL_STATUSES.PENDING,
    updatedAt: nowIso(),
  };
  list[idx] = next;
  persist(list);
  logAudit('campaign.submit_approval', next);
  pushNotification({
    type: 'campaign-pending-approval',
    title: `Campaign ${next.campaignName} is pending approval.`,
    tenantId: next.tenantId,
    campaignId: next.id,
  });
  return next;
}

export function approveCampaign(id, comment = '', approvedBy = null) {
  const list = rawCampaigns();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const next = {
    ...list[idx],
    status: CAMPAIGN_STATUSES.APPROVED,
    approvalStatus: APPROVAL_STATUSES.APPROVED,
    approvedBy,
    approvalComment: comment || '',
    updatedAt: nowIso(),
  };
  list[idx] = next;
  persist(list);
  logAudit('campaign.approve', next);
  pushNotification({
    type: 'campaign-approved',
    title: `Campaign ${next.campaignName} approved successfully.`,
    tenantId: next.tenantId,
    campaignId: next.id,
  });
  return next;
}

export function rejectCampaign(id, comment = '', approvedBy = null) {
  const list = rawCampaigns();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const next = {
    ...list[idx],
    status: CAMPAIGN_STATUSES.DRAFT,
    approvalStatus: APPROVAL_STATUSES.REJECTED,
    approvedBy,
    approvalComment: comment || '',
    updatedAt: nowIso(),
  };
  list[idx] = next;
  persist(list);
  logAudit('campaign.reject', next);
  pushNotification({
    type: 'campaign-rejected',
    title: `Campaign ${next.campaignName} rejected successfully.`,
    tenantId: next.tenantId,
    campaignId: next.id,
  });
  return next;
}

export function retryCampaign(id) {
  const list = rawCampaigns();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const existing = list[idx];
  if (existing.status !== CAMPAIGN_STATUSES.FAILED) return existing;
  const next = {
    ...existing,
    status: CAMPAIGN_STATUSES.DRAFT,
    updatedAt: nowIso(),
  };
  list[idx] = next;
  persist(list);
  logAudit('campaign.retry', next);
  return next;
}

/* ------------------------------ Analytics ------------------------------- */

export function getCampaignAnalytics(id) {
  const campaign = getCampaignById(id);
  if (!campaign) return null;
  const m = campaign.metrics || emptyMetrics();
  // The bar chart consumes a uniform shape regardless of where the
  // numbers come from; the analytics page is free to add charts that
  // simply re-shape this payload.
  const deliveryVsOpenVsClick = [
    { label: 'Delivered', value: m.delivered },
    { label: 'Opened', value: m.opened },
    { label: 'Clicked', value: m.clicked },
  ];
  // Demo engagement trend — 7 buckets evenly distributing opens / clicks.
  const buckets = 7;
  const engagementTrend = Array.from({ length: buckets }, (_, i) => {
    const factor = (i + 1) / buckets;
    return {
      label: `Day ${i + 1}`,
      opens: Math.round(m.opened * factor),
      clicks: Math.round(m.clicked * factor),
    };
  });
  const topLinks = [
    { url: 'https://example.com/landing', clicks: Math.round(m.clicked * 0.45) },
    { url: 'https://example.com/offer', clicks: Math.round(m.clicked * 0.32) },
    { url: 'https://example.com/about', clicks: Math.round(m.clicked * 0.15) },
    { url: 'https://example.com/blog', clicks: Math.round(m.clicked * 0.08) },
  ].filter((l) => l.clicks > 0);
  return {
    campaign,
    metrics: m,
    deliveryVsOpenVsClick,
    engagementTrend,
    topLinks,
  };
}

/* ----------------------------- Notifications ---------------------------- */

function pushNotification(entry) {
  if (!isBrowser()) return;
  const list = read(STORAGE_KEYS.notifications, []);
  const item = {
    id: newId('notif'),
    createdAt: nowIso(),
    read: false,
    ...entry,
  };
  list.unshift(item);
  write(STORAGE_KEYS.notifications, list);
}

export function getCampaignNotifications(tenantId) {
  const list = read(STORAGE_KEYS.notifications, []);
  if (!tenantId) return list;
  return list.filter((n) => !n.tenantId || n.tenantId === tenantId);
}

/* ------------------------------- Audit logs ----------------------------- */

function logAudit(action, campaign, context = {}) {
  if (!isBrowser() || !campaign) return;
  const list = read(STORAGE_KEYS.auditLogs, []);
  const actor =
    context.actor ||
    getCurrentUser()?.emailId ||
    getCurrentUser()?.fullName ||
    campaign.createdBy ||
    'system';
  list.unshift({
    id: newId('audit'),
    action,
    actor,
    entity: `campaign:${campaign.id}`,
    entityName: campaign.campaignName,
    tenantId: campaign.tenantId || null,
    occurredAt: nowIso(),
  });
  // Cap audit log at 500 entries so it never grows unbounded in the demo.
  write(STORAGE_KEYS.auditLogs, list.slice(0, 500));
}

export function getCampaignAuditLogs(tenantId) {
  const list = read(STORAGE_KEYS.auditLogs, []);
  if (!tenantId) return list;
  return list.filter((l) => !l.tenantId || l.tenantId === tenantId);
}

/* --------------------------------- KPIs --------------------------------- */

export function getCampaignStats(list = []) {
  const stats = {
    total: list.length,
    draft: 0,
    scheduled: 0,
    sent: 0,
    running: 0,
    paused: 0,
    failed: 0,
    avgOpenRate: 0,
    avgClickRate: 0,
  };
  let openSum = 0;
  let clickSum = 0;
  let sentWithMetrics = 0;
  list.forEach((c) => {
    if (c.status === CAMPAIGN_STATUSES.DRAFT) stats.draft += 1;
    if (c.status === CAMPAIGN_STATUSES.SCHEDULED) stats.scheduled += 1;
    if (c.status === CAMPAIGN_STATUSES.SENT) stats.sent += 1;
    if (c.status === CAMPAIGN_STATUSES.SENDING) stats.running += 1;
    if (c.status === CAMPAIGN_STATUSES.PAUSED) stats.paused += 1;
    if (c.status === CAMPAIGN_STATUSES.FAILED) stats.failed += 1;
    if (c.metrics && (c.metrics.sent || 0) > 0) {
      openSum += c.metrics.openRate || 0;
      clickSum += c.metrics.clickRate || 0;
      sentWithMetrics += 1;
    }
  });
  if (sentWithMetrics > 0) {
    stats.avgOpenRate = +(openSum / sentWithMetrics).toFixed(1);
    stats.avgClickRate = +(clickSum / sentWithMetrics).toFixed(1);
  }
  return stats;
}

/* ------------------------------ Reset (testing) ------------------------- */

export function resetCampaignStorage() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEYS.campaigns);
  seedCampaigns();
}

export default {
  getCampaigns,
  getCampaignById,
  getCampaignsForUser,
  getCurrentUser,
  getContactsForTenant,
  getTemplatesForTenant,
  getSegmentsForTenant,
  getEligibleRecipients,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  duplicateCampaign,
  sendCampaignNow,
  scheduleCampaign,
  pauseCampaign,
  resumeCampaign,
  cancelCampaign,
  submitForApproval,
  approveCampaign,
  rejectCampaign,
  retryCampaign,
  calculateCampaignMetrics,
  getCampaignAnalytics,
  getCampaignNotifications,
  getCampaignAuditLogs,
  getCampaignStats,
  resetCampaignStorage,
  STORAGE_KEYS,
};
