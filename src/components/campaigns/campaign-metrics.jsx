/**
 * campaign-metrics.jsx
 *
 * Renders the metrics-cards strip used on both the campaign details page
 * and the analytics page. Accepts a metrics object as defined in
 * services/campaign-service.js (sent, delivered, opened, clicked, etc.).
 */

import {
  Send,
  CheckCircle2,
  MailOpen,
  MousePointerClick,
  AlertTriangle,
  UserMinus,
  Percent,
} from 'lucide-react';
import StatCard from '../ui/StatCard.jsx';

function num(value) {
  if (value === null || value === undefined) return '0';
  return Number(value).toLocaleString();
}

function pct(value) {
  if (value === null || value === undefined) return '0%';
  return `${value}%`;
}

export default function CampaignMetrics({ metrics, layout = 'grid' }) {
  if (!metrics) return null;
  const cards = [
    { label: 'Sent', value: num(metrics.sent), icon: Send, tone: 'from-indigo-500 to-blue-500' },
    { label: 'Delivered', value: num(metrics.delivered), icon: CheckCircle2, tone: 'from-emerald-500 to-teal-500' },
    { label: 'Opened', value: num(metrics.opened), icon: MailOpen, tone: 'from-fuchsia-500 to-pink-500' },
    { label: 'Clicked', value: num(metrics.clicked), icon: MousePointerClick, tone: 'from-cyan-500 to-blue-500' },
    { label: 'Bounced', value: num(metrics.bounced), icon: AlertTriangle, tone: 'from-amber-500 to-orange-500' },
    { label: 'Unsubscribed', value: num(metrics.unsubscribed), icon: UserMinus, tone: 'from-rose-500 to-orange-500' },
    { label: 'Open Rate', value: pct(metrics.openRate), icon: Percent, tone: 'from-fuchsia-500 to-purple-500' },
    { label: 'Click Rate', value: pct(metrics.clickRate), icon: Percent, tone: 'from-indigo-500 to-fuchsia-500' },
    { label: 'Bounce Rate', value: pct(metrics.bounceRate), icon: Percent, tone: 'from-rose-500 to-red-500' },
  ];
  const cls =
    layout === 'compact'
      ? 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3'
      : 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3';
  return (
    <div className={cls}>
      {cards.map((c, i) => (
        <StatCard
          key={c.label}
          Icon={c.icon}
          label={c.label}
          value={c.value}
          tone={c.tone}
          delay={i * 0.03}
        />
      ))}
    </div>
  );
}
