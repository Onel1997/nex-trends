import type { PlanId } from '@/lib/plans/definitions'
import { normalizePlanId, PLAN_LABELS } from '@/lib/plans/definitions'
import type { AdminUser } from '@/types/admin'

/** Plans admins can assign — extend here when adding tiers. */
export const ADMIN_MANAGEABLE_PLANS = [
  'free',
  'creator',
  'pro_creator',
  'studio',
  'agency',
  'audio',
] as const satisfies readonly PlanId[]

export type AdminManageablePlan = (typeof ADMIN_MANAGEABLE_PLANS)[number]

export const PLAN_ADMIN_LABELS: Record<AdminManageablePlan, string> = {
  free: 'FREE',
  creator: 'CREATOR',
  pro_creator: 'PRO CREATOR',
  studio: 'STUDIO',
  agency: 'AGENCY',
  audio: 'AUDIO',
}

export const PLAN_BADGE_CLASSES: Record<PlanId, string> = {
  free: 'border-zinc-700/80 bg-zinc-800/80 text-zinc-400',
  creator: 'border-violet-500/35 bg-violet-500/12 text-violet-300',
  audio: 'border-cyan-500/35 bg-cyan-500/12 text-cyan-300',
  pro_creator: 'border-fuchsia-500/40 bg-fuchsia-500/15 text-fuchsia-200',
  studio: 'border-indigo-500/40 bg-indigo-500/15 text-indigo-200',
  agency: 'border-amber-500/40 bg-amber-500/15 text-amber-200',
  founder: 'border-amber-500/45 bg-amber-500/18 text-amber-100',
}

export type AdminUserStatus = 'ACTIVE' | 'BANNED' | 'TRIAL' | 'CANCELED'

export function resolveAdminUserPlan(user: Pick<AdminUser, 'plan' | 'is_pro'>): PlanId {
  if (user.plan) return normalizePlanId(user.plan)
  return user.is_pro ? 'pro_creator' : 'free'
}

export function getAdminUserStatus(
  user: Pick<AdminUser, 'is_banned' | 'subscription_status'>,
): AdminUserStatus {
  if (user.is_banned) return 'BANNED'
  const status = (user.subscription_status ?? 'inactive').toLowerCase()
  if (status === 'canceled' || status === 'cancelled') return 'CANCELED'
  if (status === 'trialing' || status === 'trial') return 'TRIAL'
  return 'ACTIVE'
}

export function planDisplayLabel(plan: PlanId): string {
  if (plan in PLAN_ADMIN_LABELS) {
    return PLAN_ADMIN_LABELS[plan as AdminManageablePlan]
  }
  return PLAN_LABELS[plan]?.toUpperCase() ?? plan.toUpperCase()
}
