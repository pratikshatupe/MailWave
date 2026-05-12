import { Plug, KeyRound, Webhook, ShieldCheck } from 'lucide-react';
import ModulePage from '../../components/ui/ModulePage.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { MODULES } from '../../config/permissions.js';

const rows = [
  { id: 1, name: 'SendGrid', category: 'Email provider', status: 'Connected', updated: 'Today' },
  { id: 2, name: 'Amazon SES', category: 'Email provider', status: 'Disconnected', updated: 'May 4' },
  { id: 3, name: 'Razorpay', category: 'Billing', status: 'Connected', updated: 'May 8' },
  { id: 4, name: 'Slack #marketing', category: 'Notifications', status: 'Connected', updated: 'May 6' },
  { id: 5, name: 'Zapier', category: 'Automation', status: 'Connected', updated: 'Apr 28' },
];

const tone = { Connected: 'emerald', Disconnected: 'rose', Pending: 'amber' };

export default function ApiIntegrations() {
  return (
    <ModulePage
      module={MODULES.API_INTEGRATIONS}
      title="API Integrations"
      description="Connect Mailwave to your stack — email providers, billing, analytics and your favorite tools."
      icon={Plug}
      createLabel="Add integration"
      stats={[
        { label: 'Active integrations', value: '7', icon: Plug, tone: 'from-indigo-500 to-blue-500' },
        { label: 'API keys', value: '3', icon: KeyRound, tone: 'from-fuchsia-500 to-pink-500' },
        { label: 'Webhooks', value: '12', icon: Webhook, tone: 'from-emerald-500 to-teal-500' },
        { label: 'Security score', value: 'A+', icon: ShieldCheck, tone: 'from-amber-500 to-orange-500' },
      ]}
      columns={[
        { key: 'name', label: 'Integration' },
        { key: 'category', label: 'Category' },
        { key: 'updated', label: 'Last sync' },
        { key: 'status', label: 'Status', render: (r) => <Badge tone={tone[r.status] || 'slate'}>{r.status}</Badge> },
      ]}
      rows={rows}
    />
  );
}
