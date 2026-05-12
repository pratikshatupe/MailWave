import { ClipboardCheck, Hourglass, ThumbsUp, ThumbsDown } from 'lucide-react';
import ModulePage from '../../components/ui/ModulePage.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { MODULES } from '../../config/permissions.js';

const rows = [
  { id: 1, item: 'Campaign: Black Friday Drop', requester: 'Devon Lane', requested: 'May 11', stage: 'Awaiting Admin', status: 'Pending' },
  { id: 2, item: 'Automation: Cart abandon v2', requester: 'Marco Diaz', requested: 'May 10', stage: 'Awaiting Admin', status: 'Pending' },
  { id: 3, item: 'Template: Newsletter v18', requester: 'Riya Sharma', requested: 'May 9', stage: 'Admin', status: 'Approved' },
  { id: 4, item: 'Campaign: Trial expired nudge', requester: 'Devon Lane', requested: 'May 8', stage: 'Admin', status: 'Rejected' },
];

const tone = { Pending: 'amber', Approved: 'emerald', Rejected: 'rose' };

export default function ApprovalWorkflow() {
  return (
    <ModulePage
      module={MODULES.APPROVAL_WORKFLOW}
      title="Approval Workflow"
      description="Review and approve campaigns, automations or templates before they go live."
      icon={ClipboardCheck}
      createLabel="New rule"
      stats={[
        { label: 'Pending', value: '2', icon: Hourglass, tone: 'from-amber-500 to-orange-500' },
        { label: 'Approved (7d)', value: '8', icon: ThumbsUp, tone: 'from-emerald-500 to-teal-500' },
        { label: 'Rejected (7d)', value: '1', icon: ThumbsDown, tone: 'from-rose-500 to-pink-500' },
      ]}
      columns={[
        { key: 'item', label: 'Item' },
        { key: 'requester', label: 'Requester' },
        { key: 'requested', label: 'Requested' },
        { key: 'stage', label: 'Stage' },
        { key: 'status', label: 'Status', render: (r) => <Badge tone={tone[r.status] || 'slate'}>{r.status}</Badge> },
      ]}
      rows={rows}
    />
  );
}
