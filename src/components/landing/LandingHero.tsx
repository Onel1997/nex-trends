'use client'

import { GoogleSignInButton } from '@/components/landing/GoogleSignInButton'
import { NexTrendsHero } from '@/components/landing/NexTrendsHero'
import { scrollToSection } from '@/lib/scroll'

export function LandingHero() {
  return (
    <div className="relative bg-black">
      <NexTrendsHero
        showNav={false}
        showTrustBadge={false}
        primaryCta={
          <GoogleSignInButton
            label="Kostenlos starten"
            variant="gradient"
            className="!w-full sm:!w-auto sm:!min-w-[240px]"
          />
        }
        onLiveDemo={() => scrollToSection('dashboard')}
      />

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-black via-black/80 to-transparent"
        aria-hidden
      />

      <button
        type="button"
        onClick={() => scrollToSection('dashboard')}
        className="landing-scroll-cue absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-zinc-500 transition-colors hover:text-zinc-300"
        aria-label="Zum Produkt scrollen"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.2em]">Produkt ansehen</span>
        <span className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm">
          <svg className="size-4 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
    </div>
  )
}
