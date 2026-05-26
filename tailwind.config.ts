import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef2ff", 100: "#e0e7ff", 200: "#c7d2fe", 300: "#a5b4fc",
          400: "#818cf8", 500: "#6366f1", 600: "#4f46e5", 700: "#4338ca",
          800: "#3730a3", 900: "#312e81",
        },
        accent: {
          50: "#faf5ff", 100: "#f3e8ff", 200: "#e9d5ff", 300: "#d8b4fe",
          400: "#c084fc", 500: "#a855f7", 600: "#9333ea", 700: "#7e22ce",
          800: "#6b21a8", 900: "#581c87",
        },
        brand: {
          50: "#fff7ed", 100: "#ffedd5", 200: "#fed7aa", 300: "#fdba74",
          400: "#fb923c", 500: "#f97316", 600: "#ea580c", 700: "#c2410c",
          800: "#9a3412", 900: "#7c2d12",
        },
        whatsapp: {
          50: "#ecfdf5", 100: "#d1fae5", 200: "#a7f3d0", 300: "#6ee7b7",
          400: "#34d399", 500: "#25D366", 600: "#16a34a", 700: "#15803d",
          800: "#166534", 900: "#14532d",
        },
        midnight: {
          50: "#f0f1fa", 100: "#d1d4f0", 200: "#a3a9e1", 300: "#757ed2",
          400: "#4753c3", 500: "#0f0c29", 600: "#0c0a21", 700: "#090719",
          800: "#060511", 900: "#030209",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "gradient-x": "gradient-x 8s ease infinite",
        "gradient-slow": "gradient-x 15s ease infinite",
        "fade-in": "fade-in 0.6s ease-out",
        "slide-up": "slide-up 0.6s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "pulse-whatsapp": "pulse-whatsapp 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        "float-delayed": "float 3s ease-in-out 1.5s infinite",
        glow: "glow 2s ease-in-out infinite alternate",
        "glow-intense": "glow-intense 2s ease-in-out infinite alternate",
        "bounce-gentle": "bounce-gentle 2s ease-in-out infinite",
        shimmer: "shimmer 3s ease-in-out infinite",
        "scale-in": "scale-in 0.5s ease-out",
        "slide-right": "slide-right 0.5s ease-out",
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-whatsapp": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.08)", opacity: "0.9" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(99,102,241,0.3), 0 0 10px rgba(99,102,241,0.1)" },
          "100%": { boxShadow: "0 0 15px rgba(99,102,241,0.5), 0 0 30px rgba(99,102,241,0.2)" },
        },
        "glow-intense": {
          "0%": { boxShadow: "0 0 10px rgba(168,85,247,0.3), 0 0 20px rgba(99,102,241,0.15)" },
          "100%": { boxShadow: "0 0 25px rgba(168,85,247,0.6), 0 0 50px rgba(99,102,241,0.3)" },
        },
        "bounce-gentle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-3px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-right": {
          "0%": { transform: "translateX(-10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
