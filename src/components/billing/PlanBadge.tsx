import { PLAN_BADGE_CLASSES, PLAN_LABELS, type PlanId } from '@/lib/plans'
import { cn } from '@/lib'

type PlanBadgeProps = {
  plan: PlanId
  className?: string
}

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        PLAN_BADGE_CLASSES[plan],
        className,
      )}
    >
      {PLAN_LABELS[plan]}
    </span>
  )
}
