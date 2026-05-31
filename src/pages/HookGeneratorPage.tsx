import { HookGeneratorTool } from '@/components/tools/HookGeneratorTool'
import { OnboardingTip } from '@/components/onboarding/OnboardingTip'

export function HookGeneratorPage() {
  return (
    <div className="space-y-4">
      <OnboardingTip
        tipId="first-generation"
        title="Erste Generierung"
        message="Gib ein Thema ein, wähle Ton & Plattform — dein erster Hook ist in Sekunden fertig."
      />
      <HookGeneratorTool />
    </div>
  )
}
