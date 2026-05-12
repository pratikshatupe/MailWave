import { Loader2 } from 'lucide-react';

export default function FacebookButton({
  children = 'Continue with Facebook',
  onClick,
  loading = false,
  disabled = false,
}) {
  const isDisabled = disabled || loading;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading}
      className="inline-flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin text-slate-500" aria-hidden />
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          <path
            fill="#1877F2"
            d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.412c0-3.014 1.792-4.679 4.533-4.679 1.313 0 2.686.235 2.686.235v2.97h-1.514c-1.491 0-1.956.927-1.956 1.879v2.256h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073Z"
          />
          <path
            fill="#FFFFFF"
            d="m16.671 15.563.532-3.49h-3.328V9.817c0-.952.465-1.879 1.956-1.879h1.514V4.97s-1.373-.235-2.686-.235c-2.741 0-4.533 1.665-4.533 4.679v2.66H7.078v3.49h3.047V24a12.18 12.18 0 0 0 3.75 0v-8.437h2.796Z"
          />
        </svg>
      )}
      {loading ? 'Connecting to Facebook…' : children}
    </button>
  );
}
