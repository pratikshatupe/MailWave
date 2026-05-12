import { motion } from 'framer-motion';
import {
  Mail,
  MousePointerClick,
  TrendingUp,
  AlertTriangle,
  Activity,
  Sparkles,
} from 'lucide-react';

const stats = [
  {
    label: 'Emails Sent',
    value: '1.24M',
    change: '+12.4%',
    Icon: Mail,
    tone: 'from-indigo-500 to-blue-500',
  },
  {
    label: 'Open Rate',
    value: '48.7%',
    change: '+3.1%',
    Icon: TrendingUp,
    tone: 'from-emerald-500 to-teal-500',
  },
  {
    label: 'Click Rate',
    value: '11.2%',
    change: '+1.8%',
    Icon: MousePointerClick,
    tone: 'from-fuchsia-500 to-pink-500',
  },
  {
    label: 'Bounce Rate',
    value: '0.6%',
    change: '-0.2%',
    Icon: AlertTriangle,
    tone: 'from-amber-500 to-orange-500',
  },
];

const bars = [38, 52, 41, 67, 58, 74, 63, 81, 71, 88, 76, 92];

function MiniChart() {
  return (
    <div className="mt-3 flex h-24 items-end gap-1.5">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: 4 }}
          animate={{ height: `${h}%` }}
          transition={{ delay: 0.1 + i * 0.05, duration: 0.6, ease: 'easeOut' }}
          className="flex-1 rounded-md bg-gradient-to-t from-indigo-500/30 via-indigo-500 to-fuchsia-500"
        />
      ))}
    </div>
  );
}

export default function DashboardPreview() {
  return (
    <div className="relative isolate">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative rounded-3xl border border-white/60 bg-white/80 p-3 shadow-card backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/70"
      >
        <div className="rounded-2xl bg-gradient-to-b from-slate-50 to-white p-4 dark:from-slate-900 dark:to-slate-950 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              <span className="ml-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                app.mailwave.io/overview
              </span>
            </div>
            <div className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 sm:flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              All systems healthy
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.07, duration: 0.4 }}
                className="rounded-xl border border-slate-200 bg-white p-3 shadow-soft dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br ${s.tone} text-white`}
                  >
                    <s.Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {s.change}
                  </span>
                </div>
                <div className="mt-2 text-lg font-extrabold text-slate-900 dark:text-white">
                  {s.value}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Engagement
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    Last 12 weeks
                  </div>
                </div>
                <div className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400">
                  <Activity className="h-3.5 w-3.5" /> Realtime
                </div>
              </div>
              <MiniChart />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Automations
              </div>
              <ul className="mt-2 space-y-2 text-sm">
                <li className="flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-200">Welcome series</span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    Running
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-200">Cart abandon</span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    Running
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-200">Re-engagement</span>
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                    Paused
                  </span>
                </li>
              </ul>
              <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-2 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                <Sparkles className="h-3.5 w-3.5" /> 3 active workflows
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 shadow-soft dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between text-xs">
              <div className="font-semibold text-slate-900 dark:text-white">Latest campaign</div>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                Scheduled
              </span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
                <Mail className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  Spring Sale — 30% off everything
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Going out to 24,580 contacts • Tomorrow 9:00 AM
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
