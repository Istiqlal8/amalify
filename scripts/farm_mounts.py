"""Rideable horse for the farm, composed from Kenney's Animal Pack Redux horse head (CC0).

CoMiGo has no horse, so the body, legs, tail and shadow are drawn here in the same flat,
soft-shaded style and the Kenney head is placed on top. Drawn 4x larger, then downscaled.

Usage: python3 scripts/farm_mounts.py <animal_pack_redux_dir>
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageOps

OUT = Path(__file__).resolve().parent.parent / 'assets' / 'farm'
SIZE = 1024  # working canvas; saved at SAVE px
SAVE = 192
BODY, BODY_DARK, LEG, HOOF, MANE = (161, 102, 57), (142, 90, 50), (130, 80, 44), (80, 48, 26), (91, 55, 30)
SHADOW = (0, 0, 0, 60)


def _canvas() -> tuple[Image.Image, ImageDraw.ImageDraw]:
    img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    return img, ImageDraw.Draw(img)


def _head(src: Image.Image, width: int) -> Image.Image:
    return src.resize((width, round(src.height * width / src.width)), Image.LANCZOS)


def _legs(draw: ImageDraw.ImageDraw, xs: list[int], top: int) -> None:
    for x in xs:
        draw.rounded_rectangle((x, top, x + 74, 900), radius=30, fill=LEG)
        draw.rounded_rectangle((x, 850, x + 74, 910), radius=20, fill=HOOF)


def side(head_src: Image.Image) -> Image.Image:
    """Facing right."""
    img, draw = _canvas()
    draw.ellipse((170, 870, 870, 960), fill=SHADOW)
    draw.ellipse((110, 470, 330, 760), fill=MANE)  # tail
    _legs(draw, [250, 360, 590, 700], 660)
    draw.ellipse((180, 470, 800, 780), fill=BODY)
    draw.ellipse((200, 640, 780, 780), fill=BODY_DARK)
    draw.ellipse((180, 470, 800, 730), fill=BODY)
    head = _head(head_src, 400)
    img.alpha_composite(head, (560, 150))
    return img.resize((SAVE, SAVE), Image.LANCZOS)


def front(head_src: Image.Image) -> Image.Image:
    img, draw = _canvas()
    draw.ellipse((250, 880, 780, 960), fill=SHADOW)
    _legs(draw, [360, 590], 700)
    draw.ellipse((260, 520, 770, 820), fill=BODY)
    head = _head(head_src, 520)
    img.alpha_composite(head, (252, 150))
    return img.resize((SAVE, SAVE), Image.LANCZOS)


def back() -> Image.Image:
    img, draw = _canvas()
    draw.ellipse((250, 880, 780, 960), fill=SHADOW)
    _legs(draw, [360, 590], 700)
    draw.ellipse((260, 520, 770, 820), fill=BODY)
    draw.ellipse((330, 220, 700, 600), fill=BODY)  # back of the head
    for x0 in (360, 580):
        draw.polygon([(x0, 300), (x0 + 50, 170), (x0 + 100, 300)], fill=BODY_DARK)
    draw.rounded_rectangle((470, 200, 560, 600), radius=40, fill=MANE)
    draw.ellipse((450, 640, 580, 900), fill=MANE)  # tail
    return img.resize((SAVE, SAVE), Image.LANCZOS)


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit('usage: farm_mounts.py <animal_pack_redux_dir>')
    head = Image.open(Path(sys.argv[1]) / 'PNG' / 'Round' / 'horse.png').convert('RGBA')
    right = side(head)
    looks = {'right': right, 'left': ImageOps.mirror(right), 'down': front(head), 'up': back()}
    for facing, img in looks.items():
        img.save(OUT / f'mount_kuda_{facing}.png', optimize=True)


if __name__ == '__main__':
    main()
