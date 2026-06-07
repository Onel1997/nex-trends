import type { PlanId, UsageActionId } from '@/lib/plans'

export type CreditConsumeResult = {
  allowed: boolean
  unlimited: boolean
  used: number
  remaining: number | null
  limit: number | null
  usageResetDate: string | null
  plan?: PlanId
  bonusCredits?: number
  cost?: number
  logId?: string
  error?: string
}

export type ConsumeCreditsPayload = {
  feature: UsageActionId | string
  cost?: number
  tool?: string
  label?: string
  niche?: string
  platform?: string
  prompt?: string
  generation_type?: 'text' | 'video' | 'audio' | 'search' | 'image'
  metadata?: Record<string, unknown>
  idempotency_key?: string
  skip_analytics_log?: boolean
}

export type CreditFeatureId = UsageActionId
