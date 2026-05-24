import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { CrownIcon, LockIcon } from '@/components/ui/icons'
import { PRO_PRICE_LABEL } from '@/lib'
import { PRO_FEATURES } from '@/lib/landing'
import { useSubscription } from '@/hooks/useSubscription'
import { cn } from '@/lib'

export function UpgradeModal() {
  const {
    isUpgradeModalOpen,
    closeUpgradeModal,
    openStripeCheckout,
    isProfileLoading,
  } = useSubscription()

  useEffect(() => {
    if (!isUpgradeModalOpen) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeUpgradeModal()
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [isUpgradeModalOpen, closeUpgradeModal])

  if (!isUpgradeModalOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
    >
      <button
        type="button"
        aria-label="Modal schließen"
        className="absolute inset-0 bg-black/75 backdrop-blur-md animate-fade-in"
        onClick={closeUpgradeModal}
      />

      <article
        className={cn(
          'relative w-full max-w-md overflow-hidden rounded-2xl border border-violet-500/25 bg-zinc-950/95 shadow-[0_0_60px_-10px_rgba(139,92,246,0.4)] backdrop-blur-xl',
          'animate-fade-in-scale',
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-600/10 via-transparent to-fuchsia-600/5"
          aria-hidden
        />

        <div className="relative p-6 sm:p-8">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/10">
            <CrownIcon className="size-7" aria-hidden />
          </div>

          <h2
            id="upgrade-modal-title"
            className="text-center text-xl font-semibold tracking-tight text-white"
          >
            NexTrends Pro freischalten
          </h2>
          <p className="mt-2.5 text-center text-sm leading-relaxed text-zinc-400">
            Alle Premium-KI-Tools, unbegrenzte Generierungen und priorisierter
            Zugriff — nur mit aktivem Pro-Abo.
          </p>

          <ul className="mt-6 space-y-3">
            {PRO_FEATURES.slice(0, 4).map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2.5 text-sm text-zinc-300"
              >
                <span
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-fuchsia-400"
                  aria-hidden
                />
                {feature}
              </li>
            ))}
          </ul>

          <Button
            variant="pro"
            size="lg"
            fullWidth
            loading={isProfileLoading}
            disabled={isProfileLoading}
            onClick={() => void openStripeCheckout()}
            className="mt-6"
          >
            Pro-Abo starten · {PRO_PRICE_LABEL}
          </Button>

          <button
            type="button"
            onClick={closeUpgradeModal}
            className="mt-3 w-full rounded-xl py-2.5 text-sm text-zinc-500 transition-smooth hover:text-zinc-300"
          >
            Später
          </button>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-zinc-600">
            <LockIcon className="size-3.5" aria-hidden />
            Sichere Zahlung über Stripe
          </p>
        </div>
      </article>
    </div>
  )
}
