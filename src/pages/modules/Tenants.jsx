import { Building2, Users, Activity, AlertTriangle } from 'lucide-react';
import ModulePage from '../../components/ui/ModulePage.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { MODULES } from '../../config/permissions.js';

const rows = [
  { id: 't-1', name: 'Acme Inc.', plan: 'Growth', owner: 'jane@acme.com', users: 28, status: 'Active', joined: 'Feb 2024' },
  { id: 't-2', name: 'Northwind', plan: 'Scale', owner: 'eli@northwind.io', users: 64, status: 'Active', joined: 'Jan 2024' },
  { id: 't-3', name: 'Pulsar Labs', plan: 'Growth', owner: 'sara@pulsar.dev', users: 12, status: 'Trial', joined: 'May 2026' },
  { id: 't-4', name: 'Lumen & Co', plan: 'Starter', owner: 'kim@lumen.co', users: 4, status: 'Past Due', joined: 'Oct 2025' },
  { id: 't-5', name: 'Beam Studios', plan: 'Growth', owner: 'rio@beam.io', users: 18, status: 'Active', joined: 'Dec 2024' },
];

const tone = { Active: 'emerald', Trial: 'indigo', 'Past Due': 'rose', Suspended: 'rose' };

export default function Tenants() {
  return (
    <ModulePage
      module={MODULES.TENANTS}
      title="Tenants / Organizations"
      description="Every organization on the platform — manage status, plans and ownership."
      icon={Building2}
      createLabel="Onboard tenant"
      stats={[
        { label: 'Active tenants', value: '216', icon: Building2, tone: 'from-indigo-500 to-blue-500' },
        { label: 'On trial', value: '32', icon: Activity, tone: 'from-fuchsia-500 to-pink-500' },
        { label: 'Past due', value: '11', deltaTone: 'negative', icon: AlertTriangle, tone: 'from-rose-500 to-orange-500' },
        { label: 'Total users', value: '4,612', icon: Users, tone: 'from-emerald-500 to-teal-500' },
      ]}
      columns={[
        { key: 'name', label: 'Tenant' },
        { key: 'plan', label: 'Plan' },
        { key: 'owner', label: 'Owner email' },
        { key: 'users', label: 'Users' },
        { key: 'joined', label: 'Joined' },
        { key: 'status', label: 'Status', render: (r) => <Badge tone={tone[r.status] || 'slate'}>{r.status}</Badge> },
      ]}
      rows={rows}
    />
  );
}
