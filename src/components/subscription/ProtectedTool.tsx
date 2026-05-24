import type { ReactNode } from 'react'
import { CrownIcon, LockIcon } from '@/components/ui/icons'
import { SubscriptionLoading } from '@/components/subscription/SubscriptionLoading'
import { useSubscription } from '@/hooks/useSubscription'
import { cn } from '@/lib'

type ProtectedToolProps = {
  children: ReactNode
  title?: string
  className?: string
}

export function ProtectedTool({
  children,
  title = 'Premium-Tool',
  className,
}: ProtectedToolProps) {
  const { hasProAccess, isReady, openUpgradeModal } = useSubscription()

  if (!isReady) {
    return <SubscriptionLoading className={className} />
  }

  if (hasProAccess) {
    return <>{children}</>
  }

  return (
    <div className={cn('relative', className)}>
      <div
        className="pointer-events-none select-none blur-[6px] brightness-75"
        aria-hidden
      >
        {children}
      </div>

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-violet-500/30 bg-zinc-950/95 p-6 text-center shadow-2xl shadow-violet-900/30 backdrop-blur-md">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-300">
            <LockIcon className="size-6" aria-hidden />
          </div>

          <p className="text-xs font-semibold uppercase tracking-wider text-violet-400">
            Pro Vorschau
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Vorschau des Premium-Tools — upgrade für vollen Zugriff auf {title}.
          </p>

          <button
            type="button"
            onClick={openUpgradeModal}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition-all hover:from-violet-500 hover:to-fuchsia-500"
          >
            <CrownIcon className="size-4" aria-hidden />
            Jetzt upgraden
          </button>
        </div>
      </div>
    </div>
  )
}
