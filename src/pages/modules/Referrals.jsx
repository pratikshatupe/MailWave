import { Gift, Users, Wallet, Share2 } from 'lucide-react';
import ModulePage from '../../components/ui/ModulePage.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { MODULES } from '../../config/permissions.js';

const rows = [
  { id: 1, referrer: 'You', referee: 'avery@brightlabs.io', reward: '$20', status: 'Paid', date: 'May 10, 2026' },
  { id: 2, referrer: 'You', referee: 'liam@northwind.io', reward: '$20', status: 'Pending', date: 'May 8, 2026' },
  { id: 3, referrer: 'You', referee: 'sara@kite.dev', reward: '$20', status: 'Paid', date: 'May 4, 2026' },
];

const tone = { Paid: 'emerald', Pending: 'amber', Expired: 'rose' };

export default function Referrals() {
  return (
    <ModulePage
      module={MODULES.REFERRALS}
      title="Referrals"
      description="Invite friends, teammates or peers and earn rewards every time they sign up."
      icon={Gift}
      createLabel="Invite someone"
      tableKey="referrals"
      mobileConfig={{
        mobileTitleKey: 'referee',
        mobileSubtitleKey: 'reward',
        mobileBadgeKey: 'status',
        mobileDetailKeys: ['date'],
      }}
      stats={[
        { label: 'Total referrals', value: '12', icon: Users, tone: 'from-indigo-500 to-blue-500' },
        { label: 'Rewards earned', value: '$240', icon: Wallet, tone: 'from-emerald-500 to-teal-500' },
        { label: 'Link clicks', value: '892', delta: '+18%', icon: Share2, tone: 'from-fuchsia-500 to-pink-500' },
      ]}
      columns={[
        { key: 'referee', label: 'Referee' },
        { key: 'reward', label: 'Reward' },
        { key: 'date', label: 'Date' },
        { key: 'status', label: 'Status', render: (r) => <Badge tone={tone[r.status] || 'slate'}>{r.status}</Badge> },
      ]}
      rows={rows}
    >
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-500/5 via-fuchsia-500/5 to-cyan-400/5 p-5 dark:border-slate-800">
        <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">Your referral link</div>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            readOnly
            value="https://mailwave.com/r/your-handle-2026"
            className="input-base !py-2.5 flex-1 font-mono text-sm"
          />
          <button className="btn-primary !py-2.5">Copy link</button>
        </div>
      </div>
    </ModulePage>
  );
}
