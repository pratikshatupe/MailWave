import {
  Mail,
  FileEdit,
  CalendarClock,
  Contact,
  TrendingUp,
  MousePointerClick,
  Workflow,
  Plus,
  Upload,
  LayoutTemplate,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/ui/StatCard.jsx';
import Badge from '../../components/ui/Badge.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import { MiniBars, SectionCard, WelcomeBanner } from './_common.jsx';

const recent = [
  { id: 'c-1', name: 'Spring Sale 30% off', sent: '24,580', open: '52%', click: '14.2%', status: 'Sent' },
  { id: 'c-2', name: 'Welcome Series — Step 3', sent: '3,210', open: '61%', click: '17.4%', status: 'Running' },
  { id: 'c-3', name: 'Black Friday Drop', sent: '0', open: '—', click: '—', status: 'Scheduled' },
];

const tone = { Sent: 'emerald', Scheduled: 'indigo', Running: 'fuchsia', Draft: 'slate' };

export default function MarketingManagerDashboard() {
  return (
    <div className="space-y-6">
      <WelcomeBanner subtitle="Your operational view — campaigns in flight, contacts engaging, automations doing their thing." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard Icon={Mail} label="Active campaigns" value="8" delta="2 launching today" tone="from-indigo-500 to-blue-500" />
        <StatCard Icon={FileEdit} label="Draft campaigns" value="4" delta="+1 today" tone="from-fuchsia-500 to-pink-500" delay={0.05} />
        <StatCard Icon={CalendarClock} label="Scheduled campaigns" value="3" delta="Next: tomorrow 9:00 AM" deltaTone="neutral" tone="from-cyan-500 to-blue-500" delay={0.1} />
        <StatCard Icon={Contact} label="Contacts" value="42,580" delta="+312 this week" tone="from-emerald-500 to-teal-500" delay={0.15} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard Icon={TrendingUp} label="Open rate" value="48.7%" delta="+3.1%" tone="from-emerald-500 to-teal-500" />
        <StatCard Icon={MousePointerClick} label="Click rate" value="11.2%" delta="+1.8%" tone="from-amber-500 to-orange-500" delay={0.05} />
        <StatCard Icon={Workflow} label="Running automations" value="6" delta="0 errors" tone="from-violet-500 to-fuchsia-500" delay={0.1} />
      </div>

      <SectionCard title="Quick actions" hint="Jump straight into the things you do every day">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction to="/app/campaigns" Icon={Plus} title="Create Campaign" tone="from-indigo-500 to-blue-500" />
          <QuickAction to="/app/contacts" Icon={Upload} title="Import Contacts" tone="from-emerald-500 to-teal-500" />
          <QuickAction to="/app/templates" Icon={LayoutTemplate} title="Create Template" tone="from-fuchsia-500 to-pink-500" />
          <QuickAction to="/app/automations" Icon={Workflow} title="Create Automation" tone="from-amber-500 to-orange-500" />
        </div>
      </SectionCard>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard title="Recent campaign performance" hint="Open / Click trend across your last 12 sends">
            <MiniBars values={[44, 51, 49, 60, 56, 67, 64, 72, 70, 78, 75, 84]} />
          </SectionCard>
        </div>
        <SectionCard title="Today’s focus">
          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-200">Approve “Black Friday Drop”</span>
              <Badge tone="amber">Pending</Badge>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-200">Review re-engagement segment</span>
              <Badge tone="indigo">Open</Badge>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-200">Send weekly newsletter</span>
              <Badge tone="emerald">Done</Badge>
            </li>
          </ul>
        </SectionCard>
      </div>

      <SectionCard title="Recent campaigns">
        <DataTable
          columns={[
            { key: 'name', label: 'Campaign' },
            { key: 'sent', label: 'Sent' },
            { key: 'open', label: 'Open' },
            { key: 'click', label: 'Click' },
            { key: 'status', label: 'Status', render: (r) => <Badge tone={tone[r.status] || 'slate'}>{r.status}</Badge> },
          ]}
          rows={recent}
        />
      </SectionCard>
    </div>
  );
}

function QuickAction({ to, Icon, title, tone }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card dark:border-slate-800 dark:bg-slate-900"
    >
      <span className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${tone} text-white shadow-glow`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700 dark:text-white dark:group-hover:text-indigo-300">
        {title}
      </div>
    </Link>
  );
}
