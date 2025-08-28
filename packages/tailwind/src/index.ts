import type { Config } from "tailwindcss";
import { colors, semanticColors } from "./tokens/colors";
import {
  fontFamily,
  fontSize,
  fontWeight,
  letterSpacing,
  lineHeight,
} from "./tokens/typography";

/**
 * Bitsacco Tailwind CSS Base Preset
 *
 * This preset provides the core design system configuration that all apps
 * in the monorepo should extend. It integrates with the @bitsacco/ui
 * design tokens to ensure consistency.
 */
export const bitsaccoPreset: Config = {
  content: [],
  theme: {
    extend: {
      // Colors - Integrate design system colors
      colors: {
        // Core brand colors
        primary: colors.primary,
        secondary: colors.secondary,

        // Teal scale (explicit for Chakra UI compatibility)
        teal: colors.teal,

        // Neutral/gray scale
        neutral: colors.neutral,
        gray: colors.neutral, // Alias for Tailwind compatibility

        // Semantic colors
        success: colors.success,
        error: colors.error,
        warning: colors.warning,
        info: colors.info,

        // Semantic aliases for common use cases
        background: semanticColors.background,
        foreground: {
          primary: semanticColors.text.primary,
          secondary: semanticColors.text.secondary,
          tertiary: semanticColors.text.tertiary,
          inverse: semanticColors.text.inverse,
          disabled: semanticColors.text.disabled,
        },
        border: semanticColors.border,
        interactive: semanticColors.interactive,
        status: semanticColors.status,
      },

      // Typography - Integrate design system typography
      fontFamily: {
        sans: [...fontFamily.sans],
        mono: [...fontFamily.mono],
        heading: [...fontFamily.heading],
        body: [...fontFamily.body],
        title: [...fontFamily.title],
      },
      fontSize: {
        xs: [...fontSize.xs],
        sm: [...fontSize.sm],
        base: [...fontSize.base],
        lg: [...fontSize.lg],
        xl: [...fontSize.xl],
        "2xl": [...fontSize["2xl"]],
        "3xl": [...fontSize["3xl"]],
        "4xl": [...fontSize["4xl"]],
        "5xl": [...fontSize["5xl"]],
        "6xl": [...fontSize["6xl"]],
        "7xl": [...fontSize["7xl"]],
        "8xl": [...fontSize["8xl"]],
        "9xl": [...fontSize["9xl"]],
      },
      fontWeight: { ...fontWeight },
      letterSpacing: { ...letterSpacing },
      lineHeight: { ...lineHeight },

      // Spacing - Enhanced spacing scale
      spacing: {
        "18": "4.5rem", // 72px
        "88": "22rem", // 352px
        "100": "25rem", // 400px
        "104": "26rem", // 416px
        "112": "28rem", // 448px
        "128": "32rem", // 512px
      },

      // Border radius - Design system integration
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
        "6xl": "3rem",
      },

      // Shadows - Enhanced shadow scale
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
        inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
      },

      // Animation - Base animations that can be extended
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-in-down": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "fade-out": "fade-out 0.15s ease-in",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "slide-in-up": "slide-in-up 0.3s ease-out",
        "slide-in-down": "slide-in-down 0.3s ease-out",
      },
    },
  },

  plugins: [
    // Base utility plugin for common patterns
    function ({ addUtilities, addComponents, addBase, theme }: any) {
      // CSS Custom Properties for theme consistency
      addBase({
        ":root": {
          // Font families as CSS custom properties
          "--font-heading": fontFamily.heading.join(", "),
          "--font-body": fontFamily.body.join(", "),
          "--font-title": fontFamily.title.join(", "),
          "--font-sans": fontFamily.sans.join(", "),
          "--font-mono": fontFamily.mono.join(", "),

          // Teal color scale as CSS custom properties (matching webapp Chakra UI)
          "--color-teal-50": theme("colors.teal.50"),
          "--color-teal-100": theme("colors.teal.100"),
          "--color-teal-200": theme("colors.teal.200"),
          "--color-teal-300": theme("colors.teal.300"),
          "--color-teal-400": theme("colors.teal.400"),
          "--color-teal-500": theme("colors.teal.500"),
          "--color-teal-600": theme("colors.teal.600"),
          "--color-teal-700": theme("colors.teal.700"),
          "--color-teal-800": theme("colors.teal.800"),
          "--color-teal-900": theme("colors.teal.900"),

          // Primary color aliases (teal-based)
          "--color-primary": theme("colors.primary.400"),
          "--color-primary-hover": theme("colors.primary.500"),
          "--color-primary-active": theme("colors.primary.600"),

          // Dark mode by default (matching webapp)
          "--color-mode": "dark",
        },
      });
      // Scrollbar utilities
      addUtilities({
        ".scrollbar-none": {
          "scrollbar-width": "none",
          "-ms-overflow-style": "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
        ".scrollbar-thin": {
          "scrollbar-width": "thin",
          "&::-webkit-scrollbar": {
            width: "6px",
            height: "6px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: theme("colors.neutral.100"),
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: theme("colors.neutral.400"),
            borderRadius: theme("borderRadius.full"),
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: theme("colors.neutral.500"),
          },
        },
      });

      // Focus ring utilities
      addUtilities({
        ".focus-ring": {
          "&:focus": {
            outline: "none",
            boxShadow: `0 0 0 3px ${theme("colors.primary.400")}40`,
          },
        },
        ".focus-ring-error": {
          "&:focus": {
            outline: "none",
            boxShadow: `0 0 0 3px ${theme("colors.error.500")}40`,
          },
        },
      });

      // Component base styles
      addComponents({
        ".btn": {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: theme("borderRadius.lg"),
          fontWeight: theme("fontWeight.medium"),
          fontSize: theme("fontSize.sm")[0],
          lineHeight: theme("fontSize.sm")[1].lineHeight,
          transition: "all 0.15s ease-in-out",
          cursor: "pointer",
          border: "none",
          "&:disabled": {
            opacity: "0.5",
            cursor: "not-allowed",
          },
        },
        ".btn-primary": {
          backgroundColor: theme("colors.teal.500"),
          color: theme("colors.neutral.0"),
          "&:hover:not(:disabled)": {
            backgroundColor: theme("colors.teal.600"),
          },
          "&:active:not(:disabled)": {
            backgroundColor: theme("colors.teal.700"),
          },
        },
        ".btn-secondary": {
          backgroundColor: theme("colors.neutral.100"),
          color: theme("colors.neutral.900"),
          "&:hover:not(:disabled)": {
            backgroundColor: theme("colors.neutral.200"),
          },
          "&:active:not(:disabled)": {
            backgroundColor: theme("colors.neutral.300"),
          },
        },
      });
    },
  ],
};

// Re-export content path utilities
export * from "./content-paths";

// Export withUI preset
export { withUI } from "./with-ui";
