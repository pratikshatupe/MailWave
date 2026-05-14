import { Menu } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle.jsx';
import NotificationDropdown from './NotificationDropdown.jsx';
import ProfileDropdown from './ProfileDropdown.jsx';
import SearchDropdown from './SearchDropdown.jsx';

export default function Topbar({ sidebarOpen, onToggleSidebar, onLogout }) {
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