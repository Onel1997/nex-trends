import {
  getMediaFallbackChain,
  getStableTrendMedia,
  pickNextFallbackMedia,
} from '@/lib/trend-media-assignment'
import { isLocalDemoVideo } from '@/lib/video-url'
import { probeVideoUrl } from '@/lib/video-url'
import type { TrendIntelligence } from '@/types/trend-intelligence'

export type VideoJobStatus = 'idle' | 'queued' | 'generating' | 'completed' | 'failed'

export type VideoGenerationResult = {
  status: VideoJobStatus
  videoUrl: string
  posterUrl: string
  duration: string
  hasAudio: boolean
  message?: string
}

const JOB_TIMEOUT_MS = 25_000
const PROBE_TIMEOUT_MS = 8_000

function log(scope: string, detail?: unknown) {
  if (import.meta.env.DEV || import.meta.env.VITE_ADMIN_DEBUG === 'true') {
    console.debug(`[VideoPipeline] ${scope}`, detail ?? '')
  }
}

async function probeWithTimeout(url: string): Promise<boolean> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS)
  try {
    return await probeVideoUrl(url, controller.signal)
  } catch {
    return false
  } finally {
    window.clearTimeout(timer)
  }
}

/**
 * Resolves a playable MP4 for the trend (prefers local demo clips with audio tracks).
 * Does not fall back to poster-only — returns failed state with user-facing message.
 */
export async function runVideoGenerationJob(
  trend: TrendIntelligence,
  onStatus?: (status: VideoJobStatus, detail?: string) => void,
): Promise<VideoGenerationResult> {
  onStatus?.('queued', 'Video wird vorbereitet …')
  log('start', { trendId: trend.id, niche: trend.niche })

  const deadline = Date.now() + JOB_TIMEOUT_MS
  onStatus?.('generating', 'Suche optimales Video mit Audio …')

  const candidates: { video: string; poster: string; duration: string }[] = []

  const primary = getStableTrendMedia(trend.id, trend.niche)
  candidates.push(primary)

  const chain = getMediaFallbackChain(trend.id, trend.niche)
  for (const asset of chain) {
    if (!candidates.some((c) => c.video === asset.video)) {
      candidates.push(asset)
    }
  }

  // Prefer local files — reliable autoplay + embedded audio
  candidates.sort((a, b) => {
    const aLocal = isLocalDemoVideo(a.video) ? 0 : 1
    const bLocal = isLocalDemoVideo(b.video) ? 0 : 1
    return aLocal - bLocal
  })

  for (const asset of candidates) {
    if (Date.now() > deadline) {
      log('timeout')
      onStatus?.('failed', 'Zeitüberschreitung bei der Video-Verarbeitung.')
      return {
        status: 'failed',
        videoUrl: '',
        posterUrl: trend.thumbnailUrl ?? '',
        duration: trend.videoDuration ?? '0:15',
        hasAudio: false,
        message:
          'Video-Provider antwortet nicht rechtzeitig. Bitte erneut versuchen oder Verbindung prüfen.',
      }
    }

    log('probe', asset.video)
    onStatus?.('generating', `Prüfe Clip …`)

    const ok = isLocalDemoVideo(asset.video) || (await probeWithTimeout(asset.video))
    if (!ok) continue

    onStatus?.('completed', 'Video bereit')
    log('ok', asset.video)

    return {
      status: 'completed',
      videoUrl: asset.video,
      posterUrl: asset.poster,
      duration: asset.duration,
      hasAudio: true,
      message: isLocalDemoVideo(asset.video)
        ? 'Lokales Demo-Video mit Tonspur — Tippe zum Abspielen mit Audio.'
        : 'Stream-Video bereit — Ton beim Abspielen aktivieren.',
    }
  }

  const fallback = pickNextFallbackMedia(trend.id, trend.niche, undefined, new Set())
  onStatus?.('failed', 'Kein stabiles Video gefunden')

  return {
    status: 'failed',
    videoUrl: fallback.video,
    posterUrl: fallback.poster,
    duration: fallback.duration,
    hasAudio: false,
    message:
      'Video konnte nicht geladen werden — nur Vorschaubild verfügbar. Bitte später erneut versuchen.',
  }
}
