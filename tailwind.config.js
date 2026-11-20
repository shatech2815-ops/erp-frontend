/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#F5F3FE',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#7C6FE8',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#372E86',
          900: '#1E1B4B',
          950: '#15132F',
        },
        accent: {
          400: '#FBBF6B',
          500: '#F5B93A',
          600: '#E29A0D',
        },
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(79, 70, 229, 0.10), 0 1.5px 4px 0 rgba(30, 27, 75, 0.06)',
        'glass-lg': '0 20px 60px -12px rgba(79, 70, 229, 0.25), 0 8px 24px -8px rgba(30, 27, 75, 0.12)',
        glow: '0 0 0 1px rgba(124, 111, 232, 0.15), 0 8px 24px -4px rgba(79, 70, 229, 0.35)',
        'glow-lg': '0 0 40px -6px rgba(124, 111, 232, 0.45)',
        card: '0 1px 2px rgba(30,27,75,0.04), 0 8px 24px -8px rgba(30,27,75,0.10)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #4F46E5 0%, #7C6FE8 50%, #A78BFA 100%)',
        'brand-gradient-dark': 'linear-gradient(160deg, #1E1B4B 0%, #372E86 55%, #4F46E5 100%)',
        'mesh-light': 'radial-gradient(at 20% 20%, rgba(124,111,232,0.18) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(245,185,58,0.14) 0px, transparent 50%), radial-gradient(at 50% 90%, rgba(79,70,229,0.12) 0px, transparent 50%)',
      },
      keyframes: {
        'fade-in-up': {
          '0%':   { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: 0 },
          '100%': { opacity: 1 },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%':      { transform: 'translate(30px, -40px) scale(1.08)' },
          '66%':      { transform: 'translate(-20px, 20px) scale(0.95)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-500px 0' },
          '100%': { backgroundPosition: '500px 0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(124,111,232,0.4)' },
          '50%':      { boxShadow: '0 0 0 8px rgba(124,111,232,0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fade-in 0.5s ease-out both',
        blob: 'blob 14s infinite ease-in-out',
        shimmer: 'shimmer 2s infinite linear',
        'pulse-glow': 'pulse-glow 2.2s infinite',
      },
    },
  },
  plugins: [],
}
