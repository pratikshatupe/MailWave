/**
 * permissions.js
 *
 * Central RBAC matrix for Mailwave. Every permission decision in the app
 * — sidebar visibility, route access, button rendering, table actions and
 * inline edits — flows through this file.
 *
 * Module keys come from MODULE_KEYS in modules.js. Action keys come from
 * ACTIONS below. Anything not listed for a role is denied.
 *
 * Super Admin is the platform owner. Super Admin can manage platform-level
 * modules (tenants, users, plans, subscriptions, payments, coupons,
 * announcements, audit logs, RBAC) but is intentionally view-only on
 * tenant operational data (contacts, campaigns, templates, segments,
 * automations). Flip SUPPORT_OVERRIDE to true to grant Super Admin
 * create/edit/delete on those modules for ticketed support sessions.
 *
 * NOTE: `MODULES` here re-exports MODULE_KEYS for legacy import sites
 * that use `import { MODULES } from '../config/permissions.js'`.
 */

import { ROLES } from './roles.js';
import { MODULE_KEYS } from './modules.js';

export const ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  EXPORT: 'export',
  IMPORT: 'import',
  APPROVE: 'approve',
  MANAGE: 'manage',
  BROADCAST: 'broadcast',
  USE: 'use',
  READ_ONLY: 'readOnly',
};

// Legacy alias — keep existing imports working.
export const MODULES = MODULE_KEYS;

/**
 * Support override flag. When false (default), Super Admin cannot create,
 * edit, delete or import tenant operational data. Flip to true for a
 * support session to unlock those actions on tenant-scoped modules.
 */
export const SUPPORT_OVERRIDE = false;

const TENANT_OPERATIONAL_MODULES = new Set([
  MODULE_KEYS.CONTACTS,
  MODULE_KEYS.CAMPAIGNS,
  MODULE_KEYS.WHATSAPP_CAMPAIGNS,
  MODULE_KEYS.TEMPLATES,
  MODULE_KEYS.SEGMENTS,
  MODULE_KEYS.AUTOMATIONS,
]);

const TENANT_OPERATIONAL_WRITE_ACTIONS = new Set([
  ACTIONS.CREATE,
  ACTIONS.EDIT,
  ACTIONS.DELETE,
  ACTIONS.IMPORT,
  ACTIONS.APPROVE,
]);

const A = ACTIONS;
const M = MODULE_KEYS;

