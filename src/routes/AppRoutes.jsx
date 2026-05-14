import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from '../pages/LandingPage.jsx';
import Login from '../pages/auth/Login.jsx';
import Register from '../pages/auth/Register.jsx';
import OAuthCallback from '../pages/auth/OAuthCallback.jsx';
import SocialComplete from '../pages/auth/SocialComplete.jsx';
import VerifyMobileOtp from '../pages/auth/VerifyMobileOtp.jsx';

import ProtectedRoute from './ProtectedRoute.jsx';
import ModuleRoute from './ModuleRoute.jsx';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';

import Dashboard from '../pages/dashboard/Dashboard.jsx';
import Campaigns from '../pages/modules/Campaigns.jsx';
import WhatsappCampaigns from '../pages/modules/WhatsappCampaigns.jsx';
import Templates from '../pages/modules/Templates.jsx';
import Contacts from '../pages/modules/Contacts.jsx';
import ContactDetails from '../pages/modules/contact-details.jsx';
import ContactImport from '../pages/modules/contact-import.jsx';
import ContactSegments from '../pages/modules/contact-segments.jsx';
import ContactTags from '../pages/modules/contact-tags.jsx';
import UnsubscribedContacts from '../pages/modules/unsubscribed-contacts.jsx';
import Segments from '../pages/modules/Segments.jsx';
import Automations from '../pages/modules/Automations.jsx';
import Analytics from '../pages/modules/Analytics.jsx';
import Reports from '../pages/modules/Reports.jsx';
import Notifications from '../pages/modules/Notifications.jsx';
import Announcements from '../pages/modules/Announcements.jsx';
import Coupons from '../pages/modules/Coupons.jsx';
import Referrals from '../pages/modules/Referrals.jsx';
import Subscription from '../pages/modules/Subscription.jsx';
import Billing from '../pages/modules/Billing.jsx';
import ApiIntegrations from '../pages/modules/ApiIntegrations.jsx';
import AuditLogs from '../pages/modules/AuditLogs.jsx';
import RolePermissions from '../pages/modules/RolePermissions.jsx';
import PlatformRbac from '../pages/modules/platform-rbac.jsx';
import TeamPermissions from '../pages/modules/team-permissions.jsx';
import TeamMembers from '../pages/modules/TeamMembers.jsx';
import ApprovalWorkflow from '../pages/modules/ApprovalWorkflow.jsx';
import Plans from '../pages/modules/Plans.jsx';
import Tenants from '../pages/modules/Tenants.jsx';
import Users from '../pages/modules/Users.jsx';
import Subscriptions from '../pages/modules/Subscriptions.jsx';
import Payments from '../pages/modules/Payments.jsx';

import Profile from '../pages/settings/Profile.jsx';
import ChangePassword from '../pages/settings/ChangePassword.jsx';
import Settings from '../pages/settings/Settings.jsx';

import AccessDenied from '../pages/errors/AccessDenied.jsx';
import NotFound from '../pages/errors/NotFound.jsx';

import { MODULE_KEYS } from '../config/modules.js';
import { ROUTES } from '../config/routes.js';

/**
 * Build the path segment used under /app from a full route string.
 * Example: "/app/campaigns" -> "campaigns".
 */
