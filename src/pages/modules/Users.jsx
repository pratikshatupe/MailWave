import { useMemo } from 'react';
import { UsersRound, ShieldCheck, UserCheck, UserX } from 'lucide-react';
import ModulePage from '../../components/ui/ModulePage.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { MODULES } from '../../config/permissions.js';
import { LABELS } from '../../config/labels.js';
import { ROLE_LABELS } from '../../config/roles.js';
import { DEMO_USERS } from '../../config/demoUsers.js';
import { getUsersForSuperAdmin } from '../../services/local-auth-service.js';

const tone = { Active: 'emerald', Invited: 'amber', Suspended: 'rose' };

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function buildDemoRows() {
  return DEMO_USERS.map((u) => ({
    id: u.email,
    fullName: u.name,
    emailId: u.email,
    contactNumber: '—',
    roleLabel: ROLE_LABELS[u.role] || 'User',
    accountType: u.tenantId === 'platform' ? 'Platform' : u.tenantId?.startsWith('individual') ? 'Individual' : 'Organisation',
    selectedPlan: u.plan,
    tenantId: u.tenantId,
    status: 'Active',
    createdAt: '2024-01-01T00:00:00.000Z',
  }));
}

export default function Users() {
  const rows = useMemo(() => {
    const local = getUsersForSuperAdmin();
    return [...local, ...buildDemoRows()].map((row, index) => ({
      ...row,
      srNo: index + 1,
    }));
  }, []);

  const stats = useMemo(() => {
    const total = rows.length;
    const active = rows.filter((r) => r.status === 'Active').length;
    const suspended = rows.filter((r) => r.status === 'Suspended').length;
    const admins = rows.filter((r) =>
      (r.roleLabel || '').toLowerCase().includes('admin')
    ).length;
    return [
      { label: 'Total users', value: String(total), icon: UsersRound, tone: 'from-indigo-500 to-blue-500' },
      { label: 'Active', value: String(active), icon: UserCheck, tone: 'from-emerald-500 to-teal-500' },
      { label: 'Suspended', value: String(suspended), icon: UserX, deltaTone: 'negative', tone: 'from-rose-500 to-orange-500' },
      { label: 'Admins', value: String(admins), icon: ShieldCheck, tone: 'from-fuchsia-500 to-pink-500' },
    ];
  }, [rows]);

  return (
    <ModulePage
      module={MODULES.USERS}
      title={LABELS.users}
      description="All users across every tenant — invite, suspend or reassign roles."
      icon={UsersRound}
      createLabel="Add user"
      tableKey="users"
      stats={stats}
      columns={[
        { key: 'srNo', label: LABELS.serialNumber },
        { key: 'fullName', label: LABELS.fullName },
        { key: 'emailId', label: LABELS.emailId },
        { key: 'contactNumber', label: LABELS.contactNumber },
        { key: 'roleLabel', label: 'Role', editable: true, editType: 'select', options: 'role' },
        { key: 'accountType', label: 'Account Type' },
        { key: 'selectedPlan', label: 'Plan', editable: true, editType: 'select', options: 'plan' },
        { key: 'tenantId', label: 'Tenant ID' },
        {
          key: 'status',
          label: LABELS.status,
          editable: true,
          editType: 'select',
          options: 'userStatus',
          render: (r) => <Badge tone={tone[r.status] || 'slate'}>{r.status}</Badge>,
        },
        { key: 'createdAt', label: LABELS.createdAt, render: (r) => formatDate(r.createdAt) },
        {
          key: 'actions',
          label: LABELS.actions,
          render: () => (
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">View</span>
          ),
        },
      ]}
      rows={rows}
    />
  );
}
