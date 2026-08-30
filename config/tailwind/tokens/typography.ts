/**
 * Bitsacco Design System - Typography Tokens
 * Font families, sizes, weights, and line heights
 */

export const fontFamily = {
  // Default sans-serif stack - optimized for web interfaces
  sans: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Oxygen",
    "Ubuntu",
    "Cantarell",
    "Fira Sans",
    "Droid Sans",
    "Helvetica Neue",
    "sans-serif",
  ],
  // Chakra UI derived fonts for consistency with webapp
  heading: [
    "Satoshi",
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "sans-serif",
  ],
  body: [
    "Nunito",
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "sans-serif",
  ],
  title: [
    "Poppins",
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "sans-serif",
  ],
  mono: [
    "ui-monospace",
    "SFMono-Regular",
    "Monaco",
    "Cascadia Code",
    "Segoe UI Mono",
    "Roboto Mono",
    "Oxygen Mono",
    "Ubuntu Monospace",
    "Source Code Pro",
    "Fira Mono",
    "Droid Sans Mono",
    "Courier New",
    "monospace",
  ],
} as const;

export const fontSize = {
  xs: ["12px", { lineHeight: "16px" }], // 0.75rem
  sm: ["14px", { lineHeight: "20px" }], // 0.875rem
  base: ["16px", { lineHeight: "24px" }], // 1rem
  lg: ["18px", { lineHeight: "28px" }], // 1.125rem
  xl: ["20px", { lineHeight: "28px" }], // 1.25rem
  "2xl": ["24px", { lineHeight: "32px" }], // 1.5rem
  "3xl": ["30px", { lineHeight: "36px" }], // 1.875rem
  "4xl": ["36px", { lineHeight: "40px" }], // 2.25rem
  "5xl": ["48px", { lineHeight: "52px" }], // 3rem
  "6xl": ["60px", { lineHeight: "64px" }], // 3.75rem
  "7xl": ["72px", { lineHeight: "76px" }], // 4.5rem
  "8xl": ["96px", { lineHeight: "100px" }], // 6rem
  "9xl": ["120px", { lineHeight: "124px" }], // 7.5rem
} as const;

export const fontWeight = {
  thin: "100",
  extralight: "200",
  light: "300",
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
  black: "900",
} as const;

export const letterSpacing = {
  tighter: "-0.05em",
  tight: "-0.025em",
  normal: "0em",
  wide: "0.025em",
  wider: "0.05em",
  widest: "0.1em",
} as const;

export const lineHeight = {
  none: "1",
  tight: "1.25",
  snug: "1.375",
  normal: "1.5",
  relaxed: "1.625",
  loose: "2",
} as const;

// Semantic typography styles
export const semanticTypography = {
  // Display text
  display: {
    "2xl": {
      fontSize: fontSize["9xl"],
      fontWeight: fontWeight.bold,
      letterSpacing: letterSpacing.tight,
    },
    xl: {
      fontSize: fontSize["8xl"],
      fontWeight: fontWeight.bold,
      letterSpacing: letterSpacing.tight,
    },
    lg: {
      fontSize: fontSize["7xl"],
      fontWeight: fontWeight.bold,
      letterSpacing: letterSpacing.tight,
    },
    md: {
      fontSize: fontSize["6xl"],
      fontWeight: fontWeight.bold,
      letterSpacing: letterSpacing.tight,
    },
    sm: {
      fontSize: fontSize["5xl"],
      fontWeight: fontWeight.bold,
      letterSpacing: letterSpacing.tight,
    },
  },

  // Heading text
  heading: {
    h1: {
      fontSize: fontSize["4xl"],
      fontWeight: fontWeight.bold,
      letterSpacing: letterSpacing.tight,
    },
    h2: {
      fontSize: fontSize["3xl"],
      fontWeight: fontWeight.bold,
      letterSpacing: letterSpacing.tight,
    },
    h3: {
      fontSize: fontSize["2xl"],
      fontWeight: fontWeight.semibold,
      letterSpacing: letterSpacing.normal,
    },
    h4: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.semibold,
      letterSpacing: letterSpacing.normal,
    },
    h5: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.medium,
      letterSpacing: letterSpacing.normal,
    },
    h6: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.medium,
      letterSpacing: letterSpacing.normal,
    },
  },

  // Body text
  body: {
    lg: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.normal,
      letterSpacing: letterSpacing.normal,
    },
    md: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.normal,
      letterSpacing: letterSpacing.normal,
    },
    sm: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.normal,
      letterSpacing: letterSpacing.normal,
    },
    xs: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.normal,
      letterSpacing: letterSpacing.normal,
    },
  },

  // Label text
  label: {
    lg: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.medium,
      letterSpacing: letterSpacing.normal,
    },
    md: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      letterSpacing: letterSpacing.normal,
    },
    sm: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.medium,
      letterSpacing: letterSpacing.wide,
    },
  },

  // Code/monospace text
  code: {
    lg: {
      fontSize: fontSize.base,
      fontFamily: fontFamily.mono,
      fontWeight: fontWeight.normal,
    },
    md: {
      fontSize: fontSize.sm,
      fontFamily: fontFamily.mono,
      fontWeight: fontWeight.normal,
    },
    sm: {
      fontSize: fontSize.xs,
      fontFamily: fontFamily.mono,
      fontWeight: fontWeight.normal,
    },
  },
} as const;

export type FontSize = keyof typeof fontSize;
export type FontWeight = keyof typeof fontWeight;
export type LetterSpacing = keyof typeof letterSpacing;
export type LineHeight = keyof typeof lineHeight;
