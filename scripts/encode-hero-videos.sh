#!/usr/bin/env bash
# Encodes the hero screen recordings for the landing page.
#
# Put the raw recordings in the site folder as comment-blocked.mov and comment-censored.mov (the names the landing
# page expects), then run:  ./scripts/encode-hero-videos.sh
#
# For each recording this writes an MP4 (H.264) and a WebM (VP9) at 1920px wide and 30 fps, plus a poster image,
# into docs/.vitepress/theme/media/. The last frame is held for 1.5 seconds so the result can be read before the next video.
set -euo pipefail

cd "$(dirname "$0")/.."
out=docs/.vitepress/theme/media
mkdir -p "$out"
filters="fps=30,scale=1920:-2:flags=lanczos,tpad=stop_mode=clone:stop_duration=1.5"

for name in comment-blocked comment-censored; do
  src="$name.mov"
  if [[ ! -f "$src" ]]; then
    echo "Missing $src" >&2
    exit 1
  fi
  echo "Encoding $src"
  ffmpeg -loglevel error -y -i "$src" -vf "$filters" -c:v libx264 -preset slow -crf 21 -pix_fmt yuv420p \
    -movflags +faststart -an "$out/$name.mp4"
  ffmpeg -loglevel error -y -i "$src" -vf "$filters" -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 -an "$out/$name.webm"
  ffmpeg -loglevel error -y -i "$out/$name.mp4" -frames:v 1 -q:v 3 "$out/$name-poster.jpg"
done

ls -lh "$out"
