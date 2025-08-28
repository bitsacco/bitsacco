/**
 * Bitsacco Design System - Shadow Tokens
 * Consistent shadow system for depth and elevation
 */

export const boxShadow = {
  none: "none",
  xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  base: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
} as const;

export const dropShadow = {
  none: "none",
  xs: "drop-shadow(0 1px 1px rgb(0 0 0 / 0.05))",
  sm: "drop-shadow(0 1px 2px rgb(0 0 0 / 0.1)) drop-shadow(0 1px 1px rgb(0 0 0 / 0.06))",
  base: "drop-shadow(0 1px 3px rgb(0 0 0 / 0.1)) drop-shadow(0 1px 2px rgb(0 0 0 / 0.06))",
  md: "drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06))",
  lg: "drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))",
  xl: "drop-shadow(0 20px 13px rgb(0 0 0 / 0.03)) drop-shadow(0 8px 5px rgb(0 0 0 / 0.08))",
  "2xl": "drop-shadow(0 25px 25px rgb(0 0 0 / 0.15))",
} as const;

// Semantic shadow aliases
export const semanticShadows = {
  // Component specific shadows
  card: {
    sm: boxShadow.sm, // Subtle card shadow
    md: boxShadow.md, // Default card shadow
    lg: boxShadow.lg, // Elevated card shadow
  },

  button: {
    sm: boxShadow.xs, // Subtle button shadow
    md: boxShadow.sm, // Default button shadow
    lg: boxShadow.md, // Prominent button shadow
  },

  modal: {
    sm: boxShadow.lg, // Modal backdrop shadow
    md: boxShadow.xl, // Default modal shadow
    lg: boxShadow["2xl"], // Prominent modal shadow
  },

  dropdown: {
    sm: boxShadow.md, // Dropdown menu shadow
    md: boxShadow.lg, // Default dropdown shadow
  },

  tooltip: {
    sm: boxShadow.sm, // Tooltip shadow
    md: boxShadow.md, // Default tooltip shadow
  },

  // Interactive states
  focus: {
    ring: "0 0 0 3px rgb(249 115 22 / 0.1)", // Orange focus ring
    ringPrimary: "0 0 0 3px rgb(249 115 22 / 0.1)", // Primary focus
    ringSecondary: "0 0 0 3px rgb(124 58 237 / 0.1)", // Secondary focus
    ringError: "0 0 0 3px rgb(239 68 68 / 0.1)", // Error focus
  },

  // Elevation system
  elevation: {
    0: boxShadow.none,
    1: boxShadow.xs,
    2: boxShadow.sm,
    3: boxShadow.base,
    4: boxShadow.md,
    5: boxShadow.lg,
    6: boxShadow.xl,
    7: boxShadow["2xl"],
  },
} as const;

export type BoxShadow = keyof typeof boxShadow;
export type DropShadow = keyof typeof dropShadow;
export type SemanticShadow = keyof typeof semanticShadows;
