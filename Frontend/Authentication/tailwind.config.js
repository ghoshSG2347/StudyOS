/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm paper surfaces
        paper: {
          50: '#FBFAF7',
          100: '#F6F4EE',
          200: '#EDE9E0',
          300: '#E2DCCF',
        },
        // Dark navy / ink typography
        ink: {
          900: '#1C2530',
          800: '#2A3340',
          700: '#3A4554',
          600: '#525C6B',
          500: '#6B7383',
          400: '#8A91A0',
        },
        // Restrained lavender / periwinkle accent
        sage: {
          50: '#F4F3FA',
          100: '#E9E7F4',
          200: '#D4D0E8',
          300: '#B6AFD8',
          400: '#978CC6',
          500: '#7C6FB4',
          600: '#635893',
          700: '#4E4675',
        },
        line: {
          DEFAULT: '#E2DCCF',
          strong: '#D3CCBA',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        serif: ['"Fraunces"', 'Georgia', 'serif'],
      },
      borderRadius: {
        // Small corner radii consistent with a calm, editorial workspace
        xs: '4px',
        sm: '6px',
        DEFAULT: '8px',
        md: '10px',
        lg: '14px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(28, 37, 48, 0.04), 0 4px 16px rgba(28, 37, 48, 0.05)',
        lift: '0 2px 6px rgba(28, 37, 48, 0.06), 0 12px 28px rgba(28, 37, 48, 0.08)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
        'fade-in': 'fade-in 0.3s ease-out both',
        'spin-slow': 'spin-slow 0.7s linear infinite',
      },
    },
  },
  plugins: [],
};
