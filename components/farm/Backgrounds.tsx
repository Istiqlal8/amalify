import { Image, StyleSheet } from 'react-native';

import { CELL_ASPECT, SCENE_COLS, SCENE_ROWS } from '@/domain/farm';
import { BLOCK_COLS, BLOCK_ROWS, RING } from '@/domain/farmWorld';

import type { ThemeArt } from './farmSprites';

/** The group farm's single open field. */
export function GroupBackground({ cell, art }: { cell: number; art: ThemeArt }) {
  return <Image source={art.groupScene} style={{ width: cell * SCENE_COLS, height: cell * CELL_ASPECT * SCENE_ROWS }} accessibilityIgnoresInvertColors />;
}

/** Kebunku's village map: the yard in the middle 2×2 blocks and a field block for each month around it. */
export function WorldBackground({ cell, art }: { cell: number; art: ThemeArt }) {
  const row = cell * CELL_ASPECT;
  const place = (bx: number, by: number, blocks: number) => [
    styles.tile,
    { left: bx * BLOCK_COLS * cell, top: by * BLOCK_ROWS * row, width: blocks * BLOCK_COLS * cell, height: blocks * BLOCK_ROWS * row },
  ];
  return (
    <>
      <Image source={art.world.yard} style={place(1, 1, 2)} />
      {RING.map(([bx, by], i) => (
        <Image key={i} source={art.world.fields[i % art.world.fields.length]} style={place(bx, by, 1)} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  tile: { position: 'absolute' },
});
