// import {
//   Contact,
//   Mail,
//   TrendingUp,
//   MousePointerClick,
//   Workflow,
//   Gauge,
//   CreditCard,
//   ClipboardCheck,
//   Plus,
// } from 'lucide-react';
// import { Link } from 'react-router-dom';
// import StatCard from '../../components/ui/StatCard.jsx';
// import Badge from '../../components/ui/Badge.jsx';
// import DataTable from '../../components/ui/DataTable.jsx';
// import Button from '../../components/ui/Button.jsx';
// import { MiniBars, SectionCard, WelcomeBanner } from './_common.jsx';

// const campaigns = [
//   { id: 'c-1', name: 'Spring Sale 30% off', sent: '24,580', open: '52%', click: '14.2%', status: 'Sent' },
//   { id: 'c-2', name: 'Black Friday Drop', sent: '18,902', open: '49%', click: '11.8%', status: 'Scheduled' },
//   { id: 'c-3', name: 'Loyalty re-engagement', sent: '7,310', open: '38%', click: '7.1%', status: 'Running' },
//   { id: 'c-4', name: 'New product teaser', sent: '—', open: '—', click: '—', status: 'Draft' },
// ];

// const teamActivity = [
//   { id: 'a-1', who: 'Devon Lane', action: 'created campaign “Spring Sale”', when: '14 min ago' },
//   { id: 'a-2', who: 'Riya Sharma', action: 'exported analytics report', when: '1 hour ago' },
//   { id: 'a-3', who: 'You', action: 'approved 2 pending campaigns', when: 'Today, 09:14' },
//   { id: 'a-4', who: 'Marco Diaz', action: 'imported 312 new contacts', when: 'Yesterday' },
// ];

// const tone = {
//   Sent: 'emerald',
//   Scheduled: 'indigo',
//   Running: 'fuchsia',
//   Draft: 'slate',
// };

// export default function BusinessAdminDashboard() {
//   return (
//     <div className="space-y-6">
//       <WelcomeBanner
//         subtitle="Here’s a quick snapshot of your tenant workspace, team and email performance."
//         action={
//           <Link to="/app/campaigns" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-slate-100">
//             <Plus className="h-4 w-4" /> New campaign
//           </Link>
//         }
//       />

//       <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
//         <StatCard Icon={Contact} label="Total contacts" value="42,580" delta="+312" tone="from-indigo-500 to-blue-500" />
//         <StatCard Icon={Mail} label="Campaigns sent" value="128" delta="+8 this week" tone="from-fuchsia-500 to-pink-500" delay={0.05} />
//         <StatCard Icon={TrendingUp} label="Open rate" value="48.7%" delta="+3.1%" tone="from-emerald-500 to-teal-500" delay={0.1} />
//         <StatCard Icon={MousePointerClick} label="Click rate" value="11.2%" delta="+1.8%" tone="from-amber-500 to-orange-500" delay={0.15} />
//       </div>

//       <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
//         <StatCard Icon={Workflow} label="Automations running" value="14" delta="3 paused" deltaTone="neutral" tone="from-cyan-500 to-blue-500" />
//         <StatCard Icon={Gauge} label="Monthly email usage" value="312k / 500k" delta="62% used" tone="from-violet-500 to-fuchsia-500" delay={0.05} hint="Resets June 1, 2026" />
//         <StatCard Icon={CreditCard} label="Current plan" value="Growth" delta="$899/mo" deltaTone="neutral" tone="from-slate-500 to-slate-700" delay={0.1} />
//         <StatCard Icon={ClipboardCheck} label="Pending approvals" value="2" delta="Action needed" deltaTone="negative" tone="from-rose-500 to-orange-500" delay={0.15} />
//       </div>

