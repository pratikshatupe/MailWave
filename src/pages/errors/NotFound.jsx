import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../../config/routes.js';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-card dark:border-slate-800 dark:bg-slate-900">
        <span className="inline-grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-glow">
          <Compass className="h-7 w-7" />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold text-slate-900 dark:text-white">
          404 — Page not found
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          The page you were looking for doesn’t exist or has been moved.
        </p>
        <Link to={ROUTES.landing} className="btn-primary mt-6 cursor-pointer">
          <ArrowLeft className="h-4 w-4" /> Back home
        </Link>
      </div>
    </div>
  );
}
