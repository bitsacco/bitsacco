import { bitsaccoPreset, getAllContentPaths } from '@bitsacco/tailwind-config'
import type { Config } from 'tailwindcss'

const config: Config = {
  content: getAllContentPaths({
    appPaths: [
      // Home app specific paths
      './sanity.config.ts',
    ],
    includeUI: true,
  }),
  presets: [bitsaccoPreset],
  theme: {
    extend: {
      // Home app specific theme extensions can go here
      // Custom animations for home app
      keyframes: {
        'move-x': {
          '0%': { transform: 'translateX(var(--move-x-from))' },
          '100%': { transform: 'translateX(var(--move-x-to))' },
        },
      },
      animation: {
        'move-x':
          'move-x var(--move-x-duration, 1s) var(--move-x-delay, 0s) var(--move-x-ease, linear) infinite',
      },
    },
  },
  plugins: [
    // Home app specific plugins can go here
  ],
} satisfies Config

export default config
