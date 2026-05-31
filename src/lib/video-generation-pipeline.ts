import {
  createVideoJob,
  retryVideoJob,
  waitForVideoJob,
} from '@/lib/video-api'
import {
  logVideoPipelineError,
  premiumRenderingMessage,
  premiumRetryMessage,
  PREMIUM_PIPELINE_MESSAGES,
} from '@/lib/video-pipeline-messages'
import type { GeneratedVideoJob } from '@/types/generated-video'
import type { StudioCreateOptions } from '@/lib/ai-studio'
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
  scenePrompt?: string
  pacing?: string
  motionStyle?: string
  visualMood?: string
  voiceoverUrl?: string
  musicUrl?: string
  provider?: string
  /** Internal diagnostic only — never render in UI */
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
    scenePrompt: job.scenePrompt,
    pacing: job.pacing,
    motionStyle: job.motionStyle,
    visualMood: job.visualMood,
    voiceoverUrl: job.voiceoverUrl,
    musicUrl: job.musicUrl,
    provider: job.provider,
    message: PREMIUM_PIPELINE_MESSAGES.success,
  }
}

export type RunVideoJobOptions = {
  generationId?: string | null
  retryJobId?: string
  signal?: AbortSignal
  studio?: StudioCreateOptions
  onRetry?: (attempt: number) => void
}

export async function runVideoGenerationJob(
  trend: TrendIntelligence,
  onStatus?: (status: VideoJobStatus, detail?: string, meta?: { retryAttempt?: number }) => void,
  options?: RunVideoJobOptions,
): Promise<VideoGenerationResult> {
  onStatus?.('queued', PREMIUM_PIPELINE_MESSAGES.rendering[0])
  log('start', { trendId: trend.id, retry: options?.retryJobId })

  let attempt = 0
  let lastError: string | undefined

  while (attempt <= MAX_RETRIES) {
    try {
      let job: GeneratedVideoJob

      if (options?.retryJobId && attempt === 0) {
        job = await retryVideoJob(options.retryJobId)
      } else if (attempt === 0 && !options?.retryJobId) {
        job = await createVideoJob(trend, options?.generationId, options?.studio)
      } else {
        job = await createVideoJob(trend, options?.generationId, options?.studio)
      }

      onStatus?.(mapStatus(job.status), premiumRenderingMessage(job.status, attempt))

      if (job.status === 'completed' && job.videoUrl) {
        onStatus?.('completed', PREMIUM_PIPELINE_MESSAGES.success)
        return toResult(job)
      }

      const final = await waitForVideoJob(
        job.id,
        (updated) => {
          onStatus?.(mapStatus(updated.status), premiumRenderingMessage(updated.status, attempt))
        },
        options?.signal,
      )

      onStatus?.('completed', PREMIUM_PIPELINE_MESSAGES.success)
      log('ok', { jobId: final.id, provider: final.provider })
      return toResult(final)
    } catch (err) {
      lastError = err instanceof Error ? err.message : 'Unknown error'
      logVideoPipelineError(`attempt-${attempt}`, err, { trendId: trend.id })

      if (options?.signal?.aborted) {
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
        options?.onRetry?.(attempt)
        onStatus?.('generating', premiumRetryMessage(attempt), { retryAttempt: attempt })
        await new Promise((r) => window.setTimeout(r, 800 + attempt * 400))
      }
    }
  }

  logVideoPipelineError('exhausted', lastError, { attempts: attempt })

  return {
    status: 'failed',
    videoUrl: '',
    posterUrl: trend.thumbnailUrl ?? '',
    duration: trend.videoDuration ?? '0:15',
    hasAudio: false,
    message: lastError,
  }
}
