/**
 * modules.js
 *
 * Central module registry. The sidebar, route guards and permission system
 * are all derived from this file. Adding / removing a module here is the
 * single source of change.
 */

import {
  LayoutDashboard,
  Building2,
  UsersRound,
  Layers,
  CreditCard,
  Wallet,
  Mail,
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
  API_INTEGRATIONS: 'api_integrations',
  AUDIT_LOGS: 'audit_logs',
  ROLE_PERMISSIONS: 'role_permissions',
  SETTINGS: 'settings',
  BILLING: 'billing',
  TEAM_MEMBERS: 'team_members',
  APPROVAL_WORKFLOW: 'approval_workflow',
  EMAIL_TRACKING: 'email_tracking',
  EMAIL_SENDING_ENGINE: 'email_sending_engine',
  RAZORPAY_INTEGRATION: 'razorpay_integration',
  SEVEN_DAY_FREE_TRIAL: 'seven_day_free_trial',
  SUBSCRIPTION: 'subscription',
  PROFILE: 'profile',
  CHANGE_PASSWORD: 'change_password',
};

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
const APPROVE = 'approve';
const MANAGE = 'manage';

/**
 * Module registry. Each entry is the source of truth for sidebar visibility,
 * routing, allowed roles and available actions.
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
    isReadOnlyForViewer: true,
  },
  [MODULE_KEYS.TENANTS]: {
    moduleKey: MODULE_KEYS.TENANTS,
    label: LABELS.tenants,
    route: ROUTES.tenants,
    icon: Building2,
    description: 'Manage tenants and customer organisations.',
    allowedRoles: [ROLES.SUPER_ADMIN],
    actions: [VIEW, CREATE, EDIT, DELETE, EXPORT, MANAGE],
    showInSidebar: true,
    isReadOnlyForViewer: false,
  },
  [MODULE_KEYS.USERS]: {
    moduleKey: MODULE_KEYS.USERS,
    label: LABELS.users,
    route: ROUTES.users,
    icon: UsersRound,
    description: 'Manage platform users across tenants.',
    allowedRoles: [ROLES.SUPER_ADMIN],
    actions: [VIEW, CREATE, EDIT, DELETE, EXPORT, MANAGE],
    showInSidebar: true,
    isReadOnlyForViewer: false,
  },
  [MODULE_KEYS.PLANS]: {
    moduleKey: MODULE_KEYS.PLANS,
    label: LABELS.plans,
    route: ROUTES.plans,
    icon: Layers,
    description: 'Manage subscription plans and pricing tiers.',
    allowedRoles: [ROLES.SUPER_ADMIN],
    actions: [VIEW, CREATE, EDIT, DELETE, EXPORT, MANAGE],
    showInSidebar: true,
    isReadOnlyForViewer: false,
  },
  [MODULE_KEYS.SUBSCRIPTIONS]: {
    moduleKey: MODULE_KEYS.SUBSCRIPTIONS,
    label: LABELS.subscriptions,
    route: ROUTES.subscriptions,
    icon: CreditCard,
    description: 'View all tenant subscriptions.',
    allowedRoles: [ROLES.SUPER_ADMIN],
    actions: [VIEW, EDIT, EXPORT],
    showInSidebar: true,
    isReadOnlyForViewer: false,
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
    isReadOnlyForViewer: false,
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
    isReadOnlyForViewer: true,
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
    isReadOnlyForViewer: true,
  },
  [MODULE_KEYS.CONTACTS]: {
    moduleKey: MODULE_KEYS.CONTACTS,
    label: LABELS.contacts,
    route: ROUTES.contacts,
    icon: Contact,
    description: 'Contact lists, imports and contact details.',
    allowedRoles: ALL_ROLES,
    actions: [VIEW, CREATE, EDIT, DELETE, EXPORT],
    showInSidebar: true,
    isReadOnlyForViewer: true,
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
    isReadOnlyForViewer: false,
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
    isReadOnlyForViewer: false,
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
    isReadOnlyForViewer: true,
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
    isReadOnlyForViewer: true,
  },
  [MODULE_KEYS.NOTIFICATIONS]: {
    moduleKey: MODULE_KEYS.NOTIFICATIONS,
    label: LABELS.notifications,
    route: ROUTES.notifications,
    icon: Bell,
    description: 'System and campaign notifications.',
    allowedRoles: ALL_ROLES,
    actions: [VIEW, EDIT],
    showInSidebar: true,
    isReadOnlyForViewer: true,
  },
  [MODULE_KEYS.ANNOUNCEMENTS]: {
    moduleKey: MODULE_KEYS.ANNOUNCEMENTS,
    label: LABELS.announcements,
    route: ROUTES.announcements,
    icon: Megaphone,
    description: 'Platform-wide announcements.',
    allowedRoles: BUSINESS_ROLES,
    actions: [VIEW, CREATE, EDIT, DELETE],
    showInSidebar: true,
    isReadOnlyForViewer: false,
  },
  [MODULE_KEYS.COUPONS]: {
    moduleKey: MODULE_KEYS.COUPONS,
    label: LABELS.coupons,
    route: ROUTES.coupons,
    icon: Ticket,
    description: 'Discount coupons and promotions.',
    allowedRoles: INDIVIDUAL_PLUS,
    actions: [VIEW, CREATE, EDIT, DELETE],
    showInSidebar: true,
    isReadOnlyForViewer: false,
  },
  [MODULE_KEYS.REFERRALS]: {
    moduleKey: MODULE_KEYS.REFERRALS,
    label: LABELS.referrals,
    route: ROUTES.referrals,
    icon: Gift,
    description: 'Referral programme and rewards.',
    allowedRoles: INDIVIDUAL_PLUS,
    actions: [VIEW, CREATE, EDIT, DELETE],
    showInSidebar: true,
    isReadOnlyForViewer: false,
  },
  [MODULE_KEYS.API_INTEGRATIONS]: {
    moduleKey: MODULE_KEYS.API_INTEGRATIONS,
    label: LABELS.apiIntegrations,
    route: ROUTES.apiIntegrations,
    icon: Plug,
    description: 'Webhooks, REST keys and third-party integrations.',
    allowedRoles: INDIVIDUAL_PLUS,
    actions: [VIEW, CREATE, EDIT, DELETE],
    showInSidebar: true,
    isReadOnlyForViewer: false,
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
    isReadOnlyForViewer: false,
  },
  [MODULE_KEYS.ROLE_PERMISSIONS]: {
    moduleKey: MODULE_KEYS.ROLE_PERMISSIONS,
    label: LABELS.rolePermissions,
    route: ROUTES.rolePermissions,
    icon: ShieldCheck,
    description: 'RBAC matrix and permission management.',
    allowedRoles: [ROLES.SUPER_ADMIN],
    actions: [VIEW, EDIT],
    showInSidebar: true,
    isReadOnlyForViewer: false,
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
    isReadOnlyForViewer: true,
  },
  [MODULE_KEYS.BILLING]: {
    moduleKey: MODULE_KEYS.BILLING,
    label: LABELS.billing,
    route: ROUTES.billing,
    icon: Receipt,
    description: 'Invoices, payment methods and billing history.',
    allowedRoles: INDIVIDUAL_PLUS,
    actions: [VIEW, EXPORT, MANAGE],
    showInSidebar: true,
    isReadOnlyForViewer: false,
  },
  [MODULE_KEYS.SUBSCRIPTION]: {
    moduleKey: MODULE_KEYS.SUBSCRIPTION,
    label: LABELS.subscription,
    route: ROUTES.subscription,
    icon: CreditCard,
    description: 'Plan, usage and renewal status.',
    allowedRoles: INDIVIDUAL_PLUS,
    actions: [VIEW, EDIT, MANAGE],
    showInSidebar: true,
    isReadOnlyForViewer: false,
  },
  [MODULE_KEYS.TEAM_MEMBERS]: {
    moduleKey: MODULE_KEYS.TEAM_MEMBERS,
    label: LABELS.teamMembers,
    route: ROUTES.teamMembers,
    icon: UsersRound,
    description: 'Invite, manage and revoke team members.',
    allowedRoles: BUSINESS_ROLES,
    actions: [VIEW, CREATE, EDIT, DELETE],
    showInSidebar: true,
    isReadOnlyForViewer: false,
  },
  [MODULE_KEYS.APPROVAL_WORKFLOW]: {
    moduleKey: MODULE_KEYS.APPROVAL_WORKFLOW,
    label: LABELS.approvalWorkflow,
    route: ROUTES.approvalWorkflow,
    icon: ClipboardCheck,
    description: 'Approval workflow for campaigns before sending.',
    allowedRoles: BUSINESS_ROLES,
    actions: [VIEW, CREATE, EDIT, DELETE, APPROVE],
    showInSidebar: true,
    isReadOnlyForViewer: false,
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
    isReadOnlyForViewer: false,
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
    isReadOnlyForViewer: false,
  },
};

export const MODULE_LIST = Object.values(MODULES);

/**
 * Build sidebar navigation for a given role from the module registry.
 * Replaces the older NAVIGATION lookup table.
 */
export function getNavigationForRole(role) {
  return MODULE_LIST.filter(
    (m) => m.showInSidebar && m.allowedRoles.includes(role)
  ).map((m) => ({
    label: m.label,
    to: m.route,
    icon: m.icon,
    module: m.moduleKey,
    readOnly: m.isReadOnlyForViewer && role === ROLES.VIEWER,
  }));
}

export function getModule(moduleKey) {
  return MODULES[moduleKey] || null;
}

export default MODULES;
