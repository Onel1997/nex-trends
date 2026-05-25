import {
  createVideoJob,
  retryVideoJob,
  waitForVideoJob,
} from '@/lib/video-api'
import type { GeneratedVideoJob } from '@/types/generated-video'
import type { TrendIntelligence } from '@/types/trend-intelligence'

export type VideoJobStatus =
  | 'idle'
  | 'queued'
  | 'generating'
  | 'processing'
  | 'completed'
  | 'failed'

export type VideoGenerationResult = {
  status: VideoJobStatus
  jobId?: string
  videoUrl: string
  posterUrl: string
  duration: string
  hasAudio: boolean
  hookText?: string
  captions?: string[]
  voiceoverUrl?: string
  musicUrl?: string
  provider?: string
  message?: string
}

const MAX_RETRIES = 2

function log(scope: string, detail?: unknown) {
  if (
    import.meta.env.DEV ||
    import.meta.env.VITE_ADMIN_DEBUG === 'true' ||
    import.meta.env.VITE_VIDEO_DEBUG === 'true'
  ) {
    console.debug(`[VideoPipeline] ${scope}`, detail ?? '')
  }
}

function mapStatus(s: GeneratedVideoJob['status']): VideoJobStatus {
  if (s === 'processing') return 'processing'
  if (s === 'generating' || s === 'queued') return s === 'queued' ? 'queued' : 'generating'
  if (s === 'completed') return 'completed'
  if (s === 'failed') return 'failed'
  return 'generating'
}

function toResult(job: GeneratedVideoJob): VideoGenerationResult {
  return {
    status: mapStatus(job.status),
    jobId: job.id,
    videoUrl: job.videoUrl ?? '',
    posterUrl: job.posterUrl ?? '',
    duration: job.duration ?? '0:15',
    hasAudio: job.hasAudio ?? Boolean(job.voiceoverUrl || job.musicUrl),
    hookText: job.hookText,
    captions: job.captions,
    voiceoverUrl: job.voiceoverUrl,
    musicUrl: job.musicUrl,
    provider: job.provider,
    message:
      job.provider === 'synthetic'
        ? 'Premium-Kurzvideo mit KI-Hook, Captions & Voiceover. Für echte KI-Clips: REPLICATE_API_TOKEN setzen.'
        : 'Einzigartiges KI-Video — tippe für Wiedergabe mit Audio.',
  }
}

export type RunVideoJobOptions = {
  generationId?: string | null
  retryJobId?: string
  signal?: AbortSignal
}

/**
 * Runs real AI video generation via Supabase edge function (Replicate / Luma).
 * Falls back to synthetic unique composition when no provider keys are configured.
 */
export async function runVideoGenerationJob(
  trend: TrendIntelligence,
  onStatus?: (status: VideoJobStatus, detail?: string) => void,
  options?: RunVideoJobOptions,
): Promise<VideoGenerationResult> {
  onStatus?.('queued', 'Video-Job wird erstellt …')
  log('start', { trendId: trend.id, retry: options?.retryJobId })

  let attempt = 0
  let lastError: string | undefined

  while (attempt <= MAX_RETRIES) {
    try {
      let job: GeneratedVideoJob

      if (options?.retryJobId && attempt === 0) {
        job = await retryVideoJob(options.retryJobId)
      } else if (attempt === 0 && !options?.retryJobId) {
        job = await createVideoJob(trend, options?.generationId)
      } else {
        job = await createVideoJob(trend, options?.generationId)
      }

      onStatus?.(mapStatus(job.status), 'Provider-Job gestartet …')

      if (job.status === 'completed' && job.videoUrl) {
        onStatus?.('completed', 'Video bereit')
        return toResult(job)
      }

      const final = await waitForVideoJob(
        job.id,
        (updated, detail) => {
          onStatus?.(mapStatus(updated.status), detail)
        },
        options?.signal,
      )

      onStatus?.('completed', 'Video bereit')
      log('ok', { jobId: final.id, provider: final.provider })
      return toResult(final)
    } catch (err) {
      lastError = err instanceof Error ? err.message : 'Unbekannter Fehler'
      log('attempt failed', { attempt, lastError })

      if (options?.signal?.aborted) {
        onStatus?.('failed', 'Abgebrochen')
        return {
          status: 'failed',
          videoUrl: '',
          posterUrl: trend.thumbnailUrl ?? '',
          duration: trend.videoDuration ?? '0:15',
          hasAudio: false,
          message: 'Abgebrochen',
        }
      }

      attempt += 1
      if (attempt <= MAX_RETRIES) {
        onStatus?.('generating', `Erneuter Versuch (${attempt}/${MAX_RETRIES}) …`)
      }
    }
  }

  onStatus?.('failed', lastError)
  return {
    status: 'failed',
    videoUrl: '',
    posterUrl: trend.thumbnailUrl ?? '',
    duration: trend.videoDuration ?? '0:15',
    hasAudio: false,
    message: lastError ?? 'Video-Generierung fehlgeschlagen.',
  }
}
