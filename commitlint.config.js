module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      2,
      "always",
      ["home", "web", "mobile", "ui", "core", "docs", "deps", "devops"],
    ],
  },
};
