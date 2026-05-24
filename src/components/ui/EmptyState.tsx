import type { ReactNode } from 'react'
import { SparklesIcon } from '@/components/ui/icons'
import { cn } from '@/lib'

type EmptyStateProps = {
  title: string
  description: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
  size?: 'default' | 'compact'
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  size = 'default',
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800/80 bg-zinc-900/20 text-center backdrop-blur-sm',
        size === 'default' ? 'px-6 py-16' : 'px-4 py-10',
        className,
      )}
    >
      <div
        className={cn(
          'mb-4 flex items-center justify-center rounded-2xl border border-zinc-800/60 bg-zinc-950/80 text-zinc-500 shadow-inner shadow-black/20',
          size === 'default' ? 'size-14' : 'size-11',
        )}
      >
        {icon ?? <SparklesIcon className={size === 'default' ? 'size-6' : 'size-5'} aria-hidden />}
      </div>
      <h3 className="text-base font-semibold tracking-tight text-zinc-200">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
