export type TrendPlatform = 'tiktok' | 'instagram'

export type ViralTrend = {
  id: string
  platform: TrendPlatform
  title: string
  hashtag: string
  niche: string
  views: number
  engagementRate: number
  thumbnailFrom: string
  thumbnailTo: string
}

export const MOCK_VIRAL_TRENDS: ViralTrend[] = [
  {
    id: '1',
    platform: 'tiktok',
    title: 'POV: Du optimierst deinen Morgen in 60 Sekunden',
    hashtag: '#morningroutine',
    niche: 'Productivity',
    views: 2_400_000,
    engagementRate: 9.8,
    thumbnailFrom: 'from-violet-600',
    thumbnailTo: 'to-fuchsia-700',
  },
  {
    id: '2',
    platform: 'instagram',
    title: 'Quiet Luxury Capsule — 5 Looks, 1 Woche',
    hashtag: '#quietluxury',
    niche: 'Fashion',
    views: 1_120_000,
    engagementRate: 7.2,
    thumbnailFrom: 'from-rose-600',
    thumbnailTo: 'to-orange-700',
  },
  {
    id: '3',
    platform: 'tiktok',
    title: 'Dieser Skincare-Hack wird gerade überall kopiert',
    hashtag: '#skintok',
    niche: 'Beauty',
    views: 3_800_000,
    engagementRate: 11.4,
    thumbnailFrom: 'from-cyan-600',
    thumbnailTo: 'to-blue-700',
  },
  {
    id: '4',
    platform: 'instagram',
    title: 'Reel-Format: Vorher/Nachher in 7 Sekunden',
    hashtag: '#transformation',
    niche: 'Fitness',
    views: 890_000,
    engagementRate: 6.5,
    thumbnailFrom: 'from-emerald-600',
    thumbnailTo: 'to-teal-700',
  },
  {
    id: '5',
    platform: 'tiktok',
    title: 'Side Hustle ohne Startkapital — so geht’s',
    hashtag: '#sidehustle',
    niche: 'Business',
    views: 1_950_000,
    engagementRate: 8.9,
    thumbnailFrom: 'from-amber-600',
    thumbnailTo: 'to-yellow-700',
  },
  {
    id: '6',
    platform: 'instagram',
    title: 'Aesthetic Meal Prep für unter 5 € pro Tag',
    hashtag: '#mealprep',
    niche: 'Food',
    views: 640_000,
    engagementRate: 5.8,
    thumbnailFrom: 'from-lime-600',
    thumbnailTo: 'to-green-700',
  },
]

export function formatViews(views: number): string {
  if (views >= 1_000_000) {
    return `${(views / 1_000_000).toFixed(1).replace('.0', '')}M`
  }
  if (views >= 1_000) {
    return `${(views / 1_000).toFixed(0)}K`
  }
  return views.toString()
}

export function formatEngagement(rate: number): string {
  return `${rate.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`
}
