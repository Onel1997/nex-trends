export const ADMIN_PATH = '/admin'

export function isAdminPath(pathname = window.location.pathname): boolean {
  const normalized = pathname.replace(/\/$/, '') || '/'
  return normalized === ADMIN_PATH || normalized.startsWith(`${ADMIN_PATH}/`)
}

function notifyRouteChange(): void {
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function navigateToAdmin(options?: { replace?: boolean }): void {
  const href = ADMIN_PATH
  if (options?.replace) {
    window.history.replaceState({ admin: true }, '', href)
  } else {
    window.history.pushState({ admin: true }, '', href)
  }
  notifyRouteChange()
}

export function navigateFromAdminToDashboard(): void {
  window.history.replaceState({ tool: 'dashboard' }, '', '/dashboard')
  notifyRouteChange()
}
