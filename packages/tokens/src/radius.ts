/**
 * Bitsacco Design System - Border Radius Tokens
 * Consistent border radius scale for components
 */

export const borderRadius = {
  none: "0px",
  sm: "2px",
  base: "4px",
  md: "6px",
  lg: "8px",
  xl: "12px",
  "2xl": "16px",
  "3xl": "24px",
  "4xl": "32px", // Custom from home app
  full: "9999px",
} as const;

// Semantic radius aliases
export const semanticRadius = {
  // Component specific radius
  button: {
    sm: borderRadius.md, // 6px
    md: borderRadius.lg, // 8px
    lg: borderRadius.xl, // 12px
  },

  card: {
    sm: borderRadius.lg, // 8px
    md: borderRadius.xl, // 12px
    lg: borderRadius["2xl"], // 16px
  },

  input: {
    sm: borderRadius.md, // 6px
    md: borderRadius.lg, // 8px
  },

  modal: {
    sm: borderRadius.xl, // 12px
    md: borderRadius["2xl"], // 16px
    lg: borderRadius["3xl"], // 24px
  },

  avatar: {
    sm: borderRadius.md, // 6px
    md: borderRadius.lg, // 8px
    lg: borderRadius.xl, // 12px
    round: borderRadius.full, // 9999px
  },

  badge: {
    sm: borderRadius.base, // 4px
    md: borderRadius.md, // 6px
    pill: borderRadius.full, // 9999px
  },
} as const;

export type BorderRadius = keyof typeof borderRadius;
export type SemanticRadius = keyof typeof semanticRadius;
