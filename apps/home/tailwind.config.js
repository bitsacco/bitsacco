/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  presets: [],
  theme: {
    extend: {
      // Keep existing custom extensions
      fontFamily: {
        sans: ['Switzer'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        'move-x': {
          '0%': { transform: 'translateX(var(--move-x-from))' },
          '100%': { transform: 'translateX(var(--move-x-to))' },
        },
      },
      animation: {
        'move-x': 'move-x var(--move-x-duration, 1s) var(--move-x-delay, 0s) var(--move-x-ease, linear) infinite',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-none': {
          'scrollbar-width': 'none',
          '-ms-overflow-style': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      })
    },
  ],
}