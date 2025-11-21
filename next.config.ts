import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Supaya lint error (ESLint) nggak gagalin build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Supaya error TypeScript (type checking) nggak gagalin build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
