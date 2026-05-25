import type { BillingPeriod, PlanId } from '@/lib/plans'

export type SubscriptionRow = {
  id: string
  user_id: string
  stripe_subscription_id: string
  stripe_price_id: string | null
  plan: PlanId
  status: string
  billing_period: BillingPeriod
  current_period_end: string | null
  created_at: string
  updated_at: string
}

export type UsageLogRow = {
  id: string
  user_id: string
  action: string
  credits_used: number
  metadata: Record<string, unknown>
  created_at: string
}

export type PlanRow = {
  id: PlanId
  name: string
  monthly_price: number
  yearly_price: number
  credits: number | null
  features: string[]
  sort_order: number
}
