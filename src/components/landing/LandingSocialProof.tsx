import { LandingSectionHeader } from '@/components/landing/LandingSectionHeader'
import { SOCIAL_STATS, TESTIMONIALS } from '@/lib/landing'
import { cn } from '@/lib'

export function LandingSocialProof() {
  return (
    <section
      id="social-proof"
      aria-labelledby="social-proof-heading"
      className="relative overflow-hidden border-t border-zinc-900 px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-950/10 via-transparent to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl">
        <LandingSectionHeader
          eyebrow="Social Proof"
          title="Creator lieben NexTrends."
          titleAccent="Die Zahlen sprechen für sich."
          description="Von Solo-Creators bis Marketing-Teams — über 500 Nutzer produzieren täglich schnelleren, besseren Content."
        />

        <dl className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {SOCIAL_STATS.map(({ value, label }, index) => (
            <div
              key={label}
              className={cn(
                'rounded-2xl border border-zinc-800/80 bg-zinc-950/60 px-5 py-6 text-center transition-all hover:border-violet-500/20 hover:bg-zinc-900/50',
                'animate-fade-in',
                index === 0 && 'animation-delay-100',
                index === 1 && 'animation-delay-200',
                index === 2 && 'animation-delay-300',
                index === 3 && 'animation-delay-400',
              )}
            >
              <dt className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{value}</dt>
              <dd className="mt-1 text-xs text-zinc-500 sm:text-sm">{label}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((item, index) => (
            <blockquote
              key={item.id}
              className={cn(
                'flex flex-col rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-6 transition-all duration-300 hover:border-zinc-700 hover:shadow-lg hover:shadow-violet-950/10 sm:p-7',
                'animate-fade-in',
                index === 0 && 'animation-delay-100',
                index === 1 && 'animation-delay-200',
                index === 2 && 'animation-delay-300',
              )}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-xs font-bold text-white">
                  {item.initials}
                </div>
                <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-violet-300">
                  {item.metric}
                </span>
              </div>

              <p className="flex-1 text-sm leading-relaxed text-zinc-300">
                &ldquo;{item.quote}&rdquo;
              </p>

              <footer className="mt-5 border-t border-zinc-800/60 pt-4">
                <cite className="not-italic">
                  <span className="block text-sm font-semibold text-white">{item.author}</span>
                  <span className="mt-0.5 block text-xs text-zinc-500">{item.role}</span>
                </cite>
              </footer>
            </blockquote>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-center">
          <BadgePill label="SOC 2 Ready" />
          <BadgePill label="Stripe Secure" />
          <BadgePill label="Google OAuth" />
          <BadgePill label="EU Hosting" />
        </div>
      </div>
    </section>
  )
}

function BadgePill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/80 px-4 py-2 text-xs font-medium text-zinc-400">
      <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden />
      {label}
    </span>
  )
}
