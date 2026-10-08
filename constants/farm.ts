import type { Palette } from './theme';

/**
 * Scene art tokens: colours the pixel-art world itself uses (the wooden gate signs, plant ramp
 * and band fills). The UI chrome — header, panels, sheets, buttons — no longer reads from here;
 * it follows the active app palette via `chromeOf`/`paperOf`, so the garden matches the theme.
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
 * The garden chrome, tinted from the active app palette so the panels, header and sheets sit on
 * the same colour family as the rest of the app instead of the fixed warm paper they used before.
 * `paper` is the panel surface, `sunk` a tile inside it, `edge` its hairline, and `ink`/`muted`
 * the type.
 */
export type FarmChrome = {
  paper: string;
  sunk: string;
  edge: string;
  ink: string;
  muted: string;
};

/** Solid surface per palette: a real card colour, never a translucent wash (the garden has no blur). */
export function chromeOf(c: Palette): FarmChrome {
  return { paper: c.card, sunk: c.muted, edge: c.border, ink: c.foreground, muted: c.mutedForeground };
}

/**
 * Solid paper surface. Replaces `frostOf` everywhere inside the garden: no blur, no white rim,
 * no tall shadow — those are what made the HUD read as an iOS overlay pasted onto the world.
 */
export function paperOf(c: Palette, tone: 'panel' | 'sunk' = 'panel') {
  const chrome = chromeOf(c);
  return {
    backgroundColor: tone === 'panel' ? chrome.paper : chrome.sunk,
    borderWidth: farmBorder,
    borderColor: chrome.edge,
    boxShadow: c.dark ? 'none' : `0px 1px 2px ${c.shadow}`,
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
 * Fill per band, but the "kosong" slot (and the ink that sits on it) follow the active palette,
 * so an unlogged cell reads as part of the current theme instead of a leftover warm beige. The
 * green ramp is the plant's own meaning and stays fixed across themes.
 */
export function bandFillOf(c: Palette): Record<DayBand, string> {
  const chrome = chromeOf(c);
  return { ...BAND_FILL, kosong: chrome.sunk };
}

export function bandInkOf(c: Palette): Record<DayBand, string> {
  const chrome = chromeOf(c);
  // Only "kosong" follows the palette: its fill is a themed surface, so its ink must match. The
  // greens keep the fixed dark ink — they are pale in every theme, including Malam.
  return { ...BAND_INK, kosong: chrome.muted };
}

/**
 * The user's app accent, for controls, focus and selection outlines only — never for recolouring
 * grass, plants or sprites. `onAccent` is text that survives on top of it.
 */
export function accentOf(c: Palette) {
  return { accent: c.primary, accentDeep: c.primaryDeep, onAccent: c.onPrimary } as const;
}
