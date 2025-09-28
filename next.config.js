/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Fix for GitHub Actions deployment
  output: 'standalone',
  trailingSlash: false,
  // Disable static optimization for dynamic routes
  generateStaticParams: false,
  // Fix for API routes
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  // Fix for build errors
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Fix for dynamic server usage
  serverComponentsExternalPackages: ['@prisma/client'],
}

module.exports = nextConfig
