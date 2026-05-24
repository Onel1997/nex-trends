import { LandingFeatures } from '@/components/landing/LandingFeatures'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingLogin } from '@/components/landing/LandingLogin'
import { LandingPricing } from '@/components/landing/LandingPricing'
import { LandingShowcase } from '@/components/landing/LandingShowcase'
import { LandingSocialProof } from '@/components/landing/LandingSocialProof'

export default function LandingPage() {
  return (
    <div className="min-h-svh bg-black text-zinc-100">
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingShowcase />
        <LandingFeatures />
        <LandingSocialProof />
        <LandingPricing />
        <LandingLogin />
      </main>
      <LandingFooter />
    </div>
  )
}
