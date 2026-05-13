import { MessageSquare, Send, CalendarClock, FileEdit } from 'lucide-react';
import ModulePage from '../../components/ui/ModulePage.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { MODULES } from '../../config/permissions.js';

const tone = { Sent: 'emerald', Scheduled: 'indigo', Running: 'fuchsia', Draft: 'slate', Paused: 'amber' };

const rows = [
  { id: 1, name: 'Diwali Sale Broadcast', audience: 'India opt-ins', sent: '8,420', delivered: '92%', read: '64%', status: 'Sent', date: 'May 10, 2026' },
  { id: 2, name: 'Cart Recovery Series', audience: 'Abandoned cart', sent: '2,140', delivered: '88%', read: '47%', status: 'Running', date: 'May 09, 2026' },
  { id: 3, name: 'New Catalogue Launch', audience: 'VIP subscribers', sent: '0', delivered: '—', read: '—', status: 'Scheduled', date: 'May 24, 2026' },
  { id: 4, name: 'Feedback follow-up', audience: 'Last 30 days buyers', sent: '—', delivered: '—', read: '—', status: 'Draft', date: '—' },
];

export default function WhatsappCampaigns() {
  return (
    <ModulePage
      module={MODULES.WHATSAPP_CAMPAIGNS}
      title="WhatsApp Campaigns"
      description="Send rich WhatsApp broadcasts to opted-in audiences and measure delivery, read and reply rates."
      icon={MessageSquare}
      createLabel="New WhatsApp campaign"
      tableKey="whatsapp_campaigns"
      mobileConfig={{
        mobileTitleKey: 'name',
        mobileSubtitleKey: 'audience',
        mobileBadgeKey: 'status',
        mobileDetailKeys: ['sent', 'delivered', 'read', 'date'],
      }}
      stats={[
        { label: 'Active', value: '3', delta: '+1 today', icon: Send, tone: 'from-emerald-500 to-teal-500' },
        { label: 'Scheduled', value: '2', delta: 'Next: May 24', icon: CalendarClock, tone: 'from-indigo-500 to-blue-500' },
        { label: 'Drafts', value: '1', delta: 'In progress', icon: FileEdit, tone: 'from-amber-500 to-orange-500' },
        { label: 'Sent (30d)', value: '24', delta: '+6 this week', icon: MessageSquare, tone: 'from-fuchsia-500 to-pink-500' },
      ]}
      columns={[
        { key: 'name', label: 'Campaign' },
        { key: 'audience', label: 'Audience' },
        { key: 'sent', label: 'Sent' },
        { key: 'delivered', label: 'Delivered' },
        { key: 'read', label: 'Read' },
        { key: 'date', label: 'Date' },
        { key: 'status', label: 'Status', render: (r) => <Badge tone={tone[r.status] || 'slate'}>{r.status}</Badge> },
      ]}
      rows={rows}
    />
  );
}
