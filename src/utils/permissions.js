/**
 * utils/permissions.js
 *
 * Thin façade over config/permissions.js. Components import from here so
 * `import { canEdit } from '../utils/permissions.js'` reads naturally.
 *
 * Wired rules:
 *  - Super Admin: full platform access, view-only on tenant operational data.
 *  - Business Admin: full tenant access.
 *  - Marketing Manager: manage campaigns / templates / contacts / segments /
 *    automations; view analytics & reports.
 *  - Viewer / Analyst: view + export only on reports & analytics.
 *  - Individual: manage own workspace modules within plan limits.
 */

export {
  ACTIONS,
  PERMISSIONS,
  SUPPORT_OVERRIDE,
  can,
  canView,
  canCreate,
  canEdit,
  canDelete,
  canExport,
  canImport,
  canApprove,
  canManage,
  canBroadcast,
  canUse,
  hasModuleAccess,
  isReadOnly,
} from '../config/permissions.js';
