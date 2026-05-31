import { invokeEdgeFunction } from '@/lib/edgeFunctions'
import {
  formatAdminWarning,
  formatAdminWriteError,
  isAdminAuthError,
  isEdgeFunctionOfflineError,
  logAdminDebug,
  logAdminError,
  logAdminWarn,
} from '@/lib/admin-errors'
import {
  DEFAULT_ADMIN_SETTINGS,
  EMPTY_ADMIN_OVERVIEW,
  EMPTY_ADMIN_TREND_STATS,
} from '@/lib/admin-defaults'
import type { AdminAnalyticsDashboard, AnalyticsPeriod } from '@/types/analytics'
import type {
  AdminOverview,
  AdminSettings,
  AdminTrendStats,
  AdminUser,
} from '@/types/admin'
import { DEFAULT_FEATURE_FLAGS } from '@/types/admin'

type AdminApiBody = Record<string, unknown>

type AdminApiMeta = {
  _warnings?: string[]
}

export type AdminApiResult<T> = {
  data: T
  warnings: string[]
  /** Edge function unreachable or not deployed — UI can show offline banner */
  offline: boolean
}

function logAdmin(action: string, phase: 'request' | 'ok' | 'error', detail?: unknown) {
  const tag = `[AdminAPI] ${action}`
  if (phase === 'error') {
    logAdminError(tag, detail)
    return
  }
  if (phase === 'request') logAdminDebug(tag, detail)
  if (phase === 'ok') logAdminDebug(tag, detail)
}

function normalizeWarnings(payload: AdminApiMeta | null | undefined): string[] {
  const raw = payload?._warnings
  if (!Array.isArray(raw)) return []
  return raw.filter((w): w is string => typeof w === 'string' && w.length > 0)
}

