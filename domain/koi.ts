/**
 * Koi swimming in a pond: a gentle figure-eight loop inside the pond, as fractions of its width and
 * height (0..1), plus the heading in degrees for rotating the fish. `phase` runs 0..1 per lap.
 */
const RX = 0.32;
const RY = 0.26;

export function koiAt(phase: number, index: number): { x: number; y: number; angle: number } {
  'worklet';
  const a = phase * Math.PI * 2 + index * 2.1;
  const b = 2 * a + index;
  const x = 0.5 + RX * Math.sin(a);
  const y = 0.5 + RY * Math.sin(b);
  const angle = (Math.atan2(2 * RY * Math.cos(b), RX * Math.cos(a)) * 180) / Math.PI;
  return { x, y, angle };
}
