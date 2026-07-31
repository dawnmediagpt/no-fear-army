"""
og-card generator for no-fear-army.netlify.app
1200x630 · black bg · thin gold inset border · gold flame mark ·
'THE FEAR DETOX' title · 'Free · 10 minutes · Doll Avant' subline.
Writes public/og-card.png so Vite copies it into dist/ at build time.
"""

from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1200, 630
BG = (17, 17, 17)
GOLD = (233, 195, 31)
MUTED = (170, 170, 170)
WHITE = (255, 255, 255)

FONT_CANDIDATES_BOLD = [
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/Library/Fonts/Arial Bold.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
]
FONT_CANDIDATES_REG = [
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/Library/Fonts/Arial.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
]


def load_font(size, bold=True):
    for path in (FONT_CANDIDATES_BOLD if bold else FONT_CANDIDATES_REG):
        try:
            return ImageFont.truetype(path, size)
        except (OSError, IOError):
            continue
    return ImageFont.load_default()


def text_size(draw, text, font):
    l, t, r, b = draw.textbbox((0, 0), text, font=font)
    return r - l, b - t


def draw_flame(draw, cx, cy, s):
    """Simple gold flame silhouette centered around (cx, cy). s scales size."""
    outer = [
        (cx,           cy - 90 * s),
        (cx + 32 * s,  cy - 40 * s),
        (cx + 46 * s,  cy + 10 * s),
        (cx + 34 * s,  cy + 54 * s),
        (cx,           cy + 68 * s),
        (cx - 34 * s,  cy + 54 * s),
        (cx - 46 * s,  cy + 10 * s),
        (cx - 32 * s,  cy - 40 * s),
    ]
    draw.polygon(outer, fill=GOLD)
    inner = [
        (cx,          cy - 20 * s),
        (cx + 18 * s, cy + 10 * s),
        (cx + 22 * s, cy + 38 * s),
        (cx,          cy + 52 * s),
        (cx - 22 * s, cy + 38 * s),
        (cx - 18 * s, cy + 10 * s),
    ]
    draw.polygon(inner, fill=BG)


def main():
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    inset = 24
    d.rectangle([inset, inset, W - inset, H - inset], outline=GOLD, width=2)

    draw_flame(d, W // 2, 150, s=0.9)

    f_title = load_font(140)
    title = "THE FEAR DETOX"
    tw, th = text_size(d, title, f_title)
    d.text(((W - tw) / 2, 260), title, font=f_title, fill=GOLD)

    f_sub = load_font(38, bold=False)
    sub = "Free  ·  10 minutes  ·  Doll Avant"
    tw, th = text_size(d, sub, f_sub)
    d.text(((W - tw) / 2, 430), sub, font=f_sub, fill=WHITE)

    f_tag = load_font(24)
    tag = "F  I M P O S S I B L E"
    tw, th = text_size(d, tag, f_tag)
    d.text(((W - tw) / 2, 528), tag, font=f_tag, fill=GOLD)

    out = os.path.join(os.path.dirname(__file__) or ".", "og-card.png")
    img.save(out, "PNG")
    print(f"wrote {out}  ({W}x{H})")


if __name__ == "__main__":
    main()
