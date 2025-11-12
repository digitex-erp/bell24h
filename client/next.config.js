/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['bell24h.com', 'n8n.bell24h.com'],
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
    dirs: [], // Disable ESLint for all directories
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    esmExternals: false,
  },
  // Disable webpack cache for Cloudflare Pages (prevents 25MB limit error)
  webpack: (config, { dev, isServer }) => {
    // Disable cache in production builds for Cloudflare Pages
    if (!dev) {
      config.cache = false;
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
}

module.exports = nextConfig
