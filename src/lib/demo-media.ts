/** Self-hosted + CDN vertical clips for demo variety (Mixkit License where noted). */

export type DemoMediaAsset = {
  video: string
  poster: string
  duration: string
}

/** Local assets in /public/demo-videos/ plus CDN fallbacks for wider rotation */
export const DEMO_MEDIA_ASSETS: readonly DemoMediaAsset[] = [
  {
    video: '/demo-videos/demo-1.mp4',
    poster: '/demo-videos/demo-1-poster.jpg',
    duration: '0:12',
  },
  {
    video: '/demo-videos/demo-2.mp4',
    poster: '/demo-videos/demo-2-poster.jpg',
    duration: '0:18',
  },
  {
    video: '/demo-videos/demo-3.mp4',
    poster: '/demo-videos/demo-3-poster.jpg',
    duration: '0:15',
  },
  {
    video: '/demo-videos/demo-4.mp4',
    poster: '/demo-videos/demo-4-poster.jpg',
    duration: '0:10',
  },
  {
    video: 'https://assets.mixkit.co/videos/32808/32808-720.mp4',
    poster: 'https://assets.mixkit.co/videos/32808/32808-thumb-720-0.jpg',
    duration: '0:14',
  },
  {
    video: 'https://assets.mixkit.co/videos/1214/1214-720.mp4',
    poster: 'https://assets.mixkit.co/videos/1214/1214-thumb-720-0.jpg',
    duration: '0:18',
  },
  {
    video: 'https://assets.mixkit.co/videos/4059/4059-720.mp4',
    poster: 'https://assets.mixkit.co/videos/4059/4059-thumb-720-0.jpg',
    duration: '0:15',
  },
  {
    video: 'https://assets.mixkit.co/videos/1191/1191-720.mp4',
    poster: 'https://assets.mixkit.co/videos/1191/1191-thumb-720-0.jpg',
    duration: '0:10',
  },
  {
    video: 'https://assets.mixkit.co/videos/4271/4271-720.mp4',
    poster: 'https://assets.mixkit.co/videos/4271/4271-thumb-720-0.jpg',
    duration: '0:22',
  },
  {
    video: 'https://assets.mixkit.co/videos/40774/40774-720.mp4',
    poster: 'https://assets.mixkit.co/videos/40774/40774-thumb-720-0.jpg',
    duration: '0:08',
  },
  {
    video: 'https://assets.mixkit.co/videos/1168/1168-720.mp4',
    poster: 'https://assets.mixkit.co/videos/1168/1168-thumb-720-0.jpg',
    duration: '0:12',
  },
  {
    video: 'https://assets.mixkit.co/videos/1186/1186-720.mp4',
    poster: 'https://assets.mixkit.co/videos/1186/1186-thumb-720-0.jpg',
    duration: '0:11',
  },
  {
    video: 'https://assets.mixkit.co/videos/3195/3195-720.mp4',
    poster: 'https://assets.mixkit.co/videos/3195/3195-thumb-720-0.jpg',
    duration: '0:16',
  },
  {
    video: 'https://assets.mixkit.co/videos/4630/4630-720.mp4',
    poster: 'https://assets.mixkit.co/videos/4630/4630-thumb-720-0.jpg',
    duration: '0:13',
  },
  {
    video: 'https://assets.mixkit.co/videos/2578/2578-720.mp4',
    poster: 'https://assets.mixkit.co/videos/2578/2578-thumb-720-0.jpg',
    duration: '0:17',
  },
  {
    video: 'https://assets.mixkit.co/videos/2277/2277-720.mp4',
    poster: 'https://assets.mixkit.co/videos/2277/2277-thumb-720-0.jpg',
    duration: '0:14',
  },
  {
    video: 'https://assets.mixkit.co/videos/2828/2828-720.mp4',
    poster: 'https://assets.mixkit.co/videos/2828/2828-thumb-720-0.jpg',
    duration: '0:19',
  },
  {
    video: 'https://assets.mixkit.co/videos/3144/3144-720.mp4',
    poster: 'https://assets.mixkit.co/videos/3144/3144-thumb-720-0.jpg',
    duration: '0:12',
  },
  {
    video: 'https://assets.mixkit.co/videos/4995/4995-720.mp4',
    poster: 'https://assets.mixkit.co/videos/4995/4995-thumb-720-0.jpg',
    duration: '0:15',
  },
  {
    video: 'https://assets.mixkit.co/videos/5201/5201-720.mp4',
    poster: 'https://assets.mixkit.co/videos/5201/5201-thumb-720-0.jpg',
    duration: '0:11',
  },
  {
    video: 'https://assets.mixkit.co/videos/3456/3456-720.mp4',
    poster: 'https://assets.mixkit.co/videos/3456/3456-thumb-720-0.jpg',
    duration: '0:18',
  },
  {
    video: 'https://assets.mixkit.co/videos/1989/1989-720.mp4',
    poster: 'https://assets.mixkit.co/videos/1989/1989-thumb-720-0.jpg',
    duration: '0:10',
  },
  {
    video: 'https://assets.mixkit.co/videos/2126/2126-720.mp4',
    poster: 'https://assets.mixkit.co/videos/2126/2126-thumb-720-0.jpg',
    duration: '0:14',
  },
  {
    video: 'https://assets.mixkit.co/videos/4629/4629-720.mp4',
    poster: 'https://assets.mixkit.co/videos/4629/4629-thumb-720-0.jpg',
    duration: '0:16',
  },
  {
    video: 'https://assets.mixkit.co/videos/5077/5077-720.mp4',
    poster: 'https://assets.mixkit.co/videos/5077/5077-thumb-720-0.jpg',
    duration: '0:13',
  },
  {
    video: 'https://assets.mixkit.co/videos/2889/2889-720.mp4',
    poster: 'https://assets.mixkit.co/videos/2889/2889-thumb-720-0.jpg',
    duration: '0:12',
  },
  {
    video: 'https://assets.mixkit.co/videos/4176/4176-720.mp4',
    poster: 'https://assets.mixkit.co/videos/4176/4176-thumb-720-0.jpg',
    duration: '0:20',
  },
  {
    video: 'https://assets.mixkit.co/videos/2324/2324-720.mp4',
    poster: 'https://assets.mixkit.co/videos/2324/2324-thumb-720-0.jpg',
    duration: '0:09',
  },
  {
    video: 'https://assets.mixkit.co/videos/3715/3715-720.mp4',
    poster: 'https://assets.mixkit.co/videos/3715/3715-thumb-720-0.jpg',
    duration: '0:15',
  },
  {
    video: 'https://assets.mixkit.co/videos/4438/4438-720.mp4',
    poster: 'https://assets.mixkit.co/videos/4438/4438-thumb-720-0.jpg',
    duration: '0:11',
  },
] as const

