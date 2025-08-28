const path = require("path");

module.exports = {
  reactStrictMode: true,
  transpilePackages: ["@bitsacco/ui", "@bitsacco/core"],
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
};
