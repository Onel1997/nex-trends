#!/usr/bin/env node
/**
 * Validates every demo MP4 + poster (Mixkit HEAD + local file check).
 * Exit 1 if any asset is unreachable.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const publicDir = path.join(root, 'public')
const nichesPath = path.join(root, 'src/lib/demo-media-niches.ts')

const nichesSource = fs.readFileSync(nichesPath, 'utf8')
const mixkitIds = [...nichesSource.matchAll(/\b(\d{3,6})\b/g)]
  .map((m) => Number(m[1]))
  .filter((id) => id > 99)

const uniqueIds = [...new Set(mixkitIds)]

const localVideos = [
  '/demo-videos/demo-1.mp4',
  '/demo-videos/demo-2.mp4',
  '/demo-videos/demo-3.mp4',
  '/demo-videos/demo-4.mp4',
]

async function headMixkit(id) {
  const video = `https://assets.mixkit.co/videos/${id}/${id}-720.mp4`
  const poster = `https://assets.mixkit.co/videos/${id}/${id}-thumb-720-0.jpg`
  const [videoRes, posterRes] = await Promise.all([
    fetch(video, { method: 'HEAD', redirect: 'follow' }),
    fetch(poster, { method: 'HEAD', redirect: 'follow' }),
  ])
  return {
    id,
    video,
    poster,
    videoOk: videoRes.ok,
    posterOk: posterRes.ok,
    videoStatus: videoRes.status,
    posterStatus: posterRes.status,
  }
}

function checkLocal(relPath) {
  const full = path.join(publicDir, relPath.replace(/^\//, ''))
  const posterPath = relPath.replace(/\.mp4$/i, '-poster.jpg')
  const posterFull = path.join(publicDir, posterPath.replace(/^\//, ''))
  return {
    path: relPath,
    videoOk: fs.existsSync(full),
    posterOk: fs.existsSync(posterFull),
  }
}

const failures = []

for (const rel of localVideos) {
  const { videoOk, posterOk, path: p } = checkLocal(rel)
  if (!videoOk) failures.push({ type: 'local-video', path: p })
  if (!posterOk) failures.push({ type: 'local-poster', path: p.replace('.mp4', '-poster.jpg') })
}

for (let i = 0; i < uniqueIds.length; i += 10) {
  const batch = uniqueIds.slice(i, i + 10)
  const results = await Promise.all(batch.map(headMixkit))
  for (const r of results) {
    if (!r.videoOk) {
      failures.push({ type: 'mixkit-video', id: r.id, status: r.videoStatus, url: r.video })
    }
    if (!r.posterOk) {
      failures.push({ type: 'mixkit-poster', id: r.id, status: r.posterStatus, url: r.poster })
    }
  }
}

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} invalid demo media asset(s):\n`)
  for (const f of failures) {
    if (f.type === 'local-video') console.error(`  local video missing: ${f.path}`)
    else if (f.type === 'local-poster') console.error(`  local poster missing: ${f.path}`)
    else console.error(`  mixkit ${f.id} (${f.type}): HTTP ${f.status} — ${f.url}`)
  }
  process.exit(1)
}

console.log(
  `✓ All demo media valid (${localVideos.length} local MP4s, ${uniqueIds.length} niche Mixkit clips)`,
)
