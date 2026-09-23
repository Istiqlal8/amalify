import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { useTheme } from '@/providers/ThemeProvider';
import type { PlantStage } from '@/domain/plantStage';

// Drawn on a 160×180 canvas; the pot sits at the bottom, the plant grows up from y≈118.

function Pot() {
  const { colors } = useTheme();
  return (
    <G>
      <Path d="M44 124 H116 L106 172 Q80 178 54 172 Z" fill={colors.pot} />
      <Rect x={38} y={114} width={84} height={16} rx={8} fill={colors.potRim} />
      <Ellipse cx={80} cy={116} rx={36} ry={5} fill={colors.soil} />
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

function Flower({ x, y, r = 7 }: { x: number; y: number; r?: number }) {
  const { colors } = useTheme();
  const petals = [0, 72, 144, 216, 288].map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return <Circle key={deg} cx={x + Math.cos(rad) * r} cy={y + Math.sin(rad) * r} r={r * 0.75} fill={colors.petal} />;
  });
  return (
    <G>
      {petals}
      <Circle cx={x} cy={y} r={r * 0.55} fill={colors.petalCenter} />
    </G>
  );
}

function Stem({ top }: { top: number }) {
  const { colors } = useTheme();
  return <Path d={`M80 116 Q78 ${(116 + top) / 2} 80 ${top}`} stroke={colors.leafDeep} strokeWidth={4} fill="none" strokeLinecap="round" />;
}

function Canopy() {
  const { colors } = useTheme();
  return (
    <G>
      <Path d="M80 116 L80 70" stroke={colors.trunk} strokeWidth={9} strokeLinecap="round" />
      <Circle cx={80} cy={52} r={30} fill={colors.leaf} />
      <Circle cx={56} cy={66} r={20} fill={colors.leaf} />
      <Circle cx={104} cy={66} r={20} fill={colors.leaf} />
      <Circle cx={70} cy={42} r={8} fill="#86EFAC" />
    </G>
  );
}

const STAGES: Record<PlantStage, () => React.ReactElement> = {
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
  3: () => <Canopy />,
  4: () => (
    <G>
      <Canopy />
      <Flower x={80} y={34} />
      <Flower x={58} y={58} r={6} />
      <Flower x={102} y={56} r={6} />
      <Flower x={84} y={70} r={5} />
      <Flower x={46} y={74} r={4} />
      <Flower x={116} y={76} r={4} />
    </G>
  ),
};

export function PlantArt({ stage, size }: { stage: PlantStage; size: number }) {
  const Growth = STAGES[stage];
  return (
    <Svg width={size} height={(size * 180) / 160} viewBox="0 0 160 180">
      <Growth />
      <Pot />
    </Svg>
  );
}
