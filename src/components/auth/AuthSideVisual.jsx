import { motion } from 'framer-motion';
import {
  Mail,
  MousePointerClick,
  TrendingUp,
  CheckCircle2,
  Workflow,
} from 'lucide-react';

const bars = [38, 52, 41, 67, 58, 74, 63, 81, 71, 88];

export default function AuthSideVisual({ title, subtitle }) {
  return (
    <div className="relative hidden h-full overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700 p-10 text-white lg:flex lg:flex-col lg:justify-between">
      <div aria-hidden className="absolute inset-0 bg-grid-dark opacity-30" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-20 h-80 w-80 rounded-full bg-fuchsia-400/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-indigo-400/30 blur-3xl"
      />

      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
          <Workflow className="h-3.5 w-3.5" /> Mailwave Platform
        </span>
        <h2 className="mt-5 text-3xl font-extrabold leading-tight">{title}</h2>
        <p className="mt-3 max-w-md text-sm text-white/85">{subtitle}</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mt-10"
      >
        <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white/90">Campaign overview</span>
            <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
              Live
            </span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
            <div className="rounded-xl bg-white/10 p-3">
              <div className="flex items-center gap-1 text-white/70">
                <Mail className="h-3 w-3" /> Sent
              </div>
              <div className="mt-1 text-lg font-extrabold">124K</div>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <div className="flex items-center gap-1 text-white/70">
                <TrendingUp className="h-3 w-3" /> Opens
              </div>
              <div className="mt-1 text-lg font-extrabold">48.7%</div>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <div className="flex items-center gap-1 text-white/70">
                <MousePointerClick className="h-3 w-3" /> Clicks
              </div>
              <div className="mt-1 text-lg font-extrabold">11.2%</div>
            </div>
          </div>
          <div className="mt-3 flex h-20 items-end gap-1">
            {bars.map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 4 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.5 }}
                className="flex-1 rounded-md bg-gradient-to-t from-white/30 via-white/60 to-white"
              />
            ))}
          </div>
        </div>

        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="absolute -right-3 -top-5 flex items-center gap-2 rounded-2xl border border-white/20 bg-white/15 px-3 py-2 backdrop-blur"
        >
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-white text-indigo-600">
            <Mail className="h-4 w-4" />
          </span>
          <div className="text-xs">
            <div className="font-semibold">New signup 🎉</div>
            <div className="text-white/70">Triggered welcome flow</div>
          </div>
          <CheckCircle2 className="h-4 w-4 text-emerald-300" />
        </motion.div>
      </motion.div>

      <div className="relative mt-10 text-xs text-white/70">
        “Mailwave replaced three tools in our stack — and our open rate is up
        12%.”
        <div className="mt-1 font-semibold text-white">
          — Aisha P. • Head of Growth, Northwind
        </div>
      </div>
    </div>
  );
}
