import { AiGeneratorTool } from '@/components/tools/AiGeneratorTool'
import { generateHooksPlaceholder } from '@/lib/ai-tools-placeholder'

export function HookGeneratorPage() {
  return (
    <AiGeneratorTool
      title="Hook Generator"
      description="Scroll-stoppende Hooks für Reels, TikToks und Shorts — optimiert für die ersten 3 Sekunden."
      inputPlaceholder="z. B. Fitness-App für Berufstätige, 10-Minuten-Workouts ohne Equipment"
      emptyTitle="Hooks generieren"
      emptyDescription="Beschreibe dein Video-Thema — 5 psychologisch clevere Scroll-Stopper."
      toolActivityName="Hook Generator"
      onGenerate={generateHooksPlaceholder}
    />
  )
}
