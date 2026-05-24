export type TrendVelocity = 'rising' | 'peak' | 'stable' | 'cooling'

export type CreatorInfo = {
  handle: string
  displayName: string
  avatarUrl: string
  followers: string
  verified?: boolean
}

export type HookAnalysis = {
  hookType: string
  hookText: string
  hookScore: number
  whyItWorks: string
  retentionTrigger: string
}

export type ContentBreakdown = {
  format: string
  pacing: string
  audioTrend?: string
  visualStyle: string
  ctaStrategy: string
  bestPostTime: string
}

export type TrendIntelligence = {
  id: string
  title: string
  platform: string
  views: string
  likes: string
  engagement: string
  engagementRate: string
  description: string
  gradientFrom: string
  gradientTo: string
  viralScore: number
  trendVelocity: TrendVelocity
  hashtags: string[]
  engagementPrediction: string
  contentIdeas: string[]
  hookSuggestions: string[]
  creatorInspiration: string
  thumbnailUrl: string
  videoUrl?: string
  videoDuration?: string
  creator: CreatorInfo
  hookAnalysis: HookAnalysis
  contentBreakdown: ContentBreakdown
  externalUrl?: string
  niche?: string
  isDemo?: boolean
}

export type ScoutedTrendRaw = {
  title?: string
  platform?: string
  views?: string
  likes?: string
  engagement?: string
  description?: string
  viralScore?: number
  trendVelocity?: string
  hashtags?: string[]
  engagementPrediction?: string
  contentIdeas?: string[]
  hookSuggestions?: string[]
  creatorInspiration?: string
  niche?: string
}
