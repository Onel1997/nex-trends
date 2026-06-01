import { LANDING_FEATURES } from '@/lib/landing'
import { LandingReveal } from '@/components/landing/LandingReveal'
import { LandingSection } from '@/components/landing/LandingSection'
import { LandingSectionHeader } from '@/components/landing/LandingSectionHeader'
import { cn } from '@/lib'

export function LandingFeatures() {
  const featured = LANDING_FEATURES.find((f) => f.featured)
  const others = LANDING_FEATURES.filter((f) => !f.featured)

  return (
    <LandingSection id="features" glow="center" ariaLabelledBy="features-heading">
      <LandingReveal>
        <LandingSectionHeader
          eyebrow="Creator OS"
          title="Alles in einem Creator OS."
          titleAccent="Kein Tool-Chaos mehr."
          description="Trend Intelligence, Content-Generierung, CRO und Video-Produktion — modular, aber nahtlos verbunden."
        />
      </LandingReveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-12 lg:gap-5">
          {featured && (
            <FeatureCard
              feature={featured}
              className="lg:col-span-5 lg:row-span-2"
              large
            />
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-2">
            {others.slice(0, 4).map((feature, index) => (
              <FeatureCard
                key={feature.id}
                feature={feature}
                className={cn('landing-fade-in', index % 2 === 0 ? 'landing-fade-in--1' : 'landing-fade-in--2')}
              />
            ))}
          </div>

          {others.slice(4).map((feature) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              className="lg:col-span-12"
              wide
            />
          ))}
        </div>
    </LandingSection>
  )
}

function FeatureCard({
  feature,
  className,
  large = false,
  wide = false,
}: {
  feature: (typeof LANDING_FEATURES)[number]
  className?: string
  large?: boolean
  wide?: boolean
}) {
  const { Icon, title, description, benefit, status, premium } = feature

  return (
    <article
      className={cn(
        'landing-feature-card landing-glass-card group relative overflow-hidden rounded-2xl transition-all duration-500',
        'hover:-translate-y-1 hover:shadow-[0_24px_64px_-28px_rgba(0,0,0,0.7)]',
        premium
          ? 'border-cyan-500/15 bg-gradient-to-br from-cyan-950/25 via-zinc-950/80 to-zinc-950/90 hover:border-cyan-500/30 hover:shadow-[0_24px_64px_-24px_rgba(34,211,238,0.2)]'
          : 'border-white/[0.06] bg-zinc-950/50 hover:border-violet-500/25 hover:shadow-[0_24px_64px_-24px_rgba(139,92,246,0.18)]',
        large ? 'p-6 sm:p-8' : wide ? 'p-5 sm:p-6' : 'p-5 sm:p-6',
        className,
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute -right-12 -top-12 size-40 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-100',
          premium ? 'bg-cyan-600/10 opacity-50' : 'bg-violet-600/8 opacity-0',
        )}
        aria-hidden
      />

      <div className={cn('relative', wide && 'flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6')}>
        <div className={cn('flex items-start justify-between gap-3', wide && 'sm:shrink-0 sm:flex-col sm:items-start')}>
          <div
            className={cn(
              'inline-flex items-center justify-center rounded-xl ring-1 transition-all duration-300',
              premium
                ? 'size-12 bg-cyan-500/12 text-cyan-400 ring-cyan-500/20 group-hover:bg-cyan-500/16'
                : 'size-11 bg-violet-500/10 text-violet-400 ring-violet-500/15 group-hover:bg-violet-500/14',
              large && 'size-14',
            )}
          >
            <Icon className={cn(large ? 'size-7' : 'size-5')} aria-hidden />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {status && (
              <span
                className={cn(
                  'rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider',
                  premium
                    ? 'border-cyan-500/25 bg-cyan-500/[0.08] text-cyan-300'
                    : 'border-zinc-700/50 bg-zinc-900/50 text-zinc-400',
                )}
              >
                {status}
              </span>
            )}
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider',
                premium
                  ? 'border-cyan-500/20 bg-cyan-500/[0.08] text-cyan-200'
                  : 'border-emerald-500/15 bg-emerald-500/[0.08] text-emerald-400/90',
              )}
            >
              {benefit}
            </span>
          </div>
        </div>

        <div className={wide ? 'min-w-0 flex-1' : undefined}>
          <h3
            id={large ? 'features-heading' : undefined}
            className={cn(
              'font-semibold tracking-tight text-white transition-colors group-hover:text-violet-50',
              large ? 'text-xl sm:text-2xl' : wide ? 'text-lg sm:text-xl' : 'text-base sm:text-lg',
            )}
          >
            {title}
          </h3>
          <p
            className={cn(
              'mt-2 leading-relaxed text-zinc-500 transition-colors group-hover:text-zinc-400',
              large ? 'text-sm sm:text-base' : 'text-sm',
            )}
          >
            {description}
          </p>
        </div>
      </div>
    </article>
  )
}
