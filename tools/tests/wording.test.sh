#!/usr/bin/env bash
# The words people read follow the design system's content rules (tools/check-wording.py), and Snaglist's fallback
# colours match the design system's tokens.css (tools/check-tokens.py).
set -uo pipefail
here="$(cd "$(dirname "$0")/../.." && pwd)"
failures=0
if out="$(python3 "$here/tools/check-wording.py")"; then echo "PASS WORD-01 no banned words in the text people read"
else echo "FAIL WORD-01 banned words in the text people read"; echo "$out" | sed 's/^/  /'; failures=$((failures + 1)); fi
# The check itself: a banned word in a throwaway copy is caught.
copy="$(mktemp -d)"
(cd "$here" && git ls-files -co --exclude-standard -z | xargs -0 cp --parents -t "$copy")
printf '\nClick here to read more.\n' >> "$copy/README.md"
if python3 "$copy/tools/check-wording.py" >/dev/null; then echo "FAIL WORD-02 the check missed a banned word"; failures=$((failures + 1))
else echo "PASS WORD-02 the check catches a banned word"; fi
rm -rf "$copy"
python3 "$here/tools/check-tokens.py" || failures=$((failures + 1))
[ "$failures" = 0 ] || { echo "$failures failed"; exit 1; }
