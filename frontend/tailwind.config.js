// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans:  ["DM Sans", "Segoe UI", "sans-serif"],
        mono:  ["Space Mono", "monospace"],
      },
      colors: {
        agri: {
          green:  "#4ade80",
          dark:   "#16a34a",
          deeper: "#15803d",
          text:   "#c8e8b2",
          muted:  "rgba(74,222,128,0.4)",
          bg:     "rgba(10,22,14,0.85)",
        },
      },
      animation: {
        "spin-slow": "spin 2s linear infinite",
        shimmer:     "shimmer 3s linear infinite",
        ping2:       "ping 2.5s cubic-bezier(0,0,0.2,1) infinite",
      },
    },
  },
  plugins: [],
};