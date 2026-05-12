import { Link } from 'react-router-dom';
import { ShieldOff, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../../config/routes.js';
import { LABELS } from '../../config/labels.js';

export default function AccessDenied() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-card dark:border-slate-800 dark:bg-slate-900">
        <span className="inline-grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-500 text-white shadow-glow">
          <ShieldOff className="h-7 w-7" />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold text-slate-900 dark:text-white">
          403 — Access denied
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          You don’t have permission to view this module. Ask your administrator
          if you believe this is a mistake.
        </p>
        <Link to={ROUTES.dashboard} className="btn-primary mt-6 cursor-pointer">
          <ArrowLeft className="h-4 w-4" /> Back to {LABELS.dashboard.toLowerCase()}
        </Link>
      </div>
    </div>
  );
}
