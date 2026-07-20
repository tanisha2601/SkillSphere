/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
      },

      backdropBlur: {
        xs: "2px",
      },

      boxShadow: {
        glow: "0 0 40px rgba(59,130,246,0.35)",
        glass:
          "0 8px 32px rgba(15,23,42,0.35)",
      },

      backgroundImage: {
        hero:
          "radial-gradient(circle at top left, rgba(59,130,246,.25), transparent 40%), radial-gradient(circle at bottom right, rgba(34,211,238,.18), transparent 35%)",
      },

      animation: {
        float: "float 6s ease-in-out infinite",
        glow: "glow 4s ease-in-out infinite",
      },

      keyframes: {
        float: {
          "0%,100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-15px)",
          },
        },

        glow: {
          "0%,100%": {
            opacity: ".7",
          },
          "50%": {
            opacity: "1",
          },
        },
      },
    },
  },

  plugins: [],
};