import { Sparkles, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { getPlansForAccountType } from '../../config/plans.js';

/**
 * Step 2 of the register flow — pick a plan. Plan list comes from
 * config/plans.js and is filtered by the account type selected in step 1.
 */
export default function PlanSelectionStep({ accountType, value, onChange, onBack, onContinue }) {
  const plans = getPlansForAccountType(accountType);
  return (
    <>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
        Choose your plan
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Start with the 7-day free trial, or pick a paid plan now. No credit card required.
      </p>

      <div className="mt-6 space-y-3">
        {plans.map((p) => {
          const selected = value === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange(p.id)}
              className={`flex w-full cursor-pointer items-start gap-4 rounded-2xl border p-4 text-left transition ${
                selected
                  ? 'border-indigo-300 bg-indigo-50/60 ring-2 ring-indigo-200 dark:border-indigo-500/50 dark:bg-indigo-500/10 dark:ring-indigo-500/30'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900'
              }`}
            >
              <span className={`grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br ${p.tone} text-white shadow-glow`}>
                <Sparkles className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{p.name}</span>
                  {p.recommended && (
                    <span className="rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      Recommended
                    </span>
                  )}
                  <span className="ml-auto text-sm font-bold text-slate-900 dark:text-white">
                    {p.price}
                    {p.cadence && (
                      <span className="text-xs font-normal text-slate-500 dark:text-slate-400"> {p.cadence}</span>
                    )}
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{p.blurb}</div>
                <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-emerald-500" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
              {selected && (
                <span className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Check className="h-3.5 w-3.5" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex gap-2">
        <button type="button" onClick={onBack} className="btn-ghost cursor-pointer">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={!value}
          className="btn-primary flex-1 cursor-pointer"
        >
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </>
  );
}
