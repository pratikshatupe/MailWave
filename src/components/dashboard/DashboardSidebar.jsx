import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Mail,
  Users,
  Workflow,
  Layout,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import Logo from '../common/Logo.jsx';
import ThemeToggle from '../common/ThemeToggle.jsx';

const nav = [
  { label: 'Overview', Icon: LayoutDashboard, active: true },
  { label: 'Campaigns', Icon: Mail },
  { label: 'Contacts', Icon: Users },
  { label: 'Automations', Icon: Workflow },
  { label: 'Templates', Icon: Layout },
  { label: 'Analytics', Icon: BarChart3 },
  { label: 'Settings', Icon: Settings },
];

export default function DashboardSidebar() {
  const [open, setOpen] = useState(false);

  const content = (
    <>
      <div className="px-6 py-5">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map((n) => (
          <button
            key={n.label}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              n.active
                ? 'bg-gradient-to-r from-indigo-50 to-fuchsia-50 text-indigo-700 ring-1 ring-inset ring-indigo-100 dark:from-indigo-500/15 dark:to-fuchsia-500/15 dark:text-indigo-300 dark:ring-indigo-500/30'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
            }`}
          >
            <n.Icon className="h-4 w-4" />
            {n.label}
          </button>
        ))}
      </nav>
      <div className="p-3">
        <Link
          to="/login"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950 lg:hidden">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <ThemeToggle size="sm" />
          <button
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:flex">
        {content}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm dark:bg-black/70"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl dark:bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
              <Logo size="sm" />
              <button
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
