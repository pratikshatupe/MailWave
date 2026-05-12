/**
 * permissions.js
 *
 * RBAC matrix. Module keys come from modules.js (MODULE_KEYS). Action keys
 * come from ACTIONS. Anything not listed for a role is denied.
 *
 * NOTE: `MODULES` here re-exports MODULE_KEYS for legacy import sites that
 * use `import { MODULES } from '../config/permissions.js'`.
 */

import { ROLES } from './roles.js';
import { MODULE_KEYS } from './modules.js';

export const ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  EXPORT: 'export',
  APPROVE: 'approve',
  MANAGE: 'manage',
  READ_ONLY: 'readOnly',
};

// Legacy alias — keep existing imports working.
export const MODULES = MODULE_KEYS;

const ALL = [
  ACTIONS.VIEW,
  ACTIONS.CREATE,
  ACTIONS.EDIT,
  ACTIONS.DELETE,
  ACTIONS.EXPORT,
  ACTIONS.APPROVE,
  ACTIONS.MANAGE,
];
const READ_ONLY = [ACTIONS.VIEW, ACTIONS.EXPORT];
const SELF_MANAGE = [
  ACTIONS.VIEW,
  ACTIONS.CREATE,
  ACTIONS.EDIT,
  ACTIONS.DELETE,
  ACTIONS.EXPORT,
  ACTIONS.MANAGE,
];

