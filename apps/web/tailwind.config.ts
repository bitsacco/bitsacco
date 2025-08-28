import type { Config } from "tailwindcss";
import { bitsaccoPreset, getAllContentPaths } from "@bitsacco/tailwind-config";

const config: Config = {
  content: getAllContentPaths({
    appPaths: [
      // Web app specific paths (middleware, etc.)
      "./middleware.ts",
    ],
    includeUI: true,
  }),
  presets: [bitsaccoPreset as Config],
  theme: {
    extend: {
      // Web app specific theme extensions can go here
    },
  },
  plugins: [
    // Web app specific plugins can go here
  ],
} satisfies Config;

export default config;
