import type { ReactNode } from 'react'
import { SparklesIcon } from '@/components/ui/icons'
import { cn } from '@/lib'

type EmptyStateProps = {
  title: string
  description: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-14 text-center',
        className,
      )}
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/80 text-zinc-500">
        {icon ?? <SparklesIcon className="size-6" aria-hidden />}
      </div>
      <h3 className="text-base font-semibold text-zinc-200">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
