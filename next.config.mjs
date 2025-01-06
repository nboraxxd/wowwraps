/** @type {import('next').NextConfig} */
const nextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wowwraps.io.vn',
        pathname: '/static/**',
      },
    ],
  },
}

export default nextConfig
