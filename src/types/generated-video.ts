export type GeneratedVideoStatus =
  | 'queued'
  | 'generating'
  | 'processing'
  | 'completed'
  | 'failed'

export type GeneratedVideoJob = {
  id: string
  status: GeneratedVideoStatus
  provider?: string
  videoUrl?: string
  posterUrl?: string
  hookText?: string
  captions?: string[]
  scenePrompt?: string
  pacing?: string
  motionStyle?: string
  visualMood?: string
  voiceoverUrl?: string
  musicUrl?: string
  duration?: string
  hasAudio?: boolean
  errorMessage?: string
  trendId?: string
  createdAt?: string
}

export type GeneratedVideoHistoryItem = GeneratedVideoJob & {
  hookText?: string
}
