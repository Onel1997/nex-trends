import type { ReactNode } from 'react'
import { cn } from '@/lib'
import { SparklesIcon } from '@/components/ui/icons'

type TrendsEmptyStateProps = {
  title: string
  description: string
  action?: ReactNode
  variant?: 'search' | 'saved' | 'history'
  className?: string
}

function AiIllustration({ variant }: { variant: TrendsEmptyStateProps['variant'] }) {
  const colors =
    variant === 'saved'
      ? 'from-violet-500/20 to-fuchsia-500/10'
      : variant === 'history'
        ? 'from-zinc-500/15 to-violet-500/10'
        : 'from-violet-500/25 to-fuchsia-500/15'

  return (
    <div
      className={cn(
        'relative mb-6 flex size-20 items-center justify-center rounded-2xl border border-zinc-800/50 bg-gradient-to-br shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]',
        colors,
      )}
      aria-hidden
    >
      <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.15),transparent_50%)]" />
      <SparklesIcon className="relative size-8 text-violet-300/90" />
      <div className="absolute -right-1 -top-1 size-3 animate-pulse-soft rounded-full bg-violet-400/60" />
      <div className="absolute -bottom-0.5 -left-0.5 size-2 rounded-full bg-fuchsia-400/40" />
    </div>
  )
}

export function TrendsEmptyState({
  title,
  description,
  action,
  variant = 'search',
  className,
}: TrendsEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800/70',
        'bg-zinc-900/15 px-6 py-14 text-center backdrop-blur-sm',
        'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]',
        className,
      )}
    >
      <AiIllustration variant={variant} />
      <h3 className="text-base font-semibold tracking-tight text-zinc-100">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
