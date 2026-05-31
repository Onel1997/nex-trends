import { LandingSectionHeader } from '@/components/landing/LandingSectionHeader'
import { SOCIAL_STATS, TESTIMONIALS } from '@/lib/landing'
import { cn } from '@/lib'

export function LandingSocialProof() {
  return (
    <section
      id="social-proof"
      aria-labelledby="social-proof-heading"
      className="landing-section relative overflow-hidden border-t border-white/[0.04] px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-950/15 via-transparent to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl">
        <LandingSectionHeader
          eyebrow="Erfolge"
          title="Creator & Agenturen"
          titleAccent="skalieren mit NexTrends."
          description="Echte Metriken aus dem Alltag — von Solo-Creators bis Growth-Teams mit mehreren Client-Accounts."
        />

        <dl className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {SOCIAL_STATS.map(({ value, label }, index) => (
            <div
              key={label}
              className={cn(
                'landing-stat-card rounded-2xl border border-zinc-800/70 bg-zinc-950/60 px-4 py-5 text-center transition-all duration-300 hover:border-violet-500/25 hover:shadow-[0_0_32px_-12px_rgba(139,92,246,0.25)] sm:px-5 sm:py-6',
                'landing-fade-in',
                index === 0 && 'landing-fade-in--1',
                index === 1 && 'landing-fade-in--2',
                index === 2 && 'landing-fade-in--3',
                index === 3 && 'landing-fade-in--4',
              )}
            >
              <dt className="text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl">
                {value}
              </dt>
              <dd className="mt-1 text-[11px] text-zinc-500 sm:text-xs">{label}</dd>
            </div>
          ))}
        </dl>

        {/* Mobile: horizontal testimonial scroll */}
        <div
          className="landing-testimonials-carousel mt-10 flex gap-3 overflow-x-auto pb-2 scrollbar-hide md:hidden"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {TESTIMONIALS.map((item) => (
            <TestimonialCard key={item.id} item={item} mobile />
          ))}
        </div>

        <div className="mt-10 hidden gap-5 md:grid md:grid-cols-3">
          {TESTIMONIALS.map((item, index) => (
            <TestimonialCard
              key={item.id}
              item={item}
              className={cn(
                'landing-fade-in',
                index === 0 && 'landing-fade-in--1',
                index === 1 && 'landing-fade-in--2',
                index === 2 && 'landing-fade-in--3',
              )}
            />
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-center">
          <BadgePill label="Stripe Secure" />
          <BadgePill label="Google OAuth" />
          <BadgePill label="Magic Link Login" />
          <BadgePill label="EU Hosting" />
          <BadgePill label="DSGVO-konform" />
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({
  item,
  mobile = false,
  className,
}: {
  item: (typeof TESTIMONIALS)[number]
  mobile?: boolean
  className?: string
}) {
  return (
    <blockquote
      className={cn(
        'landing-testimonial flex flex-col rounded-2xl border border-zinc-800/70 bg-zinc-950/80 p-5 transition-all duration-300 hover:border-violet-500/25 hover:shadow-[0_0_40px_-16px_rgba(139,92,246,0.2)] sm:p-6',
        mobile && 'w-[min(85vw,18rem)] shrink-0 snap-center',
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-xs font-bold text-white">
          {item.initials}
        </div>
        <span className="rounded-full border border-violet-500/25 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-violet-300">
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
  )
}

function BadgePill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800/80 bg-zinc-950/80 px-3 py-1.5 text-[11px] font-medium text-zinc-400">
      <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden />
      {label}
    </span>
  )
}
