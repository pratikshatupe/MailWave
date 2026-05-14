import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import ChartCard from './chart-card.jsx';

export default function EngagementBreakdownChart({ data = [] }) {
  const hasData = data.some((d) => (d.value || 0) > 0);
  const filtered = data.filter((d) => (d.value || 0) > 0);
  return (
    <ChartCard
      title="Engagement Breakdown"
      hint="Contact status distribution"
      empty={!hasData ? 'No contact engagement data.' : null}
    >
      {hasData && (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={filtered}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius="75%"
                innerRadius="45%"
                paddingAngle={2}
              >
                {filtered.map((entry) => (
                  <Cell key={entry.name} fill={entry.tone} stroke="rgba(15,23,42,0.0)" />
                ))}
              </Pie>
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
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
