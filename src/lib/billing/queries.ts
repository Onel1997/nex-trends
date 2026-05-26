import { supabase } from '@/lib/supabase'
import type { PlanRow, SubscriptionRow, UsageLogRow } from '@/types/billing'
import type { PlanId } from '@/lib/plans'

export async function fetchUsageLogs(userId: string, limit = 12): Promise<UsageLogRow[]> {
  const { data, error } = await supabase
    .from('usage_logs')
    .select('id, user_id, action, feature, credits_used, balance_after, metadata, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.warn('[billing] usage_logs:', error.message)
    return []
  }

  return (data ?? []) as UsageLogRow[]
}

export async function fetchActiveSubscription(
  userId: string,
): Promise<SubscriptionRow | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(
      'id, user_id, stripe_subscription_id, stripe_price_id, plan, status, billing_period, current_period_end, created_at, updated_at',
    )
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.warn('[billing] subscriptions:', error.message)
    return null
  }

  return (data as SubscriptionRow | null) ?? null
}

export async function fetchPlansCatalog(): Promise<PlanRow[]> {
  const { data, error } = await supabase
    .from('plans')
    .select('id, name, monthly_price, yearly_price, credits, features, sort_order')
    .order('sort_order', { ascending: true })

  if (error) {
    console.warn('[billing] plans:', error.message)
    return []
  }

  return (data ?? []).map((row) => ({
    ...row,
    id: row.id as PlanId,
    features: Array.isArray(row.features) ? row.features : [],
  })) as PlanRow[]
}
