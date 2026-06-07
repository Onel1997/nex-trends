import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { isSupabaseConfigured } from '@/lib/supabase'

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

function isRlsPolicyError(message: string): boolean {
  const lower = message.toLowerCase()
  return lower.includes('row-level security') || lower.includes('rls')
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

/**
 * Best-effort profile sync for display fields only.
 * Never throws — DB trigger `sync_profile_from_auth_user` is the primary source of truth.
 */
export async function syncUserProfile(user: User): Promise<boolean> {
  if (!isSupabaseConfigured()) return false

  const fields = extractUserProfileFields(user)
  const row = {
    id: fields.id,
    email: fields.email,
    full_name: fields.full_name,
    avatar_url: fields.avatar_url,
    created_at: fields.created_at,
  }

  try {
    const { data: existing, error: readError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', fields.id)
      .maybeSingle()

    if (readError && !isRlsPolicyError(readError.message)) {
      console.warn('[auth] Profile read before sync:', readError.message)
    }

    if (existing?.id) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          email: row.email,
          full_name: row.full_name,
          avatar_url: row.avatar_url,
        })
        .eq('id', fields.id)

      if (updateError) {
        if (isRlsPolicyError(updateError.message)) {
          console.warn(
            '[auth] Profile update blocked by RLS — run migration profiles_rls_policies or rely on auth trigger.',
          )
        } else {
          console.warn('[auth] Profile update failed:', updateError.message)
        }
        return false
      }
      return true
    }

    const { error: insertError } = await supabase.from('profiles').insert(row)

    if (insertError) {
      if (insertError.code === '23505') {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            email: row.email,
            full_name: row.full_name,
            avatar_url: row.avatar_url,
          })
          .eq('id', fields.id)
        if (!updateError) return true
        if (!isRlsPolicyError(updateError.message)) {
          console.warn('[auth] Profile update after conflict failed:', updateError.message)
        }
        return false
      }
      if (isRlsPolicyError(insertError.message)) {
        console.warn(
          '[auth] Profile insert blocked by RLS — auth trigger should create the row on next sign-in.',
        )
      } else {
        console.warn('[auth] Profile insert failed:', insertError.message)
      }
      return false
    }

    return true
  } catch (err) {
    console.warn('[auth] Profile sync error:', err)
    return false
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
