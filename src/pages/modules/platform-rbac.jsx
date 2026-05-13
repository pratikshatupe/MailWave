/**
 * platform-rbac.jsx
 *
 * Super Admin only. Surfaces two distinct sections:
 *  1. The global RBAC matrix for tenant-facing roles — Business Admin,
 *     Marketing Manager, Viewer / Analyst and Individual User. Super
 *     Admin can edit/manage these (the UI is read-only here; persistence
 *     would land in the backend RBAC table).
 *  2. A separate "Super Admin Platform Access" panel that summarises what
 *     the platform owner role can do directly. Tenant operational
 *     modules (Contacts, Campaigns, Templates, Segments, Automations)
 *     intentionally show View / Export only — Super Admin does NOT get
 *     create / edit / delete on tenant data unless SUPPORT_OVERRIDE is
 *     flipped to true in config/permissions.js.
 */

import { ShieldCheck, Lock, Eye, Settings2 } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Badge from '../../components/ui/Badge.jsx';
import {
  PERMISSIONS,
  ACTIONS,
  MODULES,
  SUPPORT_OVERRIDE,
} from '../../config/permissions.js';
import { ROLES, ROLE_LABELS } from '../../config/roles.js';
import { LABELS } from '../../config/labels.js';

const TENANT_ROLES = [
  ROLES.BUSINESS_ADMIN,
  ROLES.MARKETING_MANAGER,
  ROLES.VIEWER,
  ROLES.INDIVIDUAL,
];

const MATRIX_MODULES = [
  { key: MODULES.DASHBOARD, label: LABELS.dashboard },
  { key: MODULES.CAMPAIGNS, label: LABELS.campaigns },
  { key: MODULES.WHATSAPP_CAMPAIGNS, label: LABELS.whatsappCampaigns },
  { key: MODULES.TEMPLATES, label: LABELS.templates },
  { key: MODULES.CONTACTS, label: LABELS.contacts },
  { key: MODULES.SEGMENTS, label: LABELS.segments },
  { key: MODULES.AUTOMATIONS, label: LABELS.automations },
  { key: MODULES.ANALYTICS, label: LABELS.analytics },
  { key: MODULES.REPORTS, label: LABELS.reports },
  { key: MODULES.NOTIFICATIONS, label: LABELS.notifications },
  { key: MODULES.ANNOUNCEMENTS, label: LABELS.announcements },
  { key: MODULES.COUPONS, label: LABELS.coupons },
  { key: MODULES.REFERRALS, label: LABELS.referrals },
  { key: MODULES.SUBSCRIPTION, label: LABELS.subscription },
  { key: MODULES.BILLING, label: LABELS.billing },
  { key: MODULES.TEAM_MEMBERS, label: LABELS.teamMembers },
  { key: MODULES.APPROVAL_WORKFLOW, label: LABELS.approvalWorkflow },
  { key: MODULES.API_INTEGRATIONS, label: LABELS.apiIntegrations },
  { key: MODULES.TEAM_PERMISSIONS, label: LABELS.teamPermissions },
  { key: MODULES.SETTINGS, label: LABELS.settings },
];

// Plain-English summary shown in the Super Admin Platform Access panel.
// Reflects what Super Admin can actually do on each platform module; the
// "Operational Tenant Data" row covers the view-only modules in one line.
const PLATFORM_ACCESS_ROWS = [
  { key: MODULES.TENANTS, label: LABELS.tenants, summary: 'Full' },
  { key: MODULES.USERS, label: LABELS.users, summary: 'Full' },
  { key: MODULES.PLANS, label: LABELS.plans, summary: 'Full' },
  { key: MODULES.SUBSCRIPTIONS, label: LABELS.subscriptions, summary: 'Manage' },
  { key: MODULES.PAYMENTS, label: LABELS.payments, summary: 'View, Export' },
  { key: MODULES.BILLING, label: LABELS.billing, summary: 'View, Export' },
  { key: MODULES.ANNOUNCEMENTS, label: LABELS.announcements, summary: 'Full' },
  { key: MODULES.COUPONS, label: LABELS.coupons, summary: 'Full' },
  { key: MODULES.NOTIFICATIONS, label: LABELS.notifications, summary: 'View, Broadcast, Manage' },
  { key: MODULES.AUDIT_LOGS, label: LABELS.auditLogs, summary: 'View, Export' },
  { key: MODULES.PLATFORM_RBAC, label: LABELS.platformRbac, summary: 'Manage' },
  { key: 'operational', label: 'Operational Tenant Data', summary: 'View / Export only' },
];

