#!/usr/bin/env bash
# Downloads Mixkit vertical demo clips into public/demo-videos (Mixkit License).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/demo-videos"
mkdir -p "$OUT"

fetch() {
  local id="$1" name="$2" poster_idx="${3:-0}"
  curl -fsSL -o "$OUT/${name}.mp4" "https://assets.mixkit.co/videos/${id}/${id}-720.mp4"
  curl -fsSL -o "$OUT/${name}-poster.jpg" "https://assets.mixkit.co/videos/${id}/${id}-thumb-720-${poster_idx}.jpg"
  echo "✓ ${name}"
}

fetch 32808 demo-1 0
fetch 1214 demo-2 0
fetch 4059 demo-3 1
fetch 1191 demo-4 0

echo "Done — $(du -sh "$OUT" | cut -f1) total"
