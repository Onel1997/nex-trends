/** Returns true when the string is a loadable video URL (https or same-origin path). */
export function isValidVideoUrl(url: string | undefined): url is string {
  if (!url?.trim()) return false
  const trimmed = url.trim()
  if (trimmed.startsWith('/')) {
    return /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(trimmed)
  }
  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false
    const path = parsed.pathname.toLowerCase()
    return (
      /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(path) ||
      path.includes('/video') ||
      parsed.hostname.includes('pexels.com') ||
      parsed.hostname.includes('cloudfront.net') ||
      parsed.hostname.includes('mixkit.co')
    )
  } catch {
    return false
  }
}

export function isLocalDemoVideo(url: string | undefined): boolean {
  return Boolean(url?.startsWith('/demo-videos/'))
}

export type VideoProbeResult = 'idle' | 'checking' | 'ok' | 'error'

/** Probe whether the browser can load video metadata (CORS-safe via <video>). */
export function probeVideoUrl(
  url: string,
  signal: AbortSignal,
): Promise<boolean> {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve(false)
      return
    }

    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', 'true')

    const cleanup = () => {
      video.removeEventListener('loadedmetadata', onReady)
      video.removeEventListener('error', onError)
      video.src = ''
      video.load()
    }

    const onReady = () => {
      cleanup()
      resolve(!signal.aborted)
    }

    const onError = () => {
      cleanup()
      resolve(false)
    }

    signal.addEventListener('abort', () => {
      cleanup()
      resolve(false)
    })

    video.addEventListener('loadedmetadata', onReady, { once: true })
    video.addEventListener('error', onError, { once: true })
    video.src = url
  })
}
