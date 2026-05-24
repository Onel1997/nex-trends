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
      className="border-t border-zinc-900 px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <LandingSectionHeader
          eyebrow="Features"
          title="Alles, was du brauchst."
          titleAccent="Nichts, was du nicht brauchst."
          description="Von Trend-Discovery bis Conversion-Optimierung — fünf KI-Tools in einem durchdachten Workflow für Social-Marketing."
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          {featured && (
            <FeatureCard feature={featured} className="lg:row-span-2 lg:flex lg:flex-col" large />
          )}

          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-1 lg:grid-cols-1">
            {others.slice(0, 2).map((feature, index) => (
              <FeatureCard
                key={feature.id}
                feature={feature}
                className={cn('animate-fade-in', index === 0 ? 'animation-delay-100' : 'animation-delay-200')}
              />
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {others.slice(2).map((feature, index) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              className={cn('animate-fade-in', index === 0 ? 'animation-delay-300' : 'animation-delay-400')}
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
}: {
  feature: (typeof LANDING_FEATURES)[number]
  className?: string
  large?: boolean
}) {
  const { Icon, title, description, benefit } = feature

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:bg-zinc-900/50 hover:shadow-xl hover:shadow-violet-950/20 sm:p-8',
        large && 'sm:p-10',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-violet-600/10 blur-2xl opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden
      />

      <div className="relative">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 text-violet-400 ring-1 ring-violet-500/20 transition-all duration-300 group-hover:from-violet-600/30 group-hover:to-fuchsia-600/30 group-hover:text-violet-300">
            <Icon className="size-6" aria-hidden />
          </div>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
            {benefit}
          </span>
        </div>

        <h3
          id={large ? 'features-heading' : undefined}
          className={cn(
            'font-semibold text-white transition-colors group-hover:text-violet-100',
            large ? 'text-xl sm:text-2xl' : 'text-lg',
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            'mt-2 leading-relaxed text-zinc-500 transition-colors group-hover:text-zinc-400',
            large ? 'text-base' : 'text-sm',
          )}
        >
          {description}
        </p>
      </div>
    </article>
  )
}