function normalizeSettings(raw: Partial<AdminSettings> | null | undefined): AdminSettings {
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

function readFallback<T>(action: string, err: unknown, empty: T): AdminApiResult<T> {
  const offline = isEdgeFunctionOfflineError(err)
  const warning = formatAdminWarning(err)
  logAdminWarn(`${action} fallback (offline=${offline})`, warning)
  return {
    data: empty,
    warnings: [warning],
    offline,
  }
}

async function adminApiRaw<T>(
  action: string,
  body: AdminApiBody = {},
): Promise<AdminApiResult<T>> {
  logAdmin(action, 'request', body)

  try {
    const payload = await invokeEdgeFunction<T & AdminApiMeta>('admin-api', {
      action,
      ...body,
    })
    const warnings = normalizeWarnings(payload)
    if (warnings.length > 0) {
      logAdminWarn(`${action} server warnings`, warnings)
    }
    logAdmin(action, 'ok', { warnings, keys: Object.keys(payload ?? {}) })
    return { data: payload as T, warnings, offline: false }
  } catch (err) {
    logAdmin(action, 'error', err)
    throw err
  }
}

/** Read-only: never throws for offline/network — returns empty data + warnings. */
async function adminApiRead<T>(
  action: string,
  body: AdminApiBody,
  empty: T,
): Promise<AdminApiResult<T>> {
  try {
    return await adminApiRaw<T>(action, body)
  } catch (err) {
    if (isAdminAuthError(err)) throw err
    return readFallback(action, err, empty)
  }
}

export function fetchAdminOverview(
  period: AnalyticsPeriod = '7d',
): Promise<AdminApiResult<AdminOverview>> {
  return adminApiRead('overview', { period }, { ...EMPTY_ADMIN_OVERVIEW, period })
}

const EMPTY_ANALYTICS_DASHBOARD: AdminAnalyticsDashboard = {
  period: '7d',
  totalUsers: 0,
  proUsers: 0,
  totalGenerations: 0,
  creditsConsumed: 0,
  activeUsers: 0,
  revenuePlaceholder: '€ — Stripe Sync',
  topTools: [],
  topNiches: [],
  topPlatforms: [],
  dailySeries: [],
  recentGenerations: [],
  liveCounters: { last24h: 0, last7d: 0, last30d: 0 },
}

/** Full dashboard — falls back to overview if deployed admin-api lacks `analytics`. */
export async function fetchAdminAnalytics(
  period: AnalyticsPeriod = '7d',
): Promise<AdminApiResult<AdminAnalyticsDashboard>> {
  try {
    return await adminApiRaw<AdminAnalyticsDashboard>('analytics', { period })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (!msg.toLowerCase().includes('unbekannte action')) {
      return readFallback('analytics', err, { ...EMPTY_ANALYTICS_DASHBOARD, period })
    }
    logAdminWarn('analytics action missing — fallback to overview', msg)
  }

  const overview = await fetchAdminOverview(period)
  return {
    data: {
      ...EMPTY_ANALYTICS_DASHBOARD,
      period,
      totalUsers: overview.data.totalUsers ?? 0,
      proUsers: overview.data.proUsers ?? 0,
      totalGenerations: overview.data.totalGenerations ?? 0,
      creditsConsumed: overview.data.creditsConsumed ?? 0,
      activeUsers: overview.data.activeUsers ?? 0,
      revenuePlaceholder: overview.data.revenuePlaceholder,
      liveCounters: {
        last24h: overview.data.totalGenerations ?? 0,
        last7d: overview.data.totalGenerations ?? 0,
        last30d: overview.data.totalGenerations ?? 0,
      },
    },
    warnings: [
      ...overview.warnings,
      'Analytics-Dashboard-Action nicht deployed — bitte `supabase functions deploy admin-api` ausführen.',
    ],
    offline: overview.offline,
  }
}

export function fetchAdminUsers(search = ''): Promise<AdminApiResult<{ users: AdminUser[] }>> {
  return adminApiRead('list_users', { search }, { users: [] })
}

export function updateAdminUser(
  userId: string,
  patch: {
    credit_delta?: number
    set_credits?: number
    plan?: string
    /** @deprecated Prefer plan — kept for backward compatibility */
    is_pro?: boolean
    is_banned?: boolean
  },
): Promise<{ profile: AdminUser }> {
  return adminApiRaw<{ profile: AdminUser }>('update_user', { userId, ...patch })
    .then((r) => r.data)
    .catch((err) => {
      throw new Error(formatAdminWriteError(err))
    })
}

export function fetchAdminTrendStats(
  period: AnalyticsPeriod = '7d',
): Promise<AdminApiResult<AdminTrendStats>> {
  return adminApiRead('trend_stats', { period }, { ...EMPTY_ADMIN_TREND_STATS, period })
}

export function fetchAdminSettings(): Promise<AdminApiResult<{ settings: AdminSettings }>> {
  return adminApiRead<{ settings: AdminSettings }>(
    'get_settings',
    {},
    { settings: { ...DEFAULT_ADMIN_SETTINGS } },
  ).then((r) => ({
    ...r,
    data: {
      settings: normalizeSettings(r.data.settings),
    },
  }))
}

export function saveAdminSettings(
  patch: Partial<AdminSettings>,
): Promise<{ settings: AdminSettings }> {
  return adminApiRaw<{ settings: AdminSettings }>('update_settings', patch)
    .then((r) => ({ settings: normalizeSettings(r.data.settings) }))
    .catch((err) => {
      throw new Error(formatAdminWriteError(err))
    })
}

export function resetCreditsGlobally(amount?: number): Promise<{ ok: boolean; amount: number }> {
  return adminApiRaw<{ ok: boolean; amount: number }>('reset_credits_global', { amount })
    .then((r) => r.data)
    .catch((err) => {
      throw new Error(formatAdminWriteError(err))
    })
}

/** Lightweight health check for global offline banner. */
export async function probeAdminApi(): Promise<{ ok: boolean; offline: boolean; message?: string }> {
  logAdminDebug('probe', 'start')
  try {
    try {
      const health = await adminApiRaw<{ ok: boolean }>('health', {})
      if (health.data?.ok) {
        return { ok: true, offline: false }
      }
    } catch (healthErr) {
      logAdminDebug('probe health skipped', healthErr)
    }
    const result = await fetchAdminOverview()
    if (result.offline) {
      return { ok: false, offline: true, message: result.warnings[0] }
    }
    return { ok: true, offline: false }
  } catch (err) {
    if (isAdminAuthError(err)) {
      return { ok: false, offline: false, message: formatAdminWarning(err) }
    }
    return { ok: false, offline: true, message: formatAdminWarning(err) }
  }
}
