/** Self-hosted + CDN vertical clips for demo variety (Mixkit License where noted). */

export type DemoMediaAsset = {
  video: string
  poster: string
  duration: string
}

const MIXKIT_DURATIONS = [
  '0:12',
  '0:15',
  '0:18',
  '0:10',
  '0:14',
  '0:16',
  '0:11',
  '0:13',
  '0:09',
  '0:20',
] as const

function mixkitClip(id: number, durationIndex: number): DemoMediaAsset {
  const duration = MIXKIT_DURATIONS[durationIndex % MIXKIT_DURATIONS.length]
  return {
    video: `https://assets.mixkit.co/videos/${id}/${id}-720.mp4`,
    poster: `https://assets.mixkit.co/videos/${id}/${id}-thumb-720-0.jpg`,
    duration,
  }
}

const MIXKIT_BATCH_A = (
  [
    4839, 1248, 1386, 1568, 2088, 2280, 2448, 2466, 2499, 2523, 2580, 2713, 2766, 2808, 2885,
    3000, 3041, 3098, 3125, 3158, 3190, 3237, 3272, 3329, 3372, 3398, 3442, 3450, 3508, 3560,
    3612, 3680, 3720, 3780,
  ] as const
).map((id, index) => mixkitClip(id, index + 4))

const MIXKIT_BATCH_B = (
  [
    1330, 1346, 1352, 1361, 1375, 1390, 1405, 1418, 1430, 1445, 1459, 1472, 1488, 1501, 1515,
    1530, 1545, 1560, 1575, 1590, 1605, 1620, 1635, 1650, 1665, 1680, 1695, 1710, 1725, 1740,
  ] as const
).map((id, index) => mixkitClip(id, index + 6))

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
  ...MIXKIT_BATCH_A,
  ...MIXKIT_BATCH_B,
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
  'photo-1502680392569-159e1ba066a4',
  'photo-1515886657613-9f3525f0cc0b',
  'photo-1529139574484-3128ddfd3119',
  'photo-1531746020798-e6953c6e8e04',
  'photo-1551836022-d5d88e9c9637',
  'photo-1558618666-fcd25c85cd64',
  'photo-1560472354-b33ff0c44a43',
  'photo-1565299624946-b28f40a0ae38',
  'photo-1581291518857-4e27b48ff24e',
  'photo-1586023492125-27b2c045efd7',
  'photo-1596462502278-27bfdc403348',
  'photo-1607082349566-187342175e2f',
  'photo-1611892440504-42a988e24f4d',
  'photo-1617137984095-74e4e5e3613f',
  'photo-1618221195710-e3f330e1e2e8',
  'photo-1625246333195-78d9c38ad449',
] as const

const CATALOG_VIDEO_STEP = 17

export function videoIndexForCatalogSlot(slot: number): number {
  return (slot * CATALOG_VIDEO_STEP + 3) % DEMO_MEDIA_ASSETS.length
}

export function posterForCatalogSlot(slot: number, videoIndex: number): string {
  const base = DEMO_MEDIA_ASSETS[videoIndex]
  if (slot < DEMO_MEDIA_ASSETS.length && slot === videoIndex && base.poster.startsWith('/')) {
    return base.poster
  }
  const posterId = EXTRA_POSTERS[slot % EXTRA_POSTERS.length]
  return `https://images.unsplash.com/${posterId}?w=720&h=1280&fit=crop&q=80&auto=format&slot=${slot}`
}

export function getDemoMedia(index: number): DemoMediaAsset {
  const base = DEMO_MEDIA_ASSETS[index % DEMO_MEDIA_ASSETS.length]
  const posterId = EXTRA_POSTERS[(index + Math.floor(index / DEMO_MEDIA_ASSETS.length)) % EXTRA_POSTERS.length]
  if (index < DEMO_MEDIA_ASSETS.length) return base
  return {
    ...base,
    poster: `https://images.unsplash.com/${posterId}?w=720&h=1280&fit=crop&q=80`,
  }
}

/** @deprecated Use buildCatalogMediaSlot from trend-media-assignment */
export function getCatalogTrendMedia(slot: number): DemoMediaAsset {
  const videoIndex = videoIndexForCatalogSlot(slot)
  const base = DEMO_MEDIA_ASSETS[videoIndex]
  return {
    video: base.video,
    poster: posterForCatalogSlot(slot, videoIndex),
    duration: base.duration,
  }
}
