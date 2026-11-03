#!/usr/bin/env bash
# Tests for tools/check-private.sh, in a throwaway git repository with made-up private words.
set -uo pipefail
here="$(cd "$(dirname "$0")/../.." && pwd)"
failures=0
# The made-up private word is ExampleTRex in lower case, built here so this file never holds it.
word="$(printf 'ExampleTRex' | tr '[:upper:]' '[:lower:]')"
check() { # id, name, file content, expected exit (0 passes, 1 stopped)
  local repo; repo="$(mktemp -d)"
  (cd "$repo" && git init -q && mkdir tools && cp "$here/tools/check-private.sh" tools/ &&
    printf '%s\n-dashword\n' "$word" > .private-words && printf '.private-words\n' > .gitignore &&
    printf '%s\n' "$3" > notes.md && git add -A)
  (cd "$repo" && tools/check-private.sh >/dev/null 2>&1); local got=$?
  rm -rf "$repo"
  if [ "$got" = "$4" ]; then echo "PASS $1 $2"; else echo "FAIL $1 $2 (exit $got, expected $4)"; failures=$((failures + 1)); fi
}
check SEC-17 "a private word is caught even when written with TRex" "Made by ExampleTRex" 1
check SEC-17 "a private word is caught in lower case" "Made by $word" 1
check SEC-17 "the public names still pass" "By TheMightyTRex and TheMightyTRexUK, for the TRex Design System" 0
check SEC-18 "a private word starting with a hyphen is checked" "see -dashword here" 1
[ "$failures" = 0 ] || { echo "$failures failed"; exit 1; }
