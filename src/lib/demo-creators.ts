import type { CreatorInfo } from '@/types/trend-intelligence'

export type DemoCreatorProfile = CreatorInfo & {
  platform: 'tiktok' | 'instagram'
  styleNote: string
}

/** Curated profiles — Mix of TikTok-native and Instagram Reels aesthetics (DACH). */
export const DEMO_CREATOR_POOL: readonly DemoCreatorProfile[] = [
  {
    platform: 'tiktok',
    handle: '@lena.routines',
    displayName: 'Lena · 5AM Club',
    bio: 'Morgen-Routinen, Productivity & ehrliche Experimente · Wien',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&crop=face&q=80',
    followers: '842K',
    verified: true,
    styleNote: 'Front-Cam POV, Jump-Cuts, lo-fi Beat',
  },
  {
    platform: 'tiktok',
    handle: '@max.hustlelab',
    displayName: 'Max · Hustle Lab',
    bio: 'Side Hustles, Screenshots & Storytime · keine Gurus',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=face&q=80',
    followers: '567K',
    verified: false,
    styleNote: 'Split-Screen Face + Screen, bold Subtitles',
  },
  {
    platform: 'tiktok',
    handle: '@dr.ani.skintok',
    displayName: 'Dr. Ani · SkinTok',
    bio: 'Skincare-Science in 60s · Dermatologie-Infused',
    avatarUrl:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=128&h=128&fit=crop&crop=face&q=80',
    followers: '2.1M',
    verified: true,
    styleNote: 'Ring Light Close-up, Voice-over Facts',
  },
  {
    platform: 'tiktok',
    handle: '@finn.fit.de',
    displayName: 'Finn · Home Workouts',
    bio: 'Bodyweight, Meal Prep & realistische Progress-Pics',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop&crop=face&q=80',
    followers: '391K',
    verified: false,
    styleNote: 'Gym B-Roll, Timer Overlays, Hype Audio',
  },
  {
    platform: 'tiktok',
    handle: '@sophie.kocht',
    displayName: 'Sophie · 15-Min Küche',
    bio: 'Schnelle Rezepte, Voice-over, keine Perfektion',
    avatarUrl:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop&crop=face&q=80',
    followers: '1.3M',
    verified: true,
    styleNote: 'Top-Down Shots, ASMR Cuts, Trend Sounds',
  },
  {
    platform: 'tiktok',
    handle: '@noah.tech.tok',
    displayName: 'Noah · Gadget Check',
    bio: 'Tech unter 100€, ehrliche Reviews · München',
    avatarUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face&q=80',
    followers: '728K',
    verified: false,
    styleNote: 'Handheld Unboxing, Zoom auf Details',
  },
  {
    platform: 'tiktok',
    handle: '@jamie.storytime',
    displayName: 'Jamie · StoryTok',
    bio: 'True Crime & Alltag · Hook in Sekunde 1',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=face&q=80',
    followers: '1.8M',
    verified: true,
    styleNote: 'Talking Head, Subtitle Karaoke, Dark BG',
  },
  {
    platform: 'instagram',
    handle: '@mira.stylecapsule',
    displayName: 'Mira · Style Capsule',
    bio: 'Quiet Luxury, Capsule Wardrobe · Hamburg',
    avatarUrl:
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8a04?w=128&h=128&fit=crop&crop=face&q=80',
    followers: '1.2M',
    verified: true,
    styleNote: 'Soft Light, neutral tones, slow zoom transitions',
  },
  {
    platform: 'instagram',
    handle: '@leo.reels.lab',
    displayName: 'Leo · Reels Lab',
    bio: 'Motion Graphics meets Lifestyle · Brand Collabs',
    avatarUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=128&h=128&fit=crop&crop=face&q=80',
    followers: '489K',
    verified: false,
    styleNote: 'Cinematic B-Roll, minimal Text, ambient score',
  },
  {
    platform: 'instagram',
    handle: '@nina.wellness.reels',
    displayName: 'Nina · Wellness Reels',
    bio: 'Pilates, Matcha & slow mornings · Coach',
    avatarUrl:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=128&h=128&fit=crop&crop=face&q=80',
    followers: '956K',
    verified: true,
    styleNote: 'Bright airy frames, calming voice, save-worthy tips',
  },
  {
    platform: 'instagram',
    handle: '@ben.food.berlin',
    displayName: 'Ben · Berlin Eats',
    bio: 'Hidden Spots, Reels < 20s · Food only',
    avatarUrl:
      'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=128&h=128&fit=crop&crop=face&q=80',
    followers: '612K',
    verified: false,
    styleNote: 'Handheld restaurant POV, punchy captions',
  },
  {
    platform: 'instagram',
    handle: '@zara.beauty.edit',
    displayName: 'Zara · Beauty Edit',
    bio: 'GRWM, Swatches & honest dupes · clean girl era',
    avatarUrl:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=128&h=128&fit=crop&crop=face&q=80',
    followers: '1.5M',
    verified: true,
    styleNote: 'Vanity setup, macro product shots, trending audio',
  },
  {
    platform: 'instagram',
    handle: '@tim.architecture',
    displayName: 'Tim · Built Spaces',
    bio: 'Architecture & interior reels · Zürich',
    avatarUrl:
      'https://images.unsplash.com/photo-1463453091185-98a79ae78f04?w=128&h=128&fit=crop&crop=face&q=80',
    followers: '274K',
    verified: false,
    styleNote: 'Wide shots, glide transitions, no talking head',
  },
  {
    platform: 'instagram',
    handle: '@aylin.travel.mini',
    displayName: 'Aylin · Mini Escapes',
    bio: 'Weekend trips, packing hacks · Reels & Carousels',
    avatarUrl:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=128&h=128&fit=crop&crop=face&q=80',
    followers: '803K',
    verified: true,
    styleNote: 'Drone + selfie mix, map overlays, wanderlust tone',
  },
] as const

