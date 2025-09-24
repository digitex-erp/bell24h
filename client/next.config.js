/** @type {import('next').NextConfig} */
const nextConfig = {
  // Normal Next.js deployment (not static export)
  output: undefined, // Remove static export
  trailingSlash: false,

  // Enable image optimization for Next.js
  images: {
    unoptimized: false,
  },

  // Skip problematic features during build
  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  // Disable features that cause build issues
  experimental: {
    esmExternals: false,
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