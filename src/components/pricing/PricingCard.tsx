import { Button } from '@/components/ui/Button'
import { CrownIcon } from '@/components/ui/icons'
import {
  formatPlanPrice,
  type BillingPeriod,
  type PlanAccent,
  type PlanTierId,
  type PricingPlan,
} from '@/lib/pricing'
import { cn } from '@/lib'

const ACCENT_STYLES: Record<
  PlanAccent,
  { border: string; glow: string; badge: string; dot: string }
> = {
  zinc: {
    border: 'border-zinc-800/70 hover:border-zinc-700/80',
    glow: '',
    badge: 'bg-zinc-800 text-zinc-400',
    dot: 'bg-zinc-500',
  },
  violet: {
    border: 'border-violet-500/30 hover:border-violet-500/50',
    glow: 'hover:shadow-[0_0_48px_-12px_rgba(139,92,246,0.35)]',
    badge: 'bg-violet-500/20 text-violet-300',
    dot: 'bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.55)]',
  },
  fuchsia: {
    border: 'border-fuchsia-500/45 hover:border-fuchsia-400/60',
    glow: 'shadow-[0_0_56px_-14px_rgba(217,70,239,0.45)] hover:shadow-[0_0_64px_-12px_rgba(217,70,239,0.55)]',
    badge: 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white',
    dot: 'bg-fuchsia-400 shadow-[0_0_10px_rgba(217,70,239,0.65)]',
  },
  emerald: {
    border: 'border-emerald-500/30 hover:border-emerald-500/45',
    glow: 'hover:shadow-[0_0_48px_-12px_rgba(52,211,153,0.3)]',
    badge: 'bg-emerald-500/15 text-emerald-300',
    dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.55)]',
  },
  cyan: {
    border: 'border-cyan-500/30 hover:border-cyan-500/45',
    glow: 'hover:shadow-[0_0_48px_-12px_rgba(34,211,238,0.3)]',
    badge: 'bg-cyan-500/15 text-cyan-300',
    dot: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.55)]',
  },
  amber: {
    border: 'border-amber-500/35 hover:border-amber-400/50',
    glow: 'shadow-[0_0_48px_-14px_rgba(245,158,11,0.35)] hover:shadow-[0_0_56px_-12px_rgba(245,158,11,0.45)]',
    badge: 'bg-gradient-to-r from-amber-500/30 to-orange-600/30 text-amber-200',
    dot: 'bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.6)]',
  },
}

type PricingCardProps = {
  plan: PricingPlan
  period: BillingPeriod
  currentPlanId: PlanTierId
  isAdmin: boolean
  onSelect: (planId: PlanTierId) => void
  className?: string
}

export function PricingCard({
  plan,
  period,
  currentPlanId,
  isAdmin,
  onSelect,
  className,
}: PricingCardProps) {
  const styles = ACCENT_STYLES[plan.accent]
  const { amount, suffix, savings } = formatPlanPrice(plan, period)
  const isCurrent = currentPlanId === plan.id
  const isAdminCard = plan.id === 'admin'
  const showCard = !plan.internalOnly || isAdmin

  if (!showCard) return null

  const disabled =
    isCurrent || (plan.id === 'free' && currentPlanId !== 'free') || (isAdminCard && isAdmin)

  const ctaLabel = isCurrent
    ? 'Aktueller Plan'
    : plan.id === 'free'
      ? 'Enthalten'
      : plan.cta

  return (
    <article
      className={cn(
        'pricing-card nex-card-interactive group relative flex h-full flex-col rounded-[var(--dash-radius-lg)] border bg-zinc-950/70 p-3.5 backdrop-blur-xl sm:p-5',
        styles.border,
        styles.glow,
        plan.featured &&
          'pricing-card--featured pricing-card--popular dashboard-os-card--featured z-[1]',
        isAdminCard && 'pricing-card--admin',
        className,
      )}
    >
      {plan.badge && (
        <span
          className={cn(
            'absolute -top-2.5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] shadow-lg',
            styles.badge,
            plan.featured && 'shadow-fuchsia-900/40',
          )}
        >
          {plan.badge}
        </span>
      )}

      <div
        className="pricing-card__mesh pointer-events-none absolute inset-0 rounded-[inherit] opacity-60"
        aria-hidden
      />

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p
              className={cn(
                'text-[10px] font-semibold uppercase tracking-[0.14em]',
                plan.accent === 'amber'
                  ? 'text-amber-400'
                  : plan.featured
                    ? 'text-fuchsia-400'
                    : 'text-zinc-500',
              )}
            >
              {plan.name}
            </p>
            <p className="mt-2 flex flex-wrap items-baseline gap-x-1 gap-y-0">
              <span
                className={cn(
                  'text-2xl font-bold tracking-tight sm:text-3xl',
                  isAdminCard ? 'text-amber-100' : 'text-white',
                )}
              >
                {amount}
              </span>
              {suffix && (
                <span className="text-[11px] text-zinc-500">{suffix}</span>
              )}
            </p>
          </div>
          {isAdminCard && (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10 text-amber-300">
              <CrownIcon className="size-4" aria-hidden />
            </div>
          )}
        </div>

        {savings && (
          <p className="mt-1 text-[10px] font-medium text-emerald-400/90">{savings}</p>
        )}

        <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">{plan.tagline}</p>

        <ul className="mt-4 flex-1 space-y-2">
          {plan.features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2 text-[11px] text-zinc-300"
            >
              <span
                className={cn('mt-1.5 size-1.5 shrink-0 rounded-full', styles.dot)}
                aria-hidden
              />
              {feature}
            </li>
          ))}
        </ul>

        <Button
          variant={
            plan.featured ? 'pro' : plan.contactOnly ? 'secondary' : 'primary'
          }
          size="md"
          fullWidth
          disabled={disabled}
          className={cn(
            'mt-6 shrink-0 sm:mt-auto',
            isAdminCard &&
              'border-amber-500/30 bg-gradient-to-r from-amber-600/80 to-orange-600/80 hover:brightness-110',
            isCurrent && 'opacity-70',
          )}
          onClick={() => onSelect(plan.id)}
        >
          {ctaLabel}
        </Button>
      </div>
    </article>
  )
}
