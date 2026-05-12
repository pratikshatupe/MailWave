/**
 * roles.js
 *
 * Central role configuration for Mailwave. Each role declares everything
 * the app needs to render it: display name, description, dashboard route,
 * permissions tier, allowed modules, default avatar initials and badge colour.
 */

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  BUSINESS_ADMIN: 'business_admin',
  MARKETING_MANAGER: 'marketing_manager',
  VIEWER: 'viewer',
  INDIVIDUAL: 'individual',
};

export const ROLE_LIST = [
  ROLES.SUPER_ADMIN,
  ROLES.BUSINESS_ADMIN,
  ROLES.MARKETING_MANAGER,
  ROLES.VIEWER,
  ROLES.INDIVIDUAL,
];

/**
 * Full role configuration. Use this rather than scattering role strings.
 * - permissions: a tier hint (full / tenant / marketing / readonly / self)
 * - allowedModules: module keys this role can see (full list at runtime is
 *   derived from permissions.js — this field documents intent).
 */
export const ROLE_CONFIG = {
  [ROLES.SUPER_ADMIN]: {
    roleKey: ROLES.SUPER_ADMIN,
    displayName: 'Super Admin',
    description: 'Full platform access across all tenants and modules.',
    dashboardRoute: '/app/dashboard',
    permissions: 'full',
    allowedModules: 'all',
    defaultAvatarInitials: 'SA',
    badgeColour: 'rose-fuchsia',
    badgeClassName:
      'bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white border-transparent',
  },
  [ROLES.BUSINESS_ADMIN]: {
    roleKey: ROLES.BUSINESS_ADMIN,
    displayName: 'Business Admin',
    description: 'Full access within their tenant / organisation.',
    dashboardRoute: '/app/dashboard',
    permissions: 'tenant',
    allowedModules: 'tenant-scope',
    defaultAvatarInitials: 'BA',
    badgeColour: 'indigo-violet',
    badgeClassName:
      'bg-gradient-to-r from-indigo-500 to-violet-500 text-white border-transparent',
  },
  [ROLES.MARKETING_MANAGER]: {
    roleKey: ROLES.MARKETING_MANAGER,
    displayName: 'Marketing Manager',
    description:
      'Manages campaigns, templates, contacts, segments and automations. Views analytics.',
    dashboardRoute: '/app/dashboard',
    permissions: 'marketing',
    allowedModules: 'marketing-scope',
    defaultAvatarInitials: 'MM',
    badgeColour: 'blue-cyan',
    badgeClassName:
      'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-transparent',
  },
  [ROLES.VIEWER]: {
    roleKey: ROLES.VIEWER,
    displayName: 'Viewer / Analyst',
    description: 'Read-only access to reports and analytics. Can export.',
    dashboardRoute: '/app/dashboard',
    permissions: 'readonly',
    allowedModules: 'readonly-scope',
    defaultAvatarInitials: 'VA',
    badgeColour: 'slate',
    badgeClassName:
      'bg-gradient-to-r from-slate-500 to-slate-600 text-white border-transparent',
  },
  [ROLES.INDIVIDUAL]: {
    roleKey: ROLES.INDIVIDUAL,
    displayName: 'Individual User',
    description: 'Manages own workspace within subscription limits.',
    dashboardRoute: '/app/dashboard',
    permissions: 'self',
    allowedModules: 'self-scope',
    defaultAvatarInitials: 'IU',
    badgeColour: 'emerald-teal',
    badgeClassName:
      'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-transparent',
  },
};

/* ---------------- Legacy / convenience exports (kept stable) ---------------- */

export const ROLE_LABELS = ROLE_LIST.reduce((acc, key) => {
  acc[key] = ROLE_CONFIG[key].displayName;
  return acc;
}, {});

export const ROLE_BADGES = ROLE_LIST.reduce((acc, key) => {
  const cfg = ROLE_CONFIG[key];
  acc[key] = { label: cfg.displayName, className: cfg.badgeClassName };
  return acc;
}, {});

export function getRoleLabel(role) {
  return ROLE_CONFIG[role]?.displayName || 'User';
}

export function getRoleConfig(role) {
  return ROLE_CONFIG[role] || null;
}

export function getRoleDashboardRoute(role) {
  return ROLE_CONFIG[role]?.dashboardRoute || '/app/dashboard';
}

export function getRoleInitials(role, fallback) {
  return ROLE_CONFIG[role]?.defaultAvatarInitials || fallback || 'U';
}
