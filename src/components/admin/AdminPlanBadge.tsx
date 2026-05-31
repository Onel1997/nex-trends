import { PLAN_BADGE_CLASSES, planDisplayLabel, resolveAdminUserPlan } from '@/lib/plans'
import type { PlanId } from '@/lib/plans'
import { cn } from '@/lib'
import type { AdminUser } from '@/types/admin'

type AdminPlanBadgeProps = {
  user: Pick<AdminUser, 'plan' | 'is_pro'>
  className?: string
}

export function AdminPlanBadge({ user, className }: AdminPlanBadgeProps) {
  const plan = resolveAdminUserPlan(user)
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-widest',
        PLAN_BADGE_CLASSES[plan],
        className,
      )}
    >
      {planDisplayLabel(plan)}
    </span>
  )
}

export function AdminPlanBadgeById({ plan, className }: { plan: PlanId; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-widest',
        PLAN_BADGE_CLASSES[plan],
        className,
      )}
    >
      {planDisplayLabel(plan)}
    </span>
  )
}
