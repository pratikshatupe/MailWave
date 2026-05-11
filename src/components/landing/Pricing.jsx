import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from '../common/SectionHeading.jsx';

const plans = [
  {
    name: 'Starter',
    description: 'For solo creators and small lists.',
    monthly: 19,
    yearly: 15,
    features: [
      'Up to 5,000 contacts',
      '30,000 emails / month',
      'Drag-drop template builder',
      'Basic automations',
      'Open & click tracking',
      'Community support',
    ],
    cta: 'Start free trial',
    highlight: false,
  },
  {
    name: 'Growth',
    description: 'For growing teams ready to automate.',
    monthly: 59,
    yearly: 49,
    features: [
      'Up to 50,000 contacts',
      '500,000 emails / month',
      'Unlimited workflows & sequences',
      'Advanced segmentation',
      'A/B testing & smart sends',
      'Role-based access',
      'Priority support',
    ],
    cta: 'Start free trial',
    highlight: true,
  },
  {
    name: 'Scale',
    description: 'For agencies and high-volume senders.',
    monthly: 149,
    yearly: 129,
    features: [
      'Unlimited contacts',
      '3M+ emails / month',
      'SendGrid & Amazon SES routing',
      'Dedicated IPs',
      'SLA + 24/7 support',
      'White-label reports',
      'SSO & audit logs',
    ],
    cta: 'Talk to sales',
    highlight: false,
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(true);
  return (
    <section id="pricing" className="section-pad relative overflow-hidden bg-white dark:bg-slate-950">
      <div className="container-x">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple, transparent pricing that scales with you"
          description="Every plan includes core deliverability, analytics and unlimited team seats. Cancel anytime."
        />

        <div className="mt-8 flex items-center justify-center gap-3">
          <span
            className={`text-sm font-semibold ${
              !yearly
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Monthly
          </span>
          <button
            onClick={() => setYearly((v) => !v)}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition ${
              yearly
                ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600'
                : 'bg-slate-300 dark:bg-slate-700'
            }`}
            aria-pressed={yearly}
          >
            <span
              className={`absolute h-5 w-5 rounded-full bg-white shadow transition ${
                yearly ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
          <span
            className={`text-sm font-semibold ${
              yearly
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Yearly
          </span>
          <span className="ml-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            Save 20%
          </span>
        </div>

        <div className="mt-8 grid gap-4 sm:mt-12 sm:gap-5 lg:grid-cols-3">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className={`relative rounded-3xl border p-6 transition ${
                p.highlight
                  ? 'border-transparent bg-gradient-to-b from-indigo-600 to-fuchsia-600 text-white shadow-glow'
                  : 'border-slate-200 bg-white text-slate-900 shadow-soft hover:shadow-card dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:hover:border-slate-700'
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-indigo-700 shadow">
                  <Sparkles className="h-3.5 w-3.5" /> Most popular
                </span>
              )}
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-bold">{p.name}</h3>
                <div className="text-right">
                  <div className="text-3xl font-extrabold">
                    ${yearly ? p.yearly : p.monthly}
                  </div>
                  <div
                    className={`text-xs ${
                      p.highlight
                        ? 'text-white/80'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    /month{yearly ? ', billed yearly' : ''}
                  </div>
                </div>
              </div>
              <p
                className={`mt-2 text-sm ${
                  p.highlight ? 'text-white/90' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {p.description}
              </p>

              <ul className="mt-5 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check
                      className={`mt-0.5 h-4 w-4 ${
                        p.highlight ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    />
                    <span
                      className={
                        p.highlight
                          ? 'text-white/95'
                          : 'text-slate-700 dark:text-slate-200'
                      }
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  p.highlight
                    ? 'bg-white text-indigo-700 hover:bg-slate-100'
                    : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
                }`}
              >
                {p.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
