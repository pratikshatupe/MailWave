export default function GlassCard({ className = '', children, dark = false, ...rest }) {
  const base = dark
    ? 'bg-white/5 border-white/10 text-white'
    : 'bg-white/70 border-white/60 text-slate-800 dark:bg-slate-900/60 dark:border-slate-700/60 dark:text-slate-100';
  return (
    <div
      className={`relative rounded-2xl border ${base} backdrop-blur-xl shadow-card ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
