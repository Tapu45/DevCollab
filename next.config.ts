import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // disables ESLint during build
  },
  typescript: {
    ignoreBuildErrors: true, // disables TypeScript errors during build
  },
};

export default nextConfig;