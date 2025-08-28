/**
 * Content path utilities for different app structures
 *
 * These utilities help apps configure their content paths correctly
 * based on their directory structure and whether they use UI components.
 */

/**
 * Standard content paths for Next.js apps in the apps directory
 */
export function getAppContentPaths(appPaths: string[] = []) {
  return [
    // Common Next.js patterns
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",

    // Additional app-specific paths
    ...appPaths,
  ];
}

/**
 * Content paths for UI package components
 * Includes both source and built files for proper class discovery
 */
export function getUIContentPaths() {
  return [
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/dist/**/*.{js,ts,jsx,tsx}",
  ];
}

/**
 * Content paths for other shared packages
 */
export function getSharedPackagePaths(packageNames: string[] = []) {
  return packageNames.flatMap((name) => [
    `../../packages/${name}/src/**/*.{js,ts,jsx,tsx,mdx}`,
    `../../packages/${name}/dist/**/*.{js,ts,jsx,tsx}`,
  ]);
}

/**
 * Combine all content paths for an app that uses shared components
 */
export function getAllContentPaths(
  options: {
    appPaths?: string[];
    includeUI?: boolean;
    additionalPackages?: string[];
  } = {},
) {
  const { appPaths = [], includeUI = true, additionalPackages = [] } = options;

  const paths = [...getAppContentPaths(appPaths)];

  if (includeUI) {
    paths.push(...getUIContentPaths());
  }

  if (additionalPackages.length > 0) {
    paths.push(...getSharedPackagePaths(additionalPackages));
  }

  return paths;
}
