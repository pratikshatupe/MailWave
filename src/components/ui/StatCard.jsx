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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition hover:shadow-card dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-center justify-between">
        {Icon && (
          <span className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${tone} text-white shadow-glow`}>
            <Icon className="h-5 w-5" />
          </span>
        )}
        {delta && (
          <span className={`text-xs font-semibold ${deltaColor}`}>{delta}</span>
        )}
      </div>
      <div className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-white">
        {value}
      </div>
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
      </div>
      {hint && (
        <div className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
          {hint}
        </div>
      )}
    </motion.div>
  );
}
