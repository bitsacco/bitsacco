/** @type {import("prettier").Config} */
module.exports = {
  semi: true,
  trailingComma: "all",
  singleQuote: false,
  printWidth: 80,
  tabWidth: 2,
  endOfLine: "lf",
  arrowParens: "always",
  // Important: We're not using prettier-plugin-organize-imports
  // or any import sorting plugins because they conflict with
  // ESLint's import/order rule. Let ESLint handle import ordering.
};