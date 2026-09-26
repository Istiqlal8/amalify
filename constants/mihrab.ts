import type { Palette } from '@/constants/theme';

/**
 * "Lembar Mihrab": ruled sections and serif display type, starting on Beranda. Colours stay the
 * user's theme; this only names which theme colour plays which role in the new layout.
 */
export function inkOf(c: Palette) {
  return {
    ink: c.foreground,
    inkSoft: c.mutedForeground,
    rule: c.border,
    accent: c.primaryDeep,
    ground: c.card,
  } as const;
}

export const mihrabFonts = {
  display: 'Fraunces_600SemiBold',
  displayRegular: 'Fraunces_400Regular',
  displayItalic: 'Fraunces_400Regular_Italic',
  body: 'PlusJakartaSans_400Regular',
  bodyMedium: 'PlusJakartaSans_500Medium',
  bodyBold: 'PlusJakartaSans_700Bold',
} as const;
