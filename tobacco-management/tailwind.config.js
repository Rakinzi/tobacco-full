/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          border: "oklch(var(--color-border) / <alpha-value>)",
          input: "oklch(var(--color-input) / <alpha-value>)",
          background: "oklch(var(--color-background) / <alpha-value>)",
          foreground: "oklch(var(--color-foreground) / <alpha-value>)",
          primary: {
            DEFAULT: "oklch(var(--color-primary) / <alpha-value>)",
            foreground: "oklch(var(--color-primary-foreground) / <alpha-value>)",
          },
          secondary: {
            DEFAULT: "oklch(var(--color-secondary) / <alpha-value>)",
            foreground: "oklch(var(--color-secondary-foreground) / <alpha-value>)",
          },
          destructive: {
            DEFAULT: "oklch(var(--color-destructive) / <alpha-value>)",
            foreground: "oklch(var(--color-destructive-foreground) / <alpha-value>)",
          },
          muted: {
            DEFAULT: "oklch(var(--color-muted) / <alpha-value>)",
            foreground: "oklch(var(--color-muted-foreground) / <alpha-value>)",
          },
          accent: {
            DEFAULT: "oklch(var(--color-accent) / <alpha-value>)",
            foreground: "oklch(var(--color-accent-foreground) / <alpha-value>)",
          },
          popover: {
            DEFAULT: "oklch(var(--color-popover) / <alpha-value>)",
            foreground: "oklch(var(--color-popover-foreground) / <alpha-value>)",
          },
          card: {
            DEFAULT: "oklch(var(--color-card) / <alpha-value>)",
            foreground: "oklch(var(--color-card-foreground) / <alpha-value>)",
          },
        },
        borderRadius: {
          lg: "var(--radius)",
          md: "calc(var(--radius) - 2px)",
          sm: "calc(var(--radius) - 4px)",
        },
        keyframes: {
          "accordion-down": {
            from: { height: 0 },
            to: { height: "var(--radix-accordion-content-height)" },
          },
          "accordion-up": {
            from: { height: "var(--radix-accordion-content-height)" },
            to: { height: 0 },
          },
        },
        animation: {
          "accordion-down": "accordion-down 0.2s ease-out",
          "accordion-up": "accordion-up 0.2s ease-out",
        },
      },
    },
    plugins: [],
  }