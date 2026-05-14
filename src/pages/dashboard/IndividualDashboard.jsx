// import {
//   Contact,
//   Mail,
//   TrendingUp,
//   MousePointerClick,
//   Workflow,
//   CreditCard,
//   Gift,
//   Ticket,
//   Plus,
//   Upload,
//   LayoutTemplate,
// } from 'lucide-react';
// import { Link } from 'react-router-dom';
// import StatCard from '../../components/ui/StatCard.jsx';
// import Badge from '../../components/ui/Badge.jsx';
// import { MiniBars, SectionCard, WelcomeBanner } from './_common.jsx';

// export default function IndividualDashboard() {
//   return (
//     <div className="space-y-6">
//       <WelcomeBanner
//         subtitle="Your personal workspace. Stay on top of your sends, automations and your Starter plan limits."
//         action={
//           <Link to="/app/subscription" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-slate-100">
//             <CreditCard className="h-4 w-4" /> Upgrade plan
//           </Link>
//         }
//       />

//       <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
//         <StatCard Icon={Contact} label="Contacts" value="1,284" delta="+24 this week" tone="from-indigo-500 to-blue-500" />
//         <StatCard Icon={Mail} label="Emails sent this month" value="6,820 / 10,000" delta="68% used" tone="from-fuchsia-500 to-pink-500" delay={0.05} />
//         <StatCard Icon={TrendingUp} label="Open rate" value="44.3%" delta="+2.1%" tone="from-emerald-500 to-teal-500" delay={0.1} />
//         <StatCard Icon={MousePointerClick} label="Click rate" value="9.8%" delta="+0.6%" tone="from-amber-500 to-orange-500" delay={0.15} />
//       </div>

//       <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
//         <StatCard Icon={Workflow} label="Active automations" value="3" delta="0 errors" tone="from-cyan-500 to-blue-500" />
//         <StatCard Icon={CreditCard} label="Current plan" value="Starter" delta="$19/mo" deltaTone="neutral" tone="from-slate-500 to-slate-700" delay={0.05} />
//         <StatCard Icon={Gift} label="Referral earnings" value="$60" delta="3 referrals" tone="from-fuchsia-500 to-violet-500" delay={0.1} />
//         <StatCard Icon={Ticket} label="Coupon usage" value="2 / 5" delta="active" deltaTone="neutral" tone="from-emerald-500 to-cyan-500" delay={0.15} />
//       </div>

//       <SectionCard title="Quick actions" hint="Get going in one click">
//         <div className="grid gap-3 sm:grid-cols-3">
//           <QuickAction to="/app/campaigns" Icon={Plus} title="Create Campaign" tone="from-indigo-500 to-blue-500" />
//           <QuickAction to="/app/contacts" Icon={Upload} title="Import Contacts" tone="from-emerald-500 to-teal-500" />
//           <QuickAction to="/app/templates" Icon={LayoutTemplate} title="Create Template" tone="from-fuchsia-500 to-pink-500" />
//         </div>
//       </SectionCard>

//       <div className="grid gap-5 lg:grid-cols-3">
//         <div className="lg:col-span-2">
//           <SectionCard title="Your engagement" hint="Open / Click trend — last 12 weeks">
//             <MiniBars values={[36, 41, 39, 46, 50, 54, 56, 60, 62, 67, 70, 74]} />
//           </SectionCard>
//         </div>
//         <SectionCard title="Plan & limits" hint="Starter plan">
//           <div className="space-y-3 text-sm">
//             <Limit label="Emails" used={6820} total={10000} tone="from-indigo-500 to-fuchsia-500" />
//             <Limit label="Contacts" used={1284} total={2500} tone="from-emerald-500 to-teal-500" />
//             <Limit label="Automations" used={3} total={5} tone="from-cyan-500 to-blue-500" />
//           </div>
//           <div className="mt-4 flex items-center justify-between">
//             <Badge tone="indigo">7-day trial ends in 4 days</Badge>
//             <Link to="/app/subscription" className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-300">
//               Upgrade →
//             </Link>
//           </div>
//         </SectionCard>
//       </div>
//     </div>
//   );
// }

