/**
 * contact-permissions.js
 *
 * RBAC helpers for the Contact Management module. Wraps the central
 * permissions matrix (config/permissions.js) and adds contact-specific
 * grants (manageTags, manageSegments, bulkDelete, viewActivity, resubscribe).
 *
 * Used throughout the module so future API/permission changes only need
 * one file to update.
 */

import { ROLES } from './roles.js';
import {
  canView as baseCanView,
  canCreate as baseCanCreate,
  canEdit as baseCanEdit,
  canDelete as baseCanDelete,
  canExport as baseCanExport,
} from './permissions.js';

export const CONTACT_MODULE = 'contacts';

/**
 * Extra grants beyond the standard RBAC matrix. Each role gets a set of
 * contact-specific capabilities. Keeping this here keeps the change in
 * one place when product rules shift.
 */
const EXTRA_GRANTS = {
  [ROLES.SUPER_ADMIN]: {
    import: true,
    bulkDelete: true,
    manageTags: true,
    manageSegments: true,
    viewActivity: true,
    resubscribe: true,
    viewAllOrganisations: true,
  },
  [ROLES.BUSINESS_ADMIN]: {
    import: true,
    bulkDelete: true,
    manageTags: true,
    manageSegments: true,
    viewActivity: true,
    resubscribe: true,
    viewAllOrganisations: false,
  },
  [ROLES.MARKETING_MANAGER]: {
    import: true,
    bulkDelete: false,
    manageTags: true,
    manageSegments: true,
    viewActivity: true,
    resubscribe: false,
    viewAllOrganisations: false,
  },
  [ROLES.VIEWER]: {
    import: false,
    bulkDelete: false,
    manageTags: false,
    manageSegments: false,
    viewActivity: true,
    resubscribe: false,
    viewAllOrganisations: false,
  },
  [ROLES.INDIVIDUAL]: {
    import: true,
    bulkDelete: true,
    manageTags: true,
    manageSegments: true,
    viewActivity: true,
    resubscribe: true,
    viewAllOrganisations: false,
  },
};

function extra(role, key) {
  return Boolean(EXTRA_GRANTS[role]?.[key]);
}

/* -------------------------- Generic helpers -------------------------- */

export function canView(role, moduleKey = CONTACT_MODULE) {
  return baseCanView(role, moduleKey);
}
export function canCreate(role, moduleKey = CONTACT_MODULE) {
  return baseCanCreate(role, moduleKey);
}
export function canEdit(role, moduleKey = CONTACT_MODULE) {
  return baseCanEdit(role, moduleKey);
}
/**
 * Marketing Manager only deletes when an explicit permission flag is set
 * (defaults to false in the seed). Other roles fall through to the matrix.
 */
export function canDelete(role, moduleKey = CONTACT_MODULE, contactPermissions = {}) {
  if (role === ROLES.MARKETING_MANAGER) {
    return Boolean(contactPermissions.delete);
  }
  return baseCanDelete(role, moduleKey);
}
export function canExport(role, moduleKey = CONTACT_MODULE) {
  return baseCanExport(role, moduleKey);
}
export function canImport(role) {
  return extra(role, 'import') && baseCanCreate(role, CONTACT_MODULE);
}
export function canBulkDelete(role, contactPermissions = {}) {
  if (role === ROLES.MARKETING_MANAGER) {
    return Boolean(contactPermissions.delete) && extra(role, 'bulkDelete');
  }
  return extra(role, 'bulkDelete') && baseCanDelete(role, CONTACT_MODULE);
}
export function canManageTags(role) {
  return extra(role, 'manageTags');
}
export function canManageSegments(role) {
  return extra(role, 'manageSegments');
}
export function canViewActivity(role) {
  return extra(role, 'viewActivity');
}
export function canResubscribe(role, contactPermissions = {}) {
  if (role === ROLES.MARKETING_MANAGER) {
    return Boolean(contactPermissions.resubscribe);
  }
  return extra(role, 'resubscribe');
}
export function canSeeAllOrganisations(role) {
  return extra(role, 'viewAllOrganisations');
}

/**
 * Per-tenant filtering: Super Admin sees all contacts; everyone else sees
 * only their own tenantId. Viewer is scoped to own tenant too.
 */
export function filterByTenant(role, contacts = [], tenantId) {
  if (!Array.isArray(contacts)) return [];
  if (role === ROLES.SUPER_ADMIN) return contacts;
  if (!tenantId) return [];
  return contacts.filter((c) => c.tenantId === tenantId);
}

export default {
  CONTACT_MODULE,
  canView,
  canCreate,
  canEdit,
  canDelete,
  canExport,
  canImport,
  canBulkDelete,
  canManageTags,
  canManageSegments,
  canViewActivity,
  canResubscribe,
  canSeeAllOrganisations,
  filterByTenant,
};
