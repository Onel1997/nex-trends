#!/usr/bin/env bash
# Creates *-mobile.mp4 variants (~480p, lower bitrate) for faster iPhone Safari startup.
# Requires ffmpeg. After running, set HAS_MOBILE_DEMO_VARIANTS = true in video-url-adaptive.ts

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIR="$ROOT/public/demo-videos"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg not found. Install ffmpeg, then re-run: npm run compress:demo-videos"
  exit 1
fi

for src in "$DIR"/demo-*.mp4; do
  [[ "$src" == *-mobile.mp4 ]] && continue
  base="${src%.mp4}"
  out="${base}-mobile.mp4"
  echo "Encoding $(basename "$out") ..."
  ffmpeg -y -i "$src" \
    -vf "scale='min(480,iw)':-2" \
    -c:v libx264 -preset fast -crf 28 -profile:v baseline -level 3.0 \
    -movflags +faststart -an \
    "$out"
done

echo "Done. Set HAS_MOBILE_DEMO_VARIANTS = true in src/lib/video-url-adaptive.ts"
