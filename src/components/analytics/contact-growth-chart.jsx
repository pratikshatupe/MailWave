import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import ChartCard from './chart-card.jsx';

export default function ContactGrowthChart({ data = [] }) {
  const hasData = data.some((d) => (d.contacts || 0) + (d.cumulative || 0) > 0);
  return (
    <ChartCard
      title="Contact Growth"
      hint="New contacts per month and cumulative total"
      empty={!hasData ? 'No contact growth in the last 12 months.' : null}
    >
      {hasData && (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="contacts"
                name="New"
                stroke="#a78bfa"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="cumulative"
                name="Cumulative"
                stroke="#ec4899"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
