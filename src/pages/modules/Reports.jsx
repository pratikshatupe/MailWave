import { FileBarChart, Download, Calendar } from 'lucide-react';
import ModulePage from '../../components/ui/ModulePage.jsx';
import { MODULES } from '../../config/permissions.js';

const rows = [
  { id: 1, name: 'Q1 2026 Engagement Report', range: 'Jan – Mar 2026', size: '2.4 MB', author: 'System' },
  { id: 2, name: 'Campaign Funnel — Spring', range: 'Apr 1 – Apr 30', size: '1.1 MB', author: 'Jane Cooper' },
  { id: 3, name: 'Top Segments Performance', range: 'Last 30 days', size: '860 KB', author: 'Devon Lane' },
  { id: 4, name: 'Deliverability Snapshot', range: 'May 1 – May 11', size: '512 KB', author: 'System' },
];

export default function Reports() {
  return (
    <ModulePage
      module={MODULES.REPORTS}
      title="Reports"
      description="Schedule, download and share workspace reports with your team or stakeholders."
      icon={FileBarChart}
      createLabel="New report"
      tableKey="reports"
      mobileConfig={{
        mobileTitleKey: 'name',
        mobileSubtitleKey: 'range',
        mobileDetailKeys: ['size', 'author'],
      }}
      stats={[
        { label: 'Saved reports', value: '14', icon: FileBarChart, tone: 'from-indigo-500 to-blue-500' },
        { label: 'Scheduled', value: '3', icon: Calendar, tone: 'from-fuchsia-500 to-pink-500' },
        { label: 'Downloads (30d)', value: '128', icon: Download, tone: 'from-emerald-500 to-teal-500' },
      ]}
      columns={[
        { key: 'name', label: 'Report' },
        { key: 'range', label: 'Range' },
        { key: 'size', label: 'Size' },
        { key: 'author', label: 'Author' },
      ]}
      rows={rows}
    />
  );
}
