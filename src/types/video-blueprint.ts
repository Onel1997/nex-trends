/** Future-ready viral video blueprint — modular for voiceover, shots, avatar, render pipeline. */

export type VideoBlueprintHook = {
  text: string
  retentionScore: number
  style: string
  duration: string
}

export type VideoBlueprintScene = {
  id: number
  label: string
  timeRange: string
  cameraAngle: string
  visualDirection: string
  pacing: string
  overlayText: string
  /** Future: TTS line for this scene */
  voiceoverLine?: string
  /** Future: image-to-video / text-to-video prompt */
  shotPrompt?: string
}

export type VideoBlueprintCta = {
  engagement: string
  follow: string
  commentBait: string
}

export type VideoBlueprintViralElements = {
  performanceHypothesis: string
  emotionalTriggers: string[]
  algorithmFit: string[]
}

export type VideoBlueprintPlatformOptimization = {
  primary: string
  tiktok: string
  reels: string
  shorts: string
}

/** Pipeline slots for future AI production stages */
export type VideoBlueprintPipeline = {
  voiceover: {
    status: 'pending' | 'ready' | 'completed'
    script: string
    voiceStyle?: string
    url?: string
  }
  shots: {
    status: 'pending' | 'generating' | 'completed'
    items: Array<{ sceneId: number; prompt: string; url?: string }>
  }
  avatar: {
    status: 'disabled' | 'pending' | 'completed'
    config?: null
  }
  render: {
    status: 'pending' | 'processing' | 'completed' | 'failed'
    url?: string
    posterUrl?: string
    provider?: string
    jobId?: string
  }
}

export type VideoBlueprint = {
  id: string
  trendId: string
  trendTitle: string
  platform: string
  niche: string
  createdAt: string
  concept: string
  hooks: VideoBlueprintHook[]
  scenes: VideoBlueprintScene[]
  captions: string[]
  cta: VideoBlueprintCta
  viralElements: VideoBlueprintViralElements
  platformOptimization: VideoBlueprintPlatformOptimization
  pipeline: VideoBlueprintPipeline
}

export type SavedVideoBlueprint = VideoBlueprint & {
  savedAt: string
}