function ActionPill({ action }) {
  return (
    <span className="rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
      {action}
    </span>
  );
}

function PermissionCell({ role, moduleKey }) {
  const allowed = PERMISSIONS[role]?.[moduleKey] || [];
  if (allowed.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
        <Lock className="h-3 w-3" /> No access
      </span>
    );
  }
  // View + Export only → label as read-only so reviewers can scan quickly.
  const readOnly = allowed.every(
    (a) => a === ACTIONS.VIEW || a === ACTIONS.EXPORT
  );
  if (readOnly) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
        <Eye className="h-3 w-3" /> {allowed.join(', ')}
      </span>
    );
  }
  return (
    <div className="flex flex-wrap justify-center gap-1">
      {allowed.map((a) => (
        <ActionPill key={a} action={a} />
      ))}
    </div>
  );
}

export default function PlatformRbac() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform RBAC"
        description="Global permission matrix for every tenant-facing role on the platform. Edit here to change what Business Admins, Marketing Managers, Viewers and Individuals can do across the product."
        icon={ShieldCheck}
        eyebrow="Platform owner"
      />

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
        <Badge tone="amber" className="mr-2">Heads up</Badge>
        Super Admin manages global permission rules. By default Super Admin
        is view-only on tenant operational data (Contacts, Campaigns,
        Templates, Segments, Automations).{' '}
        {SUPPORT_OVERRIDE ? (
          <strong>SUPPORT_OVERRIDE is currently on.</strong>
        ) : (
          <span>
            Flip <code className="rounded bg-amber-200/60 px-1 py-0.5 text-[11px] font-mono dark:bg-amber-500/20">SUPPORT_OVERRIDE</code>{' '}
            in <code className="rounded bg-amber-200/60 px-1 py-0.5 text-[11px] font-mono dark:bg-amber-500/20">config/permissions.js</code>{' '}
            to true for support sessions that need to edit tenant data.
          </span>
        )}
      </div>

      {/* --- Section 1: Global role matrix (NOT Super Admin) --- */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Global role matrix</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Edit what Business Admin, Marketing Manager, Viewer / Analyst and
              Individual User can do. Super Admin's own access is shown separately below.
            </p>
          </div>
          <Badge tone="indigo">{TENANT_ROLES.length} roles</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3">Module</th>
                {TENANT_ROLES.map((r) => (
                  <th key={r} className="px-5 py-3 text-center">
                    {ROLE_LABELS[r]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {MATRIX_MODULES.map((mod) => (
                <tr key={mod.key} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">
                    {mod.label}
                  </td>
                  {TENANT_ROLES.map((r) => (
                    <td key={r} className="px-5 py-3 text-center">
                      <PermissionCell role={r} moduleKey={mod.key} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* --- Section 2: Super Admin's own platform access --- */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="inline-grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-fuchsia-500 text-white">
              <Settings2 className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Super Admin Platform Access</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Platform owner permissions. Operational tenant data is intentionally view / export only.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3">Area</th>
                <th className="px-5 py-3">Super Admin access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {PLATFORM_ACCESS_ROWS.map((row) => {
                const isOperational = row.key === 'operational';
                return (
                  <tr key={row.key} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">
                      {row.label}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={isOperational ? 'amber' : 'emerald'}>
                        {row.summary}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
