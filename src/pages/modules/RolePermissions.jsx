import { ShieldCheck, Check, X } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import { PERMISSIONS, ACTIONS, MODULES } from '../../config/permissions.js';
import { ROLES, ROLE_LABELS } from '../../config/roles.js';
import Badge from '../../components/ui/Badge.jsx';

const ALL_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.BUSINESS_ADMIN,
  ROLES.MARKETING_MANAGER,
  ROLES.VIEWER,
  ROLES.INDIVIDUAL,
];

const HEADLINE_MODULES = [
  MODULES.DASHBOARD,
  MODULES.CAMPAIGNS,
  MODULES.TEMPLATES,
  MODULES.CONTACTS,
  MODULES.SEGMENTS,
  MODULES.AUTOMATIONS,
  MODULES.ANALYTICS,
  MODULES.REPORTS,
  MODULES.NOTIFICATIONS,
  MODULES.ANNOUNCEMENTS,
  MODULES.COUPONS,
  MODULES.REFERRALS,
  MODULES.SUBSCRIPTION,
  MODULES.BILLING,
  MODULES.API_INTEGRATIONS,
  MODULES.AUDIT_LOGS,
  MODULES.ROLE_PERMISSIONS,
  MODULES.TEAM_MEMBERS,
  MODULES.APPROVAL_WORKFLOW,
  MODULES.TENANTS,
  MODULES.USERS,
  MODULES.PLANS,
  MODULES.SUBSCRIPTIONS,
  MODULES.PAYMENTS,
  MODULES.SETTINGS,
];

const ACTION_KEYS = [
  ACTIONS.VIEW,
  ACTIONS.CREATE,
  ACTIONS.EDIT,
  ACTIONS.DELETE,
  ACTIONS.EXPORT,
  ACTIONS.APPROVE,
  ACTIONS.MANAGE,
];

function moduleLabel(m) {
  return m
    .split('_')
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join(' ');
}

export default function RolePermissions() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="RBAC / Role Permissions"
        description="View the permission matrix that controls who can do what across every module."
        icon={ShieldCheck}
        eyebrow="Security"
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3">Module</th>
                {ALL_ROLES.map((r) => (
                  <th key={r} className="px-5 py-3 text-center">
                    {ROLE_LABELS[r]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {HEADLINE_MODULES.map((m) => (
                <tr key={m} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">
                    {moduleLabel(m)}
                  </td>
                  {ALL_ROLES.map((r) => {
                    const allowed = PERMISSIONS[r]?.[m] || [];
                    if (allowed.length === 0) {
                      return (
                        <td key={r} className="px-5 py-3 text-center">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-300">
                            <X className="h-3.5 w-3.5" />
                          </span>
                        </td>
                      );
                    }
                    if (allowed.length === ACTION_KEYS.length) {
                      return (
                        <td key={r} className="px-5 py-3 text-center">
                          <Badge tone="emerald">
                            <Check className="h-3 w-3" /> Full
                          </Badge>
                        </td>
                      );
                    }
                    return (
                      <td key={r} className="px-5 py-3 text-center">
                        <div className="flex flex-wrap justify-center gap-1">
                          {allowed.map((a) => (
                            <span
                              key={a}
                              className="rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
