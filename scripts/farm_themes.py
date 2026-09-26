"""Garden theme recolours for build-farm-assets.py (PIL only, no numpy).

Each theme takes the finished RGB scene and returns a recoloured copy. Masks pick
colours by HSV range: the flat vector art uses few, clean colours, so this is
stable. 'malam' (night) is drawn at runtime as an overlay, so it has no scene
here; its preview thumbnail is tinted with `night_tint`.
"""
from PIL import Image, ImageChops


def _band(channel: Image.Image, lo: int, hi: int) -> Image.Image:
    return channel.point(lambda v: 255 if lo <= v <= hi else 0)


def _and(*masks: Image.Image) -> Image.Image:
    out = masks[0]
    for m in masks[1:]:
        out = ImageChops.multiply(out, m)
    return out


def masks(img: Image.Image) -> dict[str, Image.Image]:
    """grass (light greens), foliage (dark greens: trees, hedges, roofs) and water (blue)."""
    h, s, v = img.convert('HSV').split()
    return {
        'grass': _and(_band(h, 55, 95), _band(v, 146, 255), _band(s, 90, 180)),
        'foliage': _and(_band(h, 55, 110), _band(v, 0, 145), _band(s, 150, 255)),
        'water': _and(_band(h, 135, 160), _band(s, 100, 255)),
    }


def _shaded(img: Image.Image, color: tuple[int, int, int], top: int) -> Image.Image:
    """`color` modulated by the source brightness, so edges and shading survive."""
    v = img.convert('HSV').split()[2].point(lambda x: min(255, round(x * 255 / top)))
    return ImageChops.multiply(Image.new('RGB', img.size, color), Image.merge('RGB', (v, v, v)))


def _hue(img: Image.Image, hue: int, sat: float = 1.0, lift: int = 0) -> Image.Image:
    h, s, v = img.convert('HSV').split()
    h = h.point(lambda _: hue)
    s = s.point(lambda x: round(x * sat))
    v = v.point(lambda x: min(255, x + lift))
    return Image.merge('HSV', (h, s, v)).convert('RGB')


def _mix(img: Image.Image, color: tuple[int, int, int], amount: float) -> Image.Image:
    return Image.blend(img, Image.new('RGB', img.size, color), amount)


def sakura(img: Image.Image) -> Image.Image:
    m = masks(img)
    out = Image.composite(_mix(img, (250, 200, 220), 0.25), img, m['grass'])
    return Image.composite(_hue(img, 235, 0.55, 70), out, m['foliage'])


def pantai(img: Image.Image) -> Image.Image:
    m = masks(img)
    out = Image.composite(_shaded(img, (240, 219, 168), 166), img, m['grass'])
    out = Image.composite(_hue(img, 118, 0.9, 10), out, m['water'])
    return Image.composite(_hue(img, 75, 1.0, 10), out, m['foliage'])


def salju(img: Image.Image) -> Image.Image:
    m = masks(img)
    out = Image.composite(_shaded(img, (240, 246, 252), 166), img, m['grass'])
    out = Image.composite(_mix(img, (214, 236, 248), 0.6), out, m['water'])
    return Image.composite(_mix(img, (235, 243, 250), 0.35), out, m['foliage'])


def night_tint(img: Image.Image) -> Image.Image:
    """Matches ThemeOverlay's night layer, for the shop preview only."""
    return _mix(img, (22, 30, 78), 0.5)


THEMES = {'sakura': sakura, 'pantai': pantai, 'salju': salju}


def recolour_cat(img: Image.Image, look: str) -> Image.Image:
    """The CoMiGo cat is blue: 'oranye' turns the blue fur ginger, 'putih' turns it white. Alpha is kept."""
    alpha = img.getchannel('A')
    rgb = img.convert('RGB')
    h, s, _ = rgb.convert('HSV').split()
    fur = _and(_band(h, 125, 175), _band(s, 80, 255))
    fur_look = _hue(rgb, 20, 0.85, 20) if look == 'oranye' else _mix(_hue(rgb, 150, 0.12, 60), (250, 250, 252), 0.35)
    out = Image.composite(fur_look, rgb, fur).convert('RGBA')
    out.putalpha(alpha)
    return out
