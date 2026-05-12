import { Mail, Send, CalendarClock, FileEdit } from 'lucide-react';
import ModulePage from '../../components/ui/ModulePage.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { MODULES } from '../../config/permissions.js';

const tone = { Sent: 'emerald', Scheduled: 'indigo', Running: 'fuchsia', Draft: 'slate', Paused: 'amber' };

const rows = [
  { id: 1, name: 'Spring Sale 30% off', audience: 'All customers', sent: '24,580', open: '52%', click: '14.2%', status: 'Sent', date: 'May 11, 2026' },
  { id: 2, name: 'Black Friday Drop', audience: 'Holiday segment', sent: '0', open: '—', click: '—', status: 'Scheduled', date: 'Nov 24, 2026' },
  { id: 3, name: 'Loyalty re-engagement', audience: 'Loyal 12mo+', sent: '7,310', open: '38%', click: '7.1%', status: 'Running', date: 'Apr 30, 2026' },
  { id: 4, name: 'New product teaser', audience: 'Newsletter list', sent: '—', open: '—', click: '—', status: 'Draft', date: '—' },
];

export default function Campaigns() {
  return (
    <ModulePage
      module={MODULES.CAMPAIGNS}
      title="Campaigns"
      description="Create, schedule, send and track every email campaign across your workspace."
      icon={Mail}
      createLabel="New campaign"
      stats={[
        { label: 'Active', value: '8', delta: '+2 today', icon: Send, tone: 'from-indigo-500 to-blue-500' },
        { label: 'Scheduled', value: '3', delta: 'Next: tomorrow', icon: CalendarClock, tone: 'from-fuchsia-500 to-pink-500' },
        { label: 'Drafts', value: '4', delta: '+1 today', icon: FileEdit, tone: 'from-amber-500 to-orange-500' },
        { label: 'Sent (30d)', value: '128', delta: '+18.4%', icon: Mail, tone: 'from-emerald-500 to-teal-500' },
      ]}
      columns={[
        { key: 'name', label: 'Campaign' },
        { key: 'audience', label: 'Audience' },
        { key: 'sent', label: 'Sent' },
        { key: 'open', label: 'Open' },
        { key: 'click', label: 'Click' },
        { key: 'date', label: 'Date' },
        { key: 'status', label: 'Status', render: (r) => <Badge tone={tone[r.status] || 'slate'}>{r.status}</Badge> },
      ]}
      rows={rows}
    />
  );
}
