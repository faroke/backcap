import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Backcap capabilities use ESM-style .js extensions in TypeScript imports.
    // Next.js webpack needs to resolve .js → .ts for these to work.
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
    };
    return config;
  },
};

export default nextConfig;
