import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import type { FlowerId } from '@/domain/flowers';
import type { PlantStage } from '@/domain/plantStage';
import { useTheme } from '@/providers/ThemeProvider';

import { GROWS_IN_WATER, SPECIES } from './species';

// Drawn on a 160×180 canvas; the pot sits at the bottom, the plant grows up from y≈118.

function Pot({ water }: { water: boolean }) {
  const { colors } = useTheme();
  return (
    <G>
      <Path d="M44 124 H116 L106 172 Q80 178 54 172 Z" fill={colors.pot} />
      <Rect x={38} y={114} width={84} height={16} rx={8} fill={colors.potRim} />
      <Ellipse cx={80} cy={116} rx={36} ry={5} fill={water ? '#7DD3FC' : colors.soil} />
      <Circle cx={68} cy={146} r={3} fill={colors.foreground} />
      <Circle cx={92} cy={146} r={3} fill={colors.foreground} />
      <Path d="M74 153 Q80 159 86 153" stroke={colors.foreground} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <Ellipse cx={60} cy={152} rx={5} ry={3} fill={colors.secondary} />
      <Ellipse cx={100} cy={152} rx={5} ry={3} fill={colors.secondary} />
    </G>
  );
}

function Seed() {
  const { colors } = useTheme();
  return <Ellipse cx={80} cy={110} rx={7} ry={5} fill={colors.trunk} />;
}

function Leaf({ x, y, flip = false, size = 1 }: { x: number; y: number; flip?: boolean; size?: number }) {
  const { colors } = useTheme();
  const s = flip ? -size : size;
  return (
    <Path
      d="M0 0 Q12 -14 26 -6 Q14 4 0 0 Z"
      fill={colors.leaf}
      stroke={colors.leafDeep}
      strokeWidth={1.5}
      transform={`translate(${x} ${y}) scale(${s} ${size})`}
    />
  );
}

function Stem({ top }: { top: number }) {
  const { colors } = useTheme();
  return <Path d={`M80 116 Q78 ${(116 + top) / 2} 80 ${top}`} stroke={colors.leafDeep} strokeWidth={4} fill="none" strokeLinecap="round" />;
}

const SEEDLINGS: Record<0 | 1 | 2, () => React.ReactElement> = {
  0: Seed,
  1: () => (
    <G>
      <Stem top={96} />
      <Leaf x={80} y={98} size={0.8} />
      <Leaf x={80} y={98} flip size={0.8} />
    </G>
  ),
  2: () => (
    <G>
      <Stem top={66} />
      <Leaf x={80} y={100} />
      <Leaf x={80} y={88} flip />
      <Leaf x={80} y={76} />
      <Leaf x={80} y={68} flip size={0.8} />
    </G>
  ),
};

type Props = { stage: PlantStage; size: number; /** Overrides the chosen flower, e.g. for previews. */ flower?: FlowerId };

/** Stages 0–2 are the same seedling for every plant; from stage 3 each flower grows its own way. */
export function PlantArt({ stage, size, flower }: Props) {
  const { colors, flower: chosen } = useTheme();
  const kind = flower ?? chosen;
  const Grown = SPECIES[kind];
  const Seedling = stage < 3 ? SEEDLINGS[stage as 0 | 1 | 2] : null;
  return (
    <Svg width={size} height={(size * 180) / 160} viewBox="0 0 160 180">
      {Seedling ? <Seedling /> : <Grown bloom={stage === 4} c={colors} />}
      <Pot water={stage >= 3 && GROWS_IN_WATER.has(kind)} />
    </Svg>
  );
}
