import {
  createVideoStrategyJob,
  retryVideoJob,
  strategyProgressDetail,
} from '@/lib/video-api'
import {
  logVideoPipelineError,
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
  mode?: 'strategy' | 'video'
  blueprint?: GeneratedVideoJob['blueprint']
  postingStrategy?: string
  /** Internal diagnostic only — never render in UI */
  message?: string
}

const MAX_RETRIES = 2
const PROGRESS_TICK_MS = 900

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
    hasAudio: job.hasAudio ?? false,
    hookText: job.hookText,
    captions: job.captions,
    scenePrompt: job.scenePrompt,
    pacing: job.pacing,
    motionStyle: job.motionStyle,
    visualMood: job.visualMood,
    voiceoverUrl: job.voiceoverUrl,
    musicUrl: job.musicUrl,
    provider: job.provider,
    mode: job.mode ?? 'strategy',
    blueprint: job.blueprint,
    postingStrategy: job.postingStrategy,
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

async function runProgressTicker(
  onStatus: (status: VideoJobStatus, detail?: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  let step = 0
  onStatus('generating', strategyProgressDetail(step))

  while (!signal?.aborted) {
    await new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(resolve, PROGRESS_TICK_MS)
      signal?.addEventListener(
        'abort',
        () => {
          window.clearTimeout(timer)
          reject(new Error('Abgebrochen'))
        },
        { once: true },
      )
    })
    step += 1
    onStatus('generating', strategyProgressDetail(step))
  }
}

export async function runVideoGenerationJob(
  trend: TrendIntelligence,
  onStatus?: (status: VideoJobStatus, detail?: string, meta?: { retryAttempt?: number }) => void,
  options?: RunVideoJobOptions,
): Promise<VideoGenerationResult> {
  onStatus?.('queued', PREMIUM_PIPELINE_MESSAGES.crafting[0])
  log('start-strategy', { trendId: trend.id, retry: options?.retryJobId })

  let attempt = 0
  let lastError: string | undefined
  let lastJobId = options?.retryJobId

  while (attempt <= MAX_RETRIES) {
    const progressController = new AbortController()
    const linkedSignal = options?.signal
    const abortLinked = () => progressController.abort()
    linkedSignal?.addEventListener('abort', abortLinked, { once: true })

    const progressPromise = runProgressTicker(
      (status, detail) => {
        if (options?.signal?.aborted) return
        onStatus?.(status, detail, metaForAttempt(attempt))
      },
      progressController.signal,
    ).catch(() => undefined)

    try {
      onStatus?.('generating', strategyProgressDetail(0), metaForAttempt(attempt))

      const job = lastJobId && attempt > 0
        ? await retryVideoJob(lastJobId)
        : lastJobId && attempt === 0 && options?.retryJobId
          ? await retryVideoJob(lastJobId)
          : await createVideoStrategyJob(trend, options?.generationId, options?.studio)

      lastJobId = job.id
      progressController.abort()
      await progressPromise

      if (options?.signal?.aborted) {
        return abortedResult(trend)
      }

      if (job.status === 'completed' && job.blueprint) {
        onStatus?.('completed', PREMIUM_PIPELINE_MESSAGES.success)
        log('ok', { jobId: job.id, provider: job.provider, mode: job.mode })
        return toResult(job)
      }

      if (job.status === 'failed') {
        throw new Error(job.errorMessage ?? 'Creator Blueprint fehlgeschlagen')
      }

      onStatus?.('completed', PREMIUM_PIPELINE_MESSAGES.success)
      return toResult(job)
    } catch (err) {
      progressController.abort()
      await progressPromise

      lastError = err instanceof Error ? err.message : 'Unknown error'
      logVideoPipelineError(`attempt-${attempt}`, err, { trendId: trend.id })

      if (options?.signal?.aborted) {
        return abortedResult(trend)
      }

      attempt += 1
      if (attempt <= MAX_RETRIES) {
        options?.onRetry?.(attempt)
        onStatus?.('generating', PREMIUM_PIPELINE_MESSAGES.retry[(attempt - 1) % 3], {
          retryAttempt: attempt,
        })
        await new Promise((r) => window.setTimeout(r, 800 + attempt * 400))
      }
    } finally {
      linkedSignal?.removeEventListener('abort', abortLinked)
    }
  }

  logVideoPipelineError('exhausted', lastError, { attempts: attempt })

  return {
    status: 'failed',
    jobId: lastJobId,
    videoUrl: '',
    posterUrl: trend.thumbnailUrl ?? '',
    duration: trend.videoDuration ?? '0:15',
    hasAudio: false,
    message: lastError,
  }
}

function metaForAttempt(attempt: number) {
  return attempt > 0 ? { retryAttempt: attempt } : undefined
}

function abortedResult(trend: TrendIntelligence): VideoGenerationResult {
  return {
    status: 'failed',
    videoUrl: '',
    posterUrl: trend.thumbnailUrl ?? '',
    duration: trend.videoDuration ?? '0:15',
    hasAudio: false,
    message: 'Abgebrochen',
  }
}
