import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Skip static generation for routes that need database
  experimental: {
    // Disable static optimization for routes with dynamic data
    isrMemoryCacheSize: 0,
  },
};

// Force rebuild - v2
export default nextConfig;