function hashTrendId(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function normalizePlatform(platform: string): 'tiktok' | 'instagram' {
  return platform.toLowerCase().includes('instagram') ? 'instagram' : 'tiktok'
}

function toCreatorInfo(profile: DemoCreatorProfile): CreatorInfo {
  const { platform: _p, styleNote: _s, ...creator } = profile
  return creator
}

/** Stable pseudo-random profile per trend id (same after reload when session stores trends). */
export function assignCreatorForTrend(trendId: string, platform: string): CreatorInfo {
  const platformKey = normalizePlatform(platform)
  const platformPool = DEMO_CREATOR_POOL.filter((p) => p.platform === platformKey)
  const pool = platformPool.length > 0 ? platformPool : [...DEMO_CREATOR_POOL]
  const hash = hashTrendId(trendId)
  const primary = pool[hash % pool.length]
  const secondary = pool[(hash + 7) % pool.length]
  const profile = hash % 5 === 0 && primary.handle !== secondary.handle ? secondary : primary
  return toCreatorInfo(profile)
}

/** Catalog build: spread creators across slots; suffix handle when pool repeats */
export function assignCreatorForCatalogSlot(
  slot: number,
  trendId: string,
  platform: string,
  usedHandles: Set<string>,
): CreatorInfo {
  const platformKey = normalizePlatform(platform)
  const platformPool = DEMO_CREATOR_POOL.filter((p) => p.platform === platformKey)
  const pool = platformPool.length > 0 ? platformPool : [...DEMO_CREATOR_POOL]
  const hash = hashTrendId(`${trendId}:${slot}`)

  for (let offset = 0; offset < pool.length; offset += 1) {
    const profile = pool[(hash + offset) % pool.length]
    const creator = toCreatorInfo(profile)
    if (!usedHandles.has(creator.handle)) {
      usedHandles.add(creator.handle)
      return creator
    }
  }

  const base = toCreatorInfo(pool[hash % pool.length])
  const suffix = trendId.replace(/^demo-/, '')
  const handle = `${base.handle}.${suffix}`
  usedHandles.add(handle)
  return {
    ...base,
    handle,
    displayName: `${base.displayName} · ${suffix}`,
  }
}

export function formatCreatorInspiration(creator: CreatorInfo, platform: string): string {
  const profile = DEMO_CREATOR_POOL.find(
    (p) => p.handle === creator.handle && p.displayName === creator.displayName,
  )
  const style = profile?.styleNote ?? 'Mobile-first Short-Form, starke Hooks'
  const label = normalizePlatform(platform) === 'instagram' ? 'Reels-Stil' : 'TikTok-Stil'
  return `${creator.handle} · ${label}: ${style}`
}
