/**
 * report-summary-cards.jsx
 *
 * Renders the per-report `summary` object as a 1-to-4 column stat grid.
 * Keys are humanised; numbers are toLocaleString'd; percent values keep
 * a trailing %.
 */

import StatCard from '../ui/StatCard.jsx';
import { BarChart3 } from 'lucide-react';

function humanise(key) {
  if (!key) return '';
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

function formatValue(key, value) {
  if (value === null || value === undefined) return '—';
  if (/rate$/i.test(key)) return `${value}%`;
  if (typeof value === 'number') return value.toLocaleString();
  return String(value);
}

export default function ReportSummaryCards({ summary = {} }) {
  const keys = Object.keys(summary).filter((k) => k !== 'error');
  if (keys.length === 0) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {keys.map((k, i) => (
        <StatCard
          key={k}
          Icon={BarChart3}
          label={humanise(k)}
          value={formatValue(k, summary[k])}
          tone={i % 2 === 0 ? 'from-indigo-500 to-blue-500' : 'from-fuchsia-500 to-pink-500'}
          delay={i * 0.04}
        />
      ))}
    </div>
  );
}
