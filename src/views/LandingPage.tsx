import { LandingAiVideoStudio } from '@/components/landing/LandingAiVideoStudio'
import { LandingFeatures } from '@/components/landing/LandingFeatures'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingLogin } from '@/components/landing/LandingLogin'
import { LandingPricing } from '@/components/landing/LandingPricing'
import { LandingSocialProof } from '@/components/landing/LandingSocialProof'
import { LandingStickyCta } from '@/components/landing/LandingStickyCta'
import { LandingTrust } from '@/components/landing/LandingTrust'
import { LandingWorkflow } from '@/components/landing/LandingWorkflow'

export default function LandingPage() {
  return (
    <div className="landing-page min-h-svh overflow-x-hidden bg-[#030305] text-zinc-100">
      <LandingHeader />
      <main className="pb-[4.5rem] sm:pb-0">
        <LandingHero />
        <LandingTrust />
        <LandingWorkflow />
        <LandingAiVideoStudio />
        <LandingFeatures />
        <LandingSocialProof />
        <LandingPricing />
        <LandingLogin />
        <LandingStickyCta />
      </main>
      <LandingFooter />
    </div>
  )
}
