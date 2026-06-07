import type { PlanId } from '@/lib/plans'

export type UsageLimitResult = {
  allowed: boolean
  unlimited: boolean
  used: number
  remaining: number | null
  limit: number | null
  usageResetDate: string | null
  plan?: PlanId
}

export type UsageAction = 'check' | 'increment' | 'log_generation' | 'update_generation'
