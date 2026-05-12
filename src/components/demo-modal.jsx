import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';

export default function DemoModal({ isOpen, onClose }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return undefined;

    setIsLoading(true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center px-3 sm:px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
    >
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative flex h-[70vh] w-[94vw] flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/90 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 sm:h-[560px] sm:max-h-[85vh] sm:w-[900px] sm:max-w-[90vw]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200/70 bg-gradient-to-r from-indigo-50/80 via-white/60 to-fuchsia-50/80 px-5 py-4 dark:border-slate-700/70 dark:from-indigo-500/10 dark:via-slate-900/40 dark:to-fuchsia-500/10">
          <div className="min-w-0">
            <h2
              id="demo-modal-title"
              className="truncate text-base font-semibold text-slate-900 dark:text-white sm:text-lg"
            >
              Mailwave Product Demo
            </h2>
            <p className="mt-0.5 line-clamp-2 text-xs text-slate-600 dark:text-slate-300 sm:text-sm">
              See how campaigns, contacts, templates, automations and analytics work together.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Close"
            aria-label="Close"
            className="inline-flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700/70 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative flex-1 bg-white dark:bg-slate-950">
          {isLoading && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-slate-950/70">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                Loading demo…
              </div>
            </div>
          )}
          <iframe
            src="/mailwave_demo.html"
            title="Mailwave Product Demo"
            className="w-full h-full border-0 rounded-b-2xl"
            loading="lazy"
            onLoad={() => setIsLoading(false)}
          />
        </div>
      </div>
    </div>
  );
}
