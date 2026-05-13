import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MailCheck, CheckCircle2, ArrowRight } from 'lucide-react';

import ThemeToggle from '../../components/common/ThemeToggle.jsx';
import { LABELS } from '../../config/labels.js';
import { ROUTES } from '../../config/routes.js';

/**
 * Post-registration confirmation screen. Shown after a successful local
 * register. The verification email is not actually sent (no backend) —
 * this is purely a frontend simulation.
 */
export default function RegisterSuccess({ emailId }) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <div className="absolute right-3 top-3 z-30 sm:right-6 sm:top-6">
        <ThemeToggle size="sm" />
      </div>
      <div className="container-x flex min-h-screen items-center justify-center py-16 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-card dark:border-slate-700 dark:bg-slate-900 sm:p-10"
        >
          <span className="inline-grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-glow">
            <MailCheck className="h-7 w-7" />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
            Account created successfully.
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 sm:text-base">
            Please verify your {LABELS.emailId} to activate your account. We’ve sent a
            verification link to{' '}
            <span className="font-semibold text-slate-900 dark:text-white">{emailId}</span>.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to={ROUTES.login} className="btn-primary cursor-pointer">
              <CheckCircle2 className="h-4 w-4" /> {LABELS.logIn}{' '}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to={ROUTES.landing} className="btn-ghost cursor-pointer">
              Back to homepage
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
