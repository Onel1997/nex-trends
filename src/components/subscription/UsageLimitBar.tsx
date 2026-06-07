import { CreditIcon } from '@/components/ui/icons'
import { CreditsProgressBar } from '@/components/ui/CreditsProgressBar'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import { formatUiCreditBalance, getUiCreditSnapshot } from '@/lib/credits/display'
import { formatUsageResetDate } from '@/lib/usage'
import { cn } from '@/lib'

type UsageLimitBarProps = {
  className?: string
  compact?: boolean
}

export function UsageLimitBar({ className, compact = false }: UsageLimitBarProps) {
  const { usage, isAdmin, userPlan } = useUsageLimit()
  const creditSnapshot = getUiCreditSnapshot(userPlan, usage, isAdmin)
  const { planLabel, remaining, limit, unlimited } = creditSnapshot

  const isDepleted = !unlimited && remaining <= 0
  const isLow = !unlimited && remaining > 0 && remaining <= 3

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-4 transition-all duration-300',
        isDepleted
          ? 'border-fuchsia-500/35 bg-gradient-to-br from-violet-950/90 to-fuchsia-950/50 shadow-[0_0_28px_-8px_rgba(217,70,239,0.4)]'
          : isLow
            ? 'border-violet-500/30 bg-gradient-to-br from-violet-950/70 to-zinc-950/80 shadow-[0_0_20px_-10px_rgba(139,92,246,0.45)]'
            : 'border-violet-500/20 bg-gradient-to-br from-violet-950/60 to-zinc-950/90 shadow-[0_0_20px_-12px_rgba(139,92,246,0.3)]',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-violet-600/15 blur-2xl"
        aria-hidden
      />

      <div className="relative flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-violet-500/15 ring-1 ring-violet-500/25">
            <CreditIcon className="size-4 text-violet-300" aria-hidden />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-violet-300/90">
            Credits
          </span>
        </div>
        <span className="text-sm font-bold text-white">
          {formatUiCreditBalance(creditSnapshot)}
        </span>
      </div>

      {!unlimited && (
        <CreditsProgressBar
          className="relative mt-3"
          remaining={remaining}
          limit={limit}
          size={compact ? 'sm' : 'md'}
        />
      )}

      {!compact && (
        <p className="relative mt-2.5 text-[11px] leading-relaxed text-zinc-400">
          {unlimited ? (
            <span className="text-violet-300/90">Unlimited Credits — keine Limits.</span>
          ) : isDepleted ? (
            <span className="text-fuchsia-300/90">
              Keine Credits mehr — upgrade für mehr monatliches Kontingent.
            </span>
          ) : isLow ? (
            <span className="text-amber-300/90">
              Wenige Credits übrig — jede Aktion kostet Credits.
            </span>
          ) : (
            <>
              <span className="text-zinc-300">{planLabel}</span> ·{' '}
              {formatUiCreditBalance(creditSnapshot)} verfügbar
              {usage.usageResetDate && (
                <> · Nächste Aufladung {formatUsageResetDate(usage.usageResetDate)}</>
              )}
            </>
          )}
        </p>
      )}
    </div>
  )
}

/** @alias UsageLimitBar */
export const CreditsCard = UsageLimitBar
