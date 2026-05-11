import { Mail, MoreHorizontal } from 'lucide-react';

const campaigns = [
  {
    name: 'Spring Sale — 30% off everything',
    status: 'Sent',
    sent: 24580,
    opens: '52.4%',
    clicks: '14.8%',
    date: 'May 02, 2026',
    tone: 'from-indigo-500 to-fuchsia-500',
  },
  {
    name: 'Welcome series — Day 1',
    status: 'Active',
    sent: 1840,
    opens: '64.1%',
    clicks: '21.7%',
    date: 'Running',
    tone: 'from-cyan-500 to-blue-500',
  },
  {
    name: 'Cart Abandon — Step 2',
    status: 'Active',
    sent: 982,
    opens: '48.7%',
    clicks: '17.2%',
    date: 'Running',
    tone: 'from-fuchsia-500 to-pink-500',
  },
  {
    name: 'Newsletter — April Edition',
    status: 'Sent',
    sent: 36120,
    opens: '41.3%',
    clicks: '9.8%',
    date: 'Apr 28, 2026',
    tone: 'from-emerald-500 to-teal-500',
  },
  {
    name: 'Re-engagement Win-back',
    status: 'Scheduled',
    sent: 0,
    opens: '—',
    clicks: '—',
    date: 'May 14, 2026',
    tone: 'from-amber-500 to-orange-500',
  },
];

const statusStyles = {
  Sent: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  Active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  Scheduled: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300',
  Draft: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
};

export default function RecentCampaigns() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Recent campaigns
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Last 30 days</p>
        </div>
        <button className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
          View all
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
            <tr>
              <th className="px-5 py-3">Campaign</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Sent</th>
              <th className="px-5 py-3">Opens</th>
              <th className="px-5 py-3">Clicks</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {campaigns.map((c) => (
              <tr
                key={c.name}
                className="transition hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br ${c.tone} text-white`}
                    >
                      <Mail className="h-4 w-4" />
                    </span>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {c.name}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      statusStyles[c.status] || statusStyles.Draft
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                  {c.sent ? c.sent.toLocaleString() : '—'}
                </td>
                <td className="px-5 py-4 text-slate-700 dark:text-slate-300">{c.opens}</td>
                <td className="px-5 py-4 text-slate-700 dark:text-slate-300">{c.clicks}</td>
                <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{c.date}</td>
                <td className="px-5 py-4 text-right">
                  <button
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    aria-label="More options"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
