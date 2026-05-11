/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        ink: {
          950: '#070a18',
          900: '#0b0f1f',
          800: '#0f1530',
          700: '#141a3a',
        },
      },
      boxShadow: {
        glow: '0 10px 40px -12px rgba(99, 102, 241, 0.55)',
        soft: '0 10px 30px -10px rgba(15, 23, 42, 0.15)',
        card: '0 20px 60px -20px rgba(15, 23, 42, 0.25)',
      },
      backgroundImage: {
        'grid-light':
          "linear-gradient(to right, rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.06) 1px, transparent 1px)",
        'grid-dark':
          "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
        'hero-gradient':
          'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.35), transparent 60%), radial-gradient(ellipse 60% 50% at 90% 10%, rgba(236,72,153,0.25), transparent 60%), radial-gradient(ellipse 60% 50% at 10% 20%, rgba(34,211,238,0.25), transparent 60%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
