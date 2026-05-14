import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import ChartCard from './chart-card.jsx';

export default function CampaignComparisonChart({ data = [] }) {
  const hasData = data.length > 0 && data.some((d) => (d.sent || 0) + (d.opened || 0) + (d.clicked || 0) > 0);
  return (
    <ChartCard
      title="Campaign Performance Comparison"
      hint="Top campaigns by volume"
      empty={!hasData ? 'No campaign metrics yet.' : null}
    >
      {hasData && (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  fontSize: 12,
                  background: 'rgba(15,23,42,0.95)',
                  border: '1px solid rgba(99,102,241,0.4)',
                  color: '#fff',
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="sent" name="Sent" fill="#6366f1" radius={[6, 6, 0, 0]} />
              <Bar dataKey="opened" name="Opened" fill="#22d3ee" radius={[6, 6, 0, 0]} />
              <Bar dataKey="clicked" name="Clicked" fill="#ec4899" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
