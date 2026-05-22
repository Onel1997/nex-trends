import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

function requireEnv(value: string | undefined, name: string): string {
  if (!value?.trim()) {
    throw new Error(
      `Missing environment variable: ${name}. Add it to your .env file.`,
    )
  }
  return value
}

export const supabase = createClient(
  requireEnv(supabaseUrl, 'VITE_SUPABASE_URL'),
  requireEnv(supabaseAnonKey, 'VITE_SUPABASE_ANON_KEY'),
)
