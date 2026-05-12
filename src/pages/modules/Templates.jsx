import { LayoutTemplate, Sparkles, FileEdit, Archive } from 'lucide-react';
import ModulePage from '../../components/ui/ModulePage.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { MODULES } from '../../config/permissions.js';

const rows = [
  { id: 1, name: 'Welcome — Friendly', category: 'Onboarding', updated: 'Today', author: 'Devon Lane', status: 'Published' },
  { id: 2, name: 'Black Friday Drop', category: 'Promotion', updated: 'Yesterday', author: 'Jane Cooper', status: 'Draft' },
  { id: 3, name: 'Receipt — Minimal', category: 'Transactional', updated: 'May 6', author: 'System', status: 'Published' },
  { id: 4, name: 'Weekly Newsletter', category: 'Newsletter', updated: 'May 2', author: 'Marco Diaz', status: 'Published' },
];

const tone = { Published: 'emerald', Draft: 'slate', Archived: 'rose' };

export default function Templates() {
  return (
    <ModulePage
      module={MODULES.TEMPLATES}
      title="Templates"
      description="Reusable, on-brand email layouts you can drop into any campaign or automation."
      icon={LayoutTemplate}
      createLabel="New template"
      stats={[
        { label: 'Total templates', value: '36', icon: LayoutTemplate, tone: 'from-indigo-500 to-blue-500' },
        { label: 'Drafts', value: '4', icon: FileEdit, tone: 'from-amber-500 to-orange-500' },
        { label: 'AI suggestions', value: '12', delta: 'new this week', icon: Sparkles, tone: 'from-fuchsia-500 to-pink-500' },
        { label: 'Archived', value: '8', icon: Archive, tone: 'from-slate-500 to-slate-700' },
      ]}
      columns={[
        { key: 'name', label: 'Template' },
        { key: 'category', label: 'Category' },
        { key: 'updated', label: 'Updated' },
        { key: 'author', label: 'Created by' },
        { key: 'status', label: 'Status', render: (r) => <Badge tone={tone[r.status] || 'slate'}>{r.status}</Badge> },
      ]}
      rows={rows}
    />
  );
}
