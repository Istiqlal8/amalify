export type ThemeName = 'pink' | 'hijau' | 'biru' | 'putih' | 'malam';

export type Palette = {
  /** True for the dark "Malam" palette used by laki-laki; shared primitives switch surface and type on it. */
  dark: boolean;
  primary: string;
  primaryDeep: string;
  onPrimary: string;
  /** Secondary text on a primaryDeep surface. */
  onPrimarySoft: string;
  secondary: string;
  /** Pale top of the screen backdrop and the stack header. */
  wash: string;
  background: string;
  foreground: string;
  card: string;
  muted: string;
  mutedForeground: string;
  border: string;
  destructive: string;
  /** Colour of the soft clay shadow, as an rgba with alpha. */
  shadow: string;
  leaf: string;
  leafDeep: string;
  trunk: string;
  soil: string;
  pot: string;
  potRim: string;
  petal: string;
  petalCenter: string;
};

const plant = { leaf: '#4ADE80', leafDeep: '#16A34A', trunk: '#B45309', soil: '#92400E', petalCenter: '#FDE047' };

export const palettes: Record<ThemeName, Palette> = {
  pink: {
    ...plant,
    dark: false,
    primary: '#EC4899',
    primaryDeep: '#BE185D',
    onPrimary: '#FFFFFF',
    onPrimarySoft: '#FCE7F3',
    secondary: '#F9A8D4',
    wash: '#EAE2FF',
    background: '#FDF2F8',
    foreground: '#831843',
    card: '#FFFFFF',
    muted: '#FCE7F3',
    mutedForeground: '#9D5C7D',
    border: '#FBCFE8',
    destructive: '#DC2626',
    shadow: 'rgba(190, 24, 93, 0.12)',
    pot: '#F472B6',
    potRim: '#DB2777',
    petal: '#F9A8D4',
  },
  hijau: {
    ...plant,
    dark: false,
    primary: '#10B981',
    primaryDeep: '#047857',
    onPrimary: '#FFFFFF',
    onPrimarySoft: '#D1FAE5',
    secondary: '#6EE7B7',
    wash: '#EAE2FF',
    background: '#ECFDF5',
    foreground: '#064E3B',
    card: '#FFFFFF',
    muted: '#D1FAE5',
    mutedForeground: '#3F7A63',
    border: '#A7F3D0',
    destructive: '#DC2626',
    shadow: 'rgba(4, 120, 87, 0.12)',
    // A warm pot so it does not melt into the green canopy.
    pot: '#FCD9A8',
    potRim: '#F59E0B',
    petal: '#FBCFE8',
  },
  biru: {
    ...plant,
    dark: false,
    primary: '#3B82F6',
    primaryDeep: '#1D4ED8',
    onPrimary: '#FFFFFF',
    onPrimarySoft: '#DBEAFE',
    secondary: '#93C5FD',
    wash: '#EAE2FF',
    background: '#EFF6FF',
    foreground: '#1E3A8A',
    card: '#FFFFFF',
    muted: '#DBEAFE',
    mutedForeground: '#4A6394',
    border: '#BFDBFE',
    destructive: '#DC2626',
    shadow: 'rgba(29, 78, 216, 0.12)',
    pot: '#93C5FD',
    potRim: '#2563EB',
    petal: '#BFDBFE',
  },
  // Clean white with slate accents; buttons stay dark enough for white text.
  putih: {
    ...plant,
    dark: false,
    primary: '#475569',
    primaryDeep: '#1E293B',
    onPrimary: '#FFFFFF',
    onPrimarySoft: '#E2E8F0',
    secondary: '#CBD5E1',
    wash: '#F8FAFC',
    background: '#FFFFFF',
    foreground: '#0F172A',
    card: '#FFFFFF',
    muted: '#F1F5F9',
    mutedForeground: '#64748B',
    border: '#E2E8F0',
    destructive: '#DC2626',
    shadow: 'rgba(15, 23, 42, 0.08)',
    pot: '#E2E8F0',
    potRim: '#94A3B8',
    petal: '#F1F5F9',
  },
  // "Malam": always used for laki-laki, never offered in the picker. Matches constants/male.ts.
  malam: {
    ...plant,
    dark: true,
    primary: '#F5B23D',
    primaryDeep: '#F5B23D',
    onPrimary: '#1A1204',
    onPrimarySoft: '#3D2A08',
    secondary: '#3A4A6B',
    wash: '#0B1220',
    background: '#0B1220',
    foreground: '#E8EEF8',
    card: '#121B2E',
    muted: '#18233A',
    mutedForeground: '#8A9BB8',
    border: '#24314D',
    destructive: '#F87171',
    shadow: 'rgba(0, 0, 0, 0.4)',
    pot: '#24314D',
    potRim: '#F5B23D',
    petal: '#3A4A6B',
  },
};

/** Themes offered in the colour picker (perempuan only). */
export const THEME_NAMES: { id: ThemeName; label: string }[] = [
  { id: 'pink', label: 'Pink' },
  { id: 'hijau', label: 'Hijau' },
  { id: 'biru', label: 'Biru' },
  { id: 'putih', label: 'Putih' },
];

/** Pink default; screens not yet reading `useTheme()` fall back to it. */
export const colors = palettes.pink;

export const radius = { sm: 12, md: 18, lg: 24, pill: 999 } as const;

export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const fonts = {
  display: 'InstrumentSerif_400Regular',
  body: 'Nunito_400Regular',
  bodyBold: 'Nunito_700Bold',
  arabic: 'Amiri_400Regular',
} as const;

/**
 * See-through white pane with a bright rim, for anything that sits on the pastel backdrop: the
 * backdrop's colour blobs show through it, so it reads as glass.
 */
export function frostOf(c: Palette) {
  // Dark palette: flat solid panel with a hairline, no glass.
  if (c.dark) {
    return { backgroundColor: c.card, borderWidth: 1, borderColor: c.border, boxShadow: 'none' } as const;
  }
  return {
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.9)',
    boxShadow: `0px 6px 16px ${c.shadow}`,
  } as const;
}

// Frosted card: the frost surface with the large card radius (tight corners on the dark palette).
export function clayOf(c: Palette) {
  return { ...frostOf(c), borderRadius: c.dark ? 10 : radius.lg } as const;
}

export const clay = clayOf(colors);
