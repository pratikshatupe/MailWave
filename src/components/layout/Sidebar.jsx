import { LogOut, X, Lock } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import Logo from '../common/Logo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getNavigationForRole } from '../../config/modules.js';
import { ROLE_BADGES, getRoleLabel } from '../../config/roles.js';
import { LABELS } from '../../config/labels.js';
import { ROUTES } from '../../config/routes.js';

/**
 * Sidebar
 *
 * Items are derived from the central module registry via
 * getNavigationForRole(role), which itself filters through the RBAC
 * matrix. No item is hardcoded here — adding or removing a module is a
 * single-file change in modules.js / permissions.js.
 *
 * Each nav item exposes a `readOnly` hint (true when the role only has
 * view / export on the module). A small Lock icon is shown so users
 * understand why write actions are missing once they open the page.
 */
function NavItem({ item, onNavigate }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      end={item.to === ROUTES.dashboard}
      className={({ isActive }) =>
        `group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
          isActive
            ? 'bg-gradient-to-r from-indigo-500/15 via-fuchsia-500/10 to-transparent text-indigo-700 ring-1 ring-inset ring-indigo-200 dark:from-indigo-500/20 dark:via-fuchsia-500/15 dark:text-indigo-300 dark:ring-indigo-500/30'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
        }`
      }
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="truncate">{item.label}</span>
      {item.readOnly && (
        <Lock
          className="ml-auto h-3 w-3 flex-shrink-0 text-slate-400"
          aria-label="Read only"
        />
      )}
    </NavLink>
  );
}

export default function Sidebar({ open, onClose, onLogout }) {
  const { user, role } = useAuth();
  const items = getNavigationForRole(role);
  const badge = role ? ROLE_BADGES[role] : null;

  const inner = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-4 lg:px-6 lg:py-5">
        <Logo size="sm" />
        <button
          onClick={onClose}
          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {items.map((item) => (
          <NavItem key={item.module} item={item} onNavigate={onClose} />
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
          <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-cyan-400 text-xs font-bold text-white shadow-glow">
            {user?.avatarInitials || 'U'}
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {user?.name || 'User'}
            </div>
            <div className="mt-0.5 inline-flex">
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

        <button
          onClick={onLogout}
          className="mt-2 flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-700 dark:text-slate-300 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
        >
          <LogOut className="h-4 w-4" /> {LABELS.logOut}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 flex-shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:block">
        <div className="sticky top-0 h-screen">{inner}</div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm dark:bg-black/70"
            onClick={onClose}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl dark:bg-slate-950">
            {inner}
          </div>
        </div>
      )}
    </>
  );
}
