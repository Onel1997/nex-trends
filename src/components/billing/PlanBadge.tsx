import { Badge } from '@/components/ui/Badge'
import { PLAN_LABELS, type PlanId } from '@/lib/plans'
import { cn } from '@/lib'

type PlanBadgeProps = {
  plan: PlanId
  className?: string
}

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  const variant =
    plan === 'founder'
      ? 'admin'
      : plan === 'pro_creator' || plan === 'studio' || plan === 'agency'
        ? 'pro'
        : plan === 'creator'
          ? 'default'
          : 'muted'

  return (
    <Badge variant={variant} className={cn('capitalize', className)}>
      {PLAN_LABELS[plan]}
    </Badge>
  )
}
