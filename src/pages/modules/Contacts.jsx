import { Contact, UserPlus, UserMinus, Mail } from 'lucide-react';
import ModulePage from '../../components/ui/ModulePage.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { MODULES } from '../../config/permissions.js';

const rows = [
  { id: 1, name: 'Alex Morgan', email: 'alex@brightlabs.io', list: 'Customers', status: 'Subscribed', joined: 'May 8, 2026' },
  { id: 2, name: 'Priya Nair', email: 'priya@nairco.com', list: 'Newsletter', status: 'Subscribed', joined: 'May 5, 2026' },
  { id: 3, name: 'Daniel Reyes', email: 'd.reyes@kite.dev', list: 'Trial', status: 'Pending', joined: 'May 3, 2026' },
  { id: 4, name: 'Mei Chen', email: 'mei@chenstudio.com', list: 'Customers', status: 'Unsubscribed', joined: 'Apr 30, 2026' },
];

const tone = { Subscribed: 'emerald', Pending: 'amber', Unsubscribed: 'rose', Bounced: 'rose' };

export default function Contacts() {
  return (
    <ModulePage
      module={MODULES.CONTACTS}
      title="Contacts"
      description="Centralize your audience, manage opt-ins and clean up your lists."
      icon={Contact}
      createLabel="Add contact"
      stats={[
        { label: 'Total contacts', value: '42,580', delta: '+312', icon: Contact, tone: 'from-indigo-500 to-blue-500' },
        { label: 'New (7d)', value: '312', delta: '+18%', icon: UserPlus, tone: 'from-emerald-500 to-teal-500' },
        { label: 'Unsubscribed (30d)', value: '94', delta: '0.21%', deltaTone: 'neutral', icon: UserMinus, tone: 'from-rose-500 to-orange-500' },
        { label: 'Email coverage', value: '99.4%', delta: 'verified', icon: Mail, tone: 'from-fuchsia-500 to-pink-500' },
      ]}
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'list', label: 'List' },
        { key: 'joined', label: 'Joined' },
        { key: 'status', label: 'Status', render: (r) => <Badge tone={tone[r.status] || 'slate'}>{r.status}</Badge> },
      ]}
      rows={rows}
    />
  );
}
