import { bitsaccoPreset } from './config/tailwind'
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './sanity.config.ts',
  ],
  presets: [bitsaccoPreset],
  theme: {
    extend: {
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
  plugins: [],
} satisfies Config

export default config
