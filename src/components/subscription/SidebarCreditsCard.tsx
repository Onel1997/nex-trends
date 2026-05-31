import { CrownIcon } from '@/components/ui/icons'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import { PLAN_LABELS } from '@/lib/plans'
import { MAX_FREE_CREDITS } from '@/lib/usage'
import { cn } from '@/lib'

type SidebarCreditsCardProps = {
  onUpgrade?: () => void
  className?: string
}

export function SidebarCreditsCard({ onUpgrade, className }: SidebarCreditsCardProps) {
  const { usage, userPlan, isAdmin } = useUsageLimit()

  const planLabel = isAdmin
    ? 'Admin'
    : usage.unlimited
      ? 'Unbegrenzt'
      : (PLAN_LABELS[userPlan] ?? 'Free')
  const unlimited = usage.unlimited
  const limit = usage.limit ?? MAX_FREE_CREDITS
  const remaining = unlimited ? '∞' : String(usage.remaining ?? 0)
  const showUpgrade = userPlan === 'free' && onUpgrade

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-violet-500/15 bg-zinc-900/50 px-3 py-2.5 backdrop-blur-md',
        'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-6 top-1/2 size-16 -translate-y-1/2 rounded-full bg-violet-600/10 blur-xl"
        aria-hidden
      />

      <div className="relative flex items-center gap-2.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Credits
            </span>
            <span className="text-sm font-bold tabular-nums tracking-tight text-white">
              {remaining}
            </span>
            {!unlimited && (
              <span className="text-[11px] font-medium text-zinc-600">/ {limit}</span>
            )}
          </div>
          <p className="mt-0.5 text-[11px] font-medium text-zinc-500">
            Plan ·{' '}
            <span
              className={cn(
                userPlan !== 'free' || isAdmin
                  ? 'text-violet-300'
                  : 'text-zinc-400',
              )}
            >
              {planLabel}
            </span>
          </p>
        </div>

        {showUpgrade ? (
          <button
            type="button"
            onClick={() => void onUpgrade()}
            className={cn(
              'shrink-0 rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white',
              'bg-gradient-to-r from-violet-600 to-fuchsia-600',
              'shadow-[0_0_16px_-4px_rgba(139,92,246,0.65)]',
              'transition-smooth hover:brightness-110 active:scale-[0.97]',
            )}
          >
            <span className="flex items-center gap-1">
              <CrownIcon className="size-3" aria-hidden />
              Upgrade
            </span>
          </button>
        ) : (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 ring-1 ring-violet-500/20">
            <CrownIcon className="size-3.5 text-violet-400" aria-hidden />
          </span>
        )}
      </div>
    </div>
  )
}
