/**
 * modules.js
 *
 * Central module registry. The sidebar, route guards and the action
 * gates inside the UI are all derived from this file. Adding or removing
 * a module here is the single source of change.
 *
 * `getNavigationForRole(role)` filters the registry by view permission
 * from config/permissions.js, so the sidebar is matrix-driven and never
 * hardcoded inside sidebar.jsx.
 */

import {
  LayoutDashboard,
  Building2,
  UsersRound,
  Layers,
  CreditCard,
  Wallet,
  Mail,
  MessageSquare,
  LayoutTemplate,
  Contact,
  Filter,
  Workflow,
  BarChart3,
  FileBarChart,
  Bell,
  Megaphone,
  Ticket,
  Gift,
  Receipt,
  Plug,
  ShieldCheck,
  ScrollText,
  ClipboardCheck,
  Settings,
  User,
  KeyRound,
} from 'lucide-react';

import { ROLES } from './roles.js';
import { ROUTES } from './routes.js';
import { LABELS } from './labels.js';

export const MODULE_KEYS = {
  DASHBOARD: 'dashboard',
  TENANTS: 'tenants',
  USERS: 'users',
  PLANS: 'plans',
  SUBSCRIPTIONS: 'subscriptions',
  PAYMENTS: 'payments',
  CAMPAIGNS: 'campaigns',
  WHATSAPP_CAMPAIGNS: 'whatsapp_campaigns',
  TEMPLATES: 'templates',
  CONTACTS: 'contacts',
  SEGMENTS: 'segments',
  AUTOMATIONS: 'automations',
  ANALYTICS: 'analytics',
  REPORTS: 'reports',
  NOTIFICATIONS: 'notifications',
  ANNOUNCEMENTS: 'announcements',
  COUPONS: 'coupons',
  REFERRALS: 'referrals',
  SUBSCRIPTION: 'subscription',
  BILLING: 'billing',
  TEAM_MEMBERS: 'team_members',
  APPROVAL_WORKFLOW: 'approval_workflow',
  API_INTEGRATIONS: 'api_integrations',
  AUDIT_LOGS: 'audit_logs',
  ROLE_PERMISSIONS: 'role_permissions',
  PLATFORM_RBAC: 'platform_rbac',
  TEAM_PERMISSIONS: 'team_permissions',
  SETTINGS: 'settings',
  EMAIL_TRACKING: 'email_tracking',
  EMAIL_SENDING_ENGINE: 'email_sending_engine',
  RAZORPAY_INTEGRATION: 'razorpay_integration',
  SEVEN_DAY_FREE_TRIAL: 'seven_day_free_trial',
  PROFILE: 'profile',
  CHANGE_PASSWORD: 'change_password',
};

/**
 * Tenant-level module feature flags. Drives conditional UI such as the
 * WhatsApp section inside the Add Contact form. In a real product these
 * would come from the tenant subscription / plan add-ons; for the local
 * demo they live here so the wiring is in one place.
 */
export const MODULE_FEATURES = {
  [MODULE_KEYS.WHATSAPP_CAMPAIGNS]: true,
};

export function isModuleEnabled(moduleKey) {
  return Boolean(MODULE_FEATURES[moduleKey]);
}

export function isWhatsappCampaignsEnabled() {
  return isModuleEnabled(MODULE_KEYS.WHATSAPP_CAMPAIGNS);
}

const ALL_ROLES = Object.values(ROLES);
const BUSINESS_ROLES = [ROLES.SUPER_ADMIN, ROLES.BUSINESS_ADMIN];
const MARKETING_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.BUSINESS_ADMIN,
  ROLES.MARKETING_MANAGER,
];
const INDIVIDUAL_PLUS = [
  ROLES.SUPER_ADMIN,
  ROLES.BUSINESS_ADMIN,
  ROLES.MARKETING_MANAGER,
  ROLES.INDIVIDUAL,
];

const VIEW = 'view';
const CREATE = 'create';
const EDIT = 'edit';
const DELETE = 'delete';
const EXPORT = 'export';
const IMPORT = 'import';
const APPROVE = 'approve';
const MANAGE = 'manage';
const BROADCAST = 'broadcast';

/**
 * Module registry. Each entry documents the route, label, icon and the
 * actions the module supports. The `allowedRoles` field is informational
 * — the actual sidebar gate uses `hasModuleAccess(role, key)` from
 * permissions.js so the matrix is the single source of truth.
 *
 * The order below is the canonical sidebar order rendered to every role.
 */
