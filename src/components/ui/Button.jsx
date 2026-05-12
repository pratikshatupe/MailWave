const VARIANTS = {
  primary:
    'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02] active:scale-100 focus:outline-none focus:ring-4 focus:ring-indigo-300/50 dark:focus:ring-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100',
  ghost:
    'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-700 backdrop-blur transition hover:bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900 dark:hover:border-slate-600 disabled:opacity-60',
  outline:
    'inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20 disabled:opacity-60',
  danger:
    'inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20 disabled:opacity-60',
};

export default function Button({
  variant = 'primary',
  className = '',
  children,
  type = 'button',
  ...rest
}) {
  return (
    <button type={type} className={`${VARIANTS[variant] || VARIANTS.primary} ${className}`} {...rest}>
      {children}
    </button>
  );
}
