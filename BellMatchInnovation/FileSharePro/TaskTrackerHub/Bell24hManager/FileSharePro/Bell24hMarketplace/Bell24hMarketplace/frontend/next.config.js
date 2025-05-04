/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
      {
        source: '/ws',
        destination: 'http://localhost:5000/ws',
      },
      {
        source: '/websocket-demo',
        destination: '/websocket-demo.html',
      }
    ]
  }
};

module.exports = nextConfig;
