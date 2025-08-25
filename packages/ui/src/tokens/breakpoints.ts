/**
 * Bitsacco Design System - Breakpoint Tokens
 * Responsive design breakpoints
 */

export const breakpoints = {
  xs: "0px", // Extra small devices
  sm: "640px", // Small devices (mobile landscape)
  md: "768px", // Medium devices (tablets)
  lg: "1024px", // Large devices (desktop)
  xl: "1280px", // Extra large devices (large desktop)
  "2xl": "1536px", // 2X large devices (very large desktop)
} as const;

// Media query helpers
export const mediaQueries = {
  xs: `(min-width: ${breakpoints.xs})`,
  sm: `(min-width: ${breakpoints.sm})`,
  md: `(min-width: ${breakpoints.md})`,
  lg: `(min-width: ${breakpoints.lg})`,
  xl: `(min-width: ${breakpoints.xl})`,
  "2xl": `(min-width: ${breakpoints["2xl"]})`,
} as const;

// Container max widths
export const containerSizes = {
  xs: "475px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// Semantic breakpoint aliases
export const semanticBreakpoints = {
  mobile: breakpoints.xs, // 0px - Mobile first
  tablet: breakpoints.md, // 768px - Tablet and up
  desktop: breakpoints.lg, // 1024px - Desktop and up
  wide: breakpoints.xl, // 1280px - Wide desktop and up
} as const;

export type Breakpoint = keyof typeof breakpoints;
export type SemanticBreakpoint = keyof typeof semanticBreakpoints;
