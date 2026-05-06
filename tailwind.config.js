/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ozor: {
          50: "#fff5f1",
          100: "#ffe5d9",
          200: "#ffc4ad",
          300: "#ff9d77",
          400: "#ff7341",
          500: "#f24e1e", // primary parody-orange
          600: "#d83a0d",
          700: "#a82a08",
          800: "#7a1e05",
          900: "#491200",
        },
        ink: {
          50: "#f7f8fb",
          100: "#eef0f6",
          200: "#dde2ec",
          300: "#bcc4d3",
          400: "#8c97ad",
          500: "#5d6a83",
          600: "#3f4a60",
          700: "#2c3447",
          800: "#1d2333",
          900: "#0f1320",
        },
        accent: {
          violet: "#7c5cff",
          mint: "#21c997",
          sun: "#ffd23a",
          rose: "#ff5d8f",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: ["\"Cabinet Grotesk\"", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,19,32,.04), 0 4px 16px rgba(15,19,32,.06)",
        pop: "0 12px 40px rgba(15,19,32,.18)",
      },
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(4px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: 0, transform: "translateY(16px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "pop-in": {
          "0%": { opacity: 0, transform: "scale(.96)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        wiggle: {
          "0%,100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
      },
      animation: {
        "fade-in": "fade-in .25s ease-out",
        "slide-up": "slide-up .35s ease-out",
        "pop-in": "pop-in .2s ease-out",
        wiggle: "wiggle .8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
