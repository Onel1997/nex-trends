import { LandingFeatures } from '@/components/landing/LandingFeatures'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingLogin } from '@/components/landing/LandingLogin'
import { LandingPricing } from '@/components/landing/LandingPricing'
import { LandingShowcase } from '@/components/landing/LandingShowcase'
import { APP_NAME } from '@/lib'

export default function LandingPage() {
  return (
    <div className="min-h-svh bg-black text-zinc-100">
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingShowcase />
        <LandingFeatures />
        <LandingPricing />
        <LandingLogin />
      </main>
      <footer className="border-t border-zinc-900 px-4 py-8 text-center sm:px-6 lg:px-8">
        <p className="text-xs text-zinc-600">
          © {new Date().getFullYear()} {APP_NAME}. Alle Rechte vorbehalten.
        </p>
      </footer>
    </div>
  )
}
