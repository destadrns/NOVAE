/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#0A0A0A',
        charcoal: {
          DEFAULT: '#121212',
          light: '#161616',
          dark: '#0D0D0D',
        },
        surface: {
          DEFAULT: '#181818',
          elevated: '#202020',
          hover: '#262626',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-active': 'rgba(255, 255, 255, 0.16)',
        },
        bone: {
          DEFAULT: '#F5F3EF',
          soft: '#E5E2DC',
          muted: '#C4C1BA',
        },
        muted: {
          DEFAULT: '#A3A3A3',
          light: '#CCCCCC',
          dark: '#666666',
        },
        'accent-lime': {
          DEFAULT: '#D8FF00',
          hover: '#E2FF33',
          dim: 'rgba(216, 255, 0, 0.15)',
          border: 'rgba(216, 255, 0, 0.3)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
