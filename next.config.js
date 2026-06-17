const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Stable Turbopack root (absolute) — avoids resolution quirks when the folder path contains spaces (e.g. "Pre Delivery App")
  experimental: {
    turbo: {
      root: path.resolve(__dirname),
    },
    serverComponentsExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
  },
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', pathname: '/**' },
      { protocol: 'https', hostname: 'localhost', pathname: '/**' },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
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
  async headers() {
    const securityHeaders = [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=(self)' },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com",
          "style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com",
          "img-src 'self' data: blob: https: http:",
          "font-src 'self' data:",
          "connect-src 'self' https: wss:",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join('; '),
      },
    ];
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  // Do not override devtool in dev — Next.js reverts it and warns (improper-devtool).
  // Prefer `npm run dev` (Turbopack). If you use `npm run dev:webpack`, server splitChunks are disabled in dev
  // to avoid stale chunk IDs (Cannot find module './NNNN.js') on Windows — see scripts/clean-dev-cache.js.
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.cache = false;
      if (isServer) {
        config.optimization = {
          ...config.optimization,
          splitChunks: false,
        };
      }
    }
    return config;
  },
}

module.exports = nextConfig;


