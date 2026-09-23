import { Circle, G, Path } from 'react-native-svg';

import { FLOWER_ART } from '../flowers';

import type { SpeciesArt } from './shared';

const BLOSSOMS: [number, number, number][] = [
  [80, 34, 7],
  [58, 58, 6],
  [102, 56, 6],
  [84, 70, 5],
  [46, 74, 4],
  [116, 76, 4],
];

/** Sakura: the round-crowned tree the app started with. */
export const sakura: SpeciesArt = ({ bloom, c }) => (
  <G>
    <Path d="M80 116 L80 70" stroke={c.trunk} strokeWidth={9} strokeLinecap="round" />
    <Path d="M80 86 L64 72 M80 80 L98 68" stroke={c.trunk} strokeWidth={4} strokeLinecap="round" />
    <Circle cx={80} cy={52} r={30} fill={c.leaf} />
    <Circle cx={56} cy={66} r={20} fill={c.leaf} />
    <Circle cx={104} cy={66} r={20} fill={c.leaf} />
    <Circle cx={70} cy={42} r={8} fill="#86EFAC" />
    {BLOSSOMS.map(([x, y, r]) =>
      bloom ? (
        <G key={`${x}-${y}`}>{FLOWER_ART.sakura(x, y, r, c.petal)}</G>
      ) : (
        <Circle key={`${x}-${y}`} cx={x} cy={y} r={r * 0.4} fill={c.petal} />
      ),
    )}
  </G>
);
