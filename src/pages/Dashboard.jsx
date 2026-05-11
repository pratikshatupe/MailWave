import { Link } from 'react-router-dom';
import {
  Mail,
  Users,
  TrendingUp,
  MousePointerClick,
  Bell,
  Search,
  Plus,
  Sparkles,
} from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar.jsx';
import StatCard from '../components/dashboard/StatCard.jsx';
import RecentCampaigns from '../components/dashboard/RecentCampaigns.jsx';
import AutomationStatus from '../components/dashboard/AutomationStatus.jsx';
import ThemeToggle from '../components/common/ThemeToggle.jsx';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="flex min-h-screen">
        <DashboardSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <header className="sticky top-0 z-20 hidden h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80 lg:flex">
            <div className="relative flex max-w-md flex-1 items-center">
              <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                placeholder="Search campaigns, contacts, automations…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 dark:focus:border-indigo-400 dark:focus:bg-slate-900 dark:focus:ring-indigo-500/20"
              />
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle size="sm" />
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </button>
              <button className="btn-primary !py-2.5">
                <Plus className="h-4 w-4" /> New campaign
              </button>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-2.5 py-1.5 dark:border-slate-700">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xs font-bold text-white">
                  JC
                </span>
                <div className="hidden text-xs leading-tight md:block">
                  <div className="font-semibold text-slate-900 dark:text-white">Jane Cooper</div>
                  <div className="text-slate-500 dark:text-slate-400">Business Admin</div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 p-5 sm:p-6 lg:p-8">
            {/* Welcome banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-glow sm:p-8">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-fuchsia-400/30 blur-3xl"
              />
              <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5" /> Welcome back
                  </span>
                  <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">
                    Good to see you, Jane 👋
                  </h1>
                  <p className="mt-1 max-w-xl text-sm text-white/85 sm:text-base">
                    Here’s a quick snapshot of your email performance. Your last
                    campaign is performing 12% above average — nice work.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-slate-100">
                    <Plus className="h-4 w-4" /> New campaign
                  </button>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                  >
                    View site
                  </Link>
                </div>
              </div>
            </div>

            {/* Stat grid */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                Icon={Mail}
                label="Total campaigns"
                value="128"
                delta="+8 this week"
                tone="from-indigo-500 to-blue-500"
                delay={0}
              />
              <StatCard
                Icon={Users}
                label="Contacts"
                value="42,580"
                delta="+312"
                tone="from-fuchsia-500 to-pink-500"
                delay={0.05}
              />
              <StatCard
                Icon={TrendingUp}
                label="Open rate"
                value="48.7%"
                delta="+3.1%"
                tone="from-emerald-500 to-teal-500"
                delay={0.1}
              />
              <StatCard
                Icon={MousePointerClick}
                label="Click rate"
                value="11.2%"
                delta="+1.8%"
                tone="from-amber-500 to-orange-500"
                delay={0.15}
              />
            </div>

            {/* Main grid */}
            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <RecentCampaigns />
              </div>
              <div>
                <AutomationStatus />
              </div>
            </div>

            <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
              This is a placeholder dashboard — full data and actions will be wired
              up when the backend is connected.
            </p>
          </main>
        </div>
      </div>
    </div>
  );
}
