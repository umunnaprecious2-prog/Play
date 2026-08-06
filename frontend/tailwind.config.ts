import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sunrise: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
        },
        meadow: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
        },
        sky: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
        },
        royal: {
          50: "#f2f0ff",
          100: "#e6e1ff",
          200: "#cabdff",
          300: "#a68bff",
          400: "#8257fb",
          500: "#6c37f0",
          600: "#5825d1",
          700: "#461daa",
          800: "#341577",
          900: "#221050",
        },
        gold: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f5a524",
          600: "#d1860f",
        },
      },
      boxShadow: {
        soft: "0 18px 45px rgba(15, 23, 42, 0.12)",
        glow: "0 25px 60px rgba(88, 37, 209, 0.35)",
      },
      backgroundImage: {
        "hero-glow": "radial-gradient(circle at top, rgba(251, 146, 60, 0.28), transparent 35%), radial-gradient(circle at right, rgba(59, 130, 246, 0.22), transparent 28%), linear-gradient(180deg, #fff7ed 0%, #eff6ff 55%, #f8fafc 100%)",
        "landing-hero": "radial-gradient(circle at 15% 15%, rgba(251, 191, 36, 0.35), transparent 40%), radial-gradient(circle at 85% 20%, rgba(130, 87, 251, 0.45), transparent 45%), linear-gradient(150deg, #221050 0%, #341577 45%, #461daa 100%)",
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        pulseSoft: "pulseSoft 3.6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.85" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;