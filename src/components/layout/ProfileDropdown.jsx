// import { useEffect, useRef, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { ChevronDown, KeyRound, LogOut, User as UserIcon } from 'lucide-react';
// import { useAuth } from '../../context/AuthContext.jsx';
// import { ROLE_BADGES, getRoleLabel } from '../../config/roles.js';
// import { LABELS } from '../../config/labels.js';
// import { ROUTES } from '../../config/routes.js';

// export default function ProfileDropdown({ onLogout }) {
//   const { user, role } = useAuth();
//   const [open, setOpen] = useState(false);
//   const ref = useRef(null);

//   useEffect(() => {
//     function handler(e) {
//       if (ref.current && !ref.current.contains(e.target)) setOpen(false);
//     }
//     document.addEventListener('mousedown', handler);
//     return () => document.removeEventListener('mousedown', handler);
//   }, []);

//   const badge = role ? ROLE_BADGES[role] : null;

//   return (
//     <div className="relative" ref={ref}>
//       <button
//         onClick={() => setOpen((v) => !v)}
//         className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-2 py-1.5 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
//         aria-haspopup="menu"
//         aria-expanded={open}
//       >
//         <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-cyan-400 text-xs font-bold text-white">
//           {user?.avatarUrl ? (
//             <img src={user.avatarUrl} alt="Profile" className="h-full w-full object-cover" />
//           ) : (
//             user?.avatarInitials || 'U'
//           )}
//         </span>
//         <div className="hidden text-left text-xs leading-tight md:block">
//           <div className="font-semibold text-slate-900 dark:text-white">
//             {user?.name || 'User'}
//           </div>
//           <div className="truncate text-slate-500 dark:text-slate-400">
//             {getRoleLabel(role)}
//           </div>
//         </div>
//         <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" />
//       </button>

//       {open && (
//         <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-700 dark:bg-slate-900">
//           <div className="bg-gradient-to-br from-indigo-500/10 via-fuchsia-500/10 to-cyan-400/10 p-4">
//             <div className="flex items-center gap-3">
//               <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-cyan-400 text-sm font-bold text-white shadow-glow">
//                 {user?.avatarUrl ? (
//                   <img src={user.avatarUrl} alt="Profile" className="h-full w-full object-cover" />
//                 ) : (
//                   user?.avatarInitials || 'U'
//                 )}
//               </span>
//               <div className="min-w-0">
//                 <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">
//                   {user?.name || 'User'}
//                 </div>
//                 <div className="truncate text-xs text-slate-500 dark:text-slate-400">
//                   {user?.email}
//                 </div>
//                 <div className="mt-1.5">
//                   <span
//                     className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
//                       badge?.className ||
//                       'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
//                     }`}
//                   >
//                     {badge?.label || getRoleLabel(role)}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="p-2">
//             <Link
//               to={ROUTES.profile}
//               onClick={() => setOpen(false)}
//               className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
//             >
//               <UserIcon className="h-4 w-4" /> {LABELS.view} {LABELS.profile}
//             </Link>
//             <Link
//               to={ROUTES.changePassword}
//               onClick={() => setOpen(false)}
//               className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
//             >
//               <KeyRound className="h-4 w-4" /> {LABELS.changePassword}
//             </Link>
//             <button
//               onClick={() => {
//                 setOpen(false);
//                 onLogout?.();
//               }}
//               className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10"
//             >
//               <LogOut className="h-4 w-4" /> {LABELS.logOut}
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, KeyRound, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLE_BADGES, getRoleLabel } from '../../config/roles.js';
import { LABELS } from '../../config/labels.js';
import { ROUTES } from '../../config/routes.js';

export default function ProfileDropdown({ onLogout }) {
  const { user, role } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const badge = role ? ROLE_BADGES[role] : null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-2 py-1.5 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-cyan-400 text-xs font-bold text-white">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            user?.avatarInitials || 'U'
          )}
        </span>
        <div className="hidden text-left text-xs leading-tight md:block">
          <div className="font-semibold text-slate-900 dark:text-white">
            {user?.name || 'User'}
          </div>
          <div className="truncate text-slate-500 dark:text-slate-400">
            {getRoleLabel(role)}
          </div>
        </div>
        <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-700 dark:bg-slate-900">
          <div className="bg-gradient-to-br from-indigo-500/10 via-fuchsia-500/10 to-cyan-400/10 p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-cyan-400 text-sm font-bold text-white shadow-glow">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  user?.avatarInitials || 'U'
                )}
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {user?.name || 'User'}
                </div>
                <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {user?.email}
                </div>
                <div className="mt-1.5">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      badge?.className ||
                      'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {badge?.label || getRoleLabel(role)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-2">
            <Link
              to={ROUTES.profile}
              onClick={() => setOpen(false)}
              className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <UserIcon className="h-4 w-4" /> {LABELS.view} {LABELS.profile}
            </Link>
            <Link
              to={ROUTES.changePassword}
              onClick={() => setOpen(false)}
              className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <KeyRound className="h-4 w-4" /> {LABELS.changePassword}
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                onLogout?.();
              }}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10"
            >
              <LogOut className="h-4 w-4" /> {LABELS.logOut}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}