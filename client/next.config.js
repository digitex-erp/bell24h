/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimized for Vercel deployment
  output: undefined, // Remove static export
  trailingSlash: false,

  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  
  // Enable image optimization for Next.js
  images: {
    unoptimized: false,
    domains: ['localhost', 'vercel.app', 'images.unsplash.com', 'via.placeholder.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
    // Performance features
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Webpack optimization for memory and performance
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
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
    }
    
    // Performance optimizations
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
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
            maxSize: 244000,
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            priority: 20,
            chunks: 'all',
          },
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|framer-motion)[\\/]/,
            name: 'ui',
            priority: 15,
            chunks: 'all',
          },
        },
      },
      usedExports: true,
      sideEffects: false,
    };

    // Tree shaking optimization (only in production)
    if (!dev) {
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }

    // Bundle analyzer in development
    if (dev && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          openAnalyzer: true,
        })
      );
    }

    return config;
  },

  // Timeout settings for production build
  staticPageGenerationTimeout: 180,

  // Caching strategies
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

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
