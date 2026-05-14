/**
 * services/automation-service.js
 *
 * Frontend-only service layer for the Automation Workflow module. All
 * reads / writes persist to localStorage so the entire module works
 * locally without a backend.
 *
 * Storage keys:
 *   mailwave_automations       → automation records
 *   mailwave_current_user      → current logged-in user (mirrored by auth)
 *   mailwave_audit_logs        → audit entries (shared with campaigns)
 *   mailwave_notifications     → notification entries (shared with campaigns)
 *
 * Contacts / templates / segments / tags / campaigns are read from the
 * existing service-level storage keys so the module slots into the rest
 * of the app without a separate seed step.
 *
 * Tenant isolation is enforced at every read. Super Admin sees every
 * tenant; everyone else is scoped to their own tenantId.
 */

import { SAMPLE_AUTOMATIONS } from '../mock/automations.js';
import { ROLES } from '../config/roles.js';
import {
  getContacts as getServiceContacts,
  getTags as getServiceTags,
  getSegments as getServiceSegments,
} from './contact-service.js';

export const STORAGE_KEYS = {
  automations: 'mailwave_automations',
  currentUser: 'mailwave_current_user',
  auditLogs: 'mailwave_audit_logs',
  notifications: 'mailwave_notifications',
};

export const AUTOMATION_STATUS = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
};

export const AUTOMATION_STATUS_LIST = [
  AUTOMATION_STATUS.DRAFT,
  AUTOMATION_STATUS.ACTIVE,
  AUTOMATION_STATUS.PAUSED,
  AUTOMATION_STATUS.COMPLETED,
  AUTOMATION_STATUS.FAILED,
];

export const TRIGGER_TYPES = [
  'New Contact Added',
  'Tag Added',
  'Segment Joined',
  'Email Opened',
  'Link Clicked',
  'Date Based',
  'Custom Field Updated',
];

export const AUDIENCE_TYPES = [
  'All Contacts',
  'Subscribed Contacts',
  'Segment',
  'Tag Based',
  'Selected Contacts',
];

export const WORKFLOW_STEP_TYPES = [
  'Send Email',
  'Wait / Delay',
  'Condition',
  'Add Tag',
  'Remove Tag',
  'Update Contact Field',
  'Exit Workflow',
];

export const DURATION_TYPES = ['Minutes', 'Hours', 'Days'];

export const CONDITION_TYPES = [
  'Email Opened',
  'Email Not Opened',
  'Link Clicked',
  'Tag Exists',
  'Segment Match',
  'Contact Field Match',
  'WhatsApp Opted In',
  'Subscription Status',
];

export const UPDATE_CONTACT_FIELDS = [
  'Full Name',
  'Contact Number',
  'Tags',
  'Segment',
  'Subscription Status',
  'Email Consent',
  'WhatsApp Opt-In Status',
];

const CONTACT_FIELDS_FOR_TRIGGER = [...UPDATE_CONTACT_FIELDS];

/* ---- conditional UI helpers ---- */

export function triggerNeedsValue(triggerType) {
  return [
    'Tag Added',
    'Segment Joined',
    'Email Opened',
    'Link Clicked',
    'Date Based',
    'Custom Field Updated',
  ].includes(triggerType);
}

export function conditionNeedsValue(conditionType) {
  return [
    'Link Clicked',
    'Tag Exists',
    'Segment Match',
    'Contact Field Match',
    'Subscription Status',
  ].includes(conditionType);
}

export function getContactFieldsForTrigger() {
  return CONTACT_FIELDS_FOR_TRIGGER;
}

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

function newId(prefix = 'auto') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

/* ------------------------------ Seed ------------------------------ */

function seedAutomations() {
  if (!isBrowser()) return;
  if (!window.localStorage.getItem(STORAGE_KEYS.automations)) {
    write(STORAGE_KEYS.automations, SAMPLE_AUTOMATIONS);
  }
}

function rawAutomations() {
  seedAutomations();
  const list = read(STORAGE_KEYS.automations, []);
  return Array.isArray(list) ? list : [];
}

/* ----------------------------- Current user ----------------------------- */

