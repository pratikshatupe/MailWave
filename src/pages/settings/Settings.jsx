import { Settings as SettingsIcon, Bell, Globe, Palette, Mail } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import { SectionCard } from '../dashboard/_common.jsx';
import ThemeToggle from '../../components/common/ThemeToggle.jsx';

function Row({ icon: Icon, title, hint, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <div className="text-sm font-semibold text-slate-900 dark:text-white">{title}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{hint}</div>
        </div>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ defaultChecked = true }) {
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input type="checkbox" defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="h-6 w-11 rounded-full bg-slate-300 transition-colors after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-indigo-600 peer-checked:after:translate-x-5 dark:bg-slate-700" />
    </label>
  );
}

export default function Settings() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Workspace preferences, notifications and appearance." icon={SettingsIcon} />

      <SectionCard title="Appearance">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <Row icon={Palette} title="Theme" hint="Switch between light and dark mode anytime">
            <ThemeToggle size="sm" />
          </Row>
          <Row icon={Globe} title="Language" hint="Interface language for this workspace">
            <select className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900">
              <option>English (US)</option>
              <option>English (UK)</option>
              <option>हिन्दी</option>
              <option>Español</option>
            </select>
          </Row>
        </div>
      </SectionCard>

      <SectionCard title="Notifications">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <Row icon={Bell} title="Product notifications" hint="In-app bell notifications">
            <Toggle />
          </Row>
          <Row icon={Mail} title="Email notifications" hint="Weekly digest + critical alerts">
            <Toggle />
          </Row>
        </div>
      </SectionCard>
    </div>
  );
}
