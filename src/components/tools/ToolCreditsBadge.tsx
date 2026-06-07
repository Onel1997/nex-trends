import { useEffect, useRef, useState } from 'react'
import { CreditIcon } from '@/components/ui/icons'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import {
  formatCreditAmount,
  formatUiCreditBalance,
  getUiCreditSnapshot,
} from '@/lib/credits/display'
import { cn } from '@/lib'

type ToolCreditsBadgeProps = {
  creditCost?: number
  costLabel?: string
  className?: string
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

function AnimatedCreditNumber({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  const reducedMotion = usePrefersReducedMotion()
  const [display, setDisplay] = useState(value)
  const prevRef = useRef(value)

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(value)
      prevRef.current = value
      return
    }

    const start = prevRef.current
    if (start === value) return

    const diff = value - start
    const duration = 650
    const startTime = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      setDisplay(Math.round(start + diff * easeOutCubic(progress)))

      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        prevRef.current = value
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, reducedMotion])

  return (
    <span className={cn('tabular-nums transition-colors duration-300', className)}>
      {formatCreditAmount(display)}
    </span>
  )
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
          {creditSnapshot.unlimited ? (
            formatUiCreditBalance(creditSnapshot)
          ) : (
            <>
              <AnimatedCreditNumber value={creditSnapshot.remaining} /> /{' '}
              {formatCreditAmount(creditSnapshot.limit)}
            </>
          )}
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
