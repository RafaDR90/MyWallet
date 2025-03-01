/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          'bg': '#181818',
          'surface': '#212121',
          'primary': '#BB86FC',
          'secondary': '#03DAC6',
          'error': '#CF6679',
          'on-bg': '#FFFFFF',
          'on-surface': '#FFFFFF',
          'on-primary': '#000000',
          'on-secondary': '#000000',
          'on-error': '#000000'
        }
      }
    },
  },
  plugins: [],
} 