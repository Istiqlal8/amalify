/** The Kaaba, Makkah. */
const KAABA = { lat: 21.4225, lng: 39.8262 };

/** Within this many degrees either side, the phone counts as facing the qibla. */
export const ALIGN_TOLERANCE = 5;

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** Degrees clockwise from true north, 0 ≤ result < 360. */
export function normalize(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

/**
 * Initial great-circle bearing from a point to the Kaaba. Used when the qibla API cannot be
 * reached; it is the same formula the API applies.
 */
export function qiblaBearing(lat: number, lng: number): number {
  const φ1 = rad(lat);
  const φ2 = rad(KAABA.lat);
  const Δλ = rad(KAABA.lng - lng);
  const y = Math.sin(Δλ);
  const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(Δλ);
  return normalize(deg(Math.atan2(y, x)));
}

/** How far to turn from `heading` to face `target`, from -180 (left) to 180 (right). */
export function turnTo(target: number, heading: number): number {
  const d = normalize(target - heading);
  return d > 180 ? d - 360 : d;
}

export function isAligned(target: number, heading: number): boolean {
  return Math.abs(turnTo(target, heading)) <= ALIGN_TOLERANCE;
}

const POINTS = ['U', 'TL', 'T', 'TG', 'S', 'BD', 'B', 'BL'];

/** Indonesian compass point for a bearing: U, TL, T, TG, S, BD, B, BL. */
export function compassPoint(bearing: number): string {
  return POINTS[Math.round(normalize(bearing) / 45) % 8];
}
