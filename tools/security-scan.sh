#!/usr/bin/env bash
# Runs the free security scanners against this checkout and a throwaway copy of it:  tools/security-scan.sh
#
#   Gitleaks   keys and passwords anywhere in the git history
#   Trivy      keys, known problems and risky set-up in the files here (there is no image to scan)
#   ESLint     risky patterns in the JavaScript: HTML built from text (no-unsanitized), eval and the like
#              (eslint-plugin-security), in snaglist.js, the example worker, the screenshot tool and the pages
#   Semgrep    the same, with Semgrep's JavaScript, cross-site scripting and secrets rules
#   Bandit     risky patterns in the Python tool
#   ShellCheck mistakes in the shell scripts
#   ZAP        a baseline scan of the demo and set-up pages served from a throwaway copy (--full: also an
#              active scan). The copy and ZAP share a private Docker network with no way out, so ZAP cannot
#              reach your other apps, this computer or the internet.
#   CodeQL     (--full only) GitHub's code scanning, run here, with the JavaScript security queries
#
# Snaglist has no server, sign-in or Docker image, so there is no signed-in scan and no Hadolint.
# Everything runs in Docker from pinned images; nothing is installed on this computer.
# Needs Docker, and network access to download the scanners (about 2 GB the first time, mostly ZAP).
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1
NET=snaglist-scan-net
TARGET="http://snaglist-scan:8777"
FULL=0
[ "${1:-}" = "--full" ] && FULL=1
TRIVY=aquasec/trivy:0.69.1
ZAP=ghcr.io/zaproxy/zaproxy:stable
NODE=node:24.13.0-bookworm-slim
CODEQL=2.23.3
work="$(mktemp -d)"
trap 'docker rm -f snaglist-scan >/dev/null 2>&1; docker network rm "$NET" >/dev/null 2>&1; rm -rf "$work"' EXIT
failed=0
say() { printf '\n== %s\n' "$*"; }
result() { if [ "$1" = 0 ]; then echo "PASS $2"; else echo "FAIL $2"; failed=1; fi; }

say "Gitleaks: the whole git history"
docker run --rm -v "$PWD:/repo:ro" zricethezav/gitleaks:v8.28.0 git /repo --no-banner --redact
result $? "Gitleaks"

say "Trivy: keys, known problems and set-up in the files"
docker run --rm -v "$PWD:/src:ro" -v "$HOME/.cache/trivy:/root/.cache" "$TRIVY" \
  fs --quiet --scanners vuln,secret,misconfig --exit-code 1 /src
result $? "Trivy"

