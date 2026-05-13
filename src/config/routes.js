/**
 * routes.js
 *
 * Central route map. NEVER hardcode route strings in components — import
 * from ROUTES instead so renaming any path is a single-file change.
 *
 * `app` prefix groups authenticated paths (mounted under /app in AppRoutes).
 */

export const ROUTES = {
  // Public
  landing: '/',
  login: '/login',
  register: '/register',

  // OAuth callback (public — the page itself validates the handshake and
  // only sets a session on success).
  oauthCallback: '/auth/oauth-callback',
  oauthCallbackLegacy: '/auth/callback',
  oauthGoogleCallback: '/auth/google/callback',
  oauthFacebookCallback: '/auth/facebook/callback',

  // Social signup completion + Contact Number OTP. These are public
  // intermediate routes — no JWT yet — but each step verifies the signed
  // temporary social session token before continuing.
  socialComplete: '/auth/social-complete',
  verifyMobileOtp: '/auth/verify-mobile-otp',
  registerAccountType: '/register/account-type',

  // Authenticated app shell paths (rendered under /app)
  dashboard: '/app/dashboard',
  campaigns: '/app/campaigns',
  whatsappCampaigns: '/app/whatsapp-campaigns',
  templates: '/app/templates',
  contacts: '/app/contacts',
  segments: '/app/segments',
  automations: '/app/automations',
  analytics: '/app/analytics',
  reports: '/app/reports',
  notifications: '/app/notifications',
  announcements: '/app/announcements',
  coupons: '/app/coupons',
  referrals: '/app/referrals',
  subscription: '/app/subscription',
  billing: '/app/billing',
  apiIntegrations: '/app/api-integrations',
  auditLogs: '/app/audit-logs',
  rolePermissions: '/app/role-permissions',
  platformRbac: '/app/platform-rbac',
  teamPermissions: '/app/team-permissions',
  teamMembers: '/app/team',
  approvalWorkflow: '/app/approvals',
  plans: '/app/plans',
  tenants: '/app/tenants',
  users: '/app/users',
  subscriptions: '/app/subscriptions',
  payments: '/app/payments',

  settings: '/app/settings',
  profile: '/app/profile',
  changePassword: '/app/change-password',

  accessDenied: '/app/access-denied',
  notFound: '/app/not-found',

  // Legacy redirect target
  legacyDashboard: '/dashboard',
};

/**
 * Public (no auth) routes — useful for guards.
 */
export const PUBLIC_ROUTES = [
  ROUTES.landing,
  ROUTES.login,
  ROUTES.register,
  ROUTES.oauthCallback,
  ROUTES.oauthCallbackLegacy,
  ROUTES.oauthGoogleCallback,
  ROUTES.oauthFacebookCallback,
  ROUTES.socialComplete,
  ROUTES.verifyMobileOtp,
  ROUTES.registerAccountType,
];

export default ROUTES;
