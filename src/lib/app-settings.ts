import { supabase } from '@/lib/supabase'
import {
  DEFAULT_FEATURE_FLAGS,
  type AdminFeatureFlags,
  type AdminSettings,
} from '@/types/admin'

const DEFAULT_SETTINGS: AdminSettings = {
  maintenance_mode: false,
  announcement: '',
  feature_flags: DEFAULT_FEATURE_FLAGS,
  updated_at: null,
}

export async function fetchPublicAppSettings(): Promise<AdminSettings> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('maintenance_mode, announcement, feature_flags, updated_at')
    .eq('id', 1)
    .maybeSingle()

  if (error || !data) return DEFAULT_SETTINGS

  return {
    maintenance_mode: Boolean(data.maintenance_mode),
    announcement: String(data.announcement ?? ''),
    feature_flags: {
      ...DEFAULT_FEATURE_FLAGS,
      ...(data.feature_flags as Partial<AdminFeatureFlags> | null),
    },
    updated_at: data.updated_at ?? null,
  }
}

export function isFeatureEnabled(
  flags: Partial<AdminFeatureFlags>,
  key: keyof AdminFeatureFlags,
): boolean {
  return flags[key] !== false
}
