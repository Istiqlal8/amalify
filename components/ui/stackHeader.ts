import { pastels } from '@/constants/pastel';
import { fonts, type Palette } from '@/constants/theme';

/** Header look shared by every pushed screen: lavender like the top of the backdrop, serif title. */
export function stackHeader(c: Palette) {
  return {
    headerStyle: { backgroundColor: pastels.lavender.tint },
    headerTintColor: c.primaryDeep,
    headerTitleStyle: { fontFamily: fonts.display, fontSize: 26 },
    headerShadowVisible: false,
  } as const;
}
