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
import sys
from pathlib import Path

from PIL import Image, ImageDraw

from farm_art import BARN, CH, CW, GRASS, GRASS_DARK, HOUSE, OUT, OUT_SCALE, Packs, band, kenney, put, shrink
from farm_themes import THEMES, night_tint, recolour_cat
from farm_world import build_world

COLS, ROWS = 9, 36
PLOT_LEFT, PLOT_TOP, PLOT_ROW_STEP = 1, 14, 2
ANIMALS = ['Rabbit', 'Chick', 'Cat', 'Fox']


def draw_ground(canvas: Image.Image) -> None:
    draw = ImageDraw.Draw(canvas)
    draw.rectangle((0.5 * CW, 12.5 * CH, 8.5 * CW, 22.5 * CH), fill=GRASS_DARK)
    band(draw, (-60, 9.2 * CH, COLS * CW + 60, 10.8 * CH))
    band(draw, (4.2 * CW, 10 * CH, 4.8 * CW, 13.4 * CH))


def draw_buildings(canvas: Image.Image, packs: Packs) -> None:
    house = kenney(packs, HOUSE, round(6.5 * CH))
    barn = kenney(packs, BARN, round(5.2 * CH))
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
    build_world(packs, save_with_themes)
    build_beds(packs)
    build_animals(packs)
    build_pets(packs)


if __name__ == '__main__':
    main()
