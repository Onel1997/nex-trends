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

export function fetchAdminOverview(): Promise<AdminApiResult<AdminOverview>> {
  return adminApiRead('overview', {}, { ...EMPTY_ADMIN_OVERVIEW })
}

export function fetchAdminUsers(search = ''): Promise<AdminApiResult<{ users: AdminUser[] }>> {
  return adminApiRead('list_users', { search }, { users: [] })
}

export function updateAdminUser(
  userId: string,
  patch: {
    credit_delta?: number
    set_credits?: number
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

export function fetchAdminTrendStats(): Promise<AdminApiResult<AdminTrendStats>> {
  return adminApiRead('trend_stats', {}, { ...EMPTY_ADMIN_TREND_STATS })
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
