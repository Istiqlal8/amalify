"""Kebunku village map tiles: the yard (middle 2x2 blocks) and three field-block variants.

The yard layout is read from CENTER_MAP in domain/farmWorld.ts so the art and the collision grid
never drift apart. Field blocks: path on row 0, fence with 3-cell gates on rows 1 and 15, beds are drawn
at runtime, and the outer columns hold the decoration between fields (trees, roses or bushes).
"""
import re
from pathlib import Path
from typing import Callable

from PIL import Image, ImageDraw

from farm_art import BARN, CH, CW, GRASS, GRASS_DARK, HOUSE, OUT, PATH, Packs, band, kenney, put, shrink
from farm_themes import recolour_roof

BLOCK_COLS, BLOCK_ROWS = 11, 16  # keep in sync with domain/farmWorld.ts
GATE = 5
WATER, WATER_EDGE = (88, 169, 255), (49, 118, 255)
FLOWERS = [(244, 143, 177), (255, 213, 79), (255, 255, 255)]
DOMAIN = Path(__file__).resolve().parent.parent / 'domain' / 'farmWorld.ts'


def center_map() -> list[str]:
    src = DOMAIN.read_text()
    block = src[src.index('// CENTER_MAP_START'):src.index('// CENTER_MAP_END')]
    return re.findall(r"'([^']+)'", block)


def _flowers(draw: ImageDraw.ImageDraw, col: int, row: int) -> None:
    for i, (dx, dy) in enumerate([(0.3, 0.35), (0.6, 0.6), (0.45, 0.8), (0.75, 0.3)]):
        x, y, r = (col + dx) * CW, (row + dy) * CH, 16
        draw.ellipse((x - r, y - r, x + r, y + r), fill=FLOWERS[i % 3])


def _ground(canvas: Image.Image, grid: list[str]) -> None:
    draw = ImageDraw.Draw(canvas)
    for r, line in enumerate(grid):
        for c, ch in enumerate(line):
            box = (c * CW, r * CH, (c + 1) * CW, (r + 1) * CH)
            if ch == '=':
                draw.rectangle(box, fill=PATH)
            elif ch == 'W':
                below = grid[r + 1][c] if r + 1 < len(grid) else '.'
                draw.rectangle(box, fill=WATER if below == 'W' else WATER_EDGE)
                if below != 'W':
                    draw.rectangle((box[0], box[1], box[2], box[3] - 28), fill=WATER)
            elif ch == 'f':
                _flowers(draw, c, r)


def _bbox(grid: list[str], mark: str) -> tuple[int, int, int, int]:
    cells = [(c, r) for r, line in enumerate(grid) for c, ch in enumerate(line) if ch == mark]
    cols, rows = [c for c, _ in cells], [r for _, r in cells]
    return min(cols), min(rows), max(cols), max(rows)


def _objects(canvas: Image.Image, grid: list[str], packs: Packs) -> None:
    art = {'T': packs.art('Objects', 'Tree'), 'b': packs.art('Objects', 'Bush'), 'r': packs.art('Objects', 'Hedge_Roses')}
    # Houses ('H', 'B') are separate sprites per tier (build_houses), drawn over the yard at runtime.
    for r, line in enumerate(grid):
        for c, ch in enumerate(line):
            if ch in art:
                put(canvas, art[ch], c, r)


def yard(packs: Packs) -> Image.Image:
    grid = center_map()
    canvas = Image.new('RGBA', (len(grid[0]) * CW, len(grid) * CH), GRASS + (255,))
    _ground(canvas, grid)
    _objects(canvas, grid, packs)
    return shrink(canvas.convert('RGB'))


