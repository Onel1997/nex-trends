import { isAdminPath } from './admin-navigation'
import { isAuthCallbackPath } from './auth'
import { getBrowserPathname, isBrowser } from './runtime'
import {
  DASHBOARD_BASE,
  getPathForTool,
  isValidToolId,
  pathToToolId,
  type DashboardRouteId,
} from './routes'

export type { DashboardRouteId as DashboardToolId }

const LEGACY_QUERY_MAP: Record<string, DashboardRouteId> = {
  trends: 'dashboard',
  'ad-copy': 'ad-copy',
  hook: 'hook',
  seo: 'seo',
  analyzer: 'analyzer',
  'trend-intelligence': 'trend-intelligence',
  'saved-trends': 'saved-trends',
  'ai-studio': 'ai-studio',
  'my-videos': 'my-videos',
  settings: 'settings',
}

function buildUrl(tool: DashboardRouteId): string {
  if (!isBrowser()) return getPathForTool(tool)
  const url = new URL(window.location.origin + getPathForTool(tool))
  const current = new URL(window.location.href)
  const checkout = current.searchParams.get('checkout')
  if (checkout) url.searchParams.set('checkout', checkout)
  return `${url.pathname}${url.search}`
}

export function readToolFromUrl(): DashboardRouteId {
  if (!isBrowser()) return 'dashboard'

  const fromPath = pathToToolId(window.location.pathname)
  if (fromPath) return fromPath

  const tool = new URLSearchParams(window.location.search).get('tool')
  if (tool && isValidToolId(tool)) return tool
  if (tool && LEGACY_QUERY_MAP[tool]) return LEGACY_QUERY_MAP[tool]

  return 'dashboard'
}

export const DASHBOARD_NAVIGATE_EVENT = 'dashboard:navigate'

function notifyDashboardNavigate(tool: DashboardRouteId) {
  window.dispatchEvent(
    new CustomEvent(DASHBOARD_NAVIGATE_EVENT, { detail: { tool } }),
  )
}

export function navigateToTool(
  tool: DashboardRouteId,
  options?: { replace?: boolean },
): void {
  const href = buildUrl(tool)
  if (options?.replace) {
    window.history.replaceState({ tool }, '', href)
  } else {
    window.history.pushState({ tool }, '', href)
  }
  notifyDashboardNavigate(tool)
}

/** @deprecated Use navigateToTool */
export function writeToolToUrl(tool: DashboardRouteId) {
  navigateToTool(tool, { replace: true })
}

export function clearCheckoutParams() {
  const url = new URL(window.location.href)
  url.searchParams.delete('checkout')
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
}

export function readCheckoutParam(): 'success' | 'cancel' | null {
  const value = new URLSearchParams(window.location.search).get('checkout')
  if (value === 'success' || value === 'cancel') return value
  return null
}

export function navigateToHome() {
  navigateToTool('dashboard')
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export function navigateToLanding() {
  window.location.href = '/'
}

/** Redirect legacy ?tool= URLs to path-based routes */
export function syncLegacyToolQueryToPath(): void {
  const params = new URLSearchParams(window.location.search)
  const tool = params.get('tool')
  if (!tool) return

  const mapped = isValidToolId(tool)
    ? tool
    : LEGACY_QUERY_MAP[tool]
  if (!mapped) return

  const path = getPathForTool(mapped)
  if (window.location.pathname === path) {
    params.delete('tool')
    const search = params.toString() ? `?${params}` : ''
    window.history.replaceState({ tool: mapped }, '', `${path}${search}`)
    return
  }

  navigateToTool(mapped, { replace: true })
}

/** Ensure authenticated users on `/` land on dashboard */
export function ensureDashboardPath(): void {
  if (!isBrowser()) return
  if (isAdminPath() || isAuthCallbackPath()) return
  const path = getBrowserPathname().replace(/\/$/, '') || '/'
  if (path === '/') {
    navigateToTool('dashboard', { replace: true })
  } else if (
    (path.startsWith(DASHBOARD_BASE) ||
      path === '/my-videos' ||
      path === '/ai-studio') &&
    !pathToToolId(path)
  ) {
    navigateToTool('dashboard', { replace: true })
  }
}
