import { Image, StyleSheet } from 'react-native';

import { CELL_ASPECT } from '@/domain/farm';
import type { HouseId } from '@/domain/estate';
import { BLOCK_COLS, BLOCK_ROWS, buildingSprite, RING } from '@/domain/farmWorld';

import { HOUSE_ART, type ThemeArt } from './farmSprites';

const MAIN = buildingSprite('H');
const SIDE = buildingSprite('B');

/** Kebunku's village map: the yard in the middle 2×2 blocks and a field block for each month around it
 * (or each block of `ring`, e.g. the group map's extra rows). */
export function WorldBackground({ cell, art, house = 'kayu', ring = RING }: { cell: number; art: ThemeArt; house?: HouseId; ring?: [number, number][] }) {
  const row = cell * CELL_ASPECT;
  const place = (bx: number, by: number, blocks: number) => [
    styles.tile,
    { left: bx * BLOCK_COLS * cell, top: by * BLOCK_ROWS * row, width: blocks * BLOCK_COLS * cell, height: blocks * BLOCK_ROWS * row },
  ];
  return (
    <>
      <Image source={art.world.yard} style={place(1, 1, 2)} />
      {ring.map(([bx, by], i) => (
        <Image key={i} source={art.world.fields[i % art.world.fields.length]} style={place(bx, by, 1)} />
      ))}
      {[MAIN, SIDE].map((b, i) => (
        <Image
          key={i}
          source={i === 0 ? HOUSE_ART[house].main : HOUSE_ART[house].side}
          style={[styles.tile, { left: b.x * cell, top: b.y * row, width: b.w * cell, height: b.h * row }]}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  tile: { position: 'absolute' },
});