export const PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: {
    [MODULE_KEYS.DASHBOARD]: ALL,
    [MODULE_KEYS.TENANTS]: ALL,
    [MODULE_KEYS.USERS]: ALL,
    [MODULE_KEYS.PLANS]: ALL,
    [MODULE_KEYS.SUBSCRIPTIONS]: ALL,
    [MODULE_KEYS.PAYMENTS]: ALL,
    [MODULE_KEYS.CAMPAIGNS]: ALL,
    [MODULE_KEYS.TEMPLATES]: ALL,
    [MODULE_KEYS.CONTACTS]: ALL,
    [MODULE_KEYS.SEGMENTS]: ALL,
    [MODULE_KEYS.AUTOMATIONS]: ALL,
    [MODULE_KEYS.ANALYTICS]: ALL,
    [MODULE_KEYS.REPORTS]: ALL,
    [MODULE_KEYS.NOTIFICATIONS]: ALL,
    [MODULE_KEYS.ANNOUNCEMENTS]: ALL,
    [MODULE_KEYS.COUPONS]: ALL,
    [MODULE_KEYS.REFERRALS]: ALL,
    [MODULE_KEYS.API_INTEGRATIONS]: ALL,
    [MODULE_KEYS.AUDIT_LOGS]: [ACTIONS.VIEW, ACTIONS.EXPORT],
    [MODULE_KEYS.ROLE_PERMISSIONS]: ALL,
    [MODULE_KEYS.SETTINGS]: ALL,
    [MODULE_KEYS.PROFILE]: ALL,
    [MODULE_KEYS.CHANGE_PASSWORD]: ALL,
  },
  [ROLES.BUSINESS_ADMIN]: {
    [MODULE_KEYS.DASHBOARD]: SELF_MANAGE,
    [MODULE_KEYS.CAMPAIGNS]: SELF_MANAGE,
    [MODULE_KEYS.TEMPLATES]: SELF_MANAGE,
    [MODULE_KEYS.CONTACTS]: SELF_MANAGE,
    [MODULE_KEYS.SEGMENTS]: SELF_MANAGE,
    [MODULE_KEYS.AUTOMATIONS]: SELF_MANAGE,
    [MODULE_KEYS.ANALYTICS]: READ_ONLY,
    [MODULE_KEYS.REPORTS]: READ_ONLY,
    [MODULE_KEYS.TEAM_MEMBERS]: SELF_MANAGE,
    [MODULE_KEYS.APPROVAL_WORKFLOW]: [...SELF_MANAGE, ACTIONS.APPROVE],
    [MODULE_KEYS.NOTIFICATIONS]: [ACTIONS.VIEW, ACTIONS.EDIT],
    [MODULE_KEYS.ANNOUNCEMENTS]: [ACTIONS.VIEW],
    [MODULE_KEYS.COUPONS]: SELF_MANAGE,
    [MODULE_KEYS.REFERRALS]: SELF_MANAGE,
    [MODULE_KEYS.SUBSCRIPTION]: SELF_MANAGE,
    [MODULE_KEYS.BILLING]: SELF_MANAGE,
    [MODULE_KEYS.API_INTEGRATIONS]: SELF_MANAGE,
    [MODULE_KEYS.SETTINGS]: SELF_MANAGE,
    [MODULE_KEYS.PROFILE]: SELF_MANAGE,
    [MODULE_KEYS.CHANGE_PASSWORD]: SELF_MANAGE,
  },
  [ROLES.MARKETING_MANAGER]: {
    [MODULE_KEYS.DASHBOARD]: [ACTIONS.VIEW],
    [MODULE_KEYS.CAMPAIGNS]: [
      ACTIONS.VIEW,
      ACTIONS.CREATE,
      ACTIONS.EDIT,
      ACTIONS.EXPORT,
    ],
    [MODULE_KEYS.TEMPLATES]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT],
    [MODULE_KEYS.CONTACTS]: [
      ACTIONS.VIEW,
      ACTIONS.CREATE,
      ACTIONS.EDIT,
      ACTIONS.EXPORT,
    ],
    [MODULE_KEYS.SEGMENTS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT],
    [MODULE_KEYS.AUTOMATIONS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT],
    [MODULE_KEYS.ANALYTICS]: READ_ONLY,
    [MODULE_KEYS.REPORTS]: READ_ONLY,
    [MODULE_KEYS.NOTIFICATIONS]: [ACTIONS.VIEW],
    [MODULE_KEYS.REFERRALS]: [ACTIONS.VIEW],
    [MODULE_KEYS.SETTINGS]: [ACTIONS.VIEW, ACTIONS.EDIT],
    [MODULE_KEYS.PROFILE]: SELF_MANAGE,
    [MODULE_KEYS.CHANGE_PASSWORD]: SELF_MANAGE,
  },
  [ROLES.VIEWER]: {
    [MODULE_KEYS.DASHBOARD]: [ACTIONS.VIEW],
    [MODULE_KEYS.ANALYTICS]: READ_ONLY,
    [MODULE_KEYS.REPORTS]: READ_ONLY,
    [MODULE_KEYS.CAMPAIGNS]: READ_ONLY,
    [MODULE_KEYS.CONTACTS]: READ_ONLY,
    [MODULE_KEYS.NOTIFICATIONS]: [ACTIONS.VIEW],
    [MODULE_KEYS.SETTINGS]: [ACTIONS.VIEW],
    [MODULE_KEYS.PROFILE]: SELF_MANAGE,
    [MODULE_KEYS.CHANGE_PASSWORD]: SELF_MANAGE,
  },
  [ROLES.INDIVIDUAL]: {
    [MODULE_KEYS.DASHBOARD]: [ACTIONS.VIEW],
    [MODULE_KEYS.CAMPAIGNS]: SELF_MANAGE,
    [MODULE_KEYS.TEMPLATES]: SELF_MANAGE,
    [MODULE_KEYS.CONTACTS]: SELF_MANAGE,
    [MODULE_KEYS.SEGMENTS]: SELF_MANAGE,
    [MODULE_KEYS.AUTOMATIONS]: SELF_MANAGE,
    [MODULE_KEYS.ANALYTICS]: READ_ONLY,
    [MODULE_KEYS.REPORTS]: READ_ONLY,
    [MODULE_KEYS.COUPONS]: [ACTIONS.VIEW, ACTIONS.EDIT],
    [MODULE_KEYS.REFERRALS]: SELF_MANAGE,
    [MODULE_KEYS.SUBSCRIPTION]: SELF_MANAGE,
    [MODULE_KEYS.BILLING]: SELF_MANAGE,
    [MODULE_KEYS.NOTIFICATIONS]: [ACTIONS.VIEW],
    [MODULE_KEYS.API_INTEGRATIONS]: SELF_MANAGE,
    [MODULE_KEYS.SETTINGS]: SELF_MANAGE,
    [MODULE_KEYS.PROFILE]: SELF_MANAGE,
    [MODULE_KEYS.CHANGE_PASSWORD]: SELF_MANAGE,
  },
};

/* ------------------------------ Core check ------------------------------ */

export function can(role, moduleKey, action = ACTIONS.VIEW) {
  if (!role || !moduleKey) return false;
  const roleMap = PERMISSIONS[role];
  if (!roleMap) return false;
  const allowed = roleMap[moduleKey];
  if (!allowed) return false;
  return allowed.includes(action);
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
export function canApprove(role, moduleKey) {
  return can(role, moduleKey, ACTIONS.APPROVE);
}
export function canManage(role, moduleKey) {
  return can(role, moduleKey, ACTIONS.MANAGE);
}
export function hasModuleAccess(role, moduleKey) {
  if (!role) return false;
  const allowed = PERMISSIONS[role]?.[moduleKey];
  return Array.isArray(allowed) && allowed.length > 0;
}

export function isReadOnly(role, moduleKey) {
  if (!role) return true;
  const allowed = PERMISSIONS[role]?.[moduleKey] || [];
  return (
    allowed.length > 0 &&
    allowed.every((a) => a === ACTIONS.VIEW || a === ACTIONS.EXPORT)
  );
}
