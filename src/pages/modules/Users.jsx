import { UsersRound, ShieldCheck, UserCheck, UserX } from 'lucide-react';
import ModulePage from '../../components/ui/ModulePage.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { MODULES } from '../../config/permissions.js';

const rows = [
  { id: 1, name: 'Alex Carter', email: 'alex.c@mailwave.com', tenant: 'Platform', role: 'Super Admin', status: 'Active' },
  { id: 2, name: 'Jane Cooper', email: 'jane@acme.com', tenant: 'Acme Inc.', role: 'Business Admin', status: 'Active' },
  { id: 3, name: 'Devon Lane', email: 'devon@acme.com', tenant: 'Acme Inc.', role: 'Marketing Manager', status: 'Active' },
  { id: 4, name: 'Riya Sharma', email: 'riya@acme.com', tenant: 'Acme Inc.', role: 'Viewer', status: 'Active' },
  { id: 5, name: 'Marco Diaz', email: 'marco@beam.io', tenant: 'Beam Studios', role: 'Individual', status: 'Active' },
  { id: 6, name: 'Kim Park', email: 'kim@lumen.co', tenant: 'Lumen & Co', role: 'Business Admin', status: 'Suspended' },
];

const tone = { Active: 'emerald', Invited: 'amber', Suspended: 'rose' };

export default function Users() {
  return (
    <ModulePage
      module={MODULES.USERS}
      title="Users"
      description="All users across every tenant — invite, suspend or reassign roles."
      icon={UsersRound}
      createLabel="Add user"
      stats={[
        { label: 'Total users', value: '4,612', icon: UsersRound, tone: 'from-indigo-500 to-blue-500' },
        { label: 'Active', value: '4,580', icon: UserCheck, tone: 'from-emerald-500 to-teal-500' },
        { label: 'Suspended', value: '32', icon: UserX, deltaTone: 'negative', tone: 'from-rose-500 to-orange-500' },
        { label: 'Admins', value: '124', icon: ShieldCheck, tone: 'from-fuchsia-500 to-pink-500' },
      ]}
      columns={[
        { key: 'name', label: 'User' },
        { key: 'email', label: 'Email' },
        { key: 'tenant', label: 'Tenant' },
        { key: 'role', label: 'Role' },
        { key: 'status', label: 'Status', render: (r) => <Badge tone={tone[r.status] || 'slate'}>{r.status}</Badge> },
      ]}
      rows={rows}
    />
  );
}
