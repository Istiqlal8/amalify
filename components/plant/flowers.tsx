import type { ReactElement } from 'react';
import { Circle, Ellipse, G, Line, Path } from 'react-native-svg';

import type { FlowerId } from '@/domain/flowers';

/** One flower centred on (x, y) with radius r; `theme` is the palette petal colour for sakura. */
type Draw = (x: number, y: number, r: number, theme: string) => ReactElement;

function ring(n: number, offset = 0): number[] {
  return Array.from({ length: n }, (_, i) => (i * 360) / n + offset);
}

function around(x: number, y: number, deg: number, d: number): { cx: number; cy: number } {
  const a = (deg * Math.PI) / 180;
  return { cx: x + Math.cos(a) * d, cy: y + Math.sin(a) * d };
}

const sakura: Draw = (x, y, r, theme) => (
  <G>
    {ring(5, -90).map((d) => <Circle key={d} {...around(x, y, d, r)} r={r * 0.75} fill={theme} />)}
    <Circle cx={x} cy={y} r={r * 0.55} fill="#FDE047" />
  </G>
);

const matahari: Draw = (x, y, r) => (
  <G>
    {ring(12).map((d) => (
      <Ellipse key={d} cx={x} cy={y - r * 0.95} rx={r * 0.28} ry={r * 0.62} fill="#FACC15" transform={`rotate(${d} ${x} ${y})`} />
    ))}
    <Circle cx={x} cy={y} r={r * 0.58} fill="#78350F" />
    <Circle cx={x - r * 0.15} cy={y - r * 0.15} r={r * 0.18} fill="#A16207" />
  </G>
);

const mawar: Draw = (x, y, r) => (
  <G>
    <Circle cx={x} cy={y} r={r * 1.05} fill="#E11D48" />
    <Circle cx={x} cy={y} r={r * 0.7} fill="#F43F5E" />
    <Path d={`M${x} ${y} m${-r * 0.35} 0 a${r * 0.35} ${r * 0.35} 0 1 1 ${r * 0.55} ${r * 0.2}`} stroke="#9F1239" strokeWidth={r * 0.14} fill="none" strokeLinecap="round" />
  </G>
);

const tulip: Draw = (x, y, r) => (
  <Path
    d={`M${x - r} ${y - r * 0.6} L${x - r * 0.45} ${y - r * 0.1} L${x} ${y - r * 0.8} L${x + r * 0.45} ${y - r * 0.1} L${x + r} ${y - r * 0.6} Q${x + r} ${y + r} ${x} ${y + r} Q${x - r} ${y + r} ${x - r} ${y - r * 0.6} Z`}
    fill="#F97316"
    stroke="#C2410C"
    strokeWidth={r * 0.1}
  />
);

const melati: Draw = (x, y, r) => (
  <G>
    {ring(5, -90).map((d) => (
      <Ellipse key={d} cx={x} cy={y - r * 0.7} rx={r * 0.38} ry={r * 0.75} fill="#FFFFFF" stroke="#94A3B8" strokeWidth={r * 0.09} transform={`rotate(${d + 90} ${x} ${y})`} />
    ))}
    <Circle cx={x} cy={y} r={r * 0.3} fill="#BEF264" />
  </G>
);

const daisy: Draw = (x, y, r) => (
  <G>
    {ring(10).map((d) => (
      <Ellipse key={d} cx={x} cy={y - r * 0.8} rx={r * 0.22} ry={r * 0.55} fill="#FFFFFF" stroke="#94A3B8" strokeWidth={r * 0.09} transform={`rotate(${d} ${x} ${y})`} />
    ))}
    <Circle cx={x} cy={y} r={r * 0.45} fill="#FACC15" />
  </G>
);

const lavender: Draw = (x, y, r) => (
  <G>
    <Line x1={x} y1={y + r} x2={x} y2={y - r * 1.2} stroke="#65A30D" strokeWidth={r * 0.15} />
    {[-1, -0.5, 0, 0.5, 1].map((t) => (
      <G key={t}>
        <Circle cx={x - r * 0.28} cy={y + t * r * 0.9} r={r * 0.3} fill="#A78BFA" />
        <Circle cx={x + r * 0.28} cy={y + t * r * 0.9 - r * 0.2} r={r * 0.3} fill="#8B5CF6" />
      </G>
    ))}
  </G>
);

const anggrek: Draw = (x, y, r) => (
  <G>
    {[-90, 30, 150].map((d) => <Ellipse key={d} {...around(x, y, d, r * 0.55)} rx={r * 0.5} ry={r * 0.5} fill="#E879F9" />)}
    {[-30, 210].map((d) => <Ellipse key={d} {...around(x, y, d, r * 0.6)} rx={r * 0.45} ry={r * 0.35} fill="#F0ABFC" />)}
    <Path d={`M${x - r * 0.35} ${y + r * 0.1} Q${x} ${y + r * 1.1} ${x + r * 0.35} ${y + r * 0.1} Z`} fill="#C026D3" />
    <Circle cx={x} cy={y} r={r * 0.18} fill="#FDE047" />
  </G>
);

const teratai: Draw = (x, y, r) => (
  <G>
    {[-60, -30, 0, 30, 60].map((d) => (
      <Path key={d} d={`M${x} ${y + r * 0.6} Q${x - r * 0.55} ${y - r * 0.2} ${x} ${y - r * 1.1} Q${x + r * 0.55} ${y - r * 0.2} ${x} ${y + r * 0.6} Z`} fill={d === 0 ? '#F472B6' : '#F9A8D4'} transform={`rotate(${d} ${x} ${y + r * 0.6})`} />
    ))}
    <Ellipse cx={x} cy={y + r * 0.6} rx={r * 0.9} ry={r * 0.22} fill="#16A34A" />
  </G>
);

const sepatu: Draw = (x, y, r) => (
  <G>
    {ring(5, -90).map((d) => <Circle key={d} {...around(x, y, d, r * 0.6)} r={r * 0.62} fill="#DC2626" />)}
    <Circle cx={x} cy={y} r={r * 0.28} fill="#7F1D1D" />
    <Line x1={x} y1={y} x2={x + r * 0.9} y2={y - r * 0.9} stroke="#FDE047" strokeWidth={r * 0.14} strokeLinecap="round" />
    <Circle cx={x + r * 0.95} cy={y - r * 0.95} r={r * 0.16} fill="#FDE047" />
  </G>
);

export const FLOWER_ART: Record<FlowerId, Draw> = {
  sakura, matahari, mawar, tulip, melati, daisy, lavender, anggrek, teratai, sepatu,
};
