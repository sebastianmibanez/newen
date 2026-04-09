/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        newen: {
          green: "#16a34a",
          "green-light": "#22c55e",
          blue: "#1d4ed8",
          "blue-light": "#3b82f6",
          dark: "#0f172a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
