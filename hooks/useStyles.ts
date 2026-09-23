import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import type { Palette } from '@/constants/theme';
import { useTheme } from '@/providers/ThemeProvider';

/**
 * Builds a stylesheet from the active palette, rebuilt only when the theme changes.
 * Pair with `const makeStyles = (c: Palette) => StyleSheet.create({...})` at module level.
 */
export function useStyles<T extends StyleSheet.NamedStyles<T>>(make: (c: Palette) => T): T {
  const { colors } = useTheme();
  return useMemo(() => make(colors), [make, colors]);
}
