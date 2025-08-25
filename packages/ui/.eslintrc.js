/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@bitsacco"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  rules: {
    // Package-specific overrides if needed
  },
};