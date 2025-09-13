/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // fixed: recursive glob
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}