say "ESLint: HTML built from text, eval and other risky patterns"
docker run --rm -u "$(id -u):$(id -g)" -e HOME=/tmp -v "$PWD:/src:ro" -v "$PWD/tools/eslint.config.mjs:/lint/eslint.config.mjs:ro" \
  "$NODE" sh -c 'mkdir -p /tmp/l && cd /tmp/l && cp /lint/eslint.config.mjs . && npm init -y >/dev/null &&
    npm i --silent eslint@9.39.1 eslint-plugin-no-unsanitized@4.1.4 eslint-plugin-security@3.0.1 globals@16.5.0 >/dev/null &&
    mkdir -p src && cp /src/snaglist.js /src/examples/github-worker.js /src/tools/screenshots/shoot.mjs src/ &&
    for f in index configure; do
      node -e "const s=require(\"fs\").readFileSync(process.argv[1],\"utf8\");
        process.stdout.write([...s.matchAll(/<script>([\\s\\S]*?)<\\/script>/g)].map((m)=>m[1]).join(\"\\n\"))" \
        "/src/$f.html" > "src/$f-inline.js"
    done && npx eslint --max-warnings 0 src'
result $? "ESLint"

say "Semgrep: JavaScript, cross-site scripting and secrets"
mkdir -p "$work/js"
cp snaglist.js examples/github-worker.js "$work/js/"
for f in index configure; do
  python3 -c 'import re, sys; print("\n".join(m.group(1) for m in re.finditer(r"<script>([\s\S]*?)</script>", open(sys.argv[1]).read())))' \
    "$f.html" > "$work/js/$f-inline.js"
done
docker run --rm -v "$work/js:/src:ro" semgrep/semgrep:1.142.0 semgrep scan --metrics=off --quiet --error \
  --config p/javascript --config p/xss --config p/secrets /src
result $? "Semgrep"

say "Bandit: medium and high"
docker run --rm -v "$PWD:/src:ro" python:3.12-alpine sh -c \
  "pip install -q bandit >/dev/null 2>&1 && bandit -q -r /src/tools -ll 2>/dev/null"
result $? "Bandit"

say "ShellCheck"
docker run --rm -v "$PWD:/mnt:ro" koalaman/shellcheck:v0.11.0 -S warning tools/*.sh
result $? "ShellCheck"

say "ZAP against a throwaway copy, on a private network"
mkdir -p "$work/site" "$work/zap" && chmod 777 "$work/zap"
git archive HEAD | tar -x -C "$work/site"
cp snaglist.js index.html configure.html "$work/site/"
docker network rm "$NET" >/dev/null 2>&1
docker network create --internal "$NET" >/dev/null
docker run -d --name snaglist-scan --network "$NET" -u "$(id -u):$(id -g)" -v "$work/site:/site:ro" \
  --read-only --cap-drop ALL python:3.12-alpine python -m http.server 8777 --directory /site >/dev/null
sleep 2
# The warnings explained in docs/SECURITY-AND-TESTS.md are marked IGNORE in tools/zap-rules.tsv.
cp tools/zap-rules.tsv "$work/zap/rules.tsv"
docker run --rm --network "$NET" -v "$work/zap:/zap/wrk:rw" "$ZAP" \
  zap-baseline.py -t "$TARGET/index.html" -j -m 3 -c rules.tsv > "$work/zap/baseline.txt" 2>&1
grep -E -A4 "^(FAIL|WARN)-NEW" "$work/zap/baseline.txt"
grep -q "FAIL-NEW: 0.*WARN-NEW: 0" "$work/zap/baseline.txt"
result $? "ZAP baseline (any WARN-NEW or FAIL-NEW above needs a look)"

if [ "$FULL" = 1 ]; then
  say "ZAP active scan"
  docker run --rm --network "$NET" -v "$work/zap:/zap/wrk:rw" "$ZAP" \
    zap-full-scan.py -t "$TARGET/index.html" -j -m 3 -T 20 -c rules.tsv > "$work/zap/full.txt" 2>&1
  grep -E -A4 "^(FAIL|WARN)-NEW" "$work/zap/full.txt"
  grep -q "FAIL-NEW: 0.*WARN-NEW: 0" "$work/zap/full.txt"
  result $? "ZAP active scan"

  say "CodeQL: JavaScript security and quality queries (downloads about 500 MB the first time)"
  mkdir -p "$HOME/.cache/codeql"
  docker run --rm -u "$(id -u):$(id -g)" -e HOME=/tmp -v "$PWD:/src:ro" -v "$HOME/.cache/codeql:/cache" "$NODE" sh -c "
    set -e
    cd /cache
    if [ ! -x codeql-$CODEQL/codeql/codeql ]; then
      node -e 'fetch(process.argv[1]).then(r=>r.arrayBuffer()).then(b=>require(\"fs\").writeFileSync(\"b.tgz\",Buffer.from(b)))' \
        https://github.com/github/codeql-action/releases/download/codeql-bundle-v$CODEQL/codeql-bundle-linux64.tar.gz
      mkdir -p codeql-$CODEQL && tar -xzf b.tgz -C codeql-$CODEQL && rm b.tgz
    fi
    q=codeql-$CODEQL/codeql/codeql
    rm -rf /tmp/db /tmp/src && cp -r /src /tmp/src && rm -rf /tmp/src/.git
    \$q database create /tmp/db --language=javascript --source-root /tmp/src --overwrite >/dev/null
    \$q database analyze /tmp/db codeql/javascript-queries:codeql-suites/javascript-security-and-quality.qls \
      --format=csv --output=/tmp/codeql.csv >/dev/null
    cat /tmp/codeql.csv
    [ ! -s /tmp/codeql.csv ]"
  result $? "CodeQL (each line above is an alert)"
fi

say "Done"
if [ "$failed" = 0 ]; then echo "Every scanner passed."; else echo "Something needs a look: see FAIL above."; fi
exit "$failed"
