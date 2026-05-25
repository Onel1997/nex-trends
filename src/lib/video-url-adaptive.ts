import { isLocalDemoVideo } from '@/lib/video-url'

/** Set true after running `npm run compress:demo-videos` (creates *-mobile.mp4). */
export const HAS_MOBILE_DEMO_VARIANTS = false

const MOBILE_MAX_WIDTH = 768

function mobileVariantPath(url: string): string {
  return url.replace(/\.mp4(\?.*)?$/i, '-mobile.mp4')
}

export function preferMobileDemoVideo(): boolean {
  if (typeof window === 'undefined') return false
  if (!HAS_MOBILE_DEMO_VARIANTS) return false
  return window.innerWidth < MOBILE_MAX_WIDTH
}

/** Prefer lighter local demo MP4 on narrow viewports when mobile variants exist. */
export function resolveAdaptiveVideoUrl(url: string | undefined): string | undefined {
  if (!url?.trim()) return url
  const trimmed = url.trim()
  if (!isLocalDemoVideo(trimmed) || !preferMobileDemoVideo()) return trimmed
  return mobileVariantPath(trimmed)
}
