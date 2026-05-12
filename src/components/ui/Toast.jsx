/**
 * Toast
 *
 * Floating notification card. Close icon is always visible in dark mode.
 * Messages are expected to end with a full stop — generator helpers in
 * config/messages.js take care of that.
 */

import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const STYLES = {
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  error:
    'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
  info:
    'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300',
};

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export default function Toast({
  type = 'info',
  message,
  onClose,
  className = '',
}) {
  if (!message) return null;
  const Icon = ICONS[type] || Info;
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm shadow-sm ${
        STYLES[type] || STYLES.info
      } ${className}`}
    >
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <span className="flex-1 leading-relaxed">{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close notification"
          className="inline-flex h-6 w-6 flex-shrink-0 cursor-pointer items-center justify-center rounded-md text-current/70 transition hover:bg-black/5 hover:text-current dark:hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
