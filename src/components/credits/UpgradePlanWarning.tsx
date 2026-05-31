import { CrownIcon } from '@/components/ui/icons'
import { useCredits } from '@/hooks/useCredits'
import { PLAN_LABELS, planMonthlyCredits } from '@/lib/plans'
import { cn } from '@/lib'

type UpgradePlanWarningProps = {
  className?: string
  /** Suggested upgrade tier label */
  suggestedPlan?: 'creator' | 'pro_creator' | 'studio' | 'agency'
  dismissible?: boolean
}

export function UpgradePlanWarning({
  className,
  suggestedPlan = 'creator',
}: UpgradePlanWarningProps) {
  const { depleted, low, unlimited, openUpgradeModal, userPlan, remaining, limit } =
    useCredits()

  if (unlimited || (!depleted && !low)) {
    return null
  }

  const suggestedCredits = planMonthlyCredits(suggestedPlan)
  const title = depleted ? 'Out of credits' : 'Credits running low'
  const description = depleted
    ? `You've used your ${PLAN_LABELS[userPlan]} monthly allowance (${limit ?? '—'} credits). Upgrade to ${PLAN_LABELS[suggestedPlan]} for ${suggestedCredits?.toLocaleString('de-DE') ?? 'more'} credits per month.`
    : `Only ${remaining ?? 0} credits left. Upgrade before your next generation fails.`

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between',
        depleted
          ? 'border-fuchsia-500/35 bg-gradient-to-br from-violet-950/80 to-fuchsia-950/40'
          : 'border-amber-500/30 bg-amber-950/20',
        className,
      )}
    >
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-sm font-semibold text-white">
          <CrownIcon className="size-4 shrink-0 text-violet-300" aria-hidden />
          {title}
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => void openUpgradeModal()}
        className="nex-btn nex-btn--primary shrink-0 rounded-[8px] px-4 py-2 text-[11px] font-semibold uppercase tracking-wide"
      >
        Upgrade plan
      </button>
    </div>
  )
}
