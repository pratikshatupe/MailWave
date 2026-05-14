/**
 * chart-card.jsx
 *
 * Shared shell for every analytics chart. Keeps padding, dark mode and
 * empty state consistent.
 */

export default function ChartCard({ title, hint, children, empty, className = '' }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
          {hint && (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
          )}
        </div>
      </div>
      {empty ? (
        <div className="grid h-40 place-items-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {empty}
        </div>
      ) : (
        children
      )}
    </section>
  );
}
