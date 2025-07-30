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
      'rngqbthiezvwlebrcoxj.supabase.co', // Adăugat pentru Supabase
    ],
    formats: ['image/webp', 'image/avif'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https: blob:",
              "media-src 'self' https:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "frame-src 'self'",
              // IMPORTANT: Allow connections to Supabase and APIs
              "connect-src 'self' https://*.supabase.co https://*.supabase.io wss://*.supabase.co https://api.openai.com https://api.stripe.com https://api.paypal.com https://fonts.googleapis.com https://fonts.gstatic.com"
            ].join('; ')
          },
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