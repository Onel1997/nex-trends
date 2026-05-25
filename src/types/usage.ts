export type UsageLimitResult = {
  allowed: boolean
  unlimited: boolean
  used: number
  remaining: number | null
  limit: number | null
  usageResetDate: string | null
}

export type UsageAction = 'check' | 'increment' | 'log_generation' | 'update_generation'
