/**
 * table-actions.jsx
 *
 * Central action column / card-action renderer. Every module table uses
 * this so icons, tooltips, destructive colours, role permissions and
 * confirmation requirements stay consistent across the product.
 *
 * Hooks into the permission matrix via the `permissions` prop — callers
 * derive booleans from canEdit / canDelete / canExport / canImport /
 * canApprove / canManage / canBroadcast / canUse and pass them through.
 * An action with `permissions[key] === false` is hidden entirely; pass
 * `true` (or omit) to allow.
 */

import {
  Eye,
  Pencil,
  Trash2,
  Copy,
  Download,
  Upload,
  Pause,
  Play,
  Send,
  Check,
  XCircle,
  MoreHorizontal,
  Tag as TagIcon,
  UserMinus,
  UserPlus,
  Megaphone,
  Settings as SettingsIcon,
  Ticket,
} from 'lucide-react';
import IconButton from './IconButton.jsx';

export const ACTION_DEFINITIONS = {
  view: { key: 'view', icon: Eye, tooltip: 'View', variant: 'neutral' },
  edit: { key: 'edit', icon: Pencil, tooltip: 'Edit', variant: 'neutral' },
  delete: { key: 'delete', icon: Trash2, tooltip: 'Delete', variant: 'danger', confirm: true },
  duplicate: { key: 'duplicate', icon: Copy, tooltip: 'Duplicate', variant: 'neutral' },
  export: { key: 'export', icon: Download, tooltip: 'Export', variant: 'neutral' },
  import: { key: 'import', icon: Upload, tooltip: 'Import', variant: 'neutral' },
  download: { key: 'download', icon: Download, tooltip: 'Download', variant: 'neutral' },
  pause: { key: 'pause', icon: Pause, tooltip: 'Pause', variant: 'neutral' },
  resume: { key: 'resume', icon: Play, tooltip: 'Resume', variant: 'neutral' },
  approve: { key: 'approve', icon: Check, tooltip: 'Approve', variant: 'primary' },
  reject: { key: 'reject', icon: XCircle, tooltip: 'Reject', variant: 'danger', confirm: true },
  sendNow: { key: 'sendNow', icon: Send, tooltip: 'Send Now', variant: 'primary', confirm: true },
  broadcast: { key: 'broadcast', icon: Megaphone, tooltip: 'Broadcast', variant: 'primary' },
  manage: { key: 'manage', icon: SettingsIcon, tooltip: 'Manage', variant: 'neutral' },
  use: { key: 'use', icon: Ticket, tooltip: 'Apply', variant: 'primary' },
  more: { key: 'more', icon: MoreHorizontal, tooltip: 'More', variant: 'neutral' },
  addTag: { key: 'addTag', icon: TagIcon, tooltip: 'Add Tag', variant: 'primary' },
  unsubscribe: { key: 'unsubscribe', icon: UserMinus, tooltip: 'Unsubscribe', variant: 'neutral' },
  resubscribe: { key: 'resubscribe', icon: UserPlus, tooltip: 'Resubscribe', variant: 'primary' },
};

export function actionLabelForCount(count) {
  return count > 1 ? 'Actions' : 'Action';
}

/**
 * Render a row of action buttons.
 *
 *   row         the current row data
 *   actions     ordered list of action keys (strings) — e.g. ['view','edit','delete']
 *   handlers    object of handler functions keyed by action key
 *   permissions object of booleans keyed by action key (true = allowed,
 *               false = hidden, undefined = allowed by default)
 *   size        IconButton size
 *   className   wrapper className
 */
export default function TableActions({
  row,
  actions = [],
  handlers = {},
  permissions = {},
  size = 'sm',
  className = '',
}) {
  const allowed = actions.filter((key) => {
    if (!ACTION_DEFINITIONS[key]) return false;
    if (permissions[key] === false) return false;
    if (!handlers[key]) return false;
    return true;
  });

  if (allowed.length === 0) return null;

  return (
    <div className={`app-table-actions-inner ${className}`}>
      {allowed.map((key) => {
        const def = ACTION_DEFINITIONS[key];
        return (
          <IconButton
            key={key}
            icon={def.icon}
            tooltip={def.tooltip}
            variant={def.variant}
            size={size}
            onClick={() => handlers[key]?.(row)}
          />
        );
      })}
    </div>
  );
}
