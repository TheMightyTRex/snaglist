#!/usr/bin/env python3
"""Writes docs/topics/fix-common-accessibility-problems.md from the RULES in snaglist.js, so the help and the
reports give the same advice. Run after changing a rule: python3 tools/fix-guide.py"""
import json, pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent
src = (root / "snaglist.js").read_text()
block = src[src.index("const RULES = ["):src.index("async function runCheck()")]

def field(chunk, name):
    m = re.search(rf'\b{name}: ("(?:[^"\\]|\\.)*"|\'(?:[^\'\\]|\\.)*\')', chunk)
    if not m: return ""
    s = m.group(1)
    if s.startswith("'"): s = '"' + s[1:-1].replace('"', '\\"').replace("\\'", "'") + '"'
    return json.loads(s)

rules = [c for c in re.split(r"\n    \{ id: ", block)[1:]]
out = ["""[Help centre](../README.md) · Accessibility · Reference

# Fix common accessibility problems

How to fix each problem Snaglist's accessibility check finds, with code before and after. Seven of them are
broken on purpose on the [demo page](https://themightytrex.github.io/snaglist/), under **Accessibility problems
to find** and in the line of faint text, so you can try the check and the fix.

To have an AI assistant fix them for you, use the prompt **Fix the accessibility problems Snaglist found** in
[Prompts for AI assistants](../AI-PROMPTS.md).

<!-- Made by tools/fix-guide.py from the rules in snaglist.js. Change the rules there, then run it again. -->
"""]
for chunk in rules:
    rid = re.match(r'"([^"]+)"', chunk).group(1)
    name, wcag, level, impact = field(chunk, "name"), field(chunk, "wcag"), field(chunk, "level"), field(chunk, "impact")
    why, fix, before, after = field(chunk, "why"), field(chunk, "fix"), field(chunk, "before"), field(chunk, "after")
    lang = "css" if before.lstrip().startswith(".") else "html"
    out += [f"## {name}", "", f"WCAG {wcag}, level {level}. Impact: {impact}. Rule `{rid}`.", "", f"**Why it matters:** {why}", "",
            f"**How to fix it:** {fix}", "", "Before:", "", f"```{lang}", before, "```", "", "After:", "", f"```{lang}", after, "```", ""]
out += ["## What the automatic check cannot find", "",
        "Automatic checks find only some problems. Before a release, also:", "",
        "- use every page with a keyboard only: Tab, Shift and Tab, Enter, Space and Escape;",
        "- zoom the browser to 200% and 400%, and check nothing is cut off or overlaps;",
        "- listen to the page with a screen reader, such as NVDA on Windows, VoiceOver on a Mac or iPhone, or TalkBack on Android;",
        "- check that error messages say how to fix the problem, and that nothing depends on colour alone.", "",
        "## Find out more", "",
        "- [Check a page for accessibility problems](check-a-page-for-accessibility-problems.md)",
        "- [Turn on the accessibility check](activate-the-accessibility-check.md)",
        "- [Find and fix accessibility problems](../guides/find-and-fix-accessibility-problems.md)",
        "- [WCAG 2.2 quick reference](https://www.w3.org/WAI/WCAG22/quickref/) (opens in a new tab)", ""]
(root / "docs/topics/fix-common-accessibility-problems.md").write_text("\n".join(out))
print(len(rules), "rules")
