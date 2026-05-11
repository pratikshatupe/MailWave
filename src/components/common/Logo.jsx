import { Link } from 'react-router-dom';

export default function Logo({ light = false, size = 'md' }) {
  const dims = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9';
  const text = size === 'sm' ? 'text-base' : 'text-lg';
  return (
    <Link to="/" className="group inline-flex items-center gap-2">
      <span
        className={`relative ${dims} inline-grid place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-cyan-400 text-white shadow-glow ring-1 ring-white/30 transition-transform group-hover:scale-105`}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path
            d="M3 7l9 6 9-6"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="3"
            stroke="white"
            strokeWidth="2"
          />
        </svg>
      </span>
      <span
        className={`${text} font-extrabold tracking-tight ${
          light ? 'text-white' : 'text-slate-900 dark:text-white'
        }`}
      >
        Mail<span className="gradient-text">wave</span>
      </span>
    </Link>
  );
}
