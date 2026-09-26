export type ThemeName = 'pink' | 'hijau' | 'biru';

export type Palette = {
  primary: string;
  primaryDeep: string;
  onPrimary: string;
  /** Secondary text on a primaryDeep surface. */
  onPrimarySoft: string;
  secondary: string;
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
    primary: '#EC4899',
    primaryDeep: '#BE185D',
    onPrimary: '#FFFFFF',
    onPrimarySoft: '#FCE7F3',
    secondary: '#F9A8D4',
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
    primary: '#10B981',
    primaryDeep: '#047857',
    onPrimary: '#FFFFFF',
    onPrimarySoft: '#D1FAE5',
    secondary: '#6EE7B7',
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
    primary: '#3B82F6',
    primaryDeep: '#1D4ED8',
    onPrimary: '#FFFFFF',
    onPrimarySoft: '#DBEAFE',
    secondary: '#93C5FD',
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
};

export const THEME_NAMES: { id: ThemeName; label: string }[] = [
  { id: 'pink', label: 'Pink' },
  { id: 'hijau', label: 'Hijau' },
  { id: 'biru', label: 'Biru' },
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

/** Translucent white surface with a white rim, for anything that sits on the pastel backdrop. */
export function frostOf(c: Palette) {
  return {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    boxShadow: `0px 6px 16px ${c.shadow}`,
  } as const;
}

// Frosted card: the frost surface with the large card radius.
export function clayOf(c: Palette) {
  return { ...frostOf(c), borderRadius: radius.lg } as const;
}

export const clay = clayOf(colors);
