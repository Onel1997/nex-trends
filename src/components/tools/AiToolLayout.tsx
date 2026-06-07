import type { ReactNode } from 'react'
import { LowCreditBanner } from '@/components/subscription/LowCreditBanner'
import { ToolCreditsBadge } from '@/components/tools/ToolCreditsBadge'
import { SparklesIcon } from '@/components/ui/icons'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import { getUiCreditSnapshot } from '@/lib/credits/display'
import { cn } from '@/lib'

type AiToolLayoutProps = {
  title: string
  description: string
  children: ReactNode
  className?: string
  creditCost?: number
  creditCostLabel?: string
}

export function AiToolLayout({
  title,
  description,
  children,
  className,
  creditCost = 1,
  creditCostLabel = 'pro Generierung',
}: AiToolLayoutProps) {
  const { hasProAccess, isAdmin, isCreditsLow, usage, userPlan } = useUsageLimit()
  const { remaining } = getUiCreditSnapshot(userPlan, usage, isAdmin)

  return (
    <div className={cn('mx-auto w-full min-w-0 max-w-3xl animate-fade-in', className)}>
      <header className="mb-6 sm:mb-8">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-violet-400/90">
          <SparklesIcon className="size-3.5" aria-hidden />
          AI Marketing Tool
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">{description}</p>

        <ToolCreditsBadge
          className="mt-4"
          creditCost={creditCost}
          costLabel={creditCostLabel}
        />
      </header>

      {!hasProAccess && isCreditsLow && (
        <LowCreditBanner
          remaining={remaining}
          creditCost={creditCost}
          className="mb-5"
        />
      )}

      {children}
    </div>
  )
}
