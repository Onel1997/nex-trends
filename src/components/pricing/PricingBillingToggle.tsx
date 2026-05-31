import type { BillingPeriod } from '@/lib/pricing'
import { YEARLY_DISCOUNT_PERCENT } from '@/lib/pricing'
import { cn } from '@/lib'

type PricingBillingToggleProps = {
  value: BillingPeriod
  onChange: (period: BillingPeriod) => void
  className?: string
}

export function PricingBillingToggle({
  value,
  onChange,
  className,
}: PricingBillingToggleProps) {
  return (
    <div
      className={cn('flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-3', className)}
      role="group"
      aria-label="Abrechnungszeitraum"
    >
      <div className="pricing-billing-toggle relative inline-flex rounded-full border border-zinc-800/80 bg-zinc-950/80 p-1 shadow-inner shadow-black/40">
        <span
          className={cn(
            'pricing-billing-toggle__indicator absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-900/40 transition-transform duration-300 ease-out',
            value === 'yearly' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0',
          )}
          aria-hidden
        />
        <button
          type="button"
          onClick={() => onChange('monthly')}
          className={cn(
            'relative z-10 min-w-[5.5rem] rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-200',
            value === 'monthly' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300',
          )}
          aria-pressed={value === 'monthly'}
        >
          Monatlich
        </button>
        <button
          type="button"
          onClick={() => onChange('yearly')}
          className={cn(
            'relative z-10 min-w-[5.5rem] rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-200',
            value === 'yearly' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300',
          )}
          aria-pressed={value === 'yearly'}
        >
          Jährlich
        </button>
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-300">
        <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" aria-hidden />
        {YEARLY_DISCOUNT_PERCENT} % sparen · jährlich
      </span>
    </div>
  )
}
