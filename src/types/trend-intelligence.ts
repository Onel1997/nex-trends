export type TrendVelocity = 'rising' | 'peak' | 'stable' | 'cooling'

export type TrendIntelligence = {
  id: string
  title: string
  platform: string
  views: string
  engagement: string
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
  niche?: string
  isDemo?: boolean
}

export type ScoutedTrendRaw = {
  title?: string
  platform?: string
  views?: string
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
