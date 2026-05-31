export type AdminSection = 'overview' | 'users' | 'trends' | 'controls'

export type AdminUser = {
  id: string
  email: string
  created_at: string
  credit_balance: number
  monthly_usage_count: number
  plan: string
  is_pro: boolean
  subscription_status: string
  is_banned: boolean
  banned_at: string | null
}

import type { AnalyticsPeriod } from '@/types/analytics'

export type AdminOverview = {
  totalUsers: number
  activeUsers: number
  totalGenerations: number
  proUsers: number
  creditsConsumed?: number
  revenuePlaceholder: string
  period?: AnalyticsPeriod
}

export type AdminTrendStats = {
  topNiches: { niche: string; count: number }[]
  topPlatforms: { platform: string; count: number }[]
  topTools?: { tool: string; count: number }[]
  recentGenerations: {
    tool: string
    label: string
    email?: string
    niche?: string
    platform?: string
    credits_used?: number
    created_at: string
  }[]
  creditsConsumed?: number
  totalGenerations?: number
  period?: AnalyticsPeriod
}

export type AdminFeatureFlags = {
  trend_intelligence: boolean
  hook_generator: boolean
  ad_copy: boolean
  seo_titles: boolean
  landing_analyzer: boolean
}

export type AdminSettings = {
  maintenance_mode: boolean
  announcement: string
  feature_flags: Partial<AdminFeatureFlags>
  updated_at: string | null
}

export const DEFAULT_FEATURE_FLAGS: AdminFeatureFlags = {
  trend_intelligence: true,
  hook_generator: true,
  ad_copy: true,
  seo_titles: true,
  landing_analyzer: true,
}
