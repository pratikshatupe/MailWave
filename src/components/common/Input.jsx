import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  { label, error, icon: Icon, rightSlot, className = '', id, ...rest },
  ref
) {
  const inputId = id || rest.name;
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        )}
        <input
          id={inputId}
          ref={ref}
          {...rest}
          className={`w-full rounded-xl border bg-white text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:outline-none focus:ring-4 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 ${
            Icon ? 'pl-10' : 'pl-4'
          } ${rightSlot ? 'pr-11' : 'pr-4'} py-3 ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100 dark:border-rose-500/50 dark:focus:border-rose-400 dark:focus:ring-rose-500/20'
              : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 dark:border-slate-700 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20'
          }`}
        />
        {rightSlot && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {rightSlot}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
