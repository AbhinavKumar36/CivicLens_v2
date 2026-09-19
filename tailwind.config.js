/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        tertiary: {
          DEFAULT: "hsl(var(--tertiary))",
          foreground: "hsl(var(--tertiary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        "surface-container": "var(--up-surface-container)",
        "surface": "var(--up-surface)",
        "on-surface": "var(--up-on-surface)",
        "surface-variant": "var(--up-surface-variant)",
        "on-surface-variant": "var(--up-on-surface-variant)",
        "primary-container": "var(--up-primary-container)",
        "on-primary-container": "var(--up-on-primary-container)",
        "error-container": "var(--up-error-container)",
        "error": "var(--up-error)",
        "outline": "var(--up-outline)",
        "on-primary": "var(--up-on-primary)",
        "surface-container-lowest": "var(--up-surface-container-lowest)",
        "surface-container-highest": "var(--up-surface-container-highest)",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
      spacing: {
        "gutter": "24px",
        "header-height": "72px",
        "container-padding-desktop": "40px",
        "base": "8px",
        "sidebar-width": "280px",
        "container-padding-mobile": "20px"
      },
      fontFamily: {
        "body-md": ["Inter", "Noto Sans Odia", "Noto Sans Devanagari", "sans-serif"],
        "display-lg": ["Geist", "Noto Sans Odia", "Noto Sans Devanagari", "sans-serif"],
        "label-sm": ["JetBrains Mono", "monospace"],
        "display-lg": ["Geist", "sans-serif"],
        "headline-md": ["Geist", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"]
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