export const PERMISSIONS = {
  /* ----------------------------- Super Admin ----------------------------- */
  [ROLES.SUPER_ADMIN]: {
    [M.DASHBOARD]: [A.VIEW],
    [M.TENANTS]: [A.VIEW, A.CREATE, A.EDIT, A.DELETE, A.MANAGE],
    [M.USERS]: [A.VIEW, A.CREATE, A.EDIT, A.DELETE, A.MANAGE],
    [M.PLANS]: [A.VIEW, A.CREATE, A.EDIT, A.DELETE, A.MANAGE],
    [M.SUBSCRIPTIONS]: [A.VIEW, A.EDIT, A.MANAGE],
    [M.PAYMENTS]: [A.VIEW, A.EXPORT],
    [M.BILLING]: [A.VIEW, A.EXPORT],
    [M.CAMPAIGNS]: [A.VIEW, A.EXPORT],
    [M.WHATSAPP_CAMPAIGNS]: [A.VIEW, A.EXPORT],
    [M.TEMPLATES]: [A.VIEW],
    [M.CONTACTS]: [A.VIEW, A.EXPORT],
    [M.SEGMENTS]: [A.VIEW],
    [M.AUTOMATIONS]: [A.VIEW],
    [M.ANALYTICS]: [A.VIEW, A.EXPORT],
    [M.REPORTS]: [A.VIEW, A.EXPORT],
    [M.NOTIFICATIONS]: [A.VIEW, A.BROADCAST, A.MANAGE],
    [M.ANNOUNCEMENTS]: [A.VIEW, A.CREATE, A.EDIT, A.DELETE, A.BROADCAST, A.MANAGE],
    [M.COUPONS]: [A.VIEW, A.CREATE, A.EDIT, A.DELETE, A.MANAGE],
    [M.REFERRALS]: [A.VIEW, A.EXPORT],
    [M.API_INTEGRATIONS]: [A.VIEW],
    [M.AUDIT_LOGS]: [A.VIEW, A.EXPORT],
    [M.PLATFORM_RBAC]: [A.VIEW, A.EDIT, A.MANAGE],
    [M.SETTINGS]: [A.VIEW, A.EDIT],
    [M.PROFILE]: [A.VIEW, A.EDIT],
    [M.CHANGE_PASSWORD]: [A.VIEW, A.EDIT],
  },

  /* ---------------------------- Business Admin --------------------------- */
  [ROLES.BUSINESS_ADMIN]: {
    [M.DASHBOARD]: [A.VIEW],
    [M.CAMPAIGNS]: [A.VIEW, A.CREATE, A.EDIT, A.DELETE, A.APPROVE, A.MANAGE],
    [M.WHATSAPP_CAMPAIGNS]: [A.VIEW, A.CREATE, A.EDIT, A.DELETE, A.MANAGE],
    [M.TEMPLATES]: [A.VIEW, A.CREATE, A.EDIT, A.DELETE, A.MANAGE],
    [M.CONTACTS]: [A.VIEW, A.CREATE, A.EDIT, A.DELETE, A.IMPORT, A.EXPORT, A.MANAGE],
    [M.SEGMENTS]: [A.VIEW, A.CREATE, A.EDIT, A.DELETE, A.MANAGE],
    [M.AUTOMATIONS]: [A.VIEW, A.CREATE, A.EDIT, A.DELETE, A.MANAGE],
    [M.ANALYTICS]: [A.VIEW, A.EXPORT],
    [M.REPORTS]: [A.VIEW, A.EXPORT],
    [M.NOTIFICATIONS]: [A.VIEW, A.MANAGE],
    [M.ANNOUNCEMENTS]: [A.VIEW],
    [M.COUPONS]: [A.VIEW, A.USE],
    [M.REFERRALS]: [A.VIEW, A.CREATE, A.EXPORT],
    [M.SUBSCRIPTION]: [A.VIEW, A.EDIT],
    [M.BILLING]: [A.VIEW, A.EDIT, A.EXPORT],
    [M.TEAM_MEMBERS]: [A.VIEW, A.CREATE, A.EDIT, A.DELETE, A.MANAGE],
    [M.APPROVAL_WORKFLOW]: [A.VIEW, A.CREATE, A.EDIT, A.APPROVE, A.MANAGE],
    [M.API_INTEGRATIONS]: [A.VIEW, A.CREATE, A.EDIT, A.DELETE, A.MANAGE],
    [M.TEAM_PERMISSIONS]: [A.VIEW, A.EDIT, A.MANAGE],
    [M.SETTINGS]: [A.VIEW, A.EDIT],
    [M.PROFILE]: [A.VIEW, A.EDIT],
    [M.CHANGE_PASSWORD]: [A.VIEW, A.EDIT],
  },

  /* --------------------------- Marketing Manager ------------------------- */
  [ROLES.MARKETING_MANAGER]: {
    [M.DASHBOARD]: [A.VIEW],
    [M.CAMPAIGNS]: [A.VIEW, A.CREATE, A.EDIT, A.DELETE],
    [M.WHATSAPP_CAMPAIGNS]: [A.VIEW, A.CREATE, A.EDIT, A.DELETE],
    [M.TEMPLATES]: [A.VIEW, A.CREATE, A.EDIT, A.DELETE],
    [M.CONTACTS]: [A.VIEW, A.CREATE, A.EDIT, A.IMPORT, A.EXPORT],
    [M.SEGMENTS]: [A.VIEW, A.CREATE, A.EDIT, A.DELETE],
    [M.AUTOMATIONS]: [A.VIEW, A.CREATE, A.EDIT, A.DELETE],
    [M.ANALYTICS]: [A.VIEW, A.EXPORT],
    [M.REPORTS]: [A.VIEW, A.EXPORT],
    [M.NOTIFICATIONS]: [A.VIEW],
    [M.REFERRALS]: [A.VIEW, A.CREATE],
    [M.SETTINGS]: [A.VIEW, A.EDIT],
    [M.PROFILE]: [A.VIEW, A.EDIT],
    [M.CHANGE_PASSWORD]: [A.VIEW, A.EDIT],
  },

  /* ----------------------------- Viewer / Analyst ------------------------ */
  [ROLES.VIEWER]: {
    [M.DASHBOARD]: [A.VIEW],
    [M.CAMPAIGNS]: [A.VIEW],
    [M.WHATSAPP_CAMPAIGNS]: [A.VIEW],
    [M.CONTACTS]: [A.VIEW],
    [M.ANALYTICS]: [A.VIEW, A.EXPORT],
    [M.REPORTS]: [A.VIEW, A.EXPORT],
    [M.NOTIFICATIONS]: [A.VIEW],
    [M.SETTINGS]: [A.VIEW],
    [M.PROFILE]: [A.VIEW, A.EDIT],
    [M.CHANGE_PASSWORD]: [A.VIEW, A.EDIT],
  },

  /* ----------------------------- Individual User ------------------------- */
  [ROLES.INDIVIDUAL]: {
    [M.DASHBOARD]: [A.VIEW],
    [M.CAMPAIGNS]: [A.VIEW, A.CREATE, A.EDIT, A.DELETE],
    [M.WHATSAPP_CAMPAIGNS]: [A.VIEW, A.CREATE, A.EDIT, A.DELETE],
    [M.TEMPLATES]: [A.VIEW, A.CREATE, A.EDIT, A.DELETE],
    [M.CONTACTS]: [A.VIEW, A.CREATE, A.EDIT, A.DELETE, A.IMPORT, A.EXPORT],
    [M.SEGMENTS]: [A.VIEW, A.CREATE, A.EDIT, A.DELETE],
    [M.AUTOMATIONS]: [A.VIEW, A.CREATE, A.EDIT, A.DELETE],
    [M.ANALYTICS]: [A.VIEW, A.EXPORT],
    [M.REPORTS]: [A.VIEW, A.EXPORT],
    [M.NOTIFICATIONS]: [A.VIEW],
    [M.COUPONS]: [A.VIEW, A.USE],
    [M.REFERRALS]: [A.VIEW, A.CREATE],
    [M.SUBSCRIPTION]: [A.VIEW, A.EDIT],
    [M.BILLING]: [A.VIEW, A.EXPORT],
    [M.API_INTEGRATIONS]: [A.VIEW, A.CREATE, A.EDIT, A.DELETE],
    [M.SETTINGS]: [A.VIEW, A.EDIT],
    [M.PROFILE]: [A.VIEW, A.EDIT],
    [M.CHANGE_PASSWORD]: [A.VIEW, A.EDIT],
  },
};

