import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {}, // <-- an empty object to enable server actions
  },
  images: {
    domains: [
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
      'cdn.jsdelivr.net',
      'images.unsplash.com',
      'api.dicebear.com',
      'mfnkvkicoammwclxhqru.supabase.co',
    ],
  },
}

export default nextConfig
