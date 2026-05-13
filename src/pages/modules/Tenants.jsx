import { useMemo } from 'react';
import { Building2, Users, Activity, AlertTriangle } from 'lucide-react';
import ModulePage from '../../components/ui/ModulePage.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { MODULES } from '../../config/permissions.js';
import { LABELS } from '../../config/labels.js';
import { getTenantsForSuperAdmin } from '../../services/local-auth-service.js';

const seedRows = [
  { tenantId: 't-1', organisationName: 'Acme Inc.', ownerName: 'Jane Cooper', ownerEmailId: 'jane@acme.com', accountType: 'Organisation', selectedPlan: 'Growth', status: 'Active', createdAt: '2024-02-08T10:00:00.000Z' },
  { tenantId: 't-2', organisationName: 'Northwind', ownerName: 'Eli Park', ownerEmailId: 'eli@northwind.io', accountType: 'Organisation', selectedPlan: 'Professional', status: 'Active', createdAt: '2024-01-15T10:00:00.000Z' },
  { tenantId: 't-3', organisationName: 'Pulsar Labs', ownerName: 'Sara Lin', ownerEmailId: 'sara@pulsar.dev', accountType: 'Organisation', selectedPlan: 'Growth', status: 'Trial', createdAt: '2026-05-04T10:00:00.000Z' },
  { tenantId: 't-4', organisationName: 'Lumen & Co', ownerName: 'Kim Park', ownerEmailId: 'kim@lumen.co', accountType: 'Organisation', selectedPlan: 'Starter', status: 'Past Due', createdAt: '2025-10-22T10:00:00.000Z' },
  { tenantId: 't-5', organisationName: 'Beam Studios', ownerName: 'Rio Mehta', ownerEmailId: 'rio@beam.io', accountType: 'Individual', selectedPlan: 'Growth', status: 'Active', createdAt: '2024-12-10T10:00:00.000Z' },
];

const tone = { Active: 'emerald', Trial: 'indigo', 'Past Due': 'rose', Suspended: 'rose' };

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

export default function Tenants() {
  const rows = useMemo(() => {
    const local = getTenantsForSuperAdmin();
    return [...local, ...seedRows].map((row, index) => ({
      ...row,
      id: row.tenantId,
      srNo: index + 1,
    }));
  }, []);

  const stats = useMemo(() => {
    const total = rows.length;
    const active = rows.filter((r) => r.status === 'Active').length;
    const trial = rows.filter((r) => r.status === 'Trial').length;
    const pastDue = rows.filter((r) => r.status === 'Past Due').length;
    return [
      { label: 'Total tenants', value: String(total), icon: Building2, tone: 'from-indigo-500 to-blue-500' },
      { label: 'Active', value: String(active), icon: Activity, tone: 'from-emerald-500 to-teal-500' },
      { label: 'On trial', value: String(trial), icon: Users, tone: 'from-fuchsia-500 to-pink-500' },
      { label: 'Past due', value: String(pastDue), deltaTone: 'negative', icon: AlertTriangle, tone: 'from-rose-500 to-orange-500' },
    ];
  }, [rows]);

  return (
    <ModulePage
      module={MODULES.TENANTS}
      title={LABELS.tenants}
      description="Every organisation on the platform — manage status, plans and ownership."
      icon={Building2}
      createLabel="Onboard tenant"
      tableKey="tenants"
      stats={stats}
      columns={[
        { key: 'srNo', label: LABELS.serialNumber },
        { key: 'organisationName', label: 'Organisation Name' },
        { key: 'ownerName', label: 'Owner Name' },
        { key: 'ownerEmailId', label: LABELS.emailId },
        { key: 'accountType', label: 'Account Type' },
        { key: 'selectedPlan', label: 'Plan' },
        {
          key: 'status',
          label: LABELS.status,
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
