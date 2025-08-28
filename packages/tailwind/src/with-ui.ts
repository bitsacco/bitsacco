import type { Config } from "tailwindcss";
import { bitsaccoPreset } from "./index";

/**
 * Bitsacco Tailwind CSS Preset with UI Package Integration
 *
 * This preset extends the base preset and adds content paths for the
 * @bitsacco/ui package to ensure proper CSS class discovery for shared
 * components. Apps that use components from @bitsacco/ui should use this preset.
 */
export const withUI: Config = {
  ...bitsaccoPreset,
  content: [
    // Include UI package components for class discovery
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/dist/**/*.{js,ts,jsx,tsx}", // Include built files too
  ],
};