export function getCurrentUser() {
  const fromSpecKey = read(STORAGE_KEYS.currentUser, null);
  if (fromSpecKey && (fromSpecKey.id || fromSpecKey.emailId || fromSpecKey.email)) {
    return fromSpecKey;
  }
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

/* ----------------------------- Tenant rolling-up ----------------------------- */

function applyTenantScope(list, user) {
  if (!user) return [];
  if (user.role === ROLES.SUPER_ADMIN) return list;
  if (user.role === ROLES.INDIVIDUAL) {
    const emailId = user.emailId || user.email;
    return list.filter(
      (a) =>
        a.tenantId === user.tenantId &&
        (a.createdBy === emailId || a.createdBy === user.id || !a.createdBy)
    );
  }
  return list.filter((a) => a.tenantId === user.tenantId);
}

/* ----------------------------- Reads ----------------------------- */

export function getAutomations(params = {}) {
  let list = rawAutomations();
  if (params.tenantId) {
    list = list.filter((a) => a.tenantId === params.tenantId);
  }
  if (params.status) {
    list = list.filter((a) => a.status === params.status);
  }
  if (params.triggerType) {
    list = list.filter((a) => a.triggerType === params.triggerType);
  }
  if (params.audienceType) {
    list = list.filter((a) => a.audienceType === params.audienceType);
  }
  if (params.createdBy) {
    list = list.filter((a) => a.createdBy === params.createdBy);
  }
  return list;
}

export function getAutomationsForUser(user, params = {}) {
  if (!user) return [];
  const list = getAutomations(params);
  return applyTenantScope(list, user);
}

export function getAutomationById(id) {
  if (!id) return null;
  return rawAutomations().find((a) => a.id === id) || null;
}

/* ----------------------------- Create / Update ----------------------------- */

function defaultMetrics() {
  return {
    entered: 0,
    emailsSent: 0,
    opened: 0,
    clicked: 0,
    completed: 0,
    openRate: 0,
    clickRate: 0,
  };
}

function normalisePayload(payload, user) {
  return {
    automationName: (payload.automationName || '').trim(),
    description: (payload.description || '').trim(),
    triggerType: payload.triggerType || '',
    triggerValue: payload.triggerValue ?? '',
    audienceType: payload.audienceType || '',
    audienceValue: payload.audienceValue ?? null,
    workflowSteps: Array.isArray(payload.workflowSteps) ? payload.workflowSteps : [],
    status: payload.status || AUTOMATION_STATUS.DRAFT,
    tenantId: payload.tenantId || user?.tenantId || null,
    organisationName:
      payload.organisationName ||
      (user?.accountType === 'organisation' ? user?.fullName : null),
    createdBy: payload.createdBy || user?.emailId || user?.email || 'system',
  };
}

export function createAutomation(payload) {
  const user = getCurrentUser();
  const list = rawAutomations();
  const data = normalisePayload(payload, user);
  const record = {
    id: newId('auto'),
    ...data,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    activatedAt: null,
    pausedAt: null,
    lastRunAt: null,
    metrics: defaultMetrics(),
  };
  list.unshift(record);
  write(STORAGE_KEYS.automations, list);
  logAudit('automation.create', record);
  pushNotification({
    type: 'automation-created',
    title: `Automation ${record.automationName} created successfully.`,
    tenantId: record.tenantId,
    automationId: record.id,
  });
  return record;
}

export function updateAutomation(id, payload) {
  const list = rawAutomations();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  const existing = list[idx];
  const next = {
    ...existing,
    ...payload,
    automationName:
      payload.automationName !== undefined
        ? String(payload.automationName).trim()
        : existing.automationName,
    description:
      payload.description !== undefined
        ? String(payload.description).trim()
        : existing.description,
    workflowSteps: Array.isArray(payload.workflowSteps)
      ? payload.workflowSteps
      : existing.workflowSteps,
    id,
    updatedAt: nowIso(),
  };
  list[idx] = next;
  write(STORAGE_KEYS.automations, list);
  logAudit('automation.update', next);
  return next;
}

export function deleteAutomation(id) {
  const list = rawAutomations();
  const target = list.find((a) => a.id === id);
  const next = list.filter((a) => a.id !== id);
  write(STORAGE_KEYS.automations, next);
  if (target) {
    logAudit('automation.delete', target);
    pushNotification({
      type: 'automation-deleted',
      title: `Automation ${target.automationName} deleted.`,
      tenantId: target.tenantId,
      automationId: target.id,
    });
  }
  return next.length !== list.length;
}

export function bulkDeleteAutomations(ids = []) {
  const set = new Set(ids);
  const list = rawAutomations();
  const removed = list.filter((a) => set.has(a.id));
  const next = list.filter((a) => !set.has(a.id));
  write(STORAGE_KEYS.automations, next);
  removed.forEach((a) => logAudit('automation.delete', a));
  return list.length - next.length;
}

export function duplicateAutomation(id) {
  const list = rawAutomations();
  const target = list.find((a) => a.id === id);
  if (!target) return null;
  const copy = {
    ...target,
    id: newId('auto'),
    automationName: `${target.automationName} (Copy)`,
    status: AUTOMATION_STATUS.DRAFT,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    activatedAt: null,
    pausedAt: null,
    lastRunAt: null,
    metrics: defaultMetrics(),
    workflowSteps: (target.workflowSteps || []).map((step) => ({
      ...step,
      id: newId('step'),
    })),
  };
  list.unshift(copy);
  write(STORAGE_KEYS.automations, list);
  logAudit('automation.duplicate', copy);
  pushNotification({
    type: 'automation-duplicated',
    title: `Automation ${copy.automationName} created from duplicate.`,
    tenantId: copy.tenantId,
    automationId: copy.id,
  });
  return copy;
}

/* ----------------------------- Lifecycle ----------------------------- */

export function activateAutomation(id) {
  const list = rawAutomations();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  const existing = list[idx];
  const validation = validateForActivation(existing);
  if (!validation.ok) {
    throw new Error(validation.error);
  }
  const audience = getEligibleAutomationContacts({
    tenantId: existing.tenantId,
    audienceType: existing.audienceType,
    audienceValue: existing.audienceValue,
  });
  if (audience.eligible === 0) {
    throw new Error('At least one eligible contact is required before activation.');
  }
  const simulated = simulateMetrics(audience.eligible, existing.workflowSteps);
  const next = {
    ...existing,
    status: AUTOMATION_STATUS.ACTIVE,
    activatedAt: nowIso(),
    pausedAt: null,
    updatedAt: nowIso(),
    lastRunAt: nowIso(),
    metrics: simulated,
  };
  list[idx] = next;
  write(STORAGE_KEYS.automations, list);
  logAudit('automation.activate', next);
  pushNotification({
    type: 'automation-activated',
    title: `Automation ${next.automationName} activated successfully.`,
    tenantId: next.tenantId,
    automationId: next.id,
  });
  return next;
}

export function pauseAutomation(id) {
  const list = rawAutomations();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  const existing = list[idx];
  if (existing.status !== AUTOMATION_STATUS.ACTIVE) return existing;
  const next = {
    ...existing,
    status: AUTOMATION_STATUS.PAUSED,
    pausedAt: nowIso(),
    updatedAt: nowIso(),
  };
  list[idx] = next;
  write(STORAGE_KEYS.automations, list);
  logAudit('automation.pause', next);
  pushNotification({
    type: 'automation-paused',
    title: `Automation ${next.automationName} paused.`,
    tenantId: next.tenantId,
    automationId: next.id,
  });
  return next;
}

export function resumeAutomation(id) {
  const list = rawAutomations();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  const existing = list[idx];
  if (existing.status !== AUTOMATION_STATUS.PAUSED) return existing;
  const next = {
    ...existing,
    status: AUTOMATION_STATUS.ACTIVE,
    pausedAt: null,
    updatedAt: nowIso(),
    lastRunAt: nowIso(),
  };
  list[idx] = next;
  write(STORAGE_KEYS.automations, list);
  logAudit('automation.resume', next);
  pushNotification({
    type: 'automation-resumed',
    title: `Automation ${next.automationName} resumed.`,
    tenantId: next.tenantId,
    automationId: next.id,
  });
  return next;
}

/* ----------------------------- Validation ----------------------------- */

export function validateAutomationWorkflow(workflowSteps = []) {
  const errors = [];
  if (!Array.isArray(workflowSteps) || workflowSteps.length === 0) {
    return { ok: false, errors: ['At least one workflow step is required.'] };
  }
  const actionable = workflowSteps.filter(
    (s) => s.stepType && s.stepType !== 'Exit Workflow'
  );
  if (actionable.length === 0) {
    errors.push('Workflow needs at least one action step.');
  }
  workflowSteps.forEach((step, index) => {
    const where = `Step ${index + 1} (${step.stepType || 'unknown'})`;
    const cfg = step.config || {};
    if (step.stepType === 'Send Email' && !cfg.templateId) {
      errors.push(`${where}: Template is required.`);
    }
    if (step.stepType === 'Wait / Delay') {
      if (!cfg.durationType) errors.push(`${where}: Duration Type is required.`);
      if (cfg.durationValue === undefined || cfg.durationValue === '' ) {
        errors.push(`${where}: Duration Value is required.`);
      } else if (Number(cfg.durationValue) <= 0 || Number.isNaN(Number(cfg.durationValue))) {
        errors.push(`${where}: Duration Value must be a positive number.`);
      }
    }
    if (step.stepType === 'Condition') {
      if (!cfg.conditionType) errors.push(`${where}: Condition Type is required.`);
      if (conditionNeedsValue(cfg.conditionType) && !cfg.conditionValue) {
        errors.push(`${where}: Condition Value is required.`);
      }
    }
    if (step.stepType === 'Add Tag' && !cfg.tag) {
      errors.push(`${where}: Tag is required.`);
    }
    if (step.stepType === 'Remove Tag' && !cfg.tag) {
      errors.push(`${where}: Tag is required.`);
    }
    if (step.stepType === 'Update Contact Field') {
      if (!cfg.field) errors.push(`${where}: Field is required.`);
      if (cfg.value === undefined || cfg.value === '' ) {
        errors.push(`${where}: Value is required.`);
      }
    }
  });
  return { ok: errors.length === 0, errors };
}

function validateForActivation(automation) {
  if (!automation.automationName || automation.automationName.trim().length < 3) {
    return { ok: false, error: 'Automation Name is required.' };
  }
  if (!automation.triggerType) {
    return { ok: false, error: 'Trigger Type is required.' };
  }
  if (triggerNeedsValue(automation.triggerType) && !automation.triggerValue) {
    return { ok: false, error: 'Trigger Value is required for this trigger.' };
  }
  if (!automation.audienceType) {
    return { ok: false, error: 'Audience Type is required.' };
  }
  if (
    (automation.audienceType === 'Segment' || automation.audienceType === 'Tag Based') &&
    !automation.audienceValue
  ) {
    return { ok: false, error: 'Audience value is required for this audience type.' };
  }
  if (
    automation.audienceType === 'Selected Contacts' &&
    (!Array.isArray(automation.audienceValue) || automation.audienceValue.length === 0)
  ) {
    return { ok: false, error: 'Select at least one contact for the audience.' };
  }
  const wf = validateAutomationWorkflow(automation.workflowSteps);
  if (!wf.ok) return { ok: false, error: wf.errors[0] };
  return { ok: true };
}

/* ----------------------------- Audience / contacts ----------------------------- */

function loadAllContacts() {
  try {
    return getServiceContacts({});
  } catch {
    return [];
  }
}

export function getEligibleAutomationContacts(audienceConfig = {}) {
  const all = loadAllContacts();
  const tenantId = audienceConfig.tenantId;
  const scoped = tenantId
    ? all.filter((c) => !c.tenantId || c.tenantId === tenantId)
    : all;

  // Spec rule: only subscribed contacts with consent are eligible. Everyone
  // else (unsubscribed, bounced, complained, invalid) is excluded.
  const isEligible = (c) => {
    if (c.status !== 'subscribed') return false;
    if (c.emailConsent === false) return false;
    return true;
  };

  let pool = scoped.filter(isEligible);

  switch (audienceConfig.audienceType) {
    case 'All Contacts':
      pool = scoped.filter(isEligible);
      break;
    case 'Subscribed Contacts':
      pool = scoped.filter(isEligible);
      break;
    case 'Segment':
      pool = scoped.filter(
        (c) => isEligible(c) && (c.segments || []).includes(audienceConfig.audienceValue)
      );
      break;
    case 'Tag Based':
      pool = scoped.filter(
        (c) => isEligible(c) && (c.tags || []).includes(audienceConfig.audienceValue)
      );
      break;
    case 'Selected Contacts': {
      const ids = new Set(Array.isArray(audienceConfig.audienceValue) ? audienceConfig.audienceValue : []);
      pool = scoped.filter((c) => ids.has(c.id) && isEligible(c));
      break;
    }
    default:
      pool = [];
  }

  return {
    total: scoped.length,
    eligible: pool.length,
    excluded: scoped.length - pool.length,
    finalAudience: pool.length,
    contacts: pool,
  };
}

/* ----------------------------- Tags / Segments / Templates / Campaigns ----------------------------- */

export function getTagsForTenant(tenantId) {
  try {
    const tags = getServiceTags();
    const contacts = loadAllContacts();
    const dynamic = Array.from(
      new Set(
        contacts
          .filter((c) => !tenantId || !c.tenantId || c.tenantId === tenantId)
          .flatMap((c) => c.tags || [])
      )
    );
    const fromService = tags.map((t) => t.name).filter(Boolean);
    return Array.from(new Set([...fromService, ...dynamic]));
  } catch {
    return [];
  }
}

export function getSegmentsForTenant(tenantId) {
  try {
    const segments = getServiceSegments();
    const contacts = loadAllContacts();
    const dynamic = Array.from(
      new Set(
        contacts
          .filter((c) => !tenantId || !c.tenantId || c.tenantId === tenantId)
          .flatMap((c) => c.segments || [])
      )
    );
    const fromService = segments.map((s) => s.name).filter(Boolean);
    return Array.from(new Set([...fromService, ...dynamic]));
  } catch {
    return [];
  }
}

export function getTemplatesForTenant(tenantId) {
  const list = read('mailwave-templates', []);
  const arr = Array.isArray(list) ? list : [];
  if (!tenantId) return arr;
  return arr.filter((t) => !t.tenantId || t.tenantId === tenantId);
}

export function getCampaignsForTenant(tenantId) {
  const list = read('mailwave_campaigns', []);
  const arr = Array.isArray(list) ? list : [];
  if (!tenantId) return arr;
  return arr.filter((c) => !c.tenantId || c.tenantId === tenantId);
}

export function getContactsForTenant(tenantId) {
  const all = loadAllContacts();
  if (!tenantId) return all;
  return all.filter((c) => !c.tenantId || c.tenantId === tenantId);
}

/* ----------------------------- Analytics ----------------------------- */

function simulateMetrics(eligibleCount, workflowSteps = []) {
  const emailSteps = (workflowSteps || []).filter((s) => s.stepType === 'Send Email').length;
  const entered = eligibleCount;
  const emailsSent = entered * Math.max(emailSteps, 0);
  const opened = Math.round(emailsSent * 0.45);
  const clicked = Math.round(emailsSent * 0.14);
  const completed = Math.round(entered * 0.72);
  const openRate = emailsSent === 0 ? 0 : +(opened / emailsSent * 100).toFixed(1);
  const clickRate = emailsSent === 0 ? 0 : +(clicked / emailsSent * 100).toFixed(1);
  return { entered, emailsSent, opened, clicked, completed, openRate, clickRate };
}

export function simulateAutomationMetrics(id) {
  const target = getAutomationById(id);
  if (!target) return null;
  const audience = getEligibleAutomationContacts({
    tenantId: target.tenantId,
    audienceType: target.audienceType,
    audienceValue: target.audienceValue,
  });
  return simulateMetrics(audience.eligible, target.workflowSteps);
}

export function getAutomationAnalytics(id) {
  const target = getAutomationById(id);
  if (!target) return null;
  const audience = getEligibleAutomationContacts({
    tenantId: target.tenantId,
    audienceType: target.audienceType,
    audienceValue: target.audienceValue,
  });
  const metrics = target.metrics || defaultMetrics();
  return {
    automation: target,
    audience,
    metrics,
    activity: buildActivityTimeline(target),
  };
}

function buildActivityTimeline(automation) {
  const out = [];
  if (automation.createdAt) {
    out.push({ at: automation.createdAt, label: 'Created', actor: automation.createdBy });
  }
  if (automation.activatedAt) {
    out.push({ at: automation.activatedAt, label: 'Activated', actor: automation.createdBy });
  }
  if (automation.pausedAt) {
    out.push({ at: automation.pausedAt, label: 'Paused', actor: automation.createdBy });
  }
  if (automation.lastRunAt) {
    out.push({ at: automation.lastRunAt, label: 'Last run', actor: 'system' });
  }
  return out.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

/* ----------------------------- KPIs ----------------------------- */

export function getAutomationStats(list = []) {
  const stats = {
    total: list.length,
    active: 0,
    draft: 0,
    paused: 0,
    completed: 0,
    failed: 0,
    contactsEntered: 0,
    emailsSent: 0,
    opened: 0,
    clicked: 0,
    openRate: 0,
    clickRate: 0,
  };
  let metricRows = 0;
  let openSum = 0;
  let clickSum = 0;
  list.forEach((a) => {
    if (a.status === AUTOMATION_STATUS.ACTIVE) stats.active += 1;
    if (a.status === AUTOMATION_STATUS.DRAFT) stats.draft += 1;
    if (a.status === AUTOMATION_STATUS.PAUSED) stats.paused += 1;
    if (a.status === AUTOMATION_STATUS.COMPLETED) stats.completed += 1;
    if (a.status === AUTOMATION_STATUS.FAILED) stats.failed += 1;
    const m = a.metrics || {};
    stats.contactsEntered += m.entered || 0;
    stats.emailsSent += m.emailsSent || 0;
    stats.opened += m.opened || 0;
    stats.clicked += m.clicked || 0;
    if ((m.emailsSent || 0) > 0) {
      openSum += m.openRate || 0;
      clickSum += m.clickRate || 0;
      metricRows += 1;
    }
  });
  if (metricRows > 0) {
    stats.openRate = +(openSum / metricRows).toFixed(1);
    stats.clickRate = +(clickSum / metricRows).toFixed(1);
  }
  return stats;
}

/* ----------------------------- Notifications ----------------------------- */

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
  write(STORAGE_KEYS.notifications, list.slice(0, 500));
}

/* ----------------------------- Audit log ----------------------------- */

function logAudit(action, automation, context = {}) {
  if (!isBrowser() || !automation) return;
  const list = read(STORAGE_KEYS.auditLogs, []);
  const current = getCurrentUser();
  const actor =
    context.actor ||
    current?.emailId ||
    current?.fullName ||
    automation.createdBy ||
    'system';
  list.unshift({
    id: newId('audit'),
    action,
    actor,
    entity: `automation:${automation.id}`,
    entityName: automation.automationName,
    tenantId: automation.tenantId || null,
    occurredAt: nowIso(),
  });
  write(STORAGE_KEYS.auditLogs, list.slice(0, 500));
}

/* ----------------------------- Reset (testing) ----------------------------- */

export function resetAutomationStorage() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEYS.automations);
  seedAutomations();
}

export default {
  getAutomations,
  getAutomationsForUser,
  getAutomationById,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  bulkDeleteAutomations,
  duplicateAutomation,
  activateAutomation,
  pauseAutomation,
  resumeAutomation,
  getAutomationAnalytics,
  getEligibleAutomationContacts,
  validateAutomationWorkflow,
  simulateAutomationMetrics,
  getCurrentUser,
  getTagsForTenant,
  getSegmentsForTenant,
  getTemplatesForTenant,
  getCampaignsForTenant,
  getContactsForTenant,
  getAutomationStats,
  resetAutomationStorage,
  AUTOMATION_STATUS,
  AUTOMATION_STATUS_LIST,
  TRIGGER_TYPES,
  AUDIENCE_TYPES,
  WORKFLOW_STEP_TYPES,
  DURATION_TYPES,
  CONDITION_TYPES,
  UPDATE_CONTACT_FIELDS,
  triggerNeedsValue,
  conditionNeedsValue,
  getContactFieldsForTrigger,
};
