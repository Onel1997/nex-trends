import { getBrowserHref, getBrowserPathname, getBrowserSearch, isBrowser } from './runtime'
import {
  DASHBOARD_BASE,
  getPathForTool,
  isValidToolId,
  pathToToolId,
  STANDALONE_DASHBOARD_PATHS,
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
  const current = new URL(getBrowserHref())
  const checkout = current.searchParams.get('checkout')
  if (checkout) url.searchParams.set('checkout', checkout)
  return `${url.pathname}${url.search}`
}

/** True when pathname is served by a dashboard Next.js route. */
export function isDashboardAppPath(pathname?: string): boolean {
  const normalized = (pathname ?? getBrowserPathname()).replace(/\/$/, '') || '/'
  if (normalized === DASHBOARD_BASE || normalized.startsWith(`${DASHBOARD_BASE}/`)) {
    return true
  }
  if (STANDALONE_DASHBOARD_PATHS.some((path) => normalized === path)) {
    return true
  }
  if (normalized === '/billing/success' || normalized === '/billing/cancel') {
    return true
  }
  return false
}

export function isDashboardShellMounted(): boolean {
  if (!isBrowser()) return false
  return document.querySelector('.dashboard-shell') != null
}

/** Use a full navigation when leaving marketing/auth shells or the dashboard shell is not mounted. */
export function shouldHardNavigateToTool(tool: DashboardRouteId): boolean {
  if (!isBrowser()) return false

  const current = getBrowserPathname().replace(/\/$/, '') || '/'
  if (current === '/' || current === '/login') return true

  if (!isDashboardShellMounted() && pathToToolId(getPathForTool(tool))) {
    return true
  }

  return false
}

export function readToolFromUrl(): DashboardRouteId {
  if (!isBrowser()) return 'dashboard'

  const fromPath = pathToToolId(getBrowserPathname())
  if (fromPath) return fromPath

  const tool = new URLSearchParams(getBrowserSearch()).get('tool')
  if (tool && isValidToolId(tool)) return tool
  if (tool && LEGACY_QUERY_MAP[tool]) return LEGACY_QUERY_MAP[tool]

  return 'dashboard'
}

export const DASHBOARD_NAVIGATE_EVENT = 'dashboard:navigate'

export const DASHBOARD_ROUTE_PUSH_EVENT = 'dashboard:route-push'

type DashboardRoutePushDetail = {
  href: string
  replace?: boolean
}

function notifyDashboardNavigate(tool: DashboardRouteId) {
  if (!isBrowser()) return
  window.dispatchEvent(
    new CustomEvent(DASHBOARD_NAVIGATE_EVENT, { detail: { tool } }),
  )
}

function requestDashboardRoutePush(href: string, options?: { replace?: boolean }) {
  if (!isBrowser()) return
  window.dispatchEvent(
    new CustomEvent<DashboardRoutePushDetail>(DASHBOARD_ROUTE_PUSH_EVENT, {
      detail: { href, replace: options?.replace },
    }),
  )
}

export function navigateToTool(
  tool: DashboardRouteId,
  options?: { replace?: boolean; hard?: boolean },
): void {
  if (!isBrowser()) return

  const href = buildUrl(tool)

  if (options?.hard || shouldHardNavigateToTool(tool)) {
    if (options?.replace) window.location.replace(href)
    else window.location.assign(href)
    notifyDashboardNavigate(tool)
    return
  }

  if (isDashboardShellMounted()) {
    requestDashboardRoutePush(href, { replace: options?.replace })
    notifyDashboardNavigate(tool)
    return
  }

  if (options?.replace) window.location.replace(href)
  else window.location.assign(href)
  notifyDashboardNavigate(tool)
}

/** Navigate to dashboard home — prefers hard navigation from marketing pages. */
export function navigateToDashboard(options?: { replace?: boolean }) {
  navigateToTool('dashboard', options)
}

/** @deprecated Use navigateToTool */
export function writeToolToUrl(tool: DashboardRouteId) {
  navigateToTool(tool, { replace: true })
}

export function clearCheckoutParams() {
  if (!isBrowser()) return

  const url = new URL(getBrowserHref())
  url.searchParams.delete('checkout')
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
}

export function readCheckoutParam(): 'success' | 'cancel' | null {
  if (!isBrowser()) return null

  const value = new URLSearchParams(getBrowserSearch()).get('checkout')
  if (value === 'success' || value === 'cancel') return value
  return null
}

export function navigateToHome() {
  if (!isBrowser()) return

  navigateToDashboard()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export function navigateToLanding() {
  if (!isBrowser()) return
  window.location.href = '/'
}

/** Redirect legacy ?tool= URLs to path-based routes */
export function syncLegacyToolQueryToPath(): void {
  if (!isBrowser()) return

  const params = new URLSearchParams(getBrowserSearch())
  const tool = params.get('tool')
  if (!tool) return

  const mapped = isValidToolId(tool)
    ? tool
    : LEGACY_QUERY_MAP[tool]
  if (!mapped) return

  const path = getPathForTool(mapped)
  if (getBrowserPathname() === path) {
    params.delete('tool')
    const search = params.toString() ? `?${params}` : ''
    if (isDashboardShellMounted()) {
      requestDashboardRoutePush(`${path}${search}`, { replace: true })
    } else {
      window.location.replace(`${path}${search}`)
    }
    notifyDashboardNavigate(mapped)
    return
  }

  navigateToTool(mapped, { replace: true })
}

/** Redirect `/` to dashboard — temporarily disabled for production-safe landing. */
export function ensureDashboardPath(): void {
  // no-op
}
