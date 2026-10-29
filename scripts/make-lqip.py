"""Rebuild src/lqip.json: a 16 px WebP of every photo, inlined as base64 for the blur-up preview.

Unsplash's own tiny renders carry ~3 kB of metadata each, so we shrink our local copies instead.
Usage: python scripts/make-lqip.py   (run after npm run images)
"""

import base64
import io
import json
from pathlib import Path

from PIL import Image

root = Path(__file__).resolve().parent.parent
images = root / "public" / "images"
out = {}
for f in sorted(images.glob("*.webp")):
    name, width = f.stem.rsplit("-", 1)
    if name in out:
        continue
    im = Image.open(f).convert("RGB")
    im.thumbnail((16, 16))
    buf = io.BytesIO()
    im.save(buf, "WEBP", quality=45)
    out[name] = "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()

(root / "src" / "lqip.json").write_text(json.dumps(out, indent=2) + "\n")
print(len(out), "previews,", sum(len(v) for v in out.values()) // 1024, "kB")