export const MODULES = {
  [MODULE_KEYS.DASHBOARD]: {
    moduleKey: MODULE_KEYS.DASHBOARD,
    label: LABELS.dashboard,
    route: ROUTES.dashboard,
    icon: LayoutDashboard,
    description: 'Role-based overview of platform activity.',
    allowedRoles: ALL_ROLES,
    actions: [VIEW],
    showInSidebar: true,
  },
  [MODULE_KEYS.TENANTS]: {
    moduleKey: MODULE_KEYS.TENANTS,
    label: LABELS.tenants,
    route: ROUTES.tenants,
    icon: Building2,
    description: 'Manage tenants and customer organisations.',
    allowedRoles: [ROLES.SUPER_ADMIN],
    actions: [VIEW, CREATE, EDIT, DELETE, MANAGE],
    showInSidebar: true,
  },
  [MODULE_KEYS.USERS]: {
    moduleKey: MODULE_KEYS.USERS,
    label: LABELS.users,
    route: ROUTES.users,
    icon: UsersRound,
    description: 'Manage platform users across tenants.',
    allowedRoles: [ROLES.SUPER_ADMIN],
    actions: [VIEW, CREATE, EDIT, DELETE, MANAGE],
    showInSidebar: true,
  },
  [MODULE_KEYS.PLANS]: {
    moduleKey: MODULE_KEYS.PLANS,
    label: LABELS.plans,
    route: ROUTES.plans,
    icon: Layers,
    description: 'Manage subscription plans and pricing tiers.',
    allowedRoles: [ROLES.SUPER_ADMIN],
    actions: [VIEW, CREATE, EDIT, DELETE, MANAGE],
    showInSidebar: true,
  },
  [MODULE_KEYS.SUBSCRIPTIONS]: {
    moduleKey: MODULE_KEYS.SUBSCRIPTIONS,
    label: LABELS.subscriptions,
    route: ROUTES.subscriptions,
    icon: CreditCard,
    description: 'View all tenant subscriptions.',
    allowedRoles: [ROLES.SUPER_ADMIN],
    actions: [VIEW, EDIT, MANAGE],
    showInSidebar: true,
  },
  [MODULE_KEYS.PAYMENTS]: {
    moduleKey: MODULE_KEYS.PAYMENTS,
    label: LABELS.payments,
    route: ROUTES.payments,
    icon: Wallet,
    description: 'Payment history across the platform.',
    allowedRoles: [ROLES.SUPER_ADMIN],
    actions: [VIEW, EXPORT],
    showInSidebar: true,
  },
  [MODULE_KEYS.CAMPAIGNS]: {
    moduleKey: MODULE_KEYS.CAMPAIGNS,
    label: LABELS.campaigns,
    route: ROUTES.campaigns,
    icon: Mail,
    description: 'Create, schedule and send email campaigns.',
    allowedRoles: ALL_ROLES,
    actions: [VIEW, CREATE, EDIT, DELETE, EXPORT, APPROVE],
    showInSidebar: true,
  },
  [MODULE_KEYS.WHATSAPP_CAMPAIGNS]: {
    moduleKey: MODULE_KEYS.WHATSAPP_CAMPAIGNS,
    label: LABELS.whatsappCampaigns,
    route: ROUTES.whatsappCampaigns,
    icon: MessageSquare,
    description: 'WhatsApp broadcast campaigns and templates.',
    allowedRoles: ALL_ROLES,
    actions: [VIEW, CREATE, EDIT, DELETE, EXPORT],
    showInSidebar: true,
  },
  [MODULE_KEYS.TEMPLATES]: {
    moduleKey: MODULE_KEYS.TEMPLATES,
    label: LABELS.templates,
    route: ROUTES.templates,
    icon: LayoutTemplate,
    description: 'Reusable email templates and design library.',
    allowedRoles: INDIVIDUAL_PLUS,
    actions: [VIEW, CREATE, EDIT, DELETE],
    showInSidebar: true,
  },
  [MODULE_KEYS.CONTACTS]: {
    moduleKey: MODULE_KEYS.CONTACTS,
    label: LABELS.contacts,
    route: ROUTES.contacts,
    icon: Contact,
    description: 'Contact lists, imports and contact details.',
    allowedRoles: ALL_ROLES,
    actions: [VIEW, CREATE, EDIT, DELETE, IMPORT, EXPORT],
    showInSidebar: true,
  },
  [MODULE_KEYS.SEGMENTS]: {
    moduleKey: MODULE_KEYS.SEGMENTS,
    label: LABELS.segments,
    route: ROUTES.segments,
    icon: Filter,
    description: 'Segment contacts by behaviour and attributes.',
    allowedRoles: INDIVIDUAL_PLUS,
    actions: [VIEW, CREATE, EDIT, DELETE],
    showInSidebar: true,
  },
  [MODULE_KEYS.AUTOMATIONS]: {
    moduleKey: MODULE_KEYS.AUTOMATIONS,
    label: LABELS.automations,
    route: ROUTES.automations,
    icon: Workflow,
    description: 'Trigger-based email automation workflows.',
    allowedRoles: INDIVIDUAL_PLUS,
    actions: [VIEW, CREATE, EDIT, DELETE],
    showInSidebar: true,
  },
  [MODULE_KEYS.ANALYTICS]: {
    moduleKey: MODULE_KEYS.ANALYTICS,
    label: LABELS.analytics,
    route: ROUTES.analytics,
    icon: BarChart3,
    description: 'Open rates, click-throughs and engagement analytics.',
    allowedRoles: ALL_ROLES,
    actions: [VIEW, EXPORT],
    showInSidebar: true,
  },
  [MODULE_KEYS.REPORTS]: {
    moduleKey: MODULE_KEYS.REPORTS,
    label: LABELS.reports,
    route: ROUTES.reports,
    icon: FileBarChart,
    description: 'Downloadable performance and revenue reports.',
    allowedRoles: ALL_ROLES,
    actions: [VIEW, EXPORT],
    showInSidebar: true,
  },
  [MODULE_KEYS.NOTIFICATIONS]: {
    moduleKey: MODULE_KEYS.NOTIFICATIONS,
    label: LABELS.notifications,
    route: ROUTES.notifications,
    icon: Bell,
    description: 'System and campaign notifications.',
    allowedRoles: ALL_ROLES,
    actions: [VIEW, BROADCAST, MANAGE],
    showInSidebar: true,
  },
  [MODULE_KEYS.ANNOUNCEMENTS]: {
    moduleKey: MODULE_KEYS.ANNOUNCEMENTS,
    label: LABELS.announcements,
    route: ROUTES.announcements,
    icon: Megaphone,
    description: 'Platform-wide announcements.',
    allowedRoles: BUSINESS_ROLES,
    actions: [VIEW, CREATE, EDIT, DELETE, BROADCAST, MANAGE],
    showInSidebar: true,
  },
  [MODULE_KEYS.COUPONS]: {
    moduleKey: MODULE_KEYS.COUPONS,
    label: LABELS.coupons,
    route: ROUTES.coupons,
    icon: Ticket,
    description: 'Discount coupons and promotions.',
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.BUSINESS_ADMIN, ROLES.INDIVIDUAL],
    actions: [VIEW, CREATE, EDIT, DELETE, MANAGE],
    showInSidebar: true,
  },
  [MODULE_KEYS.REFERRALS]: {
    moduleKey: MODULE_KEYS.REFERRALS,
    label: LABELS.referrals,
    route: ROUTES.referrals,
    icon: Gift,
    description: 'Referral programme and rewards.',
    allowedRoles: INDIVIDUAL_PLUS,
    actions: [VIEW, CREATE, EDIT, DELETE, EXPORT],
    showInSidebar: true,
  },
  [MODULE_KEYS.SUBSCRIPTION]: {
    moduleKey: MODULE_KEYS.SUBSCRIPTION,
    label: LABELS.subscription,
    route: ROUTES.subscription,
    icon: CreditCard,
    description: 'Plan, usage and renewal status.',
    allowedRoles: [ROLES.BUSINESS_ADMIN, ROLES.INDIVIDUAL],
    actions: [VIEW, EDIT, MANAGE],
    showInSidebar: true,
  },
  [MODULE_KEYS.BILLING]: {
    moduleKey: MODULE_KEYS.BILLING,
    label: LABELS.billing,
    route: ROUTES.billing,
    icon: Receipt,
    description: 'Invoices, payment methods and billing history.',
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.BUSINESS_ADMIN, ROLES.INDIVIDUAL],
    actions: [VIEW, EDIT, EXPORT, MANAGE],
    showInSidebar: true,
  },
  [MODULE_KEYS.TEAM_MEMBERS]: {
    moduleKey: MODULE_KEYS.TEAM_MEMBERS,
    label: LABELS.teamMembers,
    route: ROUTES.teamMembers,
    icon: UsersRound,
    description: 'Invite, manage and revoke team members.',
    allowedRoles: [ROLES.BUSINESS_ADMIN],
    actions: [VIEW, CREATE, EDIT, DELETE, MANAGE],
    showInSidebar: true,
  },
  [MODULE_KEYS.APPROVAL_WORKFLOW]: {
    moduleKey: MODULE_KEYS.APPROVAL_WORKFLOW,
    label: LABELS.approvalWorkflow,
    route: ROUTES.approvalWorkflow,
    icon: ClipboardCheck,
    description: 'Approval workflow for campaigns before sending.',
    allowedRoles: [ROLES.BUSINESS_ADMIN],
    actions: [VIEW, CREATE, EDIT, DELETE, APPROVE, MANAGE],
    showInSidebar: true,
  },
  [MODULE_KEYS.API_INTEGRATIONS]: {
    moduleKey: MODULE_KEYS.API_INTEGRATIONS,
    label: LABELS.apiIntegrations,
    route: ROUTES.apiIntegrations,
    icon: Plug,
    description: 'Webhooks, REST keys and third-party integrations.',
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.BUSINESS_ADMIN, ROLES.INDIVIDUAL],
    actions: [VIEW, CREATE, EDIT, DELETE, MANAGE],
    showInSidebar: true,
  },
  [MODULE_KEYS.AUDIT_LOGS]: {
    moduleKey: MODULE_KEYS.AUDIT_LOGS,
    label: LABELS.auditLogs,
    route: ROUTES.auditLogs,
    icon: ScrollText,
    description: 'Immutable audit trail of platform actions.',
    allowedRoles: [ROLES.SUPER_ADMIN],
    actions: [VIEW, EXPORT],
    showInSidebar: true,
  },
  [MODULE_KEYS.PLATFORM_RBAC]: {
    moduleKey: MODULE_KEYS.PLATFORM_RBAC,
    label: LABELS.platformRbac,
    route: ROUTES.platformRbac,
    icon: ShieldCheck,
    description: 'Manage the global RBAC matrix for every role on the platform.',
    allowedRoles: [ROLES.SUPER_ADMIN],
    actions: [VIEW, EDIT, MANAGE],
    showInSidebar: true,
  },
  [MODULE_KEYS.TEAM_PERMISSIONS]: {
    moduleKey: MODULE_KEYS.TEAM_PERMISSIONS,
    label: LABELS.teamPermissions,
    route: ROUTES.teamPermissions,
    icon: ShieldCheck,
    description: 'Manage tenant team roles and module permissions inside this organisation.',
    allowedRoles: [ROLES.BUSINESS_ADMIN],
    actions: [VIEW, EDIT, MANAGE],
    showInSidebar: true,
  },
  [MODULE_KEYS.SETTINGS]: {
    moduleKey: MODULE_KEYS.SETTINGS,
    label: LABELS.settings,
    route: ROUTES.settings,
    icon: Settings,
    description: 'Workspace, branding and account settings.',
    allowedRoles: ALL_ROLES,
    actions: [VIEW, EDIT],
    showInSidebar: true,
  },
  [MODULE_KEYS.PROFILE]: {
    moduleKey: MODULE_KEYS.PROFILE,
    label: LABELS.profile,
    route: ROUTES.profile,
    icon: User,
    description: 'Your profile and personal preferences.',
    allowedRoles: ALL_ROLES,
    actions: [VIEW, EDIT],
    showInSidebar: false,
  },
  [MODULE_KEYS.CHANGE_PASSWORD]: {
    moduleKey: MODULE_KEYS.CHANGE_PASSWORD,
    label: LABELS.changePassword,
    route: ROUTES.changePassword,
    icon: KeyRound,
    description: 'Change your account password.',
    allowedRoles: ALL_ROLES,
    actions: [VIEW, EDIT],
    showInSidebar: false,
  },
};

