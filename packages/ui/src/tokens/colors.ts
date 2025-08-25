/**
 * Bitsacco Design System - Color Tokens
 * Platform-agnostic color definitions
 */

export const colors = {
  // Primary colors - Bitcoin/Lightning theme
  primary: {
    50: "#fef7e6",
    100: "#fdecc1",
    200: "#fbd987",
    300: "#f9c23e",
    400: "#f7ac00", // Bitcoin orange
    500: "#e89611",
    600: "#d1780c",
    700: "#b85d0a",
    800: "#9d4b0e",
    900: "#843e0f",
  },

  // Secondary colors - Lightning purple/blue
  secondary: {
    50: "#f3f1ff",
    100: "#e9e5ff",
    200: "#d5ccff",
    300: "#b8a8ff",
    400: "#9679ff",
    500: "#7c3aed", // Lightning purple
    600: "#6d28d9",
    700: "#5b21b6",
    800: "#4c1d95",
    900: "#3c1a78",
  },

  // Neutral/Gray scale
  neutral: {
    0: "#ffffff",
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#e5e5e5",
    300: "#d4d4d4",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
    950: "#0a0a0a",
    1000: "#000000",
  },

  // Semantic colors
  success: {
    50: "#ecfdf5",
    100: "#d1fae5",
    200: "#a7f3d0",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
    800: "#065f46",
    900: "#064e3b",
  },

  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },

  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },

  info: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },
} as const;

// Semantic aliases for easier usage
export const semanticColors = {
  // Background colors
  background: {
    primary: colors.neutral[0],
    secondary: colors.neutral[50],
    tertiary: colors.neutral[100],
    inverse: colors.neutral[900],
  },

  // Text colors
  text: {
    primary: colors.neutral[900],
    secondary: colors.neutral[600],
    tertiary: colors.neutral[400],
    inverse: colors.neutral[0],
    disabled: colors.neutral[300],
  },

  // Border colors
  border: {
    primary: colors.neutral[200],
    secondary: colors.neutral[100],
    focus: colors.primary[400],
    error: colors.error[500],
  },

  // Interactive colors
  interactive: {
    primary: colors.primary[400],
    primaryHover: colors.primary[500],
    primaryActive: colors.primary[600],
    secondary: colors.secondary[500],
    secondaryHover: colors.secondary[600],
    secondaryActive: colors.secondary[700],
  },

  // Status colors
  status: {
    success: colors.success[500],
    successLight: colors.success[100],
    error: colors.error[500],
    errorLight: colors.error[100],
    warning: colors.warning[500],
    warningLight: colors.warning[100],
    info: colors.info[500],
    infoLight: colors.info[100],
  },
} as const;

export type ColorScale = keyof typeof colors;
export type ColorShade = keyof typeof colors.primary;
export type SemanticColor = keyof typeof semanticColors;
