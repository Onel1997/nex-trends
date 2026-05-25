import { invokeEdgeFunction } from '@/lib/edgeFunctions'
import { retryVideoJob } from '@/lib/video-api'
import type {
  PlatformFilter,
  SavedAiVideo,
  StatusFilter,
} from '@/types/ai-video-library'

type LibraryRow = {
  id: string
  generationId?: string | null
  jobId?: string | null
  title?: string
  hookText?: string
  niche?: string
  platform?: string
  status?: string
  creditsUsed?: number
  createdAt?: string
  duration?: string
  videoUrl?: string | null
  posterUrl?: string | null
  captions?: string[]
  voiceoverUrl?: string | null
  musicUrl?: string | null
  provider?: string | null
  trendId?: string | null
  errorMessage?: string | null
}

type LibraryResponse = { ok?: boolean; items?: LibraryRow[]; error?: string }

function mapRow(row: LibraryRow): SavedAiVideo {
  return {
    id: row.id,
    generationId: row.generationId ?? null,
    jobId: row.jobId ?? null,
    title: row.title ?? row.hookText?.slice(0, 80) ?? 'AI Video',
    hookText: row.hookText,
    niche: row.niche ?? '',
    platform: row.platform ?? '',
    status: (row.status ?? 'queued') as SavedAiVideo['status'],
    creditsUsed: row.creditsUsed ?? 0,
    createdAt: row.createdAt ?? new Date().toISOString(),
    duration: row.duration ?? '0:15',
    videoUrl: row.videoUrl ?? null,
    posterUrl: row.posterUrl ?? null,
    captions: Array.isArray(row.captions) ? row.captions : [],
    voiceoverUrl: row.voiceoverUrl,
    musicUrl: row.musicUrl,
    provider: row.provider,
    trendId: row.trendId,
    errorMessage: row.errorMessage,
  }
}

const PLATFORM_QUERY: Record<Exclude<PlatformFilter, 'all'>, string> = {
  tiktok: 'tiktok',
  instagram: 'instagram',
  youtube: 'youtube',
}

export async function fetchMyAiVideos(options?: {
  platform?: PlatformFilter
  status?: StatusFilter
  limit?: number
}): Promise<SavedAiVideo[]> {
  const result = await invokeEdgeFunction<LibraryResponse>('generate-video', {
    action: 'library',
    limit: options?.limit ?? 50,
    platform:
      options?.platform && options.platform !== 'all'
        ? PLATFORM_QUERY[options.platform]
        : undefined,
    status:
      options?.status && options.status !== 'all' ? options.status : undefined,
  })

  return (result?.items ?? []).map(mapRow)
}

export async function deleteMyAiVideo(video: SavedAiVideo): Promise<void> {
  await invokeEdgeFunction('generate-video', {
    action: 'delete',
    generation_id: video.generationId ?? undefined,
    job_id: video.jobId ?? undefined,
  })
}

export async function regenerateMyAiVideo(
  video: SavedAiVideo,
): Promise<{ jobId: string } | null> {
  if (!video.jobId) return null
  const job = await retryVideoJob(video.jobId)
  return job?.id ? { jobId: job.id } : null
}

export function downloadVideoMp4(video: SavedAiVideo): void {
  if (!video.videoUrl) return
  const anchor = document.createElement('a')
  anchor.href = video.videoUrl
  anchor.download = `${sanitizeFilename(video.title)}.mp4`
  anchor.rel = 'noopener noreferrer'
  anchor.target = '_blank'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^\w\s-]/g, '').trim().slice(0, 48) || 'ai-video'
}

export function formatVideoDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function statusBadgeVariant(
  status: SavedAiVideo['status'],
): 'success' | 'warning' | 'muted' | 'default' {
  switch (status) {
    case 'completed':
      return 'success'
    case 'failed':
      return 'warning'
    case 'queued':
    case 'generating':
    case 'processing':
      return 'default'
    default:
      return 'muted'
  }
}
