#!/usr/bin/env python3
"""Fails when the words people read use a word the design system's content rules ban (CONTENT-DESIGN.md 2):
see, look, click, enable, disable, turn on, turn off, toggle, type for entering, above, below, please, just,
simply, easy, advanced, and drive for a disk.

Checks the README, llms.txt, the help in docs (not the notes of versions already released), the changelog's
newer sections, the text and labels of the demo and the set-up tool, and the sentences in snaglist.js. Code
blocks, inline code and link addresses are left out. A genuine exception goes in tools/wording-allow.tsv: the
file, a regular expression for the line, and the reason.

  python3 tools/check-wording.py
"""
import pathlib, re, sys

root = pathlib.Path(__file__).resolve().parent.parent
BANNED = re.compile(r"""\b(?:see|sees|seen|seeing|look|looks|looked|looking|click|clicks|clicked|clicking|
  enable|enables|enabled|enabling|disable|disables|disabled|disabling|toggle|toggles|toggled|toggling|
  turns?\s+(?:it\s+|them\s+)?(?:on|off)|turned\s+(?:on|off)|switched\s+off|typed|typing|type\s+(?:in|into)|
  above|below|please|just|simply|easy|easier|easiest|easily|advanced|drive|drives)\b""", re.I | re.X)
NOT_HITS = re.compile(r"\blook(?:s|ed|ing)?\s+up\b|\blookup\b", re.I)
# Versions released before this check: their notes and changelog sections are history and stay as written.
HISTORY = {"0.1.0", "0.2.0", "0.2.1", "0.3.0", "0.3.1", "0.3.2", "0.4.0", "0.4.1"}

allow = []
allow_file = root / "tools" / "wording-allow.tsv"
for line in allow_file.read_text().splitlines() if allow_file.exists() else []:
    if line.strip() and not line.startswith("#"):
        path, pattern, *_ = line.split("\t")
        allow.append((path, re.compile(pattern)))

def without_comments(line, inside):
    """Takes HTML comments out of one line, carrying a comment that is still open on to the next line (code scanning
    alert 1: a pattern on each line alone missed comments over several lines). Returns (line, still inside)."""
    out = ""
    while line:
        if inside:
            end = line.find("-->")
            if end < 0:
                return out, True
            line, inside = line[end + 3:], False
        else:
            start = line.find("<!--")
            if start < 0:
                return out + line, False
            out, line, inside = out + line[:start], line[start + 4:], True
    return out, inside


def markdown_lines(text):
    fenced = False
    comment = False
    for n, line in enumerate(text.splitlines(), 1):
        line, comment_after = without_comments(line, comment)
        was_in_comment, comment = comment, comment_after
        if was_in_comment and not line.strip():
            continue
        if line.lstrip().startswith(("```", "~~~")):
            fenced = not fenced
            continue
        if fenced:
            continue
        line = re.sub(r"`[^`]*`", "", line)
        line = re.sub(r"\]\([^)]*\)", "]", line)
        line = re.sub(r"https?://\S+", "", line)
        yield n, line

def changelog_lines(text):
    keep = True
    for n, line in markdown_lines(text):
        m = re.match(r"## \[([^\]]+)\]", line)
        if m:
            keep = m.group(1) not in HISTORY
        if keep:
            yield n, line

# Sentences in code: string literals with a space in them, outside regular expressions and selectors.
STRING = re.compile(r'"((?:[^"\\\n]|\\.)*)"|\'((?:[^\'\\\n]|\\.)*)\'|`((?:[^`\\]|\\.)*)`')
def code_lines(text):
    for n, line in enumerate(text.splitlines(), 1):
        if line.lstrip().startswith(("//", "/*", "*")):
            continue
        found = []
        for m in STRING.finditer(line):
            s = next(g for g in m.groups() if g is not None)
            if " " in s.strip() and not re.search(r"[\[\]{}=#>]|:not\(|\$\{", s.replace("${", "")):
                found.append(s)
        if found:
            yield n, " ".join(found)

def html_lines(text):
    in_script = in_style = False
    for n, line in enumerate(text.splitlines(), 1):
        if re.search(r"<script\b", line): in_script = True
        if re.search(r"<style\b", line): in_style = True
        if in_script:
            for _, s in code_lines(line): yield n, s
        elif not in_style:
            attrs = " ".join(re.findall(r'\b(?:aria-label|title|alt|placeholder|content)="([^"]*)"', line))
            yield n, re.sub(r"<[^>]*>", " ", line) + " " + attrs
        if re.search(r"</script>", line): in_script = False
        if re.search(r"</style>", line): in_style = False

def files():
    yield "README.md", markdown_lines
    yield "llms.txt", markdown_lines
    yield "CHANGELOG.md", changelog_lines
    for p in sorted((root / "docs").rglob("*.md")):
        rel = p.relative_to(root).as_posix()
        m = re.match(r"docs/releases/v(.+)\.md$", rel)
        if m and m.group(1) in HISTORY:
            continue
        yield rel, markdown_lines
    yield "index.html", html_lines
    yield "configure.html", html_lines
    yield "demo-starboard.html", html_lines
    yield "snaglist.js", code_lines

hits = 0
for rel, reader in files():
    text = (root / rel).read_text()
    for n, line in reader(text):
        clean = NOT_HITS.sub("", line)
        for m in BANNED.finditer(clean):
            if any(rel == path and pattern.search(line) for path, pattern in allow):
                continue
            hits += 1
            print(f"{rel}:{n}: \"{m.group(0)}\" in: {line.strip()[:140]}")
if hits:
    print(f"{hits} banned words in the text people read. Fix them, or add a genuine exception to tools/wording-allow.tsv.")
    sys.exit(1)
print("No banned words in the text people read.")
