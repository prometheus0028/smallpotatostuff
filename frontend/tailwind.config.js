/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        fin: {
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          surface2: '#F1F5F9',
          surface3: '#E2E8F0',
          border: '#E2E8F0',
          border2: '#CBD5E1',
          text: '#0F172A',
          text2: '#475569',
          text3: '#94A3B8',
          accent: '#2563EB',
          accentDim: '#EFF6FF',
          accentBorder: '#BFDBFE',
          bullish: '#059669',
          bullishBg: '#ECFDF5',
          bullishBorder: '#A7F3D0',
          bearish: '#DC2626',
          bearishBg: '#FEF2F2',
          bearishBorder: '#FECACA',
          cautious: '#D97706',
          cautiousBg: '#FFFBEB',
          cautiousBorder: '#FDE68A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 4px 12px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -2px rgba(15, 23, 42, 0.04)',
      },
    },
  },
  plugins: [],
}
