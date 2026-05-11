import { motion } from 'framer-motion';
import { Users, Layout, Workflow, BarChart3 } from 'lucide-react';
import SectionHeading from '../common/SectionHeading.jsx';

const steps = [
  {
    Icon: Users,
    title: 'Import your audience',
    desc: 'Bring contacts from CSV, your CRM or API. Auto-clean and segment instantly.',
  },
  {
    Icon: Layout,
    title: 'Design beautiful emails',
    desc: 'Use the drag-and-drop builder or start from one of our 80+ templates.',
  },
  {
    Icon: Workflow,
    title: 'Automate the journey',
    desc: 'Trigger emails based on behavior, time or events. Branch on conditions.',
  },
  {
    Icon: BarChart3,
    title: 'Measure & optimize',
    desc: 'Track opens, clicks, bounces and revenue — A/B test for steady lifts.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="section-pad relative overflow-hidden bg-slate-50 dark:bg-slate-900">
      <div
        aria-hidden
        className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />
      <div className="container-x relative">
        <SectionHeading
          eyebrow="How it works"
          title="From zero to your first automated campaign in under 10 minutes"
          description="Mailwave is opinionated where it matters and flexible where you need it. Here’s how teams go live fast."
        />

        <div className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:mt-14 lg:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="relative rounded-2xl border border-white/70 bg-white/80 p-6 shadow-card backdrop-blur dark:border-slate-700/70 dark:bg-slate-800/70"
            >
              <span className="absolute -top-3 right-5 inline-grid h-7 w-7 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white shadow-soft dark:bg-white dark:text-slate-900">
                {i + 1}
              </span>
              <span className="inline-grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-glow">
                <s.Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                {s.title}
              </h3>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
