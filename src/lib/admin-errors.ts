import { isDebugLoggingEnabled, readViteEnvFlag } from '@/lib/runtime'

/** Human-readable deploy hint shown when admin-api is not deployed. */
export const ADMIN_API_FUNCTION_NAME = 'admin-api'

export const ADMIN_API_DEPLOY_COMMANDS = [
  'supabase login',
  'supabase link --project-ref <YOUR_PROJECT_REF>',
  'supabase db push',
  `supabase functions deploy ${ADMIN_API_FUNCTION_NAME}`,
  'supabase functions list',
] as const

export const ADMIN_API_DEPLOY_DOC = 'docs/ADMIN_API_DEPLOY.md'

export function getEdgeFunctionOfflineMessage(functionName = ADMIN_API_FUNCTION_NAME): string {
  return (
    `Die Edge Function „${functionName}“ ist nicht deployed oder nicht erreichbar. ` +
    `Deploy: supabase functions deploy ${functionName} — Details: ${ADMIN_API_DEPLOY_DOC}`
  )
}

export function isAdminAuthError(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  const msg = err.message.toLowerCase()
  return (
    msg.includes('nicht authentifiziert') ||
    msg.includes('sitzung abgelaufen') ||
    msg.includes('admin-berechtigung') ||
    msg.includes('keine admin') ||
    msg.includes('http 401') ||
    msg.includes('http 403') ||
    msg.includes('supabase ist nicht konfiguriert')
  )
}

/** True when admin-api is missing, unreachable, or returns 404/5xx network errors. */
export function isEdgeFunctionOfflineError(err: unknown): boolean {
  if (!(err instanceof Error)) return true
  const msg = err.message.toLowerCase()
  return (
    msg.includes('load failed') ||
    msg.includes('failed to fetch') ||
    msg.includes('failed to send') ||
    msg.includes('nicht erreichbar') ||
    msg.includes('nicht gefunden') ||
    msg.includes('http 404') ||
    msg.includes('http 502') ||
    msg.includes('http 503') ||
    msg.includes('edge function') ||
    msg.includes('functions deploy') ||
    msg.includes('deployment prüfen')
  )
}

export function formatAdminWarning(err: unknown): string {
  if (isEdgeFunctionOfflineError(err)) {
    return getEdgeFunctionOfflineMessage()
  }
  if (err instanceof Error) return err.message
  return String(err)
}

export function formatAdminWriteError(err: unknown): string {
  if (isAdminAuthError(err)) {
    return err instanceof Error ? err.message : 'Keine Berechtigung.'
  }
  if (isEdgeFunctionOfflineError(err)) {
    return (
      `${getEdgeFunctionOfflineMessage()} ` +
      'Schreiboperationen (Credits, Ban, Settings) sind offline nicht möglich.'
    )
  }
  return err instanceof Error ? err.message : 'Aktion fehlgeschlagen.'
}

export function isAdminDebugEnabled(): boolean {
  return isDebugLoggingEnabled() || readViteEnvFlag('VITE_ADMIN_DEBUG') === 'true'
}

export function logAdminDebug(scope: string, detail?: unknown): void {
  if (!isAdminDebugEnabled()) return
  console.debug(`[Admin] ${scope}`, detail ?? '')
}

export function logAdminWarn(scope: string, detail?: unknown): void {
  console.warn(`[Admin] ${scope}`, detail ?? '')
}

export function logAdminError(scope: string, detail?: unknown): void {
  console.error(`[Admin] ${scope}`, detail ?? '')
}
