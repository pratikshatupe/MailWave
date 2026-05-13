import { Filter, Users, Sparkles } from 'lucide-react';
import ModulePage from '../../components/ui/ModulePage.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { MODULES } from '../../config/permissions.js';

const rows = [
  { id: 1, name: 'High-intent buyers', rule: 'Opened ≥ 3 last 30d AND clicked ≥ 1', size: '4,820', status: 'Live' },
  { id: 2, name: 'Cart abandoners', rule: 'Added to cart AND did not purchase (24h)', size: '912', status: 'Live' },
  { id: 3, name: 'Cold subscribers', rule: 'No open in 90 days', size: '2,140', status: 'Live' },
  { id: 4, name: 'Trial about to expire', rule: 'Trial ends ≤ 3 days', size: '78', status: 'Draft' },
];

const tone = { Live: 'emerald', Draft: 'slate' };

export default function Segments() {
  return (
    <ModulePage
      module={MODULES.SEGMENTS}
      title="Segments"
      description="Group contacts by behaviour, intent or attributes — and target them with precision."
      icon={Filter}
      createLabel="New segment"
      tableKey="segments"
      mobileConfig={{
        mobileTitleKey: 'name',
        mobileSubtitleKey: 'rule',
        mobileBadgeKey: 'status',
        mobileDetailKeys: ['size'],
      }}
      stats={[
        { label: 'Total segments', value: '24', icon: Filter, tone: 'from-indigo-500 to-blue-500' },
        { label: 'Avg. size', value: '1,892', icon: Users, tone: 'from-fuchsia-500 to-pink-500' },
        { label: 'AI segment suggestions', value: '5', delta: 'new', icon: Sparkles, tone: 'from-emerald-500 to-teal-500' },
      ]}
      columns={[
        { key: 'name', label: 'Segment' },
        { key: 'rule', label: 'Rule' },
        { key: 'size', label: 'Size' },
        { key: 'status', label: 'Status', render: (r) => <Badge tone={tone[r.status] || 'slate'}>{r.status}</Badge> },
      ]}
      rows={rows}
    />
  );
}
