/**
 * contact-activity-timeline.jsx
 *
 * Vertical timeline of activity events for a single contact. Icons and
 * tone are derived from the activity type so each event reads at a glance.
 */

import {
  UserPlus,
  Upload,
  Tag as TagIcon,
  Send,
  MailOpen,
  MousePointerClick,
  AlertTriangle,
  UserMinus,
  MessageCircle,
  Eye,
  Reply,
  Activity,
} from 'lucide-react';
import { ACTIVITY_TYPES, ACTIVITY_LABELS } from '../../config/contact-fields.js';

const ICONS = {
  [ACTIVITY_TYPES.CONTACT_CREATED]: { Icon: UserPlus, tone: 'emerald' },
  [ACTIVITY_TYPES.CONTACT_IMPORTED]: { Icon: Upload, tone: 'indigo' },
  [ACTIVITY_TYPES.TAG_ADDED]: { Icon: TagIcon, tone: 'fuchsia' },
  [ACTIVITY_TYPES.CAMPAIGN_SENT]: { Icon: Send, tone: 'cyan' },
  [ACTIVITY_TYPES.EMAIL_OPENED]: { Icon: MailOpen, tone: 'indigo' },
  [ACTIVITY_TYPES.EMAIL_CLICKED]: { Icon: MousePointerClick, tone: 'fuchsia' },
  [ACTIVITY_TYPES.EMAIL_BOUNCED]: { Icon: AlertTriangle, tone: 'amber' },
  [ACTIVITY_TYPES.UNSUBSCRIBED]: { Icon: UserMinus, tone: 'rose' },
  [ACTIVITY_TYPES.WHATSAPP_DELIVERED]: { Icon: MessageCircle, tone: 'emerald' },
  [ACTIVITY_TYPES.WHATSAPP_READ]: { Icon: Eye, tone: 'cyan' },
  [ACTIVITY_TYPES.WHATSAPP_REPLIED]: { Icon: Reply, tone: 'fuchsia' },
};

const TONE_CLASS = {
  emerald: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
  indigo: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300',
  fuchsia: 'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300',
  cyan: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300',
  amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
  rose: 'bg-rose-500/15 text-rose-600 dark:text-rose-300',
  slate: 'bg-slate-500/15 text-slate-600 dark:text-slate-300',
};

function formatDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  let hh = d.getHours();
  const min = String(d.getMinutes()).padStart(2, '0');
  const ampm = hh >= 12 ? 'PM' : 'AM';
  hh = hh % 12 || 12;
  return `${dd}/${mm}/${yyyy}, ${String(hh).padStart(2, '0')}:${min} ${ampm}`;
}

export default function ContactActivityTimeline({ activities = [] }) {
  if (activities.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
        No activity yet for this contact.
      </div>
    );
  }

  return (
    <ol className="relative space-y-4 border-l border-slate-200 pl-6 dark:border-slate-800">
      {activities.map((event) => {
        const meta = ICONS[event.type] || { Icon: Activity, tone: 'slate' };
        const { Icon, tone } = meta;
        return (
          <li key={event.id} className="relative">
            <span
              className={`absolute -left-[34px] flex h-8 w-8 items-center justify-center rounded-full ${TONE_CLASS[tone]} ring-2 ring-white dark:ring-slate-900`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {ACTIVITY_LABELS[event.type] || event.type}
                </h4>
                <time className="text-xs text-slate-500 dark:text-slate-400">
                  {formatDateTime(event.occurredAt)}
                </time>
              </div>
              {event.description && (
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  {event.description}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
