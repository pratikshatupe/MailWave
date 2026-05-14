/**
 * performance-trend-chart.jsx
 *
 * 12-month rolling area chart of sent / opened / clicked across the
 * tenant. Uses Recharts (already installed). Falls back to an empty
 * state if there is no data in the window.
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import ChartCard from './chart-card.jsx';

export default function PerformanceTrendChart({ data = [] }) {
  const hasData = data.some((d) => (d.sent || 0) + (d.opened || 0) + (d.clicked || 0) > 0);
  return (
    <ChartCard
      title="Email Performance Trend"
      hint="Sent / opened / clicked across the last 12 months"
      empty={!hasData ? 'No campaign or automation activity in this window.' : null}
    >
      {hasData && (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="grad-sent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="grad-opened" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="grad-clicked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ec4899" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  fontSize: 12,
                  background: 'rgba(15,23,42,0.95)',
                  border: '1px solid rgba(99,102,241,0.4)',
                  color: '#fff',
                }}
                labelStyle={{ color: '#cbd5e1' }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="sent" stroke="#6366f1" fill="url(#grad-sent)" name="Sent" strokeWidth={2} />
              <Area type="monotone" dataKey="opened" stroke="#22d3ee" fill="url(#grad-opened)" name="Opened" strokeWidth={2} />
              <Area type="monotone" dataKey="clicked" stroke="#ec4899" fill="url(#grad-clicked)" name="Clicked" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
