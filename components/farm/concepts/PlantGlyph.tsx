import { View } from 'react-native';
import Svg, { Circle, Ellipse, Line, Path } from 'react-native-svg';

import { farm } from '@/constants/farm';
import type { PlantStage } from '@/domain/plantStage';

type Props = {
  stage: PlantStage;
  size?: number;
  /** Petal colour; defaults to the garden bloom pink. */
  petal?: string;
  trunk?: string;
  leaf?: string;
};

/**
 * Vector plant for the new garden concepts: seed → shoot → sprout → young plant → bloom.
 * Drawn on a paper-friendly canvas, not pixel art — each stage is a calm specimen, not a game sprite.
 */
export function PlantGlyph({ stage, size = 64, petal = farm.bloom, trunk = farm.soil, leaf = farm.foliage }: Props) {
  const h = size;
  const w = size;
  return (
    <View style={{ width: w, height: h }} accessibilityLabel={`Tahap tanaman ${stage}`}>
      <Svg width={w} height={h} viewBox="0 0 64 64">
        {/* soil mound always present */}
        <Ellipse cx="32" cy="54" rx="16" ry="5" fill={farm.soil} opacity={0.35} />
        {stage === 0 && (
          <>
            <Circle cx="32" cy="48" r="4" fill={trunk} />
            <Path d="M30 48 Q32 42 34 48" stroke={leaf} strokeWidth="1.5" fill="none" opacity={0.5} />
          </>
        )}
        {stage >= 1 && (
          <Line x1="32" y1="52" x2="32" y2={stage >= 3 ? 28 : 36} stroke={trunk} strokeWidth="2.5" strokeLinecap="round" />
        )}
        {stage === 1 && (
          <>
            <Ellipse cx="27" cy="38" rx="5" ry="3" fill={leaf} transform="rotate(-30 27 38)" />
            <Ellipse cx="37" cy="36" rx="5" ry="3" fill={leaf} transform="rotate(30 37 36)" />
          </>
        )}
        {stage === 2 && (
          <>
            <Ellipse cx="25" cy="34" rx="7" ry="4" fill={leaf} transform="rotate(-35 25 34)" />
            <Ellipse cx="39" cy="32" rx="7" ry="4" fill={leaf} transform="rotate(35 39 32)" />
            <Ellipse cx="32" cy="26" rx="5" ry="3.5" fill={leaf} />
          </>
        )}
        {stage === 3 && (
          <>
            <Ellipse cx="22" cy="36" rx="8" ry="4.5" fill={leaf} transform="rotate(-40 22 36)" />
            <Ellipse cx="42" cy="34" rx="8" ry="4.5" fill={leaf} transform="rotate(40 42 34)" />
            <Ellipse cx="32" cy="24" rx="10" ry="6" fill={leaf} />
            <Circle cx="32" cy="20" r="3" fill={petal} opacity={0.85} />
          </>
        )}
        {stage === 4 && (
          <>
            <Ellipse cx="20" cy="38" rx="9" ry="5" fill={leaf} transform="rotate(-40 20 38)" />
            <Ellipse cx="44" cy="36" rx="9" ry="5" fill={leaf} transform="rotate(40 44 36)" />
            <Ellipse cx="32" cy="22" rx="12" ry="7" fill={leaf} />
            <Circle cx="26" cy="18" r="4" fill={petal} />
            <Circle cx="38" cy="16" r="4.5" fill={petal} />
            <Circle cx="32" cy="22" r="3.5" fill={farm.sun} />
            <Circle cx="26" cy="18" r="1.5" fill={farm.sun} />
            <Circle cx="38" cy="16" r="1.5" fill={farm.sun} />
          </>
        )}
      </Svg>
    </View>
  );
}
