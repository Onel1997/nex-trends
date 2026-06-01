import { ProtectedTool } from '@/components/subscription/ProtectedTool'
import { HookGeneratorTool } from '@/components/tools/HookGeneratorTool'
import { OnboardingTip } from '@/components/onboarding/OnboardingTip'

export function HookGeneratorPage() {
  return (
    <ProtectedTool
      toolId="hook"
      title="Hook Generator"
      description="Der Hook Generator ist in deinem Plan enthalten. Upgrade für unbegrenzte Credits und alle AI-Tools."
    >
      <div className="space-y-4">
        <OnboardingTip
          tipId="first-generation"
          title="Erste Generierung"
          message="Gib deine Nische ein, wähle Ton & Plattform — OpenAI liefert 10 virale Scroll-Stopper für TikTok & Instagram."
        />
        <HookGeneratorTool />
      </div>
    </ProtectedTool>
  )
}
