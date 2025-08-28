/**
 * Bitsacco Design System - Color Tokens
 * Platform-agnostic color definitions
 * Primary theme: Teal (matching webapp Chakra UI theme)
 */

export const colors = {
  // Primary colors - Teal theme (matching webapp)
  primary: {
    50: "#f0fdfa",
    100: "#ccfbf1",
    200: "#99f6e4",
    300: "#5eead4",
    400: "#2dd4bf", // Teal primary
    500: "#14b8a6",
    600: "#0d9488",
    700: "#0f766e",
    800: "#115e59",
    900: "#134e4a",
  },

  // Secondary colors - Complementary blue
  secondary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6", // Blue secondary
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },

  // Teal scale (explicit for Chakra UI compatibility)
  teal: {
    50: "#f0fdfa",
    100: "#ccfbf1",
    200: "#99f6e4",
    300: "#5eead4",
    400: "#2dd4bf",
    500: "#14b8a6",
    600: "#0d9488",
    700: "#0f766e",
    800: "#115e59",
    900: "#134e4a",
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
