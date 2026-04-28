import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Standalone output required for Cloud Run Docker deployment
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  // Required for pdf-parse (native binary)
  serverExternalPackages: ['pdf-parse'],
}

export default nextConfig
