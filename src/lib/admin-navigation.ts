import { getBrowserPathname } from '@/lib/runtime'

export const ADMIN_PATH = '/admin'

const DASHBOARD_PATH = '/dashboard'

export function isAdminPath(pathname?: string): boolean {
  const normalized = (pathname ?? getBrowserPathname()).replace(/\/$/, '') || '/'
  return normalized === ADMIN_PATH || normalized.startsWith(`${ADMIN_PATH}/`)
}

/** Navigate to the admin control center via Next.js route `/admin`. */
export function navigateToAdmin(options?: { replace?: boolean }): void {
  if (typeof window === 'undefined') return

  if (options?.replace) {
    window.location.replace(ADMIN_PATH)
    return
  }

  window.location.assign(ADMIN_PATH)
}

/** Leave admin and open the creator dashboard at `/dashboard`. */
export function navigateFromAdminToDashboard(options?: { replace?: boolean }): void {
  if (typeof window === 'undefined') return

  if (options?.replace) {
    window.location.replace(DASHBOARD_PATH)
    return
  }

  window.location.assign(DASHBOARD_PATH)
}
