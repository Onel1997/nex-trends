import type { NextConfig } from 'next'
import path from 'node:path'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    resolveAlias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, './src')
    return config
  },
  env: {
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    VITE_SITE_URL: process.env.VITE_SITE_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY,
  },
}

export default nextConfig
