import { CreditCard, Check } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const plans = [
  {
    name: 'Starter',
    price: '$19',
    cadence: '/mo',
    features: ['10k emails', '2,500 contacts', '5 automations', 'Email support'],
    tone: 'from-slate-500 to-slate-700',
  },
  {
    name: 'Growth',
    price: '$899',
    cadence: '/mo',
    features: ['500k emails', '75k contacts', 'Unlimited automations', 'Priority support', 'Approval workflow'],
    tone: 'from-indigo-500 to-fuchsia-500',
    recommended: true,
  },
  {
    name: 'Scale',
    price: '$2,150',
    cadence: '/mo',
    features: ['Unlimited emails', 'Unlimited contacts', 'Dedicated IP pool', 'SLA + CSM', 'Custom contract'],
    tone: 'from-emerald-500 to-teal-500',
  },
];

export default function Subscription() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription"
        description="Manage your plan, usage and upgrade options. Powered by Razorpay."
        icon={CreditCard}
        actions={<Button>Manage payment method</Button>}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Current plan</div>
            <div className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
              {user?.plan || 'Starter'}
            </div>
            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">Renews on June 1, 2026</div>
          </div>
          <Badge tone="indigo">7-day trial — 4 days remaining</Badge>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-soft transition hover:shadow-card dark:bg-slate-900 ${
              p.recommended
                ? 'border-indigo-300 ring-2 ring-indigo-200 dark:border-indigo-500/50 dark:ring-indigo-500/30'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            {p.recommended && (
              <span className="absolute -top-3 left-6 inline-flex items-center rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-glow">
                Recommended
              </span>
            )}
            <div className={`mb-2 inline-block w-fit rounded-lg bg-gradient-to-br ${p.tone} px-2.5 py-1 text-xs font-semibold text-white`}>
              {p.name}
            </div>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{p.price}</span>
              <span className="pb-1.5 text-sm text-slate-500 dark:text-slate-400">{p.cadence}</span>
            </div>
            <ul className="mt-5 flex-1 space-y-2">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" /> {f}
                </li>
              ))}
            </ul>
            <Button variant={p.recommended ? 'primary' : 'ghost'} className="mt-6 w-full">
              {p.recommended ? 'Upgrade' : 'Choose plan'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
