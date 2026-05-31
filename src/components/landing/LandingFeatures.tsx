import { LANDING_FEATURES } from '@/lib/landing'
import { LandingSectionHeader } from '@/components/landing/LandingSectionHeader'
import { cn } from '@/lib'

export function LandingFeatures() {
  const featured = LANDING_FEATURES.find((f) => f.featured)
  const others = LANDING_FEATURES.filter((f) => !f.featured)

  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="landing-section relative border-t border-white/[0.04] px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <LandingSectionHeader
          eyebrow="Features"
          title="Alles in einem Creator OS."
          titleAccent="Kein Tool-Chaos mehr."
          description="Trend Intelligence, Content-Generierung, CRO und Video-Produktion — modular, aber nahtlos verbunden."
        />

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
      </div>
    </section>
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
        'landing-feature-card group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1',
        premium
          ? 'border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-950/30 via-zinc-950/90 to-violet-950/20 hover:border-fuchsia-500/50 hover:shadow-[0_0_56px_-12px_rgba(217,70,239,0.4)]'
          : 'border-zinc-800/70 bg-zinc-950/70 hover:border-violet-500/35 hover:shadow-[0_0_48px_-12px_rgba(139,92,246,0.3)]',
        large ? 'p-6 sm:p-8' : wide ? 'p-5 sm:p-6' : 'p-5 sm:p-6',
        className,
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute -right-12 -top-12 size-40 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-100',
          premium ? 'bg-fuchsia-600/15 opacity-60' : 'bg-violet-600/12 opacity-0',
        )}
        aria-hidden
      />

      <div className={cn('relative', wide && 'flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6')}>
        <div className={cn('flex items-start justify-between gap-3', wide && 'sm:shrink-0 sm:flex-col sm:items-start')}>
          <div
            className={cn(
              'inline-flex items-center justify-center rounded-xl ring-1 transition-all duration-300',
              premium
                ? 'size-12 bg-fuchsia-500/15 text-fuchsia-400 ring-fuchsia-500/25 group-hover:bg-fuchsia-500/20'
                : 'size-11 bg-violet-500/12 text-violet-400 ring-violet-500/20 group-hover:bg-violet-500/18',
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
                    ? 'border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300'
                    : 'border-zinc-700/60 bg-zinc-900/60 text-zinc-400',
                )}
              >
                {status}
              </span>
            )}
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider',
                premium
                  ? 'border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-200'
                  : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
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
