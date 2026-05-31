import { memo } from 'react'
import { VerifiedIcon } from '@/components/ui/icons'
import { cn } from '@/lib'

type TrustIndicatorProps = {
  className?: string
  compact?: boolean
}

function TrustIndicatorInner({ className, compact = false }: TrustIndicatorProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-1 text-zinc-600',
        compact ? 'text-[10px]' : 'text-xs',
        className,
      )}
    >
      <span className="inline-flex items-center gap-1.5">
        <VerifiedIcon className="size-3.5 text-emerald-500/80" aria-hidden />
        SSL-verschlüsselt
      </span>
      <span className="hidden sm:inline">·</span>
      <span>Supabase Auth</span>
      <span className="hidden sm:inline">·</span>
      <span>Stripe Billing</span>
    </div>
  )
}

export const TrustIndicator = memo(TrustIndicatorInner)
