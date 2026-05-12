/**
 * IconButton
 *
 * Small action button with a tooltip and visible cursor. Default variant
 * is neutral; "danger" gives the destructive red treatment used in delete
 * actions.
 */

const SIZE = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-10 w-10',
};

const VARIANT = {
  neutral:
    'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100',
  primary:
    'border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20',
  danger:
    'border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20',
  ghost:
    'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
};

export default function IconButton({
  icon: Icon,
  tooltip,
  onClick,
  variant = 'neutral',
  size = 'sm',
  type = 'button',
  disabled,
  className = '',
  ...rest
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      aria-label={tooltip}
      className={`inline-flex cursor-pointer items-center justify-center rounded-lg transition focus:outline-none focus:ring-2 focus:ring-indigo-300/60 disabled:cursor-not-allowed disabled:opacity-50 ${
        SIZE[size] || SIZE.sm
      } ${VARIANT[variant] || VARIANT.neutral} ${className}`}
      {...rest}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
    </button>
  );
}
