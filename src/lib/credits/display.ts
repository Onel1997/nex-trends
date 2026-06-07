import { PLAN_LABELS, planMonthlyCredits, type PlanId } from '@/lib/plans'
import { MAX_FREE_CREDITS } from '@/lib/constants'

/** UI-only monthly allowances — does not affect billing or deduction logic. */
export const UI_PLAN_MONTHLY_CREDITS: Record<PlanId, number> = {
  free: planMonthlyCredits('free') ?? 25,
  creator: 250,
  audio: planMonthlyCredits('audio') ?? 500,
  pro_creator: 1000,
  studio: 5000,
  agency: 20000,
  founder: 20000,
}

export type UiCreditUsage = {
  remaining: number | null
  limit: number | null
  used?: number
  unlimited?: boolean
}

export const UNLIMITED_CREDITS_LABEL = 'Unlimited Credits'

export type UiCreditSnapshot = {
  planLabel: string
  remaining: number
  limit: number
  unlimited: boolean
}

export function formatCreditAmount(value: number): string {
  return value.toLocaleString('de-DE')
}

export function uiPlanDisplayName(plan: PlanId, isAdmin = false): string {
  if (isAdmin) return 'Admin'
  return PLAN_LABELS[plan] ?? 'Free'
}

export function uiMonthlyAllowance(plan: PlanId, isAdmin = false): number {
  if (isAdmin) return UI_PLAN_MONTHLY_CREDITS.founder
  return UI_PLAN_MONTHLY_CREDITS[plan] ?? UI_PLAN_MONTHLY_CREDITS.free
}

/** Resolve display remaining/limit for any plan — including legacy unlimited flags. */
export function getUiCreditSnapshot(
  userPlan: PlanId,
  usage: UiCreditUsage,
  isAdmin = false,
): UiCreditSnapshot {
  const unlimited = isAdmin || usage.unlimited === true

  if (unlimited) {
    return {
      planLabel: uiPlanDisplayName(userPlan, isAdmin),
      remaining: 0,
      limit: 0,
      unlimited: true,
    }
  }

  const limit = usage.limit ?? uiMonthlyAllowance(userPlan, isAdmin)
  const remaining =
    usage.remaining ??
    Math.max(0, limit - (usage.used ?? 0))

  return {
    planLabel: uiPlanDisplayName(userPlan, isAdmin),
    remaining,
    limit: limit || MAX_FREE_CREDITS,
    unlimited: false,
  }
}

export function formatUiCreditBalance(snapshot: UiCreditSnapshot): string {
  if (snapshot.unlimited) return UNLIMITED_CREDITS_LABEL
  return `${formatCreditAmount(snapshot.remaining)} / ${formatCreditAmount(snapshot.limit)}`
}

export function formatUiCreditAllowance(plan: PlanId, isAdmin = false): string {
  if (isAdmin) return UNLIMITED_CREDITS_LABEL
  return `${formatCreditAmount(uiMonthlyAllowance(plan, isAdmin))} Credits / Monat`
}
