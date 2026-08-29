/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: '#0A0A0A',
          pure: '#000000',
          soft: '#121212',
          surface: '#151515',
        },
        bone: {
          DEFAULT: '#F5F3EF',
          pure: '#FFFFFF',
          soft: '#EAE6DF',
          muted: '#D8D4CC',
        },
        charcoal: {
          DEFAULT: '#191919',
          light: '#242424',
          dark: '#141414',
        },
        muted: {
          DEFAULT: '#8A8A8A',
          dark: '#666666',
          light: '#A3A3A3',
        },
        border: {
          DEFAULT: '#D8D6D1',
          subtle: 'rgba(216, 214, 209, 0.25)',
          dark: 'rgba(255, 255, 255, 0.12)',
          highlight: 'rgba(255, 255, 255, 0.25)',
        },
        accent: {
          lime: '#D8FF00',
          burgundy: '#5C1018',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        display: ['Syne', '"Cormorant Garamond"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        'ultra-wide': '0.25em',
        'mega-wide': '0.35em',
      },
      animation: {
        'pulse-subtle': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
      }
    },
  },
  plugins: [],
}
