import { User, Building2, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Toast from '../ui/Toast.jsx';
import { LABELS } from '../../config/labels.js';
import { ROUTES } from '../../config/routes.js';

/**
 * Step 1 of the register flow — picks the account type. The Continue
 * button stays disabled until one card is selected.
 */
export default function AccountTypeStep({ value, onChange, onContinue, providerError }) {
  return (
    <>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
        How will you use Mailwave?
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Pick an account type. You can change this later from {LABELS.settings}.
      </p>

      {providerError && (
        <Toast type="error" message={providerError} className="mt-4" />
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Card
          selected={value === 'individual'}
          onClick={() => onChange('individual')}
          icon={User}
          title="Individual"
          subtitle="Solo creator, freelancer or side project."
          tone="from-emerald-500 to-teal-500"
          perks={['Personal workspace', 'Starter pricing', 'Referrals']}
        />
        <Card
          selected={value === 'organisation'}
          onClick={() => onChange('organisation')}
          icon={Building2}
          title={LABELS.organisation}
          subtitle="Team, agency or business with multiple users."
          tone="from-indigo-500 to-fuchsia-500"
          perks={['Team & roles', 'Approval workflow', 'Audit logs']}
        />
      </div>

      <button
        type="button"
        onClick={onContinue}
        disabled={!value}
        className="btn-primary mt-6 w-full cursor-pointer"
      >
        Continue <ArrowRight className="h-4 w-4" />
      </button>

      <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{' '}
        <Link
          to={ROUTES.login}
          className="cursor-pointer font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          {LABELS.signIn}
        </Link>
      </p>
    </>
  );
}

function Card({ selected, onClick, icon: Icon, title, subtitle, tone, perks }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex cursor-pointer flex-col items-start gap-3 rounded-2xl border p-5 text-left transition ${
        selected
          ? 'border-indigo-300 bg-indigo-50/60 ring-2 ring-indigo-200 dark:border-indigo-500/50 dark:bg-indigo-500/10 dark:ring-indigo-500/30'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-soft dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600'
      }`}
    >
      <span className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${tone} text-white shadow-glow`}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <div className="text-sm font-semibold text-slate-900 dark:text-white">{title}</div>
        <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</div>
      </div>
      <ul className="mt-1 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
        {perks.map((p) => (
          <li key={p} className="flex items-center gap-1.5">
            <Check className="h-3 w-3 text-emerald-500" /> {p}
          </li>
        ))}
      </ul>
      {selected && (
        <span className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white">
          <Check className="h-3.5 w-3.5" />
        </span>
      )}
    </button>
  );
}
