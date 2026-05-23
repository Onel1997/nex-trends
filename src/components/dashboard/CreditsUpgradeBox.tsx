import { LockIcon } from '@/components/ui/icons'
import { STRIPE_CHECKOUT_URL } from '@/lib'

export function CreditsUpgradeBox() {
  return (
    <div className="flex justify-center py-4 sm:py-6">
      <article className="relative w-full max-w-md overflow-hidden rounded-2xl border border-violet-500/30 bg-zinc-950 px-6 py-8 text-center shadow-[0_0_40px_-8px_rgba(139,92,246,0.35)]">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-600/5 to-transparent"
          aria-hidden
        />

        <div className="relative mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border border-violet-500/25 bg-violet-500/10 text-violet-300 shadow-[0_0_24px_-4px_rgba(139,92,246,0.4)]">
          <LockIcon className="size-7" aria-hidden />
        </div>

        <h3 className="relative text-lg font-semibold tracking-tight text-white">
          Kostenlose Limits erreicht
        </h3>
        <p className="relative mt-3 text-sm leading-relaxed text-zinc-400">
          Schalte unbegrenzte Generierungen, alle Premium-Tools und priorisierten
          KI-Zugriff frei.
        </p>

        <button
          type="button"
          onClick={() => window.open(STRIPE_CHECKOUT_URL, '_blank')}
          className="relative mt-6 w-full rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-900/40 transition-all duration-300 hover:from-fuchsia-500 hover:to-purple-500 hover:shadow-[0_0_24px_rgba(217,70,239,0.45)]"
        >
          Jetzt auf Pro upgraden (9,99 €) ✨
        </button>
      </article>
    </div>
  )
}
