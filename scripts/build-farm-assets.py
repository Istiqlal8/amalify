#!/usr/bin/env python3
"""Build the farm art used by components/farm (see farmSprites.ts).

Usage: python3 scripts/build-farm-assets.py <assets_dir>

<assets_dir> must contain the unzipped CC0 packs:
- comigo_farm/AnimalsFarmAndPuzzlePack/  (CoMiGo "Farm, Puzzle & Animals", https://comigo.itch.io/farm-puzzle-animals)
- kenney_medieval-rts/                   (Kenney Medieval RTS, https://kenney.nl/assets/medieval-rts)
ImageMagick (`magick`) is needed to rasterise the Kenney SVG.

The scene is composed at the packs' @2x size (a cell is 256 x 128 px, 3/4 view)
and every output is downscaled once with LANCZOS to OUT_SCALE. The layout must
match COLLISION / PLOT_* / CELL_ASPECT in domain/farm.ts.
"""
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw

CW, CH = 256, 128  # one cell at the packs' @2x size
COLS, ROWS = 9, 36
OUT_SCALE = 0.5
PLOT_LEFT, PLOT_TOP, PLOT_ROW_STEP = 1, 14, 2
ANIMALS = ['Rabbit', 'Chick', 'Cat', 'Pig', 'Fox', 'Mouse']

GRASS, GRASS_DARK = (99, 166, 66), (87, 157, 78)
PATH, PATH_EDGE = (217, 162, 77), (186, 132, 58)

OUT = Path(__file__).resolve().parent.parent / 'assets' / 'farm'


class Packs:
    def __init__(self, root: Path) -> None:
        self.comigo = root / 'comigo_farm' / 'AnimalsFarmAndPuzzlePack'
        self.svg = root / 'kenney_medieval-rts' / 'Vector' / 'medievalRTS_vector.svg'

    def art(self, folder: str, name: str) -> Image.Image:
        return Image.open(self.comigo / folder / 'x2' / f'{name}@2x.png').convert('RGBA')


def put(canvas: Image.Image, img: Image.Image, col: float, row: float) -> None:
    """Anchor an object's bottom-left corner to the bottom-left of cell (col, row)."""
    canvas.alpha_composite(img, (round(col * CW), round((row + 1) * CH) - img.height))


def band(draw: ImageDraw.ImageDraw, box: tuple[float, float, float, float]) -> None:
    x0, y0, x1, y1 = (round(v) for v in box)
    draw.rounded_rectangle((x0, y0, x1, y1), radius=40, fill=PATH, outline=PATH_EDGE, width=6)


def draw_ground(canvas: Image.Image) -> None:
    draw = ImageDraw.Draw(canvas)
    draw.rectangle((0.5 * CW, 12.5 * CH, 8.5 * CW, 22.5 * CH), fill=GRASS_DARK)
    band(draw, (-60, 9.2 * CH, COLS * CW + 60, 10.8 * CH))
    band(draw, (4.2 * CW, 10 * CH, 4.8 * CW, 13.4 * CH))


def kenney(packs: Packs, box: tuple[float, float, float, float], height: int) -> Image.Image:
    """Rasterise one Kenney structure straight from the vector sheet at `height` px."""
    x, y, w, h = box
    width = round(height * w / h)
    svg = packs.svg.read_text()
    head_end = svg.index('>', svg.index('<svg')) + 1
    head = f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{width}px" height="{height}px" viewBox="{x} {y} {w} {h}">'
    with tempfile.TemporaryDirectory() as tmp:
        src, dst = Path(tmp) / 'crop.svg', Path(tmp) / 'crop.png'
        src.write_text(head + svg[head_end:])
        subprocess.run(['magick', '-background', 'none', str(src), str(dst)], check=True)
        return Image.open(dst).convert('RGBA')


def draw_buildings(canvas: Image.Image, packs: Packs) -> None:
    house = kenney(packs, (522, 610, 44.4, 60.4), round(6.5 * CH))
    barn = kenney(packs, (618, 616, 44.4, 48.4), round(5.2 * CH))
    put(canvas, house, 2.5 - house.width / CW / 2, 8)
    put(canvas, barn, 6.5 - barn.width / CW / 2, 8)


