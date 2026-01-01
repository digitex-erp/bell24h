<<<<<<< HEAD
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimized for Vercel deployment
  output: undefined, // Remove static export
  trailingSlash: false,

  // Enable image optimization for Next.js
  images: {
    unoptimized: false,
    domains: ['localhost', 'vercel.app'],
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['pages', 'utils', 'components', 'lib', 'src']
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  // Optimized experimental features
  experimental: {
    esmExternals: false,
    serverComponentsExternalPackages: ['ioredis', '@prisma/client'],
  },

  // Timeout settings for production build
  staticPageGenerationTimeout: 180,

  // Environment variables for build
  env: {
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    DATABASE_URL: process.env.DATABASE_URL,
  },

  // Block problematic routes during build
  async rewrites() {
    return [
      {
        source: '/upload-invoice',
        destination: '/404'
      },
      {
        source: '/admin/audit/video',
        destination: '/404'
      },
      {
        source: '/legal/msme-registration',
        destination: '/404'
      },
      {
        source: '/dashboard/video-rfq',
        destination: '/404'
      },
      {
        source: '/claim-company/:slug*',
        destination: '/404'
      },
      {
        source: '/claim/:companyId*',
        destination: '/404'
      },
      {
        source: '/business-categories',
        destination: '/404'
      },
      {
        source: '/legal/urd-information',
        destination: '/404'
      }
    ]
  },


=======
﻿/** @type {import('next').NextConfig} */
const nextConfig = {
  // Oracle VM configuration - Full Next.js with API routes
  // output: 'export' REMOVED - Dynamic API routes require server-side rendering
  // Enable standalone output for Docker deployment
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['bell24h.com', 'n8n.bell24h.com', 'www.bell24h.com'],
    unoptimized: false, // Enable image optimization on Oracle VM
  },
  async redirects() {
    return [
      {
        source: '/n8n',
        destination: 'https://n8n.bell24h.com',
        permanent: true,
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
    dirs: [],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    esmExternals: false,
  },
  // Enable webpack cache for Oracle VM (no 25MB limit here)
  webpack: (config, { dev, isServer }) => {
    // Keep cache enabled for faster rebuilds on Oracle VM
    if (!dev) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
    }
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      util: false,
      url: false,
      assert: false,
      http: false,
      https: false,
      zlib: false,
      path: false,
    };
    return config;
  },
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
}

module.exports = nextConfig
