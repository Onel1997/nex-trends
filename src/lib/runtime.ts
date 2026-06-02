/** True when running in a browser (not Node/Edge SSR). */
export function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

/** Current pathname — returns "/" during SSR. */
export function getBrowserPathname(): string {
  if (!isBrowser()) return '/'
  return window.location.pathname
}

/** Current search string — returns "" during SSR. */
export function getBrowserSearch(): string {
  if (!isBrowser()) return ''
  return window.location.search
}

/** Full page URL — returns "" during SSR. */
export function getBrowserHref(): string {
  if (!isBrowser()) return ''
  return window.location.href
}

/** True in local development (Next.js or Vite). */
export function isDevEnvironment(): boolean {
  try {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      return true
    }
  } catch {
    /* ignore */
  }

  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      return true
    }
  } catch {
    /* ignore */
  }

  return false
}

/** Safe import.meta.env read for legacy call sites. */
export function readViteEnvFlag(key: string): string | undefined {
  try {
    if (typeof import.meta === 'undefined') return undefined
    const value = import.meta.env?.[key as keyof ImportMetaEnv]
    return typeof value === 'string' ? value : undefined
  } catch {
    return undefined
  }
}

/** True when import.meta.env.DEV or VITE debug flags are set. */
export function isDebugLoggingEnabled(): boolean {
  if (isDevEnvironment()) return true
  return (
    readViteEnvFlag('VITE_ADMIN_DEBUG') === 'true' ||
    readViteEnvFlag('VITE_VIDEO_DEBUG') === 'true'
  )
}

/** Video pipeline verbose logging. */
export function isVideoDebugEnabled(): boolean {
  return isDebugLoggingEnabled()
}
