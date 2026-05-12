import { Megaphone, Eye, Users, Calendar } from 'lucide-react';
import ModulePage from '../../components/ui/ModulePage.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { MODULES } from '../../config/permissions.js';

const rows = [
  { id: 1, title: 'Platform maintenance — Sunday 02:00 UTC', target: 'All users', channel: 'Banner', status: 'Live', published: 'May 11, 2026' },
  { id: 2, title: 'New AI subject line tool — beta', target: 'Plan: Growth & Scale', channel: 'Modal', status: 'Live', published: 'May 9, 2026' },
  { id: 3, title: 'Welcome to Mailwave 2.4', target: 'All users', channel: 'Toast', status: 'Archived', published: 'Apr 28, 2026' },
  { id: 4, title: 'Acme Inc. — billing migration', target: 'Tenant: Acme Inc.', channel: 'Banner', status: 'Draft', published: '—' },
];

const tone = { Live: 'emerald', Draft: 'slate', Archived: 'rose' };

export default function Announcements() {
  return (
    <ModulePage
      module={MODULES.ANNOUNCEMENTS}
      title="Announcements"
      description="Broadcast banners, modals or toasts. Target all users, a role, a plan or a single tenant."
      icon={Megaphone}
      createLabel="New announcement"
      stats={[
        { label: 'Live', value: '2', icon: Megaphone, tone: 'from-indigo-500 to-fuchsia-500' },
        { label: 'Total reach', value: '4,612', icon: Users, tone: 'from-emerald-500 to-teal-500' },
        { label: 'Avg. views', value: '92%', icon: Eye, tone: 'from-fuchsia-500 to-pink-500' },
        { label: 'Scheduled', value: '1', icon: Calendar, tone: 'from-amber-500 to-orange-500' },
      ]}
      columns={[
        { key: 'title', label: 'Announcement' },
        { key: 'target', label: 'Audience' },
        { key: 'channel', label: 'Channel' },
        { key: 'published', label: 'Published' },
        { key: 'status', label: 'Status', render: (r) => <Badge tone={tone[r.status] || 'slate'}>{r.status}</Badge> },
      ]}
      rows={rows}
    />
  );
}
