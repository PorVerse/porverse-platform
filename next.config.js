/** @type {import('next').NextConfig} */
const nextConfig = {
  // Nu mai e nevoie de appDir: true în Next.js 14 - e default
  experimental: {
    // Poți adăuga alte features experimentale aici dacă e nevoie
  },
  images: {
    domains: [
      'images.unsplash.com',
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
      'x8ki-letl-twmt.n7.xano.io', // Pentru avataruri Xano
    ],
    formats: ['image/webp', 'image/avif'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/auth/login',
        permanent: true,
      },
      {
        source: '/signup',
        destination: '/auth/signup',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/auth/signup',
        permanent: true,
      },
    ]
  },
  env: {
    // Fix pentru warning - adaugă fallback
    CUSTOM_KEY: process.env.CUSTOM_KEY || 'porverse-default-key',
  },
}

module.exports = nextConfig