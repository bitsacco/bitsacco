/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@bitsacco/eslint-config/next"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: [
    ".next/**/*",
    "node_modules/**/*",
    "out/**/*",
    "public/**/*",
    ".turbo/**/*",
    "*.js",
    "*.mjs",
    "*.cjs",
  ],
  rules: {
    // App-specific overrides if needed
  },
};