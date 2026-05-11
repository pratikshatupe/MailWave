import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({
  Icon,
  label,
  value,
  delta,
  tone = 'from-indigo-500 to-blue-500',
  delay = 0,
}) {
  const positive = !delta?.toString().startsWith('-');
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900"
    >
      <div
        aria-hidden
        className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${tone} opacity-10 blur-2xl`}
      />
      <div className="flex items-center justify-between">
        <span
          className={`inline-grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${tone} text-white shadow-soft`}
        >
          <Icon className="h-5 w-5" />
        </span>
        {delta && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              positive
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
            }`}
          >
            {positive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {delta}
          </span>
        )}
      </div>
      <div className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        {value}
      </div>
      <div className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </div>
    </motion.div>
  );
}
