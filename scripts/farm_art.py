"""Shared pieces for the farm asset scripts: packs, cell size, placing sprites, paths, Kenney SVG."""
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw

CW, CH = 256, 128  # one cell at the packs' @2x size
OUT_SCALE = 0.5

GRASS, GRASS_DARK = (99, 166, 66), (87, 157, 78)
PATH, PATH_EDGE = (217, 162, 77), (186, 132, 58)

# Kenney Medieval RTS structures, as boxes in the vector sheet's units.
HOUSE = (522, 610, 44.4, 60.4)
BARN = (618, 616, 44.4, 48.4)

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


def shrink(img: Image.Image) -> Image.Image:
    size = (round(img.width * OUT_SCALE), round(img.height * OUT_SCALE))
    return img.resize(size, Image.LANCZOS)
