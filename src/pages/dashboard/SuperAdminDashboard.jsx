import {
  Building2,
  CreditCard,
  Wallet,
  Mail,
  Users as UsersIcon,
  Megaphone,
  AlertTriangle,
  HeartPulse,
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard.jsx';
import Badge from '../../components/ui/Badge.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import { MiniBars, SectionCard, WelcomeBanner } from './_common.jsx';

const tenants = [
  { id: 't-1', name: 'Acme Inc.', plan: 'Growth', users: 28, status: 'Active', mrr: '$899' },
  { id: 't-2', name: 'Northwind', plan: 'Scale', users: 64, status: 'Active', mrr: '$2,150' },
  { id: 't-3', name: 'Pulsar Labs', plan: 'Growth', users: 12, status: 'Trial', mrr: '$0' },
  { id: 't-4', name: 'Lumen & Co', plan: 'Starter', users: 4, status: 'Past Due', mrr: '$49' },
  { id: 't-5', name: 'Beam Studios', plan: 'Growth', users: 18, status: 'Active', mrr: '$499' },
];

const payments = [
  { id: 'p-1', tenant: 'Acme Inc.', amount: '$899.00', method: 'Razorpay', status: 'Succeeded', date: 'May 11, 2026' },
  { id: 'p-2', tenant: 'Lumen & Co', amount: '$49.00', method: 'Card', status: 'Failed', date: 'May 11, 2026' },
  { id: 'p-3', tenant: 'Beam Studios', amount: '$499.00', method: 'Razorpay', status: 'Succeeded', date: 'May 10, 2026' },
  { id: 'p-4', tenant: 'Northwind', amount: '$2,150.00', method: 'Card', status: 'Succeeded', date: 'May 10, 2026' },
];

const statusTone = {
  Active: 'emerald',
  Trial: 'indigo',
  'Past Due': 'rose',
  Succeeded: 'emerald',
  Failed: 'rose',
};

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      <WelcomeBanner subtitle="Platform-wide overview across every tenant, plan, and payment. All systems healthy." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard Icon={Building2} label="Total tenants" value="248" delta="+12 this month" tone="from-indigo-500 to-blue-500" />
        <StatCard Icon={CreditCard} label="Active subscriptions" value="216" delta="+8" tone="from-fuchsia-500 to-pink-500" delay={0.05} />
        <StatCard Icon={Wallet} label="Monthly revenue" value="$184,920" delta="+18.4%" tone="from-emerald-500 to-teal-500" delay={0.1} />
        <StatCard Icon={Mail} label="Total emails sent" value="48.2M" delta="+3.1M" tone="from-amber-500 to-orange-500" delay={0.15} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard Icon={UsersIcon} label="Total users" value="4,612" delta="+96" tone="from-cyan-500 to-blue-500" />
        <StatCard Icon={Megaphone} label="Active campaigns" value="1,284" delta="+42" tone="from-violet-500 to-fuchsia-500" delay={0.05} />
        <StatCard Icon={AlertTriangle} label="Failed payments" value="11" delta="+3 today" deltaTone="negative" tone="from-rose-500 to-orange-500" delay={0.1} />
        <StatCard Icon={HeartPulse} label="System health" value="99.97%" delta="Operational" tone="from-emerald-500 to-cyan-500" delay={0.15} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard title="Global campaign activity" hint="Email volume across all tenants — last 12 weeks">
            <MiniBars values={[38, 52, 41, 67, 58, 74, 63, 81, 71, 88, 76, 92]} />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span>Sent: 48.2M</span>
              <span>Delivered: 47.6M</span>
              <span>Bounced: 0.6M</span>
              <span>Complaints: 1,204</span>
            </div>
          </SectionCard>
        </div>
        <SectionCard title="Global analytics" hint="Open / Click trend">
          <MiniBars values={[40, 46, 49, 52, 55, 58, 60, 63, 65, 68, 71, 74]} tone="from-emerald-500 to-teal-500" />
          <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60">
              <div className="font-bold text-slate-900 dark:text-white">47.2%</div>
              <div className="text-slate-500 dark:text-slate-400">Open rate</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60">
              <div className="font-bold text-slate-900 dark:text-white">12.3%</div>
              <div className="text-slate-500 dark:text-slate-400">Click rate</div>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Recent tenants" hint="Latest organizations on the platform">
        <DataTable
          columns={[
            { key: 'name', label: 'Tenant' },
            { key: 'plan', label: 'Plan' },
            { key: 'users', label: 'Users' },
            { key: 'mrr', label: 'MRR' },
            {
              key: 'status',
              label: 'Status',
              render: (r) => <Badge tone={statusTone[r.status] || 'slate'}>{r.status}</Badge>,
            },
          ]}
          rows={tenants}
        />
      </SectionCard>

      <SectionCard title="Recent payments" hint="Across all tenants">
        <DataTable
          columns={[
            { key: 'tenant', label: 'Tenant' },
            { key: 'amount', label: 'Amount' },
            { key: 'method', label: 'Method' },
            { key: 'date', label: 'Date' },
            {
              key: 'status',
              label: 'Status',
              render: (r) => <Badge tone={statusTone[r.status] || 'slate'}>{r.status}</Badge>,
            },
          ]}
          rows={payments}
        />
      </SectionCard>
    </div>
  );
}
