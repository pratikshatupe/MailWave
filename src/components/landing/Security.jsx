import { motion } from 'framer-motion';
import { ShieldCheck, Lock, FileCheck2, Globe2, Server, KeyRound } from 'lucide-react';
import SectionHeading from '../common/SectionHeading.jsx';

const items = [
  {
    Icon: ShieldCheck,
    title: 'SOC 2 Type II',
    desc: 'Audited controls for security, availability and confidentiality.',
  },
  {
    Icon: Lock,
    title: 'End-to-end encryption',
    desc: 'TLS in transit. AES-256 at rest. Always.',
  },
  {
    Icon: FileCheck2,
    title: 'GDPR & CAN-SPAM',
    desc: 'Built-in consent, preferences and one-click unsubscribe.',
  },
  {
    Icon: Globe2,
    title: 'Global compliance',
    desc: 'Data residency in EU, US and APAC regions.',
  },
  {
    Icon: KeyRound,
    title: 'SSO & MFA',
    desc: 'SAML, OIDC, enforced MFA, and granular role-based access.',
  },
  {
    Icon: Server,
    title: 'Reliable infrastructure',
    desc: '99.99% uptime SLA with global edge delivery.',
  },
];

export default function Security() {
  return (
    <section
      id="security"
      className="section-pad relative overflow-hidden bg-ink-900 text-slate-200 dark:bg-slate-950"
    >
      <div aria-hidden className="absolute inset-0 bg-grid-dark opacity-50" />
      <div
        aria-hidden
        className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl"
      />

      <div className="container-x relative">
        <div className="mx-auto max-w-3xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-200"
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Security & compliance
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl"
          >
            Enterprise-grade trust, baked in by default
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mt-4 text-base text-slate-300 sm:text-lg"
          >
            We treat your data and your senders’ reputation like our own. Here’s how.
          </motion.p>
        </div>

        <div className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
            >
              <span className="inline-grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-glow">
                <it.Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-white">{it.title}</h3>
              <p className="mt-1.5 text-sm text-slate-400">{it.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
