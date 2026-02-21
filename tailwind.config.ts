import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#D5662E",
          cream: "#FFF7EF",
          cocoa: "#5B3A2A",
        },
        accent: {
          mint: "#D7EEE3",
          sky: "#D9EAFB",
          sage: "#A8C8B8",
          apricot: "#F7D7C4",
        },
      },
      boxShadow: {
        soft: "0 12px 30px rgba(61, 34, 20, 0.08)",
        float: "0 18px 40px rgba(61, 34, 20, 0.12)",
      },
      borderRadius: {
        xl: "20px",
        "2xl": "28px",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-8px) rotate(2deg)" },
          "66%": { transform: "translateY(-4px) rotate(-1deg)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        bounceIn: {
          "0%": { transform: "scale(0)", opacity: "0" },
          "60%": { transform: "scale(1.25)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        popIn: {
          "0%": { transform: "scale(0.8) translateY(8px)", opacity: "0" },
          "100%": { transform: "scale(1) translateY(0)", opacity: "1" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        "float-slow": "floatSlow 7s ease-in-out infinite",
        "fade-up": "fadeUp 0.6s ease-out both",
        "fade-in": "fadeIn 0.5s ease-out both",
        wiggle: "wiggle 0.4s ease-in-out",
        "bounce-in": "bounceIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both",
        "pop-in": "popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
        "slide-in-left": "slideInLeft 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
