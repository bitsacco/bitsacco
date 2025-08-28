# @bitsacco/tailwind-config

A shared Tailwind CSS configuration package for the Bitsacco monorepo, providing consistent design system integration and best practices.

## Overview

This package provides:

- **Shared Design System**: Integrates with `@bitsacco/ui` design tokens
- **Consistent Configuration**: Unified Tailwind setup across all apps
- **TypeScript Support**: Full type safety for configurations
- **Modular Approach**: Use presets instead of copying configurations
- **Proper Content Discovery**: Automatic inclusion of UI package classes

## Architecture

```
packages/
├── tailwind-config/           # Shared Tailwind presets
│   ├── src/
│   │   ├── index.ts          # Base preset with design system
│   │   ├── with-ui.ts        # Preset with UI package content paths
│   │   └── content-paths.ts  # Utilities for content path management
│   └── dist/                 # Built package
└── ui/                       # Design system and components
    ├── src/tokens/           # Design tokens (colors, typography, etc.)
    └── tailwind.config.ts    # UI package development config
```

## Usage

### Basic Setup for Apps

For apps that use components from `@bitsacco/ui`:

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";
import { getAllContentPaths } from "@bitsacco/tailwind-config";
import bitsaccoPreset from "@bitsacco/tailwind-config";

const config: Config = {
  content: getAllContentPaths({
    appPaths: [
      // Add app-specific paths not covered by defaults
      "./middleware.ts",
    ],
    includeUI: true, // Include @bitsacco/ui components
  }),
  presets: [bitsaccoPreset],
  theme: {
    extend: {
      // App-specific theme extensions
    },
  },
  plugins: [
    // App-specific plugins
  ],
};

export default config;
```

### Content Path Management

The package provides utilities for managing content paths:

```typescript
import {
  getAllContentPaths,
  getAppContentPaths,
  getUIContentPaths,
  getSharedPackagePaths,
} from "@bitsacco/tailwind-config";

// Get all content paths for an app with UI components
const allPaths = getAllContentPaths({
  appPaths: ["./custom/**/*.tsx"], // Additional app paths
  includeUI: true, // Include UI package
  additionalPackages: ["core"], // Include other packages
});

// Just app paths
const appPaths = getAppContentPaths(["./custom/**/*.tsx"]);

// Just UI package paths
const uiPaths = getUIContentPaths();

// Other shared packages
const corePaths = getSharedPackagePaths(["core", "utils"]);
```

## Design System Integration

The preset automatically integrates design tokens from `@bitsacco/ui`:

### Colors

```typescript
// Available color scales
colors: {
  // Brand colors
  primary: { 50: '#fef7e6', 400: '#f7ac00', ... },
  secondary: { 50: '#f3f1ff', 500: '#7c3aed', ... },

  // Neutral colors
  neutral: { 0: '#ffffff', 900: '#171717', ... },
  gray: { /* alias for neutral */ },

  // Semantic colors
  success: { /* green scale */ },
  error: { /* red scale */ },
  warning: { /* amber scale */ },
  info: { /* blue scale */ },

  // Semantic aliases
  background: {
    primary: '#ffffff',
    secondary: '#fafafa',
    // ...
  },
  foreground: {
    primary: '#171717',
    secondary: '#525252',
    // ...
  }
}
```

### Typography

```typescript
// Design system typography integration
fontFamily: {
  sans: ['system-ui', '-apple-system', /* ... */],
  mono: ['ui-monospace', 'SFMono-Regular', /* ... */]
},
fontSize: {
  xs: ['12px', { lineHeight: '16px' }],
  // ... all standard sizes
},
fontWeight: { /* 100-900 */ },
letterSpacing: { /* tighter to widest */ },
lineHeight: { /* none to loose */ }
```

### Enhanced Features

- **Extended Spacing**: Additional spacing values (18, 88, 100, 104, 112, 128)
- **Border Radius**: Extra large radius values (4xl, 5xl, 6xl)
- **Animations**: Common animations (fade-in, slide-in-\*, etc.)
- **Utility Classes**: `.scrollbar-none`, `.scrollbar-thin`, `.focus-ring`
- **Component Classes**: `.btn`, `.btn-primary`, `.btn-secondary`

## App-Specific Customizations

### Home App Example

```typescript
// apps/home/tailwind.config.ts
import type { Config } from "tailwindcss";
import { getAllContentPaths } from "@bitsacco/tailwind-config";
import bitsaccoPreset from "@bitsacco/tailwind-config";

const config: Config = {
  content: getAllContentPaths({
    appPaths: ["./sanity.config.ts"],
    includeUI: true,
  }),
  presets: [bitsaccoPreset],
  theme: {
    extend: {
      fontFamily: {
        // Override with custom font
        sans: [
          "Switzer",
          ...(bitsaccoPreset.theme?.extend?.fontFamily?.sans || []),
        ],
      },
      // Custom animations
      keyframes: {
        "move-x": {
          "0%": { transform: "translateX(var(--move-x-from))" },
          "100%": { transform: "translateX(var(--move-x-to))" },
        },
      },
      animation: {
        "move-x":
          "move-x var(--move-x-duration, 1s) var(--move-x-delay, 0s) var(--move-x-ease, linear) infinite",
      },
    },
  },
};

export default config;
```

## Migration Guide

### From Previous Setup

1. **Install the package**: Already included in workspace
2. **Update imports**: Change from relative paths to package imports
3. **Use presets**: Replace theme extensions with preset usage
4. **Simplify content paths**: Use utility functions instead of manual paths

### Before

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: { extend: {} },
  plugins: [],
};
```

### After

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";
import { getAllContentPaths } from "@bitsacco/tailwind-config";
import bitsaccoPreset from "@bitsacco/tailwind-config";

const config: Config = {
  content: getAllContentPaths({ includeUI: true }),
  presets: [bitsaccoPreset],
};

export default config;
```

## Development

```bash
# Build the package
npm run build

# Watch for changes
npm run dev

# Type check
npm run typecheck
```

## Benefits

1. **Consistency**: All apps use the same design system
2. **Maintainability**: Changes in one place affect all apps
3. **Type Safety**: Full TypeScript support
4. **Performance**: Proper content discovery and purging
5. **Scalability**: Easy to add new apps or modify existing ones
6. **Best Practices**: Follows modern Tailwind monorepo patterns

## Troubleshooting

### Classes Not Being Discovered

Ensure your app's `tailwind.config.ts` includes the correct content paths:

```typescript
content: getAllContentPaths({
  appPaths: ["./your-custom-paths/**/*.tsx"],
  includeUI: true, // Important for UI components
});
```

### Type Errors

Make sure you're using TypeScript config files (`.ts` not `.js`) and importing types:

```typescript
import type { Config } from "tailwindcss";
```

### Build Issues

Ensure the package is built before using:

```bash
npm run build
```
