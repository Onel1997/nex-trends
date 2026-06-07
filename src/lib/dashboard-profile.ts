import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { extractUserProfileFields, getUserAvatarUrl, getUserDisplayName } from '@/lib/auth/profile'

export type DashboardProfileFields = {
  email: string | null
  fullName: string | null
  avatarUrl: string | null
}

const PROFILE_DISPLAY_SELECT = 'email, full_name, avatar_url'

export async function fetchDashboardProfileFields(
  userId: string,
): Promise<DashboardProfileFields | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_DISPLAY_SELECT)
    .eq('id', userId)
    .maybeSingle()

  if (error || !data) {
    if (error) console.error('[dashboard] profile fields failed:', error.message)
    return null
  }

  return {
    email: (data.email as string | null) ?? null,
    fullName: (data.full_name as string | null) ?? null,
    avatarUrl: (data.avatar_url as string | null) ?? null,
  }
}

export function resolveDashboardUserDisplay(
  user: User,
  profileFields: DashboardProfileFields | null,
): { name: string; email: string; avatarUrl: string | null } {
  const authFields = extractUserProfileFields(user)
  const name =
    profileFields?.fullName?.trim() ||
    authFields.full_name?.trim() ||
    getUserDisplayName(user)
  const email = profileFields?.email ?? authFields.email ?? 'Unbekannt'
  const avatarUrl =
    profileFields?.avatarUrl ?? authFields.avatar_url ?? getUserAvatarUrl(user)

  return { name, email, avatarUrl }
}
