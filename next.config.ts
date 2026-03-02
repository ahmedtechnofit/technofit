import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  // Provide dummy DATABASE_URL for build time
  env: {
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://build:build@localhost:5432/build',
  },
};

export default nextConfig;
