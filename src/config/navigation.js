/**
 * navigation.js
 *
 * Wires the module registry (modules.js) and the permission matrix
 * (permissions.js) together to produce sidebar navigation per role.
 *
 * Bridging here keeps modules.js and permissions.js free of any direct
 * import of each other — modules.js intentionally has no knowledge of
 * the permission matrix, and permissions.js only consumes MODULE_KEYS
 * (which is a plain string-value object, defined at the top of
 * modules.js, so no real cycle is required).
 *
 * Importing this file once at app startup registers the permission API
 * with the modules.js navigation builder. The Sidebar still calls
 * `getNavigationForRole(role)` from modules.js so existing call sites
 * keep working unchanged.
 */

import { ROLE_LIST } from './roles.js';
import {
  getNavigationForRole,
  setNavigationPermissions,
} from './modules.js';
import { hasModuleAccess, isReadOnly } from './permissions.js';

// Register the permission helpers with modules.js so its
// getNavigationForRole() can ask for view + read-only flags. Done at
// module load — importing navigation.js anywhere wires everything up.
setNavigationPermissions({ hasModuleAccess, isReadOnly });

export const NAVIGATION = ROLE_LIST.reduce((acc, role) => {
  acc[role] = getNavigationForRole(role);
  return acc;
}, {});

export function getNavigation(role) {
  return getNavigationForRole(role);
}

export default NAVIGATION;
