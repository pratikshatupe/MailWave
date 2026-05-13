import { CreditCard, Hourglass, AlertTriangle, Wallet } from 'lucide-react';
import ModulePage from '../../components/ui/ModulePage.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { MODULES } from '../../config/permissions.js';

const rows = [
  { id: 1, tenant: 'Acme Inc.', plan: 'Growth', cycle: 'Monthly', amount: '$899', next: 'Jun 1, 2026', status: 'Active' },
  { id: 2, tenant: 'Northwind', plan: 'Scale', cycle: 'Yearly', amount: '$25,800', next: 'Jan 1, 2027', status: 'Active' },
  { id: 3, tenant: 'Pulsar Labs', plan: 'Growth', cycle: 'Trial', amount: '$0', next: 'May 18, 2026', status: 'Trial' },
  { id: 4, tenant: 'Lumen & Co', plan: 'Starter', cycle: 'Monthly', amount: '$49', next: 'May 12, 2026', status: 'Past Due' },
];

const tone = { Active: 'emerald', Trial: 'indigo', 'Past Due': 'rose', Cancelled: 'slate' };

export default function Subscriptions() {
  return (
    <ModulePage
      module={MODULES.SUBSCRIPTIONS}
      title="Subscriptions"
      description="Every tenant subscription, cycle and renewal date — at a glance."
      icon={CreditCard}
      createLabel="Manual subscription"
      tableKey="subscriptions"
      mobileConfig={{
        mobileTitleKey: 'tenant',
        mobileSubtitleKey: 'plan',
        mobileBadgeKey: 'status',
        mobileDetailKeys: ['cycle', 'amount', 'next'],
      }}
      stats={[
        { label: 'Active', value: '216', icon: CreditCard, tone: 'from-indigo-500 to-blue-500' },
        { label: 'On trial', value: '32', icon: Hourglass, tone: 'from-fuchsia-500 to-pink-500' },
        { label: 'Past due', value: '11', deltaTone: 'negative', icon: AlertTriangle, tone: 'from-rose-500 to-orange-500' },
        { label: 'MRR', value: '$184,920', icon: Wallet, tone: 'from-emerald-500 to-teal-500' },
      ]}
      columns={[
        { key: 'tenant', label: 'Tenant' },
        { key: 'plan', label: 'Plan' },
        { key: 'cycle', label: 'Cycle' },
        { key: 'amount', label: 'Amount' },
        { key: 'next', label: 'Next charge' },
        { key: 'status', label: 'Status', render: (r) => <Badge tone={tone[r.status] || 'slate'}>{r.status}</Badge> },
      ]}
      rows={rows}
    />
  );
}
