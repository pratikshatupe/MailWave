import { motion } from 'framer-motion';
import {
  Megaphone,
  ShoppingCart,
  Code2,
  Feather,
  Building2,
} from 'lucide-react';
import SectionHeading from '../common/SectionHeading.jsx';

const cases = [
  {
    Icon: Megaphone,
    title: 'Digital marketing agencies',
    desc: 'Run campaigns for multiple clients with workspaces, roles and white-label reports.',
    tone: 'from-indigo-500 to-blue-500',
    points: ['Multi-tenant workspaces', 'Client-ready PDF reports', 'Role-based access'],
  },
  {
    Icon: ShoppingCart,
    title: 'Ecommerce brands',
    desc: 'Recover carts, win back lapsed buyers and upsell with behavior-based flows.',
    tone: 'from-fuchsia-500 to-pink-500',
    points: ['Cart abandonment series', 'Post-purchase flows', 'Revenue attribution'],
  },
  {
    Icon: Code2,
    title: 'SaaS companies',
    desc: 'Onboard, activate and retain — tie email to product events and lifecycle stages.',
    tone: 'from-cyan-500 to-teal-500',
    points: ['Event-driven triggers', 'Trial → paid sequences', 'Churn-risk re-engagement'],
  },
  {
    Icon: Feather,
    title: 'Bloggers & creators',
    desc: 'Grow a newsletter, monetize an audience and segment by interests effortlessly.',
    tone: 'from-amber-500 to-orange-500',
    points: ['Signup forms', 'Topic-based segmentation', 'Paid newsletter ready'],
  },
  {
    Icon: Building2,
    title: 'Small & medium business',
    desc: 'Promotions, announcements and customer updates — done in minutes.',
    tone: 'from-emerald-500 to-teal-500',
    points: ['Reusable templates', 'Easy scheduling', 'Affordable scaling'],
  },
];

export default function UseCases() {
  return (
    <section id="use-cases" className="section-pad bg-white dark:bg-slate-950">
      <div className="container-x">
        <SectionHeading
          eyebrow="Built for every team"
          title="One platform — many ways to grow"
          description="Whether you’re sending your first newsletter or your millionth lifecycle email, Mailwave adapts to how you work."
        />

        <div className="mt-8 grid gap-4 sm:mt-12 sm:gap-5 md:grid-cols-2 lg:mt-14 lg:grid-cols-3">
          {cases.map((c, i) => (
            <motion.article
              key={c.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
            >
              <div
                aria-hidden
                className={`absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${c.tone} opacity-10 blur-2xl transition group-hover:opacity-20`}
              />
              <span
                className={`inline-grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${c.tone} text-white shadow-soft`}
              >
                <c.Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                {c.title}
              </h3>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
                {c.desc}
              </p>
              <ul className="mt-4 space-y-1.5">
                {c.points.map((p) => (
                  <li
                    key={p}
                    className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                    {p}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
