import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Eye, MousePointerClick, AlertTriangle, UserMinus } from 'lucide-react';
import SectionHeading from '../common/SectionHeading.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

const lineData = [
  { day: 'Mon', opens: 4200, clicks: 980 },
  { day: 'Tue', opens: 5800, clicks: 1320 },
  { day: 'Wed', opens: 5100, clicks: 1180 },
  { day: 'Thu', opens: 7200, clicks: 1740 },
  { day: 'Fri', opens: 9100, clicks: 2280 },
  { day: 'Sat', opens: 6400, clicks: 1490 },
  { day: 'Sun', opens: 8700, clicks: 2150 },
];

const pieData = [
  { name: 'Delivered', value: 92, color: '#10b981' },
  { name: 'Bounced', value: 1.2, color: '#f59e0b' },
  { name: 'Unsubscribed', value: 0.4, color: '#ef4444' },
  { name: 'Pending', value: 6.4, color: '#6366f1' },
];

const kpis = [
  { Icon: Eye, label: 'Opens', value: '46.8K', delta: '+12%', tone: 'text-emerald-600 dark:text-emerald-400' },
  { Icon: MousePointerClick, label: 'Clicks', value: '11.4K', delta: '+8%', tone: 'text-emerald-600 dark:text-emerald-400' },
  { Icon: AlertTriangle, label: 'Bounces', value: '142', delta: '-3%', tone: 'text-emerald-600 dark:text-emerald-400' },
  { Icon: UserMinus, label: 'Unsubscribes', value: '38', delta: '+0.2%', tone: 'text-rose-600 dark:text-rose-400' },
];

export default function AnalyticsPreview() {
  const { isDark } = useTheme();
  const gridStroke = isDark ? '#334155' : '#e2e8f0';
  const axisStroke = isDark ? '#94a3b8' : '#94a3b8';
  const tooltipStyle = isDark
    ? {
        borderRadius: 12,
        border: '1px solid #334155',
        background: '#0f172a',
        color: '#f1f5f9',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.6)',
      }
    : {
        borderRadius: 12,
        border: '1px solid #e2e8f0',
        background: '#ffffff',
        boxShadow: '0 10px 30px -10px rgba(15,23,42,0.15)',
      };

  return (
    <section className="section-pad relative overflow-hidden bg-gradient-to-b from-indigo-50/40 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="container-x">
        <SectionHeading
          eyebrow="Analytics"
          title="Know exactly what works — down to the click"
          description="Realtime dashboards for every campaign and automation. Filter by segment, compare versions and export anywhere."
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="mt-8 grid gap-4 sm:mt-12 sm:gap-5 lg:grid-cols-12"
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-700 dark:bg-slate-900 lg:col-span-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Engagement
                </div>
                <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Last 7 days
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {kpis.map((k) => (
                  <div
                    key={k.label}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60"
                  >
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      <k.Icon className="h-3 w-3" /> {k.label}
                    </div>
                    <div className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">
                      {k.value}{' '}
                      <span className={`text-[10px] font-semibold ${k.tone}`}>
                        {k.delta}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lineData}>
                  <defs>
                    <linearGradient id="opens" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="clicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ec4899" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#ec4899" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="day" stroke={axisStroke} fontSize={12} />
                  <YAxis stroke={axisStroke} fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="opens"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#opens)"
                  />
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    stroke="#ec4899"
                    strokeWidth={2}
                    fill="url(#clicks)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-700 dark:bg-slate-900 lg:col-span-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Delivery health
            </div>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white">
              Latest campaign
            </div>
            <div className="mt-2 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {pieData.map((p) => (
                      <Cell key={p.name} fill={p.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12, color: isDark ? '#cbd5e1' : '#475569' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              Deliverability: 99.2% — healthy
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
