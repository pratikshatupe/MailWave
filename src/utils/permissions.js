/**
 * utils/permissions.js
 *
 * Thin façade over config/permissions.js. Components import from here so
 * `import { canEdit } from '../utils/permissions.js'` reads naturally.
 *
 * Wired rules:
 *  - Super Admin: full platform access.
 *  - Business Admin: full tenant access.
 *  - Marketing Manager: manage campaigns / templates / contacts / segments /
 *    automations; view analytics & reports.
 *  - Viewer / Analyst: view + export only on reports & analytics.
 *  - Individual: manage own workspace modules within plan limits.
 */

export {
  ACTIONS,
  PERMISSIONS,
  can,
  canView,
  canCreate,
  canEdit,
  canDelete,
  canExport,
  canApprove,
  canManage,
  hasModuleAccess,
  isReadOnly,
} from '../config/permissions.js';
