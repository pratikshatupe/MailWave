import { Workflow, Activity, PauseCircle, ZapOff } from 'lucide-react';
import ModulePage from '../../components/ui/ModulePage.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { MODULES } from '../../config/permissions.js';

const rows = [
  { id: 1, name: 'Welcome series', trigger: 'New subscriber', steps: 4, status: 'Running', contacts: '1,284' },
  { id: 2, name: 'Cart abandon', trigger: 'Cart not converted (24h)', steps: 3, status: 'Running', contacts: '912' },
  { id: 3, name: 'Re-engagement', trigger: 'No open 60 days', steps: 5, status: 'Paused', contacts: '2,140' },
  { id: 4, name: 'Trial nurture', trigger: 'Trial started', steps: 7, status: 'Draft', contacts: '0' },
];

const tone = { Running: 'emerald', Paused: 'amber', Draft: 'slate' };

export default function Automations() {
  return (
    <ModulePage
      module={MODULES.AUTOMATIONS}
      title="Automations"
      description="Visual workflows that send the right email at the right moment — without you lifting a finger."
      icon={Workflow}
      createLabel="New automation"
      tableKey="automations"
      mobileConfig={{
        mobileTitleKey: 'name',
        mobileSubtitleKey: 'trigger',
        mobileBadgeKey: 'status',
        mobileDetailKeys: ['steps', 'contacts'],
      }}
      stats={[
        { label: 'Running', value: '6', icon: Activity, tone: 'from-emerald-500 to-teal-500' },
        { label: 'Paused', value: '2', icon: PauseCircle, tone: 'from-amber-500 to-orange-500' },
        { label: 'Drafts', value: '3', icon: ZapOff, tone: 'from-slate-500 to-slate-700' },
        { label: 'Contacts in flight', value: '4,336', icon: Workflow, tone: 'from-fuchsia-500 to-pink-500' },
      ]}
      columns={[
        { key: 'name', label: 'Automation' },
        { key: 'trigger', label: 'Trigger' },
        { key: 'steps', label: 'Steps' },
        { key: 'contacts', label: 'Contacts' },
        { key: 'status', label: 'Status', render: (r) => <Badge tone={tone[r.status] || 'slate'}>{r.status}</Badge> },
      ]}
      rows={rows}
    />
  );
}
