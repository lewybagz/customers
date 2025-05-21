/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  theme: {
    screens: {
      xs: "480px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      fontFamily: {
        "space-grotesk": ['"Space Grotesk"', "sans-serif"],
        aldrich: ['"Aldrich"', "sans-serif"],
      },
      transitionProperty: {
        "max-height": "max-height",
      },
      transitionDuration: {
        400: "400ms",
        600: "600ms",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        squadspot: {
          primary: "hsl(var(--squadspot-primary))", // Green
          secondary: "hsl(var(--squadspot-secondary))", // Dark Gray
          accent: "#95191E", // Red
          neutral: "hsl(var(--squadspot-neutral))", // Light Gray
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        "fade-out": {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
        "confetti-explosion": {
          "0%": {
            transform: "scale(0) rotate(0deg)",
            opacity: 0,
          },
          "50%": {
            opacity: 1,
          },
          "100%": {
            transform: "scale(1.5) rotate(360deg)",
            opacity: 0,
          },
        },
        "scale-up-center": {
          "0%": {
            transform: "scale(0.8)",
            opacity: 0,
          },
          "50%": {
            transform: "scale(1.1)",
          },
          "100%": {
            transform: "scale(1)",
            opacity: 1,
          },
        },
        "bounce-in": {
          "0%": {
            transform: "scale(0)",
            opacity: 0,
          },
          "60%": {
            transform: "scale(1.1)",
            opacity: 1,
          },
          "80%": {
            transform: "scale(0.95)",
          },
          "100%": {
            transform: "scale(1)",
            opacity: 1,
          },
        },
        "slide-up-fade": {
          "0%": {
            transform: "translateY(20px)",
            opacity: 0,
          },
          "100%": {
            transform: "translateY(0)",
            opacity: 1,
          },
        },
        typing: {
          "0%": { width: "0%" },
          "50%": { width: "100%" },
          "90%": { width: "100%" },
          "100%": { width: "0%" },
        },
        progress: {
          "0%": { transform: "translateX(-100%)" },
          "50%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" },
        },

        // Square 1 (top-left) moves: position 1 → 3 → 4 → 2 → 1
        "rotate-1": {
          "0%": { top: "0", left: "0" }, // Position 1 (top-left)
          "25%": { top: "70px", left: "0" }, // Position 3 (bottom-left)
          "50%": { top: "70px", left: "70px" }, // Position 4 (bottom-right)
          "75%": { top: "0", left: "70px" }, // Position 2 (top-right)
          "100%": { top: "0", left: "0" }, // Back to Position 1
        },

        // Square 2 (top-right) moves: position 2 → 1 → 3 → 4 → 2
        "rotate-2": {
          "0%": { top: "0", right: "0" }, // Position 2 (top-right)
          "25%": { top: "0", right: "70px" }, // Position 1 (top-left)
          "50%": { top: "70px", right: "70px" }, // Position 3 (bottom-left)
          "75%": { top: "70px", right: "0" }, // Position 4 (bottom-right)
          "100%": { top: "0", right: "0" }, // Back to Position 2
        },

        // Square 3 (bottom-left) moves: position 3 → 4 → 2 → 1 → 3
        "rotate-3": {
          "0%": { bottom: "0", left: "0" }, // Position 3 (bottom-left)
          "25%": { bottom: "0", left: "70px" }, // Position 4 (bottom-right)
          "50%": { bottom: "70px", left: "70px" }, // Position 2 (top-right)
          "75%": { bottom: "70px", left: "0" }, // Position 1 (top-left)
          "100%": { bottom: "0", left: "0" }, // Back to Position 3
        },

        // Square 4 (bottom-right) moves: position 4 → 2 → 1 → 3 → 4
        "rotate-4": {
          "0%": { bottom: "0", right: "0" },
          "25%": { bottom: "70px", right: "0" },
          "50%": { bottom: "70px", right: "70px" }, // Position 1 (top-left)
          "75%": { bottom: "0", right: "70px" }, // Position 3 (bottom-left)
          "100%": { bottom: "0", right: "0" }, // Back to Position 4
        },

        "collapsible-down": {
          from: { height: "0" },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        "collapsible-up": {
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: "0" },
        },
      },

      animation: {
        in: "fade-in 200ms ease-in-out",
        out: "fade-out 200ms ease-in-out",
        confetti: "confetti-explosion 1s ease-out forwards",
        "scale-up":
          "scale-up-center 0.4s cubic-bezier(0.390, 0.575, 0.565, 1.000) both",
        "bounce-in": "bounce-in 0.6s ease-out both",
        "slide-up": "slide-up-fade 0.4s ease-out both",
        typing: "typing 3s steps(20) infinite",
        progress: "progress 2s ease-in-out infinite",

        // Rotating squares animations
        "rotate-1": "rotate-1 3s infinite",
        "rotate-2": "rotate-2 3s infinite",
        "rotate-3": "rotate-3 3s infinite",
        "rotate-4": "rotate-4 3s infinite",

        "collapsible-down": "collapsible-down 0.2s ease-out",
        "collapsible-up": "collapsible-up 0.2s ease-out",
      },
    },
  },
};
