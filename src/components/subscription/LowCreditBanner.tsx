import { cn } from '@/lib'

type LowCreditBannerProps = {
  remaining: number
  creditCost?: number
  className?: string
}

export function LowCreditBanner({
  remaining,
  creditCost,
  className,
}: LowCreditBannerProps) {
  const costHint =
    creditCost != null
      ? `diese Aktion kostet ${creditCost} Credit${creditCost === 1 ? '' : 's'}`
      : 'jede Generierung verbraucht Credits'

  return (
    <div
      role="status"
      className={cn(
        'animate-fade-in rounded-xl border border-amber-500/20 bg-amber-950/20 px-4 py-3 text-sm text-amber-200/90',
        className,
      )}
    >
      Nur noch{' '}
      <span className="font-semibold text-amber-100">
        {remaining} Credit{remaining === 1 ? '' : 's'}
      </span>{' '}
      übrig — {costHint}.
    </div>
  )
}
