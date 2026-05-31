import { memo } from 'react'
import { Button } from '@/components/ui/Button'
import { useOnboarding, type OnboardingTipId } from '@/hooks/useOnboarding'
import { cn } from '@/lib'

type OnboardingTipProps = {
  tipId: OnboardingTipId
  title: string
  message: string
  action?: { label: string; onClick: () => void }
  className?: string
}

function OnboardingTipInner({
  tipId,
  title,
  message,
  action,
  className,
}: OnboardingTipProps) {
  const { isTipVisible, dismissTip } = useOnboarding()

  if (!isTipVisible(tipId)) return null

  return (
    <div
      className={cn(
        'nex-onboarding-tip animate-fade-in flex flex-col gap-3 rounded-2xl border border-violet-500/20 bg-violet-500/[0.06] px-4 py-3.5 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
      role="note"
    >
      <div className="min-w-0">
        <p className="text-xs font-semibold text-violet-200">{title}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-400 sm:text-xs">{message}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {action && (
          <Button variant="secondary" size="sm" className="btn-press" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
        <button
          type="button"
          onClick={() => dismissTip(tipId)}
          className="rounded-lg px-2 py-1 text-[11px] text-zinc-500 transition-smooth hover:bg-zinc-800/60 hover:text-zinc-300"
        >
          Verstanden
        </button>
      </div>
    </div>
  )
}

export const OnboardingTip = memo(OnboardingTipInner)
