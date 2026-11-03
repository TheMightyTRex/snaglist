#!/usr/bin/env bash
# Runs Snaglist's tests: tools/test.sh   (ONLY=security.test.mjs tools/test.sh runs one file;
# BROWSERS="chromium" tools/test.sh runs one browser)
# Runs every tools/tests/*.test.sh here, then serves this folder on your own computer and runs every
# tools/tests/*.test.mjs in the Playwright image. Each test prints PASS or FAIL with its ID, listed in
# docs/SECURITY-AND-TESTS.md. Needs Docker; the first run downloads the Playwright image. Nothing leaves this
# computer: the test pages may load only files from this folder, and anything else is refused.
set -euo pipefail
cd "$(dirname "$0")/.."
status=0
if [ -z "${ONLY:-}" ]; then for t in tools/tests/*.test.sh; do "$t" || status=1; done; fi
PORT="${TEST_PORT:-18794}"
PLAYWRIGHT="1.63.0"
work="$(mktemp -d)"
# Serve a copy of the files git would publish, so .git and .private-words are never on offer, even locally.
mkdir -p "$work/site"
git ls-files -co --exclude-standard -z | xargs -0 cp --parents -t "$work/site"
python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$work/site" > "$work/server.log" 2>&1 &
server=$!
trap 'kill "$server" 2>/dev/null || true; rm -rf "$work"' EXIT
sleep 1

docker run --rm --network host -u "$(id -u):$(id -g)" -e HOME=/tmp -e BASE="http://127.0.0.1:$PORT" \
  -v "$PWD/tools/tests:/tests:ro" -v "$PWD:/repo:ro" "mcr.microsoft.com/playwright:v$PLAYWRIGHT-noble" \
  sh -c "mkdir -p /tmp/t && cp /tests/* /tmp/t/ && cd /tmp/t && npm init -y >/dev/null && npm i --silent playwright@$PLAYWRIGHT >/dev/null &&
    status=0; for f in ${ONLY:-*.test.mjs}; do for b in ${BROWSERS:-chromium firefox webkit}; do
      BROWSER=\$b node \"\$f\" || status=1; done; done; exit \$status" || status=1
exit "$status"