/* ------------------------------ Core check ------------------------------ */

export function can(role, moduleKey, action = ACTIONS.VIEW) {
  if (!role || !moduleKey) return false;
  const roleMap = PERMISSIONS[role];
  if (!roleMap) return false;
  const allowed = roleMap[moduleKey];
  if (Array.isArray(allowed) && allowed.includes(action)) return true;

  // Support override: Super Admin can write to tenant operational data
  // only when SUPPORT_OVERRIDE is flipped on.
  if (
    SUPPORT_OVERRIDE &&
    role === ROLES.SUPER_ADMIN &&
    TENANT_OPERATIONAL_MODULES.has(moduleKey) &&
    TENANT_OPERATIONAL_WRITE_ACTIONS.has(action)
  ) {
    return true;
  }
  return false;
}

export function canView(role, moduleKey) {
  return can(role, moduleKey, ACTIONS.VIEW);
}
export function canCreate(role, moduleKey) {
  return can(role, moduleKey, ACTIONS.CREATE);
}
export function canEdit(role, moduleKey) {
  return can(role, moduleKey, ACTIONS.EDIT);
}
export function canDelete(role, moduleKey) {
  return can(role, moduleKey, ACTIONS.DELETE);
}
export function canExport(role, moduleKey) {
  return can(role, moduleKey, ACTIONS.EXPORT);
}
export function canImport(role, moduleKey) {
  return can(role, moduleKey, ACTIONS.IMPORT);
}
export function canApprove(role, moduleKey) {
  return can(role, moduleKey, ACTIONS.APPROVE);
}
export function canManage(role, moduleKey) {
  return can(role, moduleKey, ACTIONS.MANAGE);
}
export function canBroadcast(role, moduleKey) {
  return can(role, moduleKey, ACTIONS.BROADCAST);
}
export function canUse(role, moduleKey) {
  return can(role, moduleKey, ACTIONS.USE);
}

export function hasModuleAccess(role, moduleKey) {
  if (!role) return false;
  const allowed = PERMISSIONS[role]?.[moduleKey];
  return Array.isArray(allowed) && allowed.length > 0;
}

/**
 * A role is read-only on a module when its only granted actions are view
 * and/or export. Drives the "Read only" banner and hides inline edit,
 * delete, bulk actions and dropdown edit on tables.
 */
export function isReadOnly(role, moduleKey) {
  if (!role) return true;
  const allowed = PERMISSIONS[role]?.[moduleKey] || [];
  if (allowed.length === 0) return true;
  return allowed.every((a) => a === ACTIONS.VIEW || a === ACTIONS.EXPORT);
}
