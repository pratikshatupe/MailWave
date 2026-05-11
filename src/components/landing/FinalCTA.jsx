import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Rocket } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-white py-12 dark:bg-slate-950 sm:py-16 lg:py-24">
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700 px-5 py-10 text-center text-white sm:px-10 sm:py-14 lg:px-12 lg:py-20"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-grid-dark opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 left-1/2 h-64 w-[800px] -translate-x-1/2 rounded-full bg-fuchsia-400/30 blur-3xl"
          />

          <span className="relative inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
            <Rocket className="h-3.5 w-3.5" /> Launch in minutes
          </span>
          <h2 className="relative mt-4 text-2xl font-extrabold tracking-tight sm:mt-5 sm:text-4xl lg:text-5xl">
            Start sending better email — today.
          </h2>
          <p className="relative mx-auto mt-3 max-w-2xl text-sm text-white/90 sm:mt-4 sm:text-base lg:text-lg">
            Join thousands of teams who automate every customer journey with
            Mailwave. 14-day free trial. No credit card required.
          </p>

          <div className="relative mt-6 flex flex-col items-stretch justify-center gap-3 sm:mt-8 sm:flex-row sm:items-center">
            <Link
              to="/register"
              className="inline-flex w-full max-w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-lg transition hover:scale-[1.03] sm:w-auto"
            >
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex w-full max-w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 sm:w-auto"
            >
              I already have an account
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