def draw_border(canvas: Image.Image, packs: Packs) -> None:
    tree, bush, roses = packs.art('Objects', 'Tree'), packs.art('Objects', 'Bush'), packs.art('Objects', 'Hedge_Roses')
    for col in range(COLS):
        put(canvas, roses, col, 1)
    for col in (-0.3, 7.3):
        put(canvas, tree, col, 3)
    for row in (5, 7):
        put(canvas, bush, 0, row)
        put(canvas, bush, 8, row)
    put(canvas, bush, 4, 3)
    for col in (-0.4, 1.0, 2.6, 4.2, 5.8, 7.4):
        put(canvas, tree, col, 35)


def draw_fence(canvas: Image.Image, packs: Packs) -> None:
    f = lambda name: packs.art('Fences', f'Fence_{name}')  # noqa: E731
    top = [f('Corner_Bottom_Right')] + [f('Horizontal')] * 2 + [f('Right'), None, f('Left')] + [f('Horizontal')] * 2 + [f('Corner_Bottom_Left')]
    for col, piece in enumerate(top):
        if piece:
            put(canvas, piece, col, 12)
    for row in range(13, 22):
        put(canvas, f('Vertical'), 0, row)
        put(canvas, f('Vertical'), 8, row)
    bottom = [f('Corner_Top_Right')] + [f('Horizontal')] * 7 + [f('Corner_Top_Left')]
    for col, piece in enumerate(bottom):
        put(canvas, piece, col, 22)


def draw_pond(canvas: Image.Image, packs: Packs) -> None:
    water = packs.art('Terrain_Common', 'Water')
    for row in range(25, 29):
        for col in range(6, 9):
            canvas.alpha_composite(water, (col * CW, row * CH))
    bush = packs.art('Objects', 'Bush')
    put(canvas, bush, 1, 24)
    put(canvas, bush, 3, 30)


def draw_beds(canvas: Image.Image, packs: Packs) -> None:
    blank = packs.art('Objects', 'GardenBed_Blank')
    for row in range(4):
        for col in range(7):
            put(canvas, blank, PLOT_LEFT + col, PLOT_TOP + row * PLOT_ROW_STEP)


def shrink(img: Image.Image) -> Image.Image:
    size = (round(img.width * OUT_SCALE), round(img.height * OUT_SCALE))
    return img.resize(size, Image.LANCZOS)


def save(img: Image.Image, name: str) -> None:
    shrink(img).save(OUT / name, optimize=True)


def build_scene(packs: Packs, with_beds: bool, name: str) -> None:
    """scene.png has the 28 empty beds baked in; scene_group.png leaves the field open."""
    canvas = Image.new('RGBA', (COLS * CW, ROWS * CH), GRASS + (255,))
    draw_ground(canvas)
    draw_pond(canvas, packs)
    draw_border(canvas, packs)
    draw_buildings(canvas, packs)
    if with_beds:
        draw_beds(canvas, packs)
    draw_fence(canvas, packs)
    save(canvas.convert('RGB'), name)


def build_beds(packs: Packs) -> None:
    save(packs.art('Objects', 'GardenBed_Blank'), 'bed_blank.png')


def build_animals(packs: Packs) -> None:
    for animal in ANIMALS:
        for facing in ('Down', 'Left', 'Up', 'Right'):
            save(packs.art('Characters', f'{animal}_{facing}'), f'{animal.lower()}_{facing.lower()}.png')


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit('usage: build-farm-assets.py <assets_dir>')
    packs = Packs(Path(sys.argv[1]).resolve())
    OUT.mkdir(parents=True, exist_ok=True)
    build_scene(packs, True, 'scene.png')
    build_scene(packs, False, 'scene_group.png')
    build_beds(packs)
    build_animals(packs)


if __name__ == '__main__':
    main()
