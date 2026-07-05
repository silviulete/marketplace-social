import type { Config } from "tailwindcss";

/**
 * Tokens-urile vizuale provin din designul Stitch „Local AI Supply Assistant"
 * (design system „Sourcing Intelligence System"). Sunt sursa de adevăr vizuală.
 * Reguli ferme (CLAUDE.md): Inter; verde pădure #0d631b/#2e7d32; off-white #f9f9f7;
 * card alb cu bordură 1px #e6e6e4; colțuri 8px (componente) / 16px (carduri);
 * spacing pe bază 8px; adâncime prin tonal layering, nu umbre grele.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Suprafețe (tonal layering)
        background: "#f9f9f7",
        surface: "#f9f9f7",
        "surface-low": "#f4f4f2",
        "surface-container": "#eeeeec",
        "surface-high": "#e8e8e6",
        card: "#ffffff",
        // Text
        "on-surface": "#1a1c1b",
        "on-surface-variant": "#40493d",
        outline: "#707a6c",
        "outline-variant": "#bfcaba",
        "card-border": "#e6e6e4",
        // Brand — verde pădure
        primary: "#0d631b",
        "primary-bright": "#2e7d32",
        "on-primary": "#ffffff",
        secondary: "#006e1c",
        // Chip-uri de status (fundal pal, text saturat)
        "chip-bg": "#e4f3e6",
        "chip-text": "#0d631b",
        // Semnalizări
        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "600" }],
        "headline-lg": ["32px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "600" }],
        "headline-mobile": ["24px", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-md": ["20px", { lineHeight: "1.4", letterSpacing: "-0.01em", fontWeight: "500" }],
        "body-lg": ["16px", { lineHeight: "1.6", letterSpacing: "0", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "1.5", letterSpacing: "0", fontWeight: "400" }],
        "label-md": ["12px", { lineHeight: "1", letterSpacing: "0.05em", fontWeight: "600" }],
      },
      spacing: {
        // bază 8px
        xs: "4px",
        sm: "12px",
        base: "8px",
        md: "24px",
        lg: "48px",
        xl: "80px",
      },
      borderRadius: {
        // componente 8px, carduri 16px, artefacte 24px, pill complet
        DEFAULT: "8px",
        card: "16px",
        art: "24px",
        pill: "9999px",
      },
      boxShadow: {
        // adâncime difuză, nu umbre grele
        art: "0 4px 24px rgba(28,28,28,0.04)",
        float: "0 6px 30px rgba(28,28,28,0.06)",
      },
      maxWidth: {
        chat: "800px",
        phone: "480px",
      },
      keyframes: {
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
        "pulse-soft": "pulse-soft 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
