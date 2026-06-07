export type AnalyticsPeriod = '24h' | '7d' | '30d'

export type GenerationActivity = {
  tool: string
  label: string
  niche?: string
  platform?: string
  prompt?: string
  cost?: number
}

export type AiGenerationRecord = {
  id?: string
  email: string
  tool_used: string
  niche: string
  platform: string
  prompt: string
  credits_used: number
  created_at: string
}

export type AdminDailyPoint = {
  date: string
  generations: number
  credits: number
  activeUsers: number
}

export type AdminAnalyticsDashboard = {
  period: AnalyticsPeriod
  totalUsers?: number
  proUsers?: number
  planCounts?: Record<string, number>
  revenuePlaceholder?: string
  totalGenerations: number
  creditsConsumed: number
  activeUsers: number
  topTools: { tool: string; count: number }[]
  topNiches: { niche: string; count: number }[]
  topPlatforms: { platform: string; count: number }[]
  dailySeries: AdminDailyPoint[]
  recentGenerations: AiGenerationRecord[]
  liveCounters: {
    last24h: number
    last7d: number
    last30d: number
  }
  platformStats?: { platform: string; generation_count: number; credits_consumed: number }[]
}
