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
    <div className="landing-page relative min-h-svh overflow-x-hidden bg-black text-zinc-100 antialiased">
      <LandingAmbientBackground />

      <LandingHeader />

      <main className="relative z-10">
        <LandingHero />
        <LandingDashboardSection />
        <LandingTrust />
        <LandingFeatureGrid />
        <LandingWorkflow />
        <LandingPricing />
      </main>

      <div className="relative z-10">
        <LandingFooter />
      </div>
    </div>
  )
}
