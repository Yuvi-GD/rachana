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
        ue: {
          darkest: '#121212',
          base: '#1a1a1a',
          panel: '#222222',
          card: '#2a2a2a',
          hover: '#333333',
          border: '#3c3c3c',
          accent: '#0e70c0',
          accentHover: '#1389e4',
          orange: '#d97706',
          yellow: '#ca8a04',
          green: '#16a34a',
          blue: '#2563eb',
          purple: '#9333ea',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

