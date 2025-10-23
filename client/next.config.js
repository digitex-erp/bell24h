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
    // Memory optimization
    memoryBasedWorkers: true,
    workerThreads: false,
  },

  // Webpack optimization for memory
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Memory optimization
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
        },
      },
    };

    return config;
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
