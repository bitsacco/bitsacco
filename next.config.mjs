/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['*.ngrok-free.app'],
  output: 'standalone',
  turbopack: {
    root: import.meta.dirname,
  },
  async redirects() {
    return [
      {
        source: '/whitepaper',
        destination: '/learn-bitcoin',
        permanent: true,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
