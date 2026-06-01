'use client'

import { GoogleSignInButton } from '@/components/landing/GoogleSignInButton'
import { HERO_PRIMARY_CTA_CLASS, NexTrendsHero } from '@/components/landing/NexTrendsHero'
import { scrollToSection } from '@/lib/scroll'

export function LandingHero() {
  return (
    <div className="landing-hero-block relative w-full">
      <NexTrendsHero
        showNav={false}
        showTrustBadge={false}
        primaryCta={
          <GoogleSignInButton
            label="Kostenlos starten"
            variant="gradient"
            layout="hero"
            className={HERO_PRIMARY_CTA_CLASS}
          />
        }
        onLiveDemo={() => scrollToSection('dashboard')}
      />

    </div>
  )
}