//       <div className="grid gap-5 lg:grid-cols-3">
//         <div className="lg:col-span-2">
//           <SectionCard title="Performance" hint="Engagement across all campaigns — last 12 weeks">
//             <MiniBars values={[42, 55, 47, 64, 58, 71, 66, 78, 73, 86, 79, 91]} />
//           </SectionCard>
//         </div>
//         <SectionCard title="Usage limits" hint="Plan: Growth">
//           <div className="space-y-3 text-sm">
//             <UsageBar label="Emails" used={312000} total={500000} tone="from-indigo-500 to-fuchsia-500" />
//             <UsageBar label="Contacts" used={42580} total={75000} tone="from-emerald-500 to-teal-500" />
//             <UsageBar label="Automations" used={14} total={50} tone="from-cyan-500 to-blue-500" />
//             <UsageBar label="Team members" used={12} total={25} tone="from-fuchsia-500 to-pink-500" />
//           </div>
//           <Link to="/app/billing" className="mt-4 inline-block text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-300">
//             View billing & limits →
//           </Link>
//         </SectionCard>
//       </div>

//       <SectionCard title="Recent campaigns" action={<Button variant="ghost">View all</Button>}>
//         <DataTable
//           columns={[
//             { key: 'name', label: 'Campaign' },
//             { key: 'sent', label: 'Sent' },
//             { key: 'open', label: 'Open rate' },
//             { key: 'click', label: 'Click rate' },
//             { key: 'status', label: 'Status', render: (r) => <Badge tone={tone[r.status] || 'slate'}>{r.status}</Badge> },
//           ]}
//           rows={campaigns}
//         />
//       </SectionCard>

//       <SectionCard title="Team activity">
//         <ul className="space-y-3 text-sm">
//           {teamActivity.map((a) => (
//             <li key={a.id} className="flex items-start gap-3">
//               <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" />
//               <div className="flex-1">
//                 <span className="font-semibold text-slate-900 dark:text-white">{a.who}</span>{' '}
//                 <span className="text-slate-600 dark:text-slate-300">{a.action}</span>
//               </div>
//               <span className="text-[11px] text-slate-400">{a.when}</span>
//             </li>
//           ))}
//         </ul>
//       </SectionCard>
//     </div>
//   );
// }

// function UsageBar({ label, used, total, tone }) {
//   const pct = Math.min(100, Math.round((used / total) * 100));
//   return (
//     <div>
//       <div className="flex items-center justify-between text-xs font-medium">
//         <span className="text-slate-700 dark:text-slate-200">{label}</span>
//         <span className="text-slate-500 dark:text-slate-400">
//           {used.toLocaleString()} / {total.toLocaleString()}
//         </span>
//       </div>
//       <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
//         <div
//           className={`h-full rounded-full bg-gradient-to-r ${tone}`}
//           style={{ width: `${pct}%` }}
//         />
//       </div>
//     </div>
//   );
// }



