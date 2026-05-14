/**
 * campaign-action-buttons.jsx
 *
 * Row action group for a single campaign. Decides what is visible from
 * the combination of campaign status + role, using the rules in
 * config/campaign-status.js and config/permissions.js. Keeps the table
 * row and details page in sync (single source for which actions appear).
 */

import {
  Eye,
  Pencil,
  Copy,
  Send,
  CalendarClock,
  Pause,
  Play,
  Ban,
  Trash2,
  BarChart3,
  Check,
  X,
  RefreshCcw,
  ShieldCheck,
} from 'lucide-react';
import { ROLES } from '../../config/roles.js';
import { ACTIONS, can } from '../../config/permissions.js';
import { MODULE_KEYS } from '../../config/modules.js';
import {
  ACTION_KEYS,
  getStatusActions,
} from '../../config/campaign-status.js';

const ICONS = {
  [ACTION_KEYS.VIEW]: Eye,
  [ACTION_KEYS.EDIT]: Pencil,
  [ACTION_KEYS.DUPLICATE]: Copy,
  [ACTION_KEYS.SEND_NOW]: Send,
  [ACTION_KEYS.SCHEDULE]: CalendarClock,
  [ACTION_KEYS.PAUSE]: Pause,
  [ACTION_KEYS.RESUME]: Play,
  [ACTION_KEYS.CANCEL]: Ban,
  [ACTION_KEYS.DELETE]: Trash2,
  [ACTION_KEYS.ANALYTICS]: BarChart3,
  [ACTION_KEYS.APPROVE]: Check,
  [ACTION_KEYS.REJECT]: X,
  [ACTION_KEYS.RETRY]: RefreshCcw,
};

const LABELS = {
  [ACTION_KEYS.VIEW]: 'View',
  [ACTION_KEYS.EDIT]: 'Edit',
  [ACTION_KEYS.DUPLICATE]: 'Duplicate',
  [ACTION_KEYS.SEND_NOW]: 'Send Now',
  [ACTION_KEYS.SCHEDULE]: 'Schedule',
  [ACTION_KEYS.PAUSE]: 'Pause',
  [ACTION_KEYS.RESUME]: 'Resume',
  [ACTION_KEYS.CANCEL]: 'Cancel',
  [ACTION_KEYS.DELETE]: 'Delete',
  [ACTION_KEYS.ANALYTICS]: 'Analytics',
  [ACTION_KEYS.APPROVE]: 'Approve',
  [ACTION_KEYS.REJECT]: 'Reject',
  [ACTION_KEYS.RETRY]: 'Retry',
};

const COLOURS = {
  [ACTION_KEYS.VIEW]: 'hover:text-indigo-600 dark:hover:text-indigo-300',
  [ACTION_KEYS.EDIT]: 'hover:text-indigo-600 dark:hover:text-indigo-300',
  [ACTION_KEYS.DUPLICATE]: 'hover:text-indigo-600 dark:hover:text-indigo-300',
  [ACTION_KEYS.SEND_NOW]: 'hover:text-emerald-600 dark:hover:text-emerald-300',
  [ACTION_KEYS.SCHEDULE]: 'hover:text-cyan-600 dark:hover:text-cyan-300',
  [ACTION_KEYS.PAUSE]: 'hover:text-amber-600 dark:hover:text-amber-300',
  [ACTION_KEYS.RESUME]: 'hover:text-emerald-600 dark:hover:text-emerald-300',
  [ACTION_KEYS.CANCEL]: 'hover:text-rose-600 dark:hover:text-rose-300',
  [ACTION_KEYS.DELETE]: 'hover:text-rose-600 dark:hover:text-rose-300',
  [ACTION_KEYS.ANALYTICS]: 'hover:text-fuchsia-600 dark:hover:text-fuchsia-300',
  [ACTION_KEYS.APPROVE]: 'hover:text-emerald-600 dark:hover:text-emerald-300',
  [ACTION_KEYS.REJECT]: 'hover:text-rose-600 dark:hover:text-rose-300',
  [ACTION_KEYS.RETRY]: 'hover:text-amber-600 dark:hover:text-amber-300',
};

/**
 * Decide which campaign actions a given role is allowed to invoke. This
 * is layered on top of the central permissions matrix so the spec rules
 * (Super Admin = view/analytics/export only; Viewer = view/analytics
 * only; Business Admin = approve; etc.) are enforced in one place.
 */
export function actionsForRoleAndStatus(role, status, options = {}) {
  const statusActions = getStatusActions(status);
  const module = MODULE_KEYS.CAMPAIGNS;

  // Super Admin is intentionally view-only on tenant operational data
  // (campaign send / edit / delete). Spec restricts them to View, Analytics
  // and Export.
  if (role === ROLES.SUPER_ADMIN) {
    return statusActions.filter((a) =>
      a === ACTION_KEYS.VIEW || a === ACTION_KEYS.ANALYTICS
    );
  }

  // Viewer / Analyst — read-only. Export lives on the page header, so the
  // row gets View + Analytics only.
  if (role === ROLES.VIEWER) {
    return statusActions.filter((a) =>
      a === ACTION_KEYS.VIEW || a === ACTION_KEYS.ANALYTICS
    );
  }

  const allowedByMatrix = {
    [ACTION_KEYS.EDIT]: can(role, module, ACTIONS.EDIT),
    [ACTION_KEYS.DELETE]: can(role, module, ACTIONS.DELETE) || (options.canDelete ?? false),
    [ACTION_KEYS.DUPLICATE]: can(role, module, ACTIONS.CREATE),
    [ACTION_KEYS.SEND_NOW]: can(role, module, ACTIONS.CREATE),
    [ACTION_KEYS.SCHEDULE]: can(role, module, ACTIONS.CREATE),
    [ACTION_KEYS.PAUSE]: can(role, module, ACTIONS.EDIT),
    [ACTION_KEYS.RESUME]: can(role, module, ACTIONS.EDIT),
    [ACTION_KEYS.CANCEL]: can(role, module, ACTIONS.EDIT),
    [ACTION_KEYS.RETRY]: can(role, module, ACTIONS.EDIT),
    [ACTION_KEYS.APPROVE]: can(role, module, ACTIONS.APPROVE),
    [ACTION_KEYS.REJECT]: can(role, module, ACTIONS.APPROVE),
    [ACTION_KEYS.VIEW]: true,
    [ACTION_KEYS.ANALYTICS]: true,
  };

  return statusActions.filter((a) => allowedByMatrix[a] !== false);
}

export default function CampaignActionButtons({
  campaign,
  role,
  onAction,
  options = {},
  size = 'sm',
}) {
  if (!campaign) return null;
  const actions = actionsForRoleAndStatus(role, campaign.status, options);
  if (actions.length === 0) {
    return <span className="text-xs text-slate-400 dark:text-slate-500">—</span>;
  }
  const btnSize = size === 'md' ? 'h-9 w-9' : 'h-8 w-8';
  const iconSize = size === 'md' ? 'h-4 w-4' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-1">
      {actions.map((key) => {
        const Icon = ICONS[key] || ShieldCheck;
        const label = LABELS[key] || key;
        return (
          <button
            key={key}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (typeof onAction === 'function') onAction(key, campaign);
            }}
            aria-label={label}
            title={label}
            className={`inline-flex ${btnSize} cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 ${COLOURS[key] || ''}`}
          >
            <Icon className={iconSize} />
          </button>
        );
      })}
    </div>
  );
}
