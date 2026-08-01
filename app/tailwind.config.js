/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#FFD600',
      },
      fontFamily: {
        display: ['Anton', 'Arial Narrow', 'sans-serif'],
        brush: ["'Rubik Wet Paint'", 'cursive'],
        sans: ['Inter', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
