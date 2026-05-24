export type SubscriptionStatus = 'active' | 'inactive'

export type UserProfile = {
  is_pro: boolean
  subscription_status: SubscriptionStatus
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  monthly_usage_count: number
  usage_reset_date: string | null
}

export type CachedUserProfile = {
  userId: string
  profile: UserProfile
  fetchedAt: number
}
