import { BarChart3, TrendingUp, MousePointerClick, AlertTriangle, UserMinus } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import Button from '../../components/ui/Button.jsx';
import { Download } from 'lucide-react';
import { MiniBars, SectionCard } from '../dashboard/_common.jsx';

export default function Analytics() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Track engagement, deliverability, conversions and revenue across every campaign."
        icon={BarChart3}
        eyebrow="Insights"
        actions={<Button variant="ghost"><Download className="h-4 w-4" /> Export</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard Icon={TrendingUp} label="Open rate" value="48.7%" delta="+3.1%" tone="from-emerald-500 to-teal-500" />
        <StatCard Icon={MousePointerClick} label="Click rate" value="11.2%" delta="+1.8%" tone="from-fuchsia-500 to-pink-500" delay={0.05} />
        <StatCard Icon={AlertTriangle} label="Bounce rate" value="0.6%" delta="-0.2%" tone="from-rose-500 to-orange-500" delay={0.1} />
        <StatCard Icon={UserMinus} label="Unsubscribe rate" value="0.21%" delta="-0.04%" tone="from-slate-500 to-slate-700" delay={0.15} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard title="Engagement over time" hint="Open & click trend — last 12 weeks">
            <MiniBars values={[40, 46, 49, 52, 55, 58, 60, 63, 65, 68, 71, 74]} />
          </SectionCard>
        </div>
        <SectionCard title="Top devices" hint="By open share">
          <ul className="space-y-3 text-sm">
            <DeviceRow label="Mobile (iOS)" pct={48} tone="from-indigo-500 to-blue-500" />
            <DeviceRow label="Desktop" pct={31} tone="from-fuchsia-500 to-pink-500" />
            <DeviceRow label="Mobile (Android)" pct={18} tone="from-emerald-500 to-teal-500" />
            <DeviceRow label="Other" pct={3} tone="from-slate-500 to-slate-700" />
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}

function DeviceRow({ label, pct, tone }) {
  return (
    <li>
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="text-slate-700 dark:text-slate-200">{label}</span>
        <span className="text-slate-500 dark:text-slate-400">{pct}%</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className={`h-full rounded-full bg-gradient-to-r ${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </li>
  );
}
