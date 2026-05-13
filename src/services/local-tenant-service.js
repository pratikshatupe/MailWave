/**
 * local-tenant-service.js
 *
 * Frontend-only tenant store. A tenant is a workspace and isolates
 * contacts / campaigns / templates / automations etc. for the owning user.
 *
 * Storage key: `mailwave_tenants`.
 *
 * NOTE: this is local demo only. Real production tenancy must be managed
 * by the backend with proper RLS / scoping. Do not use this for prod data.
 */

const TENANTS_KEY = 'mailwave_tenants';

function safeStorage() {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

function readJson(key, fallback) {
  const storage = safeStorage();
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  const storage = safeStorage();
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota — ignored in demo */
  }
}

function slugFromEmail(emailId) {
  if (!emailId) return `user-${Date.now().toString(36)}`;
  return emailId
    .split('@')[0]
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 32) || 'user';
}

function generateTenantId(accountType, emailId) {
  const slug = slugFromEmail(emailId);
  const prefix = accountType === 'organisation' || accountType === 'organization' ? 'tenant' : 'solo';
  const stamp = Date.now().toString(36);
  return `${prefix}-${slug}-${stamp}`;
}

export function getTenants() {
  const list = readJson(TENANTS_KEY, []);
  return Array.isArray(list) ? list : [];
}

export function saveTenants(tenants) {
  writeJson(TENANTS_KEY, Array.isArray(tenants) ? tenants : []);
}

export function getTenantById(tenantId) {
  if (!tenantId) return null;
  return getTenants().find((t) => t.tenantId === tenantId) || null;
}

/**
 * Create a brand new tenant for a freshly registered user. Returns the
 * tenant record. Mutates the persisted tenant list.
 */
export function createTenantForUser(user) {
  if (!user || !user.emailId) {
    throw new Error('createTenantForUser requires a user with emailId.');
  }
  const tenantId = user.tenantId || generateTenantId(user.accountType, user.emailId);
  const workspaceName =
    user.organisationName?.trim() ||
    (user.accountType === 'organisation' || user.accountType === 'organization'
      ? `${user.fullName || user.emailId}'s Organisation`
      : `${user.fullName || user.emailId}'s Workspace`);

  const tenant = {
    tenantId,
    organisationName: workspaceName,
    ownerUserId: user.id,
    ownerEmailId: user.emailId,
    ownerFullName: user.fullName,
    accountType: user.accountType,
    selectedPlan: user.selectedPlan,
    status: 'Active',
    createdAt: new Date().toISOString(),
    contacts: [],
    campaigns: [],
    templates: [],
    automations: [],
  };

  const tenants = getTenants();
  tenants.push(tenant);
  saveTenants(tenants);
  return tenant;
}

export { generateTenantId };

export default {
  getTenants,
  saveTenants,
  getTenantById,
  createTenantForUser,
  generateTenantId,
};
