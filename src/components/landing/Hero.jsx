import { motion } from 'framer-motion';
import { ArrowRight, PlayCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardPreview from './DashboardPreview.jsx';

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-12 sm:pt-32 sm:pb-20 lg:pt-40 lg:pb-28">
      {/* Background */}
      <div
        aria-hidden
        className="absolute inset-0 bg-hero-gradient opacity-100 dark:opacity-60"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl dark:bg-indigo-500/30"
      />

      <div className="container-x relative">
        <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="eyebrow"
            >
              <Sparkles className="h-3.5 w-3.5" /> New • AI subject lines (beta)
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl"
            >
              Automate{' '}
              <span className="gradient-text">email marketing</span>,
              campaigns, and customer journeys from one SaaS platform.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-5 max-w-xl text-base text-slate-600 dark:text-slate-300 sm:text-lg"
            >
              Create campaigns, manage contacts, build templates, schedule bulk
              emails, automate follow-ups, and track every open, click, bounce
              and unsubscribe — all from one beautiful dashboard.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Link to="/register" className="btn-primary">
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#dashboard" className="btn-ghost">
                <PlayCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> View Demo
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-slate-500 dark:text-slate-400"
            >
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                14-day free trial • No credit card
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" />
                SOC 2 • GDPR ready
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-fuchsia-500" />
                Sends via SendGrid & Amazon SES
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="mt-8 flex items-center gap-5 opacity-80"
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Trusted by teams at
              </span>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold text-slate-400 dark:text-slate-500">
                <span>Acme</span>
                <span>Northwind</span>
                <span>Pulsar</span>
                <span>Lumen&amp;Co</span>
                <span>Beam</span>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-6" id="dashboard">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
