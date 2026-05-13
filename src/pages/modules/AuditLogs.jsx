import { ScrollText, ShieldCheck, AlertTriangle } from 'lucide-react';
import ModulePage from '../../components/ui/ModulePage.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { MODULES } from '../../config/permissions.js';

const rows = [
  { id: 1, actor: 'admin@mailwave.com', action: 'Approved campaign #c-2', target: 'Black Friday Drop', ip: '49.32.4.18', when: 'May 11, 2026 09:14', level: 'info' },
  { id: 2, actor: 'manager@mailwave.com', action: 'Created automation', target: 'Welcome series', ip: '49.32.4.18', when: 'May 11, 2026 08:51', level: 'info' },
  { id: 3, actor: 'superadmin@mailwave.com', action: 'Updated RBAC role', target: 'Viewer / Analyst', ip: '203.0.113.2', when: 'May 10, 2026 22:30', level: 'warn' },
  { id: 4, actor: 'system', action: 'Payment failed', target: 'Tenant Lumen & Co', ip: '—', when: 'May 10, 2026 19:02', level: 'error' },
  { id: 5, actor: 'viewer@mailwave.com', action: 'Exported report', target: 'Q1 2026 Engagement', ip: '202.88.1.4', when: 'May 10, 2026 14:11', level: 'info' },
];

const tone = { info: 'indigo', warn: 'amber', error: 'rose' };

export default function AuditLogs() {
  return (
    <ModulePage
      module={MODULES.AUDIT_LOGS}
      title="Audit Logs"
      description="Tamper-evident record of every privileged action across the platform."
      icon={ScrollText}
      tableKey="auditLogs"
      mobileConfig={{
        mobileTitleKey: 'action',
        mobileSubtitleKey: 'actor',
        mobileBadgeKey: 'level',
        mobileDetailKeys: ['target', 'ip', 'when'],
      }}
      stats={[
        { label: 'Events (24h)', value: '1,284', icon: ScrollText, tone: 'from-indigo-500 to-blue-500' },
        { label: 'Critical events', value: '3', icon: AlertTriangle, deltaTone: 'negative', tone: 'from-rose-500 to-orange-500' },
        { label: 'Retention', value: '365 days', icon: ShieldCheck, tone: 'from-emerald-500 to-teal-500' },
      ]}
      columns={[
        { key: 'when', label: 'Timestamp' },
        { key: 'actor', label: 'Actor' },
        { key: 'action', label: 'Action' },
        { key: 'target', label: 'Target' },
        { key: 'ip', label: 'IP' },
        { key: 'level', label: 'Severity', render: (r) => <Badge tone={tone[r.level] || 'slate'}>{r.level}</Badge> },
      ]}
      rows={rows}
    />
  );
}
