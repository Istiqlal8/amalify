import type { ReactElement } from 'react';
import { Ellipse, G, Path } from 'react-native-svg';

import type { Palette } from '@/constants/theme';

/**
 * A grown plant (stages 3 and 4) on the 160×180 canvas. The pot's soil is at y≈116 and x 44..116.
 * `bloom` is false for stage 3 (buds) and true for stage 4 (in flower).
 */
export type SpeciesArt = (p: { bloom: boolean; c: Palette }) => ReactElement;

type LeafProps = { x: number; y: number; angle: number; len: number; w: number; fill: string; stroke?: string };

/** A pointed leaf whose base sits at (x, y), pointing `angle` degrees (0 = right, -90 = up). */
export function Leaf({ x, y, angle, len, w, fill, stroke }: LeafProps) {
  return (
    <Path
      d={`M0 0 Q${len / 2} ${-w} ${len} 0 Q${len / 2} ${w} 0 0 Z`}
      fill={fill}
      stroke={stroke}
      strokeWidth={stroke ? 1.2 : 0}
      transform={`translate(${x} ${y}) rotate(${angle})`}
    />
  );
}

export function Stem({ d, color, width = 3 }: { d: string; color: string; width?: number }) {
  return <Path d={d} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" />;
}

/** A closed bud: coloured tip held in green sepals. */
export function Bud({ x, y, r, color, c }: { x: number; y: number; r: number; color: string; c: Palette }) {
  return (
    <G>
      <Ellipse cx={x} cy={y - r * 0.3} rx={r * 0.6} ry={r} fill={color} />
      <Path d={`M${x - r * 0.7} ${y + r * 0.1} Q${x} ${y + r * 1.1} ${x + r * 0.7} ${y + r * 0.1} Q${x} ${y + r * 0.5} ${x - r * 0.7} ${y + r * 0.1} Z`} fill={c.leafDeep} />
    </G>
  );
}

/** Points on a quadratic curve, for placing blooms along an arching stem. */
export function alongQuad(p0: [number, number], p1: [number, number], p2: [number, number], ts: number[]): [number, number][] {
  return ts.map((t) => {
    const a = (1 - t) * (1 - t);
    const b = 2 * (1 - t) * t;
    const d = t * t;
    return [a * p0[0] + b * p1[0] + d * p2[0], a * p0[1] + b * p1[1] + d * p2[1]];
  });
}
