/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove all webpack customizations temporarily
  reactStrictMode: true,
  swcMinify: true,
  
  // Keep essential config only
  images: {
    domains: [
      'localhost',
      'porverse.ro',
      'images.unsplash.com',
      'cdn.supabase.com'
    ]
  },

  // Basic security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          }
        ]
      }
    ]
  },

  typescript: {
    ignoreBuildErrors: false
  },
  
  eslint: {
    ignoreDuringBuilds: false
  }
}

module.exports = nextConfig