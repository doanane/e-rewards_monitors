/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  eslint:{
    ignoreDuringBuilds: true,
  },

  images: {
    domains: ['example.com'], // Add your image domains here
  }
}

module.exports = nextConfig
