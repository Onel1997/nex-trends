export type AiVideoLibraryStatus =
  | 'queued'
  | 'generating'
  | 'processing'
  | 'completed'
  | 'failed'

export type PlatformFilter = 'all' | 'tiktok' | 'instagram' | 'youtube'

export type StatusFilter = 'all' | AiVideoLibraryStatus

export type SavedAiVideo = {
  id: string
  generationId: string | null
  jobId: string | null
  title: string
  hookText?: string
  niche: string
  platform: string
  status: AiVideoLibraryStatus
  creditsUsed: number
  createdAt: string
  duration: string
  videoUrl: string | null
  posterUrl: string | null
  captions: string[]
  voiceoverUrl?: string | null
  musicUrl?: string | null
  provider?: string | null
  trendId?: string | null
  errorMessage?: string | null
}
