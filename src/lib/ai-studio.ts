import { generateId } from '@/lib/utils'
import type { TrendIntelligence } from '@/types/trend-intelligence'

export type StudioPlatform = 'TikTok' | 'Instagram' | 'YouTube'

export type StudioStyle =
  | 'UGC / Authentic'
  | 'Cinematic'
  | 'Fast-paced viral'
  | 'Luxury / Premium'
  | 'Faceless / B-roll'

export type StudioDuration = '0:15' | '0:30' | '0:60'

export type AiStudioFormValues = {
  topic: string
  platform: StudioPlatform
  style: StudioStyle
  duration: StudioDuration
  voiceover: boolean
  captions: boolean
}

export const DEFAULT_STUDIO_FORM: AiStudioFormValues = {
  topic: '',
  platform: 'TikTok',
  style: 'UGC / Authentic',
  duration: '0:15',
  voiceover: true,
  captions: true,
}

export const STUDIO_PLATFORMS: StudioPlatform[] = ['TikTok', 'Instagram', 'YouTube']

export const STUDIO_STYLES: StudioStyle[] = [
  'UGC / Authentic',
  'Cinematic',
  'Fast-paced viral',
  'Luxury / Premium',
  'Faceless / B-roll',
]

export const STUDIO_DURATIONS: StudioDuration[] = ['0:15', '0:30', '0:60']

/** Builds a TrendIntelligence payload for the video generation pipeline. */
export function buildStudioTrend(form: AiStudioFormValues): TrendIntelligence {
  const id = generateId()
  const topic = form.topic.trim() || 'Viral short-form trend'

  return {
    id: `studio-${id}`,
    title: topic.slice(0, 120),
    platform: form.platform,
    views: '—',
    likes: '—',
    engagement: '—',
    engagementRate: '—',
    description: topic,
    gradientFrom: '#4c1d95',
    gradientTo: '#701a75',
    viralScore: 85,
    trendVelocity: 'rising',
    hashtags: ['#ai', '#viral', '#shorts'],
    engagementPrediction: 'High retention potential',
    contentIdeas: [topic],
    hookSuggestions: [topic],
    creatorInspiration: 'AI Studio',
    thumbnailUrl: '',
    videoDuration: form.duration,
    niche: form.style,
    creator: {
      handle: '@nexstudio',
      displayName: 'NexTrends Studio',
      avatarUrl: '',
      followers: '—',
    },
    hookAnalysis: {
      hookType: form.style,
      hookText: topic,
      hookScore: 88,
      whyItWorks: `Optimized for ${form.platform} with ${form.style} pacing.`,
      retentionTrigger: 'Pattern interrupt in first 2 seconds',
    },
    contentBreakdown: {
      format: '9:16 vertical',
      pacing: form.duration,
      visualStyle: form.style,
      ctaStrategy: 'Soft CTA at end frame',
      bestPostTime: 'Peak evening hours',
      audioTrend: form.voiceover ? 'Voiceover + trending bed' : 'Trending bed only',
    },
  }
}

export type StudioCreateOptions = {
  enableVoiceover?: boolean
  enableCaptions?: boolean
  duration?: string
  style?: string
}
