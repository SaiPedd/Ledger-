/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef1ff",
          400: "#7c93ff",
          500: "#4c6fff",
          600: "#3d5ce0",
          700: "#2f47b3",
        },
      },
    },
  },
  plugins: [],
};
