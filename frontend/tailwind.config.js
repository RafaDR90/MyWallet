/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-primary': '#00d1c7',
        'dark-bg': '#1a1a1a',
        'dark-surface': '#2d2d2d',
        'dark-surface-hover': '#3d3d3d',
        'dark-text': '#ffffff',
        'dark-text-secondary': '#a0a0a0',
        'dark-error': '#ff6b6b',
        'dark-on-primary': '#000000',
      }
    },
  },
  plugins: [],
} 