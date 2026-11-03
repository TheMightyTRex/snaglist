#!/usr/bin/env bash
# Retakes the screenshots in docs/images from the demo and set-up pages: tools/screenshots.sh
# Serves this folder on your own computer, takes every shot in tools/screenshots/shoot.mjs in the Playwright
# image, and writes them to docs/images. Look at every picture before committing. Needs Docker and network
# access (the pages load the design system's styles, and the first run downloads the Playwright image).
set -euo pipefail
cd "$(dirname "$0")/.."
PORT="${SHOTS_PORT:-18793}"
PLAYWRIGHT="1.63.0"
work="$(mktemp -d)"
python3 -m http.server "$PORT" --bind 127.0.0.1 > "$work/server.log" 2>&1 &
server=$!
trap 'kill "$server" 2>/dev/null || true; rm -rf "$work"' EXIT
sleep 1

mkdir -p "$work/out"
docker run --rm --network host -u "$(id -u):$(id -g)" -e HOME=/tmp \
  -e BASE="http://127.0.0.1:$PORT" -e OUT=/work/out \
  -v "$work:/work" -v "$PWD/tools/screenshots/shoot.mjs:/shots/shoot.mjs:ro" \
  "mcr.microsoft.com/playwright:v$PLAYWRIGHT-noble" \
  sh -c "mkdir -p /tmp/s && cp /shots/shoot.mjs /tmp/s/ && cd /tmp/s && npm init -y >/dev/null && npm i --silent playwright@$PLAYWRIGHT >/dev/null && node shoot.mjs"

mkdir -p docs/images
cp "$work"/out/*.png docs/images/
command -v pngquant >/dev/null && pngquant --force --ext .png --quality 70-90 docs/images/*.png || true
echo "Written to docs/images. Look at each one before committing."
