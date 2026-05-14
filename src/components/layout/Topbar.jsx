import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import ThemeToggle from '../common/ThemeToggle.jsx';
import NotificationDropdown from './NotificationDropdown.jsx';
import ProfileDropdown from './ProfileDropdown.jsx';
import SearchDropdown from './SearchDropdown.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getNavigationForRole } from '../../config/modules.js';
import { getRoleLabel } from '../../config/roles.js';
import { LABELS } from '../../config/labels.js';
import { ROUTES } from '../../config/routes.js';

function deriveTitle(pathname, items) {
  const match = items.find((i) => pathname.startsWith(i.to));
  if (match) return match.label;
  if (pathname.startsWith(ROUTES.profile)) return LABELS.profile;
  if (pathname.startsWith(ROUTES.changePassword)) return LABELS.changePassword;
  if (pathname.startsWith(ROUTES.accessDenied)) return 'Access denied';
  return LABELS.dashboard;
}

export default function Topbar({ sidebarOpen, onToggleSidebar, onLogout }) {
  const { role } = useAuth();
  const { pathname } = useLocation();
  const items = useMemo(() => getNavigationForRole(role), [role]);
  const pageTitle = deriveTitle(pathname, items);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          onClick={onToggleSidebar}
          className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={sidebarOpen}
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden min-w-0 flex-col sm:flex">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {getRoleLabel(role)}
          </div>
          <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">
            {pageTitle}
          </div>
        </div>

        <div className="ml-auto hidden flex-1 justify-end md:flex">
          <SearchDropdown />
        </div>

        <div className="ml-auto flex items-center gap-2 md:ml-3">
          <ThemeToggle size="sm" />
          <NotificationDropdown />
          <ProfileDropdown onLogout={onLogout} />
        </div>
      </div>

      <div className="border-t border-slate-100 px-4 pb-3 pt-2 dark:border-slate-800 md:hidden">
        <SearchDropdown />
      </div>
    </header>
  );
}
