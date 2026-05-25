import {
  DEFAULT_FEATURE_FLAGS,
  type AdminOverview,
  type AdminSettings,
  type AdminTrendStats,
  type AdminUser,
} from '@/types/admin'

export const EMPTY_ADMIN_OVERVIEW: AdminOverview = {
  totalUsers: 0,
  activeUsers: 0,
  totalGenerations: 0,
  proUsers: 0,
  revenuePlaceholder: '€ — Stripe Sync',
}

export const EMPTY_ADMIN_TREND_STATS: AdminTrendStats = {
  topNiches: [],
  topPlatforms: [],
  recentGenerations: [],
}

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  maintenance_mode: false,
  announcement: '',
  feature_flags: DEFAULT_FEATURE_FLAGS,
  updated_at: null,
}

/** Stable empty reference for user list loads */
export const EMPTY_ADMIN_USERS = { users: [] as AdminUser[] }

export const EMPTY_ADMIN_SETTINGS_PAYLOAD = {
  settings: DEFAULT_ADMIN_SETTINGS,
}

export function normalizeAdminSettings(raw: Partial<AdminSettings> | null | undefined): AdminSettings {
  return {
    maintenance_mode: Boolean(raw?.maintenance_mode),
    announcement: String(raw?.announcement ?? ''),
    feature_flags: {
      ...DEFAULT_FEATURE_FLAGS,
      ...(raw?.feature_flags ?? {}),
    },
    updated_at: raw?.updated_at ?? null,
  }
}

export function adminSettingsEqual(a: AdminSettings, b: AdminSettings): boolean {
  return (
    a.maintenance_mode === b.maintenance_mode &&
    a.announcement === b.announcement &&
    a.updated_at === b.updated_at &&
    JSON.stringify(a.feature_flags) === JSON.stringify(b.feature_flags)
  )
}

export function warningsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  return a.every((w, i) => w === b[i])
}
