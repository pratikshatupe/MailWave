/**
 * theme.js
 *
 * Central theme tokens. Each token maps to a CSS variable defined in
 * styles/theme.css. Change a value here AND in theme.css to update the
 * full project — or read these values in JS where Tailwind utilities
 * are not enough.
 *
 * To swap the primary font: change `fonts.body` here and `--font-primary`
 * in theme.css. Everything wired through Tailwind `font-sans` or CSS
 * `var(--font-primary)` will pick it up.
 */

export const THEME = {
  fonts: {
    body: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    heading:
      "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },

  colours: {
    light: {
      primary: '#4f46e5',
      secondary: '#a855f7',
      accent: '#06b6d4',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      bg: '#ffffff',
      card: '#ffffff',
      border: '#e2e8f0',
      text: '#0f172a',
      muted: '#64748b',
    },
    dark: {
      primary: '#818cf8',
      secondary: '#c084fc',
      accent: '#22d3ee',
      success: '#34d399',
      warning: '#fbbf24',
      danger: '#f87171',
      bg: '#020617',
      card: '#0f172a',
      border: '#1e293b',
      text: '#e2e8f0',
      muted: '#94a3b8',
    },
  },

  radius: {
    card: '1rem',
    button: '0.75rem',
    pill: '9999px',
  },

  shadows: {
    card: '0 20px 60px -20px rgba(15, 23, 42, 0.25)',
    soft: '0 10px 30px -10px rgba(15, 23, 42, 0.15)',
    glow: '0 10px 40px -12px rgba(99, 102, 241, 0.55)',
  },

  zIndex: {
    base: 0,
    dropdown: 50,
    sticky: 100,
    modal: 1000,
    toast: 1100,
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

export default THEME;
