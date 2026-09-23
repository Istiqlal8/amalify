import { Circle, Ellipse, G, Line, Path } from 'react-native-svg';

import { FLOWER_ART } from '../flowers';

import { alongQuad, Bud, Leaf, Stem, type SpeciesArt } from './shared';

const ARCH: [[number, number], [number, number], [number, number]] = [[92, 112], [100, 26], [44, 36]];
const ORCHID_SPOTS = alongQuad(...ARCH, [0.42, 0.56, 0.7, 0.84, 0.97]);

/** Broad strap leaves at the base and one arching spray held up by a stake. */
export const anggrek: SpeciesArt = ({ bloom, c }) => (
  <G>
    <Line x1={96} y1={116} x2={96} y2={48} stroke="#A16207" strokeWidth={2.5} strokeLinecap="round" />
    <Stem d={`M${ARCH[0].join(' ')} Q${ARCH[1].join(' ')} ${ARCH[2].join(' ')}`} color={c.leafDeep} width={2.5} />
    <Leaf x={80} y={114} angle={-168} len={38} w={11} fill="#16A34A" stroke="#14532D" />
    <Leaf x={80} y={114} angle={-14} len={36} w={11} fill="#16A34A" stroke="#14532D" />
    <Leaf x={78} y={114} angle={-120} len={26} w={9} fill="#22C55E" stroke="#14532D" />
    {ORCHID_SPOTS.map(([x, y], i) =>
      bloom ? (
        <G key={i}>{FLOWER_ART.anggrek(x, y, 10, c.petal)}</G>
      ) : (
        <Circle key={i} cx={x} cy={y} r={2.5 + i * 0.4} fill={i > 2 ? '#86EFAC' : '#F0ABFC'} />
      ),
    )}
  </G>
);

/** Lotus: pads floating on the water in the pot, leaves raised on stalks and one tall flower. */
export const teratai: SpeciesArt = ({ bloom, c }) => (
  <G>
    <Stem d="M70 116 Q64 98 56 88" color={c.leafDeep} />
    <Stem d="M92 116 Q102 102 110 94" color={c.leafDeep} />
    <Ellipse cx={54} cy={86} rx={17} ry={6} fill={c.leaf} stroke={c.leafDeep} strokeWidth={1.2} />
    <Ellipse cx={112} cy={92} rx={15} ry={5.5} fill={c.leaf} stroke={c.leafDeep} strokeWidth={1.2} />
    <Path d="M54 86 L60 81" stroke={c.leafDeep} strokeWidth={1.5} />
    <Stem d="M80 116 Q83 84 80 58" color={c.leafDeep} width={3.5} />
    <Stem d="M86 116 Q95 94 96 76" color={c.leafDeep} width={2.5} />
    <Ellipse cx={64} cy={113} rx={14} ry={4} fill="#22C55E" />
    <Ellipse cx={98} cy={113} rx={12} ry={3.5} fill="#22C55E" />
    {bloom ? FLOWER_ART.teratai(80, 46, 17, c.petal) : <Bud x={80} y={52} r={8} color="#F9A8D4" c={c} />}
    <Bud x={96} y={72} r={5} color="#F9A8D4" c={c} />
  </G>
);
