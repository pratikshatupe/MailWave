import { useState } from 'react';
import {
  Mail,
  Send,
  TrendingUp,
  MousePointerClick,
  AlertTriangle,
  UserMinus,
  Download,
  CalendarRange,
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard.jsx';
import Badge from '../../components/ui/Badge.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Button from '../../components/ui/Button.jsx';
import { MiniBars, SectionCard, WelcomeBanner } from './_common.jsx';

const top = [
  { id: '1', campaign: 'Spring Sale 30% off', sent: '24,580', open: '52%', click: '14.2%', revenue: '$48,920' },
  { id: '2', campaign: 'Welcome Series — Step 1', sent: '12,400', open: '68%', click: '21.6%', revenue: '$12,140' },
  { id: '3', campaign: 'Black Friday Teaser', sent: '18,902', open: '49%', click: '11.8%', revenue: '$31,310' },
  { id: '4', campaign: 'Loyalty re-engagement', sent: '7,310', open: '38%', click: '7.1%', revenue: '$6,400' },
];

const reports = [
  { id: 'r-1', name: 'Q1 2026 Engagement Report', updated: 'May 10, 2026', size: '2.4 MB' },
  { id: 'r-2', name: 'Campaign Funnel — Spring', updated: 'May 8, 2026', size: '1.1 MB' },
  { id: 'r-3', name: 'Top Segments Performance', updated: 'May 4, 2026', size: '860 KB' },
];

const ranges = ['Last 7 days', 'Last 30 days', 'Last quarter', 'Year to date'];

export default function ViewerDashboard() {
  const [range, setRange] = useState('Last 30 days');

  return (
    <div className="space-y-6">
      <WelcomeBanner
        subtitle="Read-only analytics across the workspace. Filter by date range and export any view you like."
        action={
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-xs font-semibold text-white">
              <CalendarRange className="h-4 w-4" />
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="appearance-none bg-transparent pr-1 text-white focus:outline-none"
              >
                {ranges.map((r) => (
                  <option key={r} value={r} className="text-slate-900">
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <button className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-slate-100">
              <Download className="h-4 w-4" /> Export
            </button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard Icon={Mail} label="Total campaigns" value="128" delta="+8 this period" tone="from-indigo-500 to-blue-500" />
        <StatCard Icon={Send} label="Total emails sent" value="1.24M" delta="+12.4%" tone="from-fuchsia-500 to-pink-500" delay={0.05} />
        <StatCard Icon={TrendingUp} label="Open rate" value="48.7%" delta="+3.1%" tone="from-emerald-500 to-teal-500" delay={0.1} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard Icon={MousePointerClick} label="Click rate" value="11.2%" delta="+1.8%" tone="from-amber-500 to-orange-500" />
        <StatCard Icon={AlertTriangle} label="Bounce rate" value="0.6%" delta="-0.2%" tone="from-rose-500 to-pink-500" delay={0.05} />
        <StatCard Icon={UserMinus} label="Unsubscribe rate" value="0.21%" delta="-0.04%" tone="from-slate-500 to-slate-700" delay={0.1} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard
            title="Top campaigns"
            hint={`Best performing campaigns • ${range}`}
            action={<Button variant="ghost"><Download className="h-4 w-4" /> Export</Button>}
          >
            <DataTable
              columns={[
                { key: 'campaign', label: 'Campaign' },
                { key: 'sent', label: 'Sent' },
                { key: 'open', label: 'Open' },
                { key: 'click', label: 'Click' },
                { key: 'revenue', label: 'Revenue', render: (r) => <Badge tone="emerald">{r.revenue}</Badge> },
              ]}
              rows={top}
            />
          </SectionCard>
        </div>
        <SectionCard title="Engagement trend" hint={`Open rate • ${range}`}>
          <MiniBars values={[40, 44, 47, 50, 53, 55, 58, 60, 62, 65, 68, 71]} tone="from-emerald-500 to-teal-500" />
        </SectionCard>
      </div>

      <SectionCard
        title="Reports summary"
        hint="Read-only exports — no edit permissions"
        action={<Button variant="ghost"><Download className="h-4 w-4" /> Download all</Button>}
      >
        <DataTable
          columns={[
            { key: 'name', label: 'Report' },
            { key: 'updated', label: 'Last updated' },
            { key: 'size', label: 'Size' },
            {
              key: 'actions',
              label: '',
              align: 'right',
              render: () => (
                <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                  <Download className="h-3.5 w-3.5" /> Export
                </button>
              ),
            },
          ]}
          rows={reports}
        />
      </SectionCard>
    </div>
  );
}
