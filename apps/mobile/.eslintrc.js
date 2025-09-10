/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["expo", "prettier"],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "error",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "@typescript-eslint/ban-types": "off",
    "import/no-unresolved": "off",
  },
  ignorePatterns: [".expo/**", "dist/**", "node_modules/**"],
  root: true,
};