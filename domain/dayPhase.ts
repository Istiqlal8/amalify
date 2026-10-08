/**
 * The garden's sky, driven by the real clock so a walk at dusk looks like dusk. Phases are the
 * coarse buckets the UI names; the tint is a continuous blend so the change is never a hard cut.
 */
export type DayPhase = 'subuh' | 'pagi' | 'siang' | 'sore' | 'senja' | 'malam';

/** Overlay tint per phase: the colour washed over the scene, low alpha so the art stays readable. */
const TINT: Record<DayPhase, string> = {
  subuh: 'rgba(74,86,150,0.34)',
  pagi: 'rgba(255,214,150,0.10)',
  siang: 'rgba(0,0,0,0)',
  sore: 'rgba(255,170,90,0.16)',
  senja: 'rgba(150,86,150,0.28)',
  malam: 'rgba(22,30,78,0.5)',
};

/** How dark the scene is, 0 (noon) .. 1 (deep night); lets the lanterns fade in instead of popping. */
const DARKNESS: Record<DayPhase, number> = {
  subuh: 0.55,
  pagi: 0.12,
  siang: 0,
  sore: 0.2,
  senja: 0.55,
  malam: 0.95,
};

/** Hour (0..24) at which each phase begins, in order. */
const STARTS: { phase: DayPhase; hour: number }[] = [
  { phase: 'subuh', hour: 4 },
  { phase: 'pagi', hour: 6 },
  { phase: 'siang', hour: 11 },
  { phase: 'sore', hour: 15 },
  { phase: 'senja', hour: 17.5 },
  { phase: 'malam', hour: 19 },
];

export function phaseAt(hour: number): DayPhase {
  const h = ((hour % 24) + 24) % 24;
  let current: DayPhase = 'malam';
  for (const { phase, hour: start } of STARTS) {
    if (h >= start) current = phase;
  }
  // Before the first phase start (00:00–04:00) it is still night.
  return current;
}

export function tintOf(phase: DayPhase): string {
  return TINT[phase];
}

export function darknessOf(phase: DayPhase): number {
  return DARKNESS[phase];
}

/** A short human label for the phase, e.g. for accessibility. */
export const PHASE_LABEL: Record<DayPhase, string> = {
  subuh: 'subuh',
  pagi: 'pagi',
  siang: 'siang',
  sore: 'sore',
  senja: 'senja',
  malam: 'malam',
};

/** True while the sky is dark enough that lanterns and house light should show. */
export function isDark(phase: DayPhase): boolean {
  return darknessOf(phase) >= 0.5;
}

/**
 * Current local hour as a decimal (13:30 -> 13.5). Reads the device clock; `at` lets tests pin it.
 */
export function hourNow(at: Date = new Date()): number {
  return at.getHours() + at.getMinutes() / 60;
}
