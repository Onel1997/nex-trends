import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type UserMetadata = {
  full_name?: string
  name?: string
  avatar_url?: string
  picture?: string
}

export type SyncedUserProfile = {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  created_at: string | null
}

export function extractUserProfileFields(user: User): SyncedUserProfile {
  const meta = (user.user_metadata ?? {}) as UserMetadata
  const fullName = meta.full_name ?? meta.name ?? null
  const avatarUrl = meta.avatar_url ?? meta.picture ?? null

  return {
    id: user.id,
    email: user.email ?? null,
    full_name: fullName,
    avatar_url: avatarUrl,
    created_at: user.created_at ?? null,
  }
}

/** Upsert public.profiles from Supabase Auth user (id, email, avatar, created_at). */
export async function syncUserProfile(user: User): Promise<void> {
  const fields = extractUserProfileFields(user)

  const { error } = await supabase.from('profiles').upsert(
    {
      id: fields.id,
      email: fields.email,
      full_name: fields.full_name,
      avatar_url: fields.avatar_url,
      created_at: fields.created_at,
    },
    { onConflict: 'id' },
  )

  if (error) {
    console.error('[auth] Profile sync failed:', error.message)
  }
}

export function getUserDisplayName(user: User): string {
  const fields = extractUserProfileFields(user)
  if (fields.full_name?.trim()) return fields.full_name.trim()
  if (fields.email) return fields.email.split('@')[0] ?? 'User'
  return 'User'
}

export function getUserAvatarUrl(user: User): string | null {
  return extractUserProfileFields(user).avatar_url
}
