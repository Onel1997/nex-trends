import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { logSupabaseEnvStatus, readEnv } from '@/lib/env'

export function createSupabaseBrowserClient(): SupabaseClient | null {
  const url = readEnv('NEXT_PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL')
  const anonKey = readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY')

  if (!url || !anonKey) {
    logSupabaseEnvStatus('supabase/client')
    return null
  }

  return createBrowserClient(url, anonKey)
}
