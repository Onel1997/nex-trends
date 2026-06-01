import { ClapperboardIcon, SparklesIcon } from '@/components/ui/icons'
import { AI_STUDIO_FEATURES } from '@/lib/landing'
import { scrollToSection } from '@/lib/scroll'
import { LandingReveal } from '@/components/landing/LandingReveal'
import { LandingSection } from '@/components/landing/LandingSection'
import { LandingSectionHeader } from '@/components/landing/LandingSectionHeader'
import { cn } from '@/lib'

export function LandingAiVideoStudio() {
  return (
    <LandingSection
      id="ai-video-studio"
      glow="center"
      className="landing-studio overflow-hidden"
      ariaLabelledBy="studio-heading"
    >
      <div className="landing-studio__gradient pointer-events-none absolute inset-0" aria-hidden />
      <div className="landing-hero-orb landing-hero-orb--3 pointer-events-none absolute opacity-60" aria-hidden />

      <div className="relative">
        <LandingReveal>
          <LandingSectionHeader
            eyebrow="AI Video Studio"
            title="Die nächste Stufe von"
            titleAccent="Creator Automation."
            description="Vom Trend direkt zum fertigen KI-Video — inklusive Voiceover, Captions und Rendering."
            align="left"
            className="max-w-2xl"
          />
        </LandingReveal>

        <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
          <LandingReveal delay={80}>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-fuchsia-500/25 bg-fuchsia-500/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-fuchsia-300">
                <SparklesIcon className="size-3" aria-hidden />
                Studio exklusiv
              </span>
              <span className="rounded-full border border-zinc-700/50 bg-zinc-900/50 px-3 py-1 text-[10px] font-medium text-zinc-400">
                Verfügbar ab Studio Plan
              </span>
            </div>

            <ul className="mt-6 grid grid-cols-2 gap-2 sm:gap-3">
              {AI_STUDIO_FEATURES.map((feature, i) => (
                <li
                  key={feature}
                  className={cn(
                    'landing-studio-feature flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-xs font-medium text-zinc-300',
                    'landing-reveal landing-reveal--visible',
                  )}
                  style={{ animationDelay: `${120 + i * 60}ms` }}
                >
                  <span className="size-1.5 shrink-0 rounded-full bg-cyan-400/70" aria-hidden />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => scrollToSection('pricing')}
              className="landing-btn-secondary mt-8"
            >
              Studio Plan entdecken
            </button>
          </LandingReveal>

          <LandingReveal delay={160} className="relative">
            <article className="landing-studio-preview relative overflow-hidden rounded-2xl border border-cyan-500/15 bg-zinc-950/80 p-4 shadow-[0_32px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-5">
              <header className="flex items-center justify-between gap-3 border-b border-white/[0.05] pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-9 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
                    <ClapperboardIcon className="size-4" aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-white">AI Video Studio</p>
                    <p className="text-[10px] text-zinc-500">Render Pipeline · Live</p>
                  </div>
                </div>
                <span className="rounded-md border border-cyan-500/20 bg-cyan-500/[0.08] px-2 py-0.5 text-[9px] font-semibold text-cyan-300">
                  Studio
                </span>
              </header>

              <div className="mt-4 aspect-video overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900/60">
                <div className="flex h-full flex-col justify-between p-3">
                  <div className="flex gap-1.5">
                    {['Scene 1', 'Scene 2', 'Scene 3'].map((s, i) => (
                      <span
                        key={s}
                        className={cn(
                          'rounded-md border px-2 py-1 text-[9px] font-medium',
                          i === 1
                            ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200'
                            : 'border-zinc-700/50 text-zinc-500',
                        )}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-zinc-400">Voiceover · DE · Premium</p>
                    <p className="mt-1 text-xs text-zinc-300">
                      „In 15 Sekunden zeige ich dir, warum dein Skincare-Routine scheitert."
                    </p>
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-zinc-800">
                      <div className="landing-queue-bar h-full w-[84%] rounded-full bg-gradient-to-r from-violet-600/80 to-cyan-500/70" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {[
                  { label: 'Captions', value: 'Auto' },
                  { label: 'Templates', value: '12' },
                  { label: 'Export', value: '4K' },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg border border-zinc-800/50 bg-zinc-900/40 px-2 py-2">
                    <p className="text-[9px] text-zinc-500">{label}</p>
                    <p className="text-xs font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
            </article>
          </LandingReveal>
        </div>
      </div>
    </LandingSection>
  )
}
