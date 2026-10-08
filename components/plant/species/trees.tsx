import { Circle, Ellipse, G, Path } from 'react-native-svg';

import { FLOWER_ART } from '../flowers';

import type { SpeciesArt } from './shared';

const BLOSSOMS: [number, number, number][] = [
  [80, 34, 7],
  [58, 58, 6],
  [102, 56, 6],
  [84, 70, 5],
  [46, 74, 4],
  [116, 76, 4],
  [68, 26, 4],
  [96, 40, 4],
];

/** Sakura: a broad, layered crown with a lit top, a shaded underside and a soft ground shadow. */
export const sakura: SpeciesArt = ({ bloom, c }) => (
  <G>
    <Ellipse cx={80} cy={118} rx={30} ry={7} fill="rgba(20,40,20,0.18)" />
    <Path d="M80 118 L80 68" stroke={c.trunk} strokeWidth={9} strokeLinecap="round" />
    <Path d="M80 88 L62 72" stroke={c.trunk} strokeWidth={5} strokeLinecap="round" />
    <Path d="M80 82 L100 68" stroke={c.trunk} strokeWidth={5} strokeLinecap="round" />
    {/* Shaded lower canopy, then the main crown, then a lit top cap: three tones give it depth. */}
    <Circle cx={52} cy={68} r={21} fill={c.leafDeep} />
    <Circle cx={108} cy={68} r={21} fill={c.leafDeep} />
    <Circle cx={80} cy={58} r={32} fill={c.leaf} />
    <Circle cx={56} cy={62} r={19} fill={c.leaf} />
    <Circle cx={104} cy={62} r={19} fill={c.leaf} />
    <Circle cx={70} cy={40} r={15} fill="#A7F3B0" opacity={0.75} />
    <Circle cx={92} cy={44} r={11} fill="#A7F3B0" opacity={0.6} />
    {BLOSSOMS.map(([x, y, r]) =>
      bloom ? (
        <G key={`${x}-${y}`}>{FLOWER_ART.sakura(x, y, r, c.petal)}</G>
      ) : (
        <Circle key={`${x}-${y}`} cx={x} cy={y} r={r * 0.4} fill={c.petal} />
      ),
    )}
  </G>
);
