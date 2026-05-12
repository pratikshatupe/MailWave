/**
 * navigation.js (legacy façade)
 *
 * Kept for backwards compatibility. The single source of truth is now
 * src/config/modules.js — `getNavigationForRole(role)` derives the sidebar
 * dynamically from the module registry.
 */

import { ROLE_LIST } from './roles.js';
import { getNavigationForRole } from './modules.js';

export const NAVIGATION = ROLE_LIST.reduce((acc, role) => {
  acc[role] = getNavigationForRole(role);
  return acc;
}, {});

export function getNavigation(role) {
  return getNavigationForRole(role);
}
