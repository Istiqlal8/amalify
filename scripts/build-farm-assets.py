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

from farm_themes import THEMES, night_tint, recolour_cat

CW, CH = 256, 128  # one cell at the packs' @2x size
COLS, ROWS = 9, 36
OUT_SCALE = 0.5
PLOT_LEFT, PLOT_TOP, PLOT_ROW_STEP = 1, 14, 2
ANIMALS = ['Rabbit', 'Chick', 'Cat', 'Fox']

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


def compose_scene(packs: Packs, with_beds: bool) -> Image.Image:
    """The single-field farm (group farm), optionally with the 28 empty beds (shop previews)."""
    canvas = Image.new('RGBA', (COLS * CW, ROWS * CH), GRASS + (255,))
    draw_ground(canvas)
    draw_pond(canvas, packs)
    draw_border(canvas, packs)
    draw_buildings(canvas, packs)
    if with_beds:
        draw_beds(canvas, packs)
    draw_fence(canvas, packs)
    return shrink(canvas.convert('RGB'))


def save_with_themes(img: Image.Image, name: str) -> None:
    img.save(OUT / f'{name}.png', optimize=True)
    for theme, recolour in THEMES.items():
        save_quantized(recolour(img), f'{name}_{theme}.png')


# --- Kebun world: header (houses + path), one block per month, a closing row of trees --------
HEADER_ROWS, BLOCK_ROWS, TAIL_ROWS = 11, 16, 3  # keep in sync with domain/farmWorld.ts


def month_block(packs: Packs) -> Image.Image:
    """One month: a fenced field with gates top and bottom on the path; beds are drawn at runtime."""
    canvas = Image.new('RGBA', (COLS * CW, BLOCK_ROWS * CH), GRASS + (255,))
    draw = ImageDraw.Draw(canvas)
    draw.rectangle((0.5 * CW, 1.5 * CH, 8.5 * CW, 15.5 * CH), fill=GRASS_DARK)
    band(draw, (4.2 * CW, -60, 4.8 * CW, 2.4 * CH))
    band(draw, (4.2 * CW, 14.6 * CH, 4.8 * CW, BLOCK_ROWS * CH + 60))
    f = lambda name: packs.art('Fences', f'Fence_{name}')  # noqa: E731
    gate = [f('Horizontal')] * 2 + [f('Right'), None, f('Left')] + [f('Horizontal')] * 2
    for col, piece in enumerate([f('Corner_Bottom_Right')] + gate + [f('Corner_Bottom_Left')]):
        if piece:
            put(canvas, piece, col, 1)
    for row in range(2, 15):
        put(canvas, f('Vertical'), 0, row)
        put(canvas, f('Vertical'), 8, row)
    for col, piece in enumerate([f('Corner_Top_Right')] + gate + [f('Corner_Top_Left')]):
        if piece:
            put(canvas, piece, col, 15)
    return shrink(canvas.convert('RGB'))


def world_tail(packs: Packs) -> Image.Image:
    canvas = Image.new('RGBA', (COLS * CW, TAIL_ROWS * CH), GRASS + (255,))
    band(ImageDraw.Draw(canvas), (4.2 * CW, -60, 4.8 * CW, 0.8 * CH))
    tree = packs.art('Objects', 'Tree')
    for col in (-0.4, 1.0, 2.6, 4.2, 5.8, 7.4):
        put(canvas, tree, col, TAIL_ROWS - 1)
    return shrink(canvas.convert('RGB'))


def build_world(packs: Packs, open_field: Image.Image) -> None:
    rows = round(HEADER_ROWS * CH * OUT_SCALE)
    save_with_themes(open_field.crop((0, 0, open_field.width, rows)), 'world_top')
    save_with_themes(month_block(packs), 'world_month')
    save_with_themes(world_tail(packs), 'world_bottom')


def save_quantized(img: Image.Image, name: str) -> None:
    img.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).save(OUT / name, optimize=True)


def build_previews(scene: Image.Image) -> None:
    """Shop thumbnails: the houses, path and top of the field in each theme."""
    crop = scene.crop((0, 2 * CH * OUT_SCALE, COLS * CW * OUT_SCALE, 15 * CH * OUT_SCALE))
    looks = {'musim-semi': crop, 'malam': night_tint(crop), **{t: f(crop) for t, f in THEMES.items()}}
    for theme, img in looks.items():
        save_quantized(img.resize((288, round(288 * img.height / img.width)), Image.LANCZOS), f'theme_{theme}.png')


def build_beds(packs: Packs) -> None:
    save(packs.art('Objects', 'GardenBed_Blank'), 'bed_blank.png')


def build_animals(packs: Packs) -> None:
    for animal in ANIMALS:
        for facing in ('Down', 'Left', 'Up', 'Right'):
            save(packs.art('Characters', f'{animal}_{facing}'), f'{animal.lower()}_{facing.lower()}.png')


PETS = {'kucing': ('Cat', None), 'anak-ayam': ('Chick', None), 'kelinci': ('Rabbit', None), 'kucing-oranye': ('Cat', 'oranye'), 'kucing-putih': ('Cat', 'putih')}
PET_SCALE = 0.375  # pets are drawn at about three quarters of a cell


def build_pets(packs: Packs) -> None:
    for pet, (animal, look) in PETS.items():
        for facing in ('Down', 'Left', 'Up', 'Right'):
            img = packs.art('Characters', f'{animal}_{facing}')
            img = recolour_cat(img, look) if look else img
            size = (round(img.width * PET_SCALE), round(img.height * PET_SCALE))
            img.resize(size, Image.LANCZOS).save(OUT / f'pet_{pet}_{facing.lower()}.png', optimize=True)


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit('usage: build-farm-assets.py <assets_dir>')
    packs = Packs(Path(sys.argv[1]).resolve())
    OUT.mkdir(parents=True, exist_ok=True)
    build_previews(compose_scene(packs, True))
    open_field = compose_scene(packs, False)
    save_with_themes(open_field, 'scene_group')
    build_world(packs, open_field)
    build_beds(packs)
    build_animals(packs)
    build_pets(packs)


if __name__ == '__main__':
    main()
