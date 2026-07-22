/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: false,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Experimental features (Next.js 16)
  experimental: {
    // ppr: 'incremental',
    // after: true,
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // NOTA: El proxy /api/* se maneja via Next.js API Route handler
  // en src/app/api/[[...path]]/route.ts que lee API_UPSTREAM_URL en runtime.
  // No usamos rewrites() porque process.env se resuelve en build-time.

  // Security headers
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
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
