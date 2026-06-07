import { CreditIcon } from '@/components/ui/icons'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import { formatCreditAmount, getUiCreditSnapshot } from '@/lib/credits/display'
import { cn } from '@/lib'

type ToolCreditsBadgeProps = {
  creditCost?: number
  costLabel?: string
  className?: string
}

export function ToolCreditsBadge({
  creditCost,
  costLabel = 'pro Generierung',
  className,
}: ToolCreditsBadgeProps) {
  const { userPlan, isAdmin, usage } = useUsageLimit()
  const { planLabel, remaining, limit } = getUiCreditSnapshot(userPlan, usage, isAdmin)

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-zinc-800/60 bg-zinc-950/60 px-3 py-1.5 text-xs',
        className,
      )}
    >
      <CreditIcon className="size-3.5 text-violet-400/80" aria-hidden />
      <span className="text-zinc-400">
        {planLabel} ·{' '}
        <span className="font-semibold tabular-nums text-violet-300">
          {formatCreditAmount(remaining)}
        </span>
        <span className="text-zinc-600"> / {formatCreditAmount(limit)}</span> Credits
        {creditCost != null && (
          <>
            {' '}
            · {creditCost} {costLabel}
          </>
        )}
      </span>
    </div>
  )
}
