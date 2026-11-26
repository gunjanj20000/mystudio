/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        calm: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#082f49',
        },
        gentle: {
          bg: '#f8fafc',
          card: '#ffffff',
          soft: '#f1f5f9',
          border: '#e2e8f0',
          text: '#1e293b',
          muted: '#64748b',
          accent: '#0d9488', // gentle teal
          focus: '#3b82f6',
          warning: '#f59e0b',
          success: '#10b981',
          danger: '#ef4444',
          highlight: '#fef08a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        devanagari: ['"Noto Sans Devanagari"', 'Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
