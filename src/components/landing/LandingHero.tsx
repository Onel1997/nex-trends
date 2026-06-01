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
            className={`${HERO_PRIMARY_CTA_CLASS} !w-full !min-h-0 !rounded-[1rem] !px-6 !py-0 sm:!w-auto sm:!px-8`}
          />
        }
        onLiveDemo={() => scrollToSection('dashboard')}
      />

    </div>
  )
}
