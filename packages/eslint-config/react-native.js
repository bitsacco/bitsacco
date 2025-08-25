/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "./index.js",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  plugins: ["react", "react-hooks", "react-native"],
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react-native/no-unused-styles": "warn",
    "react-native/split-platform-components": "warn",
    "react-native/no-inline-styles": "warn",
    "react-native/no-color-literals": "warn",
  },
};