import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { readEnv } from '@/lib/env'

export function createSupabaseBrowserClient(): SupabaseClient | null {
  const url = readEnv('NEXT_PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL')
  const anonKey = readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY')

  if (!url || !anonKey) {
    if (typeof window !== 'undefined') {
      console.error(
        '[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.',
      )
    }
    return null
  }

  return createBrowserClient(url, anonKey)
}
