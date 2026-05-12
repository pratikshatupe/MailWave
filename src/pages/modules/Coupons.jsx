import { Ticket, PercentCircle, BadgeCheck, Calendar } from 'lucide-react';
import ModulePage from '../../components/ui/ModulePage.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { MODULES } from '../../config/permissions.js';

const rows = [
  { id: 1, code: 'SPRING30', type: 'Percentage', value: '30%', usage: '128 / 500', expires: 'May 31, 2026', status: 'Active' },
  { id: 2, code: 'WELCOME10', type: 'Flat', value: '$10', usage: '912 / ∞', expires: 'No expiry', status: 'Active' },
  { id: 3, code: 'BLACKFRI', type: 'Percentage', value: '40%', usage: '0 / 1000', expires: 'Nov 30, 2026', status: 'Scheduled' },
  { id: 4, code: 'WINTER22', type: 'Percentage', value: '22%', usage: '422 / 1000', expires: 'Jan 1, 2026', status: 'Expired' },
];

const tone = { Active: 'emerald', Scheduled: 'indigo', Expired: 'slate', Draft: 'amber' };

export default function Coupons() {
  return (
    <ModulePage
      module={MODULES.COUPONS}
      title="Coupons"
      description="Create discount codes, gift offers and growth incentives — and track every redemption."
      icon={Ticket}
      createLabel="New coupon"
      stats={[
        { label: 'Active coupons', value: '12', icon: BadgeCheck, tone: 'from-emerald-500 to-teal-500' },
        { label: 'Total redemptions', value: '2,440', icon: PercentCircle, tone: 'from-fuchsia-500 to-pink-500' },
        { label: 'Expiring (30d)', value: '3', icon: Calendar, tone: 'from-amber-500 to-orange-500' },
      ]}
      columns={[
        { key: 'code', label: 'Code', render: (r) => <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">{r.code}</span> },
        { key: 'type', label: 'Type' },
        { key: 'value', label: 'Value' },
        { key: 'usage', label: 'Usage' },
        { key: 'expires', label: 'Expires' },
        { key: 'status', label: 'Status', render: (r) => <Badge tone={tone[r.status] || 'slate'}>{r.status}</Badge> },
      ]}
      rows={rows}
    />
  );
}
