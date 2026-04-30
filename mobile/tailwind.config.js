/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#2E7D32',
        'primary-light': '#4CAF50',
        'primary-dark': '#1B5E20',
        secondary: '#FF8F00',
        'secondary-light': '#FFA726',
        surface: '#F9F9F9',
        error: '#C62828',
      },
    },
  },
  plugins: [],
};
