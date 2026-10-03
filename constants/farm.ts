import type { Palette } from './theme';

/**
 * The garden's own design tokens. The world stays pixel art in its source palette; these values
 * are for the UI layer that sits over it — solid warm paper, crisp edges, short shadows — so the
 * chrome reads as one "garden device" instead of the app's frosted glass floating over a game.
 */
export const farm = {
  /** Panel surface and its border. */
  paper: '#F6F0E3',
  paperEdge: '#D7CCB7',
  /** A second, slightly darker paper for tiles inside a panel. */
  paperSunk: '#EFE7D6',
  ink: '#302C28',
  muted: '#746B60',
  /** Progress greens, low to full. */
  leafLight: '#8EAE68',
  foliage: '#426B46',
  soil: '#8A5A3B',
  wood: '#B7793E',
  woodEdge: '#7A4A22',
  water: '#477E91',
  bloom: '#D9749F',
  /** Today's marker and other "look here" accents. */
  sun: '#E7B64B',
  error: '#A84E43',
} as const;

export const farmRadius = { panel: 8, control: 6, chip: 6 } as const;

/** Panel border is always 1dp; elevation never goes past a 2dp shadow. */
export const farmBorder = 1;

/** Minimum touch target, and the calendar cell that has to beat it. */
export const touch = { min: 44, cell: { width: 40, height: 44 } } as const;

/**
 * Solid paper surface. Replaces `frostOf` everywhere inside the garden: no blur, no white rim,
 * no tall shadow — those are what made the HUD read as an iOS overlay pasted onto the world.
 */
export function paperOf(tone: 'panel' | 'sunk' = 'panel') {
  return {
    backgroundColor: tone === 'panel' ? farm.paper : farm.paperSunk,
    borderWidth: farmBorder,
    borderColor: farm.paperEdge,
    boxShadow: '0px 1px 2px rgba(48,44,40,0.14)',
  } as const;
}

/** Day buckets. Kept separate from colour so a glyph can carry the same meaning without it. */
export type DayBand = 'kosong' | 'rendah' | 'sedang' | 'tinggi' | 'penuh';

export function bandOf(percent: number): DayBand {
  if (percent >= 100) return 'penuh';
  if (percent >= 65) return 'tinggi';
  if (percent >= 35) return 'sedang';
  if (percent > 0) return 'rendah';
  return 'kosong';
}

/** Fill per band. Stepped, not a continuous HSL ramp, so neighbouring days stay tellable apart. */
export const BAND_FILL: Record<DayBand, string> = {
  kosong: farm.paperSunk,
  rendah: '#DCE6C4',
  sedang: '#B6CE93',
  tinggi: farm.leafLight,
  penuh: farm.foliage,
};

/** Text that stays legible on `BAND_FILL`. */
export const BAND_INK: Record<DayBand, string> = {
  kosong: farm.muted,
  rendah: farm.ink,
  sedang: farm.ink,
  tinggi: '#26331F',
  penuh: '#FFFFFF',
};

/**
 * The user's app accent, for controls, focus and selection outlines only — never for recolouring
 * grass, plants or sprites. `onAccent` is text that survives on top of it.
 */
export function accentOf(c: Palette) {
  return { accent: c.primary, accentDeep: c.primaryDeep, onAccent: c.onPrimary } as const;
}
