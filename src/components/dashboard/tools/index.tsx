import { ToolGeneratorPanel } from '../ToolGeneratorPanel'
import {
  analyzeLandingPage,
  generateAdCopy,
  generateHooks,
  generateSeoTitles,
} from '@/lib/openai'

export function AdCopyTool() {
  return (
    <ToolGeneratorPanel
      title="AI Ad Copy Generator"
      description="Erstelle werbetaugliche Texte für TikTok und Instagram — optimiert auf Klicks und Conversions."
      briefingPlaceholder="z. B. Friseursalon in München, Fokus auf Balayage und Haarverlängerungen"
      resultPlaceholder="Dein generiertes Ad-Skript erscheint hier. Beschreibe dein Produkt oben und klicke auf „Generieren“."
      onGenerate={generateAdCopy}
    />
  )
}

export function HookTool() {
  return (
    <ToolGeneratorPanel
      title="Hook Generator"
      description="Generiere scroll-stoppende Hooks für Reels, TikToks und Shorts in den ersten 3 Sekunden."
      briefingPlaceholder="z. B. Fitness-App für Berufstätige, Fokus auf 10-Minuten-Workouts ohne Equipment"
      resultPlaceholder="Deine Hook-Varianten erscheinen hier — punchy, neugierig machend und platform-ready."
      onGenerate={generateHooks}
    />
  )
}

export function SeoTitleTool() {
  return (
    <ToolGeneratorPanel
      title="SEO Title Generator"
      description="Klickstarke Überschriften für Blogposts, Landing Pages und Social Snippets."
      briefingPlaceholder="z. B. Artikel über nachhaltige Mode, Keyword: capsule wardrobe, Zielgruppe Gen Z"
      resultPlaceholder="Deine SEO-Titel-Vorschläge erscheinen hier — mit Fokus auf CTR und Suchintention."
      onGenerate={generateSeoTitles}
    />
  )
}

export function LandingAnalyzerTool() {
  return (
    <ToolGeneratorPanel
      title="Landing Page Analyzer"
      description="Analysiere deine Landing Page und erhalte KI-Empfehlungen für mehr Conversions."
      briefingPlaceholder="Füge deine Landing-Page-URL oder den Haupttext deiner Seite hier ein …"
      resultPlaceholder="Deine Analyse mit Stärken, Schwächen und konkreten Optimierungsvorschlägen erscheint hier."
      onGenerate={analyzeLandingPage}
    />
  )
}