const EXTRA_POSTERS = [
  'photo-1611162617474-5b21e939e07a',
  'photo-1611605698335-8b1569810432',
  'photo-1611162616305-c69b3fa7fbe0',
  'photo-1522202176988-66273c2fd55f',
  'photo-1571019614242-c547c6ffc174',
  'photo-1517836357463-d25dfeac3438',
  'photo-1512621776951-a57141f2eefd',
  'photo-1490645935968-10de6bc3423e',
  'photo-1556228720-195a672e8a03',
  'photo-1460925895917-afdab827c52f',
  'photo-1483985988355-763728e786a7',
  'photo-1504674900247-0877df9cc836',
  'photo-1540189549336-efba6d2b1a26',
  'photo-1517248135467-4c7edcad34c4',
  'photo-1556909114-f6e7ad7d3136',
  'photo-1534438327276-14e5300c3f0e',
  'photo-1516321318423-f06f85e504b3',
  'photo-1485827404703-89b9eccbc413',
  'photo-1677442136019-21780ecad995',
  'photo-1526374965328-7f61d4dc18c5',
] as const

export function getDemoMedia(index: number): DemoMediaAsset {
  const base = DEMO_MEDIA_ASSETS[index % DEMO_MEDIA_ASSETS.length]
  const posterId = EXTRA_POSTERS[(index + Math.floor(index / DEMO_MEDIA_ASSETS.length)) % EXTRA_POSTERS.length]
  if (index < DEMO_MEDIA_ASSETS.length) return base
  return {
    ...base,
    poster: `https://images.unsplash.com/${posterId}?w=720&h=1280&fit=crop&q=80`,
  }
}

/** One catalog slot → distinct video + poster (60 trends, 30 assets, posters always unique) */
export function getCatalogTrendMedia(slot: number): DemoMediaAsset {
  const videoIndex = slot % DEMO_MEDIA_ASSETS.length
  const base = DEMO_MEDIA_ASSETS[videoIndex]
  const posterId = EXTRA_POSTERS[slot % EXTRA_POSTERS.length]
  const poster =
    slot < DEMO_MEDIA_ASSETS.length && videoIndex === slot
      ? base.poster
      : `https://images.unsplash.com/${posterId}?w=720&h=1280&fit=crop&q=80&auto=format&slot=${slot}`
  return {
    video: base.video,
    poster,
    duration: base.duration,
  }
}

export function resolveUniqueCatalogMedia(
  slot: number,
  usedVideos: Set<string>,
  usedThumbnails: Set<string>,
): DemoMediaAsset {
  const maxAttempts = DEMO_MEDIA_ASSETS.length + EXTRA_POSTERS.length
  for (let offset = 0; offset < maxAttempts; offset += 1) {
    const media = getCatalogTrendMedia(slot + offset)
    if (!usedVideos.has(media.video) && !usedThumbnails.has(media.poster)) {
      usedVideos.add(media.video)
      usedThumbnails.add(media.poster)
      return media
    }
  }

  const fallback = getCatalogTrendMedia(slot)
  usedVideos.add(fallback.video)
  usedThumbnails.add(fallback.poster)
  return fallback
}
