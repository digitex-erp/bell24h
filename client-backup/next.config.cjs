/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  appDir: true, // Assuming your project uses the App Router
  useFileSystemPublicRoutes: false, // Keep this as we decided to focus on App Router
  // All other configurations (images, compress, transpilePackages, webpack, etc.)
  // and withBundleAnalyzer will be temporarily removed.
  // We'll also let Next.js handle typescript and eslint with defaults for now.
};

module.exports = nextConfig;