const seg = (route) => route.replace(/^\/app\//, '');

export default function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.landing} element={<LandingPage />} />
      <Route path={ROUTES.login} element={<Login />} />
      <Route path={ROUTES.register} element={<Register />} />

      <Route path={ROUTES.oauthGoogleCallback} element={<OAuthCallback />} />
      <Route path={ROUTES.oauthFacebookCallback} element={<OAuthCallback />} />
      <Route path={ROUTES.oauthCallback} element={<OAuthCallback />} />
      <Route path={ROUTES.oauthCallbackLegacy} element={<OAuthCallback />} />
      <Route path="/auth/:provider/callback" element={<OAuthCallback />} />

      <Route path={ROUTES.socialComplete} element={<SocialComplete />} />
      <Route path={ROUTES.verifyMobileOtp} element={<VerifyMobileOtp />} />
      <Route path={ROUTES.registerAccountType} element={<Register />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={seg(ROUTES.dashboard)} replace />} />

        <Route path={seg(ROUTES.dashboard)} element={<Dashboard />} />

        <Route
          path={seg(ROUTES.campaigns)}
          element={<ModuleRoute module={MODULE_KEYS.CAMPAIGNS}><Campaigns /></ModuleRoute>}
        />
        <Route
          path={seg(ROUTES.whatsappCampaigns)}
          element={<ModuleRoute module={MODULE_KEYS.WHATSAPP_CAMPAIGNS}><WhatsappCampaigns /></ModuleRoute>}
        />
        <Route
          path={seg(ROUTES.templates)}
          element={<ModuleRoute module={MODULE_KEYS.TEMPLATES}><Templates /></ModuleRoute>}
        />
        <Route
          path={seg(ROUTES.contacts)}
          element={<ModuleRoute module={MODULE_KEYS.CONTACTS}><Contacts /></ModuleRoute>}
        />
        <Route
          path={`${seg(ROUTES.contacts)}/import`}
          element={<ModuleRoute module={MODULE_KEYS.CONTACTS}><ContactImport /></ModuleRoute>}
        />
        <Route
          path={`${seg(ROUTES.contacts)}/segments`}
          element={<ModuleRoute module={MODULE_KEYS.CONTACTS}><ContactSegments /></ModuleRoute>}
        />
        <Route
          path={`${seg(ROUTES.contacts)}/tags`}
          element={<ModuleRoute module={MODULE_KEYS.CONTACTS}><ContactTags /></ModuleRoute>}
        />
        <Route
          path={`${seg(ROUTES.contacts)}/unsubscribed`}
          element={<ModuleRoute module={MODULE_KEYS.CONTACTS}><UnsubscribedContacts /></ModuleRoute>}
        />
        <Route
          path={`${seg(ROUTES.contacts)}/:id`}
          element={<ModuleRoute module={MODULE_KEYS.CONTACTS}><ContactDetails /></ModuleRoute>}
        />
        <Route
          path={seg(ROUTES.segments)}
          element={<ModuleRoute module={MODULE_KEYS.SEGMENTS}><Segments /></ModuleRoute>}
        />
        <Route
          path={seg(ROUTES.automations)}
          element={<ModuleRoute module={MODULE_KEYS.AUTOMATIONS}><Automations /></ModuleRoute>}
        />
        <Route
          path={seg(ROUTES.analytics)}
          element={<ModuleRoute module={MODULE_KEYS.ANALYTICS}><Analytics /></ModuleRoute>}
        />
        <Route
          path={seg(ROUTES.reports)}
          element={<ModuleRoute module={MODULE_KEYS.REPORTS}><Reports /></ModuleRoute>}
        />
        <Route
          path={seg(ROUTES.notifications)}
          element={<ModuleRoute module={MODULE_KEYS.NOTIFICATIONS}><Notifications /></ModuleRoute>}
        />
        <Route
          path={seg(ROUTES.announcements)}
          element={<ModuleRoute module={MODULE_KEYS.ANNOUNCEMENTS}><Announcements /></ModuleRoute>}
        />
        <Route
          path={seg(ROUTES.coupons)}
          element={<ModuleRoute module={MODULE_KEYS.COUPONS}><Coupons /></ModuleRoute>}
        />
        <Route
          path={seg(ROUTES.referrals)}
          element={<ModuleRoute module={MODULE_KEYS.REFERRALS}><Referrals /></ModuleRoute>}
        />
        <Route
          path={seg(ROUTES.subscription)}
          element={<ModuleRoute module={MODULE_KEYS.SUBSCRIPTION}><Subscription /></ModuleRoute>}
        />
        <Route
          path={seg(ROUTES.billing)}
          element={<ModuleRoute module={MODULE_KEYS.BILLING}><Billing /></ModuleRoute>}
        />
        <Route
          path={seg(ROUTES.apiIntegrations)}
          element={<ModuleRoute module={MODULE_KEYS.API_INTEGRATIONS}><ApiIntegrations /></ModuleRoute>}
        />
        <Route
          path={seg(ROUTES.auditLogs)}
          element={<ModuleRoute module={MODULE_KEYS.AUDIT_LOGS}><AuditLogs /></ModuleRoute>}
        />
        <Route
          path={seg(ROUTES.platformRbac)}
          element={<ModuleRoute module={MODULE_KEYS.PLATFORM_RBAC}><PlatformRbac /></ModuleRoute>}
        />
        <Route
          path={seg(ROUTES.teamPermissions)}
          element={<ModuleRoute module={MODULE_KEYS.TEAM_PERMISSIONS}><TeamPermissions /></ModuleRoute>}
        />
        <Route
          path={seg(ROUTES.rolePermissions)}
          element={<RolePermissions />}
        />
        <Route
          path={seg(ROUTES.teamMembers)}
          element={<ModuleRoute module={MODULE_KEYS.TEAM_MEMBERS}><TeamMembers /></ModuleRoute>}
        />
        <Route
          path={seg(ROUTES.approvalWorkflow)}
          element={<ModuleRoute module={MODULE_KEYS.APPROVAL_WORKFLOW}><ApprovalWorkflow /></ModuleRoute>}
        />
        <Route
          path={seg(ROUTES.plans)}
          element={<ModuleRoute module={MODULE_KEYS.PLANS}><Plans /></ModuleRoute>}
        />
        <Route
          path={seg(ROUTES.tenants)}
          element={<ModuleRoute module={MODULE_KEYS.TENANTS}><Tenants /></ModuleRoute>}
        />
        <Route
          path={seg(ROUTES.users)}
          element={<ModuleRoute module={MODULE_KEYS.USERS}><Users /></ModuleRoute>}
        />
        <Route
          path={seg(ROUTES.subscriptions)}
          element={<ModuleRoute module={MODULE_KEYS.SUBSCRIPTIONS}><Subscriptions /></ModuleRoute>}
        />
        <Route
          path={seg(ROUTES.payments)}
          element={<ModuleRoute module={MODULE_KEYS.PAYMENTS}><Payments /></ModuleRoute>}
        />
        <Route
          path={seg(ROUTES.settings)}
          element={<ModuleRoute module={MODULE_KEYS.SETTINGS}><Settings /></ModuleRoute>}
        />

        <Route path={seg(ROUTES.profile)} element={<Profile />} />
        <Route path={seg(ROUTES.changePassword)} element={<ChangePassword />} />
        <Route path={seg(ROUTES.accessDenied)} element={<AccessDenied />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Legacy /dashboard path keeps working for anyone who has it bookmarked. */}
      <Route path={ROUTES.legacyDashboard} element={<Navigate to={ROUTES.dashboard} replace />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
