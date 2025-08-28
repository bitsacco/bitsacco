import type { Config } from "tailwindcss";
import { bitsaccoPreset } from "@bitsacco/tailwind-config";

/**
 * Tailwind configuration for the UI package
 *
 * This configuration is used for development and testing of UI components.
 * It uses the shared Bitsacco preset and includes content paths for the
 * UI package source files.
 */
const config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./stories/**/*.{js,ts,jsx,tsx,mdx}", // For Storybook if used
    "./**/*.stories.{js,ts,jsx,tsx}", // Story files
  ],
  presets: [bitsaccoPreset as Config],
  theme: {
    extend: {
      // UI package specific theme extensions
      // This is where component-specific design tokens could be added
    },
  },
  plugins: [
    // UI package specific plugins
  ],
} satisfies Config;

export default config;
