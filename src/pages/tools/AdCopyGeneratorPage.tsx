import { AiGeneratorTool } from '@/components/tools/AiGeneratorTool'
import { generateAdCopyPlaceholder } from '@/lib/ai-tools-placeholder'

export function AdCopyGeneratorPage() {
  return (
    <AiGeneratorTool
      title="AI Ad Copy Generator"
      description="Erstelle werbetaugliche Headlines, CTAs und Short-Form Copy für TikTok, Instagram & Paid Social."
      inputPlaceholder="z. B. Friseursalon in München, Fokus Balayage, Zielgruppe Frauen 25–40"
      emptyTitle="Ad Copy wartet auf dein Briefing"
      emptyDescription="Beschreibe Produkt, Zielgruppe und Plattform — die KI liefert Headlines und CTA-Varianten."
      toolActivityName="AI Ad Copy Generator"
      onGenerate={generateAdCopyPlaceholder}
    />
  )
}
