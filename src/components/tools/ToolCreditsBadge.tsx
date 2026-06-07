import { CreditIcon } from '@/components/ui/icons'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import { formatUiCreditBalance, getUiCreditSnapshot } from '@/lib/credits/display'
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
  const creditSnapshot = getUiCreditSnapshot(userPlan, usage, isAdmin)

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-zinc-800/60 bg-zinc-950/60 px-3 py-1.5 text-xs',
        className,
      )}
    >
      <CreditIcon className="size-3.5 text-violet-400/80" aria-hidden />
      <span className="text-zinc-400">
        {creditSnapshot.planLabel} ·{' '}
        <span className="font-semibold text-violet-300">
          {formatUiCreditBalance(creditSnapshot)}
        </span>
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
