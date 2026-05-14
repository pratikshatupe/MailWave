/**
 * analytics-kpi-grid.jsx
 *
 * Responsive KPI grid:
 *   Desktop: 4 per row, Laptop: 3, Tablet: 2, Mobile: 1.
 */

import StatCard from '../ui/StatCard.jsx';

export default function AnalyticsKpiGrid({ kpis = [] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {kpis.map((k, i) => (
        <StatCard
          key={k.label}
          Icon={k.icon}
          label={k.label}
          value={typeof k.value === 'number' ? k.value.toLocaleString() : k.value}
          tone={k.tone}
          delay={i * 0.03}
          hint={k.hint}
        />
      ))}
    </div>
  );
}
