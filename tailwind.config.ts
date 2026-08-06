import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void:    "#070C15",
        surface: "#0D1421",
        "surface-2": "#131D2E",
        "surface-3": "#1A2640",
        accent:  "#E8340A",
        "accent-2": "#FF5C3A",
        gold:    "#F5A623",
        emerald: "#00CF85",
        border:  "#1E2D44",
        "border-2": "#263347",
        muted:   "#6B7A90",
        "text-2": "#8A9BB5",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      animation: {
        "fade-up":    "fadeUp 0.5s ease forwards",
        "fade-in":    "fadeIn 0.4s ease forwards",
        "slide-in-r": "slideInRight 0.4s ease forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "float":      "float 4s ease-in-out infinite",
        "shimmer":    "shimmer 2s linear infinite",
        "spin-slow":  "spin 8s linear infinite",
        "typewriter": "typewriter 2s steps(40) forwards",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInRight: {
          "0%":   { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        typewriter: {
          "0%":   { width: "0" },
          "100%": { width: "100%" },
        },
      },
      backgroundImage: {
        "grid-pattern":
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)",
        "accent-gradient":
          "linear-gradient(135deg, #E8340A 0%, #FF5C3A 100%)",
        "gold-gradient":
          "linear-gradient(135deg, #F5A623 0%, #FFC56A 100%)",
        "shimmer-gradient":
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)",
      },
      backgroundSize: {
        "grid": "32px 32px",
        "shimmer": "200% auto",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
