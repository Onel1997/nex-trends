import { getBrowserPathname } from '@/lib/runtime'

export const ADMIN_PATH = '/admin'

export function isAdminPath(pathname?: string): boolean {
  const normalized = (pathname ?? getBrowserPathname()).replace(/\/$/, '') || '/'
  return normalized === ADMIN_PATH || normalized.startsWith(`${ADMIN_PATH}/`)
}

function notifyRouteChange(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function navigateToAdmin(options?: { replace?: boolean }): void {
  if (typeof window === 'undefined') return
  const href = ADMIN_PATH
  if (options?.replace) {
    window.history.replaceState({ admin: true }, '', href)
  } else {
    window.history.pushState({ admin: true }, '', href)
  }
  notifyRouteChange()
}

export function navigateFromAdminToDashboard(): void {
  if (typeof window === 'undefined') return
  window.history.replaceState({ tool: 'dashboard' }, '', '/dashboard')
  notifyRouteChange()
}