import {
  Contact,
  Mail,
  TrendingUp,
  MousePointerClick,
  Workflow,
  Gauge,
  CreditCard,
  ClipboardCheck,
  Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/ui/StatCard.jsx';
import Badge from '../../components/ui/Badge.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Button from '../../components/ui/Button.jsx';
import { MiniBars, SectionCard, WelcomeBanner } from './_common.jsx';

const campaigns = [
  { id: 'c-1', name: 'Spring Sale 30% off', sent: '24,580', open: '52%', click: '14.2%', status: 'Sent' },
  { id: 'c-2', name: 'Black Friday Drop', sent: '18,902', open: '49%', click: '11.8%', status: 'Scheduled' },
  { id: 'c-3', name: 'Loyalty re-engagement', sent: '7,310', open: '38%', click: '7.1%', status: 'Running' },
  { id: 'c-4', name: 'New product teaser', sent: '—', open: '—', click: '—', status: 'Draft' },
];

const teamActivity = [
  { id: 'a-1', who: 'Devon Lane', action: 'created campaign “Spring Sale”', when: '14 min ago' },
  { id: 'a-2', who: 'Riya Sharma', action: 'exported analytics report', when: '1 hour ago' },
  { id: 'a-3', who: 'You', action: 'approved 2 pending campaigns', when: 'Today, 09:14' },
  { id: 'a-4', who: 'Marco Diaz', action: 'imported 312 new contacts', when: 'Yesterday' },
];

const tone = {
  Sent: 'emerald',
  Scheduled: 'indigo',
  Running: 'fuchsia',
  Draft: 'slate',
};

export default function BusinessAdminDashboard() {
  return (
    <div className="space-y-6">
      <WelcomeBanner
        action={
          <Link to="/app/campaigns" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
            <Plus className="h-4 w-4" /> New campaign
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard Icon={Contact} label="Total contacts" value="42,580" delta="+312" tone="from-indigo-500 to-blue-500" />
        <StatCard Icon={Mail} label="Campaigns sent" value="128" delta="+8 this week" tone="from-fuchsia-500 to-pink-500" delay={0.05} />
        <StatCard Icon={TrendingUp} label="Open rate" value="48.7%" delta="+3.1%" tone="from-emerald-500 to-teal-500" delay={0.1} />
        <StatCard Icon={MousePointerClick} label="Click rate" value="11.2%" delta="+1.8%" tone="from-amber-500 to-orange-500" delay={0.15} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard Icon={Workflow} label="Automations running" value="14" delta="3 paused" deltaTone="neutral" tone="from-cyan-500 to-blue-500" />
        <StatCard Icon={Gauge} label="Monthly email usage" value="312k / 500k" delta="62% used" tone="from-violet-500 to-fuchsia-500" delay={0.05} hint="Resets June 1, 2026" />
        <StatCard Icon={CreditCard} label="Current plan" value="Growth" delta="$899/mo" deltaTone="neutral" tone="from-slate-500 to-slate-700" delay={0.1} />
        <StatCard Icon={ClipboardCheck} label="Pending approvals" value="2" delta="Action needed" deltaTone="negative" tone="from-rose-500 to-orange-500" delay={0.15} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard title="Performance" hint="Engagement across all campaigns — last 12 weeks">
            <MiniBars values={[42, 55, 47, 64, 58, 71, 66, 78, 73, 86, 79, 91]} />
          </SectionCard>
        </div>
        <SectionCard title="Usage limits" hint="Plan: Growth">
          <div className="space-y-3 text-sm">
            <UsageBar label="Emails" used={312000} total={500000} tone="from-indigo-500 to-fuchsia-500" />
            <UsageBar label="Contacts" used={42580} total={75000} tone="from-emerald-500 to-teal-500" />
            <UsageBar label="Automations" used={14} total={50} tone="from-cyan-500 to-blue-500" />
            <UsageBar label="Team members" used={12} total={25} tone="from-fuchsia-500 to-pink-500" />
          </div>
          <Link to="/app/billing" className="mt-4 inline-block text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-300">
            View billing & limits →
          </Link>
        </SectionCard>
      </div>

      <SectionCard title="Recent campaigns" action={<Button variant="ghost">View all</Button>}>
        <DataTable
          columns={[
            { key: 'name', label: 'Campaign' },
            { key: 'sent', label: 'Sent' },
            { key: 'open', label: 'Open rate' },
            { key: 'click', label: 'Click rate' },
            { key: 'status', label: 'Status', render: (r) => <Badge tone={tone[r.status] || 'slate'}>{r.status}</Badge> },
          ]}
          rows={campaigns}
        />
      </SectionCard>

      <SectionCard title="Team activity">
        <ul className="space-y-3 text-sm">
          {teamActivity.map((a) => (
            <li key={a.id} className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" />
              <div className="flex-1">
                <span className="font-semibold text-slate-900 dark:text-white">{a.who}</span>{' '}
                <span className="text-slate-600 dark:text-slate-300">{a.action}</span>
              </div>
              <span className="text-[11px] text-slate-400">{a.when}</span>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}

function UsageBar({ label, used, total, tone }) {
  const pct = Math.min(100, Math.round((used / total) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="text-slate-700 dark:text-slate-200">{label}</span>
        <span className="text-slate-500 dark:text-slate-400">
          {used.toLocaleString()} / {total.toLocaleString()}
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${tone}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}