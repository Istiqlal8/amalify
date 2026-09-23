import { Ellipse, G } from 'react-native-svg';

import { FLOWER_ART } from '../flowers';

import { Bud, Leaf, Stem, type SpeciesArt } from './shared';

type Spot = [number, number, number];

const ROSE_LEAVES: Spot[] = [
  [66, 90, -150], [70, 80, -40], [60, 72, -160], [82, 94, -20], [80, 76, -150], [82, 64, -30],
  [94, 92, -30], [98, 84, -150], [104, 76, -20],
];
const ROSES: Spot[] = [
  [58, 64, 10],
  [80, 48, 11],
  [106, 66, 10],
];

/** A thorny bush of three canes carrying roses. */
export const mawar: SpeciesArt = ({ bloom, c }) => (
  <G>
    <Stem d="M80 116 Q70 92 58 68" color="#166534" />
    <Stem d="M80 116 Q83 88 80 54" color="#166534" />
    <Stem d="M80 116 Q94 94 106 70" color="#166534" />
    {ROSE_LEAVES.map(([x, y, a]) => (
      <Leaf key={`${x}-${y}`} x={x} y={y} angle={a} len={14} w={6} fill={c.leafDeep} stroke="#14532D" />
    ))}
    {ROSES.map(([x, y, r]) =>
      bloom ? <G key={x}>{FLOWER_ART.mawar(x, y, r, c.petal)}</G> : <Bud key={x} x={x} y={y + 2} r={5} color="#E11D48" c={c} />,
    )}
  </G>
);

/** Leaves laid over a dome, ring by ring, so the bush reads as dense. */
function domeLeaves(cx: number, cy: number, rings: [number, number][]): Spot[] {
  return rings.flatMap(([radius, count]) =>
    Array.from({ length: count }, (_, i) => {
      const a = Math.PI + (Math.PI * (i + 0.5)) / count;
      return [cx + Math.cos(a) * radius, cy + Math.sin(a) * radius * 0.9, (a * 180) / Math.PI] as Spot;
    }),
  );
}

const JASMINE_LEAVES = domeLeaves(80, 104, [[46, 11], [34, 9], [22, 6], [10, 3]]);
const JASMINE_FLOWERS: [number, number][] = [
  [52, 78], [66, 66], [82, 60], [98, 66], [110, 80], [60, 92], [76, 82], [92, 84], [104, 94],
];

/** A low, dense shrub of small leaves dotted with little white stars. */
export const melati: SpeciesArt = ({ bloom, c }) => (
  <G>
    {JASMINE_LEAVES.map(([x, y, a]) => (
      <Ellipse key={`${x}-${y}`} cx={x} cy={y} rx={8} ry={4.5} fill={c.leafDeep} stroke="#14532D" strokeWidth={0.8} transform={`rotate(${a} ${x} ${y})`} />
    ))}
    {JASMINE_FLOWERS.map(([x, y]) =>
      bloom ? <G key={x}>{FLOWER_ART.melati(x, y, 5.5, c.petal)}</G> : <Ellipse key={x} cx={x} cy={y} rx={2} ry={3.2} fill="#FFFFFF" />,
    )}
  </G>
);

const HIBISCUS_LEAVES = domeLeaves(80, 108, [[44, 9], [30, 7], [16, 4]]);
const HIBISCUS: Spot[] = [
  [56, 76, 11],
  [84, 62, 12],
  [108, 80, 11],
];

/** A glossy-leaved shrub bearing big red trumpet flowers. */
export const sepatu: SpeciesArt = ({ bloom, c }) => (
  <G>
    <Stem d="M80 116 Q72 100 62 90" color="#92400E" width={3.5} />
    <Stem d="M80 116 L82 92" color="#92400E" width={3.5} />
    <Stem d="M80 116 Q92 102 100 94" color="#92400E" width={3.5} />
    {HIBISCUS_LEAVES.map(([x, y, a]) => (
      <Leaf key={`${x}-${y}`} x={x - 8} y={y} angle={a + 180} len={20} w={9} fill="#15803D" stroke="#14532D" />
    ))}
    {HIBISCUS.map(([x, y, r]) =>
      bloom ? <G key={x}>{FLOWER_ART.sepatu(x, y, r, c.petal)}</G> : <Bud key={x} x={x} y={y + 2} r={6} color="#DC2626" c={c} />,
    )}
  </G>
);
