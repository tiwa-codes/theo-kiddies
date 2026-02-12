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
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        "fade-up": "fadeUp 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
