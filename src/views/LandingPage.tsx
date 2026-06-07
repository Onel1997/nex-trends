'use client'

import { LandingAmbientBackground } from '@/components/landing/LandingAmbientBackground'
import { LandingDashboardSection } from '@/components/landing/LandingDashboardSection'
import { LandingFeatureGrid } from '@/components/landing/LandingFeatureGrid'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingPricing } from '@/components/landing/LandingPricing'
import { LandingTrust } from '@/components/landing/LandingTrust'
import { LandingWorkflow } from '@/components/landing/LandingWorkflow'

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Decor FIRST in DOM — behind interactive shell (iOS Safari stacking) */}
      <LandingAmbientBackground />

      <div className="landing-page-content landing-page-interactive">
        <LandingHeader />

        <main className="landing-page-main">
          <LandingHero />
          <LandingDashboardSection />
          <LandingTrust />
          <LandingFeatureGrid />
          <LandingWorkflow />
          <LandingPricing />
        </main>

        <LandingFooter />
      </div>
    </div>
  )
}
