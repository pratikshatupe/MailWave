import { Layers, Users, Wallet } from 'lucide-react';
import ModulePage from '../../components/ui/ModulePage.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { MODULES } from '../../config/permissions.js';

const rows = [
  { id: 1, name: 'Starter', price: '$19/mo', emails: '10,000', contacts: '2,500', tenants: 124, status: 'Live' },
  { id: 2, name: 'Growth', price: '$899/mo', emails: '500,000', contacts: '75,000', tenants: 86, status: 'Live' },
  { id: 3, name: 'Scale', price: '$2,150/mo', emails: 'Unlimited', contacts: 'Unlimited', tenants: 32, status: 'Live' },
  { id: 4, name: 'Free Trial', price: '7 days', emails: '1,000', contacts: '500', tenants: 6, status: 'Live' },
];

const tone = { Live: 'emerald', Draft: 'slate', Retired: 'rose' };

export default function Plans() {
  return (
    <ModulePage
      module={MODULES.PLANS}
      title="Plans"
      description="Configure SaaS subscription plans, pricing, quotas and trial behaviour."
      icon={Layers}
      createLabel="New plan"
      tableKey="plans"
      mobileConfig={{
        mobileTitleKey: 'name',
        mobileSubtitleKey: 'price',
        mobileBadgeKey: 'status',
        mobileDetailKeys: ['emails', 'contacts', 'tenants'],
      }}
      stats={[
        { label: 'Total plans', value: '4', icon: Layers, tone: 'from-indigo-500 to-blue-500' },
        { label: 'Paying tenants', value: '242', icon: Users, tone: 'from-emerald-500 to-teal-500' },
        { label: 'MRR', value: '$184,920', delta: '+18.4%', icon: Wallet, tone: 'from-fuchsia-500 to-pink-500' },
      ]}
      columns={[
        { key: 'name', label: 'Plan' },
        { key: 'price', label: 'Price' },
        { key: 'emails', label: 'Email quota' },
        { key: 'contacts', label: 'Contact quota' },
        { key: 'tenants', label: 'Tenants' },
        { key: 'status', label: 'Status', render: (r) => <Badge tone={tone[r.status] || 'slate'}>{r.status}</Badge> },
      ]}
      rows={rows}
    />
  );
}
