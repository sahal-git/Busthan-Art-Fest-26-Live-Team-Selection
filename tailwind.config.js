/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Oswald', 'sans-serif'],
        teko: ['Teko', 'sans-serif'],
      },
      colors: {
        charcoal: '#0a0a0a',
        'event-gold': '#FFD700',
        'team-a': '#3B82F6', // Blue
        'team-b': '#10B981', // Green
        'team-c': '#EF4444', // Red
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' }, 
        },
        breathe: {
          '0%, 100%': { opacity: 0.5 },
          '50%': { opacity: 1 },
        }
      },
      animation: {
        marquee: 'marquee 60s linear infinite',
        breathe: 'breathe 4s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
