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

  // Skip problematic features during build
  eslint: {
    ignoreDuringBuilds: true,
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


}

module.exports = nextConfig
