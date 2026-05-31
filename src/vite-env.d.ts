/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  /** Canonical production URL — e.g. https://nextrends-ai.de (OAuth + Supabase redirect allow-list) */
  readonly VITE_SITE_URL?: string
  /** Alias for VITE_SITE_URL (Vercel / Next-style naming) */
  readonly NEXT_PUBLIC_SITE_URL?: string
  /** Set to "true" for [AdminAPI] console debug logs in production */
  readonly VITE_ADMIN_DEBUG?: string
  readonly VITE_OPENAI_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
