/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "./index.js",
    "next/core-web-vitals",
  ],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    
    // Allow async client components
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        checksVoidReturn: {
          attributes: false,
        },
      },
    ],
  },
};