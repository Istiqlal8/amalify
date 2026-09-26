"""Makes closed-eye versions of the front-facing farm sprites for the Beranda blink.

Eyes are the two highest dark blobs that sit side by side. They are painted over with the
face colour sampled around them, and a short downward-curved lid line is drawn in their place.
"""
import sys
from pathlib import Path
from collections import deque

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'assets/farm'
OUT = ROOT / 'assets/home/blink'
NAMES = ['rabbit', 'chick', 'cat', 'fox', 'pet_kucing', 'pet_anak-ayam', 'pet_kelinci', 'pet_kucing-oranye', 'pet_kucing-putih']


def dark(px):
    r, g, b, a = px
    return a > 180 and (r + g + b) / 3 < 70


def blobs(im):
    w, h = im.size
    p = im.load()
    seen = set()
    out = []
    for y in range(h):
        for x in range(w):
            if (x, y) in seen or not dark(p[x, y]):
                continue
            q = deque([(x, y)])
            seen.add((x, y))
            pts = []
            while q:
                cx, cy = q.popleft()
                pts.append((cx, cy))
                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in seen and dark(p[nx, ny]):
                        seen.add((nx, ny))
                        q.append((nx, ny))
            xs = [a for a, _ in pts]
            ys = [b for _, b in pts]
            out.append({'pts': pts, 'x0': min(xs), 'x1': max(xs), 'y0': min(ys), 'y1': max(ys),
                        'cx': sum(xs) / len(xs), 'cy': sum(ys) / len(ys), 'n': len(pts)})
    return out


def eye_pair(bs, w):
    # Eyes: compact blobs, taller than wide-ish, not huge, not hairline whiskers.
    cand = [b for b in bs if 4 <= b['n'] <= w * w * 0.01 and (b['y1'] - b['y0']) >= 2 and (b['x1'] - b['x0']) <= w * 0.12]
    best = None
    for i, a in enumerate(cand):
        for b in cand[i + 1:]:
            if abs(a['cy'] - b['cy']) > 3 or abs(a['n'] - b['n']) > max(a['n'], b['n']) * 0.5:
                continue
            gap = abs(a['cx'] - b['cx'])
            if gap < w * 0.08 or gap > w * 0.45:
                continue
            score = (a['cy'] + b['cy']) / 2
            if best is None or score < best[0]:
                best = (score, a, b)
    return None if best is None else best[1:]


def face_colour(im, e):
    p = im.load()
    ring = []
    for x in range(e['x0'] - 3, e['x1'] + 4):
        for y in (e['y0'] - 3, e['y1'] + 3):
            px = p[x, y]
            if px[3] > 200 and not dark(px):
                ring.append(px)
    ring.sort(key=lambda c: sum(c[:3]))
    return ring[len(ring) // 2] if ring else (255, 255, 255, 255)


def close_eye(im, e):
    p = im.load()
    fill = face_colour(im, e)
    # The eye carries a light rim and a soft shadow; cover an ellipse a few pixels past it.
    m = 3
    rx = (e['x1'] - e['x0']) / 2 + m
    ry = (e['y1'] - e['y0']) / 2 + m
    ecx = (e['x0'] + e['x1']) / 2
    ecy = (e['y0'] + e['y1']) / 2
    for x in range(int(ecx - rx), int(ecx + rx) + 1):
        for y in range(int(ecy - ry), int(ecy + ry) + 1):
            if ((x - ecx) / rx) ** 2 + ((y - ecy) / ry) ** 2 <= 1 and p[x, y][3] > 100:
                p[x, y] = fill
    d = ImageDraw.Draw(im)
    ew = e['x1'] - e['x0'] + 1
    half = max(ew * 0.75, 2.5)
    cy = e['cy'] + (e['y1'] - e['y0']) * 0.15
    stroke = max(1, round(ew * 0.35))
    d.arc([e['cx'] - half, cy - half * 0.7, e['cx'] + half, cy + half * 0.7], 20, 160, fill=(34, 24, 30, 255), width=stroke)


def main():
    for name in NAMES:
        im = Image.open(SRC / f'{name}_down.png').convert('RGBA')
        pair = eye_pair(blobs(im), im.size[0])
        if not pair:
            print('NO EYES', name)
            continue
        for e in pair:
            close_eye(im, e)
        im.save(OUT / f'{name}.png')
        print('ok', name, [(round(e['cx']), round(e['cy']), e['n']) for e in pair])


if __name__ == '__main__':
    sys.exit(main())
