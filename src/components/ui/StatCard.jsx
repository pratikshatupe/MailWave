import { motion } from 'framer-motion';

export default function StatCard({
  Icon,
  label,
  value,
  delta,
  deltaTone = 'positive',
  tone = 'from-indigo-500 to-fuchsia-500',
  delay = 0,
  hint,
}) {
  const deltaColor =
    deltaTone === 'negative'
      ? 'text-rose-600 dark:text-rose-400'
      : deltaTone === 'neutral'
      ? 'text-slate-500 dark:text-slate-400'
      : 'text-emerald-600 dark:text-emerald-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-card dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-3">
        {Icon && (
          <span
            className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br ${tone} text-white shadow-glow`}
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
        {delta && (
          <span className={`text-[11px] font-semibold ${deltaColor}`}>{delta}</span>
        )}
      </div>
      <div className="mt-3 text-xl font-bold leading-tight text-slate-900 dark:text-white">
        {value}
      </div>
      <div className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
      </div>
      {hint && (
        <div className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
          {hint}
        </div>
      )}
    </motion.div>
  );
}
