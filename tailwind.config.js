/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        boutique: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f3d0fe',
          300: '#e9a8fd',
          400: '#d975fa',
          500: '#c248f0',
          600: '#a427d4',
          700: '#8b1db0',
          800: '#741a90',
          900: '#611876',
        },
      },
    },
  },
  plugins: [],
};
