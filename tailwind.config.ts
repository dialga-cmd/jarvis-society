import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // NOTE: named "void", not "base", so Tailwind doesn't generate a
        // `text-base` color utility that collides with the `text-base` font-size utility.
        void: "#0A0A0C",
        surface: "#111114",
        "surface-raised": "#16161A",
        ink: {
          DEFAULT: "#EDEDEF",
          secondary: "#8B8B93",
          tertiary: "#5A5A62",
        },
        navy: {
          // Steel-navy family: "navy catching light" against the black base.
          light: "#4A6B94", // lighter stop / text on dark
          mid: "#3B5980", // mid steel-navy
          deep: "#0B1B3F", // deep navy gradient stop
        },
        accent: {
          DEFAULT: "#4A6B94",
          dim: "rgba(74, 107, 148, 0.16)",
          glow: "rgba(74, 107, 148, 0.35)",
        },
        // Brand accent — single source of truth (matches the favicon).
        // Maps to CSS vars so a favicon/brand change propagates everywhere.
        "brand-indigo": "var(--brand-indigo)",
        "brand-indigo-lite": "var(--brand-indigo-lite)",
        hairline: "rgba(255, 255, 255, 0.08)",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-sora)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      borderRadius: {
        card: "1.75rem",
      },
      maxWidth: {
        shell: "1400px",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      backgroundImage: {
        "accent-gradient": "linear-gradient(135deg, #4A6B94 0%, #0B1B3F 100%)",
      },
      zIndex: {
        nav: "50",
        overlay: "60",
        grain: "70",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s cubic-bezier(0.16,1,0.3,1) both",
        "pulse-dot": "pulse-dot 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
