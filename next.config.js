/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'res.cloudinary.com', 'images.unsplash.com'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co', pathname: '/storage/v1/object/public/**' },
      { protocol: 'https', hostname: '**.supabase.in', pathname: '/storage/v1/object/public/**' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  // Performance optimizations
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Compression
  compress: true,
  // Optimize production builds
  productionBrowserSourceMaps: false,
  // Avoid eval-based source maps in dev (can cause "Invalid or unexpected token" on Windows when path has spaces/backslashes)
  webpack: (config, { dev }) => {
    if (dev && typeof config.devtool === 'string' && config.devtool.includes('eval')) {
      config.devtool = 'cheap-module-source-map';
    }
    return config;
  },
}

module.exports = nextConfig;


