/**
 * Bitsacco Design System - Spacing Tokens
 * Consistent spacing scale based on 4px grid
 */

export const spacing = {
  0: "0px",
  1: "4px", // 0.25rem
  2: "8px", // 0.5rem
  3: "12px", // 0.75rem
  4: "16px", // 1rem
  5: "20px", // 1.25rem
  6: "24px", // 1.5rem
  8: "32px", // 2rem
  10: "40px", // 2.5rem
  12: "48px", // 3rem
  16: "64px", // 4rem
  20: "80px", // 5rem
  24: "96px", // 6rem
  32: "128px", // 8rem
  40: "160px", // 10rem
  48: "192px", // 12rem
  56: "224px", // 14rem
  64: "256px", // 16rem
} as const;

// Semantic spacing aliases
export const semanticSpacing = {
  // Component spacing
  component: {
    xs: spacing[1], // 4px
    sm: spacing[2], // 8px
    md: spacing[4], // 16px
    lg: spacing[6], // 24px
    xl: spacing[8], // 32px
  },

  // Layout spacing
  layout: {
    xs: spacing[4], // 16px
    sm: spacing[6], // 24px
    md: spacing[8], // 32px
    lg: spacing[12], // 48px
    xl: spacing[16], // 64px
    xxl: spacing[24], // 96px
  },

  // Container padding
  container: {
    mobile: spacing[4], // 16px
    tablet: spacing[6], // 24px
    desktop: spacing[8], // 32px
  },

  // Section spacing
  section: {
    sm: spacing[8], // 32px
    md: spacing[12], // 48px
    lg: spacing[16], // 64px
    xl: spacing[24], // 96px
  },
} as const;

export type SpacingScale = keyof typeof spacing;
export type SemanticSpacing = keyof typeof semanticSpacing;
