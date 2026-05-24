import { CrownIcon, SparklesIcon } from '@/components/ui/icons'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import { formatUsageResetDate, MAX_FREE_CREDITS } from '@/lib/usage'
import { PRO_PRICE_LABEL } from '@/lib'

export function UsageLimitWarning() {
  const { usage, openStripeCheckout } = useUsageLimit()

  return (
    <div className="flex justify-center py-4 sm:py-6">
      <article className="relative w-full max-w-md overflow-hidden rounded-2xl border border-fuchsia-500/30 bg-gradient-to-br from-violet-950/90 to-fuchsia-950/40 px-6 py-8 text-center shadow-[0_0_40px_-8px_rgba(217,70,239,0.35)]">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-fuchsia-500/10 to-transparent"
          aria-hidden
        />

        <div className="relative mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10 text-violet-300">
          <SparklesIcon className="size-7" aria-hidden />
        </div>

        <h3 className="relative text-lg font-semibold tracking-tight text-white">
          Credits aufgebraucht
        </h3>
        <p className="relative mt-3 text-sm leading-relaxed text-zinc-400">
          Du hast alle verfügbaren Free Credits verbraucht (max.{' '}
          <strong className="font-semibold text-fuchsia-300">
            {usage.limit ?? MAX_FREE_CREDITS}
          </strong>
          ).
          {usage.usageResetDate && (
            <>
              {' '}
              Nächste wöchentliche Aufladung (+5 Credits) am{' '}
              <strong className="text-zinc-300">
                {formatUsageResetDate(usage.usageResetDate)}
              </strong>
              .
            </>
          )}
        </p>

        <button
          type="button"
          onClick={() => void openStripeCheckout()}
          className="relative mt-5 w-full rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-fuchsia-900/40 transition-smooth hover:from-fuchsia-500 hover:to-violet-500 hover:shadow-[0_0_24px_rgba(217,70,239,0.45)]"
        >
          <span className="inline-flex items-center justify-center gap-2">
            <CrownIcon className="size-4" aria-hidden />
            Pro-Abo · {PRO_PRICE_LABEL}
          </span>
        </button>
      </article>
    </div>
  )
}
