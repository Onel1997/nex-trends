const BODY_LOCK_CLASS = 'dashboard-body-locked'

/** Lock body scroll while the mobile drawer is open (iOS-safe cleanup). */
export function setDashboardBodyScrollLocked(locked: boolean): void {
  if (typeof document === 'undefined') return

  if (locked) {
    document.body.classList.add(BODY_LOCK_CLASS)
    return
  }

  document.body.classList.remove(BODY_LOCK_CLASS)
  document.body.style.removeProperty('overflow')
  document.body.style.removeProperty('position')
  document.body.style.removeProperty('top')
  document.body.style.removeProperty('width')
}

export function clearDashboardBodyScrollLock(): void {
  setDashboardBodyScrollLocked(false)
}

export function setDashboardRouteActive(active: boolean): void {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dashboard-route-active', active)
}