def _fence(canvas: Image.Image, packs: Packs) -> None:
    f = lambda name: packs.art('Fences', f'Fence_{name}')  # noqa: E731
    gate = [f('Horizontal'), f('Right'), None, None, None, f('Left'), f('Horizontal')]  # 3-cell gate on cols 4-6
    for row, (left, right) in ((1, ('Corner_Bottom_Right', 'Corner_Bottom_Left')), (15, ('Corner_Top_Right', 'Corner_Top_Left'))):
        for i, piece in enumerate([f(left)] + gate + [f(right)]):
            if piece:
                put(canvas, piece, i + 1, row)
    for row in range(2, 15):
        put(canvas, f('Vertical'), 1, row)
        put(canvas, f('Vertical'), 9, row)


def _fillers(canvas: Image.Image, packs: Packs, variant: str) -> None:
    rows = {'trees': (4, 8, 12, 15), 'roses': tuple(range(2, 16)), 'bushes': (2, 5, 8, 11, 14)}[variant]
    sprite = {'trees': 'Tree', 'roses': 'Hedge_Roses', 'bushes': 'Bush'}[variant]
    img = packs.art('Objects', sprite)
    for row in rows:
        put(canvas, img, 0, row)
        put(canvas, img, BLOCK_COLS - 1, row)


def field_block(packs: Packs, variant: str) -> Image.Image:
    canvas = Image.new('RGBA', (BLOCK_COLS * CW, BLOCK_ROWS * CH), GRASS + (255,))
    draw = ImageDraw.Draw(canvas)
    draw.rectangle((1.5 * CW, 1.5 * CH, 9.5 * CW, 15.5 * CH), fill=GRASS_DARK)
    draw.rectangle((0, 0, BLOCK_COLS * CW, CH), fill=PATH)
    band(draw, ((GATE - 1) * CW + 0.2 * CW, 0.5 * CH, (GATE + 1) * CW + 0.8 * CW, 2.4 * CH))
    band(draw, ((GATE - 1) * CW + 0.2 * CW, 14.6 * CH, (GATE + 1) * CW + 0.8 * CW, BLOCK_ROWS * CH + 60))
    _fence(canvas, packs)
    _fillers(canvas, packs, variant)
    return shrink(canvas.convert('RGB'))


# Kenney Medieval RTS structures per house tier: (main house on 'H', second building on 'B').
BRICK_MAIN, PORCH, MANOR = (806, 616, 52.3, 48.3), (898, 610, 60.3, 60.3), (1476, 226, 56.3, 60.3)
HOUSE_TIERS = {'kayu': (HOUSE, BARN, False), 'bata': (BRICK_MAIN, PORCH, False), 'mewah': (MANOR, PORCH, True)}
HOUSE_EXTRA_ROWS = 0.6  # sprites rise this far above their footprint; keep in sync with domain/farmWorld.ts


def _building(packs: Packs, box: tuple[float, float, float, float], cols: int, rows: int, roof: bool) -> Image.Image:
    """A structure fitted bottom-centre into a footprint-sized sprite (footprint + HOUSE_EXTRA_ROWS above)."""
    width, height = cols * CW, round((rows + HOUSE_EXTRA_ROWS) * CH)
    img = kenney(packs, box, height)
    if img.width > width:
        img = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
    img = recolour_roof(img) if roof else img
    canvas = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    canvas.alpha_composite(img, ((width - img.width) // 2, height - img.height))
    return canvas


def build_houses(packs: Packs) -> None:
    """house_<tier>_main.png (on the 'H' footprint) and house_<tier>_side.png (on 'B'), drawn over the yard at runtime."""
    grid = center_map()
    for tier, (main, side, roof) in HOUSE_TIERS.items():
        for mark, box, part in (('H', main, 'main'), ('B', side, 'side')):
            c0, r0, c1, r1 = _bbox(grid, mark)
            shrink(_building(packs, box, c1 - c0 + 1, r1 - r0 + 1, roof)).save(OUT / f'house_{tier}_{part}.png', optimize=True)


def build_world(packs: Packs, save: Callable[[Image.Image, str], None]) -> None:
    save(yard(packs), 'world_yard')
    build_houses(packs)
    for variant in ('trees', 'roses', 'bushes'):
        save(field_block(packs, variant), f'world_field_{variant}')
