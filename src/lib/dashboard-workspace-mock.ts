import { getDemoTrendCatalog } from '@/lib/demo-trend-catalog'
import type {
  GeneratedAdCopy,
  GeneratedHook,
  GeneratedSeoTitle,
  HookTone,
  TrendFeedItem,
  TrendStatusBadge,
  WorkspacePlatform,
} from '@/types/dashboard-workspace'

function delay(ms = 720): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function statusFromScore(score: number): TrendStatusBadge {
  if (score >= 90) return 'Exploding'
  if (score >= 78) return 'Rising'
  return 'Early'
}

function growthFromScore(score: number): number {
  return Math.min(340, Math.round(12 + score * 2.4 + Math.random() * 18))
}

function velocityLabel(score: number): string {
  if (score >= 90) return 'Sehr hoch'
  if (score >= 80) return 'Hoch'
  if (score >= 70) return 'Mittel'
  return 'Steigend'
}

function mapCatalogToFeed(): TrendFeedItem[] {
  return getDemoTrendCatalog()
    .slice(0, 14)
    .map((t) => {
      const platform =
        t.platform === 'Instagram' || t.platform === 'YouTube'
          ? t.platform
          : ('TikTok' as WorkspacePlatform)
      const score = t.viralScore ?? 82
      return {
        id: t.id,
        title: t.title,
        platform,
        viralScore: score,
        growthPercent: growthFromScore(score),
        engagementVelocity: velocityLabel(score),
        niche: t.niche ?? t.hashtags[0]?.replace('#', '') ?? 'General',
        status: statusFromScore(score),
      }
    })
}

let cachedFeed: TrendFeedItem[] | null = null

export async function fetchTrendIntelligenceFeed(): Promise<TrendFeedItem[]> {
  await delay(640)
  if (!cachedFeed) cachedFeed = mapCatalogToFeed()
  return cachedFeed.map((item) => ({
    ...item,
    growthPercent: growthFromScore(item.viralScore),
  }))
}

const HOOK_TEMPLATES: Record<HookTone, string[]> = {
  aggressive: [
    '„Stopp — {niche} ohne diese 3 Fehler verbrennst du Reichweite."',
    '„Niemand redet über {niche} — bis du DAS siehst."',
    '„Du machst {niche} falsch. Hier ist der Beweis in 15 Sekunden."',
    '„Warum 90 % bei {niche} scheitern (und du nicht)."',
    '„Diese {niche}-Taktik ist unfair — nutz sie, bevor sie stirbt."',
  ],
  luxury: [
    '„{niche} auf Premium-Niveau — ohne laut zu werden."',
    '„Die stille {niche}-Strategie, die Brands kopieren."',
    '„Weniger Content. Mehr {niche}-Wirkung."',
    '„So wirkt {niche} teuer — auch mit kleinem Budget."',
    '„Exklusiv: {niche}, das sich nicht wie Werbung anfühlt."',
  ],
  storytelling: [
    '„POV: Du entdeckst {niche} zum ersten Mal — und alles kippt."',
    '„Ich hab {niche} 14 Tage getestet. Das Ergebnis überrascht."',
    '„Die {niche}-Geschichte, die mir 2M Views gebracht hat."',
    '„Von 0 auf viral mit {niche} — mein ehrlicher Verlauf."',
    '„Ein Satz über {niche} hat meinen Feed verändert."',
  ],
  casual: [
    '„Okay aber {niche} ist gerade wirklich crazy 😭"',
    '„Niemand hat mich auf {niche} vorbereitet."',
    '„{niche} in 30 Sekunden erklärt — kein Gelaber."',
    '„Probier das bei {niche} bevor es jeder macht."',
    '„{niche} Hack, den ich zu spät entdeckt hab."',
  ],
  educational: [
    '„{niche} in 3 Schritten — auch für Anfänger."',
    '„Die Wissenschaft hinter viralen {niche}-Videos."',
    '„{niche}-Framework, das ich in jedem Briefing nutze."',
    '„So liest du {niche}-Signale, bevor sie explodieren."',
    '„Checkliste: {niche} Content, der wirklich performt."',
  ],
}

function ctrForHook(index: number, tone: HookTone): number {
  const base = tone === 'aggressive' ? 88 : tone === 'luxury' ? 82 : 85
  return Math.min(97, base + (4 - index) * 2 + Math.floor(Math.random() * 4))
}

export async function generateWorkspaceHooks(
  niche: string,
  platform: WorkspacePlatform,
  tone: HookTone,
): Promise<GeneratedHook[]> {
  await delay(880)
  const topic = niche.trim() || 'deine Nische'
  const templates = HOOK_TEMPLATES[tone]
  return templates.map((tpl, i) => ({
    id: `hook-${Date.now()}-${i}`,
    text: tpl.replace(/\{niche\}/g, topic) + ` · ${platform}`,
    ctrScore: ctrForHook(i, tone),
  }))
}

export async function generateWorkspaceAdCopy(
  product: string,
  audience: string,
  platform: WorkspacePlatform,
): Promise<GeneratedAdCopy> {
  await delay(920)
  const p = product.trim() || 'dein Produkt'
  const a = audience.trim() || 'deine Zielgruppe'

  return {
    shortAd: `${p} für ${a}: Scroll-stoppend in den ersten 3 Sekunden. Klarer Nutzen, kein Corporate-Speak — optimiert für ${platform}.`,
    cta: platform === 'Instagram' ? 'Jetzt entdecken' : 'Kostenlos testen',
    caption: `🎯 ${p} · gebaut für ${a}\n\nSpeichern & teilen, wenn ${platform} dein Wachstumskanal ist.\n\n#marketing #${p.toLowerCase().replace(/\s+/g, '')} #creator`,
  }
}

export async function generateWorkspaceSeoTitle(topic: string): Promise<GeneratedSeoTitle> {
  await delay(780)
  const t = topic.trim() || 'Content Marketing'
  const year = new Date().getFullYear()
  const seoScore = 84 + Math.floor(Math.random() * 12)
  const keywordStrength = 72 + Math.floor(Math.random() * 22)

  return {
    title: `${t}: Viral-Strategie & Trends (${year})`,
    seoScore,
    keywordStrength,
    keyword: t.split(' ').slice(0, 3).join(' '),
  }
}
