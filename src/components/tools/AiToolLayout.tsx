import type { ReactNode } from 'react'
import { LowCreditBanner } from '@/components/subscription/LowCreditBanner'
import { CreditIcon, SparklesIcon } from '@/components/ui/icons'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import { MAX_FREE_CREDITS } from '@/lib/constants'
import { cn } from '@/lib'

type AiToolLayoutProps = {
  title: string
  description: string
  children: ReactNode
  className?: string
}

export function AiToolLayout({ title, description, children, className }: AiToolLayoutProps) {
  const { hasProAccess, isAdmin, isCreditsLow, usage } = useUsageLimit()
  const remaining = usage.remaining ?? 0
  const limit = usage.limit ?? MAX_FREE_CREDITS

  return (
    <div className={cn('mx-auto max-w-3xl animate-fade-in', className)}>
      <header className="mb-6 sm:mb-8">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-violet-400/90">
          <SparklesIcon className="size-3.5" aria-hidden />
          AI Marketing Tool
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">{description}</p>

        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-zinc-800/60 bg-zinc-950/60 px-3 py-1.5 text-xs">
          <CreditIcon className="size-3.5 text-violet-400/80" aria-hidden />
          {isAdmin ? (
            <span className="text-zinc-400">
              Admin · <span className="font-medium text-amber-300">unbegrenzt</span>
            </span>
          ) : hasProAccess ? (
            <span className="text-zinc-400">
              Pro · <span className="font-medium text-violet-300">unbegrenzt</span>
            </span>
          ) : (
            <span className="text-zinc-400">
              <span className="font-semibold tabular-nums text-violet-300">{remaining}</span>
              <span className="text-zinc-600"> / {limit}</span> Credits · 1 pro Generierung
            </span>
          )}
        </div>
      </header>

      {!hasProAccess && isCreditsLow && (
        <LowCreditBanner remaining={remaining} className="mb-5" />
      )}

      {children}
    </div>
  )
}
