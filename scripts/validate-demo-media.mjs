#!/usr/bin/env node
/**
 * Validates demo MP4 + poster assets (reachability, size, poster index, blocklists).
 * Exit 1 if any required asset is invalid.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const publicDir = path.join(root, 'public')
const nichesPath = path.join(root, 'src/lib/demo-media-niches.ts')
const qualityPath = path.join(root, 'src/lib/demo-video-quality.ts')

const nichesSource = fs.readFileSync(nichesPath, 'utf8')
const qualitySource = fs.readFileSync(qualityPath, 'utf8')

const mixkitIds = [...nichesSource.matchAll(/\b(\d{3,6})\b/g)]
  .map((m) => Number(m[1]))
  .filter((id) => id > 99)

function extractSetIds(source, marker) {
  const start = source.indexOf(marker)
  if (start < 0) return []
  const slice = source.slice(start, start + 400)
  const block = slice.match(/\[([\s\S]*?)\]/)
  return block ? [...block[1].matchAll(/\d+/g)].map(Number) : []
}

const blockedSet = new Set([
  ...extractSetIds(qualitySource, 'BLOCKED_MIXKIT_IDS'),
  ...extractSetIds(qualitySource, 'QUALITY_BLOCKED_MIXKIT_IDS'),
])
const uniqueIds = [...new Set(mixkitIds)].filter((id) => !blockedSet.has(id))

const posterIndexMap = new Map()
const posterBlock = qualitySource.match(
  /MIXKIT_POSTER_INDEX[\s\S]*?\{([\s\S]*?)\}/,
)
if (posterBlock) {
  for (const match of posterBlock[1].matchAll(/(\d+):\s*(\d+)/g)) {
    posterIndexMap.set(Number(match[1]), Number(match[2]))
  }
}

const localVideos = [
  '/demo-videos/demo-1.mp4',
  '/demo-videos/demo-2.mp4',
  '/demo-videos/demo-3.mp4',
  '/demo-videos/demo-4.mp4',
]

const MIN_VIDEO_BYTES = 12_000
const MIN_POSTER_BYTES = 800
/** JPEG byte heuristic — only flag extremely dark posters (runtime uses canvas luma). */
const MAX_DARK_POSTER_AVG = 82

async function headUrl(url) {
  const res = await fetch(url, { method: 'HEAD', redirect: 'follow' })
  return { ok: res.ok, status: res.status, length: Number(res.headers.get('content-length') ?? 0) }
}

async function estimatePosterBrightness(url) {
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) return { ok: false, avg: 0 }
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < MIN_POSTER_BYTES) return { ok: false, avg: 0 }
  let sum = 0
  const start = Math.floor(buf.length * 0.12)
  const step = 13
  let samples = 0
  for (let i = start; i < buf.length; i += step) {
    sum += buf[i]
    samples += 1
  }
  return { ok: true, avg: samples > 0 ? sum / samples : 0 }
}

async function resolveBestPoster(id) {
  const preferred = posterIndexMap.get(id) ?? 0
  const order = [preferred, 3, 1, 2, 0].filter((v, i, a) => a.indexOf(v) === i)
  for (const idx of order) {
    const url = `https://assets.mixkit.co/videos/${id}/${id}-thumb-720-${idx}.jpg`
    const head = await headUrl(url)
    if (!head.ok) continue
    const bright = await estimatePosterBrightness(url)
    if (!bright.ok) continue
    return { url, idx, avg: bright.avg, bytes: head.length }
  }
  return null
}

async function headMixkit(id) {
  const video = `https://assets.mixkit.co/videos/${id}/${id}-720.mp4`
  const videoHead = await headUrl(video)
  const poster = await resolveBestPoster(id)
  return { id, video, videoHead, poster }
}

function checkLocal(relPath) {
  const full = path.join(publicDir, relPath.replace(/^\//, ''))
  const posterPath = relPath.replace(/\.mp4$/i, '-poster.jpg')
  const posterFull = path.join(publicDir, posterPath.replace(/^\//, ''))
  return {
    path: relPath,
    videoOk: fs.existsSync(full),
    videoBytes: fs.existsSync(full) ? fs.statSync(full).size : 0,
    posterOk: fs.existsSync(posterFull),
    posterBytes: fs.existsSync(posterFull) ? fs.statSync(posterFull).size : 0,
  }
}

const failures = []
const warnings = []

for (const rel of localVideos) {
  const { videoOk, posterOk, path: p, videoBytes, posterBytes } = checkLocal(rel)
  if (!videoOk) failures.push({ type: 'local-video', path: p })
  else if (videoBytes < MIN_VIDEO_BYTES) {
    failures.push({ type: 'local-video-small', path: p, bytes: videoBytes })
  }
  if (!posterOk) failures.push({ type: 'local-poster', path: p.replace('.mp4', '-poster.jpg') })
  else if (posterBytes < MIN_POSTER_BYTES) {
    failures.push({ type: 'local-poster-small', path: p, bytes: posterBytes })
  }
}

for (let i = 0; i < uniqueIds.length; i += 8) {
  const batch = uniqueIds.slice(i, i + 8)
  const results = await Promise.all(batch.map(headMixkit))
  for (const r of results) {
    if (!r.videoHead.ok) {
      failures.push({
        type: 'mixkit-video',
        id: r.id,
        status: r.videoHead.status,
        url: r.video,
      })
    } else if (r.videoHead.length > 0 && r.videoHead.length < MIN_VIDEO_BYTES) {
      failures.push({
        type: 'mixkit-video-small',
        id: r.id,
        bytes: r.videoHead.length,
        url: r.video,
      })
    }
    if (!r.poster) {
      failures.push({ type: 'mixkit-poster', id: r.id, url: `thumb indices for ${r.id}` })
    } else if (r.poster.avg < MAX_DARK_POSTER_AVG) {
      failures.push({
        type: 'mixkit-poster-dark',
        id: r.id,
        avg: Math.round(r.poster.avg),
        url: r.poster.url,
      })
    } else if (posterIndexMap.get(r.id) != null && r.poster.idx !== posterIndexMap.get(r.id)) {
      warnings.push(
        `  poster index hint: ${r.id} configured=${posterIndexMap.get(r.id)} best=${r.poster.idx}`,
      )
    }
  }
}

if (warnings.length > 0) {
  console.warn('\nDemo media warnings:\n' + warnings.join('\n'))
}

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} invalid demo media asset(s):\n`)
  for (const f of failures) {
    if (f.type === 'local-video') console.error(`  local video missing: ${f.path}`)
    else if (f.type === 'local-poster') console.error(`  local poster missing: ${f.path}`)
    else if (f.type === 'mixkit-poster-dark') {
      console.error(`  mixkit ${f.id} poster too dark (avg≈${f.avg}): ${f.url}`)
    } else console.error(`  mixkit ${f.id} (${f.type}): ${f.url ?? f.status ?? ''}`)
  }
  process.exit(1)
}

console.log(
  `✓ All demo media valid (${localVideos.length} local MP4s, ${uniqueIds.length} niche Mixkit clips, quality-filtered)`,
)
