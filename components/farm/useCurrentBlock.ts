import { useState } from 'react';
import { type SharedValue, useAnimatedReaction } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import type { Point } from '@/domain/farm';
import { blockAt, GRID as BLOCKS } from '@/domain/farmWorld';

/** The map block the character is in, updated on the JS side only when it changes. */
export function useCurrentBlock(pos: SharedValue<Point>, blockRows = BLOCKS): { bx: number; by: number } {
  const [block, setBlock] = useState({ bx: 1, by: 1 });
  useAnimatedReaction(
    () => {
      const b = blockAt(pos.value, blockRows);
      return b.by * BLOCKS + b.bx;
    },
    (key, prev) => {
      if (key !== prev) scheduleOnRN(setBlock, { bx: key % BLOCKS, by: Math.floor(key / BLOCKS) });
    },
  );
  return block;
}
