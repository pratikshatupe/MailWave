import { Receipt, Wallet, Download } from 'lucide-react';
import ModulePage from '../../components/ui/ModulePage.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { MODULES } from '../../config/permissions.js';

const invoices = [
  { id: 'INV-1042', amount: '$899.00', method: 'Razorpay •••• 4242', status: 'Paid', date: 'May 1, 2026' },
  { id: 'INV-1018', amount: '$899.00', method: 'Razorpay •••• 4242', status: 'Paid', date: 'Apr 1, 2026' },
  { id: 'INV-0996', amount: '$899.00', method: 'Razorpay •••• 4242', status: 'Paid', date: 'Mar 1, 2026' },
];

const tone = { Paid: 'emerald', Pending: 'amber', Failed: 'rose' };

export default function Billing() {
  return (
    <ModulePage
      module={MODULES.BILLING}
      title="Billing"
      description="Invoices, payment methods and tax info — all powered by Razorpay."
      icon={Receipt}
      createLabel="Add payment method"
      showSearch={false}
      showFilter={false}
      stats={[
        { label: 'Next invoice', value: '$899', delta: 'Jun 1, 2026', icon: Wallet, tone: 'from-indigo-500 to-fuchsia-500' },
        { label: 'Lifetime spend', value: '$8,990', icon: Receipt, tone: 'from-emerald-500 to-teal-500' },
        { label: 'Invoices', value: '12', icon: Download, tone: 'from-fuchsia-500 to-pink-500' },
      ]}
      columns={[
        { key: 'id', label: 'Invoice' },
        { key: 'amount', label: 'Amount' },
        { key: 'method', label: 'Method' },
        { key: 'date', label: 'Date' },
        { key: 'status', label: 'Status', render: (r) => <Badge tone={tone[r.status] || 'slate'}>{r.status}</Badge> },
      ]}
      rows={invoices}
    />
  );
}
