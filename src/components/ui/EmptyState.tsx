import type { ReactNode } from 'react'
import { SparklesIcon } from '@/components/ui/icons'
import { cn } from '@/lib'

type EmptyStateProps = {
  title: string
  description: string
  icon?: ReactNode
  illustration?: ReactNode
  action?: ReactNode
  className?: string
  size?: 'default' | 'compact'
  variant?: 'default' | 'premium'
}

export function EmptyState({
  title,
  description,
  icon,
  illustration,
  action,
  className,
  size = 'default',
  variant = 'default',
}: EmptyStateProps) {
  const isPremium = variant === 'premium'

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        isPremium
          ? 'rounded-2xl border border-violet-500/18 bg-gradient-to-b from-violet-500/[0.08] via-zinc-950/40 to-zinc-900/25 px-5 py-10 shadow-[0_0_60px_-24px_rgba(139,92,246,0.38)] backdrop-blur-md sm:rounded-3xl sm:px-8 sm:py-14'
          : 'rounded-2xl border border-dashed border-zinc-800/80 bg-zinc-900/20 backdrop-blur-sm',
        !isPremium && (size === 'default' ? 'px-6 py-16' : 'px-4 py-10'),
        className,
      )}
    >
      {illustration ? (
        <div className="mb-6 w-full max-w-[200px] animate-fade-in-scale">{illustration}</div>
      ) : (
        <div
          className={cn(
            'mb-4 flex items-center justify-center rounded-2xl border border-zinc-800/60 bg-zinc-950/80 text-zinc-500 shadow-inner shadow-black/20',
            isPremium && 'border-violet-500/20 bg-violet-500/5 shadow-[0_0_32px_-12px_rgba(139,92,246,0.4)]',
            size === 'default' ? 'size-14' : 'size-11',
          )}
        >
          {icon ?? (
            <SparklesIcon
              className={cn(
                isPremium ? 'text-violet-400/90' : 'text-zinc-500',
                size === 'default' ? 'size-6' : 'size-5',
              )}
              aria-hidden
            />
          )}
        </div>
      )}

      <h3
        className={cn(
          'font-semibold tracking-tight text-zinc-200',
          isPremium ? 'text-lg sm:text-xl' : 'text-base',
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          'mt-2 max-w-md leading-relaxed text-zinc-500',
          isPremium ? 'text-sm sm:text-base' : 'text-sm',
        )}
      >
        {description}
      </p>
      {action && <div className="mt-8 sm:mt-9">{action}</div>}
    </div>
  )
}
