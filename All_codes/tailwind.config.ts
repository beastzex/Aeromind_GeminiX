import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          light: '#FFFFFF',
          dark: '#000000',
        },
        fg: {
          light: '#0A0A0A',
          dark: '#FFFFFF',
        },
        mono: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0A0A0A',
        },
      },
      fontFamily: {
        poppins: ['Manrope', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
        'open-sans': ['Manrope', 'sans-serif'],
        sans: ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        card: '1.25rem',
        pill: '999px',
      },
      boxShadow: {
        lift: '0 8px 30px rgba(0,0,0,0.08)',
        liftDark: '0 8px 30px rgba(255,255,255,0.05)',
        glowLight: '0 0 25px rgba(0,0,0,0.06)',
        glowDark: '0 0 25px rgba(255,255,255,0.08)',
      },
      keyframes: {
        pulseRing: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.03)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        pulseRing: 'pulseRing 2s ease-in-out infinite',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;

