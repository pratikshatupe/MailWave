import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import SectionHeading from '../common/SectionHeading.jsx';

const testimonials = [
  {
    quote:
      'We replaced three tools with Mailwave. Our cart-recovery revenue jumped 38% in the first month — the automations are just chef’s kiss.',
    name: 'Aisha Patel',
    role: 'Head of Growth, Northwind',
    initials: 'AP',
    color: 'from-indigo-500 to-fuchsia-500',
  },
  {
    quote:
      'Finally an email platform that doesn’t feel stuck in 2014. The workflow builder is intuitive and the analytics are beautiful.',
    name: 'Marco Reyes',
    role: 'Founder, Pulsar SaaS',
    initials: 'MR',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    quote:
      'Deliverability has been rock-solid since switching. The Redis-queue engine just hums — millions of sends without a hiccup.',
    name: 'Sara Hoffmann',
    role: 'Marketing Ops, Lumen&Co',
    initials: 'SH',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    quote:
      'Our agency runs 14 client workspaces in Mailwave. White-label reports save us hours every Friday.',
    name: 'Daniel Okafor',
    role: 'Director, Beam Agency',
    initials: 'DO',
    color: 'from-amber-500 to-orange-500',
  },
  {
    quote:
      'The personalization variables and segmentation made our newsletter feel handcrafted — at 120k subscribers.',
    name: 'Lina Park',
    role: 'Creator, The Quiet Edit',
    initials: 'LP',
    color: 'from-fuchsia-500 to-pink-500',
  },
  {
    quote:
      'Onboarding sequences shipped in a day. Support is fast, the docs are great, and the UI is genuinely a joy to use.',
    name: 'Ben Vargas',
    role: 'Lifecycle Lead, Acme',
    initials: 'BV',
    color: 'from-violet-500 to-purple-600',
  },
];

export default function Testimonials() {
  return (
    <section className="section-pad bg-white dark:bg-slate-950">
      <div className="container-x">
        <SectionHeading
          eyebrow="Loved by marketers"
          title="Teams that ship great emails choose Mailwave"
          description="Don’t take our word for it — here’s what teams say after going live."
        />

        <div className="mt-8 grid gap-4 sm:mt-12 sm:gap-5 md:grid-cols-2 lg:mt-14 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.07 }}
              className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-soft transition hover:shadow-card dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
            >
              <Quote className="absolute right-5 top-5 h-6 w-6 text-indigo-200 dark:text-indigo-500/40" />
              <div className="flex items-center gap-0.5 text-amber-500 dark:text-amber-400">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span
                  className={`grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br ${t.color} text-sm font-bold text-white`}
                >
                  {t.initials}
                </span>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{t.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{t.role}</div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
