export type WorkspacePlatform = 'TikTok' | 'Instagram' | 'YouTube'

export type TrendStatusBadge = 'Early' | 'Rising' | 'Exploding'

export type HookTone = 'aggressive' | 'luxury' | 'storytelling' | 'casual' | 'educational'

export type TrendFeedItem = {
  id: string
  title: string
  platform: WorkspacePlatform
  viralScore: number
  growthPercent: number
  engagementVelocity: string
  niche: string
  status: TrendStatusBadge
}

export type GeneratedHook = {
  id: string
  text: string
  ctrScore: number
}

export type GeneratedAdCopy = {
  shortAd: string
  cta: string
  caption: string
}

export type GeneratedSeoTitle = {
  title: string
  seoScore: number
  keywordStrength: number
  keyword: string
}
