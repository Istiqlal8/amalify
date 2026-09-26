"""Theme dressing for farm props, applied to each sprite before it is placed (deterministic, PIL only).

- salju: a white snow cap with a soft blue shadow along the top silhouette (trees, bushes, hedges,
  fences, roofs).
- sakura: pink blossom clusters over tree, bush and hedge crowns.
- pantai: coconuts under tree crowns and sun-bleached driftwood fences.
- malam: no dressing; houses get a separate warm window-glow layer (window_glow) drawn over the
  night tint at runtime.
"""
import math

from PIL import Image, ImageChops, ImageDraw, ImageFilter

SNOW, SNOW_SHADOW = (246, 250, 253), (190, 208, 226)
BLOSSOM, BLOSSOM_HEART = (249, 180, 206), (255, 228, 238)
COCONUT = (120, 78, 40)
WINDOW = (203, 190, 157)  # Kenney house window colour
GLOW = (255, 214, 120)

# Cap depth per prop kind, in @2x source pixels.
CAP_DEPTH = {'tree': 44, 'bush': 34, 'hedge': 36, 'fence': 12, 'house': 48}


def _top_edges(alpha: Image.Image) -> list[int | None]:
    px, (w, h) = alpha.load(), alpha.size
    tops: list[int | None] = []
    for x in range(w):
        tops.append(next((y for y in range(h) if px[x, y] > 128), None))
    return tops


def snow_cap(img: Image.Image, depth: int) -> Image.Image:
    alpha = img.getchannel('A')
    cap = Image.new('L', img.size, 0)
    draw = ImageDraw.Draw(cap)
    for x, top in enumerate(_top_edges(alpha)):
        if top is not None:
            wave = 0.75 + 0.25 * math.sin(x / max(img.width, 1) * math.pi * 3)
            draw.line((x, top, x, top + depth * wave), fill=255)
    cap = ImageChops.multiply(cap.filter(ImageFilter.GaussianBlur(1.2)), alpha)
    shadow = ImageChops.subtract(ImageChops.offset(cap, 0, 5), cap)
    out = img.copy()
    out.alpha_composite(_layer(img.size, SNOW_SHADOW, shadow.point(lambda v: v * 0.6)))
    out.alpha_composite(_layer(img.size, SNOW, cap))
    return out


def _layer(size: tuple[int, int], color: tuple[int, int, int], mask: Image.Image) -> Image.Image:
    layer = Image.new('RGBA', size, color + (0,))
    layer.putalpha(mask)
    return layer


def blossoms(img: Image.Image) -> Image.Image:
    """Pink clusters on a regular lattice over the upper crown (never on the trunk)."""
    bbox = img.getchannel('A').getbbox()
    if not bbox:
        return img
    x0, y0, x1, y1 = bbox
    out, alpha = img.copy(), img.getchannel('A').load()
    draw = ImageDraw.Draw(out)
    crown_bottom = y0 + (y1 - y0) * 0.65
    for j, y in enumerate(range(y0 + 14, int(crown_bottom), 30)):
        for x in range(x0 + 12 + (j % 2) * 15, x1 - 8, 30):
            if alpha[x, y] > 200:
                draw.ellipse((x - 9, y - 9, x + 9, y + 9), fill=BLOSSOM)
                draw.ellipse((x - 3, y - 3, x + 3, y + 3), fill=BLOSSOM_HEART)
    return out


def coconuts(img: Image.Image) -> Image.Image:
    bbox = img.getchannel('A').getbbox()
    if not bbox:
        return img
    x0, y0, x1, y1 = bbox
    cx, cy = (x0 + x1) / 2, y0 + (y1 - y0) * 0.55
    out = img.copy()
    draw = ImageDraw.Draw(out)
    for dx in (-22, 0, 22):
        draw.ellipse((cx + dx - 13, cy - 13 + abs(dx) / 3, cx + dx + 13, cy + 13 + abs(dx) / 3), fill=COCONUT)
    return out


def driftwood(img: Image.Image) -> Image.Image:
    alpha = img.getchannel('A')
    rgb = Image.blend(img.convert('RGB'), Image.new('RGB', img.size, (222, 206, 180)), 0.45)
    out = rgb.convert('RGBA')
    out.putalpha(alpha)
    return out


def dress(img: Image.Image, theme: str | None, kind: str) -> Image.Image:
    if theme == 'salju':
        return snow_cap(img, CAP_DEPTH[kind])
    if theme == 'sakura' and kind in ('tree', 'bush', 'hedge'):
        return blossoms(img)
    if theme == 'pantai' and kind == 'tree':
        return coconuts(img)
    if theme == 'pantai' and kind == 'fence':
        return driftwood(img)
    return img


def window_glow(house: Image.Image) -> Image.Image:
    """Warm light where the house has windows, plus a soft halo; transparent elsewhere."""
    rgb, alpha = house.convert('RGB'), house.getchannel('A')
    diff = ImageChops.difference(rgb, Image.new('RGB', house.size, WINDOW)).convert('L')
    windows = ImageChops.multiply(diff.point(lambda v: 255 if v < 8 else 0), alpha)
    halo = windows.filter(ImageFilter.GaussianBlur(22)).point(lambda v: min(255, v * 3))
    out = _layer(house.size, GLOW, halo.point(lambda v: v * 0.55))
    out.alpha_composite(_layer(house.size, GLOW, windows))
    return out
