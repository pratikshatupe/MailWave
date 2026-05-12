/**
 * ConfirmModal
 *
 * Replaces browser confirm() everywhere. Descriptive message, named
 * record, destructive variant gets a red confirm button.
 *
 * Usage:
 *   <ConfirmModal
 *     open={openDelete}
 *     title="Delete contact"
 *     description={deleteConfirm('contact', row.name)}
 *     confirmLabel="Delete"
 *     variant="danger"
 *     onConfirm={handleDelete}
 *     onCancel={() => setOpen(false)}
 *   />
 */

import { AlertTriangle, X } from 'lucide-react';
import { BUTTON_LABELS } from '../../config/projectStandards.js';

export default function ConfirmModal({
  open,
  title = 'Confirm',
  description,
  confirmLabel = BUTTON_LABELS.confirm,
  cancelLabel = BUTTON_LABELS.cancel,
  variant = 'primary',
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;
  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-700 dark:bg-slate-900"
      >
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close"
          className="absolute right-3 top-3 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="p-6">
          <div className="flex items-start gap-3">
            {isDanger && (
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                <AlertTriangle className="h-5 w-5" />
              </div>
            )}
            <div className="flex-1 pr-6">
              <h3
                id="confirm-modal-title"
                className="text-base font-semibold text-slate-900 dark:text-white"
              >
                {title}
              </h3>
              {description && (
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {description}
                </p>
              )}
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`inline-flex cursor-pointer items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-60 ${
                isDanger
                  ? 'border-rose-600 bg-rose-600 hover:bg-rose-700'
                  : 'border-indigo-600 bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {loading ? 'Working…' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
