import { AiGeneratorTool } from '@/components/tools/AiGeneratorTool'
import { generateSeoTitlesPlaceholder } from '@/lib/ai-tools-placeholder'

export function SeoTitleGeneratorPage() {
  return (
    <AiGeneratorTool
      title="SEO Title Generator"
      description="CTR-optimierte Titel für Blogposts, Landing Pages und Social Snippets — mit Zeichenlänge & Intent."
      inputLabel="Keyword oder Thema"
      inputPlaceholder="z. B. nachhaltige Mode, Keyword: capsule wardrobe, Zielgruppe Gen Z"
      emptyTitle="SEO-Titel generieren"
      emptyDescription="Gib ein Keyword oder Thema ein — 5 klickstarke Titel-Vorschläge in Sekunden."
      generateLabel="Titel generieren"
      toolActivityName="SEO Title Generator"
      onGenerate={generateSeoTitlesPlaceholder}
    />
  )
}
