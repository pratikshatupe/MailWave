/**
 * team-permissions.jsx
 *
 * Business Admin only. Shows the tenant-level role matrix the workspace
 * owner controls — Business Admin themselves (read-only summary),
 * Marketing Manager and Viewer / Analyst.
 *
 * The list of modules a Business Admin can configure is intentionally
 * narrower than Platform RBAC: platform-only concerns (Plans, global
 * Subscriptions, global Payments / Coupons / Announcements, Audit Logs
 * outside the tenant, Platform RBAC, Super Admin) are hidden — those
 * remain Super Admin's responsibility.
 */

import { useState } from 'react';
import { ShieldCheck, Lock, Check, Save, RotateCcw } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Toast from '../../components/ui/Toast.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { PERMISSIONS, ACTIONS, MODULES } from '../../config/permissions.js';
import { ROLES, ROLE_LABELS } from '../../config/roles.js';
import { LABELS } from '../../config/labels.js';

const EDITABLE_ROLES = [ROLES.MARKETING_MANAGER, ROLES.VIEWER];

// Modules a Business Admin is allowed to configure for their team. The
// platform-only concerns (Plans, global Coupons, Audit Logs, etc.) are
// intentionally excluded — they remain on the Platform RBAC page.
const CONFIGURABLE_MODULES = [
  { key: MODULES.CAMPAIGNS, label: LABELS.campaigns },
  { key: MODULES.WHATSAPP_CAMPAIGNS, label: LABELS.whatsappCampaigns },
  { key: MODULES.TEMPLATES, label: LABELS.templates },
  { key: MODULES.CONTACTS, label: LABELS.contacts },
  { key: MODULES.SEGMENTS, label: LABELS.segments },
  { key: MODULES.AUTOMATIONS, label: LABELS.automations },
  { key: MODULES.ANALYTICS, label: LABELS.analytics },
  { key: MODULES.REPORTS, label: LABELS.reports },
  { key: MODULES.NOTIFICATIONS, label: LABELS.notifications },
  { key: MODULES.APPROVAL_WORKFLOW, label: LABELS.approvalWorkflow },
  { key: MODULES.API_INTEGRATIONS, label: LABELS.apiIntegrations },
];

const ACTION_COLUMNS = [
  ACTIONS.VIEW,
  ACTIONS.CREATE,
  ACTIONS.EDIT,
  ACTIONS.DELETE,
  ACTIONS.IMPORT,
  ACTIONS.EXPORT,
  ACTIONS.APPROVE,
  ACTIONS.MANAGE,
];

function actionLabel(a) {
  return a[0].toUpperCase() + a.slice(1);
}

function PermissionPill({ allowed }) {
  if (allowed.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
        <Lock className="h-3 w-3" /> No access
      </span>
    );
  }
  return (
    <div className="flex flex-wrap gap-1">
      {allowed.map((a) => (
        <span
          key={a}
          className="rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
        >
          {a}
        </span>
      ))}
    </div>
  );
}

/**
 * Build the initial editable state from the canonical matrix in
 * permissions.js. We work on a local copy — saving would persist this
 * back through a service layer in production. For the local demo we
 * just show a toast and let the user reset.
 */
function buildInitialState() {
  const state = {};
  for (const role of EDITABLE_ROLES) {
    state[role] = {};
    for (const mod of CONFIGURABLE_MODULES) {
      const allowed = new Set(PERMISSIONS[role]?.[mod.key] || []);
      state[role][mod.key] = allowed;
    }
  }
  return state;
}

function cloneState(state) {
  const copy = {};
  for (const role of Object.keys(state)) {
    copy[role] = {};
    for (const mod of Object.keys(state[role])) {
      copy[role][mod] = new Set(state[role][mod]);
    }
  }
  return copy;
}

export default function TeamPermissions() {
  const { user } = useAuth();
  const tenantLabel =
    user?.tenantId && user.tenantId !== 'platform'
      ? `Tenant ${user.tenantId}`
      : 'Your tenant';

  const [matrix, setMatrix] = useState(buildInitialState);
  const [toast, setToast] = useState(null);

  function toggle(role, moduleKey, action) {
    setMatrix((prev) => {
      const next = cloneState(prev);
      const set = next[role][moduleKey];
      if (set.has(action)) {
        set.delete(action);
      } else {
        set.add(action);
        // Granting any action implies view. Keeps the matrix internally
        // consistent without forcing the admin to also tick View.
        set.add(ACTIONS.VIEW);
      }
      return next;
    });
  }

  function showToast(type, message) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 2400);
  }

  function handleSave() {
    // Local-only persistence boundary — a real backend would PATCH the
    // tenant RBAC table here. Surfaces a clear success message so the
    // admin knows the click worked.
    showToast('success', 'Team permissions saved.');
  }

  function handleReset() {
    setMatrix(buildInitialState());
    showToast('success', 'Reverted to defaults.');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Permissions"
        description={`Decide what your team can do inside ${tenantLabel}. Only roles inside your organisation are listed — platform-level rules stay with Super Admin.`}
        icon={ShieldCheck}
        eyebrow="Tenant admin"
        actions={
          <>
            <Button variant="ghost" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4" /> Save changes
            </Button>
          </>
        }
      />

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* --- Business Admin self summary (read-only for context) --- */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Your access (Business Admin)</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              You own this workspace. These permissions are managed by Super Admin on the Platform RBAC page.
            </p>
          </div>
          <Badge tone="indigo">Read-only summary</Badge>
        </div>
        <div className="matrix-table-shell">
          <table className="matrix-table">
            <thead>
              <tr>
                <th>Module</th>
                <th>Allowed actions</th>
              </tr>
            </thead>
            <tbody>
              {CONFIGURABLE_MODULES.map((mod) => (
                <tr key={mod.key}>
                  <td>{mod.label}</td>
                  <td>
                    <PermissionPill
                      allowed={PERMISSIONS[ROLES.BUSINESS_ADMIN]?.[mod.key] || []}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* --- Editable matrix for Marketing Manager & Viewer --- */}
      {EDITABLE_ROLES.map((role) => (
        <section
          key={role}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {ROLE_LABELS[role]}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Toggle which actions members of this role can perform inside your tenant.
              </p>
            </div>
            <Badge tone="indigo">{CONFIGURABLE_MODULES.length} modules</Badge>
          </div>
          <div className="matrix-table-shell">
            <table className="matrix-table">
              <thead>
                <tr>
                  <th>Module</th>
                  {ACTION_COLUMNS.map((a) => (
                    <th key={a} className="text-center">
                      {actionLabel(a)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CONFIGURABLE_MODULES.map((mod) => (
                  <tr key={mod.key}>
                    <td>{mod.label}</td>
                    {ACTION_COLUMNS.map((a) => {
                      const checked = matrix[role][mod.key].has(a);
                      return (
                        <td key={a} className="text-center">
                          <button
                            type="button"
                            onClick={() => toggle(role, mod.key, a)}
                            aria-pressed={checked}
                            className={`inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border transition ${
                              checked
                                ? 'border-indigo-300 bg-indigo-500 text-white shadow-glow dark:border-indigo-500/60'
                                : 'border-slate-300 bg-white text-transparent hover:border-indigo-300 hover:text-indigo-400 dark:border-slate-700 dark:bg-slate-900'
                            }`}
                            title={`${checked ? 'Disable' : 'Enable'} ${a}`}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        Changes here apply only to your tenant. Platform-level rules
        (Plans, Audit Logs, global Coupons / Announcements, Platform RBAC,
        Super Admin) remain managed by the platform owner.
      </div>
    </div>
  );
}