export const MODULE_LIST = Object.values(MODULES);

/**
 * Build sidebar navigation for a given role.
 *
 * The actual matrix-driven filter lives in config/navigation.js to keep
 * modules.js free of any dependency on permissions.js (avoiding the
 * permissions <-> modules import cycle). This wrapper preserves the
 * call site `getNavigationForRole(role)` for components that already
 * import from modules.js.
 */
export function getNavigationForRole(role) {
  // Lazy import to keep this file free of permissions.js at module-load
  // time. Permissions and modules each declare their independence and
  // navigation.js wires them together.
  // eslint-disable-next-line global-require
  const { hasModuleAccess, isReadOnly } = requirePermissions();
  return MODULE_LIST.filter(
    (m) => m.showInSidebar && hasModuleAccess(role, m.moduleKey)
  ).map((m) => ({
    label: m.label,
    to: m.route,
    icon: m.icon,
    module: m.moduleKey,
    readOnly: isReadOnly(role, m.moduleKey),
  }));
}

// Synchronous lazy resolver. The permissions module is fully evaluated
// by the time the first navigation call fires (which always happens
// during a React render, well after both files have loaded).
let _permissions = null;
function requirePermissions() {
  if (_permissions) return _permissions;
  // Vite resolves this at build time; under Node ESM tests we wire it
  // through the already-evaluated module cache by going through a
  // dynamic import in setNavigationPermissions().
  _permissions = globalThis.__mailwavePermissions || null;
  if (!_permissions) {
    throw new Error(
      'Permissions module not registered yet. Call setNavigationPermissions() (or import config/navigation.js) before using getNavigationForRole.'
    );
  }
  return _permissions;
}

export function setNavigationPermissions(api) {
  _permissions = api;
  globalThis.__mailwavePermissions = api;
}

export function getModule(moduleKey) {
  return MODULES[moduleKey] || null;
}

export default MODULES;
