const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Stable Turbopack root (absolute) — avoids resolution quirks when the folder path contains spaces (e.g. "Pre Delivery App")
  experimental: {
    turbo: {
      root: path.resolve(__dirname),
    },
  },
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
  // Note: compiler.removeConsole is not supported with `next dev --turbo` (Next.js 14).
  // Production `next build` still strips dead code via SWC minify; avoid removeConsole here so Turbopack dev works.
  // Compression
  compress: true,
  // Optimize production builds
  productionBrowserSourceMaps: false,
  // Avoid eval-based source maps in dev (can cause "Invalid or unexpected token" on Windows when path has spaces/backslashes)
  webpack: (config, { dev }) => {
    if (dev && typeof config.devtool === 'string' && config.devtool.includes('eval')) {
      config.devtool = 'cheap-module-source-map';
    }
    // Windows + paths with spaces: persistent pack cache often leaves .next/server out of sync → 404 on /_next/static and "__webpack_modules__ is not a function"
    if (dev) {
      config.cache = false;
    }
    return config;
  },
}

module.exports = nextConfig;


