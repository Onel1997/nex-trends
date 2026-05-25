import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { CrownIcon, LockIcon } from '@/components/ui/icons'
import { usePlanAccess } from '@/hooks/usePlanAccess'
import { PLAN_LABELS } from '@/lib/plans'
import type { DashboardRouteId } from '@/lib/routes'
import { navigateToTool } from '@/lib/navigation'
import { cn } from '@/lib'

type ToolAccessGateProps = {
  routeId: DashboardRouteId
  children: ReactNode
  title?: string
  description?: string
  className?: string
}

export function ToolAccessGate({
  routeId,
  children,
  title = 'Premium feature',
  description,
  className,
}: ToolAccessGateProps) {
  const { canAccess, requestUpgrade, planLabel } = usePlanAccess()

  if (canAccess(routeId)) {
    return <>{children}</>
  }

  const requiredPlan = PLAN_LABELS[
    routeId === 'ai-studio' ? 'pro_creator' : 'creator'
  ]

  return (
    <div
      className={cn(
        'dashboard-os-card flex flex-col items-center justify-center rounded-[var(--dash-radius-lg)] border border-violet-500/20 bg-zinc-950/80 px-6 py-12 text-center',
        className,
      )}
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-violet-500/25 bg-violet-500/10 text-violet-300">
        <LockIcon className="size-7" aria-hidden />
      </div>
      <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
      <p className="dashboard-os-muted mt-2 max-w-md text-sm">
        {description ??
          `Your ${planLabel} plan does not include this module. Upgrade to ${requiredPlan} to unlock.`}
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-zinc-500">
        Current plan · {planLabel}
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button
          variant="pro"
          className="btn-glow-pro"
          onClick={() => requestUpgrade(routeId)}
        >
          <CrownIcon className="size-4" aria-hidden />
          Upgrade to {requiredPlan}
        </Button>
        <Button variant="secondary" onClick={() => navigateToTool('pricing')}>
          Compare plans
        </Button>
      </div>
    </div>
  )
}
