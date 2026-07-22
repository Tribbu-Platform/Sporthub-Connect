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

  // API proxy para redirigir /api/* al backend en ACA
  // Usamos API_UPSTREAM_URL (sin NEXT_PUBLIC_) porque Next.js inlinea
  // las variables NEXT_PUBLIC_* en build-time, y necesitamos leerla
  // en runtime (ACA la setea en el entorno del contenedor).
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_UPSTREAM_URL || 'http://localhost:5000'}/api/:path*`,
      },
    ];
  },

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
