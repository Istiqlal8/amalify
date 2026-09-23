"""Generates Amalify logo SVGs: the flowering-plant mark on a pink gradient, plus Android layers."""
import math
import pathlib

OUT = pathlib.Path(__file__).parent

BG = """<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1">
    <stop offset="0" stop-color="#F9A8D4"/><stop offset="0.55" stop-color="#EC4899"/><stop offset="1" stop-color="#BE185D"/>
  </linearGradient>
  <radialGradient id="glow" cx="0.5" cy="0.42" r="0.5">
    <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.35"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
  </radialGradient>
</defs>
<rect width="1024" height="1024" fill="url(#bg)"/>
<rect width="1024" height="1024" fill="url(#glow)"/>"""


def flower(x, y, r, petal="#F9A8D4", center="#FDE047"):
    petals = "".join(
        f'<circle cx="{x + math.cos(math.radians(a)) * r:.1f}" cy="{y + math.sin(math.radians(a)) * r:.1f}" r="{r * 0.78:.1f}" fill="{petal}"/>'
        for a in range(-90, 270, 72)
    )
    return petals + f'<circle cx="{x}" cy="{y}" r="{r * 0.55:.1f}" fill="{center}"/>'


def mark(mono=False):
    """The plant in a 400x400 box, centred on (200, 200)."""
    leaf, leaf_dark, trunk = ("#fff",) * 3 if mono else ("#4ADE80", "#22C55E", "#B45309")
    pot, rim, soil = ("#fff",) * 3 if mono else ("#FFF1F7", "#FBCFE8", "#92400E")
    parts = [
        f'<rect x="187" y="170" width="26" height="120" rx="13" fill="{trunk}"/>',
        f'<circle cx="128" cy="178" r="62" fill="{leaf_dark}"/>',
        f'<circle cx="272" cy="178" r="62" fill="{leaf_dark}"/>',
        f'<circle cx="200" cy="130" r="96" fill="{leaf}"/>',
        f'<circle cx="138" cy="170" r="54" fill="{leaf}"/>',
        f'<circle cx="262" cy="170" r="54" fill="{leaf}"/>',
    ]
    if not mono:
        parts += [
            '<circle cx="168" cy="92" r="20" fill="#BBF7D0"/>',
            flower(200, 78, 17), flower(142, 140, 15), flower(258, 132, 15),
            flower(206, 176, 13), flower(106, 196, 11), flower(296, 196, 11),
        ]
    parts += [
        f'<path d="M112 300 H288 L271 388 Q200 402 129 388 Z" fill="{pot}"/>',
        f'<rect x="94" y="268" width="212" height="40" rx="20" fill="{rim}"/>',
        f'<ellipse cx="200" cy="272" rx="92" ry="9" fill="{soil}"/>',
    ]
    face = [
        '<circle cx="170" cy="338" r="10" fill="#831843"/>',
        '<circle cx="230" cy="338" r="10" fill="#831843"/>',
        '<path d="M186 352 Q200 366 214 352" stroke="#831843" stroke-width="7" fill="none" stroke-linecap="round"/>',
    ]
    if mono:
        # Monochrome icons use alpha only, so the face is cut out of the pot instead of drawn on it.
        cut = "".join(f.replace('fill="#831843"', 'fill="#000"').replace('stroke="#831843"', 'stroke="#000"') for f in face)
        return f'<mask id="m"><rect width="400" height="400" fill="#fff"/>{cut}</mask><g mask="url(#m)">{"".join(parts)}</g>'
    face += [
        '<ellipse cx="148" cy="356" rx="14" ry="8" fill="#F9A8D4"/>',
        '<ellipse cx="252" cy="356" rx="14" ry="8" fill="#F9A8D4"/>',
    ]
    return "".join(parts + face)


def moon(x, y, s):
    return (
        f'<g transform="translate({x} {y}) scale({s})" fill="#FFF1F7">'
        '<path d="M40 0 A40 40 0 1 0 72 64 A32 32 0 1 1 40 0 Z"/>'
        '<path d="M78 14 L82 25 L93 26 L84 33 L87 44 L78 38 L69 44 L72 33 L63 26 L74 25 Z"/></g>'
    )


def sparkle(x, y, s, color="#FFF1F7"):
    return f'<path transform="translate({x} {y}) scale({s})" d="M0 -20 Q3 -3 20 0 Q3 3 0 20 Q-3 3 -20 0 Q-3 -3 0 -20 Z" fill="{color}"/>'


def placed(content, size, cx=512, cy=520):
    s = size / 400
    return f'<g transform="translate({cx - 200 * s:.1f} {cy - 200 * s:.1f}) scale({s:.4f})">{content}</g>'


def svg(body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">{body}</svg>'


decor = moon(700, 150, 1.5) + sparkle(215, 250, 1.3) + sparkle(820, 480, 0.9) + sparkle(250, 760, 0.8)

files = {
    # Full-bleed; iOS and the stores apply their own corner mask.
    "icon": svg(BG + decor + placed(mark(), 720)),
    # Rounded tile for the splash screen, shown on the light pink splash background.
    "splash": svg(f'<clipPath id="r"><rect width="1024" height="1024" rx="230"/></clipPath><g clip-path="url(#r)">{BG}{decor}{placed(mark(), 720)}</g>'),
    # Android adaptive layers: the launcher crops to the central ~61%, so the mark stays inside it.
    "android-fg": svg(placed(mark(), 560, cy=512)),
    "android-bg": svg(BG + sparkle(250, 250, 1.1) + sparkle(790, 300, 0.8) + sparkle(270, 790, 0.7) + sparkle(780, 770, 1)),
    "android-mono": svg(placed(mark(mono=True), 560, cy=512)),
}

for name, content in files.items():
    (OUT / f"{name}.svg").write_text(content)
    (OUT / f"{name}.html").write_text(
        f'<html><body style="margin:0;background:transparent">{content}</body></html>'
    )
print("ok", list(files))
