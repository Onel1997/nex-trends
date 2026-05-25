import { CreditIcon, CrownIcon } from '@/components/ui/icons'
import { CreditsProgressBar } from '@/components/ui/CreditsProgressBar'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import { formatUsageResetDate, MAX_FREE_CREDITS } from '@/lib/usage'
import { cn } from '@/lib'

type UsageLimitBarProps = {
  className?: string
  compact?: boolean
}

export function UsageLimitBar({ className, compact = false }: UsageLimitBarProps) {
  const { usage, hasProAccess, isAdmin } = useUsageLimit()

  if (hasProAccess || usage.unlimited) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/80 to-fuchsia-950/40 p-4',
          'shadow-[0_0_24px_-6px_rgba(139,92,246,0.35)]',
          className,
        )}
      >
        <div
          className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-fuchsia-500/20 blur-2xl"
          aria-hidden
        />
        <div className="relative flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-violet-500/20 ring-1 ring-violet-400/30">
              <CrownIcon className="size-4 text-violet-200" aria-hidden />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-violet-200">
              Credits
            </span>
          </div>
          <span className="text-sm font-bold text-white">
            ∞ {isAdmin ? 'Admin' : 'Pro'}
          </span>
        </div>
        {!compact && (
          <p className="relative mt-2 text-[11px] text-violet-300/90">
            {isAdmin
              ? 'Admin-Zugang — unbegrenzte Credits, alle Tools freigeschaltet.'
              : 'Unbegrenzte Credits — alle Tools freigeschaltet.'}
          </p>
        )}
      </div>
    )
  }

  const limit = usage.limit ?? MAX_FREE_CREDITS
  const remaining = usage.remaining ?? 0
  const isDepleted = remaining <= 0
  const isLow = remaining > 0 && remaining <= 3

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
        <span className="text-sm font-bold tabular-nums text-white">
          {remaining}
          <span className="font-medium text-violet-400/80"> / {limit}</span>
        </span>
      </div>

      <CreditsProgressBar
        className="relative mt-3"
        remaining={remaining}
        limit={limit}
        size={compact ? 'sm' : 'md'}
      />

      {!compact && (
        <p className="relative mt-2.5 text-[11px] leading-relaxed text-zinc-400">
          {isDepleted ? (
            <span className="text-fuchsia-300/90">
              Keine Credits mehr — upgrade für unbegrenzten Zugriff.
            </span>
          ) : isLow ? (
            <span className="text-amber-300/90">
              Wenige Credits übrig — jede Aktion kostet 1 Credit.
            </span>
          ) : (
            <>
              <span className="text-zinc-300">{remaining} Credit{remaining === 1 ? '' : 's'}</span>{' '}
              verfügbar · +5 wöchentlich (max. {limit}).
              {usage.usageResetDate && (
                <> Nächste Aufladung {formatUsageResetDate(usage.usageResetDate)}.</>
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
