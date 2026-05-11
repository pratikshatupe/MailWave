import { Workflow, Play, Pause, AlertCircle } from 'lucide-react';

const automations = [
  {
    name: 'Welcome series',
    contacts: 4820,
    status: 'Running',
    Icon: Play,
    tone: 'from-emerald-500 to-teal-500',
    statusTone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  },
  {
    name: 'Cart abandonment',
    contacts: 1290,
    status: 'Running',
    Icon: Play,
    tone: 'from-fuchsia-500 to-pink-500',
    statusTone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  },
  {
    name: 'Re-engagement',
    contacts: 612,
    status: 'Paused',
    Icon: Pause,
    tone: 'from-amber-500 to-orange-500',
    statusTone: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  },
  {
    name: 'Post-purchase nurture',
    contacts: 0,
    status: 'Draft',
    Icon: AlertCircle,
    tone: 'from-slate-500 to-slate-700',
    statusTone: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  },
];

export default function AutomationStatus() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
            <Workflow className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Automations
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Live status</p>
          </div>
        </div>
        <button className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
          Manage
        </button>
      </div>

      <ul className="mt-5 space-y-3">
        {automations.map((a) => (
          <li
            key={a.name}
            className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40"
          >
            <div className="flex items-center gap-3">
              <span
                className={`grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br ${a.tone} text-white`}
              >
                <a.Icon className="h-4 w-4" />
              </span>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {a.name}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {a.contacts.toLocaleString()} contacts in flow
                </div>
              </div>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${a.statusTone}`}
            >
              {a.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
