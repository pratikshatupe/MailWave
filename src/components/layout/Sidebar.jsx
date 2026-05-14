import { X, Lock } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import Logo from '../common/Logo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getNavigationForRole } from '../../config/modules.js';
import { ROLE_BADGES, getRoleLabel } from '../../config/roles.js';
import { ROUTES } from '../../config/routes.js';

/**
 * Sidebar
 *
 * Items come from the central module registry via getNavigationForRole(role).
 *
 * Three render modes:
 *   - Desktop expanded:   full-width with logo + label + lock hint
 *   - Desktop collapsed:  narrow strip with icons only and hover tooltips
 *   - Mobile drawer:      overlay drawer shown when `open` is true
 *
 * The collapsed scrollbar is visually hidden but scroll still works
 * (utility class .sidebar-scroll, defined in index.css).
 */
function NavItem({ item, onNavigate, collapsed }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      end={item.to === ROUTES.dashboard}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        `group relative flex w-full cursor-pointer items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition ${
          collapsed ? 'justify-center px-2' : 'px-3'
        } ${
          isActive
            ? 'bg-gradient-to-r from-indigo-500/15 via-fuchsia-500/10 to-transparent text-indigo-700 ring-1 ring-inset ring-indigo-200 dark:from-indigo-500/20 dark:via-fuchsia-500/15 dark:text-indigo-300 dark:ring-indigo-500/30'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
        }`
      }
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && item.readOnly && (
        <Lock
          className="ml-auto h-3 w-3 flex-shrink-0 text-slate-400"
          aria-label="Read only"
        />
      )}
      {collapsed && (
        <span
          className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 hidden -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-xs font-semibold text-white shadow-card group-hover:block dark:bg-slate-800"
          role="tooltip"
        >
          {item.label}
        </span>
      )}
    </NavLink>
  );
}

export default function Sidebar({ open, onClose }) {
  const { user, role } = useAuth();
  const items = getNavigationForRole(role);
  const badge = role ? ROLE_BADGES[role] : null;

  // Desktop: when not open, render the icons-only "rail" instead of hiding.
  const collapsed = !open;

  const desktopInner = (
    <div className="flex h-full flex-col">
      <div
        className={`flex items-center ${
          collapsed ? 'justify-center' : 'justify-between'
        } px-3 py-4 lg:py-5`}
      >
        {collapsed ? (
          <span
            className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-cyan-400 text-white shadow-glow ring-1 ring-white/30"
            aria-label="Mailwave"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path
                d="M3 7l9 6 9-6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect
                x="3"
                y="5"
                width="18"
                height="14"
                rx="3"
                stroke="white"
                strokeWidth="2"
              />
            </svg>
          </span>
        ) : (
          <Logo size="sm" />
        )}
      </div>

      <nav className="sidebar-scroll flex-1 space-y-1 overflow-y-auto px-2 pb-4">
        {items.map((item) => (
          <NavItem
            key={item.module}
            item={item}
            onNavigate={onClose}
            collapsed={collapsed}
          />
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        {collapsed ? (
          <div className="flex justify-center">
            <span
              className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-cyan-400 text-xs font-bold text-white shadow-glow"
              title={user?.name || 'User'}
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                user?.avatarInitials || 'U'
              )}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
            <span className="grid h-10 w-10 flex-shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-cyan-400 text-xs font-bold text-white shadow-glow">
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
        )}
      </div>
    </div>
  );

  // Mobile drawer keeps the full-width inner (no icon-only collapse on phones).
  const mobileInner = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-4">
        <Logo size="sm" />
        <button
          onClick={onClose}
          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="sidebar-scroll flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {items.map((item) => (
          <NavItem key={item.module} item={item} onNavigate={onClose} collapsed={false} />
        ))}
      </nav>
      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
          <span className="grid h-10 w-10 flex-shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-cyan-400 text-xs font-bold text-white shadow-glow">
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
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden flex-shrink-0 border-r border-slate-200 bg-white transition-[width] duration-200 dark:border-slate-800 dark:bg-slate-950 lg:block ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="sticky top-0 h-screen">{desktopInner}</div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm dark:bg-black/70"
            onClick={onClose}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl dark:bg-slate-950">
            {mobileInner}
          </div>
        </div>
      )}
    </>
  );
}
