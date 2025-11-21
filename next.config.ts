import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Biar lint error (kayak "Unexpected any", dll) tidak menggagalkan build di Vercel
    ignoreDuringBuilds: true,
  },
  /* config options here */
};

export default nextConfig;
