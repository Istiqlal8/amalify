import { Image, StyleSheet } from 'react-native';

import { CELL_ASPECT, SCENE_COLS, SCENE_ROWS } from '@/domain/farm';
import { BLOCK_ROWS, HEADER_ROWS, MONTHS, TAIL_ROWS } from '@/domain/farmWorld';

import type { ThemeArt } from './farmSprites';

/** The group farm's single open field. */
export function GroupBackground({ cell, art }: { cell: number; art: ThemeArt }) {
  return <Image source={art.groupScene} style={{ width: cell * SCENE_COLS, height: cell * CELL_ASPECT * SCENE_ROWS }} accessibilityIgnoresInvertColors />;
}

/** Kebunku's tall map, stacked from tiles: houses, one fenced field per month, closing trees. */
export function WorldBackground({ cell, art }: { cell: number; art: ThemeArt }) {
  const row = cell * CELL_ASPECT;
  const width = cell * SCENE_COLS;
  const tile = (rows: number, at: number) => [styles.tile, { width, height: rows * row, top: at * row }];
  return (
    <>
      <Image source={art.world.top} style={tile(HEADER_ROWS, 0)} />
      {Array.from({ length: MONTHS }, (_, i) => (
        <Image key={i} source={art.world.month} style={tile(BLOCK_ROWS, HEADER_ROWS + i * BLOCK_ROWS)} />
      ))}
      <Image source={art.world.bottom} style={tile(TAIL_ROWS, HEADER_ROWS + MONTHS * BLOCK_ROWS)} />
    </>
  );
}

const styles = StyleSheet.create({
  tile: { position: 'absolute', left: 0 },
});
