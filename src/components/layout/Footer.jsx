import { Link } from 'react-router-dom';
import { Twitter, Github, Linkedin, Send, ArrowRight } from 'lucide-react';
import Logo from '../common/Logo.jsx';

const cols = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Templates', href: '#' },
      { label: 'Integrations', href: '#' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'Agencies', href: '#use-cases' },
      { label: 'Ecommerce', href: '#use-cases' },
      { label: 'SaaS', href: '#use-cases' },
      { label: 'Creators', href: '#use-cases' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
      { label: 'GDPR', href: '#' },
      { label: 'Security', href: '#security' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink-900 text-slate-300 dark:bg-slate-950 dark:text-slate-300">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50 bg-grid-dark [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
      />
      <div className="container-x relative py-10 sm:py-12 lg:py-16">
        {/* Brand + newsletter */}
        <div className="max-w-md">
          <Logo light />
          <p className="mt-4 text-sm text-slate-400">
            Mailwave is the all-in-one email marketing automation platform for modern
            teams. Built for speed, deliverability and delightful design.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-5 flex w-full gap-2 sm:max-w-sm"
          >
            <input
              type="email"
              placeholder="you@company.com"
              className="w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 sm:px-4 sm:py-3"
            />
            <button
              type="submit"
              className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-3 py-2.5 text-sm font-semibold text-white shadow-glow sm:px-4 sm:py-3"
            >
              <Send className="h-4 w-4" /> Join
            </button>
          </form>
        </div>

        {/* Link groups */}
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8 lg:mt-12">
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white sm:text-sm">
                {c.title}
              </h4>
              <ul className="mt-3 space-y-2 sm:mt-4 sm:space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-slate-400 transition hover:text-white"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Mailwave Inc. All rights reserved.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 text-slate-400 sm:gap-2">
              <a
                href="#"
                className="rounded-lg p-2 transition hover:bg-white/5 hover:text-white"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="rounded-lg p-2 transition hover:bg-white/5 hover:text-white"
                aria-label="Github"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="rounded-lg p-2 transition hover:bg-white/5 hover:text-white"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>

            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-sm font-semibold text-white transition-colors hover:text-cyan-300"
            >
              Sign in
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
