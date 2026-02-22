#!/usr/bin/env bash
set -euo pipefail

# Optimizes all MP4 files in public/videos and generates:
# - *.mobile.mp4  (smaller width/bitrate)
# - *.desktop.mp4 (larger width/bitrate)
# - *.poster.jpg  (thumbnail poster)
#
# Usage:
#   bash scripts/optimize-videos.sh
# Optional env:
#   SRC_DIR=public/videos
#   SKIP_EXISTING=1

SRC_DIR="${SRC_DIR:-public/videos}"
SKIP_EXISTING="${SKIP_EXISTING:-1}"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg is required but not found in PATH."
  exit 1
fi

if [[ ! -d "$SRC_DIR" ]]; then
  echo "Directory not found: $SRC_DIR"
  exit 1
fi

shopt -s nullglob
files=("$SRC_DIR"/*.mp4)

if [[ ${#files[@]} -eq 0 ]]; then
  echo "No .mp4 files found in $SRC_DIR"
  exit 0
fi

for input in "${files[@]}"; do
  # Skip already generated variants
  if [[ "$input" == *.mobile.mp4 || "$input" == *.desktop.mp4 ]]; then
    continue
  fi

  base="${input%.mp4}"
  mobile_out="${base}.mobile.mp4"
  desktop_out="${base}.desktop.mp4"
  poster_out="${base}.poster.jpg"

  echo "Processing: $input"

  if [[ "$SKIP_EXISTING" != "1" || ! -f "$mobile_out" ]]; then
    ffmpeg -y -i "$input" \
      -vf "scale='min(720,iw)':-2,fps=24" \
      -c:v libx264 -preset slow -crf 30 \
      -movflags +faststart -an \
      "$mobile_out"
  else
    echo "  skip mobile (exists): $mobile_out"
  fi

  if [[ "$SKIP_EXISTING" != "1" || ! -f "$desktop_out" ]]; then
    ffmpeg -y -i "$input" \
      -vf "scale='min(1280,iw)':-2,fps=24" \
      -c:v libx264 -preset slow -crf 27 \
      -movflags +faststart -an \
      "$desktop_out"
  else
    echo "  skip desktop (exists): $desktop_out"
  fi

  if [[ "$SKIP_EXISTING" != "1" || ! -f "$poster_out" ]]; then
    ffmpeg -y -i "$input" \
      -vf "thumbnail,scale='min(1280,iw)':-2" \
      -frames:v 1 -q:v 3 \
      "$poster_out"
  else
    echo "  skip poster (exists): $poster_out"
  fi
done

echo "Done."
