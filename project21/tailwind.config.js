/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'dashboard': {
          'bg': '#0f172a',
          'bg-secondary': '#1e293b',
          'accent': '#06b6d4',
          'accent-secondary': '#3b82f6',
          'border': '#334155',
          'text-primary': '#f1f5f9',
          'text-secondary': '#94a3b8',
          'success': '#10b981',
          'warning': '#f59e0b',
          'danger': '#ef4444',
        }
      },
      minWidth: {
        'dashboard': '1080px',
      },
      minHeight: {
        'dashboard': '1920px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(6, 182, 212, 0.3)',
        'glow-lg': '0 0 40px rgba(6, 182, 212, 0.4)',
      }
    },
  },
  plugins: [],
}
