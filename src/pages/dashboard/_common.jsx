// import { motion } from 'framer-motion';
// import { Sparkles } from 'lucide-react';
// import { useAuth } from '../../context/AuthContext.jsx';
// import { getRoleLabel } from '../../config/roles.js';

// export function WelcomeBanner({ subtitle, action }) {
//   const { user, role } = useAuth();
//   const firstName = (user?.name || 'there').split(' ')[0];

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 12 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.4 }}
//       className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-glow sm:p-8"
//     >
//       <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-fuchsia-400/30 blur-3xl" />
//       <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
//       <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
//             <Sparkles className="h-3.5 w-3.5" /> {getRoleLabel(role)}
//           </span>
//           <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">
//             Welcome back, {firstName} 👋
//           </h1>
//           <p className="mt-1 max-w-2xl text-sm text-white/85 sm:text-base">
//             {subtitle}
//           </p>
//         </div>
//         {action && <div className="flex flex-wrap gap-2">{action}</div>}
//       </div>
//     </motion.div>
//   );
// }

// export function MiniBars({ values, tone = 'from-indigo-500 to-fuchsia-500' }) {
//   return (
//     <div className="mt-3 flex h-28 items-end gap-1.5">
//       {values.map((v, i) => (
//         <motion.div
//           key={i}
//           initial={{ height: 4 }}
//           animate={{ height: `${v}%` }}
//           transition={{ delay: 0.05 + i * 0.04, duration: 0.5, ease: 'easeOut' }}
//           className={`flex-1 rounded-md bg-gradient-to-t ${tone}`}
//         />
//       ))}
//     </div>
//   );
// }

// export function SectionCard({ title, hint, children, action }) {
//   return (
//     <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
//       <div className="flex items-start justify-between gap-3">
//         <div>
//           <div className="text-sm font-semibold text-slate-900 dark:text-white">{title}</div>
//           {hint && (
//             <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{hint}</div>
//           )}
//         </div>
//         {action}
//       </div>
//       <div className="mt-4">{children}</div>
//     </div>
//   );
// }
import { useAuth } from '../../context/AuthContext.jsx';

export function WelcomeBanner({ subtitle: _subtitle, action }) {
  const { user } = useAuth();
  const firstName = (user?.name || 'there').split(' ')[0];

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
          Welcome back, {firstName}
        </h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Here's an overview of your workspace.
        </p>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function MiniBars({ values, tone = 'from-indigo-500 to-fuchsia-500' }) {
  return (
    <div className="mt-3 flex h-28 items-end gap-1.5">
      {values.map((v, i) => (
        <div
          key={i}
          className={`flex-1 rounded-md bg-gradient-to-t ${tone}`}
          style={{ height: `${v}%` }}
        />
      ))}
    </div>
  );
}

export function SectionCard({ title, hint, children, action }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900 dark:text-white">{title}</div>
          {hint && (
            <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{hint}</div>
          )}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}