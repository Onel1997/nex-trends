import { Card, CardBody } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { CreditIcon } from '@/components/ui/icons'
import { useDashboardData } from '@/hooks/useDashboardData'
import { MAX_FREE_CREDITS } from '@/lib/constants'

export function CreditsOverview() {
  const { usage, hasProAccess, remainingLabel, resetDateLabel } = useDashboardData()
  const limit = usage.limit ?? MAX_FREE_CREDITS
  const remaining = usage.remaining ?? 0

  return (
    <Card variant="glass" className="animate-fade-in glass-premium">
      <CardBody className="py-5">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-violet-500/10 ring-1 ring-violet-500/20">
            <CreditIcon className="size-5 text-violet-400" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
              Credits
            </p>
            <p className="mt-0.5 text-2xl font-semibold tracking-tight text-white">
              {remainingLabel}
            </p>
            {resetDateLabel && !hasProAccess && (
              <p className="mt-1 text-xs text-zinc-500">Reset {resetDateLabel}</p>
            )}
          </div>
        </div>
        {!hasProAccess && (
          <div className="mt-4">
            <ProgressBar
              value={remaining}
              max={limit}
              mode="remaining"
              label={`${remaining} von ${limit} Credits`}
            />
          </div>
        )}
      </CardBody>
    </Card>
  )
}