// function QuickAction({ to, Icon, title, tone }) {
//   return (
//     <Link
//       to={to}
//       className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card dark:border-slate-800 dark:bg-slate-900"
//     >
//       <span className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${tone} text-white shadow-glow`}>
//         <Icon className="h-5 w-5" />
//       </span>
//       <div className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700 dark:text-white dark:group-hover:text-indigo-300">
//         {title}
//       </div>
//     </Link>
//   );
// }

// function Limit({ label, used, total, tone }) {
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
//         <div className={`h-full rounded-full bg-gradient-to-r ${tone}`} style={{ width: `${pct}%` }} />
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
  CreditCard,
  Gift,
  Ticket,
  Plus,
  Upload,
  LayoutTemplate,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/ui/StatCard.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { MiniBars, SectionCard, WelcomeBanner } from './_common.jsx';

export default function IndividualDashboard() {
  return (
    <div className="space-y-6">
      <WelcomeBanner
        action={
          <Link to="/app/subscription" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
            <CreditCard className="h-4 w-4" /> Upgrade plan
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard Icon={Contact} label="Contacts" value="1,284" delta="+24 this week" tone="from-indigo-500 to-blue-500" />
        <StatCard Icon={Mail} label="Emails sent this month" value="6,820 / 10,000" delta="68% used" tone="from-fuchsia-500 to-pink-500" delay={0.05} />
        <StatCard Icon={TrendingUp} label="Open rate" value="44.3%" delta="+2.1%" tone="from-emerald-500 to-teal-500" delay={0.1} />
        <StatCard Icon={MousePointerClick} label="Click rate" value="9.8%" delta="+0.6%" tone="from-amber-500 to-orange-500" delay={0.15} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard Icon={Workflow} label="Active automations" value="3" delta="0 errors" tone="from-cyan-500 to-blue-500" />
        <StatCard Icon={CreditCard} label="Current plan" value="Starter" delta="$19/mo" deltaTone="neutral" tone="from-slate-500 to-slate-700" delay={0.05} />
        <StatCard Icon={Gift} label="Referral earnings" value="$60" delta="3 referrals" tone="from-fuchsia-500 to-violet-500" delay={0.1} />
        <StatCard Icon={Ticket} label="Coupon usage" value="2 / 5" delta="active" deltaTone="neutral" tone="from-emerald-500 to-cyan-500" delay={0.15} />
      </div>

      <SectionCard title="Quick actions" hint="Get going in one click">
        <div className="grid gap-3 sm:grid-cols-3">
          <QuickAction to="/app/campaigns" Icon={Plus} title="Create Campaign" tone="from-indigo-500 to-blue-500" />
          <QuickAction to="/app/contacts" Icon={Upload} title="Import Contacts" tone="from-emerald-500 to-teal-500" />
          <QuickAction to="/app/templates" Icon={LayoutTemplate} title="Create Template" tone="from-fuchsia-500 to-pink-500" />
        </div>
      </SectionCard>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard title="Your engagement" hint="Open / Click trend — last 12 weeks">
            <MiniBars values={[36, 41, 39, 46, 50, 54, 56, 60, 62, 67, 70, 74]} />
          </SectionCard>
        </div>
        <SectionCard title="Plan & limits" hint="Starter plan">
          <div className="space-y-3 text-sm">
            <Limit label="Emails" used={6820} total={10000} tone="from-indigo-500 to-fuchsia-500" />
            <Limit label="Contacts" used={1284} total={2500} tone="from-emerald-500 to-teal-500" />
            <Limit label="Automations" used={3} total={5} tone="from-cyan-500 to-blue-500" />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Badge tone="indigo">7-day trial ends in 4 days</Badge>
            <Link to="/app/subscription" className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-300">
              Upgrade →
            </Link>
          </div>
        </SectionCard>
      </div>
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

function Limit({ label, used, total, tone }) {
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
        <div className={`h-full rounded-full bg-gradient-to-r ${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}