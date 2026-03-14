/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors (usable as bg-brand-green, text-brand-green, etc.)
        "brand-green": {
          50: "#E6F7EE",
          100: "#CCEFDD",
          200: "#99DFBB",
          300: "#66CF99",
          400: "#33BF77",
          500: "#00A651",
          600: "#008541",
          700: "#006431",
          800: "#004221",
          900: "#002110",
        },
        "brand-navy": {
          50: "#E8EAED",
          100: "#C5CBD3",
          200: "#9BA6B2",
          300: "#718191",
          400: "#4A6070",
          500: "#2D4156",
          600: "#1E2E3E",
          700: "#0D1B2A",
          800: "#081320",
          900: "#030A14",
        },
        "brand-amber": {
          50: "#FEF6E7",
          100: "#FDEECF",
          200: "#FBD99F",
          300: "#F9C46F",
          400: "#F7AF3F",
          500: "#F5A623",
          600: "#D4870A",
          700: "#A26508",
          800: "#6E4405",
          900: "#3A2203",
        },
        "brand-red": {
          50: "#FDF0F0",
          100: "#FBDADA",
          200: "#F6B5B5",
          300: "#F19090",
          400: "#EC6B6B",
          500: "#E84545",
          600: "#C42020",
          700: "#961818",
          800: "#681010",
          900: "#3A0808",
        },
        // Shorthand aliases for the frequently used midpoints
        // (avoids needing -DEFAULT in class names)
        "brand-green-DEFAULT": "#00A651",
        "brand-amber-DEFAULT": "#F5A623",
        "brand-red-DEFAULT": "#E84545",
        "brand-navy-DEFAULT": "#0D1B2A",

        // Neutral scale
        neutral: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },

        // Module accent colors
        "mod-delivery": "#6D28D9",
        "mod-books": "#2563EB",
        "mod-sell": "#059669",
        "mod-blood": "#DC2626",
        "mod-tuition": "#D97706",
        "mod-donation": "#16A34A",
        "mod-jobs": "#0284C7",
        "mod-garbage": "#64748B",
        "mod-lost": "#CA8A04",
        "mod-parcel": "#7C3AED",
      },
      fontFamily: {
        display: ["var(--font-sora)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-2xl": ["4.5rem", { lineHeight: "1.1", fontWeight: "800", letterSpacing: "-0.03em" }],
        "display-xl": ["3.75rem", { lineHeight: "1.1", fontWeight: "700", letterSpacing: "-0.025em" }],
        "display-lg": ["3rem", { lineHeight: "1.15", fontWeight: "700", letterSpacing: "-0.02em" }],
      },
      spacing: {
        18: "4.5rem", 22: "5.5rem", 26: "6.5rem", 30: "7.5rem", 34: "8.5rem",
      },
      maxWidth: {
        container: "1280px",
      },
      borderRadius: {
        xs: "4px", sm: "6px", md: "8px",
        lg: "12px", xl: "16px", "2xl": "24px", "3xl": "32px",
      },
      boxShadow: {
        "glow": "0 4px 12px rgba(0,166,81,0.30)",
        "glow-lg": "0 0 20px rgba(0,166,81,0.25)",
        "card-hover": "0 12px 28px rgba(0,0,0,0.12)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s cubic-bezier(0.34,1.56,0.64,1) both",
        "fade-in": "fadeIn 0.35s ease-out both",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
