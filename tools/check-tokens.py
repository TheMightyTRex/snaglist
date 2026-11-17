#!/usr/bin/env python3
"""Checks that the fallback colours in snaglist.js match the design system's tokens.css, light and dark.
Snaglist carries its own copy of the values (it lives in a shadow root), so this stops them drifting.

  python3 tools/check-tokens.py [path/to/tokens.css]

Without a path it uses $DESIGN_SYSTEM/tokens.css, ../design-system/tokens.css or ~/src/design-system/tokens.css,
the first that exists. With none of them, it says so and passes, since the design system is a separate repository.
"""
import os, pathlib, re, sys

root = pathlib.Path(__file__).resolve().parent.parent
places = [sys.argv[1]] if len(sys.argv) > 1 else [os.path.join(os.environ.get("DESIGN_SYSTEM", "/nonexistent"), "tokens.css"),
    root.parent / "design-system" / "tokens.css", pathlib.Path.home() / "src" / "design-system" / "tokens.css"]
tokens_css = next((pathlib.Path(p) for p in places if pathlib.Path(p).is_file()), None)
if not tokens_css:
    print("SKIP TOKENS-01 no copy of the design system's tokens.css to compare with")
    sys.exit(0)

def block(text, start):
    i = text.index(start) + len(start)
    depth, j = 1, i
    while depth:
        depth += {"{": 1, "}": -1}.get(text[j], 0)
        j += 1
    return text[i:j - 1]

def raw(css):
    return dict(re.findall(r"--([\w-]+):\s*([^;]+);", css))

def hexes(v):
    v = v.split("/*")[0].strip().lower()
    return "#" + "".join(c * 2 for c in v[1:]) if re.fullmatch(r"#[0-9a-f]{3}", v) else v

def resolved(found):
    # var(--x) is worked out in the theme where it is used, as the browser does.
    def resolve(v):
        m = re.fullmatch(r"var\(--([\w-]+)\)", v.strip())
        return resolve(found[m.group(1)]) if m and m.group(1) in found else hexes(v)
    return {k: resolve(v) for k, v in found.items()}

tokens = tokens_css.read_text()
light_raw = raw(block(tokens, ":root {"))
light = resolved(light_raw)
dark = resolved({**light_raw, **raw(block(block(tokens, "@media (prefers-color-scheme: dark) {"), ':root:not([data-theme="light"]) {'))})

src = (root / "snaglist.js").read_text()
css = src[src.index("const CSS_TEXT = `"):]
SHORT = {"a": "color-accent", "at": "color-accent-text", "bg": "color-surface-raised", "tx": "color-text", "mu": "color-text-muted",
         "bd": "color-border", "sk": "color-surface-sunken", "er": "status-danger-fg", "erb": "status-danger-bg",
         "sb": "color-scrollbar", "sbh": "color-scrollbar-hover"}
checks = []
for name, value in re.findall(r"var\(--([\w-]+),\s*(#[0-9a-fA-F]{3,8})\)", block(css, ".sl {")):
    checks.append(("light", name, hexes(value), light))
for name, value in re.findall(r"var\(--([\w-]+),\s*(#[0-9a-fA-F]{3,8})\)", block(css, "@media (prefers-color-scheme: dark) { .sl--auto {")):
    checks.append(("dark, following the device", name, hexes(value), dark))
for short, value in re.findall(r"--(\w+):\s*(#[0-9a-fA-F]{3,8})", block(css, ".sl--dark {")):
    checks.append(("dark", SHORT.get(short, short), hexes(value), dark))

wrong = [(theme, name, value, table.get(name)) for theme, name, value, table in checks if table.get(name) != value]
for theme, name, value, want in wrong:
    print(f"FAIL TOKENS-01 {theme}: --{name} falls back to {value}, tokens.css has {want}")
if wrong:
    sys.exit(1)
print(f"PASS TOKENS-01 the {len(checks)} fallback colours in snaglist.js match tokens.css")
