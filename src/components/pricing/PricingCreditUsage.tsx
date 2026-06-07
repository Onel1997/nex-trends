import { CreditIcon } from '@/components/ui/icons'
import { SIGNUP_CREDITS } from '@/lib/constants'
import { CREDIT_USAGE_ITEMS } from '@/lib/pricing'
import { cn } from '@/lib'

export function PricingCreditUsage() {
  return (
    <section className="pricing-credits dashboard-os-card rounded-[var(--dash-radius-lg)] border border-zinc-800/50 bg-zinc-950/60 p-3.5 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-violet-400">
            Credit-System
          </p>
          <h3 className="mt-1 text-base font-semibold tracking-tight text-white sm:text-lg">
            So funktionieren Credits
          </h3>
          <p className="dashboard-os-muted mt-1 max-w-xl text-[11px] leading-relaxed sm:text-xs">
            Jede KI-Aktion verbraucht Credits. Free enthält {SIGNUP_CREDITS} Credits pro
            Monat. Bezahlpläne schalten höhere monatliche Kontingente frei — bis zu 20.000 Credits / Monat im Agency-Plan.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-[var(--dash-radius)] border border-violet-500/20 bg-violet-500/10 px-3 py-2">
          <CreditIcon className="size-5 text-violet-400" aria-hidden />
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
              Free-Tier
            </p>
            <p className="text-sm font-semibold text-white">
              {SIGNUP_CREDITS} / Monat
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:mt-4 sm:grid-cols-2 lg:grid-cols-4">
        {CREDIT_USAGE_ITEMS.map((item) => (
          <div
            key={item.tool}
            className={cn(
              'rounded-[var(--dash-radius)] border border-zinc-800/45 bg-zinc-900/40 px-3 py-2.5',
              'transition-colors duration-200 hover:border-violet-500/25 hover:bg-zinc-900/70',
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold text-zinc-200">{item.tool}</p>
              <span className="rounded-full border border-violet-500/25 bg-violet-500/10 px-2 py-px text-[10px] font-bold text-violet-300">
                {item.cost} {item.cost === 1 ? 'Credit' : 'Credits'}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-zinc-500">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
