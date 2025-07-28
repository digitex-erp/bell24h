/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable all problematic features
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Remove ALL experimental features
  experimental: {},
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
