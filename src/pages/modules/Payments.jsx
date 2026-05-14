import { Wallet, AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react';
import ModulePage from '../../components/ui/ModulePage.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { MODULES } from '../../config/permissions.js';

const rows = [
  { id: 'pay-1', tenant: 'Acme Inc.', amount: '$899.00', method: 'Razorpay', date: 'May 11, 2026', status: 'Succeeded' },
  { id: 'pay-2', tenant: 'Lumen & Co', amount: '$49.00', method: 'Card', date: 'May 11, 2026', status: 'Failed' },
  { id: 'pay-3', tenant: 'Beam Studios', amount: '$499.00', method: 'Razorpay', date: 'May 10, 2026', status: 'Succeeded' },
  { id: 'pay-4', tenant: 'Northwind', amount: '$2,150.00', method: 'Card', date: 'May 10, 2026', status: 'Refunded' },
  { id: 'pay-5', tenant: 'Pulsar Labs', amount: '$0.00', method: '—', date: 'May 9, 2026', status: 'Succeeded' },
];

const tone = { Succeeded: 'emerald', Failed: 'rose', Refunded: 'amber' };

export default function Payments() {
  return (
    <ModulePage
      module={MODULES.PAYMENTS}
      title="Payments"
      description="All Razorpay and card transactions across the platform, with retries and refunds."
      icon={Wallet}
      createLabel="Manual charge"
      tableKey="payments"
      mobileConfig={{
        mobileTitleKey: 'id',
        mobileSubtitleKey: 'tenant',
        mobileBadgeKey: 'status',
        mobileDetailKeys: ['amount', 'method', 'date'],
      }}
      stats={[
        { label: 'Succeeded (30d)', value: '$184,920', icon: CheckCircle2, tone: 'from-emerald-500 to-teal-500' },
        { label: 'Failed (30d)', value: '$1,420', deltaTone: 'negative', icon: AlertTriangle, tone: 'from-rose-500 to-orange-500' },
        { label: 'Refunded (30d)', value: '$2,150', icon: RotateCcw, tone: 'from-amber-500 to-orange-500' },
      ]}
      columns={[
        { key: 'id', label: 'Payment ID' },
        { key: 'tenant', label: 'Tenant' },
        { key: 'amount', label: 'Amount' },
        { key: 'method', label: 'Method' },
        { key: 'date', label: 'Date' },
        {
          key: 'status',
          label: 'Status',
          editable: true,
          editType: 'select',
          options: 'paymentStatus',
          render: (r) => <Badge tone={tone[r.status] || 'slate'}>{r.status}</Badge>,
        },
      ]}
      rows={rows}
    />
  );
}
