import { fonts, type Palette } from '@/constants/theme';

/**
 * Header look shared by every pushed screen: lavender like the top of the backdrop, serif title.
 * Dark "Malam" palette: header blends into the dark background with a bold sans title.
 */
export function stackHeader(c: Palette) {
  if (c.dark) {
    return {
      headerStyle: { backgroundColor: c.background },
      headerTintColor: c.primary,
      headerTitleStyle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: c.foreground },
      headerShadowVisible: false,
    } as const;
  }
  return {
    headerStyle: { backgroundColor: c.wash },
    headerTintColor: c.primaryDeep,
    headerTitleStyle: { fontFamily: fonts.display, fontSize: 26 },
    headerShadowVisible: false,
  } as const;
}
