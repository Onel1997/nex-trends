export type TrendVelocity = 'rising' | 'peak' | 'stable' | 'cooling'

export type TrendState = 'exploding' | 'rising' | 'stable' | 'saturated'

export type HeatLevel = 'cold' | 'warm' | 'hot' | 'viral'

export type HookStyle = 'aggressive' | 'luxury' | 'storytelling' | 'faceless' | 'ugc'

export type GrowthIndicator = 'up' | 'stable' | 'down'

export type CreatorInfo = {
  handle: string
  displayName: string
  avatarUrl: string
  followers: string
  bio?: string
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
  targetAudience?: string
  whyViral?: string
  aiRecommendations?: string[]
  heatLevel?: HeatLevel
  growthIndicator?: GrowthIndicator
  engagementScore?: number
  savedAt?: string
  /** Derived intelligence signals (Phase 2 dashboard) */
  trendState?: TrendState
  momentumScore?: number
  competitionScore?: number
  opportunityScore?: number
  aiInsight?: string
  risingKeywords?: string[]
  ctaAngles?: string[]
  monetizationPotential?: string
}

export type TrendSearchHistoryEntry = {
  id: string
  query: string
  platform: string
  resultCount: number
  timestamp: string
}

export type SavedTrendRecord = {
  trend: TrendIntelligence
  savedAt: string
  userId?: string
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
