import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: ["@bitsacco/core", "@bitsacco/ui"],
  },
  transpilePackages: ["@bitsacco/core", "@bitsacco/ui"],
};

export default nextConfig;
