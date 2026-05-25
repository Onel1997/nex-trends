import { invokeEdgeFunction } from '@/lib/edgeFunctions'
import { formatPipelineError, type PipelineErrorPayload } from '@/lib/video-pipeline-errors'
import type { GeneratedVideoHistoryItem, GeneratedVideoJob } from '@/types/generated-video'
import type { StudioCreateOptions } from '@/lib/ai-studio'
import type { TrendIntelligence } from '@/types/trend-intelligence'

const POLL_INTERVAL_MS = 2_500
const MAX_POLL_MS = 180_000

function log(scope: string, detail?: unknown) {
  if (
    import.meta.env.DEV ||
    import.meta.env.VITE_ADMIN_DEBUG === 'true' ||
    import.meta.env.VITE_VIDEO_DEBUG === 'true'
  ) {
    console.debug(`[VideoAPI] ${scope}`, detail ?? '')
  }
}

type VideoEdgeResponse = PipelineErrorPayload & {
  ok?: boolean
  job?: GeneratedVideoJob
}

type CreateResponse = VideoEdgeResponse
type PollResponse = VideoEdgeResponse
type HistoryRow = GeneratedVideoHistoryItem & {
  video_url?: string
  poster_url?: string
  hook_text?: string
  voiceover_url?: string
  music_url?: string
  has_audio?: boolean
  error_message?: string
  trend_id?: string
  created_at?: string
}

type HistoryResponse = { ok?: boolean; items?: HistoryRow[]; error?: string }

export async function createVideoJob(
  trend: TrendIntelligence,
  generationId?: string | null,
  studio?: StudioCreateOptions,
): Promise<GeneratedVideoJob> {
  log('create', { trendId: trend.id })

  const result = await invokeEdgeFunction<CreateResponse>('generate-video', {
    action: 'create',
    trend_id: trend.id,
    title: trend.title,
    niche: trend.niche,
    platform: trend.platform,
    description: trend.description,
    hook_text: trend.hookAnalysis?.hookText ?? trend.title,
    generation_id: generationId ?? undefined,
    content_breakdown: trend.contentBreakdown,
    studio_duration: studio?.duration ?? trend.videoDuration,
    studio_style: studio?.style ?? trend.niche,
    enable_voiceover: studio?.enableVoiceover ?? true,
    enable_captions: studio?.enableCaptions ?? true,
  })

  if (!result?.job) {
    throw new Error(
      formatPipelineError(result, 'Video-Job konnte nicht erstellt werden'),
    )
  }

  log('create ok', {
    jobId: result.job.id,
    status: result.job.status,
    provider: result.job.provider,
  })

  return result.job
}

export async function pollVideoJob(jobId: string): Promise<GeneratedVideoJob> {
  const result = await invokeEdgeFunction<PollResponse>('generate-video', {
    action: 'poll',
    job_id: jobId,
  })

  if (!result?.job) {
    throw new Error(formatPipelineError(result, 'Poll fehlgeschlagen'))
  }

  log('poll', { jobId, status: result.job.status, error: result.job.errorMessage })
  return result.job
}

export async function retryVideoJob(jobId: string): Promise<GeneratedVideoJob> {
  const result = await invokeEdgeFunction<PollResponse>('generate-video', {
    action: 'retry',
    job_id: jobId,
  })

  if (!result?.job) {
    throw new Error(formatPipelineError(result, 'Retry fehlgeschlagen'))
  }

  return result.job
}

export async function fetchVideoHistory(
  limit = 12,
): Promise<GeneratedVideoHistoryItem[]> {
  const result = await invokeEdgeFunction<HistoryResponse>('generate-video', {
    action: 'history',
    limit,
  })

  return (result?.items ?? []).map((row) => ({
    id: row.id,
    status: row.status as GeneratedVideoJob['status'],
    provider: row.provider,
    videoUrl: row.video_url ?? row.videoUrl,
    posterUrl: row.poster_url ?? row.posterUrl,
    hookText: row.hook_text ?? row.hookText,
    captions: Array.isArray(row.captions) ? row.captions : [],
    voiceoverUrl: row.voiceover_url ?? row.voiceoverUrl,
    musicUrl: row.music_url ?? row.musicUrl,
    duration: row.duration ?? '0:15',
    hasAudio: row.has_audio ?? row.hasAudio ?? true,
    errorMessage: row.error_message ?? row.errorMessage,
    trendId: row.trend_id ?? row.trendId,
    createdAt: row.created_at ?? row.createdAt,
  }))
}

export async function waitForVideoJob(
  jobId: string,
  onProgress?: (job: GeneratedVideoJob, detail: string) => void,
  signal?: AbortSignal,
): Promise<GeneratedVideoJob> {
  const started = Date.now()

  while (Date.now() - started < MAX_POLL_MS) {
    if (signal?.aborted) {
      throw new Error('Abgebrochen')
    }

    const job = await pollVideoJob(jobId)

    const detail = progressDetail(job.status)
    onProgress?.(job, detail)

    if (job.status === 'completed' && job.videoUrl) {
      return job
    }

    if (job.status === 'failed') {
      throw new Error(
        job.errorMessage ?? 'Video-Generierung fehlgeschlagen (Provider oder Storage)',
      )
    }

    await new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(resolve, POLL_INTERVAL_MS)
      signal?.addEventListener(
        'abort',
        () => {
          window.clearTimeout(timer)
          reject(new Error('Abgebrochen'))
        },
        { once: true },
      )
    })
  }

  throw new Error(
    'Zeitüberschreitung — Video-Provider antwortet nicht. Bitte erneut versuchen.',
  )
}

function progressDetail(status: GeneratedVideoJob['status']): string {
  switch (status) {
    case 'queued':
      return 'In Warteschlange beim AI-Provider …'
    case 'generating':
      return 'KI generiert einzigartige Szenen (9:16) …'
    case 'processing':
      return 'Voiceover & Musik werden hinzugefügt …'
    case 'completed':
      return 'Video bereit'
    case 'failed':
      return 'Generierung fehlgeschlagen'
    default:
      return 'Verarbeitung …'
  }
}
