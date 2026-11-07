/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        sidebar: 'var(--sidebar)',
        ink: {
          DEFAULT: 'var(--ink)',
          secondary: 'var(--ink-secondary)',
          dark: 'var(--ink-dark)',
          // Numeric scale — each maps to a CSS var so dark-mode works globally
          900: 'var(--ink-scale-900)',
          800: 'var(--ink-scale-800)',
          700: 'var(--ink-scale-700)',
          600: 'var(--ink-scale-600)',
          500: 'var(--ink-scale-500)',
          400: 'var(--ink-scale-400)',
        },
        paper: {
          // Maps to CSS vars so dark-mode can reassign them
          50:  'var(--paper-50)',
          100: 'var(--paper-100)',
          200: 'var(--paper-200)',
          300: 'var(--paper-300)',
        },
        sage: {
          50:  '#F4F3FA',
          100: '#E9E7F4',
          200: '#D4D0E8',
          300: '#B6AFD8',
          400: '#978CC6',
          500: '#7C6FB4',
          600: '#635893',
          700: '#4E4675',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          soft: 'var(--accent-soft)',
          deep: 'var(--accent-deep)',
        },
        done: 'var(--done)',
        progress: 'var(--progress)',
        line: {
          DEFAULT: 'var(--line)',
          strong: 'var(--line-strong)',
        },
        hover: 'var(--hover)',
        manifesto: {
          bg: 'var(--manifesto-bg)',
          text: 'var(--manifesto-text)',
          muted: 'var(--manifesto-muted)',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['clamp(3rem, 8vw, 6.5rem)', { lineHeight: '1.02', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2.5rem, 6vw, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(2rem, 4.5vw, 3.25rem)', { lineHeight: '1.08', letterSpacing: '-0.01em' }],
      },
      borderRadius: {
        '2.5xl': '1.25rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(28, 37, 48, 0.04), 0 4px 16px rgba(28, 37, 48, 0.05)',
        lift: '0 2px 6px rgba(28, 37, 48, 0.06), 0 12px 28px rgba(28, 37, 48, 0.08)',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-up':   'fade-up 0.4s ease-out both',
        'fade-in':   'fade-in 0.3s ease-out both',
        'spin-slow': 'spin-slow 0.7s linear infinite',
      },
      maxWidth: {
        '8xl': '88rem',
      },
    },
  },
  plugins: [],
};
