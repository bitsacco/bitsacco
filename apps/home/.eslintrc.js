/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ['@bitsacco/eslint-config/next'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    // Disable unsafe any rules for Sanity CMS integration
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/require-await': 'off',
    'no-useless-escape': 'off',
    '@next/next/no-img-element': 'warn',
    'prefer-const': 'error',
  },
}
