import { LandingAmbientBackground } from '@/components/landing/LandingAmbientBackground'
import { LandingDashboardSection } from '@/components/landing/LandingDashboardSection'
import { LandingFeatureGrid } from '@/components/landing/LandingFeatureGrid'
import { LandingTrust } from '@/components/landing/LandingTrust'
import { NexTrendsHero } from '@/components/landing/NexTrendsHero'

export default function ProductionHome() {
  return (
    <div className="landing-page relative min-h-svh overflow-x-hidden bg-black text-zinc-100 antialiased">
      <LandingAmbientBackground />

      <main className="relative z-10">
        <NexTrendsHero demoHref="#dashboard" showTrustBadge={false} />
        <LandingDashboardSection />
        <LandingTrust />
        <LandingFeatureGrid />
      </main>

      <footer className="relative z-10 border-t border-white/[0.05] bg-black px-4 py-10 text-center sm:py-12">
        <p className="text-xs text-zinc-600">© 2026 NexTrends · nextrends-ai.de</p>
      </footer>
    </div>
  )
}
