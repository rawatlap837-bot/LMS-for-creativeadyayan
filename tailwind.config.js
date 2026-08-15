/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Tirra', 'sans-serif'],
        body: ['Pliant', 'sans-serif'],
        mono: ['Pochaevsk', 'monospace'],
      },
    },
  },
  plugins: [],
};