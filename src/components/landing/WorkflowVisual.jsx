import { motion } from 'framer-motion';
import {
  UserPlus,
  Mail,
  Clock,
  GitBranch,
  Tag,
  CheckCircle2,
  ShoppingBag,
} from 'lucide-react';
import SectionHeading from '../common/SectionHeading.jsx';

const nodes = [
  {
    id: 'trigger',
    title: 'Trigger',
    subtitle: 'New signup',
    Icon: UserPlus,
    tone: 'from-indigo-500 to-blue-500',
    pos: 'top-0 left-0',
  },
  {
    id: 'welcome',
    title: 'Send email',
    subtitle: 'Welcome aboard',
    Icon: Mail,
    tone: 'from-fuchsia-500 to-pink-500',
    pos: 'top-0 right-0',
  },
  {
    id: 'wait',
    title: 'Wait',
    subtitle: '2 days',
    Icon: Clock,
    tone: 'from-amber-500 to-orange-500',
    pos: 'top-[42%] left-[18%]',
  },
  {
    id: 'condition',
    title: 'Condition',
    subtitle: 'Opened email?',
    Icon: GitBranch,
    tone: 'from-cyan-500 to-teal-500',
    pos: 'top-[42%] right-[14%]',
  },
  {
    id: 'tag',
    title: 'Tag contact',
    subtitle: 'Engaged',
    Icon: Tag,
    tone: 'from-emerald-500 to-green-500',
    pos: 'bottom-0 left-[8%]',
  },
  {
    id: 'offer',
    title: 'Send offer',
    subtitle: 'Personalized',
    Icon: ShoppingBag,
    tone: 'from-violet-500 to-purple-600',
    pos: 'bottom-0 right-[6%]',
  },
];

function Node({ node, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, delay }}
      className={`absolute ${node.pos} w-44 rounded-2xl border border-white/60 bg-white/90 p-3 shadow-card backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80`}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={`grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br ${node.tone} text-white`}
        >
          <node.Icon className="h-4 w-4" />
        </span>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {node.title}
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            {node.subtitle}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function WorkflowVisual() {
  return (
    <section className="section-pad relative overflow-hidden bg-gradient-to-b from-white to-indigo-50/40 dark:from-slate-950 dark:to-slate-900">
      <div className="container-x">
        <SectionHeading
          eyebrow="Visual Automations"
          title="Build customer journeys that send the right email at the right time"
          description="Drag, drop and connect triggers, conditions, delays and emails. Branch based on opens, clicks, tags or custom events — no engineering required."
        />

        <div className="relative mx-auto mt-8 hidden h-[460px] max-w-4xl sm:mt-12 sm:block lg:mt-14">
          {/* Connector SVG */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 800 460"
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <linearGradient id="line" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <path
              d="M120 50 C 260 50, 260 200, 200 220"
              stroke="url(#line)"
              strokeWidth="2"
              fill="none"
              className="dash-anim"
            />
            <path
              d="M680 50 C 540 50, 560 200, 620 220"
              stroke="url(#line)"
              strokeWidth="2"
              fill="none"
              className="dash-anim"
            />
            <path
              d="M200 240 C 200 320, 200 360, 180 410"
              stroke="url(#line)"
              strokeWidth="2"
              fill="none"
              className="dash-anim"
            />
            <path
              d="M620 240 C 620 320, 620 360, 660 410"
              stroke="url(#line)"
              strokeWidth="2"
              fill="none"
              className="dash-anim"
            />
            <path
              d="M260 230 C 400 240, 460 240, 580 230"
              stroke="url(#line)"
              strokeWidth="2"
              fill="none"
              className="dash-anim"
            />
          </svg>

          {nodes.map((n, i) => (
            <Node key={n.id} node={n} delay={0.05 + i * 0.08} />
          ))}

          {/* Center pulse */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-soft dark:bg-slate-900/90 dark:text-indigo-300"
          >
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Live workflow
            </span>
          </motion.div>
        </div>

        {/* Mobile-friendly stacked fallback */}
        <div className="mt-8 grid grid-cols-1 gap-3 sm:hidden">
          {nodes.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-soft dark:border-slate-700 dark:bg-slate-900"
            >
              <span
                className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-gradient-to-br ${n.tone} text-white`}
              >
                <n.Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {n.title}
                </div>
                <div className="truncate text-sm font-bold text-slate-900 dark:text-white">
                  {n.subtitle}
                </div>
              </div>
            </motion.div>
          ))}
          <div className="mt-1 inline-flex items-center justify-center gap-1.5 self-center rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-indigo-700 shadow-soft dark:bg-slate-900 dark:text-indigo-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Live workflow
          </div>
        </div>
      </div>
    </section>
  );
}
