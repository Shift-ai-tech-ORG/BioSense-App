import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  // Required for pdf-parse
  serverExternalPackages: ['pdf-parse'],
}

export default nextConfig
