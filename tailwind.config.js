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
      },
      colors: {
        background: '#09090b', // zinc-950
        surface: '#18181b', // zinc-900
        surfaceHover: '#27272a', // zinc-800
        border: '#27272a', // zinc-800
        textPrimary: '#fafafa', // zinc-50
        textSecondary: '#a1a1aa', // zinc-400
        // Status Colors
        status: {
          todo: '#71717a', // zinc-500
          in_progress: '#3b82f6', // blue-500
          in_review: '#f97316', // orange-500
          done: '#22c55e', // green-500
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        }
      }
    },
  },
  plugins: [],
}
