import { UsersRound, ShieldCheck, UserPlus, UserCheck } from 'lucide-react';
import ModulePage from '../../components/ui/ModulePage.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { MODULES } from '../../config/permissions.js';

const rows = [
  { id: 1, name: 'Jane Cooper', email: 'jane@acme.com', role: 'Business Admin', status: 'Active', joined: 'Jan 2025' },
  { id: 2, name: 'Devon Lane', email: 'devon@acme.com', role: 'Marketing Manager', status: 'Active', joined: 'Feb 2025' },
  { id: 3, name: 'Riya Sharma', email: 'riya@acme.com', role: 'Viewer', status: 'Active', joined: 'Mar 2025' },
  { id: 4, name: 'Carlos Vega', email: 'carlos@acme.com', role: 'Marketing Manager', status: 'Invited', joined: '—' },
];

const tone = { Active: 'emerald', Invited: 'amber', Suspended: 'rose' };

export default function TeamMembers() {
  return (
    <ModulePage
      module={MODULES.TEAM_MEMBERS}
      title="Team Members"
      description="Manage who can access your workspace and what they can do."
      icon={UsersRound}
      createLabel="Invite member"
      tableKey="teamMembers"
      mobileConfig={{
        mobileTitleKey: 'name',
        mobileSubtitleKey: 'email',
        mobileBadgeKey: 'status',
        mobileDetailKeys: ['role', 'joined'],
      }}
      stats={[
        { label: 'Members', value: '12', icon: UsersRound, tone: 'from-indigo-500 to-blue-500' },
        { label: 'Active', value: '11', icon: UserCheck, tone: 'from-emerald-500 to-teal-500' },
        { label: 'Pending invites', value: '1', icon: UserPlus, tone: 'from-amber-500 to-orange-500' },
        { label: 'Admins', value: '2', icon: ShieldCheck, tone: 'from-fuchsia-500 to-pink-500' },
      ]}
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role' },
        { key: 'joined', label: 'Joined' },
        { key: 'status', label: 'Status', render: (r) => <Badge tone={tone[r.status] || 'slate'}>{r.status}</Badge> },
      ]}
      rows={rows}
    />
  );
}
