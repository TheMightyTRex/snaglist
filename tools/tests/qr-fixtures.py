#!/usr/bin/env python3
"""Writes qr-fixtures.json: QR codes made by the design system's encoder (terminal/qr.py), which Snaglist's
encoder is ported from. qr.test.mjs checks that Snaglist draws every one module for module.

    python3 tools/tests/qr-fixtures.py [path to the design system]   (default ~/src/design-system)
"""
import hashlib
import json
import os
import sys

ds = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser("~/src/design-system")
sys.path.insert(0, os.path.join(ds, "terminal"))
import qr  # noqa: E402

words = "The save button does nothing when the form has a long name in it. "
texts = [
    "A",
    "https://example.org/",
    "https://github.com/TheMightyTRex/snaglist/issues/new?title=Something%20is%20broken",
    "Café, naïve, 東京 and ✓ in UTF-8",
    (words * 4)[:180],                # version 7 to 9: the version information is drawn
    (words * 12)[:700],               # version 10 and over: a 16-bit length
    "https://github.com/x/y/issues/new?body=" + "%20".join(["word"] * 150),  # about 1,100 bytes, near the most Snaglist puts in a code
    (words * 45)[:2900],              # version 40
]
out = []
for text in texts:
    code = qr.encode(text)
    bits = "\n".join("".join("1" if d else "0" for d in row) for row in code.modules)
    out.append({"text": text, "version": code.version, "level": code.level, "mask": code.mask,
                "sha256": hashlib.sha256(bits.encode()).hexdigest()})
path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "qr-fixtures.json")
with open(path, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
    f.write("\n")
print("\n".join(f"{len(t['text'].encode())} bytes: version {t['version']}, level {t['level']}, mask {t['mask']}" for t in out))
