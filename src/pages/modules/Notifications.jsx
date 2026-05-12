import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { iconFor, useNotifications } from '../../context/NotificationContext.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';

const TONE_BG = {
  indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
  fuchsia: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/20 dark:text-fuchsia-300',
  cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300',
};

export default function Notifications() {
  const { items, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={`You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}.`}
        icon={Bell}
        actions={
          <>
            <Button variant="ghost" onClick={markAllAsRead} disabled={unreadCount === 0}>
              <CheckCheck className="h-4 w-4" /> Mark all read
            </Button>
            <Button variant="danger" onClick={clearAll} disabled={items.length === 0}>
              <Trash2 className="h-4 w-4" /> Clear all
            </Button>
          </>
        }
      />

      {items.length === 0 ? (
        <EmptyState icon={Bell} title="You’re all caught up" description="No notifications to show right now." />
      ) : (
        <ul className="space-y-2">
          {items.map((n) => {
            const Icon = iconFor(n.iconKey);
            const tone = TONE_BG[n.tone] || TONE_BG.indigo;
            return (
              <li
                key={n.id}
                className={`flex items-start gap-4 rounded-2xl border bg-white px-4 py-3 shadow-soft transition dark:bg-slate-900 ${
                  n.read
                    ? 'border-slate-200 opacity-75 dark:border-slate-800'
                    : 'border-indigo-200 dark:border-indigo-500/30'
                }`}
              >
                <span className={`mt-0.5 grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl ${tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{n.title}</div>
                  <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{n.meta}</div>
                </div>
                {!n.read && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="rounded-md px-2 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-500/10"
                  >
                    Mark read
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
