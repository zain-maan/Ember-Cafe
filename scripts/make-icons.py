"""Draw the PNG app icons (apple-touch-icon, 32 px fallback) to match public/favicon.svg.

Usage: python scripts/make-icons.py
"""

from pathlib import Path

from PIL import Image, ImageDraw

out = Path(__file__).resolve().parent.parent / "public"
S = 1024  # draw big, then shrink for smooth edges


def heart(cx, cy, w):
    # Two circles and a triangle make a clean heart at any size.
    r = w * 0.27
    return [(cx - r, cy - r * 0.35, r), (cx + r, cy - r * 0.35, r)], [(cx - w * 0.52, cy - r * 0.1), (cx + w * 0.52, cy - r * 0.1), (cx, cy + w * 0.62)]


def draw(rounded=True):
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    k = S / 64
    if rounded:
        d.rounded_rectangle([0, 0, S, S], radius=15 * k, fill="#d4622a")
    else:
        d.rectangle([0, 0, S, S], fill="#d4622a")
    cream = "#f6ead9"
    d.rounded_rectangle([44 * k, 27 * k, 58 * k, 37 * k], radius=5 * k, fill=cream)
    d.ellipse([9 * k, 11 * k, 51 * k, 53 * k], fill=cream)
    # coffee: darker rim, lighter centre
    for i, col in enumerate(["#5a2e16", "#7d4424", "#a8653a", "#bf8150", "#cf955f"]):
        r = (16 - i * 2.2) * k
        d.ellipse([30 * k - r, 32 * k - r, 30 * k + r, 32 * k + r], fill=col)
    circles, tri = heart(30 * k, 33 * k, 15 * k)
    for x, y, r in circles:
        d.ellipse([x - r, y - r, x + r, y + r], fill="#fbf2e4")
    d.polygon(tri, fill="#fbf2e4")
    return im


draw(rounded=False).resize((180, 180), Image.LANCZOS).save(out / "apple-touch-icon.png")
draw().resize((32, 32), Image.LANCZOS).save(out / "favicon-32.png")

print("icons written")
