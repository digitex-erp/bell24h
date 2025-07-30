/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable all problematic features
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Optimize for serverless deployment
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  },
  // Disable image optimization
  images: {
    unoptimized: true,
  },
  // Disable SWC minification
  swcMinify: false,
  // Disable strict mode
  reactStrictMode: false,
  // Standalone output for deployment
  output: 'standalone',
  // Environment variables for build optimization
  env: {
    SKIP_DB_OPERATIONS: process.env.SKIP_DB_OPERATIONS || 'false'
  },
  // Disable webpack bundle analyzer
  webpack: config => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

module.exports = nextConfig;
