import { motion } from 'framer-motion';
import {
  Megaphone,
  Layout,
  Users,
  Send,
  Workflow,
  Repeat,
  CalendarClock,
  Eye,
  MousePointerClick,
  AlertTriangle,
  UserMinus,
  BarChart3,
  Filter,
  Tags,
  ShieldCheck,
  CreditCard,
  Sparkles,
  Server,
  Zap,
} from 'lucide-react';
import SectionHeading from '../common/SectionHeading.jsx';

const features = [
  { Icon: Megaphone, title: 'Campaign creation', desc: 'Compose, target and send campaigns in minutes.', tone: 'from-indigo-500 to-blue-500' },
  { Icon: Layout, title: 'Drag-drop template builder', desc: 'Pixel-perfect responsive emails — no code needed.', tone: 'from-fuchsia-500 to-pink-500' },
  { Icon: Users, title: 'Contact list management', desc: 'Import, clean and organize contacts at scale.', tone: 'from-cyan-500 to-teal-500' },
  { Icon: Send, title: 'Bulk email sending', desc: 'Send to millions with optimized throughput.', tone: 'from-amber-500 to-orange-500' },
  { Icon: Workflow, title: 'Automation workflows', desc: 'Visual journeys with triggers, delays and branches.', tone: 'from-violet-500 to-purple-600' },
  { Icon: Repeat, title: 'Email sequences', desc: 'Onboarding, nurture and re-engagement series.', tone: 'from-emerald-500 to-green-500' },
  { Icon: CalendarClock, title: 'Smart scheduling', desc: 'Time-zone aware sending at peak engagement.', tone: 'from-rose-500 to-red-500' },
  { Icon: Eye, title: 'Open tracking', desc: 'See exactly who opened — and when.', tone: 'from-blue-500 to-indigo-500' },
  { Icon: MousePointerClick, title: 'Click tracking', desc: 'Per-link insights and heatmaps.', tone: 'from-pink-500 to-fuchsia-500' },
  { Icon: AlertTriangle, title: 'Bounce tracking', desc: 'Hard, soft and complaint signals — auto cleaned.', tone: 'from-orange-500 to-amber-500' },
  { Icon: UserMinus, title: 'Unsubscribe management', desc: 'One-click compliant opt-outs and preferences.', tone: 'from-slate-500 to-slate-700' },
  { Icon: BarChart3, title: 'Analytics dashboard', desc: 'Realtime metrics across every campaign.', tone: 'from-teal-500 to-cyan-500' },
  { Icon: Filter, title: 'Smart segmentation', desc: 'Slice contacts by behavior, tags or fields.', tone: 'from-indigo-500 to-violet-500' },
  { Icon: Tags, title: 'Personalization', desc: 'Use variables like {{name}} for true 1:1 emails.', tone: 'from-purple-500 to-fuchsia-500' },
  { Icon: ShieldCheck, title: 'Role-based access', desc: 'Admins, marketers and analysts — granular perms.', tone: 'from-emerald-500 to-teal-500' },
  { Icon: CreditCard, title: 'Subscription plans', desc: 'Flexible billing built for growing teams.', tone: 'from-sky-500 to-blue-500' },
  { Icon: Sparkles, title: 'AI subject lines (soon)', desc: 'Generate high-converting subjects with AI.', tone: 'from-fuchsia-500 to-pink-500', soon: true },
  { Icon: Server, title: 'SendGrid & Amazon SES', desc: 'Plug your preferred email provider.', tone: 'from-orange-500 to-rose-500' },
  { Icon: Zap, title: 'Redis queue engine', desc: 'Reliable, retry-safe high-throughput delivery.', tone: 'from-amber-500 to-yellow-500' },
];

export default function FeatureGrid() {
  return (
    <section id="features" className="section-pad bg-white dark:bg-slate-950">
      <div className="container-x">
        <SectionHeading
          eyebrow="Everything you need"
          title="One platform for every email your business sends"
          description="From your first welcome email to global lifecycle automations, Mailwave gives you the building blocks — and the analytics to prove what works."
        />

        <div className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: (i % 6) * 0.05 }}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
            >
              <div
                aria-hidden
                className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-200/30 to-fuchsia-200/30 blur-2xl transition group-hover:scale-110 dark:from-indigo-500/10 dark:to-fuchsia-500/10"
              />
              <div className="relative">
                <span
                  className={`inline-grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${f.tone} text-white shadow-soft`}
                >
                  <f.Icon className="h-5 w-5" />
                </span>
                <div className="mt-4 flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {f.title}
                  </h3>
                  {f.soon && (
                    <span className="rounded-full bg-fuchsia-50 px-2 py-0.5 text-[10px] font-semibold text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-300">
                      Coming soon
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
