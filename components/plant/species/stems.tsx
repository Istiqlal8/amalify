import { Circle, Ellipse, G, Path } from 'react-native-svg';

import { FLOWER_ART } from '../flowers';

import { Leaf, Stem, type SpeciesArt } from './shared';

/** One tall stalk with heart-shaped leaves and a big head, plus a smaller side head. */
export const matahari: SpeciesArt = ({ bloom, c }) => (
  <G>
    <Stem d="M80 116 C77 92 84 64 80 36" color={c.leafDeep} width={5} />
    <Stem d="M81 72 Q98 66 106 54" color={c.leafDeep} width={3} />
    <Leaf x={80} y={100} angle={-160} len={32} w={15} fill={c.leaf} stroke={c.leafDeep} />
    <Leaf x={81} y={88} angle={-22} len={34} w={16} fill={c.leaf} stroke={c.leafDeep} />
    <Leaf x={80} y={64} angle={-150} len={26} w={12} fill={c.leaf} stroke={c.leafDeep} />
    {bloom ? (
      <>
        {FLOWER_ART.matahari(80, 32, 21, c.petal)}
        {FLOWER_ART.matahari(107, 50, 10, c.petal)}
      </>
    ) : (
      <>
        <Circle cx={80} cy={34} r={10} fill={c.leafDeep} />
        <Circle cx={107} cy={51} r={5} fill={c.leafDeep} />
      </>
    )}
  </G>
);

const TULIPS: { stem: string; head: [number, number, number] }[] = [
  { stem: 'M66 116 Q62 84 62 54', head: [62, 50, 9] },
  { stem: 'M80 116 Q81 78 80 40', head: [80, 36, 10] },
  { stem: 'M94 116 Q98 88 100 60', head: [100, 56, 9] },
];

/** Straight stalks rising out of long, arching blade leaves. */
export const tulip: SpeciesArt = ({ bloom, c }) => (
  <G>
    {TULIPS.map((t) => <Stem key={t.stem} d={t.stem} color={c.leafDeep} />)}
    <Path d="M72 116 Q50 92 56 62 Q66 92 80 116 Z" fill={c.leaf} stroke={c.leafDeep} strokeWidth={1.2} />
    <Path d="M86 116 Q112 94 106 66 Q96 94 78 116 Z" fill={c.leaf} stroke={c.leafDeep} strokeWidth={1.2} />
    <Path d="M78 116 Q86 94 84 78 Q76 96 74 116 Z" fill={c.leaf} stroke={c.leafDeep} strokeWidth={1.2} />
    {TULIPS.map(({ head: [x, y, r] }) =>
      bloom ? (
        <G key={x}>{FLOWER_ART.tulip(x, y, r, c.petal)}</G>
      ) : (
        <Ellipse key={x} cx={x} cy={y} rx={r * 0.45} ry={r * 0.8} fill="#86EFAC" stroke={c.leafDeep} strokeWidth={1} />
      ),
    )}
  </G>
);

const DAISY_TIPS: [number, number][] = [
  [46, 66], [58, 50], [72, 40], [88, 38], [102, 46], [114, 58], [122, 76],
];

/** A clump of thin stems fanning out, each ending in a daisy. */
export const daisy: SpeciesArt = ({ bloom, c }) => (
  <G>
    {DAISY_TIPS.map(([x, y]) => (
      <Stem key={x} d={`M80 116 Q${(80 + x) / 2} ${(116 + y) / 2 + 10} ${x} ${y}`} color={c.leafDeep} width={2} />
    ))}
    {[-165, -135, -45, -15].map((a) => (
      <Leaf key={a} x={80} y={114} angle={a} len={20} w={6} fill={c.leaf} stroke={c.leafDeep} />
    ))}
    {DAISY_TIPS.map(([x, y]) =>
      bloom ? <G key={x}>{FLOWER_ART.daisy(x, y, 9.5, c.petal)}</G> : <Circle key={x} cx={x} cy={y} r={3.5} fill={c.leaf} />,
    )}
  </G>
);

const LAVENDER_TIPS: [number, number][] = [
  [44, 56], [54, 42], [64, 32], [74, 26], [86, 26], [96, 32], [106, 40], [116, 52],
];

/** Many slim stalks, each topped with a spike of tiny buds that turn purple in flower. */
export const lavender: SpeciesArt = ({ bloom, c }) => (
  <G>
    {LAVENDER_TIPS.map(([x, y]) => <Stem key={x} d={`M80 116 L${x} ${y}`} color="#6B8F71" width={2} />)}
    {[-170, -150, -130, -50, -30, -10].map((a) => (
      <Leaf key={a} x={80} y={114} angle={a} len={24} w={3.5} fill="#8FB996" />
    ))}
    {LAVENDER_TIPS.map(([x, y]) => {
      const dx = (x - 80) / Math.hypot(x - 80, y - 116);
      const dy = (y - 116) / Math.hypot(x - 80, y - 116);
      return (
        <G key={x}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Ellipse
              key={i}
              cx={x - dx * i * 3.4 + (i % 2 ? 1.6 : -1.6)}
              cy={y - dy * i * 3.4}
              rx={2.6}
              ry={2.2}
              fill={bloom ? (i % 2 ? '#8B5CF6' : '#A78BFA') : '#9CCFA4'}
            />
          ))}
        </G>
      );
    })}
  </G>
);
