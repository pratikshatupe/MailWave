import { motion } from 'framer-motion';
import { Mail, Clock, ShoppingBag, Sparkles } from 'lucide-react';
import SectionHeading from '../common/SectionHeading.jsx';

const sequence = [
  {
    day: 'Day 0',
    Icon: Mail,
    title: 'Welcome email',
    subject: 'Welcome to {{brand}} — let’s get you set up',
    tone: 'from-indigo-500 to-blue-500',
  },
  {
    day: 'Day 2',
    Icon: Clock,
    title: 'Wait • Then nudge',
    subject: '{{name}}, here’s a quick tip to get started',
    tone: 'from-amber-500 to-orange-500',
  },
  {
    day: 'Day 5',
    Icon: ShoppingBag,
    title: 'Personalized offer',
    subject: 'A 20% gift just for you, {{name}}',
    tone: 'from-fuchsia-500 to-pink-500',
  },
  {
    day: 'Day 10',
    Icon: Sparkles,
    title: 'Re-engage',
    subject: 'We miss you — see what’s new',
    tone: 'from-emerald-500 to-teal-500',
  },
];

export default function AutomationSequence() {
  return (
    <section className="section-pad bg-slate-50 dark:bg-slate-900">
      <div className="container-x">
        <SectionHeading
          eyebrow="Email sequences"
          title="Drip the perfect message — automatically"
          description="Pre-built sequences for onboarding, nurture and win-back, or design your own. Personalize every email with variables like {{name}}."
        />

        <div className="relative mx-auto mt-8 max-w-3xl sm:mt-12 lg:mt-14">
          {/* Vertical line */}
          <div
            aria-hidden
            className="absolute left-6 top-2 bottom-2 w-0.5 bg-gradient-to-b from-indigo-300 via-fuchsia-300 to-emerald-300 dark:from-indigo-500/70 dark:via-fuchsia-500/70 dark:to-emerald-500/70 sm:left-8"
          />

          <ul className="space-y-5">
            {sequence.map((s, i) => (
              <motion.li
                key={s.day}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="relative pl-16 sm:pl-20"
              >
                <span
                  className={`absolute left-0 top-1.5 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${s.tone} text-white shadow-glow sm:left-2`}
                >
                  <s.Icon className="h-5 w-5" />
                </span>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                      {s.day}
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                      Active
                    </span>
                  </div>
                  <div className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                    {s.title}
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 font-mono text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                    <Mail className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                    {s.subject}
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
