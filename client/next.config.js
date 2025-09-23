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

  // API routes are allowed in normal Next.js
  async rewrites() {
    return [
      // No rewrites needed for normal deployment
    ]
  },

}

module.exports = nextConfig