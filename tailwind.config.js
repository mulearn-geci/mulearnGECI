/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          dark: '#0d0d0d',
          surface: '#1a1a1a',
          blue: '#3b82f6',
          deepBlue: '#1e3a8a',
        }
      }
    },
  },
  plugins: [],
};